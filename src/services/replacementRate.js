export const REPLACEMENT_RATE_FAILURE_MESSAGE = 'Δεν ήταν δυνατός ο υπολογισμός αυτή τη στιγμή. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.';

export function prepareReplacementRateInput({ mode, values }) {
  if (!['days', 'duration'].includes(mode)) return { ok: false, errors: { mode: 'Επιλέξτε τρόπο εισαγωγής.' } };
  const fields = mode === 'days' ? ['totalDays'] : ['years', 'months', 'days'];
  const errors = {}, parsed = {};
  for (const field of fields) {
    const text = String(values[field] ?? '').trim();
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text))) {
      errors[field] = 'Συμπληρώστε μη αρνητικό ακέραιο αριθμό.';
    } else parsed[field] = Number(text);
  }
  if (mode === 'duration') {
    if (parsed.months > 11) errors.months = 'Οι μήνες πρέπει να είναι από 0 έως 11.';
    if (parsed.days > 24) errors.days = 'Οι ημέρες πρέπει να είναι από 0 έως 24.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  // Send the selected representation unchanged; all conversion happens in the engine.
  return { ok: true, input: mode === 'days'
    ? { insuranceTimeInputMethod: 'insurance_days', totalInsuranceDays: parsed.totalDays }
    : { insuranceTimeInputMethod: 'years_months_days', totalInsuranceYears: parsed.years,
      totalInsuranceMonths: parsed.months, totalInsuranceDays: parsed.days } };
}

export function resolveReplacementRateUrl(env = import.meta.env || {}) {
  const explicitUrl = String(env.VITE_REPLACEMENT_RATE_ENGINE_URL || '').trim();
  if (explicitUrl) return explicitUrl;
  const pensionUrl = String(env.VITE_PENSION_ENGINE_URL || '').trim();
  return /\/calculatePensionFromInputPackage\/?$/.test(pensionUrl)
    ? pensionUrl.replace(/\/calculatePensionFromInputPackage\/?$/, '/calculateReplacementRate') : '';
}

export async function requestReplacementRate(form, {
  signal, url = resolveReplacementRateUrl(), fetchImpl = fetch,
} = {}) {
  const prepared = prepareReplacementRateInput(form);
  if (!prepared.ok) return prepared;
  if (!url) throw new Error(REPLACEMENT_RATE_FAILURE_MESSAGE);
  const response = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepared.input), signal });
  const result = await response.json();
  if (!response.ok || result.ok !== true || result.status !== 'calculated'
    || !Number.isFinite(result.replacementRatePercentage) || result.replacementRatePercentage < 0) {
    throw new Error(REPLACEMENT_RATE_FAILURE_MESSAGE);
  }
  return { ok: true, percentage: result.replacementRatePercentage };
}

export const formatReplacementRate = percentage => `${new Intl.NumberFormat('el-GR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(percentage)}%`;
