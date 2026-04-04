const { SYSTEM_TABLES } = require("../../constants/dei/constants");
const { DEDUCTIONS_CONSTANTS } = require("../../constants/dei/deductionsConstants");

function round2(x) {
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
}

function num(x) {
  const v = Number.parseFloat(x);
  return Number.isFinite(v) ? v : 0;
}

function getAgeAtExit(birthDate, pensionDate) {
  const fallbackAge = num(DEDUCTIONS_CONSTANTS.DEI_DEFAULTS?.AGE_AT_EXIT_FALLBACK) || 60;

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

function getTaxCreditReductionStartAnnualIncome() {
  return num(SYSTEM_TABLES.TAX_CREDIT_RULES_2026?.REDUCTION_START_ANNUAL_INCOME);
}

function getTaxCreditReductionStepAnnualIncome() {
  return num(SYSTEM_TABLES.TAX_CREDIT_RULES_2026?.REDUCTION_STEP_ANNUAL_INCOME);
}

function getTaxCreditReductionPerStep() {
  return num(SYSTEM_TABLES.TAX_CREDIT_RULES_2026?.REDUCTION_PER_STEP);
}

function findMatchingThreshold(amount, thresholds = []) {
  return (
    thresholds.find(
      (threshold) =>
        amount >= Number(threshold.min) &&
        amount <= Number(threshold.max)
    ) ?? null
  );
}

/*
  Μη προοδευτική κράτηση με "κόφτη".
  Το ποσοστό εφαρμόζεται σε όλο το ποσό,
  αλλά η παρακράτηση δεν επιτρέπεται να ρίξει το ποσό
  κάτω από το floor του κλιμακίου.
*/
function calculateDeductionByRateOnly(amount, thresholds = []) {
  const safeAmount = num(amount);
  if (safeAmount <= 0) return 0;

  const threshold = findMatchingThreshold(safeAmount, thresholds);
  if (!threshold) return 0;

  return safeAmount * num(threshold.rate);
}

function calculateMainEAS(mainGross) {
  return calculateDeductionByRateOnly(
    mainGross,
    DEDUCTIONS_CONSTANTS.MAIN_EAS?.thresholds ?? []
  );
}

function calculateSupplementaryEAS(supplementaryGross) {
  return calculateDeductionByRateOnly(
    supplementaryGross,
    DEDUCTIONS_CONSTANTS.SUPPLEMENTARY_EAS_AKAGE?.thresholds ?? []
  );
}

function calculateDeiUnder60Deduction(mainGross, mainEasDeduction, ageAtExit) {
  const rules = DEDUCTIONS_CONSTANTS.DEI_UNDER_60 ?? {};
  const ageLimit = num(rules.ageLimit);
  const mainGrossMin = num(rules.mainGrossMin);
  const brackets = rules.brackets ?? [];

  if (ageAtExit >= ageLimit || num(mainGross) <= mainGrossMin) {
    return 0;
  }

  let rate = 0;

  for (const bracket of brackets) {
    if (num(mainGross) >= num(bracket.min) && num(mainGross) <= num(bracket.max)) {
      rate = num(bracket.rate);
      break;
    }
  }

  if (rate <= 0) {
    return 0;
  }

  // Η ειδική κράτηση ΔΕΗ εφαρμόζεται στην κύρια μετά την ΕΑΣ
  const baseAmount = Math.max(num(mainGross) - num(mainEasDeduction), 0);
  return baseAmount * rate;
}

function calculateHealthDeduction({
  mainGross,
  supplementaryGross,
  mainEasDeduction,
  supplementaryEasDeduction,
}) {
  const healthRate = num(DEDUCTIONS_CONSTANTS.HEALTH?.rate);

  const mainHealthBase = Math.max(num(mainGross) - num(mainEasDeduction), 0);
  const supplementaryHealthBase = Math.max(
    num(supplementaryGross) - num(supplementaryEasDeduction),
    0
  );

  const mainHealthDeduction = mainHealthBase * healthRate;
  const supplementaryHealthDeduction = supplementaryHealthBase * healthRate;

  return {
    mainHealthBase,
    supplementaryHealthBase,
    mainHealthDeduction,
    supplementaryHealthDeduction,
    totalHealthBase: mainHealthBase + supplementaryHealthBase,
    totalHealthDeduction: mainHealthDeduction + supplementaryHealthDeduction,
  };
}

function calculateTax(taxableAmount) {
  const annualTaxable = num(taxableAmount) * 12;
  const brackets = SYSTEM_TABLES.DEDUCTIONS_2026?.TAX_BRACKETS ?? [];
  let taxCredit = num(SYSTEM_TABLES.DEDUCTIONS_2026?.TAX_CREDIT_BASE);

  const reductionStart = getTaxCreditReductionStartAnnualIncome();
  const reductionStepIncome = getTaxCreditReductionStepAnnualIncome();
  const reductionPerStep = getTaxCreditReductionPerStep();

  if (annualTaxable > reductionStart && reductionStepIncome > 0) {
    taxCredit = Math.max(
      0,
      taxCredit -
        Math.floor((annualTaxable - reductionStart) / reductionStepIncome) * reductionPerStep
    );
  }

  let annualTax = 0;
  let remaining = annualTaxable;
  let prevLimit = 0;

  for (const bracket of brackets) {
    const currentLimit = num(bracket.limit);
    const currentRate = num(bracket.rate);

    const amountInBracket = Math.min(remaining, currentLimit - prevLimit);
    if (amountInBracket <= 0) break;

    annualTax += amountInBracket * currentRate;
    remaining -= amountInBracket;
    prevLimit = currentLimit;
  }

  return Math.max(0, annualTax - taxCredit) / 12;
}

function calculateDeiDeductions({
  mainGross = 0,
  supplementaryGross = 0,
  birthDate,
  pensionDate,
}) {
  const safeMainGross = num(mainGross);
  const safeSupplementaryGross = num(supplementaryGross);

  const ageAtExit = getAgeAtExit(birthDate, pensionDate);

  // 1. ΕΑΣ κύριας
  const mainEasDeduction = calculateMainEAS(safeMainGross);

  // 2. ΕΑΣ επικουρικής / ΑΚΑΓΕ
  const supplementaryEasDeduction = calculateSupplementaryEAS(safeSupplementaryGross);

  // 3. Ειδική κράτηση ΔΕΗ <60 στην κύρια μετά την ΕΑΣ
  const under60Deduction = calculateDeiUnder60Deduction(
    safeMainGross,
    mainEasDeduction,
    ageAtExit
  );

  // 4. Υγεία 6% μετά την αντίστοιχη ΕΑΣ
  const health = calculateHealthDeduction({
    mainGross: safeMainGross,
    supplementaryGross: safeSupplementaryGross,
    mainEasDeduction,
    supplementaryEasDeduction,
  });

  const grossGrandTotal = safeMainGross + safeSupplementaryGross;

  // 5. Βάση μετά τις κρατήσεις (χωρίς φόρο)
  const taxableAmount =
    grossGrandTotal -
    mainEasDeduction -
    supplementaryEasDeduction -
    under60Deduction -
    health.totalHealthDeduction;

  // 6. Δεν υπολογίζουμε φόρο
  const taxDeduction = 0;

  // 7. Τελικό ποσό σύνταξης χωρίς φόρο
  const netAmount =
    grossGrandTotal -
    mainEasDeduction -
    supplementaryEasDeduction -
    under60Deduction -
    health.totalHealthDeduction;

  return {
    ageAtExit: round2(ageAtExit),

    mainGross: round2(safeMainGross),
    supplementaryGross: round2(safeSupplementaryGross),
    grossGrandTotal: round2(grossGrandTotal),

    mainEasDeduction: round2(mainEasDeduction),
    supplementaryEasDeduction: round2(supplementaryEasDeduction),
    totalEasDeduction: round2(mainEasDeduction + supplementaryEasDeduction),

    under60Deduction: round2(under60Deduction),

    mainHealthBase: round2(health.mainHealthBase),
    supplementaryHealthBase: round2(health.supplementaryHealthBase),
    totalHealthBase: round2(health.totalHealthBase),

    mainHealthDeduction: round2(health.mainHealthDeduction),
    supplementaryHealthDeduction: round2(health.supplementaryHealthDeduction),
    healthDeduction: round2(health.totalHealthDeduction),

    taxableAmount: round2(taxableAmount),
    taxDeduction: round2(taxDeduction),
    netAmount: round2(netAmount),
  };
}

module.exports = { calculateDeiDeductions };
