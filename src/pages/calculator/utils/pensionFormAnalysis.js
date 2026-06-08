const INSURANCE_DAYS_PER_YEAR = 300;
const INSURANCE_DAYS_PER_MONTH = 25;
const MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION = 15;
const MAX_EARLY_REDUCTION_MONTHS = 60;

const PENSION_TYPE_OPTIONS = {
  old_age: {
    value: 'old_age',
    label: 'Γήρατος',
  },
  disability: {
    value: 'disability',
    label: 'Αναπηρίας',
  },
};

const OLD_AGE_CATEGORY_OPTIONS = {
  standard: {
    value: 'standard',
    label: 'Κανονική σύνταξη γήρατος',
  },
  special_disease: {
    value: 'special_disease',
    label: 'Γήρατος λόγω ειδικών παθήσεων',
  },
};

const PENSION_MODE_OPTIONS = {
  full: {
    value: 'full',
    label: 'Πλήρης',
  },
  reduced: {
    value: 'reduced',
    label: 'Μειωμένη',
  },
};

const DISABILITY_CATEGORY_OPTIONS = {
  eighty_plus: {
    value: 'eighty_plus',
    label: '80% και άνω',
    disabilityPercentage: 80,
  },
  sixty_seven_to_seventy_nine: {
    value: 'sixty_seven_to_seventy_nine',
    label: '67% έως 79,99%',
    disabilityPercentage: 67,
  },
  fifty_to_sixty_six: {
    value: 'fifty_to_sixty_six',
    label: '50% έως 66,99%',
    disabilityPercentage: 50,
  },
};

const INSURANCE_TIME_INPUT_METHOD_OPTIONS = {
  insurance_days: {
    value: 'insurance_days',
    label: 'Με αριθμό ενσήμων / ημερών ασφάλισης',
  },
  years_months_days: {
    value: 'years_months_days',
    label: 'Με έτη, μήνες και ημέρες',
  },
};

const CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS = {
  average_monthly: {
    value: 'average_monthly',
    label: 'Έτοιμος μέσος μηνιαίος συντάξιμος μισθός',
  },
  yearly_earnings: {
    value: 'yearly_earnings',
    label: 'Αποδοχές και ένσημα ανά έτος',
  },
};

function analyzePensionForm({
  currentFormStep = 'main',
  pensionStartDateInput,
  pensionTypeInput,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  disabilityCategoryInput,
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  residenceYearsInput,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
  yearlyEarningsRows,
}) {
  const dateAnalysis = analyzePensionStartDate(pensionStartDateInput);
  const pensionTypeAnalysis = analyzePensionType(pensionTypeInput);
  const oldAgeAnalysis = analyzeOldAgeInputs({
    pensionType: pensionTypeAnalysis.pensionType,
    oldAgeCategoryInput,
    pensionModeInput,
    earlyReductionMonthsInput,
    residenceYearsInput,
  });
  const disabilityAnalysis = analyzeDisabilityInputs({
    pensionType: pensionTypeAnalysis.pensionType,
    disabilityCategoryInput,
  });
  const insuranceTimeAnalysis = analyzeInsuranceTime({
    insuranceTimeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
  });
  const contributoryAnalysis = analyzeContributoryPensionInputs({
    currentFormStep,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  });

  const errors = [
    dateAnalysis.error,
    pensionTypeAnalysis.error,
    oldAgeAnalysis.error,
    disabilityAnalysis.error,
    insuranceTimeAnalysis.error,
    contributoryAnalysis.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      isReady: false,
      error: errors[0],
      requiresContributoryYearlyStep:
        contributoryAnalysis.requiresContributoryYearlyStep === true,
    };
  }

  const isReady =
    dateAnalysis.hasValue &&
    pensionTypeAnalysis.hasValue &&
    oldAgeAnalysis.hasValue &&
    disabilityAnalysis.hasValue &&
    insuranceTimeAnalysis.hasValue &&
    contributoryAnalysis.hasValue;

  if (!isReady) {
    return {
      isReady: false,
      error: null,
      requiresContributoryYearlyStep:
        contributoryAnalysis.requiresContributoryYearlyStep === true,
    };
  }

  const warnings = [
    ...oldAgeAnalysis.warnings,
    ...disabilityAnalysis.warnings,
    ...insuranceTimeAnalysis.warnings,
    ...contributoryAnalysis.warnings,
  ];

  const calculationInput = {
    generalInfoData: {
      pensionDate: dateAnalysis.pensionDate,
      pensionYear: dateAnalysis.pensionYear,
      pensionType: pensionTypeAnalysis.pensionType,

      oldAgeCategory: oldAgeAnalysis.oldAgeCategory,
      pensionMode: oldAgeAnalysis.pensionMode,
      earlyReductionMonths: oldAgeAnalysis.earlyReductionMonths,
      residenceYears: oldAgeAnalysis.residenceYears,
      isSpecialDiseaseOldAgeCase: oldAgeAnalysis.isSpecialDiseaseOldAgeCase,
      ignoreResidenceFortyYearPenalty:
        oldAgeAnalysis.ignoreResidenceFortyYearPenalty,

      disabilityCategory: disabilityAnalysis.disabilityCategory,
      disabilityPercentage: disabilityAnalysis.disabilityPercentage,

      insuranceTimeInputMethod: insuranceTimeAnalysis.insuranceTimeInputMethod,
      totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
      totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
      totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
      totalInsuranceDaysEquivalent:
        insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
      totalInsuranceDecimalYears:
        insuranceTimeAnalysis.totalInsuranceDecimalYears,
    },
    contributoryPensionData: contributoryAnalysis.contributoryPensionData,
  };

  return {
    isReady: true,
    error: null,
    warnings,
    requiresContributoryYearlyStep:
      contributoryAnalysis.requiresContributoryYearlyStep === true,

    displayDate: dateAnalysis.displayDate,
    pensionYear: dateAnalysis.pensionYear,

    pensionType: pensionTypeAnalysis.pensionType,
    pensionTypeLabel: pensionTypeAnalysis.pensionTypeLabel,

    oldAgeCategory: oldAgeAnalysis.oldAgeCategory,
    oldAgeCategoryLabel: oldAgeAnalysis.oldAgeCategoryLabel,
    pensionMode: oldAgeAnalysis.pensionMode,
    pensionModeLabel: oldAgeAnalysis.pensionModeLabel,
    earlyReductionMonths: oldAgeAnalysis.earlyReductionMonths,
    residenceYears: oldAgeAnalysis.residenceYears,
    isSpecialDiseaseOldAgeCase: oldAgeAnalysis.isSpecialDiseaseOldAgeCase,

    disabilityCategory: disabilityAnalysis.disabilityCategory,
    disabilityCategoryLabel: disabilityAnalysis.disabilityCategoryLabel,
    disabilityPercentage: disabilityAnalysis.disabilityPercentage,

    insuranceTimeInputMethod: insuranceTimeAnalysis.insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      insuranceTimeAnalysis.insuranceTimeInputMethodLabel,
    insuranceTimeDisplay: insuranceTimeAnalysis.insuranceTimeDisplay,
    totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
    totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
    totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
    totalInsuranceDaysEquivalent:
      insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
    totalInsuranceDecimalYears:
      insuranceTimeAnalysis.totalInsuranceDecimalYears,

    contributoryEarningsInputMethod:
      contributoryAnalysis.contributoryEarningsInputMethod,
    contributoryEarningsInputMethodLabel:
      contributoryAnalysis.contributoryEarningsInputMethodLabel,
    averageMonthlyPensionableEarnings:
      contributoryAnalysis.averageMonthlyPensionableEarnings,
    yearsData: contributoryAnalysis.yearsData,
    yearlyEarningsRowsCount: contributoryAnalysis.yearsData.length,

    calculationInput,
  };
}

function analyzePensionStartDate(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const parsedInput = parseGreekDateInput(trimmedValue);

  if (!parsedInput.isValidFormat) {
    return {
      hasValue: true,
      error:
        'Συμπληρώστε έγκυρη ημερομηνία, π.χ. 1/1/26, 1/1/2026 ή 01012026.',
    };
  }

  const { day, month, year } = parsedInput;
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  if (!isRealDate) {
    return {
      hasValue: true,
      error: 'Η ημερομηνία που δόθηκε δεν είναι πραγματική.',
    };
  }

  const currentYear = new Date().getFullYear();
  const earliestAllowedYear = currentYear - 1;

  if (year < earliestAllowedYear) {
    return {
      hasValue: true,
      error: `Η εφαρμογή υποστηρίζει ημερομηνίες από το ${earliestAllowedYear} και μετά.`,
    };
  }

  return {
    hasValue: true,
    error: null,
    displayDate: formatGreekDate(day, month, year),
    pensionDate: formatIsoDate(day, month, year),
    pensionYear: year,
  };
}

function analyzePensionType(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return {
      hasValue: false,
      error: null,
      pensionType: null,
    };
  }

  if (!PENSION_TYPE_OPTIONS[normalizedValue]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο είδος σύνταξης.',
      pensionType: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    pensionType: normalizedValue,
    pensionTypeLabel: PENSION_TYPE_OPTIONS[normalizedValue].label,
  };
}

function analyzeOldAgeInputs({
  pensionType,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  residenceYearsInput,
}) {
  if (!pensionType) {
    return createInactiveOldAgeAnalysis(false);
  }

  if (pensionType !== 'old_age') {
    return createInactiveOldAgeAnalysis(true);
  }

  const oldAgeCategory = String(oldAgeCategoryInput || '').trim();

  if (!OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρη κατηγορία σύνταξης γήρατος.',
      warnings: [],
    };
  }

  const residenceResult = analyzeResidenceYears(residenceYearsInput);

  if (residenceResult.error) {
    return {
      hasValue: true,
      error: residenceResult.error,
      warnings: [],
    };
  }

  if (!residenceResult.hasValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const warnings = [...residenceResult.warnings];

  if (oldAgeCategory === 'special_disease') {
    return {
      hasValue: true,
      error: null,
      warnings,
      oldAgeCategory,
      oldAgeCategoryLabel: OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory].label,
      pensionMode: 'full',
      pensionModeLabel: null,
      earlyReductionMonths: 0,
      residenceYears: residenceResult.residenceYears,
      isSpecialDiseaseOldAgeCase: true,
      ignoreResidenceFortyYearPenalty: true,
    };
  }

  const pensionMode = String(pensionModeInput || '').trim();

  if (!pensionMode) {
    return {
      hasValue: false,
      error: null,
      warnings,
    };
  }

  if (!PENSION_MODE_OPTIONS[pensionMode]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε αν η σύνταξη γήρατος είναι πλήρης ή μειωμένη.',
      warnings,
    };
  }

  const earlyReductionResult = analyzeEarlyReductionMonths({
    pensionMode,
    earlyReductionMonthsInput,
  });

  if (earlyReductionResult.error) {
    return {
      hasValue: true,
      error: earlyReductionResult.error,
      warnings,
    };
  }

  if (!earlyReductionResult.hasValue) {
    return {
      hasValue: false,
      error: null,
      warnings,
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    oldAgeCategory,
    oldAgeCategoryLabel: OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory].label,
    pensionMode,
    pensionModeLabel: PENSION_MODE_OPTIONS[pensionMode].label,
    earlyReductionMonths: earlyReductionResult.earlyReductionMonths,
    residenceYears: residenceResult.residenceYears,
    isSpecialDiseaseOldAgeCase: false,
    ignoreResidenceFortyYearPenalty: false,
  };
}

function createInactiveOldAgeAnalysis(hasValue) {
  return {
    hasValue,
    error: null,
    warnings: [],
    oldAgeCategory: null,
    oldAgeCategoryLabel: null,
    pensionMode: null,
    pensionModeLabel: null,
    earlyReductionMonths: 0,
    residenceYears: null,
    isSpecialDiseaseOldAgeCase: false,
    ignoreResidenceFortyYearPenalty: false,
  };
}

function analyzeEarlyReductionMonths({ pensionMode, earlyReductionMonthsInput }) {
  if (pensionMode !== 'reduced') {
    return {
      hasValue: true,
      error: null,
      earlyReductionMonths: 0,
    };
  }

  const trimmedMonths = String(earlyReductionMonthsInput || '').trim();

  if (!trimmedMonths) {
    return {
      hasValue: false,
      error: null,
      earlyReductionMonths: null,
    };
  }

  const monthsResult = parseNonNegativeInteger(trimmedMonths);

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι μήνες πρόωρης μείωσης πρέπει να είναι ακέραιος αριθμός.',
      earlyReductionMonths: null,
    };
  }

  if (monthsResult.value > MAX_EARLY_REDUCTION_MONTHS) {
    return {
      hasValue: true,
      error: 'Οι μήνες πρόωρης μείωσης πρέπει να είναι από 0 έως 60.',
      earlyReductionMonths: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    earlyReductionMonths: monthsResult.value,
  };
}

function analyzeDisabilityInputs({ pensionType, disabilityCategoryInput }) {
  if (!pensionType) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  if (pensionType !== 'disability') {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  const disabilityCategory = String(disabilityCategoryInput || '').trim();

  if (!disabilityCategory) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  if (!DISABILITY_CATEGORY_OPTIONS[disabilityCategory]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρη κατηγορία αναπηρίας.',
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings: [],
    disabilityCategory,
    disabilityCategoryLabel: DISABILITY_CATEGORY_OPTIONS[disabilityCategory].label,
    disabilityPercentage:
      DISABILITY_CATEGORY_OPTIONS[disabilityCategory].disabilityPercentage,
  };
}

function analyzeInsuranceTime({
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
}) {
  const normalizedMethod = String(insuranceTimeInputMethod || '').trim();

  if (!normalizedMethod) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  if (!INSURANCE_TIME_INPUT_METHOD_OPTIONS[normalizedMethod]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο τρόπο εισαγωγής χρόνου ασφάλισης.',
      warnings: [],
    };
  }

  if (normalizedMethod === 'insurance_days') {
    return analyzeInsuranceDaysInput({
      insuranceDaysInput,
      insuranceTimeInputMethod: normalizedMethod,
    });
  }

  return analyzeYearsMonthsDaysInsuranceInput({
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
    insuranceTimeInputMethod: normalizedMethod,
  });
}

function analyzeInsuranceDaysInput({
  insuranceDaysInput,
  insuranceTimeInputMethod,
}) {
  const trimmedDays = String(insuranceDaysInput || '').trim();

  if (!trimmedDays) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const daysResult = parseNonNegativeInteger(trimmedDays);

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (daysResult.value <= 0) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι περισσότερα από 0.',
      warnings: [],
    };
  }

  const displayTime = convertInsuranceDaysToDisplayTime(daysResult.value);
  const decimalYears = roundToDecimals(
    daysResult.value / INSURANCE_DAYS_PER_YEAR,
    6
  );

  return {
    hasValue: true,
    error: null,
    warnings: [],

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: 0,
    totalInsuranceMonths: 0,
    totalInsuranceDays: daysResult.value,
    totalInsuranceDaysEquivalent: daysResult.value,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay:
      `${daysResult.value} ένσημα / ημέρες ασφάλισης ` +
      `(${displayTime.years} έτη, ${displayTime.months} μήνες, ${displayTime.days} ημέρες)`,
  };
}

function analyzeYearsMonthsDaysInsuranceInput({
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  insuranceTimeInputMethod,
}) {
  const yearsText = String(insuranceYearsInput || '').trim();
  const monthsText = String(insuranceMonthsInput || '').trim();
  const daysText = String(insuranceExtraDaysInput || '').trim();

  const hasAnyTimeValue = Boolean(yearsText || monthsText || daysText);

  if (!hasAnyTimeValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const yearsResult = parseNonNegativeIntegerOrEmpty(yearsText);
  const monthsResult = parseNonNegativeIntegerOrEmpty(monthsText);
  const daysResult = parseNonNegativeIntegerOrEmpty(daysText);

  if (!yearsResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα έτη ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  const years = yearsResult.value;
  const months = monthsResult.value;
  const days = daysResult.value;

  if (months > 11) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι από 0 έως 11.',
      warnings: [],
    };
  }

  if (days > 24) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι από 0 έως 24.',
      warnings: [],
    };
  }

  if (years === 0 && months === 0 && days === 0) {
    return {
      hasValue: true,
      error: 'Ο χρόνος ασφάλισης πρέπει να είναι μεγαλύτερος από 0.',
      warnings: [],
    };
  }

  const totalDays =
    years * INSURANCE_DAYS_PER_YEAR +
    months * INSURANCE_DAYS_PER_MONTH +
    days;

  const decimalYears = roundToDecimals(totalDays / INSURANCE_DAYS_PER_YEAR, 6);

  return {
    hasValue: true,
    error: null,
    warnings: [],

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: years,
    totalInsuranceMonths: months,
    totalInsuranceDays: days,
    totalInsuranceDaysEquivalent: totalDays,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay: `${years} έτη, ${months} μήνες, ${days} ημέρες`,
  };
}

function analyzeResidenceYears(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const numberResult = parseNonNegativeDecimal(trimmedValue);

  if (!numberResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα έτη νόμιμης διαμονής πρέπει να είναι αριθμός.',
      warnings: [],
    };
  }

  const residenceYears = roundToDecimals(numberResult.value, 4);
  const warnings = [];

  if (
    residenceYears <
    MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION
  ) {
    warnings.push(
      'Με αυτά τα έτη νόμιμης διαμονής δεν δικαιούται εθνική σύνταξη.'
    );
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    residenceYears,
  };
}

function analyzeContributoryPensionInputs({
  currentFormStep,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
  yearlyEarningsRows,
}) {
  const method = String(contributoryEarningsInputMethod || '').trim();

  if (!method) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      requiresContributoryYearlyStep: false,
      contributoryEarningsInputMethod: null,
      contributoryEarningsInputMethodLabel: null,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: null,
    };
  }

  if (!CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο τρόπο εισαγωγής συντάξιμων αποδοχών.',
      warnings: [],
      requiresContributoryYearlyStep: false,
    };
  }

  if (method === 'average_monthly') {
    return analyzeAverageMonthlyPensionableEarnings({
      averageMonthlyPensionableEarningsInput,
      method,
    });
  }

  return analyzeYearlyEarnings({
    currentFormStep,
    yearlyEarningsRows,
    method,
  });
}

function analyzeAverageMonthlyPensionableEarnings({
  averageMonthlyPensionableEarningsInput,
  method,
}) {
  const trimmedValue = String(averageMonthlyPensionableEarningsInput || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      requiresContributoryYearlyStep: false,
      contributoryEarningsInputMethod: method,
      contributoryEarningsInputMethodLabel:
        CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method].label,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
      },
    };
  }

  const amountResult = parseNonNegativeDecimal(trimmedValue);

  if (!amountResult.isValid) {
    return {
      hasValue: true,
      error: 'Ο μέσος μηνιαίος συντάξιμος μισθός πρέπει να είναι αριθμός.',
      warnings: [],
      requiresContributoryYearlyStep: false,
    };
  }

  if (amountResult.value <= 0) {
    return {
      hasValue: true,
      error: 'Ο μέσος μηνιαίος συντάξιμος μισθός πρέπει να είναι μεγαλύτερος από 0.',
      warnings: [],
      requiresContributoryYearlyStep: false,
    };
  }

  const amount = roundToDecimals(amountResult.value, 2);

  return {
    hasValue: true,
    error: null,
    warnings: [],
    requiresContributoryYearlyStep: false,
    contributoryEarningsInputMethod: method,
    contributoryEarningsInputMethodLabel:
      CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method].label,
    averageMonthlyPensionableEarnings: amount,
    yearsData: [],
    contributoryPensionData: {
      earningsInputMethod: method,
      averageMonthlyPensionableEarnings: amount,
    },
  };
}

function analyzeYearlyEarnings({
  currentFormStep,
  yearlyEarningsRows,
  method,
}) {
  if (currentFormStep !== 'contributory_yearly') {
    return {
      hasValue: true,
      error: null,
      warnings: [
        'Η αναλυτική εισαγωγή αποδοχών θα συμπληρωθεί στο επόμενο βήμα.',
      ],
      requiresContributoryYearlyStep: true,
      contributoryEarningsInputMethod: method,
      contributoryEarningsInputMethodLabel:
        CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method].label,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
      },
    };
  }

  const normalizedRows = normalizeYearlyEarningsRows(yearlyEarningsRows);

  if (normalizedRows.error) {
    return {
      hasValue: true,
      error: normalizedRows.error,
      warnings: [],
      requiresContributoryYearlyStep: true,
    };
  }

  if (normalizedRows.yearsData.length === 0) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      requiresContributoryYearlyStep: true,
      contributoryEarningsInputMethod: method,
      contributoryEarningsInputMethodLabel:
        CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method].label,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
      },
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings: [],
    requiresContributoryYearlyStep: true,
    contributoryEarningsInputMethod: method,
    contributoryEarningsInputMethodLabel:
      CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS[method].label,
    averageMonthlyPensionableEarnings: null,
    yearsData: normalizedRows.yearsData,
    contributoryPensionData: {
      earningsInputMethod: method,
      yearsData: normalizedRows.yearsData,
    },
  };
}

function normalizeYearlyEarningsRows(rows) {
  if (!Array.isArray(rows)) {
    return {
      error: 'Τα ετήσια στοιχεία αποδοχών δεν έχουν σωστή μορφή.',
      yearsData: [],
    };
  }

  const yearsData = [];

  for (const row of rows) {
    const yearText = String(row.year || '').trim();
    const earningsText = String(row.annualEarnings || '').trim();
    const daysText = String(row.insuranceDays || '').trim();

    const hasAnyValue = Boolean(yearText || earningsText || daysText);
    const hasUsefulValue = Boolean(earningsText || daysText);

    if (!hasAnyValue || !hasUsefulValue) {
      continue;
    }

    const yearResult = parseNonNegativeInteger(yearText);

    if (!yearResult.isValid || yearResult.value < 2002) {
      return {
        error: 'Κάθε γραμμή αποδοχών πρέπει να έχει έγκυρο έτος από το 2002 και μετά.',
        yearsData: [],
      };
    }

    const earningsResult = parseNonNegativeDecimal(earningsText);

    if (!earningsResult.isValid) {
      return {
        error: `Οι ετήσιες αποδοχές για το έτος ${yearText} πρέπει να είναι αριθμός.`,
        yearsData: [],
      };
    }

    if (earningsResult.value <= 0) {
      return {
        error: `Οι ετήσιες αποδοχές για το έτος ${yearText} πρέπει να είναι μεγαλύτερες από 0.`,
        yearsData: [],
      };
    }

    const daysResult = parseNonNegativeInteger(daysText);

    if (!daysResult.isValid) {
      return {
        error: `Τα ένσημα / ημέρες για το έτος ${yearText} πρέπει να είναι ακέραιος αριθμός.`,
        yearsData: [],
      };
    }

    if (daysResult.value <= 0) {
      return {
        error: `Τα ένσημα / ημέρες για το έτος ${yearText} πρέπει να είναι περισσότερα από 0.`,
        yearsData: [],
      };
    }

    yearsData.push({
      year: yearResult.value,
      annualEarnings: roundToDecimals(earningsResult.value, 2),
      insuranceDays: daysResult.value,
    });
  }

  return {
    error: null,
    yearsData,
  };
}

function parseNonNegativeInteger(value) {
  const text = String(value || '').trim();

  if (!/^\d+$/.test(text)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(text),
  };
}

function parseNonNegativeIntegerOrEmpty(value) {
  const text = String(value || '').trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  return parseNonNegativeInteger(text);
}

function parseNonNegativeDecimal(value) {
  const normalizedText = String(value || '').trim().replace(',', '.');

  if (!/^\d+(\.\d+)?$/.test(normalizedText)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(normalizedText),
  };
}

function convertInsuranceDaysToDisplayTime(totalDays) {
  const safeTotalDays = Number(totalDays || 0);

  const years = Math.floor(safeTotalDays / INSURANCE_DAYS_PER_YEAR);
  const remainingDaysAfterYears = safeTotalDays % INSURANCE_DAYS_PER_YEAR;

  const months = Math.floor(
    remainingDaysAfterYears / INSURANCE_DAYS_PER_MONTH
  );

  const days = remainingDaysAfterYears % INSURANCE_DAYS_PER_MONTH;

  return {
    years,
    months,
    days,
  };
}

function parseGreekDateInput(value) {
  const normalizedValue = String(value || '').trim();

  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/
  );

  if (separatedDateMatch) {
    return {
      isValidFormat: true,
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: normalizeYear(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, '');

  if (digitsOnly.length === 8) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: Number(digitsOnly.slice(4, 8)),
    };
  }

  if (digitsOnly.length === 6) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: normalizeYear(digitsOnly.slice(4, 6)),
    };
  }

  return {
    isValidFormat: false,
  };
}

function normalizeYear(value) {
  const yearText = String(value || '').trim();

  if (yearText.length === 4) {
    return Number(yearText);
  }

  const twoDigitYear = Number(yearText);

  if (twoDigitYear >= 0 && twoDigitYear <= 69) {
    return 2000 + twoDigitYear;
  }

  return 1900 + twoDigitYear;
}

function formatGreekDate(day, month, year) {
  return `${padTwoDigits(day)}/${padTwoDigits(month)}/${year}`;
}

function formatIsoDate(day, month, year) {
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(day)}`;
}

function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export {
  analyzePensionForm,
};
