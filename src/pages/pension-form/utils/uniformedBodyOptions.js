const UNIFORMED_INSURANCE_REGIME_LABELS = Object.freeze({
  old_public:
    "Κατάταξη έως 31/12/2010 — καθεστώς Δημοσίου",
  new_ika:
    "Κατάταξη από 01/01/2011 — καθεστώς τ. ΙΚΑ-ΕΤΑΜ",
});

const ARTICLE_36A_CATEGORY_DEFINITIONS = Object.freeze({
  flight: Object.freeze({
    value: "flight",
    label: "Ιπτάμενος σε κατάσταση πτητικής ενέργειας",
  }),
  submarine_service: Object.freeze({
    value: "submarine_service",
    label: "Υπηρεσία σε υποβρύχιο / καταδυτική ενέργεια",
  }),
  paratrooper: Object.freeze({
    value: "paratrooper",
    label: "Αλεξιπτωτιστής",
  }),
  underwater_demolition: Object.freeze({
    value: "underwater_demolition",
    label: "Υποβρύχιος καταστροφέας",
  }),
  mine_clearance: Object.freeze({
    value: "mine_clearance",
    label: "Εκκαθαριστής ναρκοπεδίων / ναρκαλιευτικό συνεργείο",
  }),
  police_bomb_disposal: Object.freeze({
    value: "police_bomb_disposal",
    label: "Εξουδετέρωση εκρηκτικών μηχανισμών / αυτοσχέδιων βομβών",
  }),
  police_special_counterterrorism: Object.freeze({
    value: "police_special_counterterrorism",
    label: "Ειδική κατασταλτική αντιτρομοκρατική μονάδα",
  }),
  coast_guard_underwater_missions: Object.freeze({
    value: "coast_guard_underwater_missions",
    label: "Υποβρύχιες αποστολές Λιμενικού Σώματος",
  }),
  coast_guard_bomb_disposal: Object.freeze({
    value: "coast_guard_bomb_disposal",
    label: "Αντίστοιχα καθήκοντα εξουδετέρωσης εκρηκτικών στο Λιμενικό",
  }),
  coast_guard_special_operations: Object.freeze({
    value: "coast_guard_special_operations",
    label: "Αντίστοιχη ειδική επιχειρησιακή μονάδα Λιμενικού",
  }),
  other_confirmed: Object.freeze({
    value: "other_confirmed",
    label: "Άλλη κατηγορία με επιβεβαιωμένη διάταξη",
  }),
});

const UNIFORMED_BODY_GROUPS = Object.freeze([
  Object.freeze({
    value: "armed_forces",
    label: "Ένοπλες Δυνάμεις",
    options: Object.freeze([
      Object.freeze({
        value: "hellenic_army",
        label: "Στρατός Ξηράς",
        aliases: Object.freeze([
          "στρατός",
          "στρατός ξηράς",
          "στρατιωτικός",
        ]),
        hasAuxiliaryPension: false,
        allowedArticle36ACategories: Object.freeze([
          "flight",
          "paratrooper",
          "mine_clearance",
          "other_confirmed",
        ]),
      }),
      Object.freeze({
        value: "hellenic_navy",
        label: "Πολεμικό Ναυτικό",
        aliases: Object.freeze([
          "ναυτικό",
          "πολεμικό ναυτικό",
        ]),
        hasAuxiliaryPension: false,
        allowedArticle36ACategories: Object.freeze([
          "flight",
          "submarine_service",
          "underwater_demolition",
          "mine_clearance",
          "other_confirmed",
        ]),
      }),
      Object.freeze({
        value: "hellenic_air_force",
        label: "Πολεμική Αεροπορία",
        aliases: Object.freeze([
          "πολεμική αεροπορία",
          "αεροπορία",
        ]),
        hasAuxiliaryPension: false,
        allowedArticle36ACategories: Object.freeze([
          "flight",
          "paratrooper",
          "mine_clearance",
          "other_confirmed",
        ]),
      }),
    ]),
  }),
  Object.freeze({
    value: "security_forces",
    label: "Σώματα Ασφαλείας",
    options: Object.freeze([
      Object.freeze({
        value: "hellenic_police",
        label: "Ελληνική Αστυνομία",
        aliases: Object.freeze([
          "αστυνομία",
          "ελασ",
          "χωροφυλακή",
          "αστυνομία πόλεων",
        ]),
        hasAuxiliaryPension: true,
        allowedArticle36ACategories: Object.freeze([
          "police_bomb_disposal",
          "police_special_counterterrorism",
          "other_confirmed",
        ]),
      }),
      Object.freeze({
        value: "fire_service",
        label: "Πυροσβεστικό Σώμα",
        aliases: Object.freeze([
          "πυροσβεστική",
          "πυροσβέστης",
        ]),
        hasAuxiliaryPension: true,
        allowedArticle36ACategories: Object.freeze([]),
      }),
      Object.freeze({
        value: "coast_guard",
        label: "Λιμενικό Σώμα",
        aliases: Object.freeze([
          "λιμενικό",
          "λιμενοφύλακας",
        ]),
        hasAuxiliaryPension: false,
        allowedArticle36ACategories: Object.freeze([
          "flight",
          "coast_guard_underwater_missions",
          "coast_guard_bomb_disposal",
          "coast_guard_special_operations",
          "other_confirmed",
        ]),
      }),
    ]),
  }),
]);

const UNIFORMED_BODY_METADATA = Object.freeze(
  Object.fromEntries(
    UNIFORMED_BODY_GROUPS.flatMap((group) =>
      group.options.map((option) => [
        option.value,
        Object.freeze({
          ...option,
          supportsArticle36A:
            option.allowedArticle36ACategories.length > 0,
          groupValue: group.value,
          groupLabel: group.label,
        }),
      ]),
    ),
  ),
);

const LEGACY_ARTICLE_36A_CATEGORY_BY_BODY = Object.freeze({
  submarine_or_diving: Object.freeze({
    hellenic_navy: "submarine_service",
    coast_guard: "coast_guard_underwater_missions",
  }),
  underwater_demolition_or_special_ops: Object.freeze({
    hellenic_navy: "underwater_demolition",
    hellenic_police: "police_special_counterterrorism",
    coast_guard: "coast_guard_underwater_missions",
  }),
  mine_clearance_or_eod: Object.freeze({
    hellenic_army: "mine_clearance",
    hellenic_navy: "mine_clearance",
    hellenic_air_force: "mine_clearance",
    hellenic_police: "police_bomb_disposal",
    coast_guard: "coast_guard_bomb_disposal",
  }),
});

function normalizeUniformedBody(value) {
  const normalizedValue = String(value || "").trim();

  return UNIFORMED_BODY_METADATA[normalizedValue]
    ? normalizedValue
    : "";
}

function getUniformedBodyMetadata(value) {
  return UNIFORMED_BODY_METADATA[
    normalizeUniformedBody(value)
  ] || null;
}

function getUniformedBodyLabel(value) {
  return getUniformedBodyMetadata(value)?.label || "";
}

function getUniformedBodyGroupLabel(value) {
  return getUniformedBodyMetadata(value)?.groupLabel || "";
}

function uniformedBodyHasAuxiliaryPension(value) {
  return (
    getUniformedBodyMetadata(value)
      ?.hasAuxiliaryPension === true
  );
}

function getAllowedArticle36ACategories(value) {
  const categories = getUniformedBodyMetadata(value)
    ?.allowedArticle36ACategories;

  return Array.isArray(categories) ? [...categories] : [];
}

function uniformedBodySupportsArticle36A(value) {
  return getAllowedArticle36ACategories(value).length > 0;
}

function getArticle36ACategoryOptions(value) {
  const allowedCategories = getAllowedArticle36ACategories(value);

  if (allowedCategories.length === 0) {
    return [];
  }

  return [
    Object.freeze({
      value: "",
      label: "Δεν υπάγεται / δεν δηλώθηκε",
    }),
    ...allowedCategories
      .map((category) => ARTICLE_36A_CATEGORY_DEFINITIONS[category])
      .filter(Boolean),
  ];
}

function normalizeArticle36ACategoryForUniformedBody(
  value,
  uniformedBody,
) {
  const normalizedBody = normalizeUniformedBody(uniformedBody);
  const normalizedCategory = String(value || "").trim();
  const allowedCategories = getAllowedArticle36ACategories(normalizedBody);

  if (!normalizedCategory || allowedCategories.length === 0) {
    return "";
  }

  if (allowedCategories.includes(normalizedCategory)) {
    return normalizedCategory;
  }

  const legacyCategory =
    LEGACY_ARTICLE_36A_CATEGORY_BY_BODY[normalizedCategory]?.[
      normalizedBody
    ] || "";

  return allowedCategories.includes(legacyCategory)
    ? legacyCategory
    : "";
}

function isArticle36ACategoryAllowedForUniformedBody({
  uniformedBody,
  article36ACategory,
} = {}) {
  const normalizedCategory = String(article36ACategory || "").trim();

  if (!normalizedCategory) {
    return true;
  }

  return (
    normalizeArticle36ACategoryForUniformedBody(
      normalizedCategory,
      uniformedBody,
    ) === normalizedCategory
  );
}

function deriveUniformedInsuranceRegimeFromDate(
  value,
) {
  const parsedDate = parseUniformedStartDate(value);

  if (!parsedDate) {
    return "";
  }

  const reformDate = Date.UTC(2011, 0, 1);

  return parsedDate.getTime() < reformDate
    ? "old_public"
    : "new_ika";
}

function getUniformedInsuranceRegimeLabel(value) {
  return UNIFORMED_INSURANCE_REGIME_LABELS[value] || "";
}

function parseUniformedStartDate(value) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  let year;
  let month;
  let day;

  const isoMatch =
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const separatedMatch =
      /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/.exec(
        text,
      );

    if (separatedMatch) {
      day = Number(separatedMatch[1]);
      month = Number(separatedMatch[2]);
      year = Number(separatedMatch[3]);
    } else {
      const digits = text.replace(/\D/g, "");

      if (digits.length !== 8) {
        return null;
      }

      day = Number(digits.slice(0, 2));
      month = Number(digits.slice(2, 4));
      year = Number(digits.slice(4, 8));
    }
  }

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day),
  );
  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  return isRealDate ? parsedDate : null;
}

export {
  ARTICLE_36A_CATEGORY_DEFINITIONS,
  UNIFORMED_INSURANCE_REGIME_LABELS,
  UNIFORMED_BODY_GROUPS,
  UNIFORMED_BODY_METADATA,
  normalizeUniformedBody,
  getUniformedBodyMetadata,
  getUniformedBodyLabel,
  getUniformedBodyGroupLabel,
  uniformedBodyHasAuxiliaryPension,
  getAllowedArticle36ACategories,
  uniformedBodySupportsArticle36A,
  getArticle36ACategoryOptions,
  normalizeArticle36ACategoryForUniformedBody,
  isArticle36ACategoryAllowedForUniformedBody,
  deriveUniformedInsuranceRegimeFromDate,
  getUniformedInsuranceRegimeLabel,
};
