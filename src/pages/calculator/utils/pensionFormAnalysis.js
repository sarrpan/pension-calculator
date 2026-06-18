


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

const NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS = {
  annual_pensionable_earnings: {
    value: 'annual_pensionable_earnings',
    label: 'Ετήσιο ασφαλιστέο / συντάξιμο εισόδημα',
  },
  annual_pension_contribution: {
    value: 'annual_pension_contribution',
    label: 'Ετήσια εισφορά κύριας σύνταξης',
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
  ota_ika_vae: {
    value: 'ota_ika_vae',
    label: 'ΒΑΕ με καθεστώς ΟΤΑ',
  },
  ota_public_vae: {
    value: 'ota_public_vae',
    label: 'ΒΑΕ με καθεστώς Δημοσίου',
  },
  ota_ika_yvae: {
    value: 'ota_ika_yvae',
    label: 'ΥΒΑΕ μόνο για παλαιούς',
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

const ETAA_EXTRA_BENEFIT_TYPES = {
  TSMEDE_SPECIAL_INCREASE: 'tsmede_special_increase',
  TSAY_SINGLE_PENSIONER_BRANCH: 'tsay_single_pensioner_branch',
};

const TSMEDE_DEFAULT_EXTRA_CONTRIBUTION_POINTS = 12;
const TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS = 10;
const TSMEDE_ADDITIONAL_TWO_PERCENT_MAX_YEARS = 4.5;

const PLASTIC_YEARS_RECOGNITION_STATUS_OPTIONS = ['recognized', 'planned'];
const PLASTIC_YEARS_RECOGNITION_MODE_OPTIONS = ['paid', 'free'];
const PLASTIC_YEARS_FINANCIAL_INPUT_MODE_OPTIONS = [
  'monthly_base',
  'buyout_amount_and_rate',
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
  simpleNonSalariedEarningsInputMode,
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
  plasticYearsDraft,
  etaaExtraBenefitDraft,
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
    simpleNonSalariedEarningsInputMode,
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
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft,
  });

  const plasticYearsAnalysis = analyzePlasticYearsDraft({
    plasticYearsDraft,
    contributoryEarningsInputMethod,
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

  const etaaExtraBenefitAnalysis = analyzeEtaaExtraBenefits({
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft,
    etaaExtraBenefitDraft,
  });

  const errors = [
    dateAnalysis.error,
    pensionTypeAnalysis.error,
    oldAgeAnalysis.error,
    disabilityAnalysis.error,
    isMultipleInsuranceMode ? null : insuranceTimeAnalysis.error,
    insurancePeriodsAnalysis.error,
    article30SpecialRegimeAnalysis.error,
    plasticYearsAnalysis.error,
    etaaExtraBenefitAnalysis.error,
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
    plasticYearsAnalysis.hasValue &&
    etaaExtraBenefitAnalysis.hasValue &&
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
    ...plasticYearsAnalysis.warnings,
    ...etaaExtraBenefitAnalysis.warnings,
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
    plasticYearsDraft: plasticYearsAnalysis.plasticYearsDraft,
    etaaExtraBenefitData:
      etaaExtraBenefitAnalysis.etaaExtraBenefitData,
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

    plasticYearsDraft: plasticYearsAnalysis.plasticYearsDraft,
    plasticYearsDisplay: plasticYearsAnalysis.plasticYearsDisplay,
    paidPlasticYearsCount: plasticYearsAnalysis.paidPlasticYearsCount,

    etaaExtraBenefitEntries:
      etaaExtraBenefitAnalysis.etaaExtraBenefitEntries,
    etaaExtraBenefitDisplay:
      etaaExtraBenefitAnalysis.etaaExtraBenefitDisplay,

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

function analyzePlasticYearsDraft({
  plasticYearsDraft,
  contributoryEarningsInputMethod,
}) {
  const normalizedStatus =
    plasticYearsDraft?.status === 'yes' ? 'yes' : 'no';

  if (normalizedStatus === 'no') {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      plasticYearsDraft: [],
      plasticYearsDisplay: [],
      paidPlasticYearsCount: 0,
    };
  }

  const rawEntries = Array.isArray(plasticYearsDraft?.entries)
    ? plasticYearsDraft.entries
    : [];

  if (rawEntries.length === 0) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      plasticYearsDraft: [],
      plasticYearsDisplay: [],
      paidPlasticYearsCount: 0,
    };
  }

  const normalizedEntries = [];
  const displayEntries = [];
  const warnings = [];
  let paidPlasticYearsCount = 0;

  for (let index = 0; index < rawEntries.length; index += 1) {
    const entry = rawEntries[index] || {};
    const entryNumber = index + 1;
    const recognitionStatus = String(entry.recognitionStatus || '').trim();
    const recognitionMode = String(entry.recognitionMode || '').trim();

    if (!PLASTIC_YEARS_RECOGNITION_STATUS_OPTIONS.includes(recognitionStatus)) {
      return createPlasticYearsError(
        `Επιλέξτε αν υπάρχει πράξη αναγνώρισης για τον πλασματικό χρόνο ${entryNumber}.`
      );
    }

    if (!PLASTIC_YEARS_RECOGNITION_MODE_OPTIONS.includes(recognitionMode)) {
      return createPlasticYearsError(
        `Επιλέξτε αν ο πλασματικός χρόνος ${entryNumber} είναι με εξαγορά.`
      );
    }

    const durationResult = analyzePlasticYearsDuration({
      years: entry.years,
      months: entry.months,
      days: entry.days,
      entryNumber,
    });

    if (durationResult.error) {
      return createPlasticYearsError(durationResult.error);
    }

    if (recognitionMode === 'free') {
      warnings.push(
        `Ο πλασματικός χρόνος ${entryNumber} δηλώθηκε χωρίς εξαγορά και δεν θα προστεθεί στον υπολογισμό της ανταποδοτικής σύνταξης.`
      );

      displayEntries.push({
        entryNumber,
        recognitionStatus,
        recognitionStatusLabel:
          recognitionStatus === 'recognized'
            ? 'Υπάρχει πράξη αναγνώρισης'
            : 'Μελλοντική εκτίμηση',
        recognitionMode,
        recognitionModeLabel: 'Χωρίς εξαγορά',
        durationDisplay: formatPlasticYearsDuration(durationResult),
        includedInCalculation: false,
      });

      continue;
    }

    const applicationDateResult = analyzeInsurancePeriodDate({
      value: entry.applicationDate,
      fieldLabel: `ημερομηνία αίτησης / αναγνώρισης για τον πλασματικό χρόνο ${entryNumber}`,
    });

    if (!applicationDateResult.hasValue) {
      return createPlasticYearsError(
        `Συμπληρώστε την ημερομηνία αίτησης / αναγνώρισης για τον πλασματικό χρόνο ${entryNumber}.`
      );
    }

    if (applicationDateResult.error) {
      return createPlasticYearsError(applicationDateResult.error);
    }

    const financialInputMode =
      recognitionStatus === 'planned'
        ? 'monthly_base'
        : String(entry.financialInputMode || '').trim();

    if (!PLASTIC_YEARS_FINANCIAL_INPUT_MODE_OPTIONS.includes(financialInputMode)) {
      return createPlasticYearsError(
        `Επιλέξτε ποιο οικονομικό στοιχείο αναγράφεται στην πράξη για τον πλασματικό χρόνο ${entryNumber}.`
      );
    }

    const normalizedEntry = {
      id: entry.id || `plastic_year_${entryNumber}`,
      recognitionStatus,
      recognitionMode: 'paid',
      duration: {
        years: durationResult.years,
        months: durationResult.months,
        days: durationResult.days,
      },
      applicationDate: applicationDateResult.isoDate,
      calculationInputMode:
        financialInputMode === 'monthly_base'
          ? 'explicit_monthly_base'
          : 'buyout_amount_and_rate',
    };

    let financialDisplay = '';

    if (financialInputMode === 'monthly_base') {
      const monthlyBaseResult = parseNonNegativeDecimal(
        entry.monthlyPensionableBase
      );

      if (!monthlyBaseResult.isValid || monthlyBaseResult.value <= 0) {
        return createPlasticYearsError(
          `Η μηνιαία ασφαλιστέα / συντάξιμη βάση του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερη από 0.`
        );
      }

      normalizedEntry.explicitMonthlyPensionableBase =
        monthlyBaseResult.value;
      financialDisplay = `${monthlyBaseResult.value.toLocaleString('el-GR')} € μηνιαία βάση`;
    } else {
      const buyoutAmountResult = parseNonNegativeDecimal(entry.buyoutAmount);
      const contributionRateResult = parseNonNegativeDecimal(
        entry.contributionRatePercent
      );

      if (!buyoutAmountResult.isValid || buyoutAmountResult.value <= 0) {
        return createPlasticYearsError(
          `Το συνολικό ποσό εξαγοράς του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερο από 0.`
        );
      }

      if (
        !contributionRateResult.isValid ||
        contributionRateResult.value <= 0 ||
        contributionRateResult.value > 100
      ) {
        return createPlasticYearsError(
          `Το ποσοστό εισφοράς του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερο από 0 και έως 100%.`
        );
      }

      normalizedEntry.buyoutAmount = buyoutAmountResult.value;
      normalizedEntry.contributionRatePercent = contributionRateResult.value;
      financialDisplay = `${buyoutAmountResult.value.toLocaleString('el-GR')} € με ποσοστό ${contributionRateResult.value.toLocaleString('el-GR')}%`;
    }

    normalizedEntries.push(normalizedEntry);
    paidPlasticYearsCount += 1;

    displayEntries.push({
      entryNumber,
      recognitionStatus,
      recognitionStatusLabel:
        recognitionStatus === 'recognized'
          ? 'Υπάρχει πράξη αναγνώρισης'
          : 'Μελλοντική εκτίμηση',
      recognitionMode: 'paid',
      recognitionModeLabel: 'Με εξαγορά',
      durationDisplay: formatPlasticYearsDuration(durationResult),
      applicationDateDisplay: applicationDateResult.displayDate,
      financialDisplay,
      includedInCalculation: true,
    });
  }

  if (
    paidPlasticYearsCount > 0 &&
    contributoryEarningsInputMethod === 'average_monthly'
  ) {
    return createPlasticYearsError(
      'Για να ενσωματωθούν σωστά οι αποδοχές εξαγοράς πλασματικού χρόνου χρειάζονται αποδοχές και ημέρες ανά έτος. Δεν αρκεί έτοιμος μέσος μηνιαίος συντάξιμος μισθός.'
    );
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    plasticYearsDraft: normalizedEntries,
    plasticYearsDisplay: displayEntries,
    paidPlasticYearsCount,
  };
}

function createPlasticYearsError(error) {
  return {
    hasValue: true,
    error,
    warnings: [],
    plasticYearsDraft: [],
    plasticYearsDisplay: [],
    paidPlasticYearsCount: 0,
  };
}

function analyzePlasticYearsDuration({ years, months, days, entryNumber }) {
  const yearsResult = parseNonNegativeInteger(String(years || '0'));
  const monthsResult = parseNonNegativeInteger(String(months || '0'));
  const daysResult = parseNonNegativeInteger(String(days || '0'));

  if (!yearsResult.isValid || !monthsResult.isValid || !daysResult.isValid) {
    return {
      error: `Η διάρκεια του πλασματικού χρόνου ${entryNumber} πρέπει να περιέχει μόνο ακέραιους αριθμούς.`,
    };
  }

  if (monthsResult.value > 11) {
    return {
      error: `Οι μήνες του πλασματικού χρόνου ${entryNumber} πρέπει να είναι από 0 έως 11.`,
    };
  }

  if (daysResult.value > 24) {
    return {
      error: `Οι ημέρες του πλασματικού χρόνου ${entryNumber} πρέπει να είναι από 0 έως 24.`,
    };
  }

  const totalDays =
    yearsResult.value * INSURANCE_DAYS_PER_YEAR +
    monthsResult.value * INSURANCE_DAYS_PER_MONTH +
    daysResult.value;

  if (totalDays <= 0) {
    return {
      error: `Η διάρκεια του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερη από 0.`,
    };
  }

  return {
    error: null,
    years: yearsResult.value,
    months: monthsResult.value,
    days: daysResult.value,
    totalDays,
  };
}

function formatPlasticYearsDuration({ years, months, days }) {
  return `${years} έτη, ${months} μήνες, ${days} ημέρες`;
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
    vae: periods.some((period) => period?.employmentCategory === 'vae'),
    yvae: periods.some((period) => period?.employmentCategory === 'yvae'),
    ota_ika_vae: periods.some(
      (period) => period?.employmentCategory === 'ota_ika_vae'
    ),
    ota_public_vae: periods.some(
      (period) => period?.employmentCategory === 'ota_public_vae'
    ),
    ota_ika_yvae: periods.some(
      (period) => period?.employmentCategory === 'ota_ika_yvae'
    ),
  };

  const hasConditionalPremiumPeriods = Object.values(presence).some(Boolean);

  if (!hasConditionalPremiumPeriods) {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      article30SpecialRegimeData: buildArticle30SpecialRegimeData({
        calculatorEdition: normalizedEdition,
        presence,
        usageByRegime: createArticle30UsageByRegime(
          presence,
          'not_applicable'
        ),
        source: 'not_applicable',
      }),
    };
  }

  if (normalizedEdition === CALCULATOR_EDITION_OPTIONS.free) {
    return {
      hasValue: true,
      error: null,
      warnings: [
        'Στη δωρεάν έκδοση δεν ζητείται από τον χρήστη να γνωρίζει αν συνταξιοδοτείται με ειδικές διατάξεις ΒΑΕ, ΥΒΑΕ ή ειδικών κατηγοριών ΟΤΑ. Μέχρι να υπάρχει αυτόματος έλεγχος θεμελίωσης, τα αντίστοιχα επασφάλιστρα δεν προστίθενται και απαιτείται αναλυτικός έλεγχος.',
      ],
      article30SpecialRegimeData: buildArticle30SpecialRegimeData({
        calculatorEdition: normalizedEdition,
        presence,
        usageByRegime: createArticle30UsageByRegime(presence, 'unknown'),
        source: 'free_tool_automatic_check_pending',
      }),
    };
  }

  const normalizedUsageInput = normalizeArticle30SpecialRegimeUsageInput(
    article30SpecialRegimeUsageInput
  );
  const warnings = [];
  const usageByRegime = createArticle30UsageByRegime(
    presence,
    'not_applicable'
  );

  for (const premiumType of getArticle30PremiumTypes()) {
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
    article30SpecialRegimeData: buildArticle30SpecialRegimeData({
      calculatorEdition: normalizedEdition,
      presence,
      usageByRegime,
      source: 'user',
    }),
  };
}

function getArticle30PremiumTypes() {
  return [
    'vae',
    'yvae',
    'ota_ika_vae',
    'ota_public_vae',
    'ota_ika_yvae',
  ];
}

function createArticle30UsageByRegime(presence, activeStatus) {
  return Object.fromEntries(
    getArticle30PremiumTypes().map((premiumType) => [
      premiumType,
      presence[premiumType] ? activeStatus : 'not_applicable',
    ])
  );
}

function buildArticle30SpecialRegimeData({
  calculatorEdition,
  presence,
  usageByRegime,
  source,
}) {
  return {
    calculatorEdition,
    hasVaePeriods: presence.vae,
    hasYvaePeriods: presence.yvae,
    hasOtaIkaVaePeriods: presence.ota_ika_vae,
    hasOtaPublicVaePeriods: presence.ota_public_vae,
    hasOtaIkaYvaePeriods: presence.ota_ika_yvae,
    hasOtaCleaningPeriods:
      presence.ota_ika_vae ||
      presence.ota_public_vae ||
      presence.ota_ika_yvae,
    usageByRegime,
    source,
  };
}

function normalizeArticle30SpecialRegimeUsageInput(value) {
  if (typeof value === 'string') {
    return Object.fromEntries(
      getArticle30PremiumTypes().map((premiumType) => [premiumType, value])
    );
  }

  if (!value || typeof value !== 'object') {
    return Object.fromEntries(
      getArticle30PremiumTypes().map((premiumType) => [premiumType, ''])
    );
  }

  return {
    vae: String(value.vae || '').trim(),
    yvae: String(value.yvae || '').trim(),
    ota_ika_vae: String(value.ota_ika_vae || '').trim(),
    ota_public_vae: String(value.ota_public_vae || '').trim(),
    ota_ika_yvae: String(
      value.ota_ika_yvae || value.ota_cleaning || ''
    ).trim(),
  };
}

function getArticle30PremiumTypeLabel(premiumType) {
  const labels = {
    vae: 'ΒΑΕ',
    yvae: 'ΥΒΑΕ',
    ota_ika_vae: 'ΒΑΕ ΟΤΑ του πρώην ΙΚΑ',
    ota_public_vae: 'ΒΑΕ ΟΤΑ του καθεστώτος Δημοσίου',
    ota_ika_yvae: 'ΥΒΑΕ καθαριότητας / αποκομιδής ΟΤΑ',
  };

  return labels[premiumType] || 'ειδικής εισφοράς';
}

function analyzeInsurancePeriodsDraft({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleNonSalariedEarningsInputMode,
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
        nonSalariedEarningsInputMode:
          groups[index].nonSalariedEarningsInputMode,
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
      displaySuffix: periods.length === 1
        ? '(σύνολο από 1 περίοδο / ομάδα)'
        : `(σύνολο από ${periods.length} περιόδους / ομάδες)`,
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
    nonSalariedEarningsInputMode:
      simpleNonSalariedEarningsInputMode,
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
    nonSalariedEarningsInputMode:
      group.nonSalariedEarningsInputMode || '',
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
    group.nonSalariedEarningsInputMode,
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
  nonSalariedEarningsInputMode,
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
    nonSalariedEarningsInputMode,
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
    nonSalariedEarningsInputMode,
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
  nonSalariedEarningsInputMode,
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

  if (
    fund === 'ota' &&
    employmentCategory === 'ota_ika_yvae' &&
    insuredType !== 'old'
  ) {
    return createInsurancePeriodDraftError(
      'Η επιλογή ΥΒΑΕ ΟΤΑ επιτρέπεται μόνο για παλαιό ασφαλισμένο.',
      mode
    );
  }

  if (!isAllowedEmploymentCategoryForFund({
    fund,
    insuredType,
    employmentCategory,
  })) {
    return createInsurancePeriodDraftError('Η κατηγορία εργασίας / εισφορών δεν ταιριάζει με τον φορέα.', mode);
  }

  const nonSalariedInputModeResult = analyzeNonSalariedEarningsInputMode({
    fund,
    value: nonSalariedEarningsInputMode,
  });

  if (nonSalariedInputModeResult.error) {
    return createInsurancePeriodDraftError(
      nonSalariedInputModeResult.error,
      mode
    );
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
      nonSalariedEarningsInputMode:
        nonSalariedInputModeResult.inputMode,
      nonSalariedEarningsInputModeLabel:
        nonSalariedInputModeResult.inputModeLabel,
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

function analyzeNonSalariedEarningsInputMode({ fund, value }) {
  if (!CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return {
      error: null,
      inputMode: null,
      inputModeLabel: null,
    };
  }

  const inputMode = String(value || '').trim();

  if (!inputMode) {
    return {
      error:
        'Επιλέξτε πώς θα δηλωθούν οι εισφορές ή οι συντάξιμες αποδοχές της μη μισθωτής περιόδου.',
      inputMode: null,
      inputModeLabel: null,
    };
  }

  const option = NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS[inputMode];

  if (!option) {
    return {
      error:
        'Ο τρόπος εισαγωγής εισφορών ή συντάξιμων αποδοχών της μη μισθωτής περιόδου δεν είναι έγκυρος.',
      inputMode: null,
      inputModeLabel: null,
    };
  }

  return {
    error: null,
    inputMode: option.value,
    inputModeLabel: option.label,
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
    nonSalariedEarningsInputMode:
      period.nonSalariedEarningsInputMode || null,
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

function isAllowedEmploymentCategoryForFund({
  fund,
  insuredType,
  employmentCategory,
}) {
  if (SIMPLE_VAE_YVAE_FUNDS.includes(fund)) {
    return ['common', 'vae', 'yvae'].includes(employmentCategory);
  }

  if (OTA_CLEANING_FUNDS.includes(fund)) {
    if (
      employmentCategory === 'ota_ika_yvae' &&
      insuredType !== 'old'
    ) {
      return false;
    }

    return [
      'common',
      'ota_ika_vae',
      'ota_public_vae',
      'ota_ika_yvae',
    ].includes(employmentCategory);
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
      isOtaIkaVaeWork: employmentCategory === 'ota_ika_vae',
      isOtaPublicVaeWork: employmentCategory === 'ota_public_vae',
      isOtaIkaYvaeWork: employmentCategory === 'ota_ika_yvae',
      isOtaCleaningWork: [
        'ota_ika_vae',
        'ota_public_vae',
        'ota_ika_yvae',
      ].includes(employmentCategory),
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

  if (
    fund === 'ota' &&
    ['ota_ika_vae', 'ota_public_vae', 'ota_ika_yvae'].includes(
      employmentCategory
    )
  ) {
    return employmentCategory;
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

function analyzeEtaaExtraBenefits({
  insurancePeriodsDraft,
  etaaExtraBenefitDraft,
}) {
  const periods = Array.isArray(insurancePeriodsDraft)
    ? insurancePeriodsDraft
    : [];

  const presence = {
    tsmede: periods.some((period) => period?.fund === 'tsmede'),
    tsay: periods.some((period) => period?.fund === 'tsay'),
  };

  if (!presence.tsmede && !presence.tsay) {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      etaaExtraBenefitEntries: [],
      etaaExtraBenefitDisplay: [],
      etaaExtraBenefitData: {
        entries: [],
      },
    };
  }

  const draft = normalizeEtaaExtraBenefitDraft(etaaExtraBenefitDraft);
  const entries = [];
  const displayEntries = [];
  const warnings = [];

  if (presence.tsmede) {
    const tsmedeResult = analyzeTsmedeExtraBenefit(draft.tsmede);

    if (tsmedeResult.error) {
      return createEtaaExtraBenefitError(tsmedeResult.error);
    }

    if (tsmedeResult.entry) {
      entries.push(tsmedeResult.entry);
      displayEntries.push(tsmedeResult.displayEntry);
    }
  }

  if (presence.tsay) {
    const tsayResult = analyzeTsayExtraBenefit(draft.tsay);

    if (tsayResult.error) {
      return createEtaaExtraBenefitError(tsayResult.error);
    }

    if (tsayResult.entry) {
      entries.push(tsayResult.entry);
      displayEntries.push(tsayResult.displayEntry);
      warnings.push(
        'Ο Κλάδος Μονοσυνταξιούχων ΤΣΑΥ θα υπολογιστεί με 10 επιπλέον μονάδες εισφοράς, σύμφωνα με την τρέχουσα διοικητική πρακτική του e-ΕΦΚΑ. Η χρήση των 10 μονάδων αμφισβητείται δικαστικά.'
      );
    }
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    etaaExtraBenefitEntries: displayEntries,
    etaaExtraBenefitDisplay: displayEntries.map((entry) => entry.summary),
    etaaExtraBenefitData: {
      entries,
    },
  };
}

function analyzeTsmedeExtraBenefit(value = {}) {
  const status = String(value.status || '').trim();

  if (!status) {
    return {
      error:
        'Δηλώστε αν υπήρχε υπαγωγή στην Ειδική Προσαύξηση ΤΣΜΕΔΕ.',
    };
  }

  if (!['yes', 'no'].includes(status)) {
    return {
      error: 'Η επιλογή για την Ειδική Προσαύξηση ΤΣΜΕΔΕ δεν είναι έγκυρη.',
    };
  }

  if (status === 'no') {
    return {
      error: null,
      entry: null,
      displayEntry: null,
    };
  }

  const baseAmountResult = parsePositiveDecimalForEtaa(
    value.baseAmount,
    'Η μέση μηνιαία βάση της Ειδικής Προσαύξησης ΤΣΜΕΔΕ'
  );

  if (baseAmountResult.error) {
    return { error: baseAmountResult.error };
  }

  const totalDurationResult = analyzeEtaaDuration({
    yearsValue: value.contributionYears,
    monthsValue: value.contributionMonths,
    label: 'Ο συνολικός χρόνος Ειδικής Προσαύξησης ΤΣΜΕΔΕ',
  });

  if (totalDurationResult.error) {
    return { error: totalDurationResult.error };
  }

  const contributionPeriods = [
    {
      years: totalDurationResult.decimalYears,
      extraContributionPoints: TSMEDE_DEFAULT_EXTRA_CONTRIBUTION_POINTS,
      reason: 'Βασική Ειδική Προσαύξηση ΤΣΜΕΔΕ — 12 μονάδες',
    },
  ];

  const higherRateStatus = String(
    value.hasHigherSalariedRateBefore2007 || 'no'
  ).trim();

  if (!['yes', 'no'].includes(higherRateStatus)) {
    return {
      error:
        'Δηλώστε αν καταβλήθηκε υψηλότερο ασφάλιστρο έμμισθου ΤΣΜΕΔΕ πριν από 1/1/2007.',
    };
  }

  if (higherRateStatus === 'yes') {
    const higherRateDurationResult = analyzeEtaaDuration({
      yearsValue: value.higherRateYears,
      monthsValue: value.higherRateMonths,
      label: 'Ο χρόνος υψηλότερου ασφαλίστρου έμμισθου ΤΣΜΕΔΕ',
    });

    if (higherRateDurationResult.error) {
      return { error: higherRateDurationResult.error };
    }

    if (
      higherRateDurationResult.decimalYears >
      totalDurationResult.decimalYears
    ) {
      return {
        error:
          'Ο χρόνος υψηλότερου ασφαλίστρου πριν από το 2007 δεν μπορεί να υπερβαίνει τον συνολικό χρόνο Ειδικής Προσαύξησης ΤΣΜΕΔΕ.',
      };
    }

    const extraPointsResult = parsePositiveDecimalForEtaa(
      value.additionalPointsAboveTwelve,
      'Οι πρόσθετες μονάδες του υψηλότερου ασφαλίστρου ΤΣΜΕΔΕ πάνω από τις 12'
    );

    if (extraPointsResult.error) {
      return { error: extraPointsResult.error };
    }

    contributionPeriods.push({
      years: higherRateDurationResult.decimalYears,
      extraContributionPoints: extraPointsResult.value,
      reason:
        'Πρόσθετη διαφορά υψηλότερου ασφαλίστρου έμμισθου πριν από 1/1/2007',
    });
  }

  const additionalTwoPercentStatus = String(
    value.hasAdditionalTwoPercent || 'no'
  ).trim();

  if (!['yes', 'no'].includes(additionalTwoPercentStatus)) {
    return {
      error:
        'Δηλώστε αν καταβλήθηκε η πρόσθετη εισφορά 2% ΤΣΜΕΔΕ για το διάστημα 1/7/2011–31/12/2015.',
    };
  }

  if (additionalTwoPercentStatus === 'yes') {
    const twoPercentDurationResult = analyzeEtaaDuration({
      yearsValue: value.additionalTwoPercentYears,
      monthsValue: value.additionalTwoPercentMonths,
      label: 'Ο χρόνος καταβολής της πρόσθετης εισφοράς 2% ΤΣΜΕΔΕ',
    });

    if (twoPercentDurationResult.error) {
      return { error: twoPercentDurationResult.error };
    }

    if (
      twoPercentDurationResult.decimalYears >
      TSMEDE_ADDITIONAL_TWO_PERCENT_MAX_YEARS
    ) {
      return {
        error:
          'Η πρόσθετη εισφορά 2% ΤΣΜΕΔΕ μπορεί να δηλωθεί μέχρι 4 έτη και 6 μήνες για το διάστημα 1/7/2011–31/12/2015.',
      };
    }

    contributionPeriods.push({
      years: twoPercentDurationResult.decimalYears,
      extraContributionPoints: 2,
      reason: 'Πρόσθετη εισφορά 2% ΤΣΜΕΔΕ 1/7/2011–31/12/2015',
    });
  }

  const baseAmount = roundToDecimals(baseAmountResult.value, 2);

  return {
    error: null,
    entry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSMEDE_SPECIAL_INCREASE,
      baseAmount,
      contributionPeriods,
      calculationPolicy: 'documented_tsmede_rules',
    },
    displayEntry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSMEDE_SPECIAL_INCREASE,
      label: 'ΤΣΜΕΔΕ — Ειδική Προσαύξηση',
      baseAmount,
      contributionYears: totalDurationResult.decimalYears,
      summary:
        `ΤΣΜΕΔΕ Ειδική Προσαύξηση: βάση ${baseAmount.toFixed(2)} €, ` +
        `${formatEtaaDuration(totalDurationResult)} με βασικές 12 μονάδες` +
        `${higherRateStatus === 'yes' ? ', συν πρόσθετη διαφορά υψηλότερου ασφαλίστρου πριν από το 2007' : ''}` +
        `${additionalTwoPercentStatus === 'yes' ? ', συν πρόσθετη εισφορά 2%' : ''}.`,
    },
  };
}

function analyzeTsayExtraBenefit(value = {}) {
  const status = String(value.status || '').trim();

  if (!status) {
    return {
      error:
        'Δηλώστε αν υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ.',
    };
  }

  if (!['yes', 'no'].includes(status)) {
    return {
      error:
        'Η επιλογή για τον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ δεν είναι έγκυρη.',
    };
  }

  if (status === 'no') {
    return {
      error: null,
      entry: null,
      displayEntry: null,
    };
  }

  const baseAmountResult = parsePositiveDecimalForEtaa(
    value.baseAmount,
    'Η μέση μηνιαία βάση του Κλάδου Μονοσυνταξιούχων ΤΣΑΥ'
  );

  if (baseAmountResult.error) {
    return { error: baseAmountResult.error };
  }

  const durationResult = analyzeEtaaDuration({
    yearsValue: value.contributionYears,
    monthsValue: value.contributionMonths,
    label: 'Ο χρόνος καταβολής εισφοράς Μονοσυνταξιούχων ΤΣΑΥ',
  });

  if (durationResult.error) {
    return { error: durationResult.error };
  }

  const baseAmount = roundToDecimals(baseAmountResult.value, 2);

  return {
    error: null,
    entry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSAY_SINGLE_PENSIONER_BRANCH,
      baseAmount,
      contributionYears: durationResult.decimalYears,
      extraContributionPoints:
        TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
      calculationPolicy: 'efka_administrative_10_points',
    },
    displayEntry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSAY_SINGLE_PENSIONER_BRANCH,
      label: 'ΤΣΑΥ — Κλάδος Μονοσυνταξιούχων',
      baseAmount,
      contributionYears: durationResult.decimalYears,
      extraContributionPoints:
        TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
      summary:
        `ΤΣΑΥ Μονοσυνταξιούχων: βάση ${baseAmount.toFixed(2)} €, ` +
        `${formatEtaaDuration(durationResult)}, υπολογισμός με 10 μονάδες εισφοράς.`,
    },
  };
}

function analyzeEtaaDuration({ yearsValue, monthsValue, label }) {
  const yearsResult = parseNonNegativeIntegerOrEmpty(yearsValue);
  const monthsResult = parseNonNegativeIntegerOrEmpty(monthsValue);

  if (!yearsResult.isValid || !monthsResult.isValid) {
    return {
      error: `${label} πρέπει να δηλωθεί με ακέραια έτη και μήνες.`,
    };
  }

  if (monthsResult.value > 11) {
    return {
      error: `Οι μήνες για ${label.toLowerCase()} πρέπει να είναι από 0 έως 11.`,
    };
  }

  if (yearsResult.value === 0 && monthsResult.value === 0) {
    return {
      error: `${label} πρέπει να είναι μεγαλύτερος από 0.`,
    };
  }

  return {
    error: null,
    years: yearsResult.value,
    months: monthsResult.value,
    decimalYears: roundToDecimals(
      yearsResult.value + monthsResult.value / 12,
      6
    ),
  };
}

function parsePositiveDecimalForEtaa(value, label) {
  const result = parseNonNegativeDecimal(String(value || '').trim());

  if (!result.isValid || result.value <= 0) {
    return {
      error: `${label} πρέπει να είναι αριθμός μεγαλύτερος από 0.`,
    };
  }

  return {
    error: null,
    value: result.value,
  };
}

function normalizeEtaaExtraBenefitDraft(value) {
  const defaultValue = {
    tsmede: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
      hasHigherSalariedRateBefore2007: 'no',
      higherRateYears: '',
      higherRateMonths: '',
      additionalPointsAboveTwelve: '',
      hasAdditionalTwoPercent: 'no',
      additionalTwoPercentYears: '',
      additionalTwoPercentMonths: '',
    },
    tsay: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
    },
  };

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  return {
    tsmede: {
      ...defaultValue.tsmede,
      ...(value.tsmede || {}),
    },
    tsay: {
      ...defaultValue.tsay,
      ...(value.tsay || {}),
    },
  };
}

function createEtaaExtraBenefitError(error) {
  return {
    hasValue: true,
    error,
    warnings: [],
    etaaExtraBenefitEntries: [],
    etaaExtraBenefitDisplay: [],
    etaaExtraBenefitData: null,
  };
}

function formatEtaaDuration(duration) {
  return `${duration.years} έτη και ${duration.months} μήνες`;
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
  insurancePeriodsDraft = [],
}) {
  const hasContributionBasedPeriod = insurancePeriodsDraft.some((period) => {
    return CONTRIBUTION_BASED_FUNDS.includes(period?.fund);
  });

  if (hasContributionBasedPeriod) {
    return analyzeInsurancePeriodYearlyAmounts({
      currentFormStep,
      yearlyEarningsRows,
      insurancePeriodsDraft,
    });
  }

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

function analyzeInsurancePeriodYearlyAmounts({
  currentFormStep,
  yearlyEarningsRows,
  insurancePeriodsDraft,
}) {
  const method = 'yearly_earnings';
  const methodLabel = 'Ετήσια ποσά και ημέρες ανά ασφαλιστική περίοδο';

  if (currentFormStep !== 'contributory_yearly') {
    return {
      hasValue: true,
      error: null,
      warnings: [
        'Τα ετήσια ποσά των ασφαλιστικών περιόδων θα συμπληρωθούν στο επόμενο βήμα.',
      ],
      requiresContributoryYearlyStep: true,
      contributoryEarningsInputMethod: method,
      contributoryEarningsInputMethodLabel: methodLabel,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
        yearlyAmountSource: 'insurance_period_modes',
      },
    };
  }

  const normalizedRows = normalizeInsurancePeriodYearlyAmountRows({
    rows: yearlyEarningsRows,
    insurancePeriodsDraft,
  });

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
      contributoryEarningsInputMethodLabel: methodLabel,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
        yearlyAmountSource: 'insurance_period_modes',
      },
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings: [],
    requiresContributoryYearlyStep: true,
    contributoryEarningsInputMethod: method,
    contributoryEarningsInputMethodLabel: methodLabel,
    averageMonthlyPensionableEarnings: null,
    yearsData: normalizedRows.yearsData,
    contributoryPensionData: {
      earningsInputMethod: method,
      yearlyAmountSource: 'insurance_period_modes',
      yearsData: normalizedRows.yearsData,
    },
  };
}

function normalizeInsurancePeriodYearlyAmountRows({
  rows,
  insurancePeriodsDraft,
}) {
  if (!Array.isArray(rows)) {
    return {
      error: 'Τα ετήσια στοιχεία δεν έχουν σωστή μορφή.',
      yearsData: [],
    };
  }

  const periods = Array.isArray(insurancePeriodsDraft)
    ? insurancePeriodsDraft
    : [];
  const yearsData = [];
  const seenYears = new Set();

  for (const row of rows) {
    const yearText = String(row.year || '').trim();
    const amountText = String(row.annualEarnings || '').trim();
    const daysText = String(row.insuranceDays || '').trim();
    const hasUsefulValue = Boolean(amountText || daysText);

    if (!hasUsefulValue) {
      continue;
    }

    const yearResult = parseNonNegativeInteger(yearText);

    if (!yearResult.isValid || yearResult.value < 2002) {
      return {
        error: 'Κάθε γραμμή πρέπει να έχει έγκυρο έτος από το 2002 και μετά.',
        yearsData: [],
      };
    }

    if (seenYears.has(yearResult.value)) {
      return {
        error: `Το έτος ${yearResult.value} έχει δηλωθεί περισσότερες από μία φορές.`,
        yearsData: [],
      };
    }

    const matchingPeriods = periods.filter((period) => {
      const fromYear = getIsoDateYear(period?.fromDate);
      const toYear = getIsoDateYear(period?.toDate);

      return (
        fromYear !== null &&
        toYear !== null &&
        yearResult.value >= fromYear &&
        yearResult.value <= toYear
      );
    });

    if (matchingPeriods.length === 0) {
      return {
        error: `Το έτος ${yearResult.value} δεν ανήκει σε δηλωμένη ασφαλιστική περίοδο.`,
        yearsData: [],
      };
    }

    if (matchingPeriods.length > 1) {
      return {
        error:
          `Το έτος ${yearResult.value} ανήκει σε περισσότερες από μία ασφαλιστικές περιόδους. ` +
          'Χρειάζεται αναλυτική κατανομή μέσα στο ίδιο έτος.',
        yearsData: [],
      };
    }

    const amountResult = parseNonNegativeDecimal(amountText);

    if (!amountResult.isValid || amountResult.value <= 0) {
      return {
        error: `Το ετήσιο ποσό για το έτος ${yearResult.value} πρέπει να είναι αριθμός μεγαλύτερος από 0.`,
        yearsData: [],
      };
    }

    const daysResult = parseNonNegativeInteger(daysText);

    if (!daysResult.isValid || daysResult.value <= 0) {
      return {
        error: `Οι ημέρες ασφάλισης για το έτος ${yearResult.value} πρέπει να είναι ακέραιος αριθμός μεγαλύτερος από 0.`,
        yearsData: [],
      };
    }

    seenYears.add(yearResult.value);
    yearsData.push({
      year: yearResult.value,
      annualAmount: roundToDecimals(amountResult.value, 2),
      insuranceDays: daysResult.value,
    });
  }

  return {
    error: null,
    yearsData,
  };
}

function getIsoDateYear(value) {
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(String(value || '').trim());

  if (!match) {
    return null;
  }

  return Number(match[1]);
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
