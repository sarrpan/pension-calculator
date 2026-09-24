import test from 'node:test';
import assert from 'node:assert/strict';
import { FREE_OVERLAP_ERROR, getFreeInsurancePeriodsError } from './freeInsuranceValidation.js';
import { createPensionInputPackage } from './pensionInputPackage.js';

const first = { fromDate: '2000-01-01', toDate: '2010-12-31', insuranceDays: 2500 };
const second = { fromDate: '2011-01-01', toDate: '2025-12-31', insuranceDays: 4000 };
const calculationInput = {
  generalInfoData: {},
  contributoryPensionData: { earningsInputMethod: 'average_monthly', averageMonthlyPensionableEarnings: 1200 },
  insurancePeriodsDraft: [first, second],
};
test('Two disjoint Free periods can form an average-monthly request', () => {
  assert.equal(getFreeInsurancePeriodsError([first, second]), null);
  const value = createPensionInputPackage({ calculationInput, calculatorEdition: 'free' });
  assert.equal(value.source.edition, 'free');
  assert.deepEqual(value.calculationInput.insurancePeriodsDraft, [first, second]);
});
test('Overlaps, containment and a shared endpoint block request creation', () => {
  for (const overlap of [first, { ...second, fromDate: first.toDate }, { ...first, fromDate: '2005-01-01' }]) {
    for (const periods of [[first, overlap], [overlap, first]]) {
      assert.equal(getFreeInsurancePeriodsError(periods), FREE_OVERLAP_ERROR);
      assert.throws(() => createPensionInputPackage({ calculatorEdition: 'free', calculationInput: { ...calculationInput, insurancePeriodsDraft: periods } }), { message: FREE_OVERLAP_ERROR });
    }
  }
});
test('Free accepts at most two periods', () => {
  assert.match(getFreeInsurancePeriodsError([first, second, second]), /έως δύο/);
});
test('Current-year actual data is allowed, future dates are rejected', () => {
  const now = new Date('2026-09-24T12:00:00Z');
  assert.equal(getFreeInsurancePeriodsError([{ fromDate: '2026-01-01', toDate: '2026-09-24' }], now), null);
  assert.match(getFreeInsurancePeriodsError([{ fromDate: '2026-01-01', toDate: '2026-09-25' }], now), /χωρίς μελλοντική προβολή/);
});
test('The legacy annual pension request cannot be created for Free', () => {
  for (const changes of [
    { contributoryPensionData: { earningsInputMethod: 'yearly_earnings', yearsData: [{ year: 2024, annualEarnings: 12000, insuranceDays: 300 }] } },
    { yearsData: [{ year: 2024, annualEarnings: 12000, insuranceDays: 300 }] },
  ]) assert.throws(() => createPensionInputPackage({ calculatorEdition: 'free', calculationInput: { ...calculationInput, ...changes } }), /μόνο έτοιμο μέσο/);
});
