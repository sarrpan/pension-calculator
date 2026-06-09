import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  multiPeriodTimeInputMethod,
  multiPeriodInsuranceDaysInput,
  multiPeriodInsuranceYearsInput,
  multiPeriodInsuranceMonthsInput,
  multiPeriodInsuranceExtraDaysInput,
  multiPeriodFundInput,
  multiPeriodInsuredTypeInput,
  multiPeriodEmploymentCategoryInput,
  multiPeriod2TimeInputMethod,
  multiPeriod2InsuranceDaysInput,
  multiPeriod2InsuranceYearsInput,
  multiPeriod2InsuranceMonthsInput,
  multiPeriod2InsuranceExtraDaysInput,
  multiPeriod2FundInput,
  multiPeriod2InsuredTypeInput,
  multiPeriod2EmploymentCategoryInput,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
  onMultiPeriodTimeInputMethodChange,
  onMultiPeriodInsuranceDaysChange,
  onMultiPeriodInsuranceYearsChange,
  onMultiPeriodInsuranceMonthsChange,
  onMultiPeriodInsuranceExtraDaysChange,
  onMultiPeriodFundChange,
  onMultiPeriodInsuredTypeChange,
  onMultiPeriodEmploymentCategoryChange,
  onMultiPeriod2TimeInputMethodChange,
  onMultiPeriod2InsuranceDaysChange,
  onMultiPeriod2InsuranceYearsChange,
  onMultiPeriod2InsuranceMonthsChange,
  onMultiPeriod2InsuranceExtraDaysChange,
  onMultiPeriod2FundChange,
  onMultiPeriod2InsuredTypeChange,
  onMultiPeriod2EmploymentCategoryChange,
}) {
  const simpleInsuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const simpleEmploymentCategoryOptions = getEmploymentCategoryOptions(simpleFundInput);

  function handleModeChange(value) {
    onInsurancePeriodsInputModeChange(value);

    if (value !== 'simple') {
      onSimpleFundChange('');
      onSimpleInsuredTypeChange('');
      onSimpleEmploymentCategoryChange('');
    }

    if (value !== 'multiple') {
      clearFirstMultiPeriod();
      clearSecondMultiPeriod();
    }
  }

  function clearFirstMultiPeriod() {
    onMultiPeriodTimeInputMethodChange('');
    onMultiPeriodInsuranceDaysChange('');
    onMultiPeriodInsuranceYearsChange('');
    onMultiPeriodInsuranceMonthsChange('');
    onMultiPeriodInsuranceExtraDaysChange('');
    onMultiPeriodFundChange('');
    onMultiPeriodInsuredTypeChange('');
    onMultiPeriodEmploymentCategoryChange('');
  }

  function clearSecondMultiPeriod() {
    onMultiPeriod2TimeInputMethodChange('');
    onMultiPeriod2InsuranceDaysChange('');
    onMultiPeriod2InsuranceYearsChange('');
    onMultiPeriod2InsuranceMonthsChange('');
    onMultiPeriod2InsuranceExtraDaysChange('');
    onMultiPeriod2FundChange('');
    onMultiPeriod2InsuredTypeChange('');
    onMultiPeriod2EmploymentCategoryChange('');
  }

  function handleSimpleFundChange(value) {
    onSimpleFundChange(value);
    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange('');
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Τρόπος κατανομής χρόνου ασφάλισης</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Επιλέγουμε αν όλος ο χρόνος ασφάλισης ανήκει σε μία κατηγορία ή αν θα
        χωριστεί σε περισσότερες κατηγορίες / περιόδους.
      </p>

      <label htmlFor="insurancePeriodsInputMode">
        Πώς θα δηλωθεί ο χρόνος ασφάλισης;
      </label>

      <br />

      <select
        id="insurancePeriodsInputMode"
        value={insurancePeriodsInputMode}
        onChange={(event) => handleModeChange(event.target.value)}
        style={selectStyle}
      >
        <option value="disabled">Όχι ακόμα</option>
        <option value="simple">Μία κατηγορία ασφάλισης</option>
        <option value="multiple">Περισσότερες κατηγορίες / περίοδοι</option>
      </select>

      {insurancePeriodsInputMode === 'simple' && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>
            Κατηγορία συνολικού χρόνου ασφάλισης
          </h3>

          <div style={gridStyle}>
            <SelectWithLabel
              id="simpleFund"
              label="Φορέας / κατηγορία ασφάλισης"
              value={simpleFundInput}
              onChange={handleSimpleFundChange}
              options={FUND_OPTIONS}
            />

            <SelectWithLabel
              id="simpleInsuredType"
              label="Ασφαλισμένος"
              value={simpleInsuredTypeInput}
              onChange={onSimpleInsuredTypeChange}
              options={simpleInsuredTypeOptions}
              disabled={!simpleFundInput}
            />

            <SelectWithLabel
              id="simpleEmploymentCategory"
              label="Κατηγορία εργασίας / εισφορών"
              value={simpleEmploymentCategoryInput}
              onChange={onSimpleEmploymentCategoryChange}
              options={simpleEmploymentCategoryOptions}
              disabled={!simpleFundInput}
            />
          </div>

          <p style={{ color: '#475569', marginBottom: 0 }}>
            Ο χρόνος ασφάλισης δηλώνεται μία φορά στο πεδίο «Χρόνος ασφάλισης».
            Όλος αυτός ο χρόνος αποδίδεται στην παραπάνω κατηγορία.
          </p>
        </div>
      )}

      {insurancePeriodsInputMode === 'multiple' && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#475569' }}>
            Στην απλή εκδοχή δηλώνουμε μέχρι δύο ομάδες. Η πρώτη μπορεί να είναι
            η προηγούμενη ασφάλιση και η δεύτερη η τελευταία / κύρια ασφάλιση.
          </p>

          <InsurancePeriodGroupFields
            groupNumber={1}
            title="Περίοδος / ομάδα 1"
            timeInputMethod={multiPeriodTimeInputMethod}
            insuranceDaysInput={multiPeriodInsuranceDaysInput}
            insuranceYearsInput={multiPeriodInsuranceYearsInput}
            insuranceMonthsInput={multiPeriodInsuranceMonthsInput}
            insuranceExtraDaysInput={multiPeriodInsuranceExtraDaysInput}
            fundInput={multiPeriodFundInput}
            insuredTypeInput={multiPeriodInsuredTypeInput}
            employmentCategoryInput={multiPeriodEmploymentCategoryInput}
            onTimeInputMethodChange={onMultiPeriodTimeInputMethodChange}
            onInsuranceDaysChange={onMultiPeriodInsuranceDaysChange}
            onInsuranceYearsChange={onMultiPeriodInsuranceYearsChange}
            onInsuranceMonthsChange={onMultiPeriodInsuranceMonthsChange}
            onInsuranceExtraDaysChange={onMultiPeriodInsuranceExtraDaysChange}
            onFundChange={onMultiPeriodFundChange}
            onInsuredTypeChange={onMultiPeriodInsuredTypeChange}
            onEmploymentCategoryChange={onMultiPeriodEmploymentCategoryChange}
          />

          <InsurancePeriodGroupFields
            groupNumber={2}
            title="Περίοδος / ομάδα 2"
            timeInputMethod={multiPeriod2TimeInputMethod}
            insuranceDaysInput={multiPeriod2InsuranceDaysInput}
            insuranceYearsInput={multiPeriod2InsuranceYearsInput}
            insuranceMonthsInput={multiPeriod2InsuranceMonthsInput}
            insuranceExtraDaysInput={multiPeriod2InsuranceExtraDaysInput}
            fundInput={multiPeriod2FundInput}
            insuredTypeInput={multiPeriod2InsuredTypeInput}
            employmentCategoryInput={multiPeriod2EmploymentCategoryInput}
            onTimeInputMethodChange={onMultiPeriod2TimeInputMethodChange}
            onInsuranceDaysChange={onMultiPeriod2InsuranceDaysChange}
            onInsuranceYearsChange={onMultiPeriod2InsuranceYearsChange}
            onInsuranceMonthsChange={onMultiPeriod2InsuranceMonthsChange}
            onInsuranceExtraDaysChange={onMultiPeriod2InsuranceExtraDaysChange}
            onFundChange={onMultiPeriod2FundChange}
            onInsuredTypeChange={onMultiPeriod2InsuredTypeChange}
            onEmploymentCategoryChange={onMultiPeriod2EmploymentCategoryChange}
          />
        </div>
      )}
    </fieldset>
  );
}

function InsurancePeriodGroupFields({
  groupNumber,
  title,
  timeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  fundInput,
  insuredTypeInput,
  employmentCategoryInput,
  onTimeInputMethodChange,
  onInsuranceDaysChange,
  onInsuranceYearsChange,
  onInsuranceMonthsChange,
  onInsuranceExtraDaysChange,
  onFundChange,
  onInsuredTypeChange,
  onEmploymentCategoryChange,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(fundInput);
  const employmentCategoryOptions = getEmploymentCategoryOptions(fundInput);

  function handleTimeMethodChange(value) {
    onTimeInputMethodChange(value);
    onInsuranceDaysChange('');
    onInsuranceYearsChange('');
    onInsuranceMonthsChange('');
    onInsuranceExtraDaysChange('');
  }

  function handleFundChange(value) {
    onFundChange(value);
    onInsuredTypeChange('');
    onEmploymentCategoryChange('');
  }

  return (
    <div style={periodBoxStyle}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      <div style={gridStyle}>
        <SelectWithLabel
          id={`multiPeriod${groupNumber}TimeInputMethod`}
          label="Τρόπος εισαγωγής χρόνου"
          value={timeInputMethod}
          onChange={handleTimeMethodChange}
          options={INSURANCE_TIME_METHOD_OPTIONS}
        />

        {timeInputMethod === 'insurance_days' && (
          <TextInputWithLabel
            id={`multiPeriod${groupNumber}InsuranceDays`}
            label="Ένσημα / ημέρες ασφάλισης"
            value={insuranceDaysInput}
            onChange={onInsuranceDaysChange}
            placeholder="π.χ. 4500"
          />
        )}

        {timeInputMethod === 'years_months_days' && (
          <>
            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceYears`}
              label="Έτη"
              value={insuranceYearsInput}
              onChange={onInsuranceYearsChange}
              placeholder="π.χ. 15"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceMonths`}
              label="Μήνες"
              value={insuranceMonthsInput}
              onChange={onInsuranceMonthsChange}
              placeholder="0 έως 11"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceExtraDays`}
              label="Ημέρες"
              value={insuranceExtraDaysInput}
              onChange={onInsuranceExtraDaysChange}
              placeholder="0 έως 24"
            />
          </>
        )}

        <SelectWithLabel
          id={`multiPeriod${groupNumber}Fund`}
          label="Φορέας / κατηγορία ασφάλισης"
          value={fundInput}
          onChange={handleFundChange}
          options={FUND_OPTIONS}
        />

        <SelectWithLabel
          id={`multiPeriod${groupNumber}InsuredType`}
          label="Ασφαλισμένος"
          value={insuredTypeInput}
          onChange={onInsuredTypeChange}
          options={insuredTypeOptions}
          disabled={!fundInput}
        />

        <SelectWithLabel
          id={`multiPeriod${groupNumber}EmploymentCategory`}
          label="Κατηγορία εργασίας / εισφορών"
          value={employmentCategoryInput}
          onChange={onEmploymentCategoryChange}
          options={employmentCategoryOptions}
          disabled={!fundInput}
        />
      </div>
    </div>
  );
}

function SelectWithLabel({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>

      <br />

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInputWithLabel({
  id,
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>

      <br />

      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const FUND_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },

  {
    value: 'ika',
    label: 'ΙΚΑ / e-ΕΦΚΑ μισθωτών',
  },
  {
    value: 'public_sector',
    label: 'Δημόσιο / ΟΤΑ',
  },
  {
    value: 'uniformed',
    label: 'Ένστολοι / στρατιωτικοί',
  },
  {
    value: 'tap_dei',
    label: 'ΤΑΠ-ΔΕΗ',
  },
  {
    value: 'deko',
    label: 'ΔΕΚΟ / οργανισμοί κοινής ωφέλειας',
  },
  {
    value: 'nat',
    label: 'ΝΑΤ / ναυτικοί',
  },
  {
    value: 'aviation',
    label: 'Αεροπορικές / ΥΠΑ / χειριστές',
  },
  {
    value: 'artistic',
    label: 'Καλλιτεχνικές κατηγορίες',
  },

  {
    value: 'banking_funds',
    label: 'Τραπεζικά ταμεία / συνεταιρισμοί',
  },

  {
    value: 'oaee',
    label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας',
  },
  {
    value: 'etaa',
    label: 'Πρώην ΕΤΑΑ',
  },
  {
    value: 'tsmede',
    label: 'ΤΣΜΕΔΕ',
  },
  {
    value: 'tsay',
    label: 'ΤΣΑΥ',
  },
  {
    value: 'oga',
    label: 'Πρώην ΟΓΑ / αγρότης',
  },
];

const INSURANCE_TIME_METHOD_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'insurance_days',
    label: 'Με αριθμό ενσήμων / ημερών ασφάλισης',
  },
  {
    value: 'years_months_days',
    label: 'Με έτη, μήνες και ημέρες',
  },
];

const DEFAULT_EMPTY_OPTION = {
  value: '',
  label: 'Επιλέξτε πρώτα φορέα',
};

const SELECT_OPTION = {
  value: '',
  label: 'Επιλέξτε',
};

const OLD_NEW_INSURED_OPTIONS = [
  SELECT_OPTION,
  { value: 'old', label: 'Παλαιός' },
  { value: 'new', label: 'Νέος' },
];

const NOT_APPLICABLE_INSURED_OPTIONS = [
  SELECT_OPTION,
  { value: 'not_applicable', label: 'Δεν απαιτείται για αυτή την κατηγορία' },
];

const SIMPLE_VAE_YVAE_OPTIONS = [
  SELECT_OPTION,
  { value: 'common', label: 'Απλή / κοινή ασφάλιση' },
  { value: 'vae', label: 'ΒΑΕ' },
  { value: 'yvae', label: 'ΥΒΑΕ / ειδικού κινδύνου' },
];

const BANKING_EMPLOYMENT_OPTIONS = [
  SELECT_OPTION,
  { value: 'common', label: 'Απλή / διοικητική ασφάλιση' },
];

const CONTRIBUTION_BASED_OPTIONS = [
  SELECT_OPTION,
  { value: 'contributions', label: 'Με εισφορές / ασφαλιστική κατηγορία' },
];

function getInsuredTypeOptions(fund) {
  if (!fund) {
    return [DEFAULT_EMPTY_OPTION];
  }

  if (
    fund === 'oaee' ||
    fund === 'etaa' ||
    fund === 'tsmede' ||
    fund === 'tsay' ||
    fund === 'oga'
  ) {
    return NOT_APPLICABLE_INSURED_OPTIONS;
  }

  return OLD_NEW_INSURED_OPTIONS;
}

function getEmploymentCategoryOptions(fund) {
  if (!fund) {
    return [DEFAULT_EMPTY_OPTION];
  }

  if (
    fund === 'ika' ||
    fund === 'public_sector' ||
    fund === 'uniformed' ||
    fund === 'tap_dei' ||
    fund === 'deko' ||
    fund === 'nat' ||
    fund === 'aviation' ||
    fund === 'artistic'
  ) {
    return SIMPLE_VAE_YVAE_OPTIONS;
  }

  if (fund === 'banking_funds') {
    return BANKING_EMPLOYMENT_OPTIONS;
  }

  if (
    fund === 'oaee' ||
    fund === 'etaa' ||
    fund === 'tsmede' ||
    fund === 'tsay' ||
    fund === 'oga'
  ) {
    return CONTRIBUTION_BASED_OPTIONS;
  }

  return [SELECT_OPTION];
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '0.75rem',
};

const selectStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '260px',
};

const inputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '220px',
};

const periodBoxStyle = {
  marginTop: '1rem',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  padding: '0.75rem',
};

export default InsurancePeriodsInputSection;
