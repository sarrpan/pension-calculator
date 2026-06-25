const PENSION_INPUT_DOCUMENT_TYPE = "geodora-pension-input";
const PENSION_INPUT_SCHEMA_VERSION = "1.0";
const PENSION_INPUT_SOURCE_APPLICATION = "geodora-pension-forms";

function createPensionInputPackage({
  calculationInput,
  calculatorEdition = "professional",
  createdAt = new Date(),
}) {
  assertCalculationInput(calculationInput);

  const createdAtDate =
    createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (Number.isNaN(createdAtDate.getTime())) {
    throw new Error(
      "Η ημερομηνία δημιουργίας του αρχείου JSON δεν είναι έγκυρη.",
    );
  }

  return {
    documentType: PENSION_INPUT_DOCUMENT_TYPE,
    schemaVersion: PENSION_INPUT_SCHEMA_VERSION,
    createdAt: createdAtDate.toISOString(),
    source: {
      application: PENSION_INPUT_SOURCE_APPLICATION,
      edition: normalizeCalculatorEdition(calculatorEdition),
    },
    calculationInput: cloneJsonValue(calculationInput),
  };
}

function downloadPensionInputPackage(pensionInputPackage) {
  validatePensionInputPackage(pensionInputPackage);

  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "Η λήψη του αρχείου JSON είναι διαθέσιμη μόνο μέσα από τον browser.",
    );
  }

  const jsonText = JSON.stringify(pensionInputPackage, null, 2);
  const blob = new Blob([jsonText], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = buildPensionInputFilename(pensionInputPackage);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

async function readPensionInputPackageFile(file) {
  if (!file || typeof file.text !== "function") {
    throw new Error("Επιλέξτε ένα έγκυρο αρχείο JSON.");
  }

  const jsonText = await file.text();

  return parsePensionInputPackageText(jsonText);
}

function parsePensionInputPackageText(jsonText) {
  let parsedValue;

  try {
    parsedValue = JSON.parse(String(jsonText || ""));
  } catch (error) {
    throw new Error("Το αρχείο δεν περιέχει έγκυρο JSON.");
  }

  validatePensionInputPackage(parsedValue);

  return cloneJsonValue(parsedValue);
}

function validatePensionInputPackage(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Το αρχείο JSON δεν έχει την αναμενόμενη δομή.");
  }

  if (value.documentType !== PENSION_INPUT_DOCUMENT_TYPE) {
    throw new Error(
      `Το documentType πρέπει να είναι "${PENSION_INPUT_DOCUMENT_TYPE}".`,
    );
  }

  if (value.schemaVersion !== PENSION_INPUT_SCHEMA_VERSION) {
    throw new Error(
      `Η εφαρμογή υποστηρίζει schemaVersion ${PENSION_INPUT_SCHEMA_VERSION}.`,
    );
  }

  if (
    !value.source ||
    typeof value.source !== "object" ||
    Array.isArray(value.source)
  ) {
    throw new Error("Λείπουν τα στοιχεία προέλευσης του αρχείου JSON.");
  }

  assertCalculationInput(value.calculationInput);

  const generalInfoData = value.calculationInput.generalInfoData;

  if (
    !generalInfoData ||
    typeof generalInfoData !== "object" ||
    Array.isArray(generalInfoData)
  ) {
    throw new Error("Λείπουν τα βασικά στοιχεία σύνταξης.");
  }

  const requiredGeneralFields = [
    "birthDate",
    "pensionDate",
    "pensionType",
    "totalInsuranceDays",
  ];

  for (const field of requiredGeneralFields) {
    if (
      generalInfoData[field] === null ||
      generalInfoData[field] === undefined ||
      String(generalInfoData[field]).trim() === ""
    ) {
      throw new Error(`Λείπει το υποχρεωτικό στοιχείο: ${field}.`);
    }
  }

  if (!Array.isArray(value.calculationInput.insurancePeriodsDraft)) {
    throw new Error("Οι ασφαλιστικές περίοδοι δεν έχουν έγκυρη μορφή.");
  }

  return true;
}

function buildPensionInputFilename(pensionInputPackage = {}) {
  const createdAt = new Date(pensionInputPackage.createdAt || Date.now());
  const safeTimestamp = Number.isNaN(createdAt.getTime())
    ? "unknown-date"
    : createdAt.toISOString().replace(/[:.]/g, "-");

  return `geodora-pension-input-${safeTimestamp}.json`;
}

function assertCalculationInput(calculationInput) {
  if (
    !calculationInput ||
    typeof calculationInput !== "object" ||
    Array.isArray(calculationInput)
  ) {
    throw new Error(
      "Δεν υπάρχουν έγκυρα δεδομένα υπολογισμού στο αρχείο JSON.",
    );
  }
}

function normalizeCalculatorEdition(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (["free", "professional", "internal"].includes(normalizedValue)) {
    return normalizedValue;
  }

  return "professional";
}

function cloneJsonValue(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    throw new Error(
      "Τα δεδομένα περιέχουν τιμή που δεν μπορεί να αποθηκευτεί σε JSON.",
    );
  }
}

export {
  PENSION_INPUT_DOCUMENT_TYPE,
  PENSION_INPUT_SCHEMA_VERSION,
  createPensionInputPackage,
  downloadPensionInputPackage,
  parsePensionInputPackageText,
  readPensionInputPackageFile,
  validatePensionInputPackage,
};
