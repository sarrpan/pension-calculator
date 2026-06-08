import React from 'react';

import {
  InputWithLabel,
  RadioOption,
} from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

function ContributoryPensionInputSection({
  currentFormStep,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
  yearlyEarningsRows,
  onContributoryEarningsInputMethodChange,
  onAverageMonthlyPensionableEarningsChange,
  onYearlyEarningsRowChange,
  onLoadDevelopmentYearlyEarnings,
}) {
  if (currentFormStep === 'contributory_yearly') {
    return (
      <fieldset style={fieldsetStyle}>
        <legend>Αποδοχές και ένσημα ανά έτος</legend>

        <p style={{ marginTop: 0 }}>
          Συμπληρώστε τις ετήσιες αποδοχές και τα ένσημα / ημέρες ασφάλισης ανά έτος. Ο μέσος μηνιαίος συντάξιμος μισθός δεν υπολογίζεται εδώ. Θα υπολογιστεί αργότερα από τον calculator με τους ΔΤΚ.
        </p>

        {onLoadDevelopmentYearlyEarnings && (
          <button
            type="button"
            onClick={onLoadDevelopmentYearlyEarnings}
            style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem' }}
          >
            Φόρτωση δοκιμαστικών αποδοχών
          </button>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Έτος</th>
                <th style={tableHeaderStyle}>Ετήσιες αποδοχές</th>
                <th style={tableHeaderStyle}>Ένσημα / ημέρες</th>
              </tr>
            </thead>

            <tbody>
              {yearlyEarningsRows.map((row, index) => (
                <tr key={row.id || row.year || index}>
                  <td style={tableCellStyle}>
                    <input
                      type="text"
                      value={row.year}
                      onChange={(event) => {
                        onYearlyEarningsRowChange(index, 'year', event.target.value);
                      }}
                      style={yearInputStyle}
                    />
                  </td>

                  <td style={tableCellStyle}>
                    <input
                      type="text"
                      value={row.annualEarnings}
                      onChange={(event) => {
                        onYearlyEarningsRowChange(index, 'annualEarnings', event.target.value);
                      }}
                      placeholder="π.χ. 18000,50"
                      style={moneyInputStyle}
                    />
                  </td>

                  <td style={tableCellStyle}>
                    <input
                      type="text"
                      value={row.insuranceDays}
                      onChange={(event) => {
                        onYearlyEarningsRowChange(index, 'insuranceDays', event.target.value);
                      }}
                      placeholder="π.χ. 300"
                      style={daysInputStyle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          Με την επιλογή αυτή, μετά τα βασικά στοιχεία θα ανοίξει επόμενη φόρμα για αποδοχές και ένσημα ανά έτος.
        </p>
      )}
    </fieldset>
  );
}

const tableHeaderStyle = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '0.5rem',
};

const tableCellStyle = {
  borderBottom: '1px solid #eee',
  padding: '0.5rem',
};

const yearInputStyle = {
  width: '80px',
  padding: '0.4rem',
};

const moneyInputStyle = {
  width: '150px',
  padding: '0.4rem',
};

const daysInputStyle = {
  width: '120px',
  padding: '0.4rem',
};

export default ContributoryPensionInputSection;
