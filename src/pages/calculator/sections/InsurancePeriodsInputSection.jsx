import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleUniformedSpecialTimeDraft,
  insurancePeriodGroups,
  maxInsurancePeriodGroups = 10,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
  onSimpleUniformedSpecialTimeDraftChange,
  onInsurancePeriodGroupChange,
  onAddInsurancePeriodGroup,
  onRemoveInsurancePeriodGroup,
}) {
  const simpleInsuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const simpleEmploymentCategoryOptions = getEmploymentCategoryOptions(simpleFundInput);
  const isSimpleUniformedFund = isUniformedFund(simpleFundInput);
  const isSimpleContributionBasedFund = isContributionBasedFund(simpleFundInput);

  const safeInsurancePeriodGroups =
    Array.isArray(insurancePeriodGroups) && insurancePeriodGroups.length > 0
      ? insurancePeriodGroups
      : [];

  function handleModeChange(value) {
    onInsurancePeriodsInputModeChange(value);
  }

  function handleSimpleFundChange(value) {
    onSimpleFundChange(value);

    if (isContributionBasedFund(value)) {
      onSimpleInsuredTypeChange('not_applicable');
      onSimpleEmploymentCategoryChange('contributions');
      onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
      return;
    }

    if (isUniformedFund(value)) {
      onSimpleInsuredTypeChange('');
      onSimpleEmploymentCategoryChange('common');
      onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange('');
    onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
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

            {!isSimpleContributionBasedFund && (
              <SelectWithLabel
                id="simpleInsuredType"
                label="Ασφαλισμένος"
                value={simpleInsuredTypeInput}
                onChange={onSimpleInsuredTypeChange}
                options={simpleInsuredTypeOptions}
                disabled={!simpleFundInput}
              />
            )}

            {!isSimpleUniformedFund && !isSimpleContributionBasedFund && (
              <SelectWithLabel
                id="simpleEmploymentCategory"
                label="Κατηγορία εργασίας / εισφορών"
                value={simpleEmploymentCategoryInput}
                onChange={onSimpleEmploymentCategoryChange}
                options={simpleEmploymentCategoryOptions}
                disabled={!simpleFundInput}
              />
            )}
          </div>

          {isSimpleUniformedFund && (
            <UniformedSpecialTimeFields
              idPrefix="simpleUniformed"
              value={simpleUniformedSpecialTimeDraft}
              onChange={onSimpleUniformedSpecialTimeDraftChange}
            />
          )}

          <p style={{ color: '#475569', marginBottom: 0 }}>
            Ο χρόνος ασφάλισης δηλώνεται μία φορά στο πεδίο «Χρόνος ασφάλισης».
            Όλος αυτός ο χρόνος αποδίδεται στην παραπάνω κατηγορία.
          </p>
        </div>
      )}

      {insurancePeriodsInputMode === 'multiple' && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#475569' }}>
            Στο πλήρες μοντέλο δηλώνουμε όσες ομάδες / περίοδοι χρειάζονται,
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
  const isCurrentUniformedFund = isUniformedFund(group.fund);
  const isCurrentContributionBasedFund = isContributionBasedFund(group.fund);

  function handleFundChange(value) {
    onGroupChange('fund', value);

    if (isContributionBasedFund(value)) {
      onGroupChange('insuredType', 'not_applicable');
      onGroupChange('employmentCategory', 'contributions');
      onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
      return;
    }

    if (isUniformedFund(value)) {
      onGroupChange('insuredType', '');
      onGroupChange('employmentCategory', 'common');
      onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onGroupChange('insuredType', '');
    onGroupChange('employmentCategory', '');
    onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
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
          id={`multiPeriod${groupNumber}Fund`}
          label="Φορέας / κατηγορία ασφάλισης"
          value={group.fund}
          onChange={handleFundChange}
          options={FUND_OPTIONS}
        />

        {!isCurrentContributionBasedFund && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}InsuredType`}
            label="Ασφαλισμένος"
            value={group.insuredType}
            onChange={(value) => onGroupChange('insuredType', value)}
            options={insuredTypeOptions}
            disabled={!group.fund}
          />
        )}

        {!isCurrentUniformedFund && !isCurrentContributionBasedFund && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}EmploymentCategory`}
            label="Κατηγορία εργασίας / εισφορών"
            value={group.employmentCategory}
            onChange={(value) => onGroupChange('employmentCategory', value)}
            options={employmentCategoryOptions}
            disabled={!group.fund}
          />
        )}

        <SelectWithLabel
          id={`multiPeriod${groupNumber}TimeInputMethod`}
          label="Τρόπος εισαγωγής χρόνου"
          value={group.timeInputMethod}
          onChange={(value) => onGroupChange('timeInputMethod', value)}
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
      </div>

      {isCurrentUniformedFund && (
        <UniformedSpecialTimeFields
          idPrefix={`multiPeriod${groupNumber}Uniformed`}
          value={group.uniformedSpecialTimeDraft}
          onChange={(nextValue) => {
            onGroupChange('uniformedSpecialTimeDraft', nextValue);
          }}
        />
      )}
    </div>
  );
}

function UniformedSpecialTimeFields({
  idPrefix,
  value,
  onChange,
}) {
  const safeValue = normalizeUniformedSpecialTimeDraft(value);

  function updateCombatFiveYearService(field, fieldValue) {
    const nextCombatFiveYearService = {
      ...safeValue.combatFiveYearService,
      [field]: fieldValue,
    };

    if (field === 'recognitionPeriod' && fieldValue === 'before_2002') {
      nextCombatFiveYearService.paidAmount = '0';
    }

    onChange({
      ...safeValue,
      combatFiveYearService: nextCombatFiveYearService,
    });
  }

  function updateSpecialSemesters(field, fieldValue) {
    const nextSpecialSemesters = {
      ...safeValue.specialSemesters,
      [field]: fieldValue,
    };

    if (field === 'recognitionPeriod' && fieldValue === 'before_2002') {
      nextSpecialSemesters.paidAmount = '0';
    }

    onChange({
      ...safeValue,
      specialSemesters: nextSpecialSemesters,
    });
  }

  const combatStatus = safeValue.combatFiveYearService.status;
  const semestersStatus = safeValue.specialSemesters.status;
  const hasCombatFiveYearService = combatStatus !== 'none';
  const hasSpecialSemesters = semestersStatus === 'yes';
  const shouldAskCombatPaidAmount =
    hasCombatFiveYearService &&
    safeValue.combatFiveYearService.recognitionPeriod &&
    safeValue.combatFiveYearService.recognitionPeriod !== 'before_2002';
  const shouldAskSemestersPaidAmount =
    hasSpecialSemesters &&
    safeValue.specialSemesters.recognitionPeriod &&
    safeValue.specialSemesters.recognitionPeriod !== 'before_2002';
  const validationError = getUniformedSpecialTimeValidationError(safeValue);

  return (
    <div style={uniformedBoxStyle}>
      <h4 style={{ marginTop: 0 }}>
        Ειδικοί χρόνοι ενστόλων
      </h4>

      {validationError && (
        <p style={{ color: 'crimson', marginTop: 0 }}>
          {validationError}
        </p>
      )}

      <div style={uniformedSubBoxStyle}>
        <h5 style={{ marginTop: 0 }}>
          Μάχιμη πενταετία / διπλός χρόνος
        </h5>

        <div style={gridStyle}>
          <SelectWithLabel
            id={`${idPrefix}CombatFiveYearServiceStatus`}
            label="Υπάρχει μάχιμη πενταετία;"
            value={combatStatus}
            onChange={(fieldValue) => updateCombatFiveYearService('status', fieldValue)}
            options={COMBAT_FIVE_YEAR_STATUS_OPTIONS}
          />

          {combatStatus === 'partial' && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceYears`}
                label="Έτη"
                value={safeValue.combatFiveYearService.years}
                onChange={(fieldValue) => updateCombatFiveYearService('years', fieldValue)}
                placeholder="0 έως 5"
                required
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceMonths`}
                label="Μήνες"
                value={safeValue.combatFiveYearService.months}
                onChange={(fieldValue) => updateCombatFiveYearService('months', fieldValue)}
                placeholder="0 έως 11"
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceDays`}
                label="Ημέρες"
                value={safeValue.combatFiveYearService.days}
                onChange={(fieldValue) => updateCombatFiveYearService('days', fieldValue)}
                placeholder="0 έως 24"
              />
            </>
          )}

          {hasCombatFiveYearService && (
            <>
              <SelectWithLabel
                id={`${idPrefix}CombatFiveYearServiceRecognitionPeriod`}
                label="Πότε αναγνωρίστηκε / εξαγοράστηκε;"
                value={safeValue.combatFiveYearService.recognitionPeriod}
                onChange={(fieldValue) => updateCombatFiveYearService('recognitionPeriod', fieldValue)}
                options={RECOGNITION_PERIOD_OPTIONS}
                required
              />

              {shouldAskCombatPaidAmount && (
                <TextInputWithLabel
                  id={`${idPrefix}CombatFiveYearServicePaidAmount`}
                  label="Ποσό που πληρώθηκε"
                  value={safeValue.combatFiveYearService.paidAmount}
                  onChange={(fieldValue) => updateCombatFiveYearService('paidAmount', fieldValue)}
                  placeholder="π.χ. 3000"
                  required
                />
              )}
            </>
          )}
        </div>
      </div>

      <div style={uniformedSubBoxStyle}>
        <h5 style={{ marginTop: 0 }}>
          Εξάμηνα
        </h5>

        <div style={gridStyle}>
          <SelectWithLabel
            id={`${idPrefix}SpecialSemestersStatus`}
            label="Υπάρχουν εξάμηνα;"
            value={semestersStatus}
            onChange={(fieldValue) => updateSpecialSemesters('status', fieldValue)}
            options={SPECIAL_SEMESTERS_STATUS_OPTIONS}
          />

          {hasSpecialSemesters && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}SpecialSemestersCount`}
                label="Πλήθος εξαμήνων"
                value={safeValue.specialSemesters.semestersCount}
                onChange={(fieldValue) => updateSpecialSemesters('semestersCount', fieldValue)}
                placeholder="π.χ. 4, έως 14"
                required
              />

              <SelectWithLabel
                id={`${idPrefix}SpecialSemestersRecognitionPeriod`}
                label="Πότε αναγνωρίστηκαν / εξαγοράστηκαν;"
                value={safeValue.specialSemesters.recognitionPeriod}
                onChange={(fieldValue) => updateSpecialSemesters('recognitionPeriod', fieldValue)}
                options={RECOGNITION_PERIOD_OPTIONS}
                required
              />

              {shouldAskSemestersPaidAmount && (
                <TextInputWithLabel
                  id={`${idPrefix}SpecialSemestersPaidAmount`}
                  label="Ποσό που πληρώθηκε"
                  value={safeValue.specialSemesters.paidAmount}
                  onChange={(fieldValue) => updateSpecialSemesters('paidAmount', fieldValue)}
                  placeholder="π.χ. 1200"
                  required
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function getUniformedSpecialTimeValidationError(value) {
  const normalizedValue = normalizeUniformedSpecialTimeDraft(value);
  const combatFiveYearService = normalizedValue.combatFiveYearService;
  const specialSemesters = normalizedValue.specialSemesters;

  const combatDaysResult = getCombatFiveYearServiceDays(combatFiveYearService);

  if (combatDaysResult.error) {
    return combatDaysResult.error;
  }

  const semestersDaysResult = getSpecialSemestersDays(specialSemesters);

  if (semestersDaysResult.error) {
    return semestersDaysResult.error;
  }

  const maxCombinedDays = 7 * 300;
  const totalSpecialDays = combatDaysResult.days + semestersDaysResult.days;

  if (totalSpecialDays > maxCombinedDays) {
    return 'Η μάχιμη πενταετία μαζί με τα εξάμηνα δεν μπορεί να ξεπερνά συνολικά τα 7 έτη.';
  }

  return null;
}

function getCombatFiveYearServiceDays(combatFiveYearService = {}) {
  const status = combatFiveYearService.status || 'none';

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status === 'full') {
    return {
      days: 5 * 300,
      error: null,
    };
  }

  if (status !== 'partial') {
    return {
      days: 0,
      error: 'Η επιλογή μάχιμης πενταετίας δεν είναι έγκυρη.',
    };
  }

  const years = parseNonNegativeIntegerOrEmpty(combatFiveYearService.years);
  const months = parseNonNegativeIntegerOrEmpty(combatFiveYearService.months);
  const days = parseNonNegativeIntegerOrEmpty(combatFiveYearService.days);

  if (!years.isValid || !months.isValid || !days.isValid) {
    return {
      days: 0,
      error: 'Ο μερικός χρόνος μάχιμης πενταετίας πρέπει να δηλωθεί με ακέραια έτη, μήνες και ημέρες.',
    };
  }

  if (months.value > 11) {
    return {
      days: 0,
      error: 'Οι μήνες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 11.',
    };
  }

  if (days.value > 24) {
    return {
      days: 0,
      error: 'Οι ημέρες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 24.',
    };
  }

  const totalDays =
    years.value * 300 +
    months.value * 25 +
    days.value;

  if (totalDays > 5 * 300) {
    return {
      days: 0,
      error: 'Η μερική μάχιμη πενταετία δεν μπορεί να ξεπερνά τα 5 έτη.',
    };
  }

  return {
    days: totalDays,
    error: null,
  };
}

function getSpecialSemestersDays(specialSemesters = {}) {
  const status = specialSemesters.status || 'none';

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status !== 'yes') {
    return {
      days: 0,
      error: 'Η επιλογή εξαμήνων δεν είναι έγκυρη.',
    };
  }

  const semestersCount = parseNonNegativeIntegerOrEmpty(
    specialSemesters.semestersCount
  );

  if (!semestersCount.isValid || semestersCount.value <= 0) {
    return {
      days: 0,
      error: 'Το πλήθος εξαμήνων πρέπει να είναι ακέραιος αριθμός μεγαλύτερος από 0.',
    };
  }

  if (semestersCount.value > 14) {
    return {
      days: 0,
      error: 'Τα εξάμηνα δεν μπορούν να είναι περισσότερα από 14.',
    };
  }

  return {
    days: semestersCount.value * 6 * 25,
    error: null,
  };
}

function parseNonNegativeIntegerOrEmpty(value) {
  const text = String(value || '').trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  if (!/^\d+$/.test(text)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(text),
  };
}

function SelectWithLabel({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>

      <br />

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
        disabled={disabled}
        required={required}
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
  required = false,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>

      <br />

      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        required={required}
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

const COMBAT_FIVE_YEAR_STATUS_OPTIONS = [
  { value: 'none', label: 'Όχι' },
  { value: 'full', label: 'Ναι, ολόκληρη' },
  { value: 'partial', label: 'Ναι, μέρος της' },
];

const SPECIAL_SEMESTERS_STATUS_OPTIONS = [
  { value: 'none', label: 'Όχι' },
  { value: 'yes', label: 'Ναι' },
];

const RECOGNITION_PERIOD_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'before_2002', label: 'Πριν το 2002' },
  { value: 'between_2002_2016', label: 'Από 2002 έως 2016' },
  { value: 'after_2016', label: 'Μετά το 2016' },
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

const CONTRIBUTION_BASED_FUNDS = [
  'oaee',
  'etaa',
  'tsmede',
  'tsay',
  'oga',
];

function isUniformedFund(fund) {
  return fund === 'uniformed';
}

function isContributionBasedFund(fund) {
  return CONTRIBUTION_BASED_FUNDS.includes(fund);
}

function getInsuredTypeOptions(fund) {
  if (!fund) {
    return [DEFAULT_EMPTY_OPTION];
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

  return [SELECT_OPTION];
}

function createEmptyUniformedSpecialTimeDraft() {
  return {
    combatFiveYearService: {
      status: 'none',
      years: '',
      months: '',
      days: '',
      recognitionPeriod: '',
      paidAmount: '',
    },
    specialSemesters: {
      status: 'none',
      semestersCount: '',
      recognitionPeriod: '',
      paidAmount: '',
    },
  };
}

function normalizeUniformedSpecialTimeDraft(value) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  const normalizedDraft = {
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };

  if (normalizedDraft.combatFiveYearService.recognitionPeriod === 'before_2002') {
    normalizedDraft.combatFiveYearService.paidAmount = '0';
  }

  if (normalizedDraft.specialSemesters.recognitionPeriod === 'before_2002') {
    normalizedDraft.specialSemesters.paidAmount = '0';
  }

  return normalizedDraft;
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

const uniformedBoxStyle = {
  marginTop: '1rem',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  padding: '0.75rem',
  borderRadius: '6px',
};

const uniformedSubBoxStyle = {
  marginTop: '0.75rem',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '0.75rem',
};

const secondaryButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 0.75rem',
};

const removeButtonStyle = {
  padding: '0.35rem 0.6rem',
};

export default InsurancePeriodsInputSection;