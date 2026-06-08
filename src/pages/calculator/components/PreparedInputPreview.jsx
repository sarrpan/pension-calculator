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
          <strong>Χρόνος ασφάλισης:</strong>{' '}
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

        {analysis.isSpecialDiseaseOldAgeCase && (
          <p style={{ color: '#8a5a00' }}>
            Η εφαρμογή θα στείλει ειδική ένδειξη ότι πρόκειται για γήρας λόγω ειδικών παθήσεων. Ο calculator αργότερα πρέπει να εφαρμόσει τον ειδικό κανόνα χωρίς μείωση 1/40 λόγω 40ετίας.
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
          Εδώ δεν εμφανίζονται πλέον συντελεστές ή ποσά εθνικής σύνταξης. Αυτά πρέπει να τα υπολογίσει ο calculator.
        </p>

        <pre style={preStyle}>
          {JSON.stringify(analysis.calculationInput, null, 2)}
        </pre>
      </section>
    </>
  );
}


export default PreparedInputPreview;
