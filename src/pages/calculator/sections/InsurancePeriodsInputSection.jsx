import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const employmentCategoryOptions = getEmploymentCategoryOptions(simpleFundInput);

  function handleModeChange(value) {
    onInsurancePeriodsInputModeChange(value);

    if (value === 'disabled') {
      onSimpleFundChange('');
      onSimpleInsuredTypeChange('');
      onSimpleEmploymentCategoryChange('');
    }
  }

  function handleFundChange(value) {
    onSimpleFundChange(value);
    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange('');
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Κατηγορία συνολικού χρόνου ασφάλισης</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Πρώτα δηλώνεται ο συνολικός χρόνος ασφάλισης παραπάνω, είτε με ένσημα
        είτε με έτη / μήνες / ημέρες. Εδώ δηλώνουμε σε ποιον φορέα και σε ποια
        κατηγορία ανήκει αυτός ο χρόνος.
      </p>

      <label htmlFor="insurancePeriodsInputMode">
        Ο συνολικός χρόνος ανήκει σε μία κατηγορία;
      </label>

      <br />

      <select
        id="insurancePeriodsInputMode"
        value={insurancePeriodsInputMode}
        onChange={(event) => handleModeChange(event.target.value)}
        style={selectStyle}
      >
        <option value="disabled">Όχι ακόμα</option>
        <option value="simple">Ναι, μία κατηγορία</option>
      </select>

      {insurancePeriodsInputMode === 'simple' && (
        <div style={{ marginTop: '1rem' }}>
          <div style={gridStyle}>
            <SelectWithLabel
              id="simpleFund"
              label="Φορέας / κατηγορία ασφάλισης"
              value={simpleFundInput}
              onChange={handleFundChange}
              options={FUND_OPTIONS}
            />

            <SelectWithLabel
              id="simpleInsuredType"
              label="Ασφαλισμένος"
              value={simpleInsuredTypeInput}
              onChange={onSimpleInsuredTypeChange}
              options={insuredTypeOptions}
              disabled={!simpleFundInput}
            />

            <SelectWithLabel
              id="simpleEmploymentCategory"
              label="Κατηγορία εργασίας / εισφορών"
              value={simpleEmploymentCategoryInput}
              onChange={onSimpleEmploymentCategoryChange}
              options={employmentCategoryOptions}
              disabled={!simpleFundInput}
            />
          </div>

          <p style={{ color: '#475569', marginBottom: 0 }}>
            Δεν δηλώνεται δεύτερη φορά χρόνος ασφάλισης. Όλος ο χρόνος που
            δηλώθηκε παραπάνω αποδίδεται σε αυτή την κατηγορία. Αν υπάρχουν
            περισσότερες κατηγορίες, θα προστεθεί επόμενο βήμα με ξεχωριστές
            ομάδες / περιόδους.
          </p>
        </div>
      )}
    </fieldset>
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
  width: '220px',
};

export default InsurancePeriodsInputSection;
