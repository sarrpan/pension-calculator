import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAveragePensionableEarnings, prepareAverageSalaryInput,
  parseAmount, parseInsuranceDays, resolveAverageSalaryUrl,
  AVERAGE_SALARY_FAILURE_MESSAGE, CONTRIBUTION_FUND_OPTIONS,
} from './averageSalary.js';

const row = { year: 2024, amount: '15000,50', days: '250' };
const form = { inputType: 'salaried', rows: [row] };

test('Greek decimals, empty fields and integer day bounds', () => {
  assert.equal(parseAmount('15000,50'), 15000.5);
  assert.equal(parseAmount('15000.50'), 15000.5);
  assert.equal(parseAmount(''), 0);
  assert.equal(parseAmount('-1'), null);
  assert.equal(parseInsuranceDays(''), 0);
  assert.equal(parseInsuranceDays('300'), 300);
  for (const value of ['301', '-1', '1.5', '1,5']) assert.equal(parseInsuranceDays(value), null);
});

for (const days of ['0', '', '301', '-1', '1.5']) {
  test(`No request for positive amount with days=${JSON.stringify(days)}`, async () => {
    let calls = 0;
    const result = await calculateAveragePensionableEarnings({ ...form, rows: [{ ...row, days }] }, {
      url: 'https://engine.test/calculateAverageSalary', fetchImpl: () => { calls++; },
    });
    assert.equal(result.ok, false);
    assert.equal(calls, 0);
    assert.equal(result.invalidRow.days, days);
  });
}

test('Negative amount and missing/unsupported contribution fund never send a request', async () => {
  for (const invalid of [
    { ...form, rows: [{ ...row, amount: '-1' }] },
    { ...form, inputType: 'non-salaried-contributions', fund: '' },
    { ...form, inputType: 'non-salaried-contributions', fund: 'tsay_salaried' },
  ]) {
    const result = await calculateAveragePensionableEarnings(invalid, {
      fetchImpl: () => assert.fail('Invalid form sent a request'),
    });
    assert.equal(result.ok, false);
  }
});

test('Only positive rows are sent, with numeric data and no unnecessary fund', async () => {
  let request;
  const result = await calculateAveragePensionableEarnings({
    ...form, fund: 'oga', rows: [row, { year: 2025, amount: '0', days: '300' }, { year: 2026, amount: '', days: '' }],
  }, {
    url: 'https://engine.test/calculateAverageSalary',
    fetchImpl: async (url, options) => {
      request = { url, ...options, body: JSON.parse(options.body) };
      // Contract-only fixture: this is not an expected financial calculation.
      return { ok: true, json: async () => ({ ok: true, status: 'calculated', averageMonthlyPensionableEarnings: 1234.56 }) };
    },
  });
  assert.deepEqual(request.body, { inputType: 'salaried', yearsData: [{ year: 2024, annualEarnings: 15000.5, insuranceDays: 250 }] });
  assert.equal(request.method, 'POST');
  assert.deepEqual(result, { ok: true, monthlyAmount: 1234.56 });
});

test('Income and every existing contribution fund have the correct input contract', () => {
  const income = prepareAverageSalaryInput({ ...form, inputType: 'non-salaried-income' });
  assert.deepEqual(income.input, { inputType: 'non-salaried-income', yearsData: [{ year: 2024, annualPensionableEarnings: 15000.5, insuranceDays: 250 }] });
  for (const { value: fund } of CONTRIBUTION_FUND_OPTIONS) {
    const converted = prepareAverageSalaryInput({ ...form, inputType: 'non-salaried-contributions', fund });
    assert.equal(converted.ok, true);
    assert.equal(converted.input.fund, fund);
    assert.deepEqual(converted.input.yearsData, [{ year: 2024, annualPensionContribution: 15000.5, insuranceDays: 250 }]);
  }
});

test('HTTP and malformed-response failures do not surface backend details', async () => {
  for (const payload of [
    { ok: false, error: 'private backend detail' },
    { ok: true, status: 'calculated', averageMonthlyPensionableEarnings: '1200' },
    { ok: true, status: 'calculated', averageMonthlyPensionableEarnings: null },
  ]) {
    await assert.rejects(calculateAveragePensionableEarnings(form, {
      url: 'https://engine.test/calculateAverageSalary',
      fetchImpl: async () => ({ ok: true, json: async () => payload }),
    }), { message: AVERAGE_SALARY_FAILURE_MESSAGE });
  }
});

test('Standalone endpoint is derived from existing Engine URL or explicit override', () => {
  assert.equal(resolveAverageSalaryUrl({ VITE_PENSION_ENGINE_URL: 'http://127.0.0.1:5002/project/region/calculatePensionFromInputPackage' }), 'http://127.0.0.1:5002/project/region/calculateAverageSalary');
  assert.equal(resolveAverageSalaryUrl({ VITE_AVERAGE_SALARY_ENGINE_URL: 'https://example.test/average' }), 'https://example.test/average');
  assert.equal(resolveAverageSalaryUrl({}), '');
});
