import React from 'react';

import {
  InputWithLabel,
  RadioOption,
} from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

function InsuranceTimeInputSection({
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  onInsuranceTimeInputMethodChange,
  onInsuranceDaysChange,
  onInsuranceYearsChange,
  onInsuranceMonthsChange,
  onInsuranceExtraDaysChange,
}) {
  return (
    <fieldset style={fieldsetStyle}>
      <legend>Χρόνος ασφάλισης</legend>

      <p style={{ marginTop: 0 }}>
        Πώς θέλετε να δηλώσετε τον χρόνο ασφάλισης;
      </p>

      <RadioOption
        id="insuranceTimeMethodDays"
        name="insuranceTimeInputMethod"
        value="insurance_days"
        checked={insuranceTimeInputMethod === 'insurance_days'}
        onChange={onInsuranceTimeInputMethodChange}
        label="Με αριθμό ενσήμων / ημερών ασφάλισης"
      />

      <RadioOption
        id="insuranceTimeMethodYearsMonthsDays"
        name="insuranceTimeInputMethod"
        value="years_months_days"
        checked={insuranceTimeInputMethod === 'years_months_days'}
        onChange={onInsuranceTimeInputMethodChange}
        label="Με έτη, μήνες και ημέρες"
      />

      {insuranceTimeInputMethod === 'insurance_days' && (
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="insuranceDays">
            Αριθμός ενσήμων / ημερών ασφάλισης
          </label>

          <br />

          <input
            id="insuranceDays"
            type="text"
            value={insuranceDaysInput}
            onChange={(event) => onInsuranceDaysChange(event.target.value)}
            placeholder="π.χ. 10225"
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              width: '160px',
            }}
          />
        </div>
      )}

      {insuranceTimeInputMethod === 'years_months_days' && (
        <div style={{ marginTop: '1rem' }}>
          <InputWithLabel
            id="insuranceYears"
            label="Έτη"
            value={insuranceYearsInput}
            onChange={onInsuranceYearsChange}
            placeholder="π.χ. 35"
            width="100px"
          />

          <InputWithLabel
            id="insuranceMonths"
            label="Μήνες"
            value={insuranceMonthsInput}
            onChange={onInsuranceMonthsChange}
            placeholder="0-11"
            width="100px"
          />

          <InputWithLabel
            id="insuranceExtraDays"
            label="Ημέρες"
            value={insuranceExtraDaysInput}
            onChange={onInsuranceExtraDaysChange}
            placeholder="0-24"
            width="100px"
          />
        </div>
      )}
    </fieldset>
  );
}

export default InsuranceTimeInputSection;
