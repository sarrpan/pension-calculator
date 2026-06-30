import {
  getUniformedBodyLabel,
  normalizeUniformedBody,
  uniformedBodyHasAuxiliaryPension,
} from "./uniformedBodyOptions";

const AUXILIARY_EXTRA_CONTRIBUTION_OPTIONS = [
  { value: "", label: "Επιλέξτε" },
  { value: "no_extra", label: "Όχι, μόνο την κανονική εισφορά" },
  { value: "extra_1_2", label: "Ναι, περίπου 1,2% επιπλέον" },
  { value: "extra_2", label: "Ναι, περίπου 2% επιπλέον" },
  { value: "extra_2_5", label: "Ναι, περίπου 2,5% επιπλέον" },
  { value: "extra_3", label: "Ναι, περίπου 3% επιπλέον" },
  { value: "extra_5", label: "Ναι, περίπου 5% επιπλέον" },
  { value: "extra_6", label: "Ναι, περίπου 6% επιπλέον" },
  { value: "extra_6_5", label: "Ναι, περίπου 6,5% επιπλέον" },
  { value: "extra_8_75", label: "Ναι, περίπου 8,75% επιπλέον" },
  { value: "extra_10", label: "Ναι, περίπου 10% επιπλέον" },
  { value: "unknown", label: "Δεν γνωρίζω" },
];

const AUXILIARY_EXTRA_RATE_BY_CHOICE = Object.freeze({
  no_extra: 0,
  extra_1_2: 1.2,
  extra_2: 2,
  extra_2_5: 2.5,
  extra_3: 3,
  extra_5: 5,
  extra_6: 6,
  extra_6_5: 6.5,
  extra_8_75: 8.75,
  extra_10: 10,
  unknown: 0,
});

const FORMER_AUXILIARY_FUND_OTHER_UNMAPPED = "other_unmapped";
const FORMER_AUXILIARY_FUND_SPECIAL_PENDING = "special_pending";

const FORMER_AUXILIARY_FUND_METADATA = Object.freeze({
  elepete_ppethnak: Object.freeze({
    code: "elepete_ppethnak",
    fundLabel: "ΕΛΕΠΕΤΕ-ΠΠΕΘΝΑΚ",
    workerGroupLabel:
      "Πρώην προσωπικό της Εθνικής Ακινήτων Α.Ε., συνδεδεμένο με την Εθνική Τράπεζα",
    compatibleMainFunds: Object.freeze(["banking_funds", "deko"]),
    knownExtraContributionRatePercent: null,
  }),
  teamede: Object.freeze({
    code: "teamede",
    fundLabel: "ΤΕΑΜΕΔΕ",
    workerGroupLabel: "Μηχανικοί και εργολήπτες δημοσίων έργων",
    compatibleMainFunds: Object.freeze(["etaa", "tsmede", "oaee", "deko"]),
    knownExtraContributionRatePercent: null,
  }),
  tead: Object.freeze({
    code: "tead",
    fundLabel: "ΤΕΑΔ",
    workerGroupLabel: "Δικηγόροι",
    compatibleMainFunds: Object.freeze(["etaa", "oaee"]),
    knownExtraContributionRatePercent: null,
  }),
  elem: Object.freeze({
    code: "elem",
    fundLabel: "ΕΛΕΜ",
    workerGroupLabel:
      "Προσωπικό και συνταξιούχοι της πρώην Αγροτικής Τράπεζας",
    compatibleMainFunds: Object.freeze(["banking_funds", "deko"]),
    knownExtraContributionRatePercent: 6,
  }),
  teapoka: Object.freeze({
    code: "teapoka",
    fundLabel: "ΤΕΑΠΟΚΑ",
    workerGroupLabel:
      "Προσωπικό οργανισμών κοινωνικής ασφάλισης και συναφών φορέων",
    compatibleMainFunds: Object.freeze([
      "public_sector",
      "ika_npdd_special",
      "ika",
      "deko",
    ]),
    knownExtraContributionRatePercent: null,
  }),
  teaeige: Object.freeze({
    code: "teaeige",
    fundLabel: "ΤΕΑΕΙΓΕ",
    workerGroupLabel: "Εκπαιδευτικοί ιδιωτικής γενικής εκπαίδευσης",
    compatibleMainFunds: Object.freeze(["ika"]),
    knownExtraContributionRatePercent: null,
  }),
  teaa: Object.freeze({
    code: "teaa",
    fundLabel: "ΤΕΑΑ",
    workerGroupLabel:
      "Αρτοποιοί, κυρίως αυτοαπασχολούμενοι ή ιδιοκτήτες αρτοποιείων",
    compatibleMainFunds: Object.freeze(["oaee"]),
    knownExtraContributionRatePercent: null,
  }),
  teapyk: Object.freeze({
    code: "teapyk",
    fundLabel: "ΤΕΑΠΥΚ",
    workerGroupLabel: "Πρατηριούχοι υγρών καυσίμων και βενζινοπώλες",
    compatibleMainFunds: Object.freeze(["oaee"]),
    knownExtraContributionRatePercent: null,
  }),
  teapozo: Object.freeze({
    code: "teapozo",
    fundLabel: "ΤΕΑΠΟΖΟ",
    workerGroupLabel:
      "Εργαζόμενοι σε επιχειρήσεις οινοποιίας, ζυθοποιίας και οινοπνευματοποιίας",
    compatibleMainFunds: Object.freeze(["ika"]),
    knownExtraContributionRatePercent: null,
  }),
  teayap: Object.freeze({
    code: "teayap",
    fundLabel: "ΤΕΑΥΑΠ",
    workerGroupLabel:
      "Προσωπικό προερχόμενο από την πρώην Αστυνομία Πόλεων",
    compatibleMainFunds: Object.freeze(["uniformed"]),
    compatibleUniformedBodies: Object.freeze(["hellenic_police"]),
    knownExtraContributionRatePercent: null,
  }),
  teayps: Object.freeze({
    code: "teayps",
    fundLabel: "ΤΕΑΥΠΣ",
    workerGroupLabel: "Προσωπικό του Πυροσβεστικού Σώματος",
    compatibleMainFunds: Object.freeze(["uniformed"]),
    compatibleUniformedBodies: Object.freeze(["fire_service"]),
    knownExtraContributionRatePercent: null,
  }),
  teaisyt: Object.freeze({
    code: "teaisyt",
    fundLabel: "ΤΕΑΥΣΙΤ / ΤΕΑΙΣΥΤ",
    workerGroupLabel:
      "Ιδιοκτήτες, συντάκτες, δημοσιογράφοι και υπάλληλοι του Τύπου",
    compatibleMainFunds: Object.freeze(["artistic", "etap_mme_tattath"]),
    knownExtraContributionRatePercent: null,
  }),
  teas: Object.freeze({
    code: "teas",
    fundLabel: "ΤΕΑΣ",
    workerGroupLabel:
      "Συντάκτες, δημοσιογράφοι και υπάλληλοι περιφερειακών ΜΜΕ της Πελοποννήσου, Ηπείρου και Νήσων",
    compatibleMainFunds: Object.freeze(["artistic", "etap_mme_tattath"]),
    knownExtraContributionRatePercent: null,
  }),
  teaeax: Object.freeze({
    code: "teaeax",
    fundLabel: "ΤΕΑΕΑΧ / ΤΕΑΕΧ",
    workerGroupLabel:
      "Προσωπικό προερχόμενο από την πρώην Ελληνική Χωροφυλακή",
    compatibleMainFunds: Object.freeze(["uniformed"]),
    compatibleUniformedBodies: Object.freeze(["hellenic_police"]),
    knownExtraContributionRatePercent: null,
  }),
});

const FORMER_AUXILIARY_FUND_ALIASES = Object.freeze({
  teaysit: "teaisyt",
  teaysit_teaisyt: "teaisyt",
  teaeax_teaex: "teaeax",
  teaex: "teaeax",
});

const EXACT_FORMER_FUND_REQUIRED_MAIN_FUNDS = new Set([
  "deko",
  "banking_funds",
  "artistic",
]);

const NO_AUTOMATIC_AUXILIARY_FUNDS = new Set([
  "oaee",
  "oga",
  "tsay",
]);

const PENDING_SPECIAL_NON_SALARIED_FUNDS = new Set([
  "etaa",
  "tsmede",
]);

const MANUAL_EXTRA_SALARIED_FUNDS = new Set([
  "ika_tsp_hsap",
  "ika_tap_etba",
  "tapae_ethniki",
  "tseapgso",
  "ika_tap_ote_ote",
  "ika_tap_ote_ose_elta",
  "ika_tap_ote_staff",
  "ika_npdd_special",
  "etap_mme_tattath",
  "deko",
  "nat",
  "aviation",
  "artistic",
  "banking_funds",
]);

const FUND_LABELS = Object.freeze({
  ika: "ΙΚΑ / e-ΕΦΚΑ μισθωτών",
  public_sector: "Δημόσιο",
  ota: "ΟΤΑ",
  uniformed: "Ένστολοι",
  tap_dei: "ΤΑΠ-ΔΕΗ",
  ika_tsp_hsap: "τ. ΤΣΠ-ΗΣΑΠ",
  ika_tsp_ete: "τ. ΤΣΠ-ΕΤΕ",
  ika_tap_etba: "τ. ΤΑΠ-ΕΤΒΑ",
  tapae_ethniki: "ΤΑΠΑΕ «Η Εθνική»",
  tseapgso: "τ. ΤΣΕΑΠΓΣΟ",
  ika_tap_ote_ote: "τ. ΤΑΠ-ΟΤΕ — ΟΤΕ",
  ika_tap_ote_ose_elta: "τ. ΤΑΠ-ΟΤΕ — ΟΣΕ / ΕΛΤΑ",
  ika_tap_ote_staff: "τ. ΤΑΠ-ΟΤΕ — υπάλληλοι τ. ΤΑΠΟΤΕ",
  ika_npdd_special: "Τακτικοί υπάλληλοι ΙΚΑ / ΝΠΔΔ ειδικού καθεστώτος",
  etap_mme_tattath: "ΕΤΑΠ-ΜΜΕ / πρώην ΤΑΤΤΑΘ",
  tanpy: "ΤΑΝΠΥ / έμμισθοι ναυτικοί πράκτορες",
  deko: "Άλλη ΔΕΚΟ / οργανισμός κοινής ωφέλειας",
  nat: "ΝΑΤ / ναυτικοί",
  aviation: "Αεροπορικές / ΥΠΑ / χειριστές",
  artistic: "Καλλιτεχνικές κατηγορίες",
  banking_funds: "Άλλο τραπεζικό ταμείο / συνεταιρισμός",
  oaee: "ΟΑΕΕ / ελεύθερος επαγγελματίας",
  etaa: "Πρώην ΕΤΑΑ",
  tsmede: "ΤΣΜΕΔΕ",
  tsay: "ΤΣΑΥ — Ελεύθερος επαγγελματίας",
  tsay_salaried: "ΤΣΑΥ — Μισθωτός",
  oga: "Πρώην ΟΓΑ / αγρότης",
});

function normalizeAuxiliaryContributionDraft(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([periodId, periodValue]) => {
      if (typeof periodValue === "string") {
        return [
          String(periodId),
          {
            extraContributionChoice:
              normalizeAuxiliaryExtraContributionChoice(periodValue),
            formerAuxiliaryFund: "",
          },
        ];
      }

      const safePeriodValue =
        periodValue && typeof periodValue === "object" ? periodValue : {};

      return [
        String(periodId),
        {
          extraContributionChoice: normalizeAuxiliaryExtraContributionChoice(
            safePeriodValue.extraContributionChoice ?? safePeriodValue.choice,
          ),
          formerAuxiliaryFund: normalizeFormerAuxiliaryFundSelection(
            safePeriodValue.formerAuxiliaryFund,
          ),
        },
      ];
    }),
  );
}

function normalizeAuxiliaryExtraContributionChoice(value) {
  const normalizedValue = String(value || "").trim();

  return Object.prototype.hasOwnProperty.call(
    AUXILIARY_EXTRA_RATE_BY_CHOICE,
    normalizedValue,
  )
    ? normalizedValue
    : "";
}

function normalizeFormerAuxiliaryFundSelection(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue === FORMER_AUXILIARY_FUND_OTHER_UNMAPPED ||
    normalizedValue === FORMER_AUXILIARY_FUND_SPECIAL_PENDING
  ) {
    return normalizedValue;
  }

  const canonicalValue =
    FORMER_AUXILIARY_FUND_ALIASES[normalizedValue] || normalizedValue;

  return FORMER_AUXILIARY_FUND_METADATA[canonicalValue]
    ? canonicalValue
    : "";
}

function getAuxiliaryExtraRateFromChoice(choice) {
  const normalizedChoice = normalizeAuxiliaryExtraContributionChoice(choice);

  if (!normalizedChoice) {
    return null;
  }

  return AUXILIARY_EXTRA_RATE_BY_CHOICE[normalizedChoice];
}

function isFormerAuxiliaryFundCompatibleWithMainFund({
  fund,
  uniformedBody,
  formerAuxiliaryFund,
} = {}) {
  const normalizedFund = String(fund || "").trim();
  const normalizedUniformedBody = normalizeUniformedBody(uniformedBody);
  const normalizedFormerFund = normalizeFormerAuxiliaryFundSelection(
    formerAuxiliaryFund,
  );

  if (!normalizedFormerFund) {
    return true;
  }

  if (normalizedFormerFund === FORMER_AUXILIARY_FUND_OTHER_UNMAPPED) {
    return true;
  }

  if (normalizedFormerFund === FORMER_AUXILIARY_FUND_SPECIAL_PENDING) {
    return normalizedFund === "ika";
  }

  const metadata = FORMER_AUXILIARY_FUND_METADATA[normalizedFormerFund];

  if (!metadata || !metadata.compatibleMainFunds.includes(normalizedFund)) {
    return false;
  }

  if (normalizedFund !== "uniformed") {
    return true;
  }

  return Boolean(
    normalizedUniformedBody &&
      metadata.compatibleUniformedBodies?.includes(normalizedUniformedBody)
  );
}

function getFormerAuxiliaryFundOptionsForFund(fund, uniformedBody = "") {
  const normalizedFund = String(fund || "").trim();
  const normalizedUniformedBody = normalizeUniformedBody(uniformedBody);

  if (!normalizedFund) {
    return [];
  }

  const metadataEntries = Object.values(FORMER_AUXILIARY_FUND_METADATA).filter(
    (metadata) => {
      if (!metadata.compatibleMainFunds.includes(normalizedFund)) {
        return false;
      }

      if (normalizedFund !== "uniformed") {
        return true;
      }

      return Boolean(
        normalizedUniformedBody &&
          metadata.compatibleUniformedBodies?.includes(
            normalizedUniformedBody,
          )
      );
    },
  );

  if (metadataEntries.length === 0) {
    return [];
  }

  return [
    {
      value: "",
      label: "Επιλέξτε επικουρικό ταμείο",
    },
    ...metadataEntries.map((metadata) => ({
      value: metadata.code,
      label: `${metadata.workerGroupLabel} — ${metadata.fundLabel}`,
    })),
    {
      value: FORMER_AUXILIARY_FUND_OTHER_UNMAPPED,
      label: "Δεν βρίσκεται στη λίστα / δεν γνωρίζω",
    },
  ];
}

function resolveAuxiliaryFormClassification({
  fund,
  uniformedBody,
  employmentCategory,
  choice,
  formerAuxiliaryFund,
} = {}) {
  const normalizedFund = String(fund || "").trim();
  const normalizedUniformedBody = normalizeUniformedBody(uniformedBody);
  const normalizedCategory = String(employmentCategory || "").trim();
  let normalizedChoice = normalizeAuxiliaryExtraContributionChoice(choice);
  let normalizedFormerFund = normalizeFormerAuxiliaryFundSelection(
    formerAuxiliaryFund,
  );

  if (!normalizedFund) {
    return createClassification({
      code: "not_ready",
      label: "Δεν έχει επιλεγεί ακόμη ασφαλιστική κατηγορία",
      hasAuxiliary: false,
    });
  }

  if (normalizedFund === "uniformed" && !normalizedUniformedBody) {
    return createClassification({
      code: "uniformed_body_required",
      label: "Επιλέξτε το συγκεκριμένο σώμα του ενστόλου",
      hasAuxiliary: false,
    });
  }

  if (
    normalizedFund === "uniformed" &&
    !uniformedBodyHasAuxiliaryPension(normalizedUniformedBody)
  ) {
    return createClassification({
      code: "uniformed_without_auxiliary",
      label:
        `${getUniformedBodyLabel(normalizedUniformedBody)} — ` +
        "δεν υπολογίζεται επικουρική σύνταξη από αυτή την ασφαλιστική περίοδο",
      hasAuxiliary: false,
      extraContributionRatePercent: 0,
    });
  }

  if (normalizedFormerFund === FORMER_AUXILIARY_FUND_SPECIAL_PENDING) {
    return createClassification({
      code: "former_auxiliary_fund_required",
      label: "Επιλέξτε το ειδικό πρώην επικουρικό ταμείο",
      hasAuxiliary: true,
      requiresFormerAuxiliaryFundChoice: true,
    });
  }

  if (
    normalizedFormerFund &&
    !isFormerAuxiliaryFundCompatibleWithMainFund({
      fund: normalizedFund,
      uniformedBody: normalizedUniformedBody,
      formerAuxiliaryFund: normalizedFormerFund,
    })
  ) {
    normalizedFormerFund = "";
    normalizedChoice = "";
  }

  if (
    normalizedFormerFund &&
    normalizedFormerFund !== FORMER_AUXILIARY_FUND_OTHER_UNMAPPED
  ) {
    return resolveMappedFormerFundClassification({
      normalizedChoice,
      formerAuxiliaryFund: normalizedFormerFund,
    });
  }

  if (
    (EXACT_FORMER_FUND_REQUIRED_MAIN_FUNDS.has(normalizedFund) ||
      (normalizedFund === "uniformed" &&
        uniformedBodyHasAuxiliaryPension(normalizedUniformedBody))) &&
    !normalizedFormerFund
  ) {
    return createClassification({
      code: "former_auxiliary_fund_required",
      label: "Χρειάζεται να επιλέξετε το επικουρικό ταμείο",
      hasAuxiliary: true,
      requiresFormerAuxiliaryFundChoice: true,
    });
  }

  const baseClassification = resolveBaseClassification({
    normalizedFund,
    normalizedCategory,
    normalizedChoice,
  });

  if (normalizedFormerFund === FORMER_AUXILIARY_FUND_OTHER_UNMAPPED) {
    return {
      ...baseClassification,
      formerAuxiliaryFundSelection: normalizedFormerFund,
      formerAuxiliaryFund: null,
      formerAuxiliaryFundLabel: "Άγνωστο / μη καταγεγραμμένο ταμείο",
      warning: combineWarnings(
        baseClassification.warning,
        "Δεν επιλέχθηκε συγκεκριμένο επικουρικό ταμείο. Ο υπολογισμός του παλιού χρόνου επικουρικής μπορεί να μείνει εκκρεμής.",
      ),
    };
  }

  return baseClassification;
}

function resolveMappedFormerFundClassification({
  normalizedChoice,
  formerAuxiliaryFund,
}) {
  const metadata = FORMER_AUXILIARY_FUND_METADATA[formerAuxiliaryFund];
  const knownRate = metadata.knownExtraContributionRatePercent;
  const baseLabel = `${metadata.fundLabel} — ${metadata.workerGroupLabel}`;

  if (Number.isFinite(knownRate)) {
    return createClassification({
      code: "automatic_exact_former_fund",
      label: `${baseLabel} — γνωστή πρόσθετη εισφορά +${formatRate(knownRate)}%`,
      hasAuxiliary: true,
      extraContributionRatePercent: knownRate,
      isProvisional: true,
      formerAuxiliaryFundSelection: formerAuxiliaryFund,
      formerAuxiliaryFund,
      formerAuxiliaryFundLabel: metadata.fundLabel,
      workerGroupLabel: metadata.workerGroupLabel,
    });
  }

  if (!normalizedChoice) {
    return createClassification({
      code: "mapped_former_fund_extra_required",
      label: `${baseLabel} — άγνωστο ακόμη πρόσθετο ποσοστό`,
      hasAuxiliary: true,
      requiresUserChoice: true,
      formerAuxiliaryFundSelection: formerAuxiliaryFund,
      formerAuxiliaryFund,
      formerAuxiliaryFundLabel: metadata.fundLabel,
      workerGroupLabel: metadata.workerGroupLabel,
    });
  }

  return createManualChoiceClassification({
    normalizedChoice,
    labelPrefix: baseLabel,
    formerAuxiliaryFundSelection: formerAuxiliaryFund,
    formerAuxiliaryFund,
    formerAuxiliaryFundLabel: metadata.fundLabel,
    workerGroupLabel: metadata.workerGroupLabel,
  });
}

function resolveBaseClassification({
  normalizedFund,
  normalizedCategory,
  normalizedChoice,
}) {
  if (NO_AUTOMATIC_AUXILIARY_FUNDS.has(normalizedFund)) {
    return createClassification({
      code: "no_automatic_auxiliary",
      label: "Χωρίς αυτόματη επικουρική στην πρώτη υλοποίηση",
      hasAuxiliary: false,
      extraContributionRatePercent: 0,
    });
  }

  if (PENDING_SPECIAL_NON_SALARIED_FUNDS.has(normalizedFund)) {
    return createClassification({
      code: "special_non_salaried_pending",
      label: "Απαιτείται ειδικός πρώην επικουρικός φορέας",
      hasAuxiliary: false,
      extraContributionRatePercent: 0,
    });
  }

  if (normalizedFund === "ika") {
    if (normalizedCategory === "vae") {
      return createIkaEteamClassification({
        code: "automatic_known_extra",
        label: "ΙΚΑ-ΕΤΕΑΜ ΒΑΕ — +2%",
        extraContributionRatePercent: 2,
        isProvisional: false,
      });
    }

    if (normalizedCategory === "yvae") {
      return createIkaEteamClassification({
        code: "automatic_known_extra",
        label: "ΙΚΑ-ΕΤΕΑΜ ΥΒΑΕ — +2% ως παραδοχή εργασίας",
        extraContributionRatePercent: 2,
        isProvisional: true,
      });
    }

    return createIkaEteamClassification({
      code: "automatic_common",
      label: "ΙΚΑ-ΕΤΕΑΜ κοινά — χωρίς πρόσθετη εισφορά",
      extraContributionRatePercent: 0,
      isProvisional: false,
    });
  }

  if (normalizedFund === "ota") {
    if (
      normalizedCategory === "ota_ika_vae" ||
      normalizedCategory === "ota_public_vae"
    ) {
      return createKnownExtraClassification(2, "ΟΤΑ ΒΑΕ — +2%", false);
    }

    if (normalizedCategory === "ota_ika_yvae") {
      return createKnownExtraClassification(
        2,
        "ΟΤΑ ΥΒΑΕ καθαριότητας — +2% ως παραδοχή εργασίας",
        true,
      );
    }

    return createCommonClassification("ΟΤΑ κοινά — χωρίς πρόσθετη εισφορά");
  }

  if (normalizedFund === "tap_dei") {
    if (normalizedCategory === "vae") {
      return createKnownExtraClassification(2, "τ. ΤΑΠ-ΔΕΗ ΒΑΕ — +2%", false);
    }

    if (normalizedCategory === "yvae") {
      return createKnownExtraClassification(3, "τ. ΤΑΠ-ΔΕΗ ΥΒΑΕ — +3%", false);
    }

    return createCommonClassification(
      "τ. ΤΑΠ-ΔΕΗ κοινά — χωρίς πρόσθετη εισφορά",
    );
  }

  if (normalizedFund === "tanpy") {
    return createKnownExtraClassification(
      2,
      "ΤΕΑΥΝΤΠ / έμμισθοι ναυτικοί πράκτορες — +2%",
      true,
    );
  }

  if (normalizedFund === "ika_tsp_ete") {
    return createKnownExtraClassification(
      6.5,
      "ΛΕΠΕΤΕ / τ. ΤΣΠ-ΕΤΕ — +6,5%",
      true,
    );
  }

  if (MANUAL_EXTRA_SALARIED_FUNDS.has(normalizedFund)) {
    if (!normalizedChoice) {
      return createClassification({
        code: "manual_extra_required",
        label: "Απαντήστε αν πληρώνατε επιπλέον επικουρική εισφορά",
        hasAuxiliary: true,
        requiresUserChoice: true,
      });
    }

    return createManualChoiceClassification({ normalizedChoice });
  }

  return createCommonClassification(
    "Μισθωτή κατηγορία εντός e-ΕΦΚΑ — κοινή επικουρική χωρίς γνωστή πρόσθετη εισφορά",
  );
}

function createManualChoiceClassification({
  normalizedChoice,
  labelPrefix = null,
  formerAuxiliaryFundSelection = null,
  formerAuxiliaryFund = null,
  formerAuxiliaryFundLabel = null,
  workerGroupLabel = null,
}) {
  if (normalizedChoice === "unknown") {
    return createClassification({
      code: "manual_extra_unknown",
      label: labelPrefix
        ? `${labelPrefix} — άγνωστη πρόσθετη εισφορά`
        : "Δεν είναι γνωστή η επιπλέον εισφορά — υπολογισμός χωρίς προσαύξηση",
      hasAuxiliary: true,
      requiresUserChoice: true,
      userChoice: normalizedChoice,
      extraContributionRatePercent: 0,
      isProvisional: true,
      warning:
        "Δεν είναι γνωστό το επιπλέον ποσοστό επικουρικής. Η περίοδος θα υπολογιστεί χωρίς πρόσθετη προσαύξηση.",
      formerAuxiliaryFundSelection,
      formerAuxiliaryFund,
      formerAuxiliaryFundLabel,
      workerGroupLabel,
    });
  }

  const rate = getAuxiliaryExtraRateFromChoice(normalizedChoice);

  return createClassification({
    code:
      normalizedChoice === "no_extra"
        ? "manual_confirmed_no_extra"
        : "manual_extra_rate",
    label:
      normalizedChoice === "no_extra"
        ? labelPrefix
          ? `${labelPrefix} — δηλώθηκε χωρίς πρόσθετη εισφορά`
          : "Δηλώθηκε ότι δεν υπήρχε επιπλέον επικουρική εισφορά"
        : labelPrefix
          ? `${labelPrefix} — πρόσθετη εισφορά περίπου +${formatRate(rate)}%`
          : `Πρόσθετη επικουρική εισφορά περίπου +${formatRate(rate)}%`,
    hasAuxiliary: true,
    requiresUserChoice: true,
    userChoice: normalizedChoice,
    extraContributionRatePercent: rate,
    isProvisional: normalizedChoice !== "no_extra",
    warning:
      normalizedChoice === "no_extra"
        ? null
        : `Το προσεγγιστικό πρόσθετο ποσοστό +${formatRate(rate)}% θα εφαρμοστεί σε ολόκληρη τη συγκεκριμένη ασφαλιστική περίοδο.`,
    formerAuxiliaryFundSelection,
    formerAuxiliaryFund,
    formerAuxiliaryFundLabel,
    workerGroupLabel,
  });
}

function getAuxiliaryQuestionPeriods({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleEmploymentCategoryInput,
  insurancePeriodGroups,
  auxiliaryContributionDraft,
} = {}) {
  const safeDraft = normalizeAuxiliaryContributionDraft(
    auxiliaryContributionDraft,
  );
  const rawPeriods = [];

  if (insurancePeriodsInputMode === "simple") {
    rawPeriods.push({
      id: "period_1",
      fund: simpleFundInput,
      employmentCategory: simpleEmploymentCategoryInput,
      uniformedBody: "",
      label: FUND_LABELS[simpleFundInput] || simpleFundInput || "Μία περίοδος",
    });
  }

  if (insurancePeriodsInputMode === "multiple") {
    for (const [index, group] of (Array.isArray(insurancePeriodGroups)
      ? insurancePeriodGroups
      : []
    ).entries()) {
      rawPeriods.push({
        id: String(group?.id || `period_${index + 1}`),
        fund: group?.fund || "",
        employmentCategory: group?.employmentCategory || "",
        uniformedBody: normalizeUniformedBody(group?.uniformedBody),
        label: `Περίοδος ${index + 1}: ${
          group?.fund === "uniformed" && getUniformedBodyLabel(group?.uniformedBody)
            ? `${FUND_LABELS.uniformed} — ${getUniformedBodyLabel(group?.uniformedBody)}`
            : FUND_LABELS[group?.fund] || group?.fund || "χωρίς φορέα"
        }`,
      });
    }
  }

  return rawPeriods
    .map((period) => {
      const periodDraft = safeDraft[period.id] || {
        extraContributionChoice: "",
        formerAuxiliaryFund: "",
      };
      const formerFundOptions = getFormerAuxiliaryFundOptionsForFund(
        period.fund,
        period.uniformedBody,
      );
      const hasOptionalIkaFormerFunds =
        period.fund === "ika" && formerFundOptions.length > 0;
      const selectedFormerFund = periodDraft.formerAuxiliaryFund || "";
      const hasCompatibleFormerFundSelection =
        isFormerAuxiliaryFundCompatibleWithMainFund({
          fund: period.fund,
          uniformedBody: period.uniformedBody,
          formerAuxiliaryFund: selectedFormerFund,
        });
      const hasSpecialFormerFundSelection = Boolean(
        hasCompatibleFormerFundSelection &&
          selectedFormerFund &&
          selectedFormerFund !== "eteam",
      );
      const formerFundMode = hasSpecialFormerFundSelection
        ? "special"
        : "common";
      const classification = resolveAuxiliaryFormClassification({
        fund: period.fund,
        uniformedBody: period.uniformedBody,
        employmentCategory: period.employmentCategory,
        choice: periodDraft.extraContributionChoice,
        formerAuxiliaryFund: periodDraft.formerAuxiliaryFund,
      });

      return {
        ...period,
        formerFundOptions,
        formerFundMode,
        showFormerFundModeSelect: hasOptionalIkaFormerFunds,
        showFormerFundSelect: hasOptionalIkaFormerFunds
          ? formerFundMode === "special"
          : formerFundOptions.length > 0,
        requiresFormerAuxiliaryFundChoice:
          classification.requiresFormerAuxiliaryFundChoice === true,
        requiresExtraContributionChoice:
          classification.requiresUserChoice === true,
        classification,
      };
    });
}

function createIkaEteamClassification({
  code,
  label,
  extraContributionRatePercent,
  isProvisional,
}) {
  return createClassification({
    code,
    label,
    hasAuxiliary: true,
    extraContributionRatePercent,
    isProvisional,
    formerAuxiliaryFundSelection: "eteam",
    formerAuxiliaryFund: "eteam",
    formerAuxiliaryFundLabel: "τ. ΕΤΕΑΜ",
    workerGroupLabel: "Κοινή επικουρική ασφάλιση μισθωτών ΙΚΑ",
  });
}

function createCommonClassification(label) {
  return createClassification({
    code: "automatic_common",
    label,
    hasAuxiliary: true,
    extraContributionRatePercent: 0,
  });
}

function createKnownExtraClassification(rate, label, isProvisional) {
  return createClassification({
    code: "automatic_known_extra",
    label,
    hasAuxiliary: true,
    extraContributionRatePercent: rate,
    isProvisional,
  });
}

function createClassification({
  code,
  label,
  hasAuxiliary,
  requiresUserChoice = false,
  userChoice = null,
  extraContributionRatePercent = null,
  isProvisional = false,
  warning = null,
  requiresFormerAuxiliaryFundChoice = false,
  formerAuxiliaryFundSelection = null,
  formerAuxiliaryFund = null,
  formerAuxiliaryFundLabel = null,
  workerGroupLabel = null,
}) {
  return {
    code,
    label,
    hasAuxiliary: hasAuxiliary === true,
    requiresUserChoice: requiresUserChoice === true,
    userChoice,
    extraContributionRatePercent,
    isProvisional: isProvisional === true,
    warning,
    requiresFormerAuxiliaryFundChoice:
      requiresFormerAuxiliaryFundChoice === true,
    formerAuxiliaryFundSelection,
    formerAuxiliaryFund,
    formerAuxiliaryFundLabel,
    workerGroupLabel,
  };
}

function combineWarnings(...warnings) {
  return warnings.filter(Boolean).join(" ") || null;
}

function formatRate(value) {
  return Number(value).toLocaleString("el-GR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export {
  AUXILIARY_EXTRA_CONTRIBUTION_OPTIONS,
  AUXILIARY_EXTRA_RATE_BY_CHOICE,
  FORMER_AUXILIARY_FUND_METADATA,
  FORMER_AUXILIARY_FUND_OTHER_UNMAPPED,
  FORMER_AUXILIARY_FUND_SPECIAL_PENDING,
  normalizeAuxiliaryContributionDraft,
  normalizeAuxiliaryExtraContributionChoice,
  normalizeFormerAuxiliaryFundSelection,
  getAuxiliaryExtraRateFromChoice,
  isFormerAuxiliaryFundCompatibleWithMainFund,
  getFormerAuxiliaryFundOptionsForFund,
  resolveAuxiliaryFormClassification,
  getAuxiliaryQuestionPeriods,
};
