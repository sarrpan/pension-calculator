const { SYSTEM_TABLES } = require("../../constants/dei/constants");
const { DEDUCTIONS_CONSTANTS } = require("../../constants/dei/deductionsConstants");
const { calculateDeiSupplementary } = require("./SupplementaryCalculator");
const { calculateDeiDeductions } = require("./DeductionsCalculator");


function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function num(x) {
  const v = Number.parseFloat(x);
  return Number.isFinite(v) ? v : 0;
}

function getInsuranceDaysPerYear() {
  return num(SYSTEM_TABLES.INSURANCE_TIME_UNITS?.DAYS_PER_INSURANCE_YEAR);
}

function getInsuranceDaysPerMonth() {
  return num(SYSTEM_TABLES.INSURANCE_TIME_UNITS?.DAYS_PER_INSURANCE_MONTH);
}

function getMinInsuranceDays() {
  return num(SYSTEM_TABLES.PENSION_RULES_2026?.MIN_INSURANCE_DAYS);
}

function getFullResidenceYears() {
  return num(SYSTEM_TABLES.PENSION_RULES_2026?.FULL_RESIDENCE_YEARS);
}

function getNationalPensionFullRateYears() {
  return num(SYSTEM_TABLES.PENSION_RULES_2026?.NATIONAL_PENSION_FULL_RATE_YEARS);
}

function getNationalPensionReductionPerMissingYear() {
  return num(SYSTEM_TABLES.PENSION_RULES_2026?.NATIONAL_PENSION_REDUCTION_PER_MISSING_YEAR);
}

function getDeiMainHeavyLegalIncrementBase() {
  return num(SYSTEM_TABLES.DEI_MAIN_HEAVY_LEGAL_INCREMENT_BASE);
}

function getHeavyNormalExitBonusFactor() {
  return num(SYSTEM_TABLES.DEI_MAIN_HEAVY_INCREMENT_FACTORS?.NORMAL_EXIT_HEAVY_BONUS_ALL_YEARS);
}

function toTotalMonths(years, months) {
  return num(years) * 12 + num(months);
}

function monthsFromInsuranceDays(days) {
  const daysPerMonth = getInsuranceDaysPerMonth();
  if (!daysPerMonth) return 0;
  return Math.round(num(days) / daysPerMonth);
}

function getAgeAtExit(birthDate, pensionDate) {
  const fallbackAge = DEDUCTIONS_CONSTANTS.DEI_UNDER_60.ageLimit;

  if (!birthDate || !pensionDate) {
    return fallbackAge;
  }

  const bDate = new Date(birthDate);
  const pDate = new Date(pensionDate);

  if (Number.isNaN(bDate.getTime()) || Number.isNaN(pDate.getTime())) {
    return fallbackAge;
  }

  let age = pDate.getFullYear() - bDate.getFullYear();

  if (
    pDate.getMonth() < bDate.getMonth() ||
    (pDate.getMonth() === bDate.getMonth() && pDate.getDate() < bDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function getNationalReductionFactor(pensionMode, reducedYears) {
  if (pensionMode !== "reduced") {
    return 1;
  }

  const yearsEarly = Math.min(Math.max(num(reducedYears), 0), 5);
  return Math.max(0, 1 - yearsEarly * 0.06);
}

function isNormalRetirementExit(deiCategory, insuredType, ageAtExit, totalInsuranceMonths) {
  const has40Years = totalInsuranceMonths >= 40 * 12;
  const has15Years = totalInsuranceMonths >= 15 * 12;

  if (deiCategory === "lignite") {
    if (insuredType === "old") {
      return ageAtExit >= 60 && has40Years;
    }

    if (insuredType === "new") {
      return ageAtExit >= 62 && has40Years;
    }
  }

  if (deiCategory === "heavy") {
    if (insuredType === "old") {
      return (ageAtExit >= 62 && has40Years) || (ageAtExit >= 67 && has15Years);
    }

    if (insuredType === "new") {
      return (ageAtExit >= 62 && has40Years) || (ageAtExit >= 67 && has15Years);
    }
  }

  return false;
}

function getDeiMainHeavyFactor({ deiCategory, insuredType, year, normalRetirementExit }) {
  const factors = SYSTEM_TABLES.DEI_MAIN_HEAVY_INCREMENT_FACTORS ?? {};

  let normalExitBonus = 0;

  if (deiCategory === "lignite") {
    normalExitBonus = num(factors.NORMAL_EXIT_HEAVY_BONUS_ALL_YEARS); // 7
  } else if (deiCategory === "heavy" && insuredType === "old") {
    normalExitBonus = num(factors.HEAVY_BAH_OLD_INSURED); // 3.75
  } else if (deiCategory === "heavy" && insuredType === "new") {
    normalExitBonus = num(factors.HEAVY_BAH_NEW_INSURED); // 3.6
  }

  if (insuredType === "new") {
    if (!normalRetirementExit) return 0;
    return normalExitBonus;
  }

  let baseFactor = 0;

  if (year <= 2016) baseFactor = num(factors.OLD_INSURED_UP_TO_2016);
  else if (year === 2017) baseFactor = num(factors.OLD_INSURED_2017);
  else if (year === 2018) baseFactor = num(factors.OLD_INSURED_2018);
  else if (year === 2019) baseFactor = num(factors.OLD_INSURED_2019);
  else baseFactor = num(factors.OLD_INSURED_FROM_2020);

  if (!normalRetirementExit) {
    return baseFactor;
  }

  return baseFactor + normalExitBonus;
}



function selectedCategoryGetsMainHeavyBonus(deiCategory, insuredType) {
  return (
    deiCategory === "heavy" ||
    deiCategory === "lignite" ||
    (deiCategory === "simple" && insuredType === "old")
  );
}

function getDifferentCategoryDaysAfter2015(formData) {
  const mode =
    formData.differentCategoryMode ??
    formData.hasDifferentDeiCategoryAfter2015 ??
    "no";

  if (mode !== "yes") return 0;

  return (
    toTotalMonths(
      formData.differentDeiCategoryAfter2015Years,
      formData.differentDeiCategoryAfter2015Months
    ) *
    getInsuranceDaysPerMonth()
  );
}

function buildMainHeavyDaysByPeriod({
  yearsData,
  totalDaysUntil2014,
  outsideDaysUntil2014,
}) {
  const selectedDaysUntil2014 = Math.max(
    totalDaysUntil2014 - Math.min(Math.max(outsideDaysUntil2014, 0), totalDaysUntil2014),
    0
  );

  let upTo2016Days = selectedDaysUntil2014;
  let days2017 = 0;
  let days2018 = 0;
  let days2019 = 0;
  let from2020Days = 0;

  for (const [yearKey, data] of Object.entries(yearsData || {})) {
    const year = Number(yearKey);
    const days = num(data?.days);

    if (!Number.isFinite(year) || days <= 0) continue;

    if (year === 2015 || year === 2016) upTo2016Days += days;
    else if (year === 2017) days2017 += days;
    else if (year === 2018) days2018 += days;
    else if (year === 2019) days2019 += days;
    else if (year >= 2020) from2020Days += days;
  }

  return {
    upTo2016Days,
    days2017,
    days2018,
    days2019,
    from2020Days,
  };
}

function allocateNeutralizedMainDays({
  deiCategory,
  insuredType,
  normalRetirementExit,
  daysToNeutralize,
  periods,
}) {
  const result = {
    upTo2016Days: 0,
    days2017: 0,
    days2018: 0,
    days2019: 0,
    from2020Days: 0,
  };

  if (daysToNeutralize <= 0) {
    return result;
  }

  const periodList = [
    {
      key: "upTo2016Days",
      availableDays: periods.upTo2016Days,
      factor: getDeiMainHeavyFactor({
        deiCategory,
        insuredType,
        year: 2016,
        normalRetirementExit,
      }),
    },
    {
      key: "days2017",
      availableDays: periods.days2017,
      factor: getDeiMainHeavyFactor({
        deiCategory,
        insuredType,
        year: 2017,
        normalRetirementExit,
      }),
    },
    {
      key: "days2018",
      availableDays: periods.days2018,
      factor: getDeiMainHeavyFactor({
        deiCategory,
        insuredType,
        year: 2018,
        normalRetirementExit,
      }),
    },
    {
      key: "days2019",
      availableDays: periods.days2019,
      factor: getDeiMainHeavyFactor({
        deiCategory,
        insuredType,
        year: 2019,
        normalRetirementExit,
      }),
    },
    {
      key: "from2020Days",
      availableDays: periods.from2020Days,
      factor: getDeiMainHeavyFactor({
        deiCategory,
        insuredType,
        year: 2020,
        normalRetirementExit,
      }),
    },
  ]
    .filter((item) => item.availableDays > 0)
    .sort((a, b) => {
      if (b.factor !== a.factor) return b.factor - a.factor;
      return 0;
    });

  let remaining = daysToNeutralize;

  for (const item of periodList) {
    if (remaining <= 0) break;

    const neutralized = Math.min(item.availableDays, remaining);
    result[item.key] = neutralized;
    remaining -= neutralized;
  }

  return result;
}

function calculateDeiHeavyExtraRate({
  insuredType,
  deiCategory,
  formData,
  yearsData,
  totalDaysUntil2014,
  ageAtExit,
  totalInsuranceMonths,
}) {
  const legalIncrementBase = getDeiMainHeavyLegalIncrementBase();
  if (!legalIncrementBase) return 0;

  if (!selectedCategoryGetsMainHeavyBonus(deiCategory, insuredType)) {
    return 0;
  }

  const normalRetirementExit = isNormalRetirementExit(
    deiCategory,
    insuredType,
    ageAtExit,
    totalInsuranceMonths
  );

  const outsideDaysUntil2014 =
    toTotalMonths(
      formData.yearsOutsideDeiBefore2014 ?? formData.outsideBefore2014Years,
      formData.monthsOutsideDeiBefore2014 ?? formData.outsideBefore2014Months
    ) * getInsuranceDaysPerMonth();

  const basePeriods = buildMainHeavyDaysByPeriod({
    yearsData,
    totalDaysUntil2014,
    outsideDaysUntil2014,
  });

  const neutralizedDays = allocateNeutralizedMainDays({
    deiCategory,
    insuredType,
    normalRetirementExit,
    daysToNeutralize: getDifferentCategoryDaysAfter2015(formData),
    periods: basePeriods,
  });

  const effectivePeriods = [
    {
      year: 2016,
      days: Math.max(basePeriods.upTo2016Days - neutralizedDays.upTo2016Days, 0),
    },
    {
      year: 2017,
      days: Math.max(basePeriods.days2017 - neutralizedDays.days2017, 0),
    },
    {
      year: 2018,
      days: Math.max(basePeriods.days2018 - neutralizedDays.days2018, 0),
    },
    {
      year: 2019,
      days: Math.max(basePeriods.days2019 - neutralizedDays.days2019, 0),
    },
    {
      year: 2020,
      days: Math.max(basePeriods.from2020Days - neutralizedDays.from2020Days, 0),
    },
  ];

  return effectivePeriods.reduce((sum, period) => {
    const factor = getDeiMainHeavyFactor({
      deiCategory,
      insuredType,
      year: period.year,
      normalRetirementExit,
    });

    if (!factor || !period.days) {
      return sum;
    }

    const months = monthsFromInsuranceDays(period.days);
    return sum + (months / 12) * (legalIncrementBase * factor);
  }, 0);
}

function calculateDeiSector(formData) {
  if (!formData || !formData.yearsData) return {};

  const daysPerMonth = getInsuranceDaysPerMonth();
  const minInsuranceDays = getMinInsuranceDays();
  const fullResidenceYears = getFullResidenceYears();
  const nationalPensionFullRateYears = getNationalPensionFullRateYears();
  const nationalPensionReductionPerMissingYear = getNationalPensionReductionPerMissingYear();

  let finalTotalYears = formData.totalInsuranceYears;
  let finalTotalMonths = formData.totalInsuranceMonths;

  if (!finalTotalYears && formData.yearsBefore2002 !== undefined) {
    let daysAfter = 0;
    for (const data of Object.values(formData.yearsData)) {
      daysAfter += num(data?.days);
    }

    const daysBefore =
      num(formData.yearsBefore2002) * getInsuranceDaysPerYear() +
      num(formData.monthsBefore2002) * daysPerMonth;
    const totalConvertedDays = daysAfter + daysBefore;

    finalTotalYears = Math.floor(totalConvertedDays / getInsuranceDaysPerYear());
    finalTotalMonths = Math.floor((totalConvertedDays % getInsuranceDaysPerYear()) / daysPerMonth);
  }

  const {
    yearsData,
    insuredType,
    residenceYears,
    birthDate,
    pensionDate,
    deiCategory,
    pensionMode,
    reducedYears,
  } = formData;

  let totalWeightedAmount = 0;
  let totalDaysAfter2002 = 0;
  let totalDaysFrom2015 = 0;

  for (const [year, data] of Object.entries(yearsData)) {
    const rawAmount = num(data?.amount);
    const rawDays = num(data?.days);
    const cpi = num(SYSTEM_TABLES.CPI_FACTORS?.[year]) || 1;
    const yearNum = Number(year);

    totalWeightedAmount += rawAmount * cpi;
    totalDaysAfter2002 += rawDays;

    if (Number.isFinite(yearNum) && yearNum >= 2015) {
      totalDaysFrom2015 += rawDays;
    }
  }

  const totalInsuranceMonths = toTotalMonths(finalTotalYears, finalTotalMonths);
  const totalInsuranceDays = totalInsuranceMonths * daysPerMonth;

  if (totalInsuranceDays < minInsuranceDays || totalInsuranceDays < totalDaysAfter2002) {
    return {};
  }

  const totalDecimalYears = totalInsuranceMonths / 12;
  const avgMonthlySalary =
    totalDaysAfter2002 > 0 ? totalWeightedAmount / (totalDaysAfter2002 / daysPerMonth) : 0;

  const scales = SYSTEM_TABLES.REPLACEMENT_SCALES ?? [];
  const chosen =
    scales.find((scale) => totalDecimalYears <= scale.upTo) ||
    scales[scales.length - 1];

  if (!chosen) {
    return {};
  }

  const chosenIndex = scales.indexOf(chosen);
  const prevUpTo = chosenIndex > 0 ? num(scales[chosenIndex - 1]?.upTo) : 0;

  const ageAtExit = getAgeAtExit(birthDate, pensionDate);
  const totalDaysUntil2014 = Math.max(totalInsuranceDays - totalDaysFrom2015, 0);

  const heavyExtraRate = calculateDeiHeavyExtraRate({
    insuredType,
    deiCategory,
    formData,
    yearsData,
    totalDaysUntil2014,
    ageAtExit,
    totalInsuranceMonths,
  });

  const baseReplacementRate =
    num(chosen.base) + (totalDecimalYears - prevUpTo) * num(chosen.factor);

  const finalRate = baseReplacementRate + heavyExtraRate;

  const residenceFactor =
    num(residenceYears) >= fullResidenceYears
      ? 1
      : num(residenceYears) / fullResidenceYears;

  const nationalReductionFactor = getNationalReductionFactor(pensionMode, reducedYears);

  const nationalRaw =
    num(SYSTEM_TABLES.NATIONAL_PENSION_2026) *
    (totalDecimalYears < nationalPensionFullRateYears
      ? 1 - (nationalPensionFullRateYears - totalDecimalYears) * nationalPensionReductionPerMissingYear
      : 1) *
    residenceFactor *
    nationalReductionFactor;

  const contributoryRaw = (avgMonthlySalary * finalRate) / 100;

  const suppFormData = {
    ...formData,
    totalInsuranceYears: finalTotalYears,
    totalInsuranceMonths: finalTotalMonths,
  };

  const suppResult = calculateDeiSupplementary(suppFormData);
  const supplementaryRaw = suppResult?.total ?? suppResult;
  const suppDebug = suppResult?.debug ?? {};

  const mainGross = nationalRaw + contributoryRaw;

  const deductions = calculateDeiDeductions({
    mainGross,
    supplementaryGross: supplementaryRaw,
    birthDate,
    pensionDate,
  });

  const finalMainAmount =
    deductions.mainGross -
    deductions.mainEasDeduction -
    deductions.under60Deduction -
    deductions.mainHealthDeduction;

  const finalSupplementaryAmount =
    deductions.supplementaryGross -
    deductions.supplementaryEasDeduction -
    deductions.supplementaryHealthDeduction;

return {
  national: round2(nationalRaw),
  contributory: round2(contributoryRaw),
  supplementary: round2(supplementaryRaw),

  grossTotal: round2(mainGross),
  grossGrandTotal: deductions.grossGrandTotal,

  easDeduction: deductions.totalEasDeduction,
  mainEasDeduction: deductions.mainEasDeduction,
  supplementaryEasDeduction: deductions.supplementaryEasDeduction,

  under60Deduction: deductions.under60Deduction,

  healthDeduction: deductions.healthDeduction,
  mainHealthDeduction: deductions.mainHealthDeduction,
  supplementaryHealthDeduction: deductions.supplementaryHealthDeduction,

  taxableAmount: deductions.taxableAmount,
  taxDeduction: deductions.taxDeduction,
  netAmount: deductions.netAmount,
  mainPension: round2(nationalRaw + contributoryRaw),

  finalMainAmount: round2(finalMainAmount),
  finalSupplementaryAmount: round2(finalSupplementaryAmount),
  finalTotalAmount: deductions.netAmount,

  rate: round2(finalRate),
  totalWorkLife: `${Math.floor(totalInsuranceMonths / 12)}έ ${totalInsuranceMonths % 12}μ`,

debugInfo: {
  main: {
    totalInsuranceDays,
    totalDaysAfter2002,
    totalWeightedAmount,
    avgMonthlySalary,
    totalDecimalYears,
    baseReplacementRate,
    heavyExtraRate,
    finalRate,
    contributoryRaw,
    nationalRaw,
    ageAtExit,
    totalInsuranceMonths,
    insuredType,
    deiCategory,
    pensionMode,
    reducedYears,
    nationalReductionFactor,
    qualifiesForPlus7: isNormalRetirementExit(
      deiCategory,
      insuredType,
      ageAtExit,
      totalInsuranceMonths
    )
  },
  supplementary: suppDebug,
  deductions
}
};
}
module.exports = { calculateDeiSector };