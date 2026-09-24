export const FREE_OVERLAP_ERROR =
  "Η δωρεάν εκτίμηση δεν υποστηρίζει παράλληλη ασφάλιση. Οι δύο ασφαλιστικές περίοδοι δεν πρέπει να επικαλύπτονται χρονικά.";

export function getFreeInsurancePeriodsError(periods = [], now = new Date()) {
  if (periods.length > 2) {
    return "Η δωρεάν εκτίμηση δέχεται έως δύο ασφαλιστικές περιόδους.";
  }
  // Form analysis validates individual dates before providing normalized periods.
  const complete = periods.filter((period) => period.fromDate && period.toDate);
  if (complete.length === 2 &&
      complete[0].fromDate <= complete[1].toDate &&
      complete[1].fromDate <= complete[0].toDate) {
    return FREE_OVERLAP_ERROR;
  }
  if (complete.some((period) => period.toDate > now.toISOString().slice(0, 10))) {
    return "Η δωρεάν εκτίμηση δέχεται μόνο πραγματικές ασφαλιστικές περιόδους έως σήμερα, χωρίς μελλοντική προβολή.";
  }
  return null;
}
