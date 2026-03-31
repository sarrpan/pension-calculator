// debug_calc.js
import { SYSTEM_TABLES } from "./constants";

export function debugPensionCalculation(formData) {
  console.log("--- ΕΝΑΡΞΗ DEBUG ΥΠΟΛΟΓΙΣΜΟΥ ---");
  
  const { yearsData, totalYears, totalMonths } = formData;
  let totalWeightedAmount = 0;
  let totalDays = 0;

  // 1. Έλεγχος Αναπροσαρμογής ανά Έτος
  Object.entries(yearsData).forEach(([year, data]) => {
    const amount = parseFloat(data.amount) || 0;
    const days = parseFloat(data.days) || 0;
    const cpi = SYSTEM_TABLES.CPI_FACTORS[year] || 1;

    if (days > 0 && amount > 0) {
      const adjusted = amount * cpi;
      totalWeightedAmount += adjusted;
      totalDays += days;
      console.log(`Έτος ${year}: Ποσό ${amount} * ΔΤΚ ${cpi} = ${adjusted.toFixed(5)} | Ημέρες: ${days}`);
    }
  });

  // 2. Υπολογισμός Μέσου Όρου
  const totalMonthsCalc = totalDays / 25;
  const avgMonthlySalary = totalWeightedAmount / totalMonthsCalc;
  
  console.log("-------------------------------");
  console.log(`Συνολικές Ημέρες: ${totalDays}`);
  console.log(`Συνολικοί Μήνες (Ημέρες/25): ${totalMonthsCalc}`);
  console.log(`Συνολικό Αναπροσαρμοσμένο Ποσό: ${totalWeightedAmount.toFixed(5)}`);
  console.log(`Μέσος Μηνιαίος Μισθός: ${avgMonthlySalary.toFixed(5)}`);

  // 3. Ποσοστό Αναπλήρωσης
  const decimalYears = parseFloat(totalYears) + (parseFloat(totalMonths) / 12);
  const scales = SYSTEM_TABLES.REPLACEMENT_SCALES;
  
  const scale = scales.find((s, idx) => {
    const prev = idx === 0 ? 0 : scales[idx-1].upTo;
    return decimalYears > prev && decimalYears <= s.upTo;
  });

  const idx = scales.indexOf(scale);
  const prevUpTo = idx <= 0 ? 0 : scales[idx-1].upTo;
  const finalRate = scale.base + (decimalYears - prevUpTo) * scale.factor;

  console.log(`Συντάξιμα Έτη: ${decimalYears.toFixed(4)}`);
  console.log(`Ποσοστό Αναπλήρωσης: ${finalRate.toFixed(4)}%`);

  // 4. Τελικά Ποσά
  const contributory = (avgMonthlySalary * finalRate) / 100;
  const national = SYSTEM_TABLES.NATIONAL_PENSION_2026;

  console.log(`Ανταποδοτική: ${contributory.toFixed(5)} €`);
  console.log(`Εθνική: ${national} €`);
  console.log(`ΣΥΝΟΛΟ: ${(contributory + national).toFixed(5)} €`);
  console.log("--- ΤΕΛΟΣ DEBUG ---");
}