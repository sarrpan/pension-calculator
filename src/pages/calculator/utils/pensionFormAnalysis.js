const INSURANCE_DAYS_PER_YEAR = 300;
const INSURANCE_DAYS_PER_MONTH = 25;
const MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION = 15;
const MAX_EARLY_REDUCTION_MONTHS = 60;
const MAX_INSURANCE_PERIOD_GROUPS = 10;

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


const CALCULATOR_EDITION_OPTIONS = {
  professional: 'professional',
  free: 'free',
};

const ARTICLE30_SPECIAL_REGIME_USAGE_OPTIONS = {
  yes: 'yes',
  no: 'no',
  unknown: 'unknown',
};

const INSURANCE_PERIODS_INPUT_MODE_OPTIONS = {
  disabled: {
    value: 'disabled',
    label: 'Δεν δηλώθηκε κατηγορία συνολικού χρόνου ασφάλισης',
  },
  simple: {
    value: 'simple',
    label: 'Μία κατηγορία ασφάλισης',
  },
  multiple: {
    value: 'multiple',
    label: 'Περισσότερες κατηγορίες / περίοδοι',
  },
};

const INSURANCE_PERIOD_FUND_OPTIONS = {
  ika: {
    value: 'ika',
    label: 'ΙΚΑ / e-ΕΦΚΑ μισθωτών',
  },
  public_sector: {
    value: 'public_sector',
    label: 'Δημόσιο (γενική κατηγορία)',
  },
  ota: {
    value: 'ota',
    label: 'ΟΤΑ / υπηρεσίες καθαριότητας και υγιεινής',
  },
  uniformed: {
    value: 'uniformed',
    label: 'Ένστολοι / στρατιωτικοί',
  },
  tap_dei: {
    value: 'tap_dei',
    label: 'ΤΑΠ-ΔΕΗ',
  },
  ika_tsp_hsap: {
    value: 'ika_tsp_hsap',
    label: 'τ. ΤΣΠ-ΗΣΑΠ',
  },
  ika_tsp_ete: {
    value: 'ika_tsp_ete',
    label: 'τ. ΤΣΠ-ΕΤΕ',
  },
  ika_tap_etba: {
    value: 'ika_tap_etba',
    label: 'τ. ΤΑΠ-ΕΤΒΑ',
  },
  tapae_ethniki: {
    value: 'tapae_ethniki',
    label: 'ΤΑΠΑΕ «Η Εθνική»',
  },
  tseapgso: {
    value: 'tseapgso',
    label: 'τ. ΤΣΕΑΠΓΣΟ',
  },
  ika_tap_ote_ote: {
    value: 'ika_tap_ote_ote',
    label: 'τ. ΤΑΠ-ΟΤΕ — ΟΤΕ',
  },
  ika_tap_ote_ose_elta: {
    value: 'ika_tap_ote_ose_elta',
    label: 'τ. ΤΑΠ-ΟΤΕ — ΟΣΕ / ΕΛΤΑ',
  },
  ika_tap_ote_staff: {
    value: 'ika_tap_ote_staff',
    label: 'τ. ΤΑΠ-ΟΤΕ — υπάλληλοι τ. ΤΑΠΟΤΕ',
  },
  ika_npdd_special: {
    value: 'ika_npdd_special',
    label: 'Τακτικοί υπάλληλοι ΙΚΑ / ΝΠΔΔ ειδικού καθεστώτος',
  },
  etap_mme_tattath: {
    value: 'etap_mme_tattath',
    label: 'ΕΤΑΠ-ΜΜΕ / πρώην ΤΑΤΤΑΘ',
  },
  tanpy: {
    value: 'tanpy',
    label: 'ΤΑΝΠΥ / έμμισθοι ναυτικοί πράκτορες',
  },
  deko: {
    value: 'deko',
    label: 'Άλλη ΔΕΚΟ / οργανισμός κοινής ωφέλειας',
  },
  nat: {
    value: 'nat',
    label: 'ΝΑΤ / ναυτικοί',
  },
  aviation: {
    value: 'aviation',
    label: 'Αεροπορικές / ΥΠΑ / χειριστές',
  },
  artistic: {
    value: 'artistic',
    label: 'Καλλιτεχνικές κατηγορίες',
  },
  banking_funds: {
    value: 'banking_funds',
    label: 'Άλλο τραπεζικό ταμείο / συνεταιρισμός',
  },
  oaee: {
    value: 'oaee',
    label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας',
  },
  etaa: {
    value: 'etaa',
    label: 'Πρώην ΕΤΑΑ',
  },
  tsmede: {
    value: 'tsmede',
    label: 'ΤΣΜΕΔΕ',
  },
  tsay: {
    value: 'tsay',
    label: 'ΤΣΑΥ',
  },
  oga: {
    value: 'oga',
    label: 'Πρώην ΟΓΑ / αγρότης',
  },
};

const INSURED_TYPE_OPTIONS = {
  old: {
    value: 'old',
    label: 'Παλαιός',
  },
  new: {
    value: 'new',
    label: 'Νέος',
  },
  not_applicable: {
    value: 'not_applicable',
    label: 'Δεν απαιτείται για αυτή την κατηγορία',
  },
};

const EMPLOYMENT_CATEGORY_OPTIONS = {
  common: {
    value: 'common',
    label: 'Απλή / κοινή ασφάλιση',
  },
  vae: {
    value: 'vae',
    label: 'ΒΑΕ',
  },
  yvae: {
    value: 'yvae',
    label: 'ΥΒΑΕ / ειδικού κινδύνου',
  },
  ota_cleaning: {
    value: 'ota_cleaning',
    label: 'Καθαριότητα / υγιεινή ΟΤΑ',
  },
  contributions: {
    value: 'contributions',
    label: 'Με εισφορές / ασφαλιστική κατηγορία',
  },
};

const SIMPLE_VAE_YVAE_FUNDS = [
  'ika',
  'tap_dei',
];

const OTA_CLEANING_FUNDS = [
  'ota',
];


const ARTICLE30_MAIN_CONTRIBUTION_FUNDS = [
  'ika_tsp_hsap',
  'ika_tsp_ete',
  'ika_tap_etba',
  'tapae_ethniki',
  'tseapgso',
  'ika_tap_ote_ote',
  'ika_tap_ote_ose_elta',
  'ika_tap_ote_staff',
  'aviation',
  'artistic',
  'ika_npdd_special',
  'etap_mme_tattath',
  'tanpy',
];


const CONTRIBUTION_BASED_FUNDS = [
  'oaee',
  'etaa',
  'tsmede',
  'tsay',
  'oga',
];

function analyzePensionForm({
  currentFormStep = 'main',
  calculatorEdition = 'professional',
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
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleFromDateInput,
  simpleToDateInput,
  simpleTimeInputMethod,
  simpleInsuranceDaysInput,
  simpleInsuranceYearsInput,
  simpleInsuranceMonthsInput,
  simpleInsuranceExtraDaysInput,
  simpleUniformedSpecialTimeDraft,
  article30SpecialRegimeUsageInput,
  insurancePeriodGroups,
  multiPeriodTimeInputMethod,
  multiPeriodInsuranceDaysInput,
  multiPeriodInsuranceYearsInput,
  multiPeriodInsuranceMonthsInput,
  multiPeriodInsuranceExtraDaysInput,
  multiPeriodFundInput,
  multiPeriodInsuredTypeInput,
  multiPeriodEmploymentCategoryInput,
  multiPeriod2TimeInputMethod,
  multiPeriod2InsuranceDaysInput,
  multiPeriod2InsuranceYearsInput,
  multiPeriod2InsuranceMonthsInput,
  multiPeriod2InsuranceExtraDaysInput,
  multiPeriod2FundInput,
  multiPeriod2InsuredTypeInput,
  multiPeriod2EmploymentCategoryInput,
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
  const insurancePeriodsAnalysis = analyzeInsurancePeriodsDraft({
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleInsuredTypeInput,
    simpleEmploymentCategoryInput,
    simpleFromDateInput,
    simpleToDateInput,
    simpleTimeInputMethod,
    simpleInsuranceDaysInput,
    simpleInsuranceYearsInput,
    simpleInsuranceMonthsInput,
    simpleInsuranceExtraDaysInput,
    simpleUniformedSpecialTimeDraft,
    insurancePeriodGroups,
    multiPeriodTimeInputMethod,
    multiPeriodInsuranceDaysInput,
    multiPeriodInsuranceYearsInput,
    multiPeriodInsuranceMonthsInput,
    multiPeriodInsuranceExtraDaysInput,
    multiPeriodFundInput,
    multiPeriodInsuredTypeInput,
    multiPeriodEmploymentCategoryInput,
    multiPeriod2TimeInputMethod,
    multiPeriod2InsuranceDaysInput,
    multiPeriod2InsuranceYearsInput,
    multiPeriod2InsuranceMonthsInput,
    multiPeriod2InsuranceExtraDaysInput,
    multiPeriod2FundInput,
    multiPeriod2InsuredTypeInput,
    multiPeriod2EmploymentCategoryInput,
    insuranceTimeAnalysis,
  });
  const contributoryAnalysis = analyzeContributoryPensionInputs({
    currentFormStep,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  });

  const isMultipleInsuranceMode =
    insurancePeriodsAnalysis.insurancePeriodsInputMode === 'multiple';

  const effectiveInsuranceTimeAnalysis =
    insurancePeriodsAnalysis.totalInsuranceTimeAnalysis || insuranceTimeAnalysis;

  const article30SpecialRegimeAnalysis = analyzeArticle30SpecialRegimeUsage({
    calculatorEdition,
    article30SpecialRegimeUsageInput,
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft,
  });

  const errors = [
    dateAnalysis.error,
    pensionTypeAnalysis.error,
    oldAgeAnalysis.error,
    disabilityAnalysis.error,
    isMultipleInsuranceMode ? null : insuranceTimeAnalysis.error,
    insurancePeriodsAnalysis.error,
    article30SpecialRegimeAnalysis.error,
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
    effectiveInsuranceTimeAnalysis.hasValue &&
    insurancePeriodsAnalysis.hasValue &&
    article30SpecialRegimeAnalysis.hasValue &&
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
    ...insurancePeriodsAnalysis.warnings,
    ...article30SpecialRegimeAnalysis.warnings,
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

      insuranceTimeInputMethod: effectiveInsuranceTimeAnalysis.insuranceTimeInputMethod,
      totalInsuranceYears: effectiveInsuranceTimeAnalysis.totalInsuranceYears,
      totalInsuranceMonths: effectiveInsuranceTimeAnalysis.totalInsuranceMonths,
      totalInsuranceDays: effectiveInsuranceTimeAnalysis.totalInsuranceDays,
      totalInsuranceDaysEquivalent:
        effectiveInsuranceTimeAnalysis.totalInsuranceDaysEquivalent,
      totalInsuranceDecimalYears:
        effectiveInsuranceTimeAnalysis.totalInsuranceDecimalYears,
    },
    contributoryPensionData: contributoryAnalysis.contributoryPensionData,
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft.map(
      createBackendSafeInsurancePeriodDraft
    ),
    article30SpecialRegimeData:
      article30SpecialRegimeAnalysis.article30SpecialRegimeData,
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

    insuranceTimeInputMethod: effectiveInsuranceTimeAnalysis.insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      effectiveInsuranceTimeAnalysis.insuranceTimeInputMethodLabel,
    insuranceTimeDisplay: effectiveInsuranceTimeAnalysis.insuranceTimeDisplay,
    totalInsuranceYears: effectiveInsuranceTimeAnalysis.totalInsuranceYears,
    totalInsuranceMonths: effectiveInsuranceTimeAnalysis.totalInsuranceMonths,
    totalInsuranceDays: effectiveInsuranceTimeAnalysis.totalInsuranceDays,
    totalInsuranceDaysEquivalent:
      effectiveInsuranceTimeAnalysis.totalInsuranceDaysEquivalent,
    totalInsuranceDecimalYears:
      effectiveInsuranceTimeAnalysis.totalInsuranceDecimalYears,

    insurancePeriodsInputMode:
      insurancePeriodsAnalysis.insurancePeriodsInputMode,
    insurancePeriodsInputModeLabel:
      insurancePeriodsAnalysis.insurancePeriodsInputModeLabel,
    insurancePeriodsDraft:
      insurancePeriodsAnalysis.insurancePeriodsDraft,
    insurancePeriodsDraftCount:
      insurancePeriodsAnalysis.insurancePeriodsDraft.length,
    insurancePeriodDraftDisplay:
      insurancePeriodsAnalysis.insurancePeriodDraftDisplay,

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


function analyzeArticle30SpecialRegimeUsage({
  calculatorEdition,
  article30SpecialRegimeUsageInput,
  insurancePeriodsDraft,
}) {
  const normalizedEdition =
    calculatorEdition === CALCULATOR_EDITION_OPTIONS.free
      ? CALCULATOR_EDITION_OPTIONS.free
      : CALCULATOR_EDITION_OPTIONS.professional;

  const periods = Array.isArray(insurancePeriodsDraft)
    ? insurancePeriodsDraft
    : [];

  const presence = {
    vae: periods.some((period) => {
      return period?.employmentCategory === 'vae';
    }),
    yvae: periods.some((period) => {
      return period?.employmentCategory === 'yvae';
    }),
    ota_cleaning: periods.some((period) => {
      return period?.employmentCategory === 'ota_cleaning';
    }),
  };

  const hasConditionalPremiumPeriods = Object.values(presence).some(Boolean);

  if (!hasConditionalPremiumPeriods) {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      article30SpecialRegimeData: {
        calculatorEdition: normalizedEdition,
        hasVaePeriods: false,
        hasYvaePeriods: false,
        hasOtaCleaningPeriods: false,
        usageByRegime: {
          vae: 'not_applicable',
          yvae: 'not_applicable',
          ota_cleaning: 'not_applicable',
        },
        source: 'not_applicable',
      },
    };
  }

  if (normalizedEdition === CALCULATOR_EDITION_OPTIONS.free) {
    return {
      hasValue: true,
      error: null,
      warnings: [
        'Στη δωρεάν έκδοση δεν ζητείται από τον χρήστη να γνωρίζει αν συνταξιοδοτείται με ειδικές διατάξεις ΒΑΕ, ΥΒΑΕ ή καθαριότητας ΟΤΑ. Μέχρι να υπάρχει αυτόματος έλεγχος θεμελίωσης, τα αντίστοιχα επασφάλιστρα δεν προστίθενται και απαιτείται αναλυτικός έλεγχος.',
      ],
      article30SpecialRegimeData: {
        calculatorEdition: normalizedEdition,
        hasVaePeriods: presence.vae,
        hasYvaePeriods: presence.yvae,
        hasOtaCleaningPeriods: presence.ota_cleaning,
        usageByRegime: {
          vae: presence.vae ? 'unknown' : 'not_applicable',
          yvae: presence.yvae ? 'unknown' : 'not_applicable',
          ota_cleaning: presence.ota_cleaning
            ? 'unknown'
            : 'not_applicable',
        },
        source: 'free_tool_automatic_check_pending',
      },
    };
  }

  const normalizedUsageInput = normalizeArticle30SpecialRegimeUsageInput(
    article30SpecialRegimeUsageInput
  );
  const warnings = [];
  const usageByRegime = {
    vae: 'not_applicable',
    yvae: 'not_applicable',
    ota_cleaning: 'not_applicable',
  };

  for (const premiumType of ['vae', 'yvae', 'ota_cleaning']) {
    if (!presence[premiumType]) {
      continue;
    }

    const usage = normalizedUsageInput[premiumType];
    const label = getArticle30PremiumTypeLabel(premiumType);

    if (!usage) {
      return {
        hasValue: false,
        error: `Δηλώστε αν η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ${label}.`,
        warnings: [],
        article30SpecialRegimeData: null,
      };
    }

    if (!ARTICLE30_SPECIAL_REGIME_USAGE_OPTIONS[usage]) {
      return {
        hasValue: true,
        error: `Η επιλογή για τις ειδικές διατάξεις ${label} δεν είναι έγκυρη.`,
        warnings: [],
        article30SpecialRegimeData: null,
      };
    }

    usageByRegime[premiumType] = usage;

    if (usage === ARTICLE30_SPECIAL_REGIME_USAGE_OPTIONS.unknown) {
      warnings.push(
        `Δεν υπολογίζεται το επασφάλιστρο ${label}, επειδή δεν είναι γνωστό αν χρησιμοποιούνται οι αντίστοιχες ειδικές διατάξεις συνταξιοδότησης.`
      );
    }
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    article30SpecialRegimeData: {
      calculatorEdition: normalizedEdition,
      hasVaePeriods: presence.vae,
      hasYvaePeriods: presence.yvae,
      hasOtaCleaningPeriods: presence.ota_cleaning,
      usageByRegime,
      source: 'user',
    },
  };
}

function normalizeArticle30SpecialRegimeUsageInput(value) {
  if (typeof value === 'string') {
    return {
      vae: value,
      yvae: value,
      ota_cleaning: value,
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      vae: '',
      yvae: '',
      ota_cleaning: '',
    };
  }

  return {
    vae: String(value.vae || '').trim(),
    yvae: String(value.yvae || '').trim(),
    ota_cleaning: String(value.ota_cleaning || '').trim(),
  };
}

function getArticle30PremiumTypeLabel(premiumType) {
  const labels = {
    vae: 'ΒΑΕ',
    yvae: 'ΥΒΑΕ',
    ota_cleaning: 'καθαριότητας / υγιεινής ΟΤΑ',
  };

  return labels[premiumType] || 'ειδικής εισφοράς';
}

function analyzeInsurancePeriodsDraft({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleFromDateInput,
  simpleToDateInput,
  simpleTimeInputMethod,
  simpleInsuranceDaysInput,
  simpleInsuranceYearsInput,
  simpleInsuranceMonthsInput,
  simpleInsuranceExtraDaysInput,
  simpleUniformedSpecialTimeDraft,
  insurancePeriodGroups,
  multiPeriodTimeInputMethod,
  multiPeriodInsuranceDaysInput,
  multiPeriodInsuranceYearsInput,
  multiPeriodInsuranceMonthsInput,
  multiPeriodInsuranceExtraDaysInput,
  multiPeriodFundInput,
  multiPeriodInsuredTypeInput,
  multiPeriodEmploymentCategoryInput,
  multiPeriod2TimeInputMethod,
  multiPeriod2InsuranceDaysInput,
  multiPeriod2InsuranceYearsInput,
  multiPeriod2InsuranceMonthsInput,
  multiPeriod2InsuranceExtraDaysInput,
  multiPeriod2FundInput,
  multiPeriod2InsuredTypeInput,
  multiPeriod2EmploymentCategoryInput,
  insuranceTimeAnalysis,
}) {
  const mode = String(insurancePeriodsInputMode || 'disabled').trim();

  if (!INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο τρόπο δήλωσης κατηγορίας ασφάλισης.',
      warnings: [],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel: null,
      insurancePeriodsDraft: [],
      insurancePeriodDraftDisplay: null,
    };
  }

  if (mode === 'disabled') {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel:
        INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
      insurancePeriodsDraft: [],
      insurancePeriodDraftDisplay:
        'Δεν δηλώθηκε κατηγορία συνολικού χρόνου ασφάλισης.',
    };
  }

  if (mode === 'multiple') {
    const groups = normalizeInsurancePeriodGroupsForAnalysis({
      insurancePeriodGroups,
      legacyFirstGroup: {
        timeInputMethod: multiPeriodTimeInputMethod,
        insuranceDays: multiPeriodInsuranceDaysInput,
        insuranceYears: multiPeriodInsuranceYearsInput,
        insuranceMonths: multiPeriodInsuranceMonthsInput,
        insuranceExtraDays: multiPeriodInsuranceExtraDaysInput,
        fund: multiPeriodFundInput,
        insuredType: multiPeriodInsuredTypeInput,
        employmentCategory: multiPeriodEmploymentCategoryInput,
      },
      legacySecondGroup: {
        timeInputMethod: multiPeriod2TimeInputMethod,
        insuranceDays: multiPeriod2InsuranceDaysInput,
        insuranceYears: multiPeriod2InsuranceYearsInput,
        insuranceMonths: multiPeriod2InsuranceMonthsInput,
        insuranceExtraDays: multiPeriod2InsuranceExtraDaysInput,
        fund: multiPeriod2FundInput,
        insuredType: multiPeriod2InsuredTypeInput,
        employmentCategory: multiPeriod2EmploymentCategoryInput,
      },
    });

    if (groups.length === 0) {
      return createInsurancePeriodDraftError(
        'Συμπληρώστε τουλάχιστον μία περίοδο / ομάδα ασφάλισης.',
        mode
      );
    }

    if (groups.length > MAX_INSURANCE_PERIOD_GROUPS) {
      return createInsurancePeriodDraftError(
        `Μπορούν να δηλωθούν μέχρι ${MAX_INSURANCE_PERIOD_GROUPS} περίοδοι / ομάδες ασφάλισης.`,
        mode
      );
    }

    const periods = [];

    for (let index = 0; index < groups.length; index += 1) {
      const periodResult = analyzeMultiInsurancePeriodDraft({
        mode,
        groupNumber: index + 1,
        timeInputMethod: groups[index].timeInputMethod,
        insuranceDaysInput: groups[index].insuranceDays,
        insuranceYearsInput: groups[index].insuranceYears,
        insuranceMonthsInput: groups[index].insuranceMonths,
        insuranceExtraDaysInput: groups[index].insuranceExtraDays,
        fromDateInput: groups[index].fromDate,
        toDateInput: groups[index].toDate,
        fundInput: groups[index].fund,
        insuredTypeInput: groups[index].insuredType,
        employmentCategoryInput: groups[index].employmentCategory,
        uniformedSpecialTimeDraft: groups[index].uniformedSpecialTimeDraft,
        isRequired: true,
      });

      if (periodResult.error) {
        return periodResult;
      }

      periods.push(periodResult.period);
    }

    const totalInsuranceDaysEquivalent = periods.reduce((sum, period) => {
      return sum + Number(period.insuranceDays || 0);
    }, 0);

    const totalInsuranceTimeAnalysis = buildInsuranceTimeAnalysisFromDays({
      totalInsuranceDaysEquivalent,
      displaySuffix: `(σύνολο από ${periods.length} περίοδο/ομάδα${periods.length > 1 ? 'ες' : ''})`,
    });

    return {
      hasValue: true,
      error: null,
      warnings: [
        'Οι περίοδοι / ομάδες προετοιμάζονται ως insurancePeriodsDraft και το backend τις μετατρέπει σε κανονικό insurancePeriods για τον calculator.',
      ],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel:
        INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
      insurancePeriodsDraft: periods,
      insurancePeriodDraftDisplay: periods.map((period, index) => {
        return `Περίοδος / ομάδα ${index + 1}: ` +
          `${period.fromDateDisplay} έως ${period.toDateDisplay}, ` +
          `${period.fundLabel} - ${period.insuredTypeLabel} - ` +
          `${period.employmentCategoryLabel}, ` +
          `${period.insuranceDays} ημέρες (${period.insuranceDaysSourceLabel})`;
      }).join(' | '),
      totalInsuranceTimeAnalysis,
    };
  }

  const fromDateResult = analyzeInsurancePeriodDate({
    value: simpleFromDateInput,
    fieldLabel: 'ημερομηνία έναρξης ασφαλιστικής περιόδου',
  });

  if (fromDateResult.error) {
    return createInsurancePeriodDraftError(fromDateResult.error, mode);
  }

  if (!fromDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      'Συμπληρώστε την ημερομηνία έναρξης της ασφαλιστικής περιόδου.',
      mode
    );
  }

  const toDateResult = analyzeInsurancePeriodDate({
    value: simpleToDateInput,
    fieldLabel: 'ημερομηνία λήξης ασφαλιστικής περιόδου',
  });

  if (toDateResult.error) {
    return createInsurancePeriodDraftError(toDateResult.error, mode);
  }

  if (!toDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      'Συμπληρώστε την ημερομηνία λήξης της ασφαλιστικής περιόδου.',
      mode
    );
  }

  if (fromDateResult.isoDate > toDateResult.isoDate) {
    return createInsurancePeriodDraftError(
      'Η ημερομηνία έναρξης της ασφαλιστικής περιόδου δεν μπορεί να είναι μετά την ημερομηνία λήξης.',
      mode
    );
  }

  const simplePeriodTimeAnalysis = analyzeInsuranceTime({
    insuranceTimeInputMethod: simpleTimeInputMethod,
    insuranceDaysInput: simpleInsuranceDaysInput,
    insuranceYearsInput: simpleInsuranceYearsInput,
    insuranceMonthsInput: simpleInsuranceMonthsInput,
    insuranceExtraDaysInput: simpleInsuranceExtraDaysInput,
  });

  if (simplePeriodTimeAnalysis.error) {
    return createInsurancePeriodDraftError(
      simplePeriodTimeAnalysis.error,
      mode
    );
  }

  if (!simplePeriodTimeAnalysis.hasValue) {
    return createInsurancePeriodDraftError(
      'Συμπληρώστε τον χρόνο ασφάλισης της περιόδου.',
      mode
    );
  }

  const periodResult = buildValidatedInsurancePeriodDraft({
    mode,
    fundInput: simpleFundInput,
    insuredTypeInput: simpleInsuredTypeInput,
    employmentCategoryInput: simpleEmploymentCategoryInput,
    uniformedSpecialTimeDraft: simpleUniformedSpecialTimeDraft,
    fromDate: fromDateResult.isoDate,
    fromDateDisplay: fromDateResult.displayDate,
    toDate: toDateResult.isoDate,
    toDateDisplay: toDateResult.displayDate,
    insuranceDays: Math.round(
      simplePeriodTimeAnalysis.totalInsuranceDaysEquivalent
    ),
    insuranceDaysSource: 'declared_in_period',
    insuranceDaysSourceLabel: 'δηλώθηκε ξεχωριστά για τη μία περίοδο',
  });

  if (periodResult.error) {
    return periodResult;
  }

  const period = periodResult.period;

  return {
    hasValue: true,
    error: null,
    warnings: [
      'Η ασφαλιστική περίοδος προετοιμάζεται ως insurancePeriodsDraft και το backend τη μετατρέπει σε κανονικό insurancePeriods για τον calculator.',
    ],
    insurancePeriodsInputMode: mode,
    insurancePeriodsInputModeLabel:
      INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
    insurancePeriodsDraft: [period],
    insurancePeriodDraftDisplay:
      `${period.fromDateDisplay} έως ${period.toDateDisplay}: ` +
      `${period.fundLabel} - ${period.insuredTypeLabel} - ` +
      `${period.employmentCategoryLabel}, ` +
      `${period.insuranceDays} ημέρες (${period.insuranceDaysSourceLabel})`,
    totalInsuranceTimeAnalysis: simplePeriodTimeAnalysis,
  };
}

function normalizeInsurancePeriodGroupsForAnalysis({
  insurancePeriodGroups,
  legacyFirstGroup,
  legacySecondGroup,
}) {
  if (Array.isArray(insurancePeriodGroups)) {
    return insurancePeriodGroups
      .slice(0, MAX_INSURANCE_PERIOD_GROUPS)
      .map(normalizeInsurancePeriodGroupForAnalysis)
      .filter((group) => {
        return hasAnyInsurancePeriodGroupValue(group);
      });
  }

  return [legacyFirstGroup, legacySecondGroup]
    .map(normalizeInsurancePeriodGroupForAnalysis)
    .filter((group) => {
      return hasAnyInsurancePeriodGroupValue(group);
    });
}

function normalizeInsurancePeriodGroupForAnalysis(group = {}) {
  return {
    timeInputMethod: group.timeInputMethod || '',
    insuranceDays: group.insuranceDays || '',
    insuranceYears: group.insuranceYears || '',
    insuranceMonths: group.insuranceMonths || '',
    insuranceExtraDays: group.insuranceExtraDays || '',
    fromDate: group.fromDate || '',
    toDate: group.toDate || '',
    fund: group.fund || '',
    insuredType: group.insuredType || '',
    employmentCategory: group.employmentCategory || '',
    uniformedSpecialTimeDraft:
      normalizeUniformedSpecialTimeDraft(group.uniformedSpecialTimeDraft),
  };
}

function hasAnyInsurancePeriodGroupValue(group = {}) {
  return [
    group.timeInputMethod,
    group.insuranceDays,
    group.insuranceYears,
    group.insuranceMonths,
    group.insuranceExtraDays,
    group.fromDate,
    group.toDate,
    group.fund,
    group.insuredType,
    group.employmentCategory,
    hasActiveUniformedSpecialTimeDraft(group.uniformedSpecialTimeDraft)
      ? 'uniformed_special_time'
      : '',
  ].some((value) => String(value || '').trim() !== '');
}

function analyzeMultiInsurancePeriodDraft({
  mode,
  groupNumber,
  timeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  fromDateInput,
  toDateInput,
  fundInput,
  insuredTypeInput,
  employmentCategoryInput,
  uniformedSpecialTimeDraft,
  isRequired,
}) {
  const hasAnyValue = [
    timeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
    fromDateInput,
    toDateInput,
    fundInput,
    insuredTypeInput,
    employmentCategoryInput,
    hasActiveUniformedSpecialTimeDraft(uniformedSpecialTimeDraft)
      ? 'uniformed_special_time'
      : '',
  ].some((value) => String(value || '').trim() !== '');

  if (!isRequired && !hasAnyValue) {
    return {
      error: null,
      period: null,
    };
  }

  const fromDateResult = analyzeInsurancePeriodDate({
    value: fromDateInput,
    fieldLabel: `ημερομηνία έναρξης της περιόδου / ομάδας ${groupNumber}`,
  });

  if (fromDateResult.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${fromDateResult.error}`,
      mode
    );
  }

  if (!fromDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      `Η ημερομηνία έναρξης της ασφαλιστικής περιόδου ${groupNumber} είναι υποχρεωτική.`,
      mode
    );
  }

  const toDateResult = analyzeInsurancePeriodDate({
    value: toDateInput,
    fieldLabel: `ημερομηνία λήξης της περιόδου / ομάδας ${groupNumber}`,
  });

  if (toDateResult.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${toDateResult.error}`,
      mode
    );
  }

  if (!toDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      `Η ημερομηνία λήξης της ασφαλιστικής περιόδου ${groupNumber} είναι υποχρεωτική.`,
      mode
    );
  }

  if (fromDateResult.isoDate > toDateResult.isoDate) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: Η ημερομηνία έναρξης δεν μπορεί να είναι μετά την ημερομηνία λήξης.`,
      mode
    );
  }

  const periodTimeAnalysis = analyzeInsuranceTime({
    insuranceTimeInputMethod: timeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
  });

  if (periodTimeAnalysis.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${periodTimeAnalysis.error}`,
      mode
    );
  }

  if (!periodTimeAnalysis.hasValue) {
    return createInsurancePeriodDraftError(
      `Συμπληρώστε τον χρόνο ασφάλισης της περιόδου / ομάδας ${groupNumber}.`,
      mode
    );
  }

  const periodResult = buildValidatedInsurancePeriodDraft({
    mode,
    fundInput,
    insuredTypeInput,
    employmentCategoryInput,
    uniformedSpecialTimeDraft,
    fromDate: fromDateResult.isoDate,
    fromDateDisplay: fromDateResult.displayDate,
    toDate: toDateResult.isoDate,
    toDateDisplay: toDateResult.displayDate,
    insuranceDays: Math.round(periodTimeAnalysis.totalInsuranceDaysEquivalent),
    insuranceDaysSource: 'declared_in_period',
    insuranceDaysSourceLabel: `δηλώθηκε ξεχωριστά για την περίοδο / ομάδα ${groupNumber}`,
  });

  if (periodResult.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${periodResult.error}`,
      mode
    );
  }

  return {
    error: null,
    period: periodResult.period,
  };
}

function buildInsuranceTimeAnalysisFromDays({
  totalInsuranceDaysEquivalent,
  displaySuffix,
}) {
  const totalDays = Math.round(Number(totalInsuranceDaysEquivalent || 0));
  const displayTime = convertInsuranceDaysToDisplayTime(totalDays);

  return {
    hasValue: true,
    error: null,
    warnings: [],
    insuranceTimeInputMethod: 'insurance_days',
    insuranceTimeInputMethodLabel: 'Με αριθμό ενσήμων / ημερών ασφάλισης',

    // Important:
    // When insuranceTimeInputMethod is "insurance_days", the backend reads
    // totalInsuranceDays as the full number of declared days.
    // The years/months/days conversion is only for display.
    totalInsuranceYears: 0,
    totalInsuranceMonths: 0,
    totalInsuranceDays: totalDays,
    totalInsuranceDaysEquivalent: totalDays,
    totalInsuranceDecimalYears: roundToDecimals(
      totalDays / INSURANCE_DAYS_PER_YEAR,
      6
    ),
    insuranceTimeDisplay:
      `${totalDays} ημέρες ασφάλισης ` +
      `(${displayTime.years} έτη, ${displayTime.months} μήνες, ${displayTime.days} ημέρες) ` +
      `${displaySuffix}`,
  };
}

function buildValidatedInsurancePeriodDraft({
  mode,
  fundInput,
  insuredTypeInput,
  employmentCategoryInput,
  uniformedSpecialTimeDraft,
  fromDate = null,
  fromDateDisplay = null,
  toDate = null,
  toDateDisplay = null,
  insuranceDays,
  insuranceDaysSource,
  insuranceDaysSourceLabel,
}) {
  const fund = String(fundInput || '').trim();
  const insuredType = String(insuredTypeInput || '').trim();
  const employmentCategory = String(employmentCategoryInput || '').trim();

  if (!fund) {
    return createInsurancePeriodDraftError('Επιλέξτε φορέα / κατηγορία ασφάλισης.', mode);
  }

  if (!INSURANCE_PERIOD_FUND_OPTIONS[fund]) {
    return createInsurancePeriodDraftError('Επιλέξτε έγκυρο φορέα / κατηγορία ασφάλισης.', mode);
  }

  if (!insuredType) {
    return createInsurancePeriodDraftError('Επιλέξτε αν ο ασφαλισμένος είναι παλαιός ή νέος.', mode);
  }

  if (!isAllowedInsuredTypeForFund({ fund, insuredType })) {
    return createInsurancePeriodDraftError('Η επιλογή παλαιός / νέος δεν ταιριάζει με τον φορέα.', mode);
  }

  if (!employmentCategory) {
    return createInsurancePeriodDraftError('Επιλέξτε κατηγορία εργασίας / εισφορών.', mode);
  }

  if (!isAllowedEmploymentCategoryForFund({ fund, employmentCategory })) {
    return createInsurancePeriodDraftError('Η κατηγορία εργασίας / εισφορών δεν ταιριάζει με τον φορέα.', mode);
  }

  if (!Number.isFinite(insuranceDays) || insuranceDays <= 0) {
    return createInsurancePeriodDraftError('Ο χρόνος της ασφαλιστικής περιόδου πρέπει να είναι μεγαλύτερος από 0.', mode);
  }

  const uniformedSpecialTimeValidation = validateUniformedSpecialTimeDraftForAnalysis({
    fund,
    uniformedSpecialTimeDraft,
  });

  if (uniformedSpecialTimeValidation.error) {
    return createInsurancePeriodDraftError(uniformedSpecialTimeValidation.error, mode);
  }

  const category = buildInsurancePeriodCategory({
    fund,
    insuredType,
    employmentCategory,
  });

  return {
    error: null,
    period: {
      fund,
      fundLabel: INSURANCE_PERIOD_FUND_OPTIONS[fund].label,
      insuredType,
      insuredTypeLabel: INSURED_TYPE_OPTIONS[insuredType].label,
      employmentCategory,
      employmentCategoryLabel: EMPLOYMENT_CATEGORY_OPTIONS[employmentCategory].label,
      fromDate,
      fromDateDisplay,
      toDate,
      toDateDisplay,
      insuranceDays,
      insuranceDaysSource,
      insuranceDaysSourceLabel,
      categoryKey: category.categoryKey,
      contributionCategory: category.contributionCategory,
      specialWorkFacts: category.specialWorkFacts,
      uniformedSpecialTimeDraft:
        fund === 'uniformed'
          ? normalizeUniformedSpecialTimeDraft(uniformedSpecialTimeDraft)
          : null,
    },
  };
}

function createInsurancePeriodDraftError(error, mode) {
  return {
    hasValue: true,
    error,
    warnings: [],
    insurancePeriodsInputMode: mode,
    insurancePeriodsInputModeLabel:
      INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode]?.label || null,
    insurancePeriodsDraft: [],
    insurancePeriodDraftDisplay: null,
    totalInsuranceTimeAnalysis: null,
  };
}

function createBackendSafeInsurancePeriodDraft(period) {
  return {
    fund: period.fund,
    insuredType: period.insuredType,
    employmentCategory: period.employmentCategory,
    fromDate: period.fromDate,
    toDate: period.toDate,
    insuranceDays: period.insuranceDays,
    insuranceDaysSource: period.insuranceDaysSource,
    categoryKey: period.categoryKey,
    contributionCategory: period.contributionCategory,
    specialWorkFacts: period.specialWorkFacts,
    uniformedSpecialTimeDraft:
      period.uniformedSpecialTimeDraft || null,
  };
}

function resolveInsurancePeriodDays({
  daysText,
  insuranceTimeAnalysis,
  mode,
}) {
  if (daysText) {
    const manualDaysResult = parseNonNegativeInteger(daysText);

    if (!manualDaysResult.isValid) {
      return {
        error: 'Οι ημέρες / ένσημα της ασφαλιστικής ομάδας πρέπει να είναι ακέραιος αριθμός.',
      };
    }

    if (manualDaysResult.value <= 0) {
      return {
        error: 'Οι ημέρες / ένσημα της ασφαλιστικής ομάδας πρέπει να είναι περισσότερες από 0.',
      };
    }

    return {
      error: null,
      value: manualDaysResult.value,
      source: 'manual_override',
      sourceLabel: 'χειροκίνητη διόρθωση από τον χρήστη',
    };
  }

  const totalDays = Number(insuranceTimeAnalysis?.totalInsuranceDaysEquivalent || 0);

  if (!Number.isFinite(totalDays) || totalDays <= 0) {
    return {
      error: 'Δεν μπορεί να δοθεί ασφαλιστική ομάδα χωρίς συνολικό χρόνο ασφάλισης ή ημέρες ομάδας.',
    };
  }

  return {
    error: null,
    value: Math.round(totalDays),
    source: 'total_insurance_time',
    sourceLabel: 'από τον συνολικό χρόνο ασφάλισης',
  };
}

function analyzeInsurancePeriodDate({ value, fieldLabel }) {
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
      error: `Συμπληρώστε έγκυρη ${fieldLabel}, π.χ. 1/1/02, 1/1/2002 ή 01012002.`,
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
      error: `Η ${fieldLabel} που δόθηκε δεν είναι πραγματική.`,
    };
  }

  return {
    hasValue: true,
    error: null,
    day,
    month,
    year,
    displayDate: formatGreekDate(day, month, year),
    isoDate: formatIsoDate(day, month, year),
  };
}

function isAllowedInsuredTypeForFund({ fund, insuredType }) {
  if (CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return insuredType === 'not_applicable';
  }

  return insuredType === 'old' || insuredType === 'new';
}

function isAllowedEmploymentCategoryForFund({ fund, employmentCategory }) {
  if (SIMPLE_VAE_YVAE_FUNDS.includes(fund)) {
    return (
      employmentCategory === 'common' ||
      employmentCategory === 'vae' ||
      employmentCategory === 'yvae'
    );
  }

  if (OTA_CLEANING_FUNDS.includes(fund)) {
    return (
      employmentCategory === 'common' ||
      employmentCategory === 'ota_cleaning'
    );
  }

  if (
    fund === 'public_sector' ||
    fund === 'deko' ||
    fund === 'nat' ||
    fund === 'banking_funds' ||
    ARTICLE30_MAIN_CONTRIBUTION_FUNDS.includes(fund)
  ) {
    return employmentCategory === 'common';
  }

  if (CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return employmentCategory === 'contributions';
  }

  return false;
}

function buildInsurancePeriodCategory({
  fund,
  insuredType,
  employmentCategory,
}) {
  const categoryKey = [fund, insuredType, employmentCategory]
    .filter(Boolean)
    .join('_');
  const contributionCategory = buildCanonicalContributionCategory({
    fund,
    insuredType,
    employmentCategory,
    fallbackCategoryKey: categoryKey,
  });

  return {
    categoryKey,
    contributionCategory,
    specialWorkFacts: {
      isCommonWork: employmentCategory === 'common',
      isVaeWork: employmentCategory === 'vae',
      isYvaeWork: employmentCategory === 'yvae',
      isOtaCleaningWork: employmentCategory === 'ota_cleaning',
      isContributionBasedWork: employmentCategory === 'contributions',
      isOtaOrPublicSectorWork:
        fund === 'public_sector' || fund === 'ota',
      isTapDeiWork: fund === 'tap_dei',
      isDekoWork: fund === 'deko',
      isNatWork: fund === 'nat',
      isTanpyWork: fund === 'tanpy',
      isUniformedWork: fund === 'uniformed',
      isArtisticWork: fund === 'artistic',
      isAviationWork: fund === 'aviation',
      isBankingFundWork: fund === 'banking_funds',
      isArticle30MainContributionFund:
        ARTICLE30_MAIN_CONTRIBUTION_FUNDS.includes(fund),
      isContributionBasedFund: CONTRIBUTION_BASED_FUNDS.includes(fund),
    },
  };
}

function buildCanonicalContributionCategory({
  fund,
  insuredType,
  employmentCategory,
  fallbackCategoryKey,
}) {
  if (fund === 'ika' && employmentCategory === 'vae') {
    return 'ika_vae';
  }

  if (fund === 'ika' && employmentCategory === 'yvae') {
    return 'underground_underwater';
  }

  if (fund === 'tap_dei' && employmentCategory === 'vae') {
    return `${insuredType}_tap_dei_vae`;
  }

  if (fund === 'tap_dei' && employmentCategory === 'yvae') {
    return 'tap_dei_yvae';
  }

  if (fund === 'ota' && employmentCategory === 'ota_cleaning') {
    return 'ota_cleaning_staff';
  }

  if (fund === 'tanpy') {
    return 'tanpy_salaried';
  }

  if (ARTICLE30_MAIN_CONTRIBUTION_FUNDS.includes(fund)) {
    return fund === 'aviation' || fund === 'artistic'
      ? `${fund}_${insuredType}`
      : fund;
  }

  return fallbackCategoryKey;
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
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleFromDateInput,
  simpleToDateInput,
  simpleInsuranceDaysInput,
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

function validateUniformedSpecialTimeDraftForAnalysis({
  fund,
  uniformedSpecialTimeDraft,
}) {
  if (fund !== 'uniformed') {
    return {
      error: null,
    };
  }

  const normalizedDraft = normalizeUniformedSpecialTimeDraft(
    uniformedSpecialTimeDraft
  );

  const insuranceRegime = String(
    normalizedDraft.insuranceRegime || ''
  ).trim();

  if (!['old_public', 'new_ika'].includes(insuranceRegime)) {
    return {
      error: 'Επιλέξτε καθεστώς κατάταξης ενστόλου.',
    };
  }

  const article36ACategory = String(
    normalizedDraft.article36ACategory || ''
  ).trim();

  if (
    article36ACategory &&
    !isValidArticle36ACategoryForAnalysis(article36ACategory)
  ) {
    return {
      error: 'Η κατηγορία άρθρου 36Α δεν είναι έγκυρη.',
    };
  }

  const combatDaysResult = getCombatFiveYearServiceDaysForAnalysis(
    normalizedDraft.combatFiveYearService
  );

  if (combatDaysResult.error) {
    return {
      error: combatDaysResult.error,
    };
  }

  const combatEarningsValidation = validateUniformedRecognitionEarningsForAnalysis(
    normalizedDraft.combatFiveYearService,
    'τη μάχιμη πενταετία'
  );

  if (combatEarningsValidation.error) {
    return { error: combatEarningsValidation.error };
  }

  const semestersDaysResult = getSpecialSemestersDaysForAnalysis(
    normalizedDraft.specialSemesters,
    insuranceRegime
  );

  if (semestersDaysResult.error) {
    return {
      error: semestersDaysResult.error,
    };
  }

  const semestersEarningsValidation = validateUniformedRecognitionEarningsForAnalysis(
    normalizedDraft.specialSemesters,
    'τα εξάμηνα'
  );

  if (semestersEarningsValidation.error) {
    return { error: semestersEarningsValidation.error };
  }

  if (insuranceRegime === 'new_ika') {
    const maxCombinedDays = 7 * INSURANCE_DAYS_PER_YEAR;
    const totalSpecialDays = combatDaysResult.days + semestersDaysResult.days;

    if (totalSpecialDays > maxCombinedDays) {
      return {
        error: 'Για κατάταξη από 01/01/2011, η μάχιμη πενταετία μαζί με τα εξάμηνα δεν μπορεί να ξεπερνά συνολικά τα 7 έτη.',
      };
    }
  }

  return {
    error: null,
  };
}

function getCombatFiveYearServiceDaysForAnalysis(combatFiveYearService = {}) {
  const status = String(combatFiveYearService.status || 'none').trim();

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status === 'full') {
    return {
      days: 5 * INSURANCE_DAYS_PER_YEAR,
      error: null,
    };
  }

  if (status !== 'partial') {
    return {
      days: 0,
      error: 'Η επιλογή μάχιμης πενταετίας δεν είναι έγκυρη.',
    };
  }

  const years = parseNonNegativeIntegerOrEmpty(
    combatFiveYearService.years
  );
  const months = parseNonNegativeIntegerOrEmpty(
    combatFiveYearService.months
  );
  const days = parseNonNegativeIntegerOrEmpty(
    combatFiveYearService.days
  );

  if (!years.isValid || !months.isValid || !days.isValid) {
    return {
      days: 0,
      error: 'Ο μερικός χρόνος μάχιμης πενταετίας πρέπει να δηλωθεί με ακέραια έτη, μήνες και ημέρες.',
    };
  }

  if (years.value === 0 && months.value === 0 && days.value === 0) {
    return {
      days: 0,
      error: 'Αν η μάχιμη πενταετία είναι μερική, πρέπει να δηλωθεί τουλάχιστον ένας χρόνος.',
    };
  }

  if (months.value > 11) {
    return {
      days: 0,
      error: 'Οι μήνες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 11.',
    };
  }

  if (days.value > 24) {
    return {
      days: 0,
      error: 'Οι ημέρες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 24.',
    };
  }

  const totalCombatFiveYearDays =
    years.value * INSURANCE_DAYS_PER_YEAR +
    months.value * INSURANCE_DAYS_PER_MONTH +
    days.value;

  if (totalCombatFiveYearDays > 5 * INSURANCE_DAYS_PER_YEAR) {
    return {
      days: 0,
      error: 'Η μερική μάχιμη πενταετία δεν μπορεί να ξεπερνά τα 5 έτη.',
    };
  }

  return {
    days: totalCombatFiveYearDays,
    error: null,
  };
}

function getSpecialSemestersDaysForAnalysis(specialSemesters = {}, insuranceRegime = '') {
  const status = String(specialSemesters.status || 'none').trim();

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status !== 'yes') {
    return {
      days: 0,
      error: 'Η επιλογή εξαμήνων δεν είναι έγκυρη.',
    };
  }

  const semestersType = String(
    specialSemesters.specialSemestersType || ''
  ).trim();

  if (!isValidSpecialSemestersTypeForAnalysis(semestersType)) {
    return {
      days: 0,
      error: 'Επιλέξτε τύπο εξαμήνων.',
    };
  }

  const semestersCount = parseNonNegativeIntegerOrEmpty(
    specialSemesters.semestersCount
  );

  if (!semestersCount.isValid || semestersCount.value <= 0) {
    return {
      days: 0,
      error: 'Το πλήθος εξαμήνων πρέπει να είναι ακέραιος αριθμός μεγαλύτερος από 0.',
    };
  }

  if (insuranceRegime === 'new_ika' && semestersCount.value > 14) {
    return {
      days: 0,
      error: 'Για κατάταξη από 01/01/2011, τα εξάμηνα δεν μπορούν να είναι περισσότερα από 14.',
    };
  }

  const milestoneCompletionYear = String(
    specialSemesters.milestoneCompletionYear || ''
  ).trim();

  if (milestoneCompletionYear && !/^\d{4}$/.test(milestoneCompletionYear)) {
    return {
      days: 0,
      error: 'Το έτος συμπλήρωσης πραγματικής υπηρεσίας πρέπει να έχει 4 ψηφία.',
    };
  }

  return {
    days: semestersCount.value * 6 * INSURANCE_DAYS_PER_MONTH,
    error: null,
  };
}

function validateUniformedRecognitionEarningsForAnalysis(value = {}, label) {
  const status = String(value.status || 'none').trim();
  const recognitionPeriod = String(value.recognitionPeriod || '').trim();

  if (status === 'none' || recognitionPeriod === 'before_2002' || !recognitionPeriod) {
    return { error: null };
  }

  const paidAmount = parseNonNegativeDecimal(value.paidAmount);
  if (!paidAmount.isValid || paidAmount.value <= 0) {
    return { error: `Για ${label} μετά το 2002, το ποσό που πληρώθηκε πρέπει να είναι μεγαλύτερο από 0.` };
  }

  const explicitBaseText = String(value.explicitPensionableEarningsBase || '').trim();
  const rateText = String(value.contributionRatePercent || '').trim();
  const hasExplicitBase = explicitBaseText !== '';
  const hasRate = rateText !== '';

  if (!hasExplicitBase && !hasRate) {
    return { error: `Για ${label} μετά το 2002, δηλώστε είτε την ασφαλιστέα βάση της πράξης είτε το πραγματικό ποσοστό εισφοράς.` };
  }

  if (hasExplicitBase) {
    const explicitBase = parseNonNegativeDecimal(explicitBaseText);
    if (!explicitBase.isValid || explicitBase.value <= 0) {
      return { error: `Η ασφαλιστέα βάση για ${label} πρέπει να είναι αριθμός μεγαλύτερος από 0.` };
    }
  }

  if (hasRate) {
    const rate = parseNonNegativeDecimal(rateText);
    if (!rate.isValid || rate.value <= 0 || rate.value > 100) {
      return { error: `Το ποσοστό εισφοράς για ${label} πρέπει να είναι μεγαλύτερο από 0 και έως 100.` };
    }
  }

  const referenceYear = parseNonNegativeInteger(String(value.earningsReferenceYear || '').trim());
  if (!referenceYear.isValid || referenceYear.value < 2002 || referenceYear.value > 2100) {
    return { error: `Το έτος αναφοράς για ${label} πρέπει να είναι έγκυρο έτος από το 2002 και μετά.` };
  }

  return { error: null };
}

function createEmptyUniformedSpecialTimeDraft() {
  return {
    insuranceRegime: '',
    article36ACategory: '',
    combatFiveYearService: {
      status: 'none',
      years: '',
      months: '',
      days: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
    specialSemesters: {
      status: 'none',
      specialSemestersType: '',
      semestersCount: '',
      milestoneCompletionYear: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
  };
}

function normalizeUniformedSpecialTimeDraft(value) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  const normalizedDraft = {
    insuranceRegime: value.insuranceRegime || '',
    article36ACategory: value.article36ACategory || '',
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };

  if (normalizedDraft.combatFiveYearService.recognitionPeriod === 'before_2002') {
    normalizedDraft.combatFiveYearService.paidAmount = '0';
    normalizedDraft.combatFiveYearService.contributionRatePercent = '';
    normalizedDraft.combatFiveYearService.explicitPensionableEarningsBase = '';
    normalizedDraft.combatFiveYearService.earningsReferenceYear = '';
  }

  if (normalizedDraft.specialSemesters.status === 'none') {
    normalizedDraft.specialSemesters.specialSemestersType = '';
  }

  if (normalizedDraft.specialSemesters.recognitionPeriod === 'before_2002') {
    normalizedDraft.specialSemesters.paidAmount = '0';
    normalizedDraft.specialSemesters.contributionRatePercent = '';
    normalizedDraft.specialSemesters.explicitPensionableEarningsBase = '';
    normalizedDraft.specialSemesters.earningsReferenceYear = '';
  }

  return normalizedDraft;
}

function isValidSpecialSemestersTypeForAnalysis(value) {
  return [
    'flight',
    'diving',
    'paratrooper_or_special_forces',
    'mine_clearance',
    'other_special_category',
  ].includes(value);
}

function isValidArticle36ACategoryForAnalysis(value) {
  return [
    'flight',
    'submarine_or_diving',
    'paratrooper',
    'underwater_demolition_or_special_ops',
    'mine_clearance_or_eod',
    'other_confirmed',
  ].includes(value);
}

function hasActiveUniformedSpecialTimeDraft(value) {
  const normalizedDraft = normalizeUniformedSpecialTimeDraft(value);

  return (
    normalizedDraft.combatFiveYearService.status !== 'none' ||
    normalizedDraft.specialSemesters.status !== 'none'
  );
}

export {
  analyzePensionForm,
};
