import React from 'react';

import {
  preStyle,
  preparedInputSectionStyle,
  sectionStyle,
} from '../utils/calculatorStyles';

function PreparedInputPreview({ analysis }) {
  return (
    <>
      <section style={sectionStyle}>
        <h2>Τι κατάλαβε η εφαρμογή</h2>

        <p>
          <strong>Ημερομηνία που δόθηκε:</strong>{' '}
          {analysis.displayDate}
        </p>

        <p>
          <strong>Έτος σύνταξης:</strong>{' '}
          {analysis.pensionYear}
        </p>

        <p>
          <strong>Είδος σύνταξης:</strong>{' '}
          {analysis.pensionTypeLabel}
        </p>

        {analysis.oldAgeCategoryLabel && (
          <p>
            <strong>Κατηγορία γήρατος:</strong>{' '}
            {analysis.oldAgeCategoryLabel}
          </p>
        )}

        {analysis.pensionModeLabel && (
          <p>
            <strong>Πλήρης ή μειωμένη:</strong>{' '}
            {analysis.pensionModeLabel}
          </p>
        )}

        {analysis.earlyReductionMonths !== null && (
          <p>
            <strong>Μήνες πρόωρης μείωσης:</strong>{' '}
            {analysis.earlyReductionMonths}
          </p>
        )}

        {analysis.disabilityCategoryLabel && (
          <p>
            <strong>Κατηγορία αναπηρίας:</strong>{' '}
            {analysis.disabilityCategoryLabel}
          </p>
        )}

        {analysis.disabilityPercentage !== null && (
          <p>
            <strong>Ποσοστό αναπηρίας που θα σταλεί:</strong>{' '}
            {analysis.disabilityPercentage}%
          </p>
        )}

        <p>
          <strong>Τρόπος εισαγωγής χρόνου ασφάλισης:</strong>{' '}
          {analysis.insuranceTimeInputMethodLabel}
        </p>

        <p>
          <strong>Χρόνος ασφάλισης που χρησιμοποιείται στον υπολογισμό:</strong>{' '}
          {analysis.insuranceTimeDisplay}
        </p>

        <p>
          <strong>Σύνολο ημερών ασφάλισης:</strong>{' '}
          {analysis.totalInsuranceDaysEquivalent}
        </p>

        <p>
          <strong>Σύνολο σε δεκαδικά έτη:</strong>{' '}
          {analysis.totalInsuranceDecimalYears}
        </p>

        {analysis.residenceYears !== null && (
          <p>
            <strong>Έτη νόμιμης διαμονής:</strong>{' '}
            {analysis.residenceYears}
          </p>
        )}

        {analysis.insurancePeriodsDraft?.length > 0 && (
          <div style={previewBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Κατηγορία συνολικού χρόνου ασφάλισης</h3>

            {analysis.insurancePeriodsDraft.map((period, index) => (
              <div key={`${period.fund}-${period.insuredType}-${period.employmentCategory}-${index}`}>
                {period.fromDateDisplay && period.toDateDisplay ? (
                  <p>
                    <strong>Περίοδος:</strong>{' '}
                    {period.fromDateDisplay} έως {period.toDateDisplay}
                  </p>
                ) : (
                  <p>
                    <strong>Χρόνος που αποδίδεται:</strong>{' '}
                    Όλος ο δηλωμένος συνολικός χρόνος ασφάλισης
                  </p>
                )}

                <p>
                  <strong>Φορέας / κατηγορία ασφάλισης:</strong>{' '}
                  {period.fundLabel}
                </p>

                <p>
                  <strong>Ασφαλισμένος:</strong>{' '}
                  {period.insuredTypeLabel}
                </p>

                <p>
                  <strong>Κατηγορία εργασίας / εισφορών:</strong>{' '}
                  {period.employmentCategoryLabel}
                </p>

                <p>
                  <strong>Ημέρες / ένσημα που αποδίδονται:</strong>{' '}
                  {period.insuranceDays}
                </p>

                {period.insuranceDaysSourceLabel && (
                  <p>
                    <strong>Πηγή ημερών:</strong>{' '}
                    {period.insuranceDaysSourceLabel}
                  </p>
                )}

                <p>
                  <strong>Εσωτερικά values:</strong>{' '}
                  fund={period.fund}, insuredType={period.insuredType}, employmentCategory={period.employmentCategory}
                </p>
              </div>
            ))}
          </div>
        )}

        {analysis.contributoryEarningsInputMethodLabel && (
          <p>
            <strong>Τρόπος εισαγωγής ανταποδοτικής:</strong>{' '}
            {analysis.contributoryEarningsInputMethodLabel}
          </p>
        )}

        {analysis.averageMonthlyPensionableEarnings !== null && (
          <p>
            <strong>Μέσος μηνιαίος συντάξιμος μισθός:</strong>{' '}
            {analysis.averageMonthlyPensionableEarnings} €
          </p>
        )}

        {analysis.yearlyEarningsRowsCount > 0 && (
          <p>
            <strong>Γραμμές ετήσιων αποδοχών που θα σταλούν:</strong>{' '}
            {analysis.yearlyEarningsRowsCount}
          </p>
        )}

        {analysis.isSpecialDiseaseOldAgeCase && (
          <p style={{ color: '#8a5a00' }}>
            Η εφαρμογή θα στείλει ειδική ένδειξη ότι πρόκειται για γήρας λόγω ειδικών παθήσεων. Ο calculator αργότερα πρέπει να εφαρμόσει τον ειδικό κανόνα χωρίς μείωση 1/40 λόγω 40ετίας.
          </p>
        )}

        {analysis.requiresContributoryYearlyStep && analysis.yearlyEarningsRowsCount === 0 && (
          <p style={{ color: '#8a5a00' }}>
            Έχει επιλεγεί αναλυτική εισαγωγή αποδοχών. Η επόμενη φόρμα θα ζητήσει αποδοχές και ένσημα ανά έτος.
          </p>
        )}

        {analysis.warnings.map((warning) => (
          <p key={warning} style={{ color: 'crimson' }}>
            {warning}
          </p>
        ))}
      </section>

      <section style={preparedInputSectionStyle}>
        <h2>Δεδομένα που ετοιμάζονται για τον calculator</h2>

        <p>
          <strong>Σημείωση:</strong>{' '}
          Εδώ δεν εμφανίζονται ποσά σύνταξης. Το prepare endpoint κάνει μόνο validation / normalization και δεν καλεί τον calculator.
        </p>

        <pre style={preStyle}>
          {JSON.stringify(analysis.calculationInput, null, 2)}
        </pre>
      </section>
    </>
  );
}

const previewBoxStyle = {
  border: '1px solid #cbd5e1',
  padding: '0.75rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  backgroundColor: '#f8fafc',
};

export default PreparedInputPreview;
