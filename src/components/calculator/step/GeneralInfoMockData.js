const generalInfoMockData = {
  birthDate: '1967-12-31',
  pensionDate: '2025-12-31',
  totalInsuranceYears: '34',
  totalInsuranceMonths: '1',
  residenceYears: '40',
  insuredType: 'old',
  heavyMode: 'partial',

  // --- ΑΝΑΛΥΣΗ ΠΡΙΝ ΤΟ 2014 ---
  yearsOutsideDeiBefore2014: '4',   // Εκτός ΔΕΗ: 4 χρόνια
  monthsOutsideDeiBefore2014: '5',  // Εκτός ΔΕΗ: 5 μήνες
  deiSimpleYearsBefore2014: '0',    // ΔΕΗ - Απλά: 0 χρόνια
  deiSimpleMonthsBefore2014: '0',   // ΔΕΗ - Απλά: 0 μήνες
  heavyUntil2014Years: '18',        // ΔΕΗ - Υπερβαρέα: 18 χρόνια
  heavyUntil2014Months: '6',       // ΔΕΗ - Υπερβαρέα: 6 μήνες

  // --- ΕΤΗ 2015 ΕΩΣ 2019 (12 Μήνες ΥΒΑΕ το καθένα) ---
  heavy2015Months: '12',            // Για το 2015
  hvy16M: '12',                     // Για το 2016
  hvy17M: '12',                     // Για το 2017
  hvy18M: '12',                     // Για το 2018
  hvy19M: '12',                     // Για το 2019

  // --- 2020 ΚΑΙ ΜΕΤΑ ---
  heavyFrom2020Years: '6',          // ΔΕΗ - Υπερβαρέα: 6 χρόνια
  hvy20pM: '0'
};

export default generalInfoMockData;
