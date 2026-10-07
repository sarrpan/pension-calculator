import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareReplacementRateInput, requestReplacementRate, resolveReplacementRateUrl,
  formatReplacementRate, REPLACEMENT_RATE_FAILURE_MESSAGE } from './replacementRate.js';

const duration = { mode: 'duration', values: { years: '39', months: '6', days: '12', totalDays: '999' } };
test('Only the selected raw representation is sent; frontend performs no time conversion', () => {
  assert.deepEqual(prepareReplacementRateInput(duration).input, {
    insuranceTimeInputMethod: 'years_months_days', totalInsuranceYears: 39, totalInsuranceMonths: 6, totalInsuranceDays: 12,
  });
  assert.deepEqual(prepareReplacementRateInput({ ...duration, mode: 'days' }).input, {
    insuranceTimeInputMethod: 'insurance_days', totalInsuranceDays: 999,
  });
});
test('Negative, fractional, blank, unsafe and out-of-range inputs do not send requests', async () => {
  for (const [field, value] of [['years', '-1'], ['years', '1.5'], ['years', ''], ['years', '9007199254740992'], ['months', '12'], ['days', '25']]) {
    const result = await requestReplacementRate({ ...duration, values: { ...duration.values, [field]: value } }, {
      fetchImpl() { assert.fail('invalid request sent'); },
    });
    assert.equal(result.ok, false); assert.ok(result.errors[field]);
  }
  for (const totalDays of ['0', '30000']) assert.equal(prepareReplacementRateInput({ mode: 'days', values: { totalDays } }).ok, true);
});
test('Transport returns only the backend percentage and forwards abort signal', async () => {
  const controller = new AbortController(); let sent;
  const result = await requestReplacementRate(duration, { url: '/calculateReplacementRate', signal: controller.signal,
    fetchImpl: async (_, options) => {
      sent = options;
      // Response-contract fixture only; numerical expectations are tested in the engine.
      return { ok: true, json: async () => ({ ok: true, status: 'calculated', replacementRatePercentage: 12.34 }) };
    },
  });
  assert.deepEqual(result, { ok: true, percentage: 12.34 });
  assert.equal(sent.signal, controller.signal);
  assert.deepEqual(JSON.parse(sent.body), prepareReplacementRateInput(duration).input);
});
test('Public formatting uses two Greek decimal digits', () => {
  for (const [number, text] of [[37.31, '37,31%'], [48.74, '48,74%'], [50.01, '50,01%'], [51.01, '51,01%'], [0, '0,00%']]) {
    assert.equal(formatReplacementRate(number), text);
  }
});
test('HTTP, malformed response and unavailable endpoint produce clean errors', async () => {
  for (const [ok, payload] of [[false, { error: 'private' }], [true, { ok: true, status: 'calculated', replacementRatePercentage: '50.01' }],
    [true, { ok: true, status: 'calculated', replacementRatePercentage: -1 }]]) {
    await assert.rejects(requestReplacementRate(duration, { url: '/rate', fetchImpl: async () => ({ ok, json: async () => payload }) }),
      { message: REPLACEMENT_RATE_FAILURE_MESSAGE });
  }
  await assert.rejects(requestReplacementRate(duration, { url: '' }), { message: REPLACEMENT_RATE_FAILURE_MESSAGE });
});
test('Endpoint uses explicit configuration or the existing pension engine origin', () => {
  assert.equal(resolveReplacementRateUrl({ VITE_PENSION_ENGINE_URL: 'http://localhost:5002/project/region/calculatePensionFromInputPackage' }), 'http://localhost:5002/project/region/calculateReplacementRate');
  assert.equal(resolveReplacementRateUrl({ VITE_REPLACEMENT_RATE_ENGINE_URL: '/rate' }), '/rate');
  assert.equal(resolveReplacementRateUrl({}), '');
});
