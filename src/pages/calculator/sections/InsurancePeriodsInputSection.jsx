import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  insurancePeriodGroups,
  maxInsurancePeriodGroups = 10,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
  onInsurancePeriodGroupChange,
  onAddInsurancePeriodGroup,
  onRemoveInsurancePeriodGroup,
}) {
  const simpleInsuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const simpleEmploymentCategoryOptions = getEmploymentCategoryOptions(simpleFundInput);
  const safeInsurancePeriodGroups =
    Array.isArray(insurancePeriodGroups) && insurancePeriodGroups.length > 0
      ? insurancePeriodGroups
      : [];

  function handleModeChange(value) {
    onInsurancePeriodsInputModeChange(value);
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
            Στο πλήρες μοντέλο δηλώνουμε όσες ομάδες / περιόδους χρειάζονται,
            μέχρι {maxInsurancePeriodGroups}. Οι ημέρες όλων των ομάδων
            αθροίζονται για τον συνολικό χρόνο ασφάλισης.
          </p>

          {safeInsurancePeriodGroups.map((group, index) => (
            <InsurancePeriodGroupFields
              key={group.id}
              groupNumber={index + 1}
              title={`Περίοδος / ομάδα ${index + 1}`}
              group={group}
              canRemove={safeInsurancePeriodGroups.length > 1}
              onGroupChange={(field, value) => {
                onInsurancePeriodGroupChange(group.id, field, value);
              }}
              onRemove={() => {
                onRemoveInsurancePeriodGroup(group.id);
              }}
            />
          ))}

          <button
            type="button"
            onClick={onAddInsurancePeriodGroup}
            disabled={safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups}
            style={{
              ...secondaryButtonStyle,
              cursor:
                safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            + Προσθήκη περιόδου / ομάδας
          </button>

          {safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups && (
            <p style={{ color: '#8a5a00', marginBottom: 0 }}>
              Έχει συμπληρωθεί το μέγιστο όριο των {maxInsurancePeriodGroups} ομάδων.
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}

function InsurancePeriodGroupFields({
  groupNumber,
  title,
  group,
  canRemove,
  onGroupChange,
  onRemove,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(group.fund);
  const employmentCategoryOptions = getEmploymentCategoryOptions(group.fund);

  function handleTimeMethodChange(value) {
    onGroupChange('timeInputMethod', value);
  }

  function handleFundChange(value) {
    onGroupChange('fund', value);
  }

  return (
    <div style={periodBoxStyle}>
      <div style={periodHeaderStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>{title}</h3>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={removeButtonStyle}
          >
            Αφαίρεση
          </button>
        )}
      </div>

      <div style={gridStyle}>
        <SelectWithLabel
          id={`multiPeriod${groupNumber}TimeInputMethod`}
          label="Τρόπος εισαγωγής χρόνου"
          value={group.timeInputMethod}
          onChange={handleTimeMethodChange}
          options={INSURANCE_TIME_METHOD_OPTIONS}
        />

        {group.timeInputMethod === 'insurance_days' && (
          <TextInputWithLabel
            id={`multiPeriod${groupNumber}InsuranceDays`}
            label="Ένσημα / ημέρες ασφάλισης"
            value={group.insuranceDays}
            onChange={(value) => onGroupChange('insuranceDays', value)}
            placeholder="π.χ. 4500"
          />
        )}

        {group.timeInputMethod === 'years_months_days' && (
          <>
            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceYears`}
              label="Έτη"
              value={group.insuranceYears}
              onChange={(value) => onGroupChange('insuranceYears', value)}
              placeholder="π.χ. 15"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceMonths`}
              label="Μήνες"
              value={group.insuranceMonths}
              onChange={(value) => onGroupChange('insuranceMonths', value)}
              placeholder="0 έως 11"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceExtraDays`}
              label="Ημέρες"
              value={group.insuranceExtraDays}
              onChange={(value) => onGroupChange('insuranceExtraDays', value)}
              placeholder="0 έως 24"
            />
          </>
        )}

        <SelectWithLabel
          id={`multiPeriod${groupNumber}Fund`}
          label="Φορέας / κατηγορία ασφάλισης"
          value={group.fund}
          onChange={handleFundChange}
          options={FUND_OPTIONS}
        />

        <SelectWithLabel
          id={`multiPeriod${groupNumber}InsuredType`}
          label="Ασφαλισμένος"
          value={group.insuredType}
          onChange={(value) => onGroupChange('insuredType', value)}
          options={insuredTypeOptions}
          disabled={!group.fund}
        />

        <SelectWithLabel
          id={`multiPeriod${groupNumber}EmploymentCategory`}
          label="Κατηγορία εργασίας / εισφορών"
          value={group.employmentCategory}
          onChange={(value) => onGroupChange('employmentCategory', value)}
          options={employmentCategoryOptions}
          disabled={!group.fund}
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

const periodHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '0.75rem',
};

const secondaryButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 0.75rem',
};

const removeButtonStyle = {
  padding: '0.35rem 0.6rem',
};

export default InsurancePeriodsInputSection;
