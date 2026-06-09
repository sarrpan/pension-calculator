import React from 'react';

import { InputWithLabel } from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleFromDateInput,
  simpleToDateInput,
  simpleInsuranceDaysInput,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
  onSimpleFromDateChange,
  onSimpleToDateChange,
  onSimpleInsuranceDaysChange,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const employmentCategoryOptions = getEmploymentCategoryOptions(simpleFundInput);

  function handleFundChange(value) {
    onSimpleFundChange(value);
    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange('');
  }

  function handleFromDateChange(value) {
    onSimpleFromDateChange(value);

    autoFillInsuranceDaysIfEmpty({
      fromDate: value,
      toDate: simpleToDateInput,
      currentInsuranceDays: simpleInsuranceDaysInput,
      onInsuranceDaysChange: onSimpleInsuranceDaysChange,
    });
  }

  function handleToDateChange(value) {
    onSimpleToDateChange(value);

    autoFillInsuranceDaysIfEmpty({
      fromDate: simpleFromDateInput,
      toDate: value,
      currentInsuranceDays: simpleInsuranceDaysInput,
      onInsuranceDaysChange: onSimpleInsuranceDaysChange,
    });
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Ασφαλιστική περίοδος</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Δηλώνουμε μία περίοδο εργασίας. Οι ημέρες συμπληρώνονται αυτόματα σαν
        πλήρης περίοδος και ο χρήστης μπορεί να τις μειώσει.
      </p>

      <label htmlFor="insurancePeriodsInputMode">
        Χρήση ασφαλιστικής περιόδου
      </label>

      <br />

      <select
        id="insurancePeriodsInputMode"
        value={insurancePeriodsInputMode}
        onChange={(event) => onInsurancePeriodsInputModeChange(event.target.value)}
        style={selectStyle}
      >
        <option value="disabled">Όχι ακόμα</option>
        <option value="simple">Ναι, μία περίοδος</option>
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

            <InputWithLabel
              id="simplePeriodFromDate"
              label="Από"
              value={simpleFromDateInput}
              onChange={handleFromDateChange}
              placeholder="π.χ. 1/1/02 ή 01/01/2002"
              width="180px"
            />

            <InputWithLabel
              id="simplePeriodToDate"
              label="Έως"
              value={simpleToDateInput}
              onChange={handleToDateChange}
              placeholder="π.χ. 31/12/25 ή 31/12/2025"
              width="180px"
            />

            <InputWithLabel
              id="simplePeriodInsuranceDays"
              label="Ημέρες / ένσημα"
              value={simpleInsuranceDaysInput}
              onChange={onSimpleInsuranceDaysChange}
              placeholder="Συμπληρώνεται αυτόματα"
              width="180px"
            />
          </div>

          <p style={{ color: '#475569', marginBottom: 0 }}>
            Οι ημερομηνίες δέχονται την ίδια μορφή με την ημερομηνία έναρξης
            σύνταξης: 1/1/26, 01/01/2026 ή 01012026.
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

function autoFillInsuranceDaysIfEmpty({
  fromDate,
  toDate,
  currentInsuranceDays,
  onInsuranceDaysChange,
}) {
  const hasUserDays = String(currentInsuranceDays || '').trim() !== '';

  if (hasUserDays) {
    return;
  }

  const calculatedDays = calculateFullInsuranceDaysBetweenDates({
    fromDate,
    toDate,
  });

  if (calculatedDays === null) {
    return;
  }

  onInsuranceDaysChange(String(calculatedDays));
}

function calculateFullInsuranceDaysBetweenDates({
  fromDate,
  toDate,
}) {
  const parsedFromDate = parseGreekDateInput(fromDate);
  const parsedToDate = parseGreekDateInput(toDate);

  if (!parsedFromDate || !parsedToDate) {
    return null;
  }

  const from = new Date(Date.UTC(
    parsedFromDate.year,
    parsedFromDate.month - 1,
    parsedFromDate.day
  ));

  const to = new Date(Date.UTC(
    parsedToDate.year,
    parsedToDate.month - 1,
    parsedToDate.day
  ));

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }

  if (to < from) {
    return null;
  }

  let totalInsuranceDays = 0;

  for (
    let year = from.getUTCFullYear();
    year <= to.getUTCFullYear();
    year += 1
  ) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31));

    const effectiveStart = from > yearStart ? from : yearStart;
    const effectiveEnd = to < yearEnd ? to : yearEnd;

    if (effectiveEnd < effectiveStart) {
      continue;
    }

    const calendarDaysInPart = calculateCalendarDaysInclusive(
      effectiveStart,
      effectiveEnd
    );

    const calendarDaysInYear = isLeapYear(year) ? 366 : 365;

    totalInsuranceDays += (calendarDaysInPart / calendarDaysInYear) * 300;
  }

  return Math.round(totalInsuranceDays);
}

function parseGreekDateInput(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return null;
  }

  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/
  );

  if (separatedDateMatch) {
    return {
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: normalizeYear(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, '');

  if (digitsOnly.length === 8) {
    return {
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: Number(digitsOnly.slice(4, 8)),
    };
  }

  if (digitsOnly.length === 6) {
    return {
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: normalizeYear(digitsOnly.slice(4, 6)),
    };
  }

  return null;
}

function normalizeYear(value) {
  const yearText = String(value || '').trim();

  if (yearText.length === 4) {
    return Number(yearText);
  }

  const twoDigitYear = Number(yearText);

  if (twoDigitYear >= 0 && twoDigitYear <= 69) {
    return 2000 + twoDigitYear;
  }

  return 1900 + twoDigitYear;
}

function calculateCalendarDaysInclusive(fromDate, toDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((toDate - fromDate) / millisecondsPerDay) + 1;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '0.75rem',
};

const selectStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '190px',
};

export default InsurancePeriodsInputSection;