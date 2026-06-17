import React from 'react';

import {
  InputWithLabel,
  RadioOption,
} from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

const CONTRIBUTION_BASED_FUNDS = [
  'oaee',
  'etaa',
  'tsmede',
  'tsay',
  'oga',
];

const FUND_LABELS = {
  oaee: 'ΟΑΕΕ',
  etaa: 'ΕΤΑΑ',
  tsmede: 'ΤΣΜΕΔΕ',
  tsay: 'ΤΣΑΥ',
  oga: 'πρώην ΟΓΑ',
};

const NON_SALARIED_MODE_LABELS = {
  annual_pensionable_earnings:
    'Ετήσιο ασφαλιστέο / συντάξιμο εισόδημα',
  annual_pension_contribution:
    'Ετήσια εισφορά κύριας σύνταξης',
};

function ContributoryPensionInputSection({
  currentFormStep,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
  yearlyEarningsRows,
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleNonSalariedEarningsInputMode,
  simpleFromDateInput,
  simpleToDateInput,
  insurancePeriodGroups,
  onContributoryEarningsInputMethodChange,
  onAverageMonthlyPensionableEarningsChange,
  onYearlyEarningsRowChange,
  onLoadDevelopmentYearlyEarnings,
}) {
  const yearlyInputContext = buildYearlyInputContext({
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleNonSalariedEarningsInputMode,
    simpleFromDateInput,
    simpleToDateInput,
    insurancePeriodGroups,
  });

  if (currentFormStep === 'contributory_yearly') {
    return (
      <fieldset style={fieldsetStyle}>
        <legend>
          {yearlyInputContext.isActive
            ? 'Ετήσια στοιχεία ασφαλιστικών περιόδων'
            : 'Αποδοχές και ένσημα ανά έτος'}
        </legend>

        <p style={{ marginTop: 0 }}>
          {yearlyInputContext.isActive
            ? 'Συμπληρώστε για κάθε έτος το ποσό που αντιστοιχεί στον τρόπο εισαγωγής της ασφαλιστικής περιόδου και τις ημέρες ασφάλισης. Το backend θα καλέσει τη σωστή ρουτίνα ΟΑΕΕ / ΕΤΑΑ / ΟΓΑ και θα δημιουργήσει τις ετήσιες συντάξιμες αποδοχές.'
            : 'Συμπληρώστε τις ετήσιες αποδοχές και τα ένσημα / ημέρες ασφάλισης ανά έτος. Ο μέσος μηνιαίος συντάξιμος μισθός δεν υπολογίζεται εδώ. Θα υπολογιστεί αργότερα από τον calculator με τους ΔΤΚ.'}
        </p>

        {onLoadDevelopmentYearlyEarnings && (
          <button
            type="button"
            onClick={onLoadDevelopmentYearlyEarnings}
            style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem' }}
          >
            Φόρτωση ετήσιων ποσών δοκιμής
          </button>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Έτος</th>
                <th style={tableHeaderStyle}>
                  {yearlyInputContext.amountColumnLabel}
                </th>
                <th style={tableHeaderStyle}>Ένσημα / ημέρες</th>
              </tr>
            </thead>

            <tbody>
              {yearlyEarningsRows.map((row, index) => {
                const rowMeaning = resolveRowMeaning({
                  year: row.year,
                  context: yearlyInputContext,
                });

                return (
                  <tr key={row.id || row.year || index}>
                    <td style={tableCellStyle}>
                      <input
                        type="text"
                        value={row.year}
                        onChange={(event) => {
                          onYearlyEarningsRowChange(
                            index,
                            'year',
                            event.target.value
                          );
                        }}
                        style={yearInputStyle}
                      />
                    </td>

                    <td style={tableCellStyle}>
                      <input
                        type="text"
                        value={row.annualEarnings}
                        onChange={(event) => {
                          onYearlyEarningsRowChange(
                            index,
                            'annualEarnings',
                            event.target.value
                          );
                        }}
                        placeholder="π.χ. 18000,50"
                        style={moneyInputStyle}
                      />

                      {rowMeaning && (
                        <div style={rowMeaningStyle}>{rowMeaning}</div>
                      )}
                    </td>

                    <td style={tableCellStyle}>
                      <input
                        type="text"
                        value={row.insuranceDays}
                        onChange={(event) => {
                          onYearlyEarningsRowChange(
                            index,
                            'insuranceDays',
                            event.target.value
                          );
                        }}
                        placeholder="π.χ. 300"
                        style={daysInputStyle}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </fieldset>
    );
  }

  if (yearlyInputContext.isActive) {
    return (
      <fieldset style={fieldsetStyle}>
        <legend>Στοιχεία ανταποδοτικής σύνταξης</legend>

        <p style={{ marginTop: 0 }}>
          Για τις μη μισθωτές περιόδους ο τρόπος εισαγωγής έχει ήδη επιλεγεί
          μέσα σε κάθε ασφαλιστική περίοδο.
        </p>

        <p style={{ color: '#8a5a00', marginBottom: 0 }}>
          Με την προετοιμασία θα ανοίξει ο ετήσιος πίνακας. Για κάθε έτος θα
          δηλώσετε το αντίστοιχο ασφαλιστέο / συντάξιμο εισόδημα ή την εισφορά
          κύριας σύνταξης και τις ημέρες ασφάλισης.
        </p>
      </fieldset>
    );
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Στοιχεία ανταποδοτικής σύνταξης</legend>

      <p style={{ marginTop: 0 }}>
        Πώς θέλετε να εισάγετε τις συντάξιμες αποδοχές;
      </p>

      <RadioOption
        id="contributoryAverageMonthly"
        name="contributoryEarningsInputMethod"
        value="average_monthly"
        checked={contributoryEarningsInputMethod === 'average_monthly'}
        onChange={onContributoryEarningsInputMethodChange}
        label="Έχω έτοιμο μέσο μηνιαίο συντάξιμο μισθό"
      />

      <RadioOption
        id="contributoryYearlyEarnings"
        name="contributoryEarningsInputMethod"
        value="yearly_earnings"
        checked={contributoryEarningsInputMethod === 'yearly_earnings'}
        onChange={onContributoryEarningsInputMethodChange}
        label="Θέλω να εισάγω αποδοχές και ένσημα ανά έτος"
      />

      {contributoryEarningsInputMethod === 'average_monthly' && (
        <div style={{ marginTop: '1rem' }}>
          <InputWithLabel
            id="averageMonthlyPensionableEarnings"
            label="Μέσος μηνιαίος συντάξιμος μισθός"
            value={averageMonthlyPensionableEarningsInput}
            onChange={onAverageMonthlyPensionableEarningsChange}
            placeholder="π.χ. 1450,75"
            width="180px"
          />
        </div>
      )}

      {contributoryEarningsInputMethod === 'yearly_earnings' && (
        <p style={{ color: '#8a5a00' }}>
          Με την επιλογή αυτή, μετά τα βασικά στοιχεία θα ανοίξει επόμενη φόρμα
          για αποδοχές και ένσημα ανά έτος.
        </p>
      )}
    </fieldset>
  );
}

function buildYearlyInputContext({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleNonSalariedEarningsInputMode,
  simpleFromDateInput,
  simpleToDateInput,
  insurancePeriodGroups,
}) {
  const periods = [];

  if (insurancePeriodsInputMode === 'simple') {
    periods.push({
      fund: simpleFundInput,
      inputMode: simpleNonSalariedEarningsInputMode,
      fromYear: parseDisplayOrIsoYear(simpleFromDateInput),
      toYear: parseDisplayOrIsoYear(simpleToDateInput),
    });
  }

  if (
    insurancePeriodsInputMode === 'multiple' &&
    Array.isArray(insurancePeriodGroups)
  ) {
    for (const group of insurancePeriodGroups) {
      periods.push({
        fund: group?.fund || '',
        inputMode: group?.nonSalariedEarningsInputMode || '',
        fromYear: parseDisplayOrIsoYear(group?.fromDate),
        toYear: parseDisplayOrIsoYear(group?.toDate),
      });
    }
  }

  const nonSalariedPeriods = periods.filter((period) => {
    return CONTRIBUTION_BASED_FUNDS.includes(period.fund);
  });
  const modeSet = new Set(
    nonSalariedPeriods.map((period) => period.inputMode).filter(Boolean)
  );

  let amountColumnLabel = 'Ετήσιες αποδοχές';

  if (nonSalariedPeriods.length > 0 && modeSet.size === 1) {
    const [singleMode] = Array.from(modeSet);
    amountColumnLabel =
      NON_SALARIED_MODE_LABELS[singleMode] || 'Ετήσιο ποσό';
  } else if (nonSalariedPeriods.length > 0) {
    amountColumnLabel = 'Ετήσιο ποσό σύμφωνα με την περίοδο';
  }

  return {
    isActive: nonSalariedPeriods.length > 0,
    periods,
    amountColumnLabel,
  };
}

function resolveRowMeaning({ year, context }) {
  if (!context.isActive) {
    return null;
  }

  const numericYear = Number(year);

  if (!Number.isInteger(numericYear)) {
    return null;
  }

  const matchingPeriods = context.periods.filter((period) => {
    return (
      period.fromYear !== null &&
      period.toYear !== null &&
      numericYear >= period.fromYear &&
      numericYear <= period.toYear
    );
  });

  if (matchingPeriods.length !== 1) {
    return null;
  }

  const period = matchingPeriods[0];

  if (!CONTRIBUTION_BASED_FUNDS.includes(period.fund)) {
    return 'Ετήσιες αποδοχές μισθωτής περιόδου';
  }

  const modeLabel = NON_SALARIED_MODE_LABELS[period.inputMode];
  const fundLabel = FUND_LABELS[period.fund] || period.fund;

  if (!modeLabel) {
    return null;
  }

  return `${modeLabel} — ${fundLabel}`;
}

function parseDisplayOrIsoYear(value) {
  const text = String(value || '').trim();
  const isoMatch = /^(\d{4})-\d{2}-\d{2}$/.exec(text);

  if (isoMatch) {
    return Number(isoMatch[1]);
  }

  const displayMatch = /^\d{2}\/\d{2}\/(\d{4})$/.exec(text);

  if (displayMatch) {
    return Number(displayMatch[1]);
  }

  return null;
}

const tableHeaderStyle = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '0.5rem',
};

const tableCellStyle = {
  borderBottom: '1px solid #eee',
  padding: '0.5rem',
  verticalAlign: 'top',
};

const yearInputStyle = {
  width: '80px',
  padding: '0.4rem',
};

const moneyInputStyle = {
  width: '180px',
  padding: '0.4rem',
};

const daysInputStyle = {
  width: '120px',
  padding: '0.4rem',
};

const rowMeaningStyle = {
  marginTop: '0.35rem',
  color: '#475569',
  fontSize: '0.85rem',
};

export default ContributoryPensionInputSection;
