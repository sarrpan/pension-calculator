// src/services/calculators/supplementaryCalculator.js
const { SYSTEM_TABLES } = require("../../constants/ika/constants");

// --- Σταθερές Νόμου για την Επικουρική Σύνταξη ---
const LEGAL_INCREMENT_BASE = 0.00075; // Το σταθερό 0,075% του νόμου (ως δεκαδικό)
const SUPP_BASE_RATE = 0.0045;        // Βασικό ποσοστό αναπλήρωσης (έως 2014)
const SUPP_BAE_EXTRA_CONTRIBUTION = 2.0; // 2% έξτρα εισφορά στα ΒΑΕ επικουρικής

// Ο τύπος που υπολογίζει αυτόματα το 0.60% (0.0060) για τα βαρέα έως το 2014
const SUPP_HEAVY_RATE = SUPP_BASE_RATE + (SUPP_BAE_EXTRA_CONTRIBUTION * LEGAL_INCREMENT_BASE);

function num(x) {
  const v = Number.parseFloat(x);
  return Number.isFinite(v) ? v : 0;
}

function getSupplementaryRate(year) {
  if (year <= 2018) return 0.07;
  if (year === 2019) return 0.067;
  if (year <= 2021) return 0.065;
  if (year === 2022) return 0.062;
  return 0.06;
}

function calculateSupplementary(formData) {
  if (!formData || !formData.yearsData) return 0;

  // -- ΑΥΤΟΜΑΤΗ ΜΕΤΑΤΡΟΠΗ ΠΑΛΙΩΝ ΔΕΔΟΜΕΝΩΝ (αν είχαν σωθεί με "Πριν το 2002") --
  let finalTotalYears = formData.totalInsuranceYears;
  let finalTotalMonths = formData.totalInsuranceMonths;

  if (!finalTotalYears && formData.yearsBefore2002 !== undefined) {
    let daysAfter = 0;
    for (const data of Object.values(formData.yearsData)) daysAfter += num(data?.days);
    const daysBefore = (num(formData.yearsBefore2002) * 300) + (num(formData.monthsBefore2002) * 25);
    const totalConvertedDays = daysAfter + daysBefore;
    finalTotalYears = Math.floor(totalConvertedDays / 300);
    finalTotalMonths = Math.floor((totalConvertedDays % 300) / 25);
  }

  const {
    yearsData,
    birthDate,
    pensionDate,
    heavyRetirement,
    insuredType,
    heavyMode,
    heavyUntil2014Years,
    heavyUntil2014Months,
    heavyFrom2015Years,
    heavyFrom2015Months,
  } = formData;

  const typeKey = insuredType === "old" ? "OLD" : "NEW";

  let weightedSalary02_14 = 0;
  let days02_14 = 0;
  let daysFrom2015 = 0;
  let totalPartBContributions = 0;
  let totalRevaluedSalaryFrom2015 = 0;

  for (const [year, data] of Object.entries(yearsData)) {
    const yr = parseInt(year, 10);
    const rawAmount = num(data?.amount);
    const rawDays = num(data?.days);
    const cpi = SYSTEM_TABLES.CPI_FACTORS?.[year] ?? 1;

    const monthlyCap = SYSTEM_TABLES.INSURABLE_CAPS?.[typeKey]?.[year] ?? 7761.94;
    const maxYearly = monthlyCap * (rawDays / 25);
    const cappedAmount = maxYearly > 0 && rawAmount > maxYearly ? maxYearly : rawAmount;

    if (yr >= 2002 && yr <= 2014) {
      weightedSalary02_14 += cappedAmount * cpi;
      days02_14 += rawDays;
    } else if (yr >= 2015) {
      daysFrom2015 += rawDays;

      const rate = getSupplementaryRate(yr);
      const revalFactor = SYSTEM_TABLES.SUPPLEMENTARY_REVALUATION?.[yr] ?? 1;

      totalPartBContributions += (cappedAmount * rate) * revalFactor;
      totalRevaluedSalaryFrom2015 += cappedAmount * revalFactor;
    }
  }

  const totalInsuranceDays = (num(finalTotalYears) * 300) + (num(finalTotalMonths) * 25);
  const totalDaysAfter2002 = days02_14 + daysFrom2015;
  const daysBefore2002 = totalInsuranceDays - totalDaysAfter2002;

  if (daysBefore2002 < 0) return 0;

  // -- ΠΕΝΑΛΤΙ: μόνο όταν ΔΕΝ αποχωρεί με καθεστώς βαρέων --
  let penaltyRate = 0;
  if (birthDate && pensionDate && heavyRetirement !== "yes") {
    const bDate = new Date(birthDate);
    const pDate = new Date(pensionDate);

    let ageMonths =
      (pDate.getFullYear() - bDate.getFullYear()) * 12 +
      (pDate.getMonth() - bDate.getMonth());

    if (pDate.getDate() < bDate.getDate()) ageMonths -= 1;

    // ΕΛΕΓΧΟΣ 40ΕΤΙΑΣ: Πέναλτι μπαίνει ΜΟΝΟ αν τα ένσημα είναι κάτω από 12000
    if (totalInsuranceDays < 12000) {
      const monthsBefore67 = Math.max(0, 67 * 12 - ageMonths);
      penaltyRate = Math.min(monthsBefore67, 60) * 0.005;
    }
  }

  // -- ΔΙΑΧΩΡΙΣΜΟΣ ΒΑΡΕΩΝ ΣΕ ΠΕΡΙΟΔΟΥΣ --
  let heavyDaysUntil2014 = 0;
  let heavyDaysFrom2015 = 0;

  if (heavyMode === "all") {
    heavyDaysUntil2014 = daysBefore2002 + days02_14;
    heavyDaysFrom2015 = daysFrom2015;
  } else if (heavyMode === "partial") {
    heavyDaysUntil2014 =
      (num(heavyUntil2014Years) * 300) + (num(heavyUntil2014Months) * 25);
    heavyDaysFrom2015 =
      (num(heavyFrom2015Years) * 300) + (num(heavyFrom2015Months) * 25);
  }

  const maxHeavyUntil2014 = daysBefore2002 + days02_14;
  heavyDaysUntil2014 = Math.min(heavyDaysUntil2014, maxHeavyUntil2014);
  heavyDaysFrom2015 = Math.min(heavyDaysFrom2015, daysFrom2015);

  // =========================
  // PART A: έως 31/12/2014
  // =========================
  const avgSalaryA = days02_14 > 0 ? (weightedSalary02_14 / (days02_14 / 25)) : 0;

  const totalDaysPartA = daysBefore2002 + days02_14;
  const nonHeavyDaysPartA = Math.max(0, totalDaysPartA - heavyDaysUntil2014);

  const yearsHeavyA = heavyDaysUntil2014 / 300;
  const yearsNonHeavyA = nonHeavyDaysPartA / 300;

  // Αντικατάσταση των καρφωτών 0.0045 και 0.0060
  const supplementaryPartA =
    (
      (yearsNonHeavyA * SUPP_BASE_RATE * avgSalaryA) +
      (yearsHeavyA * SUPP_HEAVY_RATE * avgSalaryA)
    ) * (1 - penaltyRate);

  // =========================
  // PART B: από 1/1/2015 και μετά
  // =========================
  const avgRevaluedSalaryPerDayFrom2015 =
    daysFrom2015 > 0 ? totalRevaluedSalaryFrom2015 / daysFrom2015 : 0;

  // Αντικατάσταση του καρφωτού 0.02
  const heavyExtraContributions =
    heavyDaysFrom2015 * avgRevaluedSalaryPerDayFrom2015 * (SUPP_BAE_EXTRA_CONTRIBUTION / 100);

  const totalPartBContributionsWithHeavy =
    totalPartBContributions + heavyExtraContributions;

  const birthYear = birthDate ? new Date(birthDate).getFullYear() : 1960;
  const pensionYear = pensionDate ? new Date(pensionDate).getFullYear() : new Date().getFullYear();
  const ageAtExit = pensionYear - birthYear;
  const gFactor = SYSTEM_TABLES.G_FACTORS?.[ageAtExit] ?? 16.9;

  const supplementaryPartB =
    gFactor > 0 ? (totalPartBContributionsWithHeavy / gFactor) / 12 : 0;

  return supplementaryPartA + supplementaryPartB;
}
module.exports = { calculateSupplementary };