


import {
  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS,
  PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT,
  PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE,
  PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002,
  PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED,
  detectParallelInsuranceSegments,
  normalizeParallelContributionInputMode,
  normalizeParallelInsuranceDraft,
} from "./parallelInsuranceFormUtils";
import {
  normalizeAuxiliaryContributionDraft,
  resolveAuxiliaryFormClassification,
} from "./auxiliaryContributionFormUtils";
import {
  EMPLOYMENT_CATEGORY_DEFINITIONS,
  buildContributionCategoryForFundWorkType,
  isEmploymentCategoryAllowedForFund,
} from "../data/insuranceFundWorkTypeRules";
import {
  deriveUniformedInsuranceRegimeFromDate,
  getUniformedBodyLabel,
  normalizeUniformedBody,
} from "./uniformedBodyOptions";

const INSURANCE_DAYS_PER_YEAR = 300;
const INSURANCE_DAYS_PER_MONTH = 25;
const MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION = 15;
const MAX_EARLY_REDUCTION_MONTHS = 60;
const MAX_INSURANCE_PERIOD_GROUPS = 10;
const FREE_RECOGNIZED_ARTICLE_41_SEMESTERS_TYPE =
  "recognized_article_41";

const PENSION_TYPE_OPTIONS = {
  old_age: {
    value: "old_age",
    label: "Γήρατος",
  },
  disability: {
    value: "disability",
    label: "Αναπηρίας",
  },
};

const OLD_AGE_CATEGORY_OPTIONS = {
  standard: {
    value: "standard",
    label: "Κανονική σύνταξη γήρατος",
  },
  special_disease: {
    value: "special_disease",
    label: "Γήρατος λόγω ειδικών παθήσεων",
  },
};

const PENSION_MODE_OPTIONS = {
  full: {
    value: "full",
    label: "Πλήρης",
  },
  reduced: {
    value: "reduced",
    label: "Μειωμένη",
  },
};

const DISABILITY_CATEGORY_OPTIONS = {
  eighty_plus: {
    value: "eighty_plus",
    label: "80% και άνω",
    disabilityPercentage: 80,
  },
  sixty_seven_to_seventy_nine: {
    value: "sixty_seven_to_seventy_nine",
    label: "67% έως 79,99%",
    disabilityPercentage: 67,
  },
  fifty_to_sixty_six: {
    value: "fifty_to_sixty_six",
    label: "50% έως 66,99%",
    disabilityPercentage: 50,
  },
};

const INSURANCE_TIME_INPUT_METHOD_OPTIONS = {
  insurance_days: {
    value: "insurance_days",
    label: "Με αριθμό ενσήμων / ημερών ασφάλισης",
  },
  years_months_days: {
    value: "years_months_days",
    label: "Με έτη, μήνες και ημέρες",
  },
};

const CONTRIBUTORY_EARNINGS_INPUT_METHOD_OPTIONS = {
  average_monthly: {
    value: "average_monthly",
    label: "Έτοιμος μέσος μηνιαίος συντάξιμος μισθός",
  },
  yearly_earnings: {
    value: "yearly_earnings",
    label: "Αποδοχές και ένσημα ανά έτος",
  },
};

const NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS = {
  annual_pensionable_earnings: {
    value: "annual_pensionable_earnings",
    label: "Ετήσιο ασφαλιστέο / συντάξιμο εισόδημα",
  },
  annual_pension_contribution: {
    value: "annual_pension_contribution",
    label: "Ετήσια εισφορά κύριας σύνταξης",
  },
};

const CALCULATOR_EDITION_OPTIONS = {
  professional: "professional",
  free: "free",
};

const ARTICLE30_SPECIAL_REGIME_USAGE_OPTIONS = {
  yes: "yes",
  no: "no",
  unknown: "unknown",
};

const INSURANCE_PERIODS_INPUT_MODE_OPTIONS = {
  disabled: {
    value: "disabled",
    label: "Δεν δηλώθηκε κατηγορία συνολικού χρόνου ασφάλισης",
  },
  simple: {
    value: "simple",
    label: "Μία κατηγορία ασφάλισης",
  },
  multiple: {
    value: "multiple",
    label: "Περισσότερες κατηγορίες / περίοδοι",
  },
};

const INSURANCE_PERIOD_FUND_OPTIONS = {
  ika: {
    value: "ika",
    label: "ΙΚΑ / e-ΕΦΚΑ μισθωτών",
  },
  public_sector: {
    value: "public_sector",
    label: "Δημόσιο (γενική κατηγορία)",
  },
  ota: {
    value: "ota",
    label: "ΟΤΑ / υπηρεσίες καθαριότητας και υγιεινής",
  },
  uniformed: {
    value: "uniformed",
    label: "Ένστολοι / στρατιωτικοί",
  },
  tap_dei: {
    value: "tap_dei",
    label: "ΤΑΠ-ΔΕΗ",
  },
  ika_tsp_hsap: {
    value: "ika_tsp_hsap",
    label: "τ. ΤΣΠ-ΗΣΑΠ",
  },
  ika_tsp_ete: {
    value: "ika_tsp_ete",
    label: "τ. ΤΣΠ-ΕΤΕ",
  },
  ika_tap_etba: {
    value: "ika_tap_etba",
    label: "τ. ΤΑΠ-ΕΤΒΑ",
  },
  tapae_ethniki: {
    value: "tapae_ethniki",
    label: "ΤΑΠΑΕ «Η Εθνική»",
  },
  tseapgso: {
    value: "tseapgso",
    label: "τ. ΤΣΕΑΠΓΣΟ",
  },
  ika_tap_ote_ote: {
    value: "ika_tap_ote_ote",
    label: "τ. ΤΑΠ-ΟΤΕ — ΟΤΕ",
  },
  ika_tap_ote_ose_elta: {
    value: "ika_tap_ote_ose_elta",
    label: "τ. ΤΑΠ-ΟΤΕ — ΟΣΕ / ΕΛΤΑ",
  },
  ika_tap_ote_staff: {
    value: "ika_tap_ote_staff",
    label: "τ. ΤΑΠ-ΟΤΕ — υπάλληλοι τ. ΤΑΠΟΤΕ",
  },
  ika_npdd_special: {
    value: "ika_npdd_special",
    label: "Τακτικοί υπάλληλοι ΙΚΑ / ΝΠΔΔ ειδικού καθεστώτος",
  },
  etap_mme_tattath: {
    value: "etap_mme_tattath",
    label: "ΕΤΑΠ-ΜΜΕ / πρώην ΤΑΤΤΑΘ",
  },
  tanpy: {
    value: "tanpy",
    label: "ΤΑΝΠΥ / έμμισθοι ναυτικοί πράκτορες",
  },
  deko: {
    value: "deko",
    label: "Άλλη ΔΕΚΟ / οργανισμός κοινής ωφέλειας",
  },
  nat: {
    value: "nat",
    label: "ΝΑΤ / ναυτικοί",
  },
  aviation: {
    value: "aviation",
    label: "Αεροπορικές / ΥΠΑ / χειριστές",
  },
  artistic: {
    value: "artistic",
    label: "Καλλιτεχνικές κατηγορίες",
  },
  banking_funds: {
    value: "banking_funds",
    label: "Άλλο τραπεζικό ταμείο / συνεταιρισμός",
  },
  oaee: {
    value: "oaee",
    label: "ΟΑΕΕ / ελεύθερος επαγγελματίας",
  },
  etaa: {
    value: "etaa",
    label: "Πρώην ΕΤΑΑ",
  },
  tsmede: {
    value: "tsmede",
    label: "ΤΣΜΕΔΕ",
  },
  tsay: {
    value: "tsay",
    label: "ΤΣΑΥ — Ελεύθερος επαγγελματίας",
  },
  tsay_salaried: {
    value: "tsay_salaried",
    label: "ΤΣΑΥ — Μισθωτός",
  },
  oga: {
    value: "oga",
    label: "Πρώην ΟΓΑ / αγρότης",
  },
};

const INSURED_TYPE_OPTIONS = {
  old: {
    value: "old",
    label: "Παλαιός",
  },
  new: {
    value: "new",
    label: "Νέος",
  },
  not_applicable: {
    value: "not_applicable",
    label: "Δεν απαιτείται για αυτή την κατηγορία",
  },
};

const EMPLOYMENT_CATEGORY_OPTIONS = EMPLOYMENT_CATEGORY_DEFINITIONS;

const ARTICLE30_MAIN_CONTRIBUTION_FUNDS = [
  "ika_tsp_hsap",
  "ika_tsp_ete",
  "ika_tap_etba",
  "tapae_ethniki",
  "tseapgso",
  "ika_tap_ote_ote",
  "ika_tap_ote_ose_elta",
  "ika_tap_ote_staff",
  "aviation",
  "artistic",
  "ika_npdd_special",
  "etap_mme_tattath",
  "tanpy",
];

const CONTRIBUTION_BASED_FUNDS = ["oaee", "etaa", "tsmede", "tsay", "oga"];

const ETAA_EXTRA_BENEFIT_TYPES = {
  TSMEDE_SPECIAL_INCREASE: "tsmede_special_increase",
  TSAY_SINGLE_PENSIONER_BRANCH: "tsay_single_pensioner_branch",
};

const TSMEDE_DEFAULT_EXTRA_CONTRIBUTION_POINTS = 12;
const TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS = 10;
const TSMEDE_ADDITIONAL_TWO_PERCENT_MAX_YEARS = 4.5;

const PLASTIC_YEARS_RECOGNITION_STATUS_OPTIONS = ["recognized", "planned"];
const PLASTIC_YEARS_RECOGNITION_MODE_OPTIONS = ["paid", "free"];
const PLASTIC_YEARS_FINANCIAL_INPUT_MODE_OPTIONS = [
  "monthly_base",
  "buyout_amount_and_rate",
];

function analyzePensionForm({
  currentFormStep = "main",
  calculatorEdition = "professional",
  birthDateInput,
  firstInsuranceYearInput,
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
  simpleTsaySinglePensionerStatus,
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
  parallelInsuranceDraft,
  plasticYearsDraft,
  etaaExtraBenefitDraft,
  auxiliaryContributionDraft,
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
  const birthDateAnalysis = analyzeBirthDate({
    value: birthDateInput,
    pensionDate: dateAnalysis.pensionDate,
  });
  const firstInsuranceYearAnalysis = analyzeFirstInsuranceYear({
    calculatorEdition,
    value: firstInsuranceYearInput,
    birthDate: birthDateAnalysis.birthDate,
    pensionDate: dateAnalysis.pensionDate,
  });
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
    globalInsuredType:
      firstInsuranceYearAnalysis.insuredType,
    simpleFundInput,
    simpleInsuredTypeInput,
    simpleEmploymentCategoryInput,
    simpleNonSalariedEarningsInputMode,
    simpleTsaySinglePensionerStatus,
    simpleFromDateInput,
    simpleToDateInput,
    simpleTimeInputMethod,
    simpleInsuranceDaysInput,
    simpleInsuranceYearsInput,
    simpleInsuranceMonthsInput,
    simpleInsuranceExtraDaysInput,
    simpleUniformedSpecialTimeDraft,
    auxiliaryContributionDraft,
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
  const firstInsuranceYearConsistencyAnalysis =
    analyzeFirstInsuranceYearConsistency({
      calculatorEdition,
      firstInsuranceYear:
        firstInsuranceYearAnalysis.firstInsuranceYear,
      insurancePeriodsDraft:
        insurancePeriodsAnalysis.insurancePeriodsDraft,
    });

  const parallelInsuranceSegments = detectParallelInsuranceSegments(
    insurancePeriodsAnalysis.insurancePeriodsDraft,
  );

  const contributoryAnalysis = analyzeContributoryPensionInputs({
    currentFormStep,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft,
    parallelInsuranceSegments,
    parallelInsuranceDraft,
  });

  const parallelInsuranceAnalysis = analyzeParallelInsuranceDraft({
    currentFormStep,
    calculatorEdition,
    detectedSegments: parallelInsuranceSegments,
    parallelInsuranceDraft,
    hasDetailedYearsData:
      Array.isArray(contributoryAnalysis.yearsData) &&
      contributoryAnalysis.yearsData.length > 0,
  });

  const plasticYearsAnalysis = analyzePlasticYearsDraft({
    calculatorEdition,
    plasticYearsDraft,
    contributoryEarningsInputMethod,
  });

  const uniformedRecognitionCapAnalysis =
    analyzeUniformedRecognitionCap({
      calculatorEdition,
      pensionYear: dateAnalysis.pensionYear,
      insurancePeriodsDraft:
        insurancePeriodsAnalysis.insurancePeriodsDraft,
      plasticYearsDraft:
        plasticYearsAnalysis.plasticYearsDraft,
    });

  const isMultipleInsuranceMode =
    insurancePeriodsAnalysis.insurancePeriodsInputMode === "multiple";

  const effectiveInsuranceTimeAnalysis =
    insurancePeriodsAnalysis.totalInsuranceTimeAnalysis ||
    insuranceTimeAnalysis;
  const parallelInsuranceTimeSummary = buildParallelInsuranceTimeSummary({
    insuranceTimeAnalysis: effectiveInsuranceTimeAnalysis,
    parallelInsuranceDisplay:
      parallelInsuranceAnalysis.parallelInsuranceDisplay,
  });

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
    birthDateAnalysis.error,
    firstInsuranceYearAnalysis.error,
    firstInsuranceYearConsistencyAnalysis.error,
    pensionTypeAnalysis.error,
    oldAgeAnalysis.error,
    disabilityAnalysis.error,
    isMultipleInsuranceMode ? null : insuranceTimeAnalysis.error,
    insurancePeriodsAnalysis.error,
    parallelInsuranceAnalysis.error,
    article30SpecialRegimeAnalysis.error,
    plasticYearsAnalysis.error,
    uniformedRecognitionCapAnalysis.error,
    etaaExtraBenefitAnalysis.error,
    contributoryAnalysis.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      isReady: false,
      error: errors[0],
      requiresContributoryYearlyStep:
        contributoryAnalysis.requiresContributoryYearlyStep === true,
      parallelInsuranceSegments,
    };
  }

  const isReady =
    dateAnalysis.hasValue &&
    birthDateAnalysis.hasValue &&
    firstInsuranceYearAnalysis.hasValue &&
    firstInsuranceYearConsistencyAnalysis.hasValue &&
    pensionTypeAnalysis.hasValue &&
    oldAgeAnalysis.hasValue &&
    disabilityAnalysis.hasValue &&
    effectiveInsuranceTimeAnalysis.hasValue &&
    insurancePeriodsAnalysis.hasValue &&
    parallelInsuranceAnalysis.hasValue &&
    article30SpecialRegimeAnalysis.hasValue &&
    plasticYearsAnalysis.hasValue &&
    uniformedRecognitionCapAnalysis.hasValue &&
    etaaExtraBenefitAnalysis.hasValue &&
    contributoryAnalysis.hasValue;

  if (!isReady) {
    return {
      isReady: false,
      error: null,
      requiresContributoryYearlyStep:
        contributoryAnalysis.requiresContributoryYearlyStep === true,
      parallelInsuranceSegments,
    };
  }

  const warnings = [
    ...oldAgeAnalysis.warnings,
    ...disabilityAnalysis.warnings,
    ...insuranceTimeAnalysis.warnings,
    ...insurancePeriodsAnalysis.warnings,
    ...parallelInsuranceAnalysis.warnings,
    ...article30SpecialRegimeAnalysis.warnings,
    ...plasticYearsAnalysis.warnings,
    ...uniformedRecognitionCapAnalysis.warnings,
    ...etaaExtraBenefitAnalysis.warnings,
    ...contributoryAnalysis.warnings,
  ];

  const calculationInput = {
    generalInfoData: {
      birthDate: birthDateAnalysis.birthDate,
      ageAtPensionStart: birthDateAnalysis.ageAtPensionStart,
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

      insuranceTimeInputMethod:
        effectiveInsuranceTimeAnalysis.insuranceTimeInputMethod,
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
      createBackendSafeInsurancePeriodDraft,
    ),
    parallelInsuranceDraft: parallelInsuranceAnalysis.parallelInsuranceDraft,
    article30SpecialRegimeData:
      article30SpecialRegimeAnalysis.article30SpecialRegimeData,
    plasticYearsDraft: plasticYearsAnalysis.plasticYearsDraft,
    nonContributoryPlasticYearsDraft:
      plasticYearsAnalysis.nonContributoryPlasticYearsDraft || [],
    etaaExtraBenefitData: etaaExtraBenefitAnalysis.etaaExtraBenefitData,
  };

  return {
    isReady: true,
    error: null,
    warnings,
    requiresContributoryYearlyStep:
      contributoryAnalysis.requiresContributoryYearlyStep === true,

    displayBirthDate: birthDateAnalysis.displayBirthDate,
    ageAtPensionStart: birthDateAnalysis.ageAtPensionStart,
    firstInsuranceYear:
      firstInsuranceYearAnalysis.firstInsuranceYear,
    insuredTypeFromFirstInsuranceYear:
      firstInsuranceYearAnalysis.insuredType,
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

    insuranceTimeInputMethod:
      effectiveInsuranceTimeAnalysis.insuranceTimeInputMethod,
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

    hasParallelInsuranceTimeAdjustment:
      parallelInsuranceTimeSummary.hasAdjustment,
    initialSummedInsuranceTimeDisplay:
      parallelInsuranceTimeSummary.initialSummedInsuranceTimeDisplay,
    initialSummedInsuranceDays:
      parallelInsuranceTimeSummary.initialSummedInsuranceDays,
    initialSummedInsuranceDecimalYears:
      parallelInsuranceTimeSummary.initialSummedInsuranceDecimalYears,
    duplicateParallelInsuranceDays:
      parallelInsuranceTimeSummary.duplicateParallelInsuranceDays,
    cleanedInsuranceTimeDisplay:
      parallelInsuranceTimeSummary.cleanedInsuranceTimeDisplay,
    cleanedInsuranceDays: parallelInsuranceTimeSummary.cleanedInsuranceDays,
    cleanedInsuranceDecimalYears:
      parallelInsuranceTimeSummary.cleanedInsuranceDecimalYears,

    insurancePeriodsInputMode:
      insurancePeriodsAnalysis.insurancePeriodsInputMode,
    insurancePeriodsInputModeLabel:
      insurancePeriodsAnalysis.insurancePeriodsInputModeLabel,
    insurancePeriodsDraft: insurancePeriodsAnalysis.insurancePeriodsDraft,
    insurancePeriodsDraftCount:
      insurancePeriodsAnalysis.insurancePeriodsDraft.length,
    insurancePeriodDraftDisplay:
      insurancePeriodsAnalysis.insurancePeriodDraftDisplay,
    auxiliaryContributionDisplay:
      insurancePeriodsAnalysis.auxiliaryContributionDisplay,

    parallelInsuranceSegments,
    parallelInsuranceDraft: parallelInsuranceAnalysis.parallelInsuranceDraft,
    parallelInsuranceDisplay:
      parallelInsuranceAnalysis.parallelInsuranceDisplay,

    plasticYearsDraft: plasticYearsAnalysis.plasticYearsDraft,
    plasticYearsDisplay: plasticYearsAnalysis.plasticYearsDisplay,
    paidPlasticYearsCount: plasticYearsAnalysis.paidPlasticYearsCount,

    etaaExtraBenefitEntries: etaaExtraBenefitAnalysis.etaaExtraBenefitEntries,
    etaaExtraBenefitDisplay: etaaExtraBenefitAnalysis.etaaExtraBenefitDisplay,

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

function analyzeUniformedRecognitionCap({
  calculatorEdition,
  pensionYear,
  insurancePeriodsDraft,
  plasticYearsDraft,
}) {
  const periods = Array.isArray(insurancePeriodsDraft)
    ? insurancePeriodsDraft
    : [];
  const warnings = [];

  const uniformedPeriods = periods.filter(
    (period) => period?.fund === "uniformed",
  );
  const hasDeclaredSpecialSemesters = uniformedPeriods.some(
    (period) =>
      period?.uniformedSpecialTimeDraft?.specialSemesters?.status ===
      "yes",
  );

  if (hasDeclaredSpecialSemesters) {
    warnings.push(
      "Η δωρεάν έκδοση ελέγχει τον δηλωμένο αριθμητικό χρόνο και το συνολικό πλαφόν, αλλά δεν επιβεβαιώνει ακόμη όλες τις ειδικές υπηρεσιακές προϋποθέσεις κάθε κατηγορίας εξαμήνων. Δηλώστε μόνο εξάμηνα που πράγματι δικαιούστε.",
    );
  }

  const declaredCombatPeriods = uniformedPeriods
    .map((period) => {
      const combatDaysResult =
        getCombatFiveYearServiceDaysForAnalysis(
          period?.uniformedSpecialTimeDraft
            ?.combatFiveYearService,
        );

      return {
        period,
        days: combatDaysResult.days || 0,
      };
    })
    .filter((item) => item.days > 0);
  const totalCombatFiveYearDays = declaredCombatPeriods.reduce(
    (sum, item) => sum + item.days,
    0,
  );
  const maximumCombatFiveYearDays =
    5 * INSURANCE_DAYS_PER_YEAR;

  if (totalCombatFiveYearDays > maximumCombatFiveYearDays) {
    const totalCombatYears = roundToDecimals(
      totalCombatFiveYearDays / INSURANCE_DAYS_PER_YEAR,
      3,
    );
    const periodCount = declaredCombatPeriods.length;
    const periodWord =
      periodCount === 1 ? "περίοδο" : "περιόδους";

    return {
      hasValue: true,
      error:
        "Η μάχιμη πενταετία αναγνωρίζεται συνολικά έως 5 έτη για τον ίδιο ασφαλισμένο, " +
        "ανεξάρτητα από το πόσες περιόδους ενστόλου έχουν δηλωθεί. " +
        `Έχετε δηλώσει συνολικά ${totalCombatYears} έτη σε ${periodCount} ${periodWord}. ` +
        "Αφαιρέστε τη δεύτερη πλήρη πενταετία ή διορθώστε τους επιμέρους χρόνους, " +
        "ώστε το συνολικό άθροισμα να μην ξεπερνά τα 5 έτη.",
      warnings,
    };
  }

  if (calculatorEdition !== CALCULATOR_EDITION_OPTIONS.free) {
    return {
      hasValue: true,
      error: null,
      warnings,
    };
  }

  const newRegimePeriods = uniformedPeriods.filter(
    (period) =>
      period?.uniformedSpecialTimeDraft?.insuranceRegime ===
      "new_ika",
  );

  if (newRegimePeriods.length === 0) {
    return {
      hasValue: true,
      error: null,
      warnings,
    };
  }

  const specialTimeDays = newRegimePeriods.reduce(
    (sum, period) => {
      const draft =
        period.uniformedSpecialTimeDraft || {};
      const combatDays =
        getCombatFiveYearServiceDaysForAnalysis(
          draft.combatFiveYearService,
        ).days || 0;
      const semesterDays =
        getSpecialSemestersDaysForAnalysis(
          draft.specialSemesters,
          "new_ika",
        ).days || 0;

      return sum + combatDays + semesterDays;
    },
    0,
  );

  const otherRecognizedDays = (Array.isArray(plasticYearsDraft)
    ? plasticYearsDraft
    : []
  ).reduce((sum, entry) => {
    const duration = entry?.duration || {};

    return (
      sum +
      Number(duration.years || 0) *
        INSURANCE_DAYS_PER_YEAR +
      Number(duration.months || 0) *
        INSURANCE_DAYS_PER_MONTH +
      Number(duration.days || 0)
    );
  }, 0);

  const recognitionCapYears =
    getUniformedRecognitionCapYears(pensionYear);
  const recognitionCapDays =
    recognitionCapYears * INSURANCE_DAYS_PER_YEAR;
  const totalRecognizedDays =
    specialTimeDays + otherRecognizedDays;

  if (totalRecognizedDays > recognitionCapDays) {
    const totalYears = roundToDecimals(
      totalRecognizedDays / INSURANCE_DAYS_PER_YEAR,
      3,
    );
    const specialYears = roundToDecimals(
      specialTimeDays / INSURANCE_DAYS_PER_YEAR,
      3,
    );
    const otherYears = roundToDecimals(
      otherRecognizedDays / INSURANCE_DAYS_PER_YEAR,
      3,
    );

    return {
      hasValue: true,
      error:
        `Για κατάταξη από 01/01/2011 και σύνταξη το ${pensionYear}, ` +
        `το σύνολο αναγνωριζόμενων χρόνων είναι ${totalYears} έτη ` +
        `(μάχιμη πενταετία / εξάμηνα ${specialYears} και λοιποί αναγνωριζόμενοι χρόνοι ${otherYears}) ` +
        `και ξεπερνά το όριο των ${recognitionCapYears} ετών.`,
      warnings,
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings,
  };
}

function getUniformedRecognitionCapYears(pensionYear) {
  const year = Number(pensionYear);

  if (year <= 2011) {
    return 4;
  }

  if (year === 2012) {
    return 5;
  }

  if (year === 2013) {
    return 6;
  }

  return 7;
}

function buildParallelInsuranceTimeSummary({
  insuranceTimeAnalysis,
  parallelInsuranceDisplay,
}) {
  const initialSummedInsuranceDays = roundToDecimals(
    insuranceTimeAnalysis?.totalInsuranceDaysEquivalent || 0,
    4,
  );
  const duplicateParallelInsuranceDays = roundToDecimals(
    (Array.isArray(parallelInsuranceDisplay)
      ? parallelInsuranceDisplay
      : []
    ).reduce((sum, segment) => {
      return sum + Number(segment?.duplicateInsuranceDays || 0);
    }, 0),
    4,
  );
  const cleanedInsuranceDays = roundToDecimals(
    Math.max(0, initialSummedInsuranceDays - duplicateParallelInsuranceDays),
    4,
  );
  const cleanedDisplayTime =
    convertInsuranceDaysToDisplayTime(cleanedInsuranceDays);

  return {
    hasAdjustment: duplicateParallelInsuranceDays > 0,
    initialSummedInsuranceTimeDisplay:
      insuranceTimeAnalysis?.insuranceTimeDisplay || "",
    initialSummedInsuranceDays,
    initialSummedInsuranceDecimalYears: roundToDecimals(
      initialSummedInsuranceDays / INSURANCE_DAYS_PER_YEAR,
      6,
    ),
    duplicateParallelInsuranceDays,
    cleanedInsuranceTimeDisplay:
      `${cleanedInsuranceDays} ημέρες ασφάλισης ` +
      `(${cleanedDisplayTime.years} έτη, ${cleanedDisplayTime.months} μήνες, ${cleanedDisplayTime.days} ημέρες)`,
    cleanedInsuranceDays,
    cleanedInsuranceDecimalYears: roundToDecimals(
      cleanedInsuranceDays / INSURANCE_DAYS_PER_YEAR,
      6,
    ),
  };
}

function analyzeParallelInsuranceDraft({
  currentFormStep,
  calculatorEdition,
  detectedSegments,
  parallelInsuranceDraft,
  hasDetailedYearsData,
}) {
  const segments = Array.isArray(detectedSegments) ? detectedSegments : [];

  if (segments.length === 0) {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      parallelInsuranceDraft: {
        calculationMode: "single_unified_main_pension",
        segments: [],
      },
      parallelInsuranceDisplay: [],
    };
  }

  if (calculatorEdition === "free") {
    return {
      hasValue: false,
      error:
        "Οι ημερομηνίες των ασφαλιστικών περιόδων της δωρεάν έκδοσης δεν πρέπει να επικαλύπτονται.",
      warnings: [],
      parallelInsuranceDraft: {
        calculationMode: "single_unified_main_pension",
        segments: [],
      },
      parallelInsuranceDisplay: [],
    };
  }

  const normalizedDraft = normalizeParallelInsuranceDraft(
    parallelInsuranceDraft,
  );
  const normalizedSegments = [];
  const display = [];
  const removedDaysByPeriodId = new Map();
  const removedDaysByOverlapGroupId = new Map();
  let totalDeclaredDuplicateDays = 0;

  for (const segment of segments) {
    const segmentDraft = normalizedDraft.segments[segment.id] || {};
    const timeCountingPeriodId = String(
      segmentDraft.timeCountingPeriodId || "",
    ).trim();

    if (!segment.periodIds.includes(timeCountingPeriodId)) {
      return {
        hasValue: false,
        error:
          "Επιλέξτε ποια περίοδος θα μετρήσει μία φορά στον συνολικό ασφαλιστικό χρόνο για κάθε επικάλυψη.",
        warnings: [],
        parallelInsuranceDraft: {
          calculationMode: "single_unified_main_pension",
          segments: [],
        },
        parallelInsuranceDisplay: display,
      };
    }

    const overlapGroupId = getParallelOverlapGroupId(segment);
    const overlapGroupMaximumDuplicateInsuranceDays =
      getParallelOverlapGroupMaximumDuplicateDays(segment);
    const additionalPeriods = [];
    let duplicateInsuranceDays = 0;

    for (const periodId of segment.periodIds) {
      if (periodId === timeCountingPeriodId) {
        continue;
      }

      const additionalDraft = segmentDraft.additionalPeriods?.[periodId] || {};
      const daysText = String(
        additionalDraft.insuranceDaysToRemove ?? "",
      ).trim();
      const daysResult = parseNonNegativeDecimal(daysText);
      const period = segment.periods.find(
        (candidate) => candidate.id === periodId,
      );
      const maximumDuplicateInsuranceDays =
        getPossibleMaximumParallelDuplicateDaysForPeriod(segment, periodId);

      if (!daysResult.isValid) {
        return {
          hasValue: false,
          error:
            "Συμπληρώστε τις πραγματικές ημέρες που δεν πρέπει να μετρηθούν δεύτερη φορά για κάθε πρόσθετη περίοδο. Επιτρέπεται τιμή από 0 έως το εμφανιζόμενο ανώτατο όριο.",
          warnings: [],
          parallelInsuranceDraft: {
            calculationMode: "single_unified_main_pension",
            segments: [],
          },
          parallelInsuranceDisplay: display,
        };
      }

      if (
        Number.isFinite(maximumDuplicateInsuranceDays) &&
        daysResult.value > maximumDuplicateInsuranceDays + 0.0001
      ) {
        return {
          hasValue: false,
          error:
            `Οι ημέρες που δηλώθηκαν για την περίοδο ${period?.label || periodId} ` +
            `δεν μπορούν να ξεπερνούν τις ${maximumDuplicateInsuranceDays}.`,
          warnings: [],
          parallelInsuranceDraft: {
            calculationMode: "single_unified_main_pension",
            segments: [],
          },
          parallelInsuranceDisplay: display,
        };
      }

      const previousRemovedDays = removedDaysByPeriodId.get(periodId) || 0;
      const newRemovedDays = previousRemovedDays + daysResult.value;
      const declaredPeriodInsuranceDays =
        getParallelPeriodDeclaredInsuranceDays(segment, periodId);

      if (
        Number.isFinite(declaredPeriodInsuranceDays) &&
        newRemovedDays > declaredPeriodInsuranceDays + 0.0001
      ) {
        return {
          hasValue: false,
          error:
            `Οι συνολικές ημέρες που αφαιρούνται από την περίοδο ${period?.label || periodId} ` +
            `δεν μπορούν να ξεπερνούν τις ${declaredPeriodInsuranceDays} δηλωμένες ημέρες της.`,
          warnings: [],
          parallelInsuranceDraft: {
            calculationMode: "single_unified_main_pension",
            segments: [],
          },
          parallelInsuranceDisplay: display,
        };
      }

      removedDaysByPeriodId.set(periodId, newRemovedDays);

      const normalizedAdditionalPeriod = {
        periodId,
        insuranceDaysToRemove: roundToDecimals(daysResult.value, 4),
      };

      duplicateInsuranceDays += daysResult.value;

      if (
        segment.periodType === "until_2016" &&
        daysResult.value > 0
      ) {
        const contributionUnitsResult = parseNonNegativeDecimal(
          additionalDraft.contributionUnits,
        );

        if (
          segment.referenceEarningsMode ===
          PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002
        ) {
          normalizedAdditionalPeriod.contributionInputMode =
            PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE;
          normalizedAdditionalPeriod.referenceEarningsSource =
            "post_2002_contributory_pensionable_earnings";
          normalizedAdditionalPeriod.contributionUnitsSource =
            "automatic_from_insurance_period";
        } else {
          const contributionInputMode = normalizeParallelContributionInputMode(
            additionalDraft.contributionInputMode,
            additionalDraft,
          );

          normalizedAdditionalPeriod.contributionInputMode =
            contributionInputMode;

          if (
            contributionInputMode ===
            PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT
          ) {
            const totalContributionAmountResult = parseNonNegativeDecimal(
              additionalDraft.totalContributionAmount,
            );

            if (
              !totalContributionAmountResult.isValid ||
              totalContributionAmountResult.value <= 0
            ) {
              return {
                hasValue: false,
                error:
                  "Συμπληρώστε το συνολικό ποσό εισφορών κύριας σύνταξης για την παράλληλη περίοδο από 1/1/2002 έως 31/12/2016.",
                warnings: [],
                parallelInsuranceDraft: {
                  calculationMode: "single_unified_main_pension",
                  segments: [],
                },
                parallelInsuranceDisplay: display,
              };
            }

            normalizedAdditionalPeriod.totalContributionAmount =
              roundToDecimals(totalContributionAmountResult.value, 2);
          } else {
            const monthlyBaseResult = parseNonNegativeDecimal(
              additionalDraft.monthlyBaseAmount,
            );

            if (!monthlyBaseResult.isValid || monthlyBaseResult.value <= 0) {
              return {
                hasValue: false,
                error:
                  "Συμπληρώστε τη μηνιαία βάση της παράλληλης εισφοράς από 1/1/2002 έως 31/12/2016.",
                warnings: [],
                parallelInsuranceDraft: {
                  calculationMode: "single_unified_main_pension",
                  segments: [],
                },
                parallelInsuranceDisplay: display,
              };
            }

            if (
              !contributionUnitsResult.isValid ||
              contributionUnitsResult.value <= 0
            ) {
              return {
                hasValue: false,
                error:
                  "Συμπληρώστε τις μονάδες εισφοράς της παράλληλης ασφάλισης από 1/1/2002 έως 31/12/2016.",
                warnings: [],
                parallelInsuranceDraft: {
                  calculationMode: "single_unified_main_pension",
                  segments: [],
                },
                parallelInsuranceDisplay: display,
              };
            }

            normalizedAdditionalPeriod.contributionInputMode =
              PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS;
            normalizedAdditionalPeriod.monthlyBaseAmount = roundToDecimals(
              monthlyBaseResult.value,
              2,
            );
            normalizedAdditionalPeriod.contributionUnits = roundToDecimals(
              contributionUnitsResult.value,
              6,
            );
          }
        }
      }

      additionalPeriods.push(normalizedAdditionalPeriod);
    }

    const maximumSegmentDuplicateInsuranceDays =
      getPossibleMaximumParallelDuplicateDaysForSegment(segment);

    if (
      Number.isFinite(maximumSegmentDuplicateInsuranceDays) &&
      duplicateInsuranceDays > maximumSegmentDuplicateInsuranceDays + 0.0001
    ) {
      return {
        hasValue: false,
        error:
          `Οι συνολικές ημέρες που αφαιρούνται στο διάστημα ${segment.fromDateDisplay}–${segment.toDateDisplay} ` +
          `δεν μπορούν να ξεπερνούν τις ${maximumSegmentDuplicateInsuranceDays}.`,
        warnings: [],
        parallelInsuranceDraft: {
          calculationMode: "single_unified_main_pension",
          segments: [],
        },
        parallelInsuranceDisplay: display,
      };
    }

    const previousOverlapGroupRemovedDays =
      removedDaysByOverlapGroupId.get(overlapGroupId) || 0;
    const newOverlapGroupRemovedDays =
      previousOverlapGroupRemovedDays + duplicateInsuranceDays;

    if (
      Number.isFinite(overlapGroupMaximumDuplicateInsuranceDays) &&
      newOverlapGroupRemovedDays >
        overlapGroupMaximumDuplicateInsuranceDays + 0.0001
    ) {
      return {
        hasValue: false,
        error:
          `Οι συνολικές ημέρες που δηλώθηκαν σε όλα τα τεχνικά τμήματα της ίδιας επικάλυψης ` +
          `δεν μπορούν να ξεπερνούν τις ${overlapGroupMaximumDuplicateInsuranceDays}.`,
        warnings: [],
        parallelInsuranceDraft: {
          calculationMode: "single_unified_main_pension",
          segments: [],
        },
        parallelInsuranceDisplay: display,
      };
    }

    removedDaysByOverlapGroupId.set(
      overlapGroupId,
      newOverlapGroupRemovedDays,
    );

    if (
      segment.periodType === "until_2016" &&
      segment.referenceEarningsMode ===
        PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED &&
      duplicateInsuranceDays > 0 &&
      segmentDraft.baseEarningsConfirmed !== true
    ) {
      return {
        hasValue: false,
        error:
          "Επιβεβαιώστε ότι οι βασικές αποδοχές έως 31/12/2016 δεν περιλαμβάνουν δεύτερη φορά την παράλληλη δραστηριότητα.",
        warnings: [],
        parallelInsuranceDraft: {
          calculationMode: "single_unified_main_pension",
          segments: [],
        },
        parallelInsuranceDisplay: display,
      };
    }

    if (
      segment.periodType === "from_2017" &&
      duplicateInsuranceDays > 0
    ) {
      if (currentFormStep === "contributory_yearly" && !hasDetailedYearsData) {
        return {
          hasValue: false,
          error:
            "Για παράλληλη ασφάλιση από 01/01/2017 χρειάζονται αναλυτικά ετήσια στοιχεία αποδοχών και ημερών.",
          warnings: [],
          parallelInsuranceDraft: {
            calculationMode: "single_unified_main_pension",
            segments: [],
          },
          parallelInsuranceDisplay: display,
        };
      }

      if (segmentDraft.combinedEarningsConfirmed !== true) {
        return {
          hasValue: false,
          error:
            "Επιβεβαιώστε ότι οι ετήσιες αποδοχές από 01/01/2017 περιλαμβάνουν όλες τις παράλληλες δραστηριότητες.",
          warnings: [],
          parallelInsuranceDraft: {
            calculationMode: "single_unified_main_pension",
            segments: [],
          },
          parallelInsuranceDisplay: display,
        };
      }
    }

    const annualAuxiliaryContributionAmountsResult =
      normalizeParallelAnnualAuxiliaryContributionAmounts(
        segmentDraft.annualAuxiliaryContributionAmounts,
        segment,
      );

    if (!annualAuxiliaryContributionAmountsResult.ok) {
      return {
        hasValue: false,
        error: annualAuxiliaryContributionAmountsResult.error,
        warnings: [],
        parallelInsuranceDraft: {
          calculationMode: "single_unified_main_pension",
          segments: [],
        },
        parallelInsuranceDisplay: display,
      };
    }

    totalDeclaredDuplicateDays += duplicateInsuranceDays;

    normalizedSegments.push({
      id: segment.id,
      overlapGroupId,
      overlapGroupMaximumDuplicateInsuranceDays,
      fromDate: segment.fromDate,
      toDate: segment.toDate,
      periodType: segment.periodType,
      referenceEarningsMode: segment.referenceEarningsMode,
      periodIds: segment.periodIds,
      timeCountingPeriodId,
      baseEarningsConfirmed:
        segment.referenceEarningsMode ===
          PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED &&
        duplicateInsuranceDays > 0,
      combinedEarningsConfirmed:
        segment.periodType === "from_2017" && duplicateInsuranceDays > 0,
      annualAuxiliaryContributionAmounts:
        annualAuxiliaryContributionAmountsResult.value,
      additionalPeriods,
    });

    const countingPeriod = segment.periods.find(
      (period) => period.id === timeCountingPeriodId,
    );

    display.push({
      id: segment.id,
      fromDateDisplay: segment.fromDateDisplay,
      toDateDisplay: segment.toDateDisplay,
      periodTypeLabel: segment.periodTypeLabel,
      timeCountingPeriodLabel: countingPeriod?.label || timeCountingPeriodId,
      maximumDuplicateInsuranceDays:
        overlapGroupMaximumDuplicateInsuranceDays ??
        maximumSegmentDuplicateInsuranceDays,
      overlapGroupId,
      overlapGroupMaximumDuplicateInsuranceDays,
      duplicateInsuranceDays: roundToDecimals(duplicateInsuranceDays, 4),
      additionalPeriods: additionalPeriods.map((item) => {
        const period = segment.periods.find(
          (candidate) => candidate.id === item.periodId,
        );

        return {
          ...item,
          periodLabel: period?.label || item.periodId,
          maximumDuplicateInsuranceDays:
            getPossibleMaximumParallelDuplicateDaysForPeriod(
              segment,
              item.periodId,
            ),
          contributionInputModeLabel:
            item.contributionInputMode ===
            PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT
              ? "Συνολικό ποσό εισφορών κύριας σύνταξης"
              : item.contributionInputMode ===
                  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS
                ? "Μέση μηνιαία βάση και μονάδες εισφοράς"
                : item.contributionInputMode ===
                    PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE
                  ? "Μέσος συντάξιμος μισθός από το 2002 και μετά· ποσοστό εισφοράς αυτόματα"
                  : null,
        };
      }),
    });
  }

  return {
    hasValue: true,
    error: null,
    warnings:
      totalDeclaredDuplicateDays > 0
        ? [
            "Η παράλληλη ασφάλιση θα υπολογιστεί μόνο ως μία ενιαία κύρια σύνταξη. Δεν εξετάζεται δεύτερη σύνταξη πριν υλοποιηθεί η θεμελίωση δικαιώματος.",
          ]
        : [
            "Εντοπίστηκε ημερολογιακή επικάλυψη, αλλά δηλώθηκαν 0 πραγματικές ημέρες που έχουν μετρηθεί δεύτερη φορά.",
          ],
    parallelInsuranceDraft: {
      calculationMode: "single_unified_main_pension",
      segments: normalizedSegments,
    },
    parallelInsuranceDisplay: display,
  };
}

function getParallelOverlapGroupId(segment = {}) {
  if (segment.overlapGroupId) {
    return String(segment.overlapGroupId);
  }

  const periodIds = Array.isArray(segment.periodIds)
    ? [...segment.periodIds]
    : [];

  return `parallel_group_${periodIds
    .map((value) => String(value))
    .sort((a, b) => a.localeCompare(b))
    .join("__")}`;
}

function getParallelOverlapGroupMaximumDuplicateDays(segment = {}) {
  const providedMaximum = Number(
    segment.overlapGroupMaximumDuplicateInsuranceDays ??
      segment.maximumDuplicateInsuranceDays,
  );

  if (Number.isFinite(providedMaximum) && providedMaximum >= 0) {
    return providedMaximum;
  }

  return getPossibleMaximumParallelDuplicateDaysForSegment(segment);
}

function getParallelPeriodDeclaredInsuranceDays(segment, periodId) {
  const period = (Array.isArray(segment?.periods) ? segment.periods : []).find(
    (candidate) => candidate.id === periodId,
  );
  const insuranceDays = Number(period?.insuranceDays);

  return Number.isFinite(insuranceDays) && insuranceDays > 0
    ? insuranceDays
    : null;
}

function getPossibleMaximumParallelDuplicateDaysForPeriod(segment, periodId) {
  const period = (Array.isArray(segment?.periods) ? segment.periods : []).find(
    (candidate) => candidate.id === periodId,
  );
  const providedMaximum = Number(period?.maximumDuplicateInsuranceDays);

  if (Number.isFinite(providedMaximum) && providedMaximum >= 0) {
    return providedMaximum;
  }

  const currentDays = getParallelPeriodDeclaredInsuranceDays(
    segment,
    periodId,
  );
  const otherDays = (Array.isArray(segment?.periods) ? segment.periods : [])
    .filter((candidate) => candidate.id !== periodId)
    .reduce((sum, candidate) => {
      const candidateDays = Number(candidate?.insuranceDays);
      return (
        sum +
        (Number.isFinite(candidateDays) && candidateDays > 0
          ? candidateDays
          : 0)
      );
    }, 0);

  if (!Number.isFinite(currentDays) || currentDays <= 0 || otherDays <= 0) {
    return null;
  }

  return roundToDecimals(Math.min(currentDays, otherDays), 4);
}

function getPossibleMaximumParallelDuplicateDaysForSegment(segment) {
  const providedMaximum = Number(segment?.maximumDuplicateInsuranceDays);

  if (Number.isFinite(providedMaximum) && providedMaximum >= 0) {
    return providedMaximum;
  }

  const declaredDays = (Array.isArray(segment?.periods)
    ? segment.periods
    : []
  )
    .map((period) => Number(period?.insuranceDays))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (
    declaredDays.length < 2 ||
    declaredDays.length !== (segment?.periods || []).length
  ) {
    return null;
  }

  const totalDays = declaredDays.reduce((sum, value) => sum + value, 0);
  return roundToDecimals(totalDays - Math.max(...declaredDays), 4);
}

function analyzePlasticYearsDraft({
  calculatorEdition,
  plasticYearsDraft,
  contributoryEarningsInputMethod,
}) {
  if (calculatorEdition === CALCULATOR_EDITION_OPTIONS.free) {
    return analyzeFreePlasticYearsDraft({
      plasticYearsDraft,
      contributoryEarningsInputMethod,
    });
  }

  const normalizedStatus = plasticYearsDraft?.status === "yes" ? "yes" : "no";

  if (normalizedStatus === "no") {
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
    const recognitionStatus = String(entry.recognitionStatus || "").trim();
    const recognitionMode = String(entry.recognitionMode || "").trim();

    if (!PLASTIC_YEARS_RECOGNITION_STATUS_OPTIONS.includes(recognitionStatus)) {
      return createPlasticYearsError(
        `Επιλέξτε αν υπάρχει πράξη αναγνώρισης για τον πλασματικό χρόνο ${entryNumber}.`,
      );
    }

    if (!PLASTIC_YEARS_RECOGNITION_MODE_OPTIONS.includes(recognitionMode)) {
      return createPlasticYearsError(
        `Επιλέξτε αν ο πλασματικός χρόνος ${entryNumber} είναι με εξαγορά.`,
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

    if (recognitionMode === "free") {
      warnings.push(
        `Ο πλασματικός χρόνος ${entryNumber} δηλώθηκε χωρίς εξαγορά και δεν θα προστεθεί στον υπολογισμό της ανταποδοτικής σύνταξης.`,
      );

      displayEntries.push({
        entryNumber,
        recognitionStatus,
        recognitionStatusLabel:
          recognitionStatus === "recognized"
            ? "Υπάρχει πράξη αναγνώρισης"
            : "Μελλοντική εκτίμηση",
        recognitionMode,
        recognitionModeLabel: "Χωρίς εξαγορά",
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
        `Συμπληρώστε την ημερομηνία αίτησης / αναγνώρισης για τον πλασματικό χρόνο ${entryNumber}.`,
      );
    }

    if (applicationDateResult.error) {
      return createPlasticYearsError(applicationDateResult.error);
    }

    const financialInputMode =
      recognitionStatus === "planned"
        ? "monthly_base"
        : String(entry.financialInputMode || "").trim();

    if (
      !PLASTIC_YEARS_FINANCIAL_INPUT_MODE_OPTIONS.includes(financialInputMode)
    ) {
      return createPlasticYearsError(
        `Επιλέξτε ποιο οικονομικό στοιχείο αναγράφεται στην πράξη για τον πλασματικό χρόνο ${entryNumber}.`,
      );
    }

    const normalizedEntry = {
      id: entry.id || `plastic_year_${entryNumber}`,
      recognitionStatus,
      recognitionMode: "paid",
      duration: {
        years: durationResult.years,
        months: durationResult.months,
        days: durationResult.days,
      },
      applicationDate: applicationDateResult.isoDate,
      calculationInputMode:
        financialInputMode === "monthly_base"
          ? "explicit_monthly_base"
          : "buyout_amount_and_rate",
    };

    let financialDisplay = "";

    if (financialInputMode === "monthly_base") {
      const monthlyBaseResult = parseNonNegativeDecimal(
        entry.monthlyPensionableBase,
      );

      if (!monthlyBaseResult.isValid || monthlyBaseResult.value <= 0) {
        return createPlasticYearsError(
          `Η μηνιαία ασφαλιστέα / συντάξιμη βάση του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερη από 0.`,
        );
      }

      normalizedEntry.explicitMonthlyPensionableBase = monthlyBaseResult.value;
      financialDisplay = `${monthlyBaseResult.value.toLocaleString("el-GR")} € μηνιαία βάση`;
    } else {
      const buyoutAmountResult = parseNonNegativeDecimal(entry.buyoutAmount);
      const contributionRateResult = parseNonNegativeDecimal(
        entry.contributionRatePercent,
      );

      if (!buyoutAmountResult.isValid || buyoutAmountResult.value <= 0) {
        return createPlasticYearsError(
          `Το συνολικό ποσό εξαγοράς του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερο από 0.`,
        );
      }

      if (
        !contributionRateResult.isValid ||
        contributionRateResult.value <= 0 ||
        contributionRateResult.value > 100
      ) {
        return createPlasticYearsError(
          `Το ποσοστό εισφοράς του πλασματικού χρόνου ${entryNumber} πρέπει να είναι μεγαλύτερο από 0 και έως 100%.`,
        );
      }

      normalizedEntry.buyoutAmount = buyoutAmountResult.value;
      normalizedEntry.contributionRatePercent = contributionRateResult.value;
      financialDisplay = `${buyoutAmountResult.value.toLocaleString("el-GR")} € με ποσοστό ${contributionRateResult.value.toLocaleString("el-GR")}%`;
    }

    normalizedEntries.push(normalizedEntry);
    paidPlasticYearsCount += 1;

    displayEntries.push({
      entryNumber,
      recognitionStatus,
      recognitionStatusLabel:
        recognitionStatus === "recognized"
          ? "Υπάρχει πράξη αναγνώρισης"
          : "Μελλοντική εκτίμηση",
      recognitionMode: "paid",
      recognitionModeLabel: "Με εξαγορά",
      durationDisplay: formatPlasticYearsDuration(durationResult),
      applicationDateDisplay: applicationDateResult.displayDate,
      financialDisplay,
      includedInCalculation: true,
    });
  }

  if (
    paidPlasticYearsCount > 0 &&
    contributoryEarningsInputMethod === "average_monthly"
  ) {
    return createPlasticYearsError(
      "Για να ενσωματωθούν σωστά οι αποδοχές εξαγοράς πλασματικού χρόνου χρειάζονται αποδοχές και ημέρες ανά έτος. Δεν αρκεί έτοιμος μέσος μηνιαίος συντάξιμος μισθός.",
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

function analyzeFreePlasticYearsDraft({
  plasticYearsDraft,
  contributoryEarningsInputMethod,
}) {
  const choice = String(
    plasticYearsDraft?.freeFlowChoice || "",
  ).trim();

  if (!choice) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      plasticYearsDraft: [],
      plasticYearsDisplay: [],
      paidPlasticYearsCount: 0,
    };
  }

  if (
    ![
      "none",
      "free",
      "paid_known",
      "paid_unknown",
    ].includes(choice)
  ) {
    return createPlasticYearsError(
      "Η επιλογή για τον πλασματικό χρόνο δεν είναι έγκυρη.",
    );
  }

  if (choice === "none") {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      plasticYearsDraft: [],
      plasticYearsDisplay: [],
      paidPlasticYearsCount: 0,
    };
  }

  const entry = Array.isArray(plasticYearsDraft?.entries)
    ? plasticYearsDraft.entries[0] || {}
    : {};

  if (choice === "free") {
    const durationResult = analyzePlasticYearsDuration({
      years: entry.years,
      months: entry.months,
      days: entry.days,
      entryNumber: 1,
    });

    if (durationResult.error) {
      return createPlasticYearsError(durationResult.error);
    }

    const recordedEntry = {
      id: entry.id || "plastic_year_1",
      recognitionStatus: "recognized",
      recognitionMode: "free",
      duration: {
        years: durationResult.years,
        months: durationResult.months,
        days: durationResult.days,
      },
      includedInContributoryCalculation: false,
    };

    return {
      hasValue: true,
      error: null,
      warnings: [
        "Ο πλασματικός χρόνος χωρίς εξαγορά δεν προστέθηκε στον υπολογισμό της ανταποδοτικής σύνταξης.",
      ],
      plasticYearsDraft: [],
      nonContributoryPlasticYearsDraft: [recordedEntry],
      plasticYearsDisplay: [
        {
          entryNumber: 1,
          recognitionStatus: "recognized",
          recognitionStatusLabel: "Δηλωμένος χρόνος",
          recognitionMode: "free",
          recognitionModeLabel: "Χωρίς εξαγορά",
          durationDisplay: formatPlasticYearsDuration(durationResult),
          includedInCalculation: false,
        },
      ],
      paidPlasticYearsCount: 0,
    };
  }

  if (choice === "paid_unknown") {
    return {
      hasValue: true,
      error: null,
      warnings: [
        "Η σχεδιαζόμενη εξαγορά πλασματικού χρόνου δεν προστέθηκε στον υπολογισμό, επειδή δεν είναι ακόμη γνωστά τα απαραίτητα στοιχεία.",
      ],
      plasticYearsDraft: [],
      plasticYearsDisplay: [
        {
          entryNumber: 1,
          recognitionMode: "paid",
          recognitionModeLabel:
            "Μελλοντική εξαγορά χωρίς διαθέσιμα στοιχεία",
          includedInCalculation: false,
        },
      ],
      paidPlasticYearsCount: 0,
    };
  }

  const durationResult = analyzePlasticYearsDuration({
    years: entry.years,
    months: entry.months,
    days: entry.days,
    entryNumber: 1,
  });

  if (durationResult.error) {
    return createPlasticYearsError(durationResult.error);
  }

  const applicationYearText = String(
    entry.applicationYear || "",
  ).trim();
  const applicationYearResult =
    parseNonNegativeInteger(applicationYearText);

  if (
    !applicationYearResult.isValid ||
    applicationYearText.length !== 4 ||
    applicationYearResult.value < 1900 ||
    applicationYearResult.value > 2100
  ) {
    return createPlasticYearsError(
      "Το έτος υποβολής της αίτησης εξαγοράς πρέπει να είναι έγκυρο τετραψήφιο έτος.",
    );
  }

  const applicationYear = applicationYearResult.value;
  const applicationPeriod2016 = String(
    entry.applicationPeriod2016 || "",
  ).trim();

  if (
    applicationYear === 2016 &&
    ![
      "until_2016_05_12",
      "from_2016_05_13",
    ].includes(applicationPeriod2016)
  ) {
    return createPlasticYearsError(
      "Για αίτηση μέσα στο 2016, επιλέξτε αν υποβλήθηκε έως 12/05/2016 ή από 13/05/2016 και μετά.",
    );
  }

  const buyoutAmountResult = parseNonNegativeDecimal(
    entry.buyoutAmount,
  );

  if (
    !buyoutAmountResult.isValid ||
    buyoutAmountResult.value <= 0
  ) {
    return createPlasticYearsError(
      "Το συνολικό ποσό εξαγοράς του πλασματικού χρόνου πρέπει να είναι μεγαλύτερο από 0.",
    );
  }

  const isOldRate =
    applicationYear < 2016 ||
    (applicationYear === 2016 &&
      applicationPeriod2016 === "until_2016_05_12");
  const contributionRatePercent = isOldRate ? 6.67 : 20;
  const applicationDate =
    applicationYear === 2016
      ? applicationPeriod2016 === "until_2016_05_12"
        ? "2016-05-12"
        : "2016-05-13"
      : `${applicationYear}-01-01`;
  const applicationDateDisplay =
    applicationYear === 2016
      ? applicationPeriod2016 === "until_2016_05_12"
        ? "Έως 12/05/2016"
        : "Από 13/05/2016"
      : `Έτος ${applicationYear}`;
  const buyoutAmount = roundToDecimals(
    buyoutAmountResult.value,
    2,
  );

  return {
    hasValue: true,
    error: null,
    warnings: [],
    plasticYearsDraft: [
      {
        id: entry.id || "plastic_year_1",
        recognitionStatus: "recognized",
        recognitionMode: "paid",
        duration: {
          years: durationResult.years,
          months: durationResult.months,
          days: durationResult.days,
        },
        applicationDate,
        calculationInputMode: "buyout_amount_and_rate",
        buyoutAmount,
        contributionRatePercent,
      },
    ],
    plasticYearsDisplay: [
      {
        entryNumber: 1,
        recognitionStatus: "recognized",
        recognitionStatusLabel:
          "Δηλωμένη αίτηση ή σχεδιαζόμενη αίτηση εξαγοράς",
        recognitionMode: "paid",
        recognitionModeLabel: "Με εξαγορά",
        durationDisplay:
          formatPlasticYearsDuration(durationResult),
        applicationDateDisplay,
        financialDisplay:
          `${buyoutAmount.toLocaleString("el-GR")} € ` +
          `με ποσοστό ${contributionRatePercent.toLocaleString("el-GR")}%`,
        includedInCalculation: true,
      },
    ],
    paidPlasticYearsCount: 1,
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
  const yearsResult = parseNonNegativeInteger(String(years || "0"));
  const monthsResult = parseNonNegativeInteger(String(months || "0"));
  const daysResult = parseNonNegativeInteger(String(days || "0"));

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

function analyzeFirstInsuranceYear({
  calculatorEdition,
  value,
  birthDate,
  pensionDate,
}) {
  if (calculatorEdition !== CALCULATOR_EDITION_OPTIONS.free) {
    return {
      hasValue: true,
      error: null,
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  const text = String(value || "").trim();

  if (!text) {
    return {
      hasValue: false,
      error: null,
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  if (!/^\d{4}$/.test(text)) {
    return {
      hasValue: true,
      error:
        "Το έτος πρώτης ασφάλισης πρέπει να είναι τετραψήφιο έτος.",
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  const firstInsuranceYear = Number(text);

  if (
    firstInsuranceYear < 1900 ||
    firstInsuranceYear > 2100
  ) {
    return {
      hasValue: true,
      error:
        "Το έτος πρώτης ασφάλισης πρέπει να είναι από το 1900 έως το 2100.",
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  const birthYear = getIsoDateYear(birthDate);
  const pensionYear = getIsoDateYear(pensionDate);

  if (
    Number.isInteger(birthYear) &&
    firstInsuranceYear < birthYear
  ) {
    return {
      hasValue: true,
      error:
        "Το έτος πρώτης ασφάλισης δεν μπορεί να είναι πριν από το έτος γέννησης.",
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  if (
    Number.isInteger(pensionYear) &&
    firstInsuranceYear > pensionYear
  ) {
    return {
      hasValue: true,
      error:
        "Το έτος πρώτης ασφάλισης δεν μπορεί να είναι μετά την έναρξη της σύνταξης.",
      firstInsuranceYear: null,
      insuredType: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    firstInsuranceYear,
    insuredType: firstInsuranceYear <= 1992 ? "old" : "new",
  };
}

function analyzeFirstInsuranceYearConsistency({
  calculatorEdition,
  firstInsuranceYear,
  insurancePeriodsDraft,
}) {
  if (
    calculatorEdition !== CALCULATOR_EDITION_OPTIONS.free ||
    !Number.isInteger(firstInsuranceYear)
  ) {
    return {
      hasValue: true,
      error: null,
    };
  }

  const startYears = (
    Array.isArray(insurancePeriodsDraft)
      ? insurancePeriodsDraft
      : []
  )
    .map((period) => getIsoDateYear(period?.fromDate))
    .filter((year) => Number.isInteger(year));

  if (startYears.length === 0) {
    return {
      hasValue: true,
      error: null,
    };
  }

  const earliestDeclaredStartYear = Math.min(...startYears);

  if (earliestDeclaredStartYear < firstInsuranceYear) {
    return {
      hasValue: true,
      error:
        `Έχει δηλωθεί ασφαλιστική περίοδος που ξεκινά το ${earliestDeclaredStartYear}, ` +
        `πριν από το έτος πρώτης ασφάλισης ${firstInsuranceYear}.`,
    };
  }

  return {
    hasValue: true,
    error: null,
  };
}

function analyzeBirthDate({ value, pensionDate }) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const parsedInput = parseBirthDateInput(trimmedValue);

  if (!parsedInput.isValidFormat) {
    return {
      hasValue: true,
      error:
        "Συμπληρώστε έγκυρη ημερομηνία γέννησης με τετραψήφιο έτος, π.χ. 31/12/1967 ή 31121967.",
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
      error: "Η ημερομηνία γέννησης που δόθηκε δεν είναι πραγματική.",
    };
  }

  const normalizedBirthDate = formatIsoDate(day, month, year);
  const parsedPensionDate = parseIsoDate(pensionDate);

  if (!parsedPensionDate) {
    return {
      hasValue: true,
      error: null,
      displayBirthDate: formatGreekDate(day, month, year),
      birthDate: normalizedBirthDate,
      ageAtPensionStart: null,
    };
  }

  if (parsedDate >= parsedPensionDate) {
    return {
      hasValue: true,
      error:
        "Η ημερομηνία γέννησης πρέπει να είναι πριν από την ημερομηνία έναρξης της σύνταξης.",
    };
  }

  const ageAtPensionStart = calculateCompletedAge({
    birthDate: parsedDate,
    referenceDate: parsedPensionDate,
  });

  if (ageAtPensionStart < 15 || ageAtPensionStart > 110) {
    return {
      hasValue: true,
      error:
        "Η ηλικία κατά την έναρξη της σύνταξης πρέπει να είναι από 15 έως 110 έτη, ώστε να υπάρχει αντίστοιχη ράντα.",
    };
  }

  return {
    hasValue: true,
    error: null,
    displayBirthDate: formatGreekDate(day, month, year),
    birthDate: normalizedBirthDate,
    ageAtPensionStart,
  };
}

function parseBirthDateInput(value) {
  const normalizedValue = String(value || "").trim();
  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/,
  );

  if (separatedDateMatch) {
    return {
      isValidFormat: true,
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: Number(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, "");

  if (digitsOnly.length === 8) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: Number(digitsOnly.slice(4, 8)),
    };
  }

  return {
    isValidFormat: false,
  };
}

function calculateCompletedAge({ birthDate, referenceDate }) {
  let age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const referenceMonth = referenceDate.getUTCMonth();
  const birthMonth = birthDate.getUTCMonth();

  if (
    referenceMonth < birthMonth ||
    (referenceMonth === birthMonth &&
      referenceDate.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  return age;
}

function analyzePensionStartDate(value) {
  const trimmedValue = String(value || "").trim();

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
      error: "Συμπληρώστε έγκυρη ημερομηνία, π.χ. 1/1/26, 1/1/2026 ή 01012026.",
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
      error: "Η ημερομηνία που δόθηκε δεν είναι πραγματική.",
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
  const normalizedValue = String(value || "").trim();

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
      error: "Επιλέξτε έγκυρο είδος σύνταξης.",
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

  if (pensionType !== "old_age") {
    return createInactiveOldAgeAnalysis(true);
  }

  const oldAgeCategory = String(oldAgeCategoryInput || "").trim();

  if (!OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory]) {
    return {
      hasValue: true,
      error: "Επιλέξτε έγκυρη κατηγορία σύνταξης γήρατος.",
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

  if (oldAgeCategory === "special_disease") {
    return {
      hasValue: true,
      error: null,
      warnings,
      oldAgeCategory,
      oldAgeCategoryLabel: OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory].label,
      pensionMode: "full",
      pensionModeLabel: null,
      earlyReductionMonths: 0,
      residenceYears: residenceResult.residenceYears,
      isSpecialDiseaseOldAgeCase: true,
      ignoreResidenceFortyYearPenalty: true,
    };
  }

  const pensionMode = String(pensionModeInput || "").trim();

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
      error: "Επιλέξτε αν η σύνταξη γήρατος είναι πλήρης ή μειωμένη.",
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

function analyzeEarlyReductionMonths({
  pensionMode,
  earlyReductionMonthsInput,
}) {
  if (pensionMode !== "reduced") {
    return {
      hasValue: true,
      error: null,
      earlyReductionMonths: 0,
    };
  }

  const trimmedMonths = String(earlyReductionMonthsInput || "").trim();

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
      error: "Οι μήνες πρόωρης μείωσης πρέπει να είναι ακέραιος αριθμός.",
      earlyReductionMonths: null,
    };
  }

  if (monthsResult.value > MAX_EARLY_REDUCTION_MONTHS) {
    return {
      hasValue: true,
      error: "Οι μήνες πρόωρης μείωσης πρέπει να είναι από 0 έως 60.",
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

  if (pensionType !== "disability") {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  const disabilityCategory = String(disabilityCategoryInput || "").trim();

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
      error: "Επιλέξτε έγκυρη κατηγορία αναπηρίας.",
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
    disabilityCategoryLabel:
      DISABILITY_CATEGORY_OPTIONS[disabilityCategory].label,
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
  const normalizedMethod = String(insuranceTimeInputMethod || "").trim();

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
      error: "Επιλέξτε έγκυρο τρόπο εισαγωγής χρόνου ασφάλισης.",
      warnings: [],
    };
  }

  if (normalizedMethod === "insurance_days") {
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
    vae: periods.some((period) => period?.employmentCategory === "vae"),
    yvae: periods.some((period) => period?.employmentCategory === "yvae"),
    ota_ika_vae: periods.some(
      (period) => period?.employmentCategory === "ota_ika_vae",
    ),
    ota_public_vae: periods.some(
      (period) => period?.employmentCategory === "ota_public_vae",
    ),
    ota_ika_yvae: periods.some(
      (period) => period?.employmentCategory === "ota_ika_yvae",
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
        usageByRegime: createArticle30UsageByRegime(presence, "not_applicable"),
        source: "not_applicable",
      }),
    };
  }

  const normalizedUsageInput = normalizeArticle30SpecialRegimeUsageInput(
    article30SpecialRegimeUsageInput,
  );
  const warnings = [];
  const usageByRegime = createArticle30UsageByRegime(
    presence,
    "not_applicable",
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
        `Δεν υπολογίζεται το επασφάλιστρο ${label}, επειδή δεν είναι γνωστό αν χρησιμοποιούνται οι αντίστοιχες ειδικές διατάξεις συνταξιοδότησης.`,
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
      source: "user",
    }),
  };
}

function getArticle30PremiumTypes() {
  return ["vae", "yvae", "ota_ika_vae", "ota_public_vae", "ota_ika_yvae"];
}

function createArticle30UsageByRegime(presence, activeStatus) {
  return Object.fromEntries(
    getArticle30PremiumTypes().map((premiumType) => [
      premiumType,
      presence[premiumType] ? activeStatus : "not_applicable",
    ]),
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
      presence.ota_ika_vae || presence.ota_public_vae || presence.ota_ika_yvae,
    usageByRegime,
    source,
  };
}

function normalizeArticle30SpecialRegimeUsageInput(value) {
  if (typeof value === "string") {
    return Object.fromEntries(
      getArticle30PremiumTypes().map((premiumType) => [premiumType, value]),
    );
  }

  if (!value || typeof value !== "object") {
    return Object.fromEntries(
      getArticle30PremiumTypes().map((premiumType) => [premiumType, ""]),
    );
  }

  return {
    vae: String(value.vae || "").trim(),
    yvae: String(value.yvae || "").trim(),
    ota_ika_vae: String(value.ota_ika_vae || "").trim(),
    ota_public_vae: String(value.ota_public_vae || "").trim(),
    ota_ika_yvae: String(value.ota_ika_yvae || value.ota_cleaning || "").trim(),
  };
}

function getArticle30PremiumTypeLabel(premiumType) {
  const labels = {
    vae: "ΒΑΕ",
    yvae: "ΥΒΑΕ",
    ota_ika_vae: "ΒΑΕ ΟΤΑ του πρώην ΙΚΑ",
    ota_public_vae: "ΒΑΕ ΟΤΑ του καθεστώτος Δημοσίου",
    ota_ika_yvae: "ΥΒΑΕ καθαριότητας / αποκομιδής ΟΤΑ",
  };

  return labels[premiumType] || "ειδικής εισφοράς";
}

function analyzeInsurancePeriodsDraft({
  insurancePeriodsInputMode,
  globalInsuredType,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleNonSalariedEarningsInputMode,
  simpleTsaySinglePensionerStatus,
  simpleFromDateInput,
  simpleToDateInput,
  simpleTimeInputMethod,
  simpleInsuranceDaysInput,
  simpleInsuranceYearsInput,
  simpleInsuranceMonthsInput,
  simpleInsuranceExtraDaysInput,
  simpleUniformedSpecialTimeDraft,
  auxiliaryContributionDraft,
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
  const mode = String(insurancePeriodsInputMode || "disabled").trim();
  const normalizedAuxiliaryContributionDraft =
    normalizeAuxiliaryContributionDraft(auxiliaryContributionDraft);

  if (!INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode]) {
    return {
      hasValue: true,
      error: "Επιλέξτε έγκυρο τρόπο δήλωσης κατηγορίας ασφάλισης.",
      warnings: [],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel: null,
      insurancePeriodsDraft: [],
      insurancePeriodDraftDisplay: null,
      auxiliaryContributionDisplay: [],
    };
  }

  if (mode === "disabled") {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel:
        INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
      insurancePeriodsDraft: [],
      insurancePeriodDraftDisplay:
        "Δεν δηλώθηκε κατηγορία συνολικού χρόνου ασφάλισης.",
      auxiliaryContributionDisplay: [],
    };
  }

  if (mode === "multiple") {
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
        "Συμπληρώστε τουλάχιστον μία περίοδο / ομάδα ασφάλισης.",
        mode,
      );
    }

    if (groups.length > MAX_INSURANCE_PERIOD_GROUPS) {
      return createInsurancePeriodDraftError(
        `Μπορούν να δηλωθούν μέχρι ${MAX_INSURANCE_PERIOD_GROUPS} περίοδοι / ομάδες ασφάλισης.`,
        mode,
      );
    }

    const periods = [];

    for (let index = 0; index < groups.length; index += 1) {
      const periodResult = analyzeMultiInsurancePeriodDraft({
        mode,
        groupNumber: index + 1,
        periodId: groups[index].id || `period_${index + 1}`,
        timeInputMethod: groups[index].timeInputMethod,
        insuranceDaysInput: groups[index].insuranceDays,
        insuranceYearsInput: groups[index].insuranceYears,
        insuranceMonthsInput: groups[index].insuranceMonths,
        insuranceExtraDaysInput: groups[index].insuranceExtraDays,
        fromDateInput: groups[index].fromDate,
        toDateInput: groups[index].toDate,
        fundInput: groups[index].fund,
        uniformedBodyInput: groups[index].uniformedBody,
        insuredTypeInput: resolveInsuredTypeForFund({
          fund: groups[index].fund,
          globalInsuredType,
          fallbackInsuredType: groups[index].insuredType,
        }),
        employmentCategoryInput: groups[index].employmentCategory,
        nonSalariedEarningsInputMode:
          groups[index].nonSalariedEarningsInputMode,
        tsaySinglePensionerStatus:
          groups[index].tsaySinglePensionerStatus,
        uniformedSpecialTimeDraft: groups[index].uniformedSpecialTimeDraft,
        auxiliaryExtraContributionChoice:
          normalizedAuxiliaryContributionDraft[
            groups[index].id || `period_${index + 1}`
          ]?.extraContributionChoice || "",
        formerAuxiliaryFund:
          normalizedAuxiliaryContributionDraft[
            groups[index].id || `period_${index + 1}`
          ]?.formerAuxiliaryFund || "",
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
      displaySuffix:
        periods.length === 1
          ? "(σύνολο από 1 περίοδο / ομάδα)"
          : `(σύνολο από ${periods.length} περιόδους / ομάδες)`,
    });

    return {
      hasValue: true,
      error: null,
      warnings: [
        "Οι περίοδοι / ομάδες προετοιμάζονται ως insurancePeriodsDraft και το backend τις μετατρέπει σε κανονικό insurancePeriods για τον calculator.",
        ...periods
          .map((period) => period.auxiliaryWarning)
          .filter(Boolean),
      ],
      insurancePeriodsInputMode: mode,
      insurancePeriodsInputModeLabel:
        INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
      insurancePeriodsDraft: periods,
      auxiliaryContributionDisplay: periods.map(
        buildAuxiliaryContributionDisplay,
      ),
      insurancePeriodDraftDisplay: periods
        .map((period, index) => {
          return (
            `Περίοδος / ομάδα ${index + 1}: ` +
            `${period.fromDateDisplay} έως ${period.toDateDisplay}, ` +
            `${period.fundLabel}${period.uniformedBodyLabel ? ` — ${period.uniformedBodyLabel}` : ""} - ${period.insuredTypeLabel} - ` +
            `${period.employmentCategoryLabel}, ` +
            `${period.insuranceDays} ημέρες (${period.insuranceDaysSourceLabel})`
          );
        })
        .join(" | "),
      totalInsuranceTimeAnalysis,
    };
  }

  const fromDateResult = analyzeInsurancePeriodDate({
    value: simpleFromDateInput,
    fieldLabel: "ημερομηνία έναρξης ασφαλιστικής περιόδου",
  });

  if (fromDateResult.error) {
    return createInsurancePeriodDraftError(fromDateResult.error, mode);
  }

  if (!fromDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      "Συμπληρώστε την ημερομηνία έναρξης της ασφαλιστικής περιόδου.",
      mode,
    );
  }

  const toDateResult = analyzeInsurancePeriodDate({
    value: simpleToDateInput,
    fieldLabel: "ημερομηνία λήξης ασφαλιστικής περιόδου",
  });

  if (toDateResult.error) {
    return createInsurancePeriodDraftError(toDateResult.error, mode);
  }

  if (!toDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      "Συμπληρώστε την ημερομηνία λήξης της ασφαλιστικής περιόδου.",
      mode,
    );
  }

  if (fromDateResult.isoDate > toDateResult.isoDate) {
    return createInsurancePeriodDraftError(
      "Η ημερομηνία έναρξης της ασφαλιστικής περιόδου δεν μπορεί να είναι μετά την ημερομηνία λήξης.",
      mode,
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
      mode,
    );
  }

  if (!simplePeriodTimeAnalysis.hasValue) {
    return createInsurancePeriodDraftError(
      "Συμπληρώστε τον χρόνο ασφάλισης της περιόδου.",
      mode,
    );
  }

  const periodResult = buildValidatedInsurancePeriodDraft({
    mode,
    id: "period_1",
    fundInput: simpleFundInput,
    uniformedBodyInput: "",
    insuredTypeInput: resolveInsuredTypeForFund({
      fund: simpleFundInput,
      globalInsuredType,
      fallbackInsuredType: simpleInsuredTypeInput,
    }),
    employmentCategoryInput: simpleEmploymentCategoryInput,
    nonSalariedEarningsInputMode: simpleNonSalariedEarningsInputMode,
    tsaySinglePensionerStatus: simpleTsaySinglePensionerStatus,
    uniformedSpecialTimeDraft: simpleUniformedSpecialTimeDraft,
    auxiliaryExtraContributionChoice:
      normalizedAuxiliaryContributionDraft.period_1
        ?.extraContributionChoice || "",
    formerAuxiliaryFund:
      normalizedAuxiliaryContributionDraft.period_1
        ?.formerAuxiliaryFund || "",
    fromDate: fromDateResult.isoDate,
    fromDateDisplay: fromDateResult.displayDate,
    toDate: toDateResult.isoDate,
    toDateDisplay: toDateResult.displayDate,
    insuranceDays: Math.round(
      simplePeriodTimeAnalysis.totalInsuranceDaysEquivalent,
    ),
    insuranceDaysSource: "declared_in_period",
    insuranceDaysSourceLabel: "δηλώθηκε ξεχωριστά για τη μία περίοδο",
  });

  if (periodResult.error) {
    return periodResult;
  }

  const period = periodResult.period;

  return {
    hasValue: true,
    error: null,
    warnings: [
      "Η ασφαλιστική περίοδος προετοιμάζεται ως insurancePeriodsDraft και το backend τη μετατρέπει σε κανονικό insurancePeriods για τον calculator.",
      period.auxiliaryWarning,
    ].filter(Boolean),
    insurancePeriodsInputMode: mode,
    insurancePeriodsInputModeLabel:
      INSURANCE_PERIODS_INPUT_MODE_OPTIONS[mode].label,
    insurancePeriodsDraft: [period],
    auxiliaryContributionDisplay: [
      buildAuxiliaryContributionDisplay(period),
    ],
    insurancePeriodDraftDisplay:
      `${period.fromDateDisplay} έως ${period.toDateDisplay}: ` +
      `${period.fundLabel}${period.uniformedBodyLabel ? ` — ${period.uniformedBodyLabel}` : ""} - ${period.insuredTypeLabel} - ` +
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
    id: group.id || "",
    timeInputMethod: group.timeInputMethod || "",
    insuranceDays: group.insuranceDays || "",
    insuranceYears: group.insuranceYears || "",
    insuranceMonths: group.insuranceMonths || "",
    insuranceExtraDays: group.insuranceExtraDays || "",
    fromDate: group.fromDate || "",
    toDate: group.toDate || "",
    fund: group.fund || "",
    uniformedBody:
      group.fund === "uniformed"
        ? normalizeUniformedBody(group.uniformedBody)
        : "",
    insuredType: group.insuredType || "",
    employmentCategory: group.employmentCategory || "",
    nonSalariedEarningsInputMode: group.nonSalariedEarningsInputMode || "",
    tsaySinglePensionerStatus: normalizeYesNoValue(
      group.tsaySinglePensionerStatus,
    ),
    uniformedSpecialTimeDraft: normalizeUniformedSpecialTimeDraft(
      group.uniformedSpecialTimeDraft,
    ),
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
    group.uniformedBody,
    group.insuredType,
    group.employmentCategory,
    group.nonSalariedEarningsInputMode,
    group.tsaySinglePensionerStatus,
    hasActiveUniformedSpecialTimeDraft(group.uniformedSpecialTimeDraft)
      ? "uniformed_special_time"
      : "",
  ].some((value) => String(value || "").trim() !== "");
}

function analyzeMultiInsurancePeriodDraft({
  mode,
  groupNumber,
  periodId,
  timeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  fromDateInput,
  toDateInput,
  fundInput,
  uniformedBodyInput,
  insuredTypeInput,
  employmentCategoryInput,
  nonSalariedEarningsInputMode,
  tsaySinglePensionerStatus,
  uniformedSpecialTimeDraft,
  auxiliaryExtraContributionChoice,
  formerAuxiliaryFund,
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
    uniformedBodyInput,
    insuredTypeInput,
    employmentCategoryInput,
    nonSalariedEarningsInputMode,
    tsaySinglePensionerStatus,
    hasActiveUniformedSpecialTimeDraft(uniformedSpecialTimeDraft)
      ? "uniformed_special_time"
      : "",
  ].some((value) => String(value || "").trim() !== "");

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
      mode,
    );
  }

  if (!fromDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      `Η ημερομηνία έναρξης της ασφαλιστικής περιόδου ${groupNumber} είναι υποχρεωτική.`,
      mode,
    );
  }

  const toDateResult = analyzeInsurancePeriodDate({
    value: toDateInput,
    fieldLabel: `ημερομηνία λήξης της περιόδου / ομάδας ${groupNumber}`,
  });

  if (toDateResult.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${toDateResult.error}`,
      mode,
    );
  }

  if (!toDateResult.hasValue) {
    return createInsurancePeriodDraftError(
      `Η ημερομηνία λήξης της ασφαλιστικής περιόδου ${groupNumber} είναι υποχρεωτική.`,
      mode,
    );
  }

  if (fromDateResult.isoDate > toDateResult.isoDate) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: Η ημερομηνία έναρξης δεν μπορεί να είναι μετά την ημερομηνία λήξης.`,
      mode,
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
      mode,
    );
  }

  if (!periodTimeAnalysis.hasValue) {
    return createInsurancePeriodDraftError(
      `Συμπληρώστε τον χρόνο ασφάλισης της περιόδου / ομάδας ${groupNumber}.`,
      mode,
    );
  }

  const periodResult = buildValidatedInsurancePeriodDraft({
    mode,
    id: periodId,
    fundInput,
    uniformedBodyInput,
    insuredTypeInput,
    employmentCategoryInput,
    nonSalariedEarningsInputMode,
    tsaySinglePensionerStatus,
    uniformedSpecialTimeDraft,
    auxiliaryExtraContributionChoice,
    formerAuxiliaryFund,
    fromDate: fromDateResult.isoDate,
    fromDateDisplay: fromDateResult.displayDate,
    toDate: toDateResult.isoDate,
    toDateDisplay: toDateResult.displayDate,
    insuranceDays: Math.round(periodTimeAnalysis.totalInsuranceDaysEquivalent),
    insuranceDaysSource: "declared_in_period",
    insuranceDaysSourceLabel: `δηλώθηκε ξεχωριστά για την περίοδο / ομάδα ${groupNumber}`,
  });

  if (periodResult.error) {
    return createInsurancePeriodDraftError(
      `Περίοδος / ομάδα ${groupNumber}: ${periodResult.error}`,
      mode,
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
    insuranceTimeInputMethod: "insurance_days",
    insuranceTimeInputMethodLabel: "Με αριθμό ενσήμων / ημερών ασφάλισης",

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
      6,
    ),
    insuranceTimeDisplay:
      `${totalDays} ημέρες ασφάλισης ` +
      `(${displayTime.years} έτη, ${displayTime.months} μήνες, ${displayTime.days} ημέρες) ` +
      `${displaySuffix}`,
  };
}

function buildValidatedInsurancePeriodDraft({
  mode,
  id,
  fundInput,
  uniformedBodyInput,
  insuredTypeInput,
  employmentCategoryInput,
  nonSalariedEarningsInputMode,
  tsaySinglePensionerStatus,
  uniformedSpecialTimeDraft,
  auxiliaryExtraContributionChoice = "",
  formerAuxiliaryFund = "",
  fromDate = null,
  fromDateDisplay = null,
  toDate = null,
  toDateDisplay = null,
  insuranceDays,
  insuranceDaysSource,
  insuranceDaysSourceLabel,
}) {
  const fund = String(fundInput || "").trim();
  const uniformedBody =
    fund === "uniformed" ? normalizeUniformedBody(uniformedBodyInput) : "";
  const insuredType = String(insuredTypeInput || "").trim();
  const employmentCategory = String(employmentCategoryInput || "").trim();

  if (!fund) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε φορέα / κατηγορία ασφάλισης.",
      mode,
    );
  }

  if (!INSURANCE_PERIOD_FUND_OPTIONS[fund]) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε έγκυρο φορέα / κατηγορία ασφάλισης.",
      mode,
    );
  }

  if (fund === "uniformed" && !uniformedBody) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε το συγκεκριμένο σώμα του ενστόλου.",
      mode,
    );
  }

  if (!insuredType) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε αν ο ασφαλισμένος είναι παλαιός ή νέος.",
      mode,
    );
  }

  if (!isAllowedInsuredTypeForFund({ fund, insuredType })) {
    return createInsurancePeriodDraftError(
      "Η επιλογή παλαιός / νέος δεν ταιριάζει με τον φορέα.",
      mode,
    );
  }

  if (!employmentCategory) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε κατηγορία εργασίας / εισφορών.",
      mode,
    );
  }

  if (
    fund === "ota" &&
    employmentCategory === "ota_ika_yvae" &&
    insuredType !== "old"
  ) {
    return createInsurancePeriodDraftError(
      "Η επιλογή ΥΒΑΕ ΟΤΑ επιτρέπεται μόνο για παλαιό ασφαλισμένο.",
      mode,
    );
  }

  if (
    !isAllowedEmploymentCategoryForFund({
      fund,
      insuredType,
      employmentCategory,
    })
  ) {
    return createInsurancePeriodDraftError(
      "Η κατηγορία εργασίας / εισφορών δεν ταιριάζει με τον φορέα.",
      mode,
    );
  }

  const nonSalariedInputModeResult = analyzeNonSalariedEarningsInputMode({
    fund,
    value: nonSalariedEarningsInputMode,
  });

  if (nonSalariedInputModeResult.error) {
    return createInsurancePeriodDraftError(
      nonSalariedInputModeResult.error,
      mode,
    );
  }

  const tsaySinglePensionerResult = analyzeTsaySinglePensionerStatus({
    fund,
    value: tsaySinglePensionerStatus,
  });

  if (tsaySinglePensionerResult.error) {
    return createInsurancePeriodDraftError(
      tsaySinglePensionerResult.error,
      mode,
    );
  }

  if (!Number.isFinite(insuranceDays) || insuranceDays <= 0) {
    return createInsurancePeriodDraftError(
      "Ο χρόνος της ασφαλιστικής περιόδου πρέπει να είναι μεγαλύτερος από 0.",
      mode,
    );
  }

  const uniformedSpecialTimeValidation =
    validateUniformedSpecialTimeDraftForAnalysis({
      fund,
      uniformedBody,
      fromDate,
      uniformedSpecialTimeDraft,
    });

  if (uniformedSpecialTimeValidation.error) {
    return createInsurancePeriodDraftError(
      uniformedSpecialTimeValidation.error,
      mode,
    );
  }

  const auxiliaryClassification = resolveAuxiliaryFormClassification({
    fund,
    uniformedBody,
    employmentCategory,
    choice: auxiliaryExtraContributionChoice,
    formerAuxiliaryFund,
  });

  if (
    auxiliaryClassification.requiresFormerAuxiliaryFundChoice === true &&
    !auxiliaryClassification.formerAuxiliaryFundSelection
  ) {
    return createInsurancePeriodDraftError(
      "Επιλέξτε την πραγματική ομάδα εργαζομένων / το πρώην επικουρικό ταμείο της γενικής ασφαλιστικής περιόδου.",
      mode,
    );
  }

  if (
    auxiliaryClassification.requiresUserChoice === true &&
    !auxiliaryClassification.userChoice
  ) {
    return createInsurancePeriodDraftError(
      "Απαντήστε στην ερώτηση για την πρόσθετη επικουρική εισφορά της ειδικής ασφαλιστικής περιόδου.",
      mode,
    );
  }

  const category = buildInsurancePeriodCategory({
    fund,
    insuredType,
    employmentCategory,
  });

  return {
    error: null,
    period: {
      id: String(id || "").trim() || null,
      fund,
      fundLabel: INSURANCE_PERIOD_FUND_OPTIONS[fund].label,
      uniformedBody: uniformedBody || null,
      uniformedBodyLabel: getUniformedBodyLabel(uniformedBody) || null,
      insuredType,
      insuredTypeLabel: INSURED_TYPE_OPTIONS[insuredType].label,
      employmentCategory,
      employmentCategoryLabel:
        EMPLOYMENT_CATEGORY_OPTIONS[employmentCategory].label,
      nonSalariedEarningsInputMode: nonSalariedInputModeResult.inputMode,
      nonSalariedEarningsInputModeLabel:
        nonSalariedInputModeResult.inputModeLabel,
      tsaySinglePensionerStatus: tsaySinglePensionerResult.status,
      tsaySinglePensionerStatusLabel:
        tsaySinglePensionerResult.statusLabel,
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
      auxiliaryContributionClassification: auxiliaryClassification.code,
      auxiliaryContributionClassificationLabel: auxiliaryClassification.label,
      hasAutomaticAuxiliary: auxiliaryClassification.hasAuxiliary,
      formerAuxiliaryFundSelection:
        auxiliaryClassification.formerAuxiliaryFundSelection || null,
      formerAuxiliaryFund:
        auxiliaryClassification.formerAuxiliaryFund || null,
      formerAuxiliaryFundLabel:
        auxiliaryClassification.formerAuxiliaryFundLabel || null,
      auxiliaryWorkerGroupLabel:
        auxiliaryClassification.workerGroupLabel || null,
      auxiliaryExtraContributionChoice:
        auxiliaryClassification.userChoice || null,
      auxiliaryExtraContributionRatePercent:
        auxiliaryClassification.extraContributionRatePercent,
      auxiliaryExtraContributionIsProvisional:
        auxiliaryClassification.isProvisional === true,
      auxiliaryWarning: auxiliaryClassification.warning || null,
      uniformedSpecialTimeDraft:
        fund === "uniformed"
          ? uniformedSpecialTimeValidation.value
          : null,
    },
  };
}

function analyzeTsaySinglePensionerStatus({ fund, value }) {
  const isTsayPeriod = fund === "tsay" || fund === "tsay_salaried";

  if (!isTsayPeriod) {
    return {
      error: null,
      status: null,
      statusLabel: null,
    };
  }

  const status = normalizeYesNoValue(value);

  if (!status) {
    return {
      error:
        "Δηλώστε αν υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ για τη συγκεκριμένη ασφαλιστική περίοδο.",
      status: null,
      statusLabel: null,
    };
  }

  return {
    error: null,
    status,
    statusLabel: status === "yes" ? "Ναι" : "Όχι",
  };
}

function normalizeYesNoValue(value) {
  return value === "yes" || value === "no" ? value : "";
}

function analyzeNonSalariedEarningsInputMode({ fund, value }) {
  if (!CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return {
      error: null,
      inputMode: null,
      inputModeLabel: null,
    };
  }

  const inputMode = String(value || "").trim();

  if (!inputMode) {
    return {
      error:
        "Επιλέξτε πώς θα δηλωθούν οι εισφορές ή οι συντάξιμες αποδοχές της μη μισθωτής περιόδου.",
      inputMode: null,
      inputModeLabel: null,
    };
  }

  const option = NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS[inputMode];

  if (!option) {
    return {
      error:
        "Ο τρόπος εισαγωγής εισφορών ή συντάξιμων αποδοχών της μη μισθωτής περιόδου δεν είναι έγκυρος.",
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

function buildAuxiliaryContributionDisplay(period = {}) {
  return {
    periodId: period.id,
    fundLabel:
      period.uniformedBodyLabel
        ? `${period.fundLabel} — ${period.uniformedBodyLabel}`
        : period.fundLabel,
    uniformedBody: period.uniformedBody || null,
    uniformedBodyLabel: period.uniformedBodyLabel || null,
    classification: period.auxiliaryContributionClassification,
    classificationLabel: period.auxiliaryContributionClassificationLabel,
    hasAuxiliary: period.hasAutomaticAuxiliary === true,
    formerAuxiliaryFund: period.formerAuxiliaryFund || null,
    formerAuxiliaryFundLabel: period.formerAuxiliaryFundLabel || null,
    workerGroupLabel: period.auxiliaryWorkerGroupLabel || null,
    extraContributionRatePercent:
      period.auxiliaryExtraContributionRatePercent,
    isProvisional:
      period.auxiliaryExtraContributionIsProvisional === true,
    warning: period.auxiliaryWarning || null,
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
    auxiliaryContributionDisplay: [],
    totalInsuranceTimeAnalysis: null,
  };
}

function createBackendSafeInsurancePeriodDraft(period) {
  return {
    id: period.id,
    fund: period.fund,
    uniformedBody: period.uniformedBody || null,
    insuredType: period.insuredType,
    employmentCategory: period.employmentCategory,
    nonSalariedEarningsInputMode: period.nonSalariedEarningsInputMode || null,
    tsaySinglePensionerStatus:
      period.tsaySinglePensionerStatus || null,
    fromDate: period.fromDate,
    toDate: period.toDate,
    insuranceDays: period.insuranceDays,
    insuranceDaysSource: period.insuranceDaysSource,
    categoryKey: period.categoryKey,
    contributionCategory: period.contributionCategory,
    specialWorkFacts: period.specialWorkFacts,
    auxiliaryContributionClassification:
      period.auxiliaryContributionClassification || null,
    formerAuxiliaryFund:
      period.formerAuxiliaryFund || null,
    formerAuxiliaryFundSelection:
      period.formerAuxiliaryFundSelection || null,
    auxiliaryWorkerGroupLabel:
      period.auxiliaryWorkerGroupLabel || null,
    auxiliaryExtraContributionChoice:
      period.auxiliaryExtraContributionChoice || null,
    auxiliaryExtraContributionRatePercent:
      period.auxiliaryExtraContributionRatePercent,
    auxiliaryExtraContributionIsProvisional:
      period.auxiliaryExtraContributionIsProvisional === true,
    uniformedSpecialTimeDraft: period.uniformedSpecialTimeDraft || null,
  };
}

function resolveInsurancePeriodDays({ daysText, insuranceTimeAnalysis, mode }) {
  if (daysText) {
    const manualDaysResult = parseNonNegativeInteger(daysText);

    if (!manualDaysResult.isValid) {
      return {
        error:
          "Οι ημέρες / ένσημα της ασφαλιστικής ομάδας πρέπει να είναι ακέραιος αριθμός.",
      };
    }

    if (manualDaysResult.value <= 0) {
      return {
        error:
          "Οι ημέρες / ένσημα της ασφαλιστικής ομάδας πρέπει να είναι περισσότερες από 0.",
      };
    }

    return {
      error: null,
      value: manualDaysResult.value,
      source: "manual_override",
      sourceLabel: "χειροκίνητη διόρθωση από τον χρήστη",
    };
  }

  const totalDays = Number(
    insuranceTimeAnalysis?.totalInsuranceDaysEquivalent || 0,
  );

  if (!Number.isFinite(totalDays) || totalDays <= 0) {
    return {
      error:
        "Δεν μπορεί να δοθεί ασφαλιστική ομάδα χωρίς συνολικό χρόνο ασφάλισης ή ημέρες ομάδας.",
    };
  }

  return {
    error: null,
    value: Math.round(totalDays),
    source: "total_insurance_time",
    sourceLabel: "από τον συνολικό χρόνο ασφάλισης",
  };
}

function analyzeInsurancePeriodDate({ value, fieldLabel }) {
  const trimmedValue = String(value || "").trim();

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

function resolveInsuredTypeForFund({
  fund,
  globalInsuredType,
  fallbackInsuredType,
}) {
  if (CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return "not_applicable";
  }

  if (globalInsuredType === "old" || globalInsuredType === "new") {
    return globalInsuredType;
  }

  return String(fallbackInsuredType || "").trim();
}

function isAllowedInsuredTypeForFund({ fund, insuredType }) {
  if (CONTRIBUTION_BASED_FUNDS.includes(fund)) {
    return insuredType === "not_applicable";
  }

  return insuredType === "old" || insuredType === "new";
}

function isAllowedEmploymentCategoryForFund({
  fund,
  insuredType,
  employmentCategory,
}) {
  return isEmploymentCategoryAllowedForFund({
    fund,
    insuredType,
    employmentCategory,
  });
}

function buildInsurancePeriodCategory({
  fund,
  insuredType,
  employmentCategory,
}) {
  const categoryKey = [fund, insuredType, employmentCategory]
    .filter(Boolean)
    .join("_");
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
      isCommonWork: employmentCategory === "common",
      isVaeWork: employmentCategory === "vae",
      isYvaeWork: employmentCategory === "yvae",
      isOtaIkaVaeWork: employmentCategory === "ota_ika_vae",
      isOtaPublicVaeWork: employmentCategory === "ota_public_vae",
      isOtaIkaYvaeWork: employmentCategory === "ota_ika_yvae",
      isOtaCleaningWork: [
        "ota_ika_vae",
        "ota_public_vae",
        "ota_ika_yvae",
      ].includes(employmentCategory),
      isContributionBasedWork: employmentCategory === "contributions",
      isOtaOrPublicSectorWork: fund === "public_sector" || fund === "ota",
      isTapDeiWork: fund === "tap_dei",
      isDekoWork: fund === "deko",
      isNatWork: fund === "nat",
      isTanpyWork: fund === "tanpy",
      isUniformedWork: fund === "uniformed",
      isArtisticWork: fund === "artistic",
      isAviationWork: fund === "aviation",
      isBankingFundWork: fund === "banking_funds",
      isTsaySalariedWork: fund === "tsay_salaried",
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
  const configuredContributionCategory =
    buildContributionCategoryForFundWorkType({
      fund,
      insuredType,
      employmentCategory,
    });

  if (configuredContributionCategory) {
    return configuredContributionCategory;
  }

  if (fund === "tanpy") {
    return "tanpy_salaried";
  }

  if (ARTICLE30_MAIN_CONTRIBUTION_FUNDS.includes(fund)) {
    return fund === "aviation" || fund === "artistic"
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
  const hasTsmedePeriod = periods.some((period) => period?.fund === "tsmede");
  const tsaySinglePensionerPeriods = periods.filter((period) => {
    return (
      ["tsay", "tsay_salaried"].includes(period?.fund) &&
      period?.tsaySinglePensionerStatus === "yes"
    );
  });

  if (!hasTsmedePeriod && tsaySinglePensionerPeriods.length === 0) {
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

  if (hasTsmedePeriod) {
    const tsmedeResult = analyzeTsmedeExtraBenefit(draft.tsmede);

    if (tsmedeResult.error) {
      return createEtaaExtraBenefitError(tsmedeResult.error);
    }

    if (tsmedeResult.entry) {
      entries.push(tsmedeResult.entry);
      displayEntries.push(tsmedeResult.displayEntry);
    }
  }

  if (tsaySinglePensionerPeriods.length > 0) {
    const contributionDays = tsaySinglePensionerPeriods.reduce(
      (sum, period) => sum + Number(period?.insuranceDays || 0),
      0,
    );
    const contributionYears = roundToDecimals(
      contributionDays / INSURANCE_DAYS_PER_YEAR,
      6,
    );
    const sourceInsurancePeriodIds = tsaySinglePensionerPeriods
      .map((period) => period?.id)
      .filter(Boolean);

    entries.push({
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSAY_SINGLE_PENSIONER_BRANCH,
      baseAmountSource:
        "contributory_pensionable_earnings_before_general_plastic_years",
      contributionYears,
      extraContributionPoints: TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
      calculationPolicy: "efka_administrative_10_points",
      sourceInsurancePeriodIds,
    });

    displayEntries.push({
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSAY_SINGLE_PENSIONER_BRANCH,
      label: "ΤΣΑΥ — Κλάδος Μονοσυνταξιούχων",
      contributionYears,
      contributionDays,
      extraContributionPoints: TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
      sourceInsurancePeriodIds,
      summary:
        `ΤΣΑΥ Μονοσυνταξιούχων: ${contributionDays} ημέρες ` +
        `(${contributionYears} έτη), με βάση τις ίδιες συντάξιμες αποδοχές ` +
        `της κύριας σύνταξης και 10 επιπλέον μονάδες εισφοράς.`,
    });

    warnings.push(
      "Ο Κλάδος Μονοσυνταξιούχων ΤΣΑΥ θα υπολογιστεί με 10 επιπλέον μονάδες εισφοράς, σύμφωνα με την τρέχουσα διοικητική πρακτική του e-ΕΦΚΑ. Η χρήση των 10 μονάδων αμφισβητείται δικαστικά.",
    );
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
  const status = String(value.status || "").trim();

  if (!status) {
    return {
      error: "Δηλώστε αν υπήρχε υπαγωγή στην Ειδική Προσαύξηση ΤΣΜΕΔΕ.",
    };
  }

  if (!["yes", "no"].includes(status)) {
    return {
      error: "Η επιλογή για την Ειδική Προσαύξηση ΤΣΜΕΔΕ δεν είναι έγκυρη.",
    };
  }

  if (status === "no") {
    return {
      error: null,
      entry: null,
      displayEntry: null,
    };
  }

  const baseAmountResult = parsePositiveDecimalForEtaa(
    value.baseAmount,
    "Η μέση μηνιαία βάση της Ειδικής Προσαύξησης ΤΣΜΕΔΕ",
  );

  if (baseAmountResult.error) {
    return { error: baseAmountResult.error };
  }

  const totalDurationResult = analyzeEtaaDuration({
    yearsValue: value.contributionYears,
    monthsValue: value.contributionMonths,
    label: "Ο συνολικός χρόνος Ειδικής Προσαύξησης ΤΣΜΕΔΕ",
  });

  if (totalDurationResult.error) {
    return { error: totalDurationResult.error };
  }

  const contributionPeriods = [
    {
      years: totalDurationResult.decimalYears,
      extraContributionPoints: TSMEDE_DEFAULT_EXTRA_CONTRIBUTION_POINTS,
      reason: "Βασική Ειδική Προσαύξηση ΤΣΜΕΔΕ — 12 μονάδες",
    },
  ];

  const higherRateStatus = String(
    value.hasHigherSalariedRateBefore2007 || "no",
  ).trim();

  if (!["yes", "no"].includes(higherRateStatus)) {
    return {
      error:
        "Δηλώστε αν καταβλήθηκε υψηλότερο ασφάλιστρο έμμισθου ΤΣΜΕΔΕ πριν από 1/1/2007.",
    };
  }

  if (higherRateStatus === "yes") {
    const higherRateDurationResult = analyzeEtaaDuration({
      yearsValue: value.higherRateYears,
      monthsValue: value.higherRateMonths,
      label: "Ο χρόνος υψηλότερου ασφαλίστρου έμμισθου ΤΣΜΕΔΕ",
    });

    if (higherRateDurationResult.error) {
      return { error: higherRateDurationResult.error };
    }

    if (
      higherRateDurationResult.decimalYears > totalDurationResult.decimalYears
    ) {
      return {
        error:
          "Ο χρόνος υψηλότερου ασφαλίστρου πριν από το 2007 δεν μπορεί να υπερβαίνει τον συνολικό χρόνο Ειδικής Προσαύξησης ΤΣΜΕΔΕ.",
      };
    }

    const extraPointsResult = parsePositiveDecimalForEtaa(
      value.additionalPointsAboveTwelve,
      "Οι πρόσθετες μονάδες του υψηλότερου ασφαλίστρου ΤΣΜΕΔΕ πάνω από τις 12",
    );

    if (extraPointsResult.error) {
      return { error: extraPointsResult.error };
    }

    contributionPeriods.push({
      years: higherRateDurationResult.decimalYears,
      extraContributionPoints: extraPointsResult.value,
      reason:
        "Πρόσθετη διαφορά υψηλότερου ασφαλίστρου έμμισθου πριν από 1/1/2007",
    });
  }

  const additionalTwoPercentStatus = String(
    value.hasAdditionalTwoPercent || "no",
  ).trim();

  if (!["yes", "no"].includes(additionalTwoPercentStatus)) {
    return {
      error:
        "Δηλώστε αν καταβλήθηκε η πρόσθετη εισφορά 2% ΤΣΜΕΔΕ για το διάστημα 1/7/2011–31/12/2015.",
    };
  }

  if (additionalTwoPercentStatus === "yes") {
    const twoPercentDurationResult = analyzeEtaaDuration({
      yearsValue: value.additionalTwoPercentYears,
      monthsValue: value.additionalTwoPercentMonths,
      label: "Ο χρόνος καταβολής της πρόσθετης εισφοράς 2% ΤΣΜΕΔΕ",
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
          "Η πρόσθετη εισφορά 2% ΤΣΜΕΔΕ μπορεί να δηλωθεί μέχρι 4 έτη και 6 μήνες για το διάστημα 1/7/2011–31/12/2015.",
      };
    }

    contributionPeriods.push({
      years: twoPercentDurationResult.decimalYears,
      extraContributionPoints: 2,
      reason: "Πρόσθετη εισφορά 2% ΤΣΜΕΔΕ 1/7/2011–31/12/2015",
    });
  }

  const baseAmount = roundToDecimals(baseAmountResult.value, 2);

  return {
    error: null,
    entry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSMEDE_SPECIAL_INCREASE,
      baseAmount,
      contributionPeriods,
      calculationPolicy: "documented_tsmede_rules",
    },
    displayEntry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSMEDE_SPECIAL_INCREASE,
      label: "ΤΣΜΕΔΕ — Ειδική Προσαύξηση",
      baseAmount,
      contributionYears: totalDurationResult.decimalYears,
      summary:
        `ΤΣΜΕΔΕ Ειδική Προσαύξηση: βάση ${baseAmount.toFixed(2)} €, ` +
        `${formatEtaaDuration(totalDurationResult)} με βασικές 12 μονάδες` +
        `${higherRateStatus === "yes" ? ", συν πρόσθετη διαφορά υψηλότερου ασφαλίστρου πριν από το 2007" : ""}` +
        `${additionalTwoPercentStatus === "yes" ? ", συν πρόσθετη εισφορά 2%" : ""}.`,
    },
  };
}

function analyzeTsayExtraBenefit(value = {}) {
  const status = String(value.status || "").trim();

  if (!status) {
    return {
      error: "Δηλώστε αν υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ.",
    };
  }

  if (!["yes", "no"].includes(status)) {
    return {
      error: "Η επιλογή για τον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ δεν είναι έγκυρη.",
    };
  }

  if (status === "no") {
    return {
      error: null,
      entry: null,
      displayEntry: null,
    };
  }

  const baseAmountResult = parsePositiveDecimalForEtaa(
    value.baseAmount,
    "Η μέση μηνιαία βάση του Κλάδου Μονοσυνταξιούχων ΤΣΑΥ",
  );

  if (baseAmountResult.error) {
    return { error: baseAmountResult.error };
  }

  const durationResult = analyzeEtaaDuration({
    yearsValue: value.contributionYears,
    monthsValue: value.contributionMonths,
    label: "Ο χρόνος καταβολής εισφοράς Μονοσυνταξιούχων ΤΣΑΥ",
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
      extraContributionPoints: TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
      calculationPolicy: "efka_administrative_10_points",
    },
    displayEntry: {
      benefitType: ETAA_EXTRA_BENEFIT_TYPES.TSAY_SINGLE_PENSIONER_BRANCH,
      label: "ΤΣΑΥ — Κλάδος Μονοσυνταξιούχων",
      baseAmount,
      contributionYears: durationResult.decimalYears,
      extraContributionPoints: TSAY_ADMINISTRATIVE_EXTRA_CONTRIBUTION_POINTS,
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
      6,
    ),
  };
}

function parsePositiveDecimalForEtaa(value, label) {
  const result = parseNonNegativeDecimal(String(value || "").trim());

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
      status: "",
      baseAmount: "",
      contributionYears: "",
      contributionMonths: "",
      hasHigherSalariedRateBefore2007: "no",
      higherRateYears: "",
      higherRateMonths: "",
      additionalPointsAboveTwelve: "",
      hasAdditionalTwoPercent: "no",
      additionalTwoPercentYears: "",
      additionalTwoPercentMonths: "",
    },
    tsay: {
      status: "",
      baseAmount: "",
      contributionYears: "",
      contributionMonths: "",
    },
  };

  if (!value || typeof value !== "object") {
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
  const trimmedDays = String(insuranceDaysInput || "").trim();

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
      error: "Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.",
      warnings: [],
    };
  }

  if (daysResult.value <= 0) {
    return {
      hasValue: true,
      error: "Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι περισσότερα από 0.",
      warnings: [],
    };
  }

  const displayTime = convertInsuranceDaysToDisplayTime(daysResult.value);
  const decimalYears = roundToDecimals(
    daysResult.value / INSURANCE_DAYS_PER_YEAR,
    6,
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
  const yearsText = String(insuranceYearsInput || "").trim();
  const monthsText = String(insuranceMonthsInput || "").trim();
  const daysText = String(insuranceExtraDaysInput || "").trim();

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
      error: "Τα έτη ασφάλισης πρέπει να είναι ακέραιος αριθμός.",
      warnings: [],
    };
  }

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: "Οι μήνες ασφάλισης πρέπει να είναι ακέραιος αριθμός.",
      warnings: [],
    };
  }

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: "Οι ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.",
      warnings: [],
    };
  }

  const years = yearsResult.value;
  const months = monthsResult.value;
  const days = daysResult.value;

  if (months > 11) {
    return {
      hasValue: true,
      error: "Οι μήνες ασφάλισης πρέπει να είναι από 0 έως 11.",
      warnings: [],
    };
  }

  if (days > 24) {
    return {
      hasValue: true,
      error: "Οι ημέρες ασφάλισης πρέπει να είναι από 0 έως 24.",
      warnings: [],
    };
  }

  if (years === 0 && months === 0 && days === 0) {
    return {
      hasValue: true,
      error: "Ο χρόνος ασφάλισης πρέπει να είναι μεγαλύτερος από 0.",
      warnings: [],
    };
  }

  const totalDays =
    years * INSURANCE_DAYS_PER_YEAR + months * INSURANCE_DAYS_PER_MONTH + days;

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
  const trimmedValue = String(value || "").trim();

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
      error: "Τα έτη νόμιμης διαμονής πρέπει να είναι αριθμός.",
      warnings: [],
    };
  }

  const residenceYears = roundToDecimals(numberResult.value, 4);
  const warnings = [];

  if (residenceYears < MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION) {
    warnings.push(
      "Με αυτά τα έτη νόμιμης διαμονής δεν δικαιούται εθνική σύνταξη.",
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
  parallelInsuranceSegments = [],
  parallelInsuranceDraft,
}) {
  const hasContributionBasedPeriod = insurancePeriodsDraft.some((period) => {
    return CONTRIBUTION_BASED_FUNDS.includes(period?.fund);
  });
  const hasPost2017ParallelSegment = parallelInsuranceSegments.some(
    (segment) => segment?.periodType === "from_2017",
  );
  const yearlyRowsWithinDeclaredEmployment =
    limitYearlyEarningsRowsToDeclaredEmployment({
      rows: yearlyEarningsRows,
      insurancePeriodsDraft,
    });

  if (hasContributionBasedPeriod || hasPost2017ParallelSegment) {
    return analyzeInsurancePeriodYearlyAmounts({
      currentFormStep,
      yearlyEarningsRows: yearlyRowsWithinDeclaredEmployment,
      insurancePeriodsDraft,
      parallelInsuranceSegments,
      parallelInsuranceDraft,
    });
  }

  const method = String(contributoryEarningsInputMethod || "").trim();

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
      error: "Επιλέξτε έγκυρο τρόπο εισαγωγής συντάξιμων αποδοχών.",
      warnings: [],
      requiresContributoryYearlyStep: false,
    };
  }

  if (method === "average_monthly") {
    return analyzeAverageMonthlyPensionableEarnings({
      averageMonthlyPensionableEarningsInput,
      method,
    });
  }

  return analyzeYearlyEarnings({
    currentFormStep,
    yearlyEarningsRows: yearlyRowsWithinDeclaredEmployment,
    method,
  });
}

function limitYearlyEarningsRowsToDeclaredEmployment({
  rows,
  insurancePeriodsDraft,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const toYears = (
    Array.isArray(insurancePeriodsDraft) ? insurancePeriodsDraft : []
  )
    .map((period) => getIsoDateYear(period?.toDate))
    .filter((year) => Number.isInteger(year));

  if (toYears.length === 0) {
    return safeRows;
  }

  const latestDeclaredEmploymentYear = Math.max(...toYears);

  return safeRows.filter((row) => {
    const yearText = String(row?.year || "").trim();
    const yearResult = parseNonNegativeInteger(yearText);

    if (!yearResult.isValid) {
      return true;
    }

    return yearResult.value <= latestDeclaredEmploymentYear;
  });
}

function analyzeInsurancePeriodYearlyAmounts({
  currentFormStep,
  yearlyEarningsRows,
  insurancePeriodsDraft,
  parallelInsuranceSegments,
  parallelInsuranceDraft,
}) {
  const method = "yearly_earnings";
  const methodLabel = "Ετήσια ποσά και ημέρες ανά ασφαλιστική περίοδο";

  if (currentFormStep !== "contributory_yearly") {
    return {
      hasValue: true,
      error: null,
      warnings: [
        "Τα ετήσια ποσά των ασφαλιστικών περιόδων θα συμπληρωθούν στο επόμενο βήμα.",
      ],
      requiresContributoryYearlyStep: true,
      contributoryEarningsInputMethod: method,
      contributoryEarningsInputMethodLabel: methodLabel,
      averageMonthlyPensionableEarnings: null,
      yearsData: [],
      contributoryPensionData: {
        earningsInputMethod: method,
        yearlyAmountSource: "insurance_period_modes",
      },
    };
  }

  const normalizedRows = normalizeInsurancePeriodYearlyAmountRows({
    rows: yearlyEarningsRows,
    insurancePeriodsDraft,
    parallelInsuranceSegments,
    parallelInsuranceDraft,
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
        yearlyAmountSource: "insurance_period_modes",
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
      yearlyAmountSource: "insurance_period_modes",
      yearsData: normalizedRows.yearsData,
    },
  };
}

function normalizeInsurancePeriodYearlyAmountRows({
  rows,
  insurancePeriodsDraft,
  parallelInsuranceSegments,
  parallelInsuranceDraft,
}) {
  if (!Array.isArray(rows)) {
    return {
      error: "Τα ετήσια στοιχεία δεν έχουν σωστή μορφή.",
      yearsData: [],
    };
  }

  const periods = Array.isArray(insurancePeriodsDraft)
    ? insurancePeriodsDraft
    : [];
  const yearsData = [];
  const seenYears = new Set();

  for (const row of rows) {
    const yearText = String(row.year || "").trim();
    const amountText = String(row.annualEarnings || "").trim();
    const daysText = String(row.insuranceDays || "").trim();
    const hasUsefulValue = Boolean(amountText || daysText);

    if (!hasUsefulValue) {
      continue;
    }

    const yearResult = parseNonNegativeInteger(yearText);

    if (!yearResult.isValid || yearResult.value < 2002) {
      return {
        error: "Κάθε γραμμή πρέπει να έχει έγκυρο έτος από το 2002 και μετά.",
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

    let parallelYearContext = null;

    if (matchingPeriods.length > 1) {
      parallelYearContext = resolveParallelYearContext({
        year: yearResult.value,
        matchingPeriods,
        parallelInsuranceSegments,
        parallelInsuranceDraft,
      });

      if (!parallelYearContext) {
        return {
          error:
            `Το έτος ${yearResult.value} ανήκει σε περισσότερες από μία ασφαλιστικές περιόδους. ` +
            "Χρειάζεται συμπληρωμένη ανάλυση παράλληλης ασφάλισης.",
          yearsData: [],
        };
      }
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
      parallelAnnualAmountMode:
        parallelYearContext?.periodType === "from_2017"
          ? "combined_pensionable_earnings"
          : null,
      parallelTimeCountingPeriodId:
        parallelYearContext?.periodType === "until_2016"
          ? parallelYearContext.timeCountingPeriodId
          : null,
    });
  }

  return {
    error: null,
    yearsData,
  };
}

function resolveParallelYearContext({
  year,
  matchingPeriods,
  parallelInsuranceSegments,
  parallelInsuranceDraft,
}) {
  const segment = (
    Array.isArray(parallelInsuranceSegments) ? parallelInsuranceSegments : []
  ).find((candidate) => {
    const fromYear = getIsoDateYear(candidate?.fromDate);
    const toYear = getIsoDateYear(candidate?.toDate);
    const matchingPeriodIds = matchingPeriods
      .map((period) => String(period?.id || ""))
      .sort((left, right) => left.localeCompare(right));
    const candidatePeriodIds = [...(candidate?.periodIds || [])].sort(
      (left, right) => left.localeCompare(right),
    );

    return (
      fromYear !== null &&
      toYear !== null &&
      year >= fromYear &&
      year <= toYear &&
      matchingPeriodIds.length === candidatePeriodIds.length &&
      matchingPeriodIds.every(
        (periodId, index) => periodId === candidatePeriodIds[index],
      )
    );
  });

  if (!segment) {
    return null;
  }

  const normalizedDraft = normalizeParallelInsuranceDraft(
    parallelInsuranceDraft,
  );
  const segmentDraft = normalizedDraft.segments[segment.id] || {};
  const timeCountingPeriodId = String(
    segmentDraft.timeCountingPeriodId || "",
  ).trim();

  if (!segment.periodIds.includes(timeCountingPeriodId)) {
    return null;
  }

  return {
    periodType: segment.periodType,
    timeCountingPeriodId,
  };
}

function getIsoDateYear(value) {
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(String(value || "").trim());

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function analyzeAverageMonthlyPensionableEarnings({
  averageMonthlyPensionableEarningsInput,
  method,
}) {
  const trimmedValue = String(
    averageMonthlyPensionableEarningsInput || "",
  ).trim();

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
      error: "Ο μέσος μηνιαίος συντάξιμος μισθός πρέπει να είναι αριθμός.",
      warnings: [],
      requiresContributoryYearlyStep: false,
    };
  }

  if (amountResult.value <= 0) {
    return {
      hasValue: true,
      error:
        "Ο μέσος μηνιαίος συντάξιμος μισθός πρέπει να είναι μεγαλύτερος από 0.",
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
  if (currentFormStep !== "contributory_yearly") {
    return {
      hasValue: true,
      error: null,
      warnings: [
        "Η αναλυτική εισαγωγή αποδοχών θα συμπληρωθεί στο επόμενο βήμα.",
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
      error: "Τα ετήσια στοιχεία αποδοχών δεν έχουν σωστή μορφή.",
      yearsData: [],
    };
  }

  const yearsData = [];

  for (const row of rows) {
    const yearText = String(row.year || "").trim();
    const earningsText = String(row.annualEarnings || "").trim();
    const daysText = String(row.insuranceDays || "").trim();

    const hasAnyValue = Boolean(yearText || earningsText || daysText);
    const hasUsefulValue = Boolean(earningsText || daysText);

    if (!hasAnyValue || !hasUsefulValue) {
      continue;
    }

    const yearResult = parseNonNegativeInteger(yearText);

    if (!yearResult.isValid || yearResult.value < 2002) {
      return {
        error:
          "Κάθε γραμμή αποδοχών πρέπει να έχει έγκυρο έτος από το 2002 και μετά.",
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

function normalizeParallelAnnualAuxiliaryContributionAmounts(
  value,
  segment = {},
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: true, value: {} };
  }

  const fromYear = Number(String(segment.fromDate || "").slice(0, 4));
  const toYear = Number(String(segment.toDate || "").slice(0, 4));
  const normalized = {};

  for (const [yearText, rawAmount] of Object.entries(value)) {
    const year = Number(yearText);
    const amountText = String(rawAmount ?? "").trim();

    if (!amountText) {
      continue;
    }

    if (
      !Number.isInteger(year) ||
      year < 2017 ||
      (Number.isInteger(fromYear) && year < fromYear) ||
      (Number.isInteger(toYear) && year > toYear)
    ) {
      continue;
    }

    const amountResult = parseNonNegativeDecimal(amountText);

    if (!amountResult.isValid) {
      return {
        ok: false,
        error:
          `Το συνολικό ποσό επικουρικών εισφορών για το έτος ${year} πρέπει να είναι μη αρνητικός αριθμός.`,
      };
    }

    if (amountResult.value > 0) {
      normalized[year] = roundToDecimals(amountResult.value, 2);
    }
  }

  return { ok: true, value: normalized };
}

function parseNonNegativeInteger(value) {
  const text = String(value || "").trim();

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
  const text = String(value || "").trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  return parseNonNegativeInteger(text);
}

function parseNonNegativeDecimal(value) {
  const normalizedText = String(value || "")
    .trim()
    .replace(",", ".");

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

  const months = Math.floor(remainingDaysAfterYears / INSURANCE_DAYS_PER_MONTH);

  const days = remainingDaysAfterYears % INSURANCE_DAYS_PER_MONTH;

  return {
    years,
    months,
    days,
  };
}

function parseGreekDateInput(value) {
  const normalizedValue = String(value || "").trim();

  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/,
  );

  if (separatedDateMatch) {
    return {
      isValidFormat: true,
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: normalizeYear(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, "");

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
  const yearText = String(value || "").trim();

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

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(value || "").trim(),
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  return isRealDate ? parsedDate : null;
}

function padTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

function validateUniformedSpecialTimeDraftForAnalysis({
  fund,
  uniformedBody,
  fromDate,
  uniformedSpecialTimeDraft,
}) {
  if (fund !== "uniformed") {
    return {
      error: null,
      value: null,
    };
  }

  const normalizedDraft =
    normalizeUniformedSpecialTimeDraft(
      uniformedSpecialTimeDraft,
    );
  const expectedInsuranceRegime =
    deriveUniformedInsuranceRegimeFromDate(fromDate);
  const insuranceRegime = String(
    normalizedDraft.insuranceRegime || "",
  ).trim();

  if (!expectedInsuranceRegime) {
    return {
      error:
        "Συμπληρώστε έγκυρη ημερομηνία έναρξης της ένστολης περιόδου, ώστε να προκύψει αυτόματα το καθεστώς κατάταξης.",
      value: null,
    };
  }

  if (
    insuranceRegime !==
    expectedInsuranceRegime
  ) {
    return {
      error:
        "Το καθεστώς κατάταξης δεν συμφωνεί με την ημερομηνία έναρξης της συγκεκριμένης ένστολης περιόδου.",
      value: null,
    };
  }

  const combatDaysResult =
    getCombatFiveYearServiceDaysForAnalysis(
      normalizedDraft
        .combatFiveYearService,
    );

  if (combatDaysResult.error) {
    return {
      error: combatDaysResult.error,
    };
  }

  const combatEarningsValidation =
    validateUniformedRecognitionEarningsForAnalysis(
      normalizedDraft
        .combatFiveYearService,
      "τη μάχιμη πενταετία",
      combatDaysResult.days,
    );

  if (combatEarningsValidation.error) {
    return {
      error:
        combatEarningsValidation.error,
    };
  }

  const semestersDaysResult =
    getSpecialSemestersDaysForAnalysis(
      normalizedDraft.specialSemesters,
      insuranceRegime,
    );

  if (semestersDaysResult.error) {
    return {
      error: semestersDaysResult.error,
    };
  }

  const semestersEarningsValidation =
    validateUniformedRecognitionEarningsForAnalysis(
      normalizedDraft.specialSemesters,
      "τα εξάμηνα",
      semestersDaysResult.days,
    );

  if (semestersEarningsValidation.error) {
    return {
      error:
        semestersEarningsValidation.error,
    };
  }

  if (insuranceRegime === "new_ika") {
    const maxCombinedDays =
      7 * INSURANCE_DAYS_PER_YEAR;
    const totalSpecialDays =
      combatDaysResult.days +
      semestersDaysResult.days;

    if (
      totalSpecialDays >
      maxCombinedDays
    ) {
      return {
        error:
          "Για κατάταξη από 01/01/2011, η μάχιμη πενταετία μαζί με τα εξάμηνα δεν μπορεί να ξεπερνά τα 7 έτη. Στον τελικό έλεγχο συνυπολογίζονται και τυχόν λοιποί αναγνωριζόμενοι χρόνοι.",
      };
    }
  }

  return {
    error: null,
    value: {
      ...normalizedDraft,
      insuranceRegime:
        expectedInsuranceRegime,
      article36ACategory: "",
    },
  };
}

function getCombatFiveYearServiceDaysForAnalysis(combatFiveYearService = {}) {
  const status = String(combatFiveYearService.status || "none").trim();

  if (status === "none") {
    return {
      days: 0,
      error: null,
    };
  }

  if (status === "full") {
    return {
      days: 5 * INSURANCE_DAYS_PER_YEAR,
      error: null,
    };
  }

  if (status !== "partial") {
    return {
      days: 0,
      error: "Η επιλογή μάχιμης πενταετίας δεν είναι έγκυρη.",
    };
  }

  const years = parseNonNegativeIntegerOrEmpty(combatFiveYearService.years);
  const months = parseNonNegativeIntegerOrEmpty(combatFiveYearService.months);
  const days = parseNonNegativeIntegerOrEmpty(combatFiveYearService.days);

  if (!years.isValid || !months.isValid || !days.isValid) {
    return {
      days: 0,
      error:
        "Ο μερικός χρόνος μάχιμης πενταετίας πρέπει να δηλωθεί με ακέραια έτη, μήνες και ημέρες.",
    };
  }

  if (years.value === 0 && months.value === 0 && days.value === 0) {
    return {
      days: 0,
      error:
        "Αν η μάχιμη πενταετία είναι μερική, πρέπει να δηλωθεί τουλάχιστον ένας χρόνος.",
    };
  }

  if (months.value > 11) {
    return {
      days: 0,
      error:
        "Οι μήνες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 11.",
    };
  }

  if (days.value > 24) {
    return {
      days: 0,
      error:
        "Οι ημέρες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 24.",
    };
  }

  const totalCombatFiveYearDays =
    years.value * INSURANCE_DAYS_PER_YEAR +
    months.value * INSURANCE_DAYS_PER_MONTH +
    days.value;

  if (totalCombatFiveYearDays > 5 * INSURANCE_DAYS_PER_YEAR) {
    return {
      days: 0,
      error: "Η μερική μάχιμη πενταετία δεν μπορεί να ξεπερνά τα 5 έτη.",
    };
  }

  return {
    days: totalCombatFiveYearDays,
    error: null,
  };
}

function getSpecialSemestersDaysForAnalysis(
  specialSemesters = {},
  insuranceRegime = "",
) {
  const status = String(specialSemesters.status || "none").trim();

  if (status === "none") {
    return {
      days: 0,
      error: null,
    };
  }

  if (status !== "yes") {
    return {
      days: 0,
      error: "Η επιλογή εξαμήνων δεν είναι έγκυρη.",
    };
  }

  const semestersCount = parseNonNegativeIntegerOrEmpty(
    specialSemesters.semestersCount,
  );

  if (!semestersCount.isValid || semestersCount.value <= 0) {
    return {
      days: 0,
      error:
        "Το πλήθος εξαμήνων πρέπει να είναι ακέραιος αριθμός μεγαλύτερος από 0.",
    };
  }

  return {
    days: semestersCount.value * 6 * INSURANCE_DAYS_PER_MONTH,
    error: null,
  };
}

function validateUniformedRecognitionEarningsForAnalysis(
  value = {},
  label,
  insuranceDays,
) {
  const status = String(
    value.status || "none",
  ).trim();

  if (status === "none") {
    return { error: null };
  }

  const serviceYearsResult =
    parseUniformedServiceYearsForAnalysis(
      value.serviceYears,
    );

  if (serviceYearsResult.error) {
    return {
      error:
        `Για ${label}, ${serviceYearsResult.error}`,
    };
  }

  const requiredServiceYearsCount = Math.ceil(
    Number(insuranceDays || 0) /
      INSURANCE_DAYS_PER_YEAR,
  );

  if (
    serviceYearsResult.years.length !==
    requiredServiceYearsCount
  ) {
    const yearsWord =
      requiredServiceYearsCount === 1 ? "έτος" : "έτη";

    return {
      error:
        `Για ${label}, δηλώστε ακριβώς ${requiredServiceYearsCount} διαφορετικά ${yearsWord} ειδικής υπηρεσίας. ` +
        `Έχουν δηλωθεί ${serviceYearsResult.years.length}.`,
    };
  }

  const contributionPaymentMode = String(
    value.contributionPaymentMode || "",
  ).trim();

  if (
    ![
      "withheld_during_service",
      "later_recognition",
      "legacy_opt_out_later_recognition",
      "legal_exemption",
    ].includes(contributionPaymentMode)
  ) {
    return {
      error:
        `Για ${label}, επιλέξτε πώς καταβλήθηκαν οι πρόσθετες εισφορές.`,
    };
  }

  if (
    contributionPaymentMode ===
    "legacy_opt_out_later_recognition"
  ) {
    const applicationYear =
      parseNonNegativeInteger(
        String(
          value.applicationYear || "",
        ).trim(),
      );

    if (
      !applicationYear.isValid ||
      applicationYear.value < 1900 ||
      applicationYear.value > 2100
    ) {
      return {
        error:
          `Για ${label}, το έτος μεταγενέστερης αναγνώρισης πρέπει να είναι έγκυρο τετραψήφιο έτος.`,
      };
    }

    const latestServiceYear = Math.max(
      ...serviceYearsResult.years,
    );

    if (
      applicationYear.value <
      latestServiceYear
    ) {
      return {
        error:
          `Για ${label}, το έτος μεταγενέστερης αναγνώρισης δεν μπορεί να προηγείται του τελευταίου έτους ειδικής υπηρεσίας.`,
      };
    }
  }

  return { error: null };
}

function parseUniformedServiceYearsForAnalysis(
  value,
) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/[\s,;|]+/)
        .filter(Boolean);

  if (rawValues.length === 0) {
    return {
      years: [],
      error:
        "δηλώστε τα έτη στα οποία πραγματοποιήθηκε η ειδική υπηρεσία.",
    };
  }

  const years = [];
  const seen = new Set();

  for (const rawValue of rawValues) {
    const text = String(
      rawValue,
    ).trim();

    if (!/^\d{4}$/.test(text)) {
      return {
        years: [],
        error:
          "τα έτη ειδικής υπηρεσίας πρέπει να είναι τετραψήφια και χωρισμένα με κόμμα.",
      };
    }

    const year = Number(text);

    if (year < 1900 || year > 2100) {
      return {
        years: [],
        error:
          "κάθε έτος ειδικής υπηρεσίας πρέπει να είναι από 1900 έως 2100.",
      };
    }

    if (seen.has(year)) {
      return {
        years: [],
        error:
          `το έτος ${year} δηλώθηκε περισσότερες από μία φορές.`,
      };
    }

    seen.add(year);
    years.push(year);
  }

  return {
    years,
    error: null,
  };
}

function createEmptyUniformedSpecialTimeDraft() {
  return {
    insuranceRegime: "",
    article36ACategory: "",
    combatFiveYearService: {
      status: "none",
      years: "",
      months: "",
      days: "",
      serviceYears: "",
      contributionPaymentMode: "",
      applicationYear: "",
      recognitionPeriod: "",
      paidAmount: "",
      contributionRatePercent: "",
      explicitPensionableEarningsBase: "",
      earningsReferenceYear: "",
    },
    specialSemesters: {
      status: "none",
      specialSemestersType: "",
      recognizedArticle41Time: false,
      semestersCount: "",
      milestoneCompletionYear: "",
      serviceYears: "",
      contributionPaymentMode: "",
      applicationYear: "",
      recognitionPeriod: "",
      paidAmount: "",
      contributionRatePercent: "",
      explicitPensionableEarningsBase: "",
      earningsReferenceYear: "",
    },
  };
}

function normalizeUniformedSpecialTimeDraft(
  value,
) {
  const defaultValue =
    createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== "object") {
    return defaultValue;
  }

  const normalizedDraft = {
    insuranceRegime:
      value.insuranceRegime || "",
    article36ACategory: "",
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };

  if (
    normalizedDraft
      .combatFiveYearService.status ===
    "none"
  ) {
    normalizedDraft
      .combatFiveYearService
      .serviceYears = "";
    normalizedDraft
      .combatFiveYearService
      .contributionPaymentMode = "";
    normalizedDraft
      .combatFiveYearService
      .applicationYear = "";
  }

  if (
    normalizedDraft.specialSemesters
      .status === "none"
  ) {
    normalizedDraft.specialSemesters
      .specialSemestersType = "";
    normalizedDraft.specialSemesters
      .recognizedArticle41Time = false;
    normalizedDraft.specialSemesters
      .serviceYears = "";
    normalizedDraft.specialSemesters
      .contributionPaymentMode = "";
    normalizedDraft.specialSemesters
      .applicationYear = "";
  } else {
    normalizedDraft.specialSemesters
      .specialSemestersType =
      FREE_RECOGNIZED_ARTICLE_41_SEMESTERS_TYPE;
    normalizedDraft.specialSemesters
      .recognizedArticle41Time = true;
    normalizedDraft.specialSemesters
      .milestoneCompletionYear = "";
  }

  if (
    normalizedDraft
      .combatFiveYearService
      .contributionPaymentMode !==
    "legacy_opt_out_later_recognition"
  ) {
    normalizedDraft
      .combatFiveYearService
      .applicationYear = "";
  }

  if (
    normalizedDraft.specialSemesters
      .contributionPaymentMode !==
    "legacy_opt_out_later_recognition"
  ) {
    normalizedDraft.specialSemesters
      .applicationYear = "";
  }

  return normalizedDraft;
}

function hasActiveUniformedSpecialTimeDraft(value) {
  const normalizedDraft = normalizeUniformedSpecialTimeDraft(value);

  return (
    normalizedDraft.combatFiveYearService.status !== "none" ||
    normalizedDraft.specialSemesters.status !== "none"
  );
}

export { analyzePensionForm };
