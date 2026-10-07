// Existing fund identifiers and labels used by the insurance-period form.
export const CONTRIBUTION_FUND_OPTIONS = [
  { value: 'oaee', label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας' },
  { value: 'etaa', label: 'Πρώην ΕΤΑΑ' },
  { value: 'tsmede', label: 'ΤΣΜΕΔΕ' },
  { value: 'tsay', label: 'ΤΣΑΥ — Ελεύθερος επαγγελματίας' },
  { value: 'oga', label: 'Πρώην ΟΓΑ / αγρότης' },
];

export const AVERAGE_SALARY_FAILURE_MESSAGE = 'Δεν ήταν δυνατός ο υπολογισμός αυτή τη στιγμή. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.';
export const AVERAGE_SALARY_YEARS = [2025, 2026];
export const DEFAULT_PENSION_YEAR = 2026;
export const DRAFT_STORAGE_KEY = 'geodora_average_salary_draft_v1';

export const createDefaultRows = () => Array.from(
  { length: DEFAULT_PENSION_YEAR - 2001 },
  (_, index) => ({ year: 2002 + index, amount: '0', days: '300' }),
);

export function loadAverageSalaryDraft(storage) {
  const defaults = { rows: createDefaultRows(), inputType: 'salaried', fund: '', pensionYear: DEFAULT_PENSION_YEAR };
  try {
    const draft = JSON.parse(storage?.getItem(DRAFT_STORAGE_KEY));
    if (!draft || !['salaried', 'non-salaried-income', 'non-salaried-contributions'].includes(draft.inputType)
      || (draft.fund !== '' && !CONTRIBUTION_FUND_OPTIONS.some(({ value }) => value === draft.fund))
      || !Array.isArray(draft.rows)
      || !draft.rows.every(row => row && Number.isInteger(row.year) && row.year >= 2002
        && typeof row.amount === 'string' && typeof row.days === 'string')) return defaults;
    // Keep all stored rows, including hidden years, when changing the selected year.
    const rows = new Map(defaults.rows.map(row => [row.year, row]));
    draft.rows.forEach(row => rows.set(row.year, row));
    return { rows: [...rows.values()].sort((a, b) => a.year - b.year), inputType: draft.inputType, fund: draft.fund,
      pensionYear: AVERAGE_SALARY_YEARS.includes(draft.pensionYear) ? draft.pensionYear : DEFAULT_PENSION_YEAR };
  } catch { return defaults; }
}

export function saveAverageSalaryDraft(storage, draft) {
  try { storage?.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft)); } catch { /* Storage is optional. */ }
}

export const getVisibleSalaryRows = (rows, pensionYear) => rows.filter(row => row.year >= 2002 && row.year <= pensionYear);

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

export function prepareAverageSalaryInput({ inputType, fund, rows, pensionYear = DEFAULT_PENSION_YEAR }) {
  if (!AVERAGE_SALARY_YEARS.includes(pensionYear)) return { ok: false, yearError: 'Επιλέξτε έτος συνταξιοδότησης 2025 ή 2026.' };
  const amountField = {
    salaried: 'annualEarnings',
    'non-salaried-income': 'annualPensionableEarnings',
    'non-salaried-contributions': 'annualPensionContribution',
  }[inputType];
  if (!amountField) return { ok: false };

  const fundError = inputType === 'non-salaried-contributions'
    && !CONTRIBUTION_FUND_OPTIONS.some(({ value }) => value === fund)
    ? 'Επιλέξτε κατηγορία / πρώην ασφαλιστικό φορέα.' : '';
  const visibleRows = getVisibleSalaryRows(rows, pensionYear);
  const invalidRow = visibleRows.find(({ amount, days }) => (
    parseAmount(amount) === null || getInsuranceDaysError(amount, days)
  ));
  if (fundError || invalidRow) return { ok: false, fundError, invalidRow };

  const yearsData = visibleRows.filter(({ amount }) => parseAmount(amount) > 0)
    .map(({ year, amount, days }) => ({
      year,
      [amountField]: parseAmount(amount),
      insuranceDays: parseInsuranceDays(days),
    }));
  return {
    ok: yearsData.length > 0,
    input: { inputType, pensionYear, ...(inputType === 'non-salaried-contributions' ? { fund } : {}), yearsData },
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
