// Existing fund identifiers and labels used by the insurance-period form.
export const CONTRIBUTION_FUND_OPTIONS = [
  { value: 'oaee', label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας' },
  { value: 'etaa', label: 'Πρώην ΕΤΑΑ' },
  { value: 'tsmede', label: 'ΤΣΜΕΔΕ' },
  { value: 'tsay', label: 'ΤΣΑΥ — Ελεύθερος επαγγελματίας' },
  { value: 'oga', label: 'Πρώην ΟΓΑ / αγρότης' },
];

export const AVERAGE_SALARY_FAILURE_MESSAGE = 'Δεν ήταν δυνατός ο υπολογισμός αυτή τη στιγμή. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.';

export function parseAmount(value) {
  const trimmed = String(value ?? '').trim();
  if (trimmed === '') return 0;
  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed)) return null;
  const amount = Number(trimmed.replace(',', '.'));
  return Number.isFinite(amount) ? amount : null;
}

export function parseInsuranceDays(value) {
  const trimmed = String(value ?? '').trim();
  if (trimmed === '') return 0;
  if (!/^\d+$/.test(trimmed)) return null;
  const days = Number(trimmed);
  return Number.isInteger(days) && days <= 300 ? days : null;
}

export function getInsuranceDaysError(amount, days) {
  const parsedDays = parseInsuranceDays(days);
  if (parsedDays === null) return 'Οι ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός από 0 έως 300.';
  if (parseAmount(amount) > 0 && parsedDays === 0) {
    return 'Για έτος με ποσό μεγαλύτερο από 0, οι ημέρες ασφάλισης πρέπει να είναι από 1 έως 300.';
  }
  return '';
}

export function prepareAverageSalaryInput({ inputType, fund, rows }) {
  const amountField = {
    salaried: 'annualEarnings',
    'non-salaried-income': 'annualPensionableEarnings',
    'non-salaried-contributions': 'annualPensionContribution',
  }[inputType];
  if (!amountField) return { ok: false };

  const fundError = inputType === 'non-salaried-contributions'
    && !CONTRIBUTION_FUND_OPTIONS.some(({ value }) => value === fund)
    ? 'Επιλέξτε κατηγορία / πρώην ασφαλιστικό φορέα.' : '';
  const invalidRow = rows.find(({ amount, days }) => (
    parseAmount(amount) === null || getInsuranceDaysError(amount, days)
  ));
  if (fundError || invalidRow) return { ok: false, fundError, invalidRow };

  const yearsData = rows.filter(({ amount }) => parseAmount(amount) > 0)
    .map(({ year, amount, days }) => ({
      year,
      [amountField]: parseAmount(amount),
      insuranceDays: parseInsuranceDays(days),
    }));
  return {
    ok: yearsData.length > 0,
    input: { inputType, ...(inputType === 'non-salaried-contributions' ? { fund } : {}), yearsData },
  };
}

export function resolveAverageSalaryUrl(env = import.meta.env || {}) {
  const explicitUrl = String(env.VITE_AVERAGE_SALARY_ENGINE_URL || '').trim();
  if (explicitUrl) return explicitUrl;
  const pensionUrl = String(env.VITE_PENSION_ENGINE_URL || '').trim();
  return /\/calculatePensionFromInputPackage\/?$/.test(pensionUrl)
    ? pensionUrl.replace(/\/calculatePensionFromInputPackage\/?$/, '/calculateAverageSalary') : '';
}

export async function calculateAveragePensionableEarnings(form, {
  signal, url = resolveAverageSalaryUrl(), fetchImpl = fetch,
} = {}) {
  const preparation = prepareAverageSalaryInput(form);
  if (!preparation.ok) return preparation;
  if (!url) throw new Error(AVERAGE_SALARY_FAILURE_MESSAGE);
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preparation.input),
    signal,
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true || result.status !== 'calculated'
    || !Number.isFinite(result.averageMonthlyPensionableEarnings)
    || result.averageMonthlyPensionableEarnings <= 0) {
    throw new Error(AVERAGE_SALARY_FAILURE_MESSAGE);
  }
  return { ok: true, monthlyAmount: result.averageMonthlyPensionableEarnings };
}
