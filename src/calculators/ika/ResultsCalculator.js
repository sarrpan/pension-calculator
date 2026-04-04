const { SYSTEM_TABLES } = require("../../constants/ika/constants");
const { DEDUCTIONS_CONSTANTS } = require("../../constants/ika/deductionsConstants");
const { calculateSupplementary } = require("./SupplementaryCalculator");
const { calculateDeiDeductions } = require("../dei/DeductionsCalculator");

const LEGAL_INCREMENT_BASE = 0.075;
const BAE_EXTRA_CONTRIBUTION = 3.6;

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function num(x) {
  const v = Number.parseFloat(x);
  return Number.isFinite(v) ? v : 0;
}

function calculateEAS(grossMain) {
  const thresholds = SYSTEM_TABLES.DEDUCTIONS_2026.EAS_THRESHOLDS;
  let deduction = 0;

  for (let i = thresholds.length - 1; i >= 0; i -= 1) {
    if (grossMain > thresholds[i].limit) {
      deduction = grossMain * thresholds[i].rate;
      if (grossMain - deduction < thresholds[i].limit) {
        deduction = grossMain - thresholds[i].limit;
      }
      break;
    }
  }

  return deduction;
}

function calculateTax(taxableAmount) {
  const annualTaxable = taxableAmount * 12;
  const brackets = SYSTEM_TABLES.DEDUCTIONS_2026.TAX_BRACKETS;
  let taxCredit = SYSTEM_TABLES.DEDUCTIONS_2026.TAX_CREDIT_BASE;

  if (annualTaxable > 12000) {
    taxCredit = Math.max(0, taxCredit - Math.floor((annualTaxable - 12000) / 1000) * 20);
  }

  let annualTax = 0;
  let remaining = annualTaxable;
  let prevLimit = 0;

  for (const bracket of brackets) {
    const amountInBracket = Math.min(remaining, bracket.limit - prevLimit);
    if (amountInBracket <= 0) break;

    annualTax += amountInBracket * bracket.rate;
    remaining -= amountInBracket;
    prevLimit = bracket.limit;
  }

  return Math.max(0, annualTax - taxCredit) / 12;
}

function calculatePrivateSectorResults(formData) {
  if (!formData || !formData.yearsData) return {};

  let finalTotalYears = formData.totalInsuranceYears;
  let finalTotalMonths = formData.totalInsuranceMonths;

  if (!finalTotalYears && formData.yearsBefore2002 !== undefined) {
    let daysAfter = 0;
    for (const data of Object.values(formData.yearsData)) {
      daysAfter += num(data?.days);
    }

    const daysBefore = num(formData.yearsBefore2002) * 300 + num(formData.monthsBefore2002) * 25;
    const totalConvertedDays = daysAfter + daysBefore;

    finalTotalYears = Math.floor(totalConvertedDays / 300);
    finalTotalMonths = Math.floor((totalConvertedDays % 300) / 25);
  }

  const {
    yearsData,
    insuredType,
    birthDate,
    pensionDate,
    residenceYears,
    heavyRetirement,
    heavyMode,
    heavyUntil2014Years,
    heavyUntil2014Months,
    heavyFrom2015Years,
    heavyFrom2015Months,
  } = formData;

  const typeKey = insuredType === 'old' ? 'OLD' : 'NEW';

  let totalWeightedAmount = 0;
  let totalDaysAfter2002 = 0;

  for (const [year, data] of Object.entries(yearsData)) {
    const rawAmount = num(data?.amount);
    const rawDays = num(data?.days);
    const cpi = SYSTEM_TABLES.CPI_FACTORS?.[year] ?? 1;
    const monthlyCap = SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[year] ?? 7761.94;
    const maxYearly = monthlyCap * (rawDays / 25);
    const cappedAmount = maxYearly > 0 && rawAmount > maxYearly ? maxYearly : rawAmount;

    totalWeightedAmount += cappedAmount * cpi;
    totalDaysAfter2002 += rawDays;
  }

  const totalInsuranceDays = num(finalTotalYears) * 300 + num(finalTotalMonths) * 25;
  const daysBefore2002 = totalInsuranceDays - totalDaysAfter2002;

  if (totalInsuranceDays < 4500 || daysBefore2002 < 0) return {};

  let totalHeavyDays = 0;
  if (heavyMode === 'all') {
    totalHeavyDays = totalInsuranceDays;
  } else if (heavyMode === 'partial') {
    totalHeavyDays =
      num(heavyUntil2014Years) * 300 +
      num(heavyUntil2014Months) * 25 +
      num(heavyFrom2015Years) * 300 +
      num(heavyFrom2015Months) * 25;
  }

  totalHeavyDays = Math.min(totalHeavyDays, totalInsuranceDays);

  const totalDecimalYears = totalInsuranceDays / 300;
  const avgMonthlySalary = totalDaysAfter2002 > 0 ? totalWeightedAmount / (totalDaysAfter2002 / 25) : 0;

  const scales = SYSTEM_TABLES.REPLACEMENT_SCALES;
  const chosen = scales.find((scale) => totalDecimalYears <= scale.upTo) || scales[scales.length - 1];
  const prevUpTo = scales[scales.indexOf(chosen) - 1]?.upTo || 0;

  let finalRate = chosen.base + (totalDecimalYears - prevUpTo) * chosen.factor;

  const heavyExtraRate =
    heavyRetirement === 'yes'
      ? 0
      : (totalHeavyDays / 300) * (LEGAL_INCREMENT_BASE * BAE_EXTRA_CONTRIBUTION);

  finalRate += heavyExtraRate;

  let penaltyRate = 0;
  if (birthDate && pensionDate && heavyRetirement !== 'yes') {
    const bDate = new Date(birthDate);
    const pDate = new Date(pensionDate);

    let ageMonths =
      (pDate.getFullYear() - bDate.getFullYear()) * 12 +
      (pDate.getMonth() - bDate.getMonth());

    if (pDate.getDate() < bDate.getDate()) {
      ageMonths -= 1;
    }

    if (totalInsuranceDays < 12000) {
      const monthsBefore67 = Math.max(0, 67 * 12 - ageMonths);
      penaltyRate = Math.min(monthsBefore67, 60) * 0.005;
    }
  }

  const residenceFactor = num(residenceYears) >= 40 ? 1 : num(residenceYears) / 40;

  const nationalRaw =
    SYSTEM_TABLES.NATIONAL_PENSION_2026 *
    (totalDecimalYears < 20 ? 1 - (20 - totalDecimalYears) * 0.02 : 1) *
    residenceFactor *
    (1 - penaltyRate);

  const contributoryRaw = (avgMonthlySalary * finalRate) / 100;

  const suppFormData = {
    ...formData,
    totalInsuranceYears: finalTotalYears,
    totalInsuranceMonths: finalTotalMonths,
  };
  const supplementaryRaw = calculateSupplementary(suppFormData);

  const mainGross = nationalRaw + contributoryRaw;
  const grandTotalGross = mainGross + supplementaryRaw;

  const easDeduction = calculateEAS(mainGross);
  const healthDeduction = (grandTotalGross - easDeduction) * SYSTEM_TABLES.DEDUCTIONS_2026.HEALTH_RATE;
  const taxDeduction = calculateTax(grandTotalGross - easDeduction - healthDeduction);
  const netAmount = grandTotalGross - easDeduction - healthDeduction - taxDeduction;

  return {
    national: round2(nationalRaw),
    contributory: round2(contributoryRaw),
    supplementary: round2(supplementaryRaw),
    grossTotal: round2(mainGross),
    grossGrandTotal: round2(grandTotalGross),
    easDeduction: round2(easDeduction),
    healthDeduction: round2(healthDeduction),
    taxDeduction: round2(taxDeduction),
    netAmount: round2(netAmount),
    rate: round2(finalRate),
    totalWorkLife: `${Math.floor(totalInsuranceDays / 300)}έ ${Math.floor((totalInsuranceDays % 300) / 25)}μ`,
  };
}

module.exports = { calculatePrivateSectorResults };