const { SYSTEM_TABLES } = require("../../constants/dei/constants");

function num(x) {
  const v = Number.parseFloat(x);
  return Number.isFinite(v) ? v : 0;
}
function round2(x) {
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
}
function getInsuranceDaysPerYear() {
  return SYSTEM_TABLES.INSURANCE_TIME_UNITS?.DAYS_PER_INSURANCE_YEAR ?? 300;
}

function getInsuranceDaysPerMonth() {
  return SYSTEM_TABLES.INSURANCE_TIME_UNITS?.DAYS_PER_INSURANCE_MONTH ?? 25;
}

function getInsurableCapFallbackYear() {
  return SYSTEM_TABLES.DEI_CALCULATOR_DEFAULTS?.INSURABLE_CAP_FALLBACK_YEAR ?? 2026;
}

function getDeiSupplementaryBirthYearFallback() {
  return SYSTEM_TABLES.DEI_SUPPLEMENTARY_DEFAULTS?.BIRTH_YEAR_FALLBACK ?? 1960;
}

function getOldSystemSupplementaryModel() {
  const model = SYSTEM_TABLES.DEI_OLD_SYSTEM_SUPPLEMENTARY_MODEL ?? {};
  const legalIncrementBase = model.LEGAL_INCREMENT_BASE ?? 0.00075;
  const baseRate = model.BASE_RATE ?? 0.0045;

  const heavyRate =
    baseRate + (model.HEAVY_BAE_EXTRA_CONTRIBUTION_UNITS ?? 2.0) * legalIncrementBase;

  const ligniteRate =
    baseRate + (model.HEAVY_YVAE_EXTRA_CONTRIBUTION_UNITS ?? 3.0) * legalIncrementBase;

  return {
    legalIncrementBase,
    baseRate,
    heavyRate,
    ligniteRate,
  };
}

function getSupplementaryModelRate(year) {
  const yearlyRates = SYSTEM_TABLES.DEI_SUPPLEMENTARY_MODEL_RATES?.BASE_BY_YEAR ?? {};

  if (yearlyRates[year] !== undefined) {
    return yearlyRates[year];
  }

  return SYSTEM_TABLES.DEI_SUPPLEMENTARY_MODEL_RATES?.BASE_BY_YEAR?.[2026] ?? 0.06;
}

function getDeiGFactor(ageAtExit) {
  return (
    SYSTEM_TABLES.DEI_G_FACTORS?.[ageAtExit] ??
    SYSTEM_TABLES.G_FACTORS?.[ageAtExit] ??
    SYSTEM_TABLES.DEI_SUPPLEMENTARY_DEFAULTS?.G_FACTOR_FALLBACK ??
    16.9
  );
}

function getCategoryExtraRate(deiCategory) {
  switch (deiCategory) {
    case "heavy":
      return 0.02;
    case "lignite":
      return 0.03;
    case "simple":
    default:
      return 0;
  }
}

function getPartARateForCategory(deiCategory, oldSystemModel) {
  if (deiCategory === "heavy") {
    return oldSystemModel.heavyRate;
  }

  if (deiCategory === "lignite") {
    return oldSystemModel.ligniteRate;
  }

  return oldSystemModel.baseRate;
}

function getDifferentCategoryDaysAfter2015(formData) {
  const daysPerYear = getInsuranceDaysPerYear();
  const daysPerMonth = getInsuranceDaysPerMonth();

  const mode =
    formData?.differentCategoryMode ??
    formData?.hasDifferentDeiCategoryAfter2015 ??
    "no";

  if (mode !== "yes") {
    return 0;
  }

  return (
    num(formData?.differentDeiCategoryAfter2015Years) * daysPerYear +
    num(formData?.differentDeiCategoryAfter2015Months) * daysPerMonth
  );
}

function buildYearlyPartBStats(yearsData, typeKey, insurableCapFallbackYear) {
  const daysPerMonth = getInsuranceDaysPerMonth();
  const stats = [];

  for (const [year, data] of Object.entries(yearsData || {})) {
    const yr = Number.parseInt(year, 10);
    if (!Number.isFinite(yr) || yr < 2015) continue;

    const rawAmount = num(data?.amount);
    const rawDays = num(data?.days);
    if (rawDays <= 0) continue;

    const monthlyCap =
      SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[year] ??
      SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[insurableCapFallbackYear] ??
      7761.94;

    const maxYearly = monthlyCap * (rawDays / daysPerMonth);
    const cappedAmount = maxYearly > 0 && rawAmount > maxYearly ? maxYearly : rawAmount;

    const baseRate = getSupplementaryModelRate(yr);
    const revalFactor = SYSTEM_TABLES.SUPPLEMENTARY_REVALUATION?.[yr] ?? 1;
    const revaluedAmount = cappedAmount * revalFactor;
    const revaluedDaily = rawDays > 0 ? revaluedAmount / rawDays : 0;

    stats.push({
      year: yr,
      rawDays,
      cappedAmount,
      baseRate,
      revalFactor,
      revaluedAmount,
      revaluedDaily,
    });
  }

  return stats;
}

function allocateNeutralizedDays(stats, daysToNeutralize, categoryExtraRate) {
  const neutralizedByYear = new Map();

  if (daysToNeutralize <= 0 || categoryExtraRate <= 0) {
    return neutralizedByYear;
  }

  const sorted = [...stats].sort((a, b) => {
    const totalRateA = a.baseRate + categoryExtraRate;
    const totalRateB = b.baseRate + categoryExtraRate;

    if (totalRateB !== totalRateA) {
      return totalRateB - totalRateA;
    }

    return a.year - b.year;
  });

  let remaining = daysToNeutralize;

  for (const item of sorted) {
    if (remaining <= 0) break;

    const neutralized = Math.min(item.rawDays, remaining);
    neutralizedByYear.set(item.year, neutralized);
    remaining -= neutralized;
  }

  return neutralizedByYear;
}

function calculateDeiSupplementary(formData) {
  if (!formData || !formData.yearsData) {
  return {
    total: 0,
    debug: {
      note: {
        value: 0,
        description: "Δεν δόθηκαν επαρκή δεδομένα εισόδου."
      }
    }
  };
}

  const oldSystemModel = getOldSystemSupplementaryModel();
  const daysPerYear = getInsuranceDaysPerYear();
  const daysPerMonth = getInsuranceDaysPerMonth();
  const insurableCapFallbackYear = getInsurableCapFallbackYear();

  let finalTotalYears = formData.totalInsuranceYears;
  let finalTotalMonths = formData.totalInsuranceMonths;

  if (!finalTotalYears && formData.yearsBefore2002 !== undefined) {
    let daysAfter = 0;
    for (const data of Object.values(formData.yearsData)) {
      daysAfter += num(data?.days);
    }

    const daysBefore =
      num(formData.yearsBefore2002) * daysPerYear +
      num(formData.monthsBefore2002) * daysPerMonth;

    const totalConvertedDays = daysAfter + daysBefore;
    finalTotalYears = Math.floor(totalConvertedDays / daysPerYear);
    finalTotalMonths = Math.floor((totalConvertedDays % daysPerYear) / daysPerMonth);
  }

  const { yearsData, birthDate, pensionDate, insuredType, deiCategory } = formData;
  const typeKey = insuredType === "old" ? "OLD" : "NEW";

  let weightedSalary02_14 = 0;
  let days02_14 = 0;
  let daysFrom2015 = 0;

  for (const [year, data] of Object.entries(yearsData)) {
    const yr = Number.parseInt(year, 10);
    const rawAmount = num(data?.amount);
    const rawDays = num(data?.days);

    if (!Number.isFinite(yr) || rawDays <= 0) continue;

    const cpi = SYSTEM_TABLES.CPI_FACTORS?.[year] ?? 1;
    const monthlyCap =
      SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[year] ??
      SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[insurableCapFallbackYear] ??
      7761.94;

    const maxYearly = monthlyCap * (rawDays / daysPerMonth);
    const cappedAmount = maxYearly > 0 && rawAmount > maxYearly ? maxYearly : rawAmount;

    if (yr >= 2002 && yr <= 2014) {
      weightedSalary02_14 += cappedAmount * cpi;
      days02_14 += rawDays;
    } else if (yr >= 2015) {
      daysFrom2015 += rawDays;
    }
  }

  const totalInsuranceDays =
    num(finalTotalYears) * daysPerYear + num(finalTotalMonths) * daysPerMonth;
  const totalDaysAfter2002 = days02_14 + daysFrom2015;
  const daysBefore2002 = totalInsuranceDays - totalDaysAfter2002;

  if (daysBefore2002 < 0) {
  return {
    total: 0,
    debug: {
      note: {
        value: 0,
        description: "Οι ημέρες πριν το 2002 βγήκαν αρνητικές, άρα τα δεδομένα είναι ασύμβατα."
      }
    }
  };
}

  const totalDaysUntil2014 = daysBefore2002 + days02_14;

  const outsideDaysUntil2014 =
    num(formData.yearsOutsideDeiBefore2014) * daysPerYear +
    num(formData.monthsOutsideDeiBefore2014) * daysPerMonth;

  const clampedOutsideDaysUntil2014 = Math.min(
    Math.max(outsideDaysUntil2014, 0),
    totalDaysUntil2014
  );

  const deiDaysUntil2014 = Math.max(totalDaysUntil2014 - clampedOutsideDaysUntil2014, 0);

  const avgSalaryA =
    days02_14 > 0 ? weightedSalary02_14 / (days02_14 / daysPerMonth) : 0;

  const yearsOutsideA = clampedOutsideDaysUntil2014 / daysPerYear;
  const yearsDeiA = deiDaysUntil2014 / daysPerYear;

  const partARateForCategory = getPartARateForCategory(deiCategory, oldSystemModel);

  const supplementaryPartA =
    avgSalaryA *
    (
      yearsOutsideA * oldSystemModel.baseRate +
      yearsDeiA * partARateForCategory
    );

  const yearStats = buildYearlyPartBStats(
    yearsData,
    typeKey,
    insurableCapFallbackYear
  );

  const totalPartBBaseContributions = yearStats.reduce(
    (sum, item) => sum + item.cappedAmount * item.baseRate * item.revalFactor,
    0
  );

  const categoryExtraRate = getCategoryExtraRate(deiCategory);
  const differentCategoryDaysAfter2015 = getDifferentCategoryDaysAfter2015(formData);

  const neutralizedByYear = allocateNeutralizedDays(
    yearStats,
    differentCategoryDaysAfter2015,
    categoryExtraRate
  );

  const extraCategoryContributions = yearStats.reduce((sum, item) => {
    const neutralizedDays = neutralizedByYear.get(item.year) ?? 0;
    const premiumEligibleDays = Math.max(item.rawDays - neutralizedDays, 0);

    return sum + premiumEligibleDays * item.revaluedDaily * categoryExtraRate;
  }, 0);

  const totalPartBContributions = totalPartBBaseContributions + extraCategoryContributions;

  const birthYear = birthDate
    ? new Date(birthDate).getFullYear()
    : getDeiSupplementaryBirthYearFallback();

  const pensionYear = pensionDate
    ? new Date(pensionDate).getFullYear()
    : new Date().getFullYear();

  const ageAtExit = pensionYear - birthYear;
  const gFactor = getDeiGFactor(ageAtExit);

  const supplementaryPartB =
    gFactor > 0 ? totalPartBContributions / gFactor / 12 : 0;

  const totalSupplementary = supplementaryPartA + supplementaryPartB;

return {
  total: round2(totalSupplementary),
  debug: {
    oldSystemModel: {
      value: {
        baseRate: round2(oldSystemModel.baseRate * 100),
        heavyExtraContributionUnits: round2(oldSystemModel.heavyExtraContributionUnits),
        heavyRate: round2(oldSystemModel.heavyRate * 100),
      },
      description: "Βασικές παράμετροι του παλιού συστήματος για το Part A."
    },

    insuranceTotals: {
      value: {
        finalTotalYears: num(finalTotalYears),
        finalTotalMonths: num(finalTotalMonths),
        totalInsuranceDays: round2(totalInsuranceDays),
        totalDaysAfter2002: round2(totalDaysAfter2002),
        daysBefore2002: round2(daysBefore2002),
        totalDaysUntil2014: round2(totalDaysUntil2014),
      },
      description: "Συνολικός ασφαλιστικός χρόνος και διάσπαση πριν/μετά το 2002."
    },

    partAInput: {
      value: {
        weightedSalary02_14: round2(weightedSalary02_14),
        days02_14: round2(days02_14),
        avgSalaryA: round2(avgSalaryA),
        outsideDaysUntil2014: round2(clampedOutsideDaysUntil2014),
        deiDaysUntil2014: round2(deiDaysUntil2014),
        yearsOutsideA: round2(yearsOutsideA),
        yearsDeiA: round2(yearsDeiA),
        partARateForCategory: round2(partARateForCategory * 100),
      },
      description: "Στοιχεία εισόδου για το Part A, δηλαδή το τμήμα της επικουρικής έως το 2014."
    },

    partAResult: {
      value: round2(supplementaryPartA),
      description: "Το ποσό της επικουρικής που προκύπτει από το Part A."
    },

    partBInput: {
      value: {
        yearsFrom2015Count: yearStats.length,
        totalPartBBaseContributions: round2(totalPartBBaseContributions),
        categoryExtraRate: round2(categoryExtraRate * 100),
        differentCategoryDaysAfter2015: round2(differentCategoryDaysAfter2015),
        extraCategoryContributions: round2(extraCategoryContributions),
        totalPartBContributions: round2(totalPartBContributions),
      },
      description: "Στοιχεία εισόδου για το Part B, δηλαδή το κεφαλαιοποιητικό τμήμα από το 2015 και μετά."
    },

    partBPerYear: {
      value: yearStats.map((item) => ({
        year: item.year,
        rawDays: round2(item.rawDays),
        cappedAmount: round2(item.cappedAmount),
        baseRate: round2(item.baseRate * 100),
        revalFactor: round2(item.revalFactor),
        revaluedAmount: round2(item.revaluedAmount),
        revaluedDaily: round2(item.revaluedDaily),
        neutralizedDays: round2(neutralizedByYear.get(item.year) ?? 0),
        premiumEligibleDays: round2(item.rawDays - (neutralizedByYear.get(item.year) ?? 0)),
      })),
      description: "Ανάλυση ανά έτος για το Part B: ποσό, συντελεστής, αναπροσαρμογή και τυχόν ουδετεροποίηση ημερών."
    },

    gFactorData: {
      value: {
        birthYear,
        pensionYear,
        ageAtExit,
        gFactor: round2(gFactor),
      },
      description: "Στοιχεία ηλικίας εξόδου και συντελεστή G που μετατρέπει το κεφάλαιο σε μηνιαία παροχή."
    },

    partBResult: {
      value: round2(supplementaryPartB),
      description: "Το ποσό της επικουρικής που προκύπτει από το Part B."
    },

    finalResult: {
      value: round2(totalSupplementary),
      description: "Το συνολικό ποσό επικουρικής σύνταξης (Part A + Part B)."
    }
  }
};
}
module.exports = { calculateDeiSupplementary };