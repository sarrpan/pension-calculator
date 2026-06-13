// scripts/run-uniformed-integration-tests.mjs
//
// Εκτέλεση από τον κεντρικό φάκελο του project:
//
//   node scripts\run-uniformed-integration-tests.mjs --prepare-url=http://127.0.0.1:5001/PROJECT_ID/us-central1/preparePensionCalculationInput
//
// Παράδειγμα αν ο emulator εμφανίζει άλλο port:
//
//   node scripts\run-uniformed-integration-tests.mjs --prepare-url=http://127.0.0.1:8260/PROJECT_ID/us-central1/preparePensionCalculationInput
//
// Αποτελέσματα:
//   test-results/uniformed-integration-tests-<timestamp>.json
//   test-results/uniformed-integration-tests-<timestamp>.txt
//
// Το script ελέγχει:
// 1. pensionFormAnalysis.js
// 2. validations φόρμας
// 3. μεταφορά των πεδίων στο calculationInput
// 4. preparePensionCalculationInput μέσω HTTP
// 5. μεταφορά των πεδίων στο preparedInput

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT_DIR = process.cwd();
const RESULTS_DIR = path.join(ROOT_DIR, "test-results");
const ANALYSIS_FILE = path.join(
  ROOT_DIR,
  "src",
  "pages",
  "calculator",
  "utils",
  "pensionFormAnalysis.js"
);

const args = process.argv.slice(2);
const prepareUrlArg = args.find((arg) => arg.startsWith("--prepare-url="));
const PREPARE_URL = prepareUrlArg
  ? prepareUrlArg.slice("--prepare-url=".length).trim()
  : "";

const results = [];

function check(name, actual, expected, comparator = "strict") {
  let passed = false;

  if (comparator === "includes") {
    passed =
      typeof actual === "string" &&
      actual.toLowerCase().includes(String(expected).toLowerCase());
  } else if (comparator === "truthy") {
    passed = Boolean(actual);
  } else if (comparator === "falsy") {
    passed = !actual;
  } else if (comparator === "approx") {
    passed = Math.abs(Number(actual) - Number(expected)) < 1e-6;
  } else {
    passed = actual === expected;
  }

  return {
    name,
    passed,
    actual,
    expected,
  };
}

async function addTest({
  id,
  title,
  layer,
  input,
  expected,
  execute,
  validate,
}) {
  try {
    const actual = await execute();
    const checks = validate(actual);
    const passed = checks.every((item) => item.passed);

    results.push({
      id,
      title,
      layer,
      status: passed ? "PASS" : "FAIL",
      input,
      expected,
      actual,
      checks,
    });
  } catch (error) {
    results.push({
      id,
      title,
      layer,
      status: "ERROR",
      input,
      expected,
      error: {
        name: error?.name || "Error",
        message: error?.message || String(error),
        stack: error?.stack || null,
      },
      checks: [],
    });
  }
}

async function loadAnalyzePensionForm() {
  if (!fs.existsSync(ANALYSIS_FILE)) {
    throw new Error(
      `Δεν βρέθηκε το αρχείο pensionFormAnalysis.js στη διαδρομή: ${ANALYSIS_FILE}`
    );
  }

  const source = fs.readFileSync(ANALYSIS_FILE, "utf8");
  const encoded = Buffer.from(source, "utf8").toString("base64");
  const moduleUrl = `data:text/javascript;base64,${encoded}`;
  const imported = await import(moduleUrl);

  if (typeof imported.analyzePensionForm !== "function") {
    throw new Error(
      "Το pensionFormAnalysis.js δεν εξάγει συνάρτηση analyzePensionForm."
    );
  }

  return imported.analyzePensionForm;
}

function createUniformedSpecialDraft({
  insuranceRegime = "old_public",
  article36ACategory = "flight",
  combatStatus = "full",
  combatRecognitionPeriod = "between_2002_2016",
  combatPaidAmount = "4000",
  combatContributionRatePercent = "6.67",
  combatExplicitBase = "",
  combatReferenceYear = "2015",
  semestersStatus = "yes",
  semestersCount = "20",
  semestersType = "flight",
  semestersMilestoneYear = "2018",
  semestersRecognitionPeriod = "before_2002",
  semestersPaidAmount = "0",
  semestersContributionRatePercent = "",
  semestersExplicitBase = "",
  semestersReferenceYear = "",
} = {}) {
  return {
    insuranceRegime,
    article36ACategory,
    combatFiveYearService: {
      status: combatStatus,
      years: combatStatus === "partial" ? "3" : "",
      months: "0",
      days: "0",
      recognitionPeriod: combatStatus === "none" ? "" : combatRecognitionPeriod,
      paidAmount: combatStatus === "none" ? "" : combatPaidAmount,
      contributionRatePercent:
        combatStatus === "none" ? "" : combatContributionRatePercent,
      explicitPensionableEarningsBase:
        combatStatus === "none" ? "" : combatExplicitBase,
      earningsReferenceYear:
        combatStatus === "none" ? "" : combatReferenceYear,
    },
    specialSemesters: {
      status: semestersStatus,
      semestersCount: semestersStatus === "yes" ? semestersCount : "",
      specialSemestersType: semestersStatus === "yes" ? semestersType : "",
      milestoneCompletionYear:
        semestersStatus === "yes" ? semestersMilestoneYear : "",
      recognitionPeriod:
        semestersStatus === "yes" ? semestersRecognitionPeriod : "",
      paidAmount: semestersStatus === "yes" ? semestersPaidAmount : "",
      contributionRatePercent:
        semestersStatus === "yes" ? semestersContributionRatePercent : "",
      explicitPensionableEarningsBase:
        semestersStatus === "yes" ? semestersExplicitBase : "",
      earningsReferenceYear:
        semestersStatus === "yes" ? semestersReferenceYear : "",
    },
  };
}

function createBaseFormInput(overrides = {}) {
  return {
    currentFormStep: "main",

    pensionStartDateInput: "01/01/2026",
    pensionTypeInput: "old_age",
    oldAgeCategoryInput: "standard",
    pensionModeInput: "full",
    earlyReductionMonthsInput: "0",
    disabilityCategoryInput: "",

    insuranceTimeInputMethod: "insurance_days",
    insuranceDaysInput: "10500",
    insuranceYearsInput: "",
    insuranceMonthsInput: "",
    insuranceExtraDaysInput: "",
    residenceYearsInput: "45",

    contributoryEarningsInputMethod: "average_monthly",
    averageMonthlyPensionableEarningsInput: "3199.90",
    yearlyEarningsRows: [],

    insurancePeriodsInputMode: "simple",
    simpleFundInput: "uniformed",
    simpleInsuredTypeInput: "old",
    simpleEmploymentCategoryInput: "common",
    simpleFromDateInput: "",
    simpleToDateInput: "",
    simpleInsuranceDaysInput: "",
    simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft(),

    insurancePeriodGroups: [],

    multiPeriodTimeInputMethod: "",
    multiPeriodInsuranceDaysInput: "",
    multiPeriodInsuranceYearsInput: "",
    multiPeriodInsuranceMonthsInput: "",
    multiPeriodInsuranceExtraDaysInput: "",
    multiPeriodFundInput: "",
    multiPeriodInsuredTypeInput: "",
    multiPeriodEmploymentCategoryInput: "",

    multiPeriod2TimeInputMethod: "",
    multiPeriod2InsuranceDaysInput: "",
    multiPeriod2InsuranceYearsInput: "",
    multiPeriod2InsuranceMonthsInput: "",
    multiPeriod2InsuranceExtraDaysInput: "",
    multiPeriod2FundInput: "",
    multiPeriod2InsuredTypeInput: "",
    multiPeriod2EmploymentCategoryInput: "",

    ...overrides,
  };
}

function getFirstUniformedDraft(analysisResult) {
  return analysisResult?.calculationInput?.insurancePeriodsDraft?.[0]
    ?.uniformedSpecialTimeDraft;
}

function buildPreparePayload(analysisResult) {
  return analysisResult?.calculationInput || null;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let json;

  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(
      `Το endpoint επέστρεψε μη έγκυρη JSON απάντηση. HTTP ${response.status}: ${responseText}`
    );
  }

  return {
    httpStatus: response.status,
    ok: response.ok,
    body: json,
  };
}

function findRecognitionDetail(preparedInput, source) {
  const directDetail = preparedInput?.uniformedData?.recognitionDetails?.find(
    (entry) => entry?.source === source
  );

  if (directDetail) {
    return directDetail;
  }

  const uniformedDraft =
    preparedInput?.insurancePeriodsDraft?.[0]?.uniformedSpecialTimeDraft;

  if (!uniformedDraft) {
    return null;
  }

  if (source === "combat_five_year_service") {
    return {
      source,
      ...(uniformedDraft.combatFiveYearService || {}),
    };
  }

  if (source === "special_semesters") {
    return {
      source,
      ...(uniformedDraft.specialSemesters || {}),
    };
  }

  return null;
}

const analyzePensionForm = await loadAnalyzePensionForm();

// -----------------------------------------------------------------------------
// A. Validations φόρμας
// -----------------------------------------------------------------------------

await addTest({
  id: "FORM-001",
  title: "Παλαιό καθεστώς με 20 εξάμηνα και πλήρη πενταετία επιτρέπεται",
  layer: "pensionFormAnalysis",
  input: {
    insuranceRegime: "old_public",
    combatYears: 5,
    semestersCount: 20,
  },
  expected: {
    isReady: true,
  },
  execute: () => analyzePensionForm(createBaseFormInput()),
  validate: (actual) => [
    check("Η φόρμα είναι έτοιμη", actual.isReady, true),
    check("Δεν υπάρχει error", actual.error, null),
  ],
});

await addTest({
  id: "FORM-002",
  title: "Νέο καθεστώς με 15 εξάμηνα μπλοκάρεται",
  layer: "pensionFormAnalysis",
  input: {
    insuranceRegime: "new_ika",
    semestersCount: 15,
  },
  expected: {
    isReady: false,
    errorContains: "14",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleInsuredTypeInput: "new",
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          insuranceRegime: "new_ika",
          combatStatus: "none",
          semestersCount: "15",
        }),
      })
    ),
  validate: (actual) => [
    check("Η φόρμα μπλοκαρίστηκε", actual.isReady, false),
    check("Το μήνυμα αναφέρει 14", actual.error, "14", "includes"),
  ],
});

await addTest({
  id: "FORM-003",
  title: "Νέο καθεστώς με 5ετία και 5 εξάμηνα μπλοκάρεται από το όριο 7 ετών",
  layer: "pensionFormAnalysis",
  input: {
    insuranceRegime: "new_ika",
    combatYears: 5,
    semestersCount: 5,
  },
  expected: {
    isReady: false,
    errorContains: "7",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleInsuredTypeInput: "new",
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          insuranceRegime: "new_ika",
          semestersCount: "5",
        }),
      })
    ),
  validate: (actual) => [
    check("Η φόρμα μπλοκαρίστηκε", actual.isReady, false),
    check("Το μήνυμα αναφέρει 7", actual.error, "7", "includes"),
  ],
});

await addTest({
  id: "FORM-004",
  title: "Αναγνώριση μετά το 2002 με κενό ποσό μπλοκάρεται",
  layer: "pensionFormAnalysis",
  input: {
    recognitionPeriod: "between_2002_2016",
    paidAmount: "",
  },
  expected: {
    isReady: false,
    errorContains: "ποσό",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          combatPaidAmount: "",
        }),
      })
    ),
  validate: (actual) => [
    check("Η φόρμα μπλοκαρίστηκε", actual.isReady, false),
    check("Το μήνυμα αναφέρει ποσό", actual.error, "ποσ", "includes"),
  ],
});

await addTest({
  id: "FORM-005",
  title: "Αναγνώριση μετά το 2002 με ποσό αλλά χωρίς ποσοστό ή βάση μπλοκάρεται",
  layer: "pensionFormAnalysis",
  input: {
    paidAmount: 4000,
    contributionRatePercent: "",
    explicitBase: "",
  },
  expected: {
    isReady: false,
    errorContains: "ποσοστό",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          combatContributionRatePercent: "",
          combatExplicitBase: "",
        }),
      })
    ),
  validate: (actual) => [
    check("Η φόρμα μπλοκαρίστηκε", actual.isReady, false),
    check(
      "Το μήνυμα αναφέρει ποσοστό ή βάση",
      actual.error,
      "ποσοστ",
      "includes"
    ),
  ],
});

await addTest({
  id: "FORM-006",
  title: "Έγκυρα στοιχεία εξαγοράς μεταφέρονται αυτούσια στο calculationInput",
  layer: "pensionFormAnalysis",
  input: {
    paidAmount: 4000,
    contributionRatePercent: 6.67,
    earningsReferenceYear: 2015,
  },
  expected: {
    paidAmount: "4000",
    contributionRatePercent: "6.67",
    earningsReferenceYear: "2015",
  },
  execute: () => analyzePensionForm(createBaseFormInput()),
  validate: (actual) => {
    const draft = getFirstUniformedDraft(actual);
    const combat = draft?.combatFiveYearService;

    return [
      check("Η φόρμα είναι έτοιμη", actual.isReady, true),
      check("Μεταφέρθηκε paidAmount", combat?.paidAmount, "4000"),
      check(
        "Μεταφέρθηκε contributionRatePercent",
        combat?.contributionRatePercent,
        "6.67"
      ),
      check(
        "Μεταφέρθηκε earningsReferenceYear",
        combat?.earningsReferenceYear,
        "2015"
      ),
    ];
  },
});

await addTest({
  id: "FORM-007",
  title: "Ρητή ασφαλιστέα βάση επιτρέπεται χωρίς ποσοστό",
  layer: "pensionFormAnalysis",
  input: {
    paidAmount: 4000,
    contributionRatePercent: "",
    explicitBase: 25000,
    earningsReferenceYear: 2015,
  },
  expected: {
    isReady: true,
    explicitBase: "25000",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          combatContributionRatePercent: "",
          combatExplicitBase: "25000",
        }),
      })
    ),
  validate: (actual) => {
    const combat = getFirstUniformedDraft(actual)?.combatFiveYearService;

    return [
      check("Η φόρμα είναι έτοιμη", actual.isReady, true),
      check(
        "Μεταφέρθηκε η ρητή βάση",
        combat?.explicitPensionableEarningsBase,
        "25000"
      ),
    ];
  },
});

await addTest({
  id: "FORM-008",
  title: "Πριν το 2002 κανονικοποιείται paidAmount=0 και καθαρίζονται πεδία αποδοχών",
  layer: "pensionFormAnalysis",
  input: {
    recognitionPeriod: "before_2002",
  },
  expected: {
    paidAmount: "0",
    contributionRatePercent: "",
    explicitBase: "",
    earningsReferenceYear: "",
  },
  execute: () =>
    analyzePensionForm(
      createBaseFormInput({
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          combatRecognitionPeriod: "before_2002",
          combatPaidAmount: "4000",
          combatContributionRatePercent: "6.67",
          combatExplicitBase: "25000",
          combatReferenceYear: "2015",
        }),
      })
    ),
  validate: (actual) => {
    const combat = getFirstUniformedDraft(actual)?.combatFiveYearService;

    return [
      check("Η φόρμα είναι έτοιμη", actual.isReady, true),
      check("Το paidAmount έγινε 0", combat?.paidAmount, "0"),
      check(
        "Καθαρίστηκε το ποσοστό",
        combat?.contributionRatePercent,
        ""
      ),
      check(
        "Καθαρίστηκε η ρητή βάση",
        combat?.explicitPensionableEarningsBase,
        ""
      ),
      check(
        "Καθαρίστηκε το έτος αναφοράς",
        combat?.earningsReferenceYear,
        ""
      ),
    ];
  },
});

// -----------------------------------------------------------------------------
// B. Prepare endpoint
// -----------------------------------------------------------------------------

if (!PREPARE_URL) {
  results.push({
    id: "PREPARE-SKIPPED",
    title: "Prepare endpoint tests",
    layer: "preparePensionCalculationInput",
    status: "SKIP",
    reason:
      "Δεν δόθηκε --prepare-url. Τα FORM tests εκτελέστηκαν, αλλά τα HTTP tests παραλείφθηκαν.",
    checks: [],
  });
} else {
  const validAnalysis = analyzePensionForm(createBaseFormInput());

  await addTest({
    id: "PREPARE-001",
    title: "Το prepare endpoint δέχεται το έγκυρο calculationInput",
    layer: "preparePensionCalculationInput",
    input: {
      url: PREPARE_URL,
      payload: buildPreparePayload(validAnalysis),
    },
    expected: {
      httpStatus: 200,
      ok: true,
      status: "prepared_only",
    },
    execute: () =>
      postJson(PREPARE_URL, buildPreparePayload(validAnalysis)),
    validate: (actual) => [
      check("HTTP status", actual.httpStatus, 200),
      check("Response ok", actual.body?.ok, true),
      check("Prepared only", actual.body?.status, "prepared_only"),
    ],
  });

  await addTest({
    id: "PREPARE-002",
    title: "Το prepare endpoint διατηρεί ποσό, ποσοστό και έτος αναφοράς",
    layer: "preparePensionCalculationInput",
    input: {
      paidAmount: 4000,
      contributionRatePercent: 6.67,
      earningsReferenceYear: 2015,
    },
    expected: {
      paidAmount: 4000,
      contributionRatePercent: 6.67,
      earningsReferenceYear: 2015,
    },
    execute: async () => {
      const response = await postJson(
        PREPARE_URL,
        buildPreparePayload(validAnalysis)
      );

      return {
        response,
        recognitionDetail: findRecognitionDetail(
          response.body?.preparedInput,
          "combat_five_year_service"
        ),
      };
    },
    validate: (actual) => [
      check("HTTP status", actual.response?.httpStatus, 200),
      check(
        "Μεταφέρθηκε paidAmount",
        actual.recognitionDetail?.paidAmount,
        4000
      ),
      check(
        "Μεταφέρθηκε contributionRatePercent",
        actual.recognitionDetail?.contributionRatePercent,
        6.67,
        "approx"
      ),
      check(
        "Μεταφέρθηκε earningsReferenceYear",
        actual.recognitionDetail?.earningsReferenceYear,
        2015
      ),
    ],
  });

  await addTest({
    id: "PREPARE-003",
    title: "Το prepare endpoint απορρίπτει ποσό μετά το 2002 χωρίς ποσοστό ή βάση",
    layer: "preparePensionCalculationInput",
    input: {
      paidAmount: 4000,
      contributionRatePercent: "",
      explicitBase: "",
    },
    expected: {
      httpStatus: 400,
      ok: false,
    },
    execute: async () => {
      const invalidAnalysisInput = createBaseFormInput({
        simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
          combatContributionRatePercent: "",
          combatExplicitBase: "",
        }),
      });

      // Κατασκευάζεται επίτηδες raw payload ώστε να ελεγχθεί και το backend,
      // ακόμη κι αν το frontend θα το είχε ήδη μπλοκάρει.
      const validPayload = buildPreparePayload(validAnalysis);
      const rawPayload = structuredClone(validPayload);
      const combat =
        rawPayload.insurancePeriodsDraft[0]
          .uniformedSpecialTimeDraft.combatFiveYearService;

      combat.paidAmount = "4000";
      combat.contributionRatePercent = "";
      combat.explicitPensionableEarningsBase = "";
      combat.earningsReferenceYear = "2015";

      return postJson(PREPARE_URL, rawPayload);
    },
    validate: (actual) => [
      check("HTTP status", actual.httpStatus, 400),
      check("Response ok=false", actual.body?.ok, false),
    ],
  });

  await addTest({
    id: "PREPARE-004",
    title: "Το prepare endpoint κανονικοποιεί before_2002 σε paidAmount=0",
    layer: "preparePensionCalculationInput",
    input: {
      recognitionPeriod: "before_2002",
    },
    expected: {
      paidAmount: 0,
    },
    execute: async () => {
      const analysis = analyzePensionForm(
        createBaseFormInput({
          simpleUniformedSpecialTimeDraft: createUniformedSpecialDraft({
            combatRecognitionPeriod: "before_2002",
            combatPaidAmount: "4000",
            combatContributionRatePercent: "6.67",
            combatExplicitBase: "25000",
            combatReferenceYear: "2015",
          }),
        })
      );

      const response = await postJson(
        PREPARE_URL,
        buildPreparePayload(analysis)
      );

      return {
        response,
        recognitionDetail: findRecognitionDetail(
          response.body?.preparedInput,
          "combat_five_year_service"
        ),
      };
    },
    validate: (actual) => [
      check("HTTP status", actual.response?.httpStatus, 200),
      check(
        "Το paidAmount κανονικοποιήθηκε σε 0",
        actual.recognitionDetail?.paidAmount,
        0
      ),
      check(
        "Δεν υπάρχει contributionRatePercent",
        actual.recognitionDetail?.contributionRatePercent,
        null
      ),
      check(
        "Δεν υπάρχει earningsReferenceYear",
        actual.recognitionDetail?.earningsReferenceYear,
        null
      ),
    ],
  });
}

// -----------------------------------------------------------------------------
// Αναφορά
// -----------------------------------------------------------------------------

const passed = results.filter((item) => item.status === "PASS").length;
const failed = results.filter((item) => item.status === "FAIL").length;
const errors = results.filter((item) => item.status === "ERROR").length;
const skipped = results.filter((item) => item.status === "SKIP").length;

const report = {
  generatedAt: new Date().toISOString(),
  configuration: {
    rootDir: ROOT_DIR,
    analysisFile: ANALYSIS_FILE,
    prepareUrl: PREPARE_URL || null,
  },
  summary: {
    total: results.length,
    passed,
    failed,
    errors,
    skipped,
    success: failed === 0 && errors === 0,
  },
  scope: {
    automated: [
      "Frontend validation μέσω pensionFormAnalysis.js",
      "Κανονικοποίηση uniformedSpecialTimeDraft",
      "Μεταφορά πεδίων στο calculationInput",
      "HTTP validation του preparePensionCalculationInput",
      "Μεταφορά πεδίων στο preparedInput",
    ],
    notAutomatedHere: [
      "Πραγματικό click/type μέσα στον browser",
      "Οπτική εμφάνιση μηνυμάτων λάθους",
      "Τελική κάρτα αποτελέσματος στη React σελίδα",
    ],
  },
  results,
};

fs.mkdirSync(RESULTS_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const jsonPath = path.join(
  RESULTS_DIR,
  `uniformed-integration-tests-${timestamp}.json`
);
const txtPath = path.join(
  RESULTS_DIR,
  `uniformed-integration-tests-${timestamp}.txt`
);

fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

const lines = [
  "ΑΠΟΤΕΛΕΣΜΑΤΑ INTEGRATION TESTS ΕΝΣΤΟΛΩΝ",
  "=".repeat(58),
  `Ημερομηνία: ${report.generatedAt}`,
  `PASS: ${passed}`,
  `FAIL: ${failed}`,
  `ERROR: ${errors}`,
  `SKIP: ${skipped}`,
  `Γενικό αποτέλεσμα: ${report.summary.success ? "PASS" : "FAIL"}`,
  "",
];

for (const result of results) {
  lines.push(`[${result.status}] ${result.id} — ${result.title}`);

  if (result.reason) {
    lines.push(`  ${result.reason}`);
  }

  for (const item of result.checks || []) {
    lines.push(
      `  ${item.passed ? "✓" : "✗"} ${item.name}: actual=${JSON.stringify(
        item.actual
      )}, expected=${JSON.stringify(item.expected)}`
    );
  }

  if (result.error) {
    lines.push(`  ERROR: ${result.error.message}`);
  }

  lines.push("");
}

lines.push("ΔΕΝ ΚΑΛΥΠΤΕΤΑΙ ΑΠΟ ΑΥΤΟ ΤΟ SCRIPT");
lines.push("- Πραγματικό click/type μέσα στον browser");
lines.push("- Οπτική εμφάνιση μηνυμάτων λάθους");
lines.push("- Τελική κάρτα αποτελέσματος στη React σελίδα");

fs.writeFileSync(txtPath, lines.join("\n"), "utf8");

console.log("");
console.log("Integration tests ολοκληρώθηκαν.");
console.log(`PASS: ${passed}`);
console.log(`FAIL: ${failed}`);
console.log(`ERROR: ${errors}`);
console.log(`SKIP: ${skipped}`);
console.log(`JSON report: ${jsonPath}`);
console.log(`TXT report:  ${txtPath}`);
console.log("");

process.exitCode = failed === 0 && errors === 0 ? 0 : 1;
