import React from 'react';

import { RadioOption } from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

function NationalPensionInputSection({
  birthDateInput,
  firstInsuranceYearInput,
  pensionStartDateInput,
  pensionTypeInput,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  disabilityCategoryInput,
  residenceYearsInput,
  validationAttempted = false,
  fieldIssues = [],
  onBirthDateChange,
  onFirstInsuranceYearChange,
  onPensionStartDateChange,
  onPensionScenarioChange,
  onPensionModeChange,
  onEarlyReductionMonthsChange,
  onDisabilityCategoryChange,
  onResidenceYearsChange,
}) {
  const issueByField = Object.fromEntries(
    fieldIssues.map((issue) => [issue.key, issue]),
  );

  const birthDateComplete =
    hasTextValue(birthDateInput) && !issueByField.birthDate;
  const firstInsuranceYearComplete =
    hasTextValue(firstInsuranceYearInput) &&
    !issueByField.firstInsuranceYear;
  const pensionStartDateComplete =
    hasTextValue(pensionStartDateInput) &&
    !issueByField.pensionStartDate;
  const pensionScenarioInput = resolvePensionScenarioInput({
    pensionTypeInput,
    oldAgeCategoryInput,
  });
  const pensionScenarioComplete =
    hasTextValue(pensionScenarioInput) &&
    !issueByField.pensionScenario;
  const pensionModeComplete =
    hasTextValue(pensionModeInput) && !issueByField.pensionMode;
  const earlyReductionMonthsComplete =
    hasTextValue(earlyReductionMonthsInput) &&
    !issueByField.earlyReductionMonths;
  const disabilityCategoryComplete =
    hasTextValue(disabilityCategoryInput) &&
    !issueByField.disabilityCategory;
  const residenceYearsComplete =
    hasTextValue(residenceYearsInput) && !issueByField.residenceYears;

  return (
    <>
      <div
        id="birthDateField"
        style={getRequiredFieldStyle({
          isComplete: birthDateComplete,
          issue: issueByField.birthDate,
          validationAttempted,
        })}
      >
        <label htmlFor="birthDate">Ημερομηνία γέννησης</label>

        <br />

        <input
          id="birthDate"
          type="text"
          value={birthDateInput}
          onChange={(event) => onBirthDateChange(event.target.value)}
          placeholder="π.χ. 31/12/1967"
          aria-invalid={
            validationAttempted && Boolean(issueByField.birthDate)
          }
          aria-describedby="birthDateStatus"
          style={textInputStyle}
        />

        <p style={{ color: '#475569', marginBottom: 0 }}>
          Χρησιμοποιείται για να υπολογιστεί η ηλικία κατά την έναρξη της
          σύνταξης και να επιλεγεί η σωστή ράντα της επικουρικής.
        </p>

        <RequiredFieldStatus
          id="birthDateStatus"
          isComplete={birthDateComplete}
          issue={issueByField.birthDate}
          validationAttempted={validationAttempted}
        />
      </div>

      <div
        id="firstInsuranceYearField"
        style={getRequiredFieldStyle({
          isComplete: firstInsuranceYearComplete,
          issue: issueByField.firstInsuranceYear,
          validationAttempted,
        })}
      >
        <label htmlFor="firstInsuranceYear">
          Έτος πρώτης ασφάλισης
        </label>

        <br />

        <input
          id="firstInsuranceYear"
          type="text"
          inputMode="numeric"
          value={firstInsuranceYearInput}
          onChange={(event) =>
            onFirstInsuranceYearChange(event.target.value)
          }
          placeholder="π.χ. 1991"
          maxLength={4}
          aria-invalid={
            validationAttempted &&
            Boolean(issueByField.firstInsuranceYear)
          }
          aria-describedby="firstInsuranceYearStatus"
          style={firstInsuranceYearInputStyle}
        />

        <p style={{ color: '#475569', marginBottom: 0 }}>
          Γράψτε το έτος που ασφαλιστήκατε για πρώτη φορά, ακόμη
          κι αν αυτή η παλιά περίοδος δεν θα δηλωθεί παρακάτω.
        </p>

        {getFirstInsuranceYearClassification(
          firstInsuranceYearInput
        ) && (
          <p style={classificationStyle}>
            Χαρακτηρισμός:{' '}
            <strong>
              {getFirstInsuranceYearClassification(
                firstInsuranceYearInput
              )}
            </strong>
          </p>
        )}

        <RequiredFieldStatus
          id="firstInsuranceYearStatus"
          isComplete={firstInsuranceYearComplete}
          issue={issueByField.firstInsuranceYear}
          validationAttempted={validationAttempted}
        />
      </div>

      <div
        id="pensionStartDateField"
        style={getRequiredFieldStyle({
          isComplete: pensionStartDateComplete,
          issue: issueByField.pensionStartDate,
          validationAttempted,
        })}
      >
        <label htmlFor="pensionStartDate">
          Ημερομηνία έναρξης σύνταξης
        </label>

        <br />

        <input
          id="pensionStartDate"
          type="text"
          value={pensionStartDateInput}
          onChange={(event) =>
            onPensionStartDateChange(event.target.value)
          }
          placeholder="π.χ. 1/1/26 ή 01/01/2026"
          aria-invalid={
            validationAttempted &&
            Boolean(issueByField.pensionStartDate)
          }
          aria-describedby="pensionStartDateStatus"
          style={textInputStyle}
        />

        <RequiredFieldStatus
          id="pensionStartDateStatus"
          isComplete={pensionStartDateComplete}
          issue={issueByField.pensionStartDate}
          validationAttempted={validationAttempted}
        />
      </div>

      <fieldset
        id="pensionTypeField"
        style={getRequiredFieldsetStyle({
          isComplete: pensionScenarioComplete,
          issue: issueByField.pensionScenario,
          validationAttempted,
        })}
        aria-invalid={
          validationAttempted &&
          Boolean(issueByField.pensionScenario)
        }
        aria-describedby="pensionTypeStatus"
      >
        <legend>
          Για ποιο είδος σύνταξης κάνετε τον υπολογισμό;
        </legend>

        <RadioOption
          id="pensionScenarioOldAgeStandard"
          name="pensionScenario"
          value="old_age_standard"
          checked={pensionScenarioInput === 'old_age_standard'}
          onChange={onPensionScenarioChange}
          label="Κανονική σύνταξη γήρατος"
        />

        <RadioOption
          id="pensionScenarioOldAgeSpecialDisease"
          name="pensionScenario"
          value="old_age_special_disease"
          checked={
            pensionScenarioInput ===
            'old_age_special_disease'
          }
          onChange={onPensionScenarioChange}
          label="Σύνταξη γήρατος λόγω ειδικών παθήσεων"
        />

        <RadioOption
          id="pensionScenarioDisability"
          name="pensionScenario"
          value="disability"
          checked={pensionScenarioInput === 'disability'}
          onChange={onPensionScenarioChange}
          label="Σύνταξη αναπηρίας"
        />

        <RequiredFieldStatus
          id="pensionTypeStatus"
          isComplete={pensionScenarioComplete}
          issue={issueByField.pensionScenario}
          validationAttempted={validationAttempted}
        />
      </fieldset>

      {pensionTypeInput === 'old_age' &&
        oldAgeCategoryInput === 'standard' && (
          <fieldset
            id="pensionModeField"
            style={getRequiredFieldsetStyle({
              isComplete: pensionModeComplete,
              issue: issueByField.pensionMode,
              validationAttempted,
            })}
            aria-invalid={
              validationAttempted &&
              Boolean(issueByField.pensionMode)
            }
            aria-describedby="pensionModeStatus"
          >
            <legend>Πλήρης ή μειωμένη σύνταξη γήρατος</legend>

            <RadioOption
              id="pensionModeFull"
              name="pensionMode"
              value="full"
              checked={pensionModeInput === 'full'}
              onChange={onPensionModeChange}
              label="Πλήρης"
            />

            <RadioOption
              id="pensionModeReduced"
              name="pensionMode"
              value="reduced"
              checked={pensionModeInput === 'reduced'}
              onChange={onPensionModeChange}
              label="Μειωμένη"
            />

            <RequiredFieldStatus
              id="pensionModeStatus"
              isComplete={pensionModeComplete}
              issue={issueByField.pensionMode}
              validationAttempted={validationAttempted}
            />
          </fieldset>
        )}

      {pensionTypeInput === 'old_age' &&
        oldAgeCategoryInput === 'standard' &&
        pensionModeInput === 'reduced' && (
          <fieldset
            id="earlyReductionMonthsField"
            style={getRequiredFieldsetStyle({
              isComplete: earlyReductionMonthsComplete,
              issue: issueByField.earlyReductionMonths,
              validationAttempted,
            })}
            aria-invalid={
              validationAttempted &&
              Boolean(issueByField.earlyReductionMonths)
            }
            aria-describedby="earlyReductionMonthsStatus"
          >
            <legend>Μήνες πρόωρης μείωσης</legend>

            <label htmlFor="earlyReductionMonths">
              Μήνες πρόωρης μείωσης από το όριο πλήρους σύνταξης
            </label>

            <br />

            <input
              id="earlyReductionMonths"
              type="text"
              value={earlyReductionMonthsInput}
              onChange={(event) =>
                onEarlyReductionMonthsChange(event.target.value)
              }
              placeholder="0 έως 60"
              style={smallTextInputStyle}
            />

            <RequiredFieldStatus
              id="earlyReductionMonthsStatus"
              isComplete={earlyReductionMonthsComplete}
              issue={issueByField.earlyReductionMonths}
              validationAttempted={validationAttempted}
            />
          </fieldset>
        )}

      {pensionTypeInput === 'disability' && (
        <fieldset
          id="disabilityCategoryField"
          style={getRequiredFieldsetStyle({
            isComplete: disabilityCategoryComplete,
            issue: issueByField.disabilityCategory,
            validationAttempted,
          })}
          aria-invalid={
            validationAttempted &&
            Boolean(issueByField.disabilityCategory)
          }
          aria-describedby="disabilityCategoryStatus"
        >
          <legend>Κατηγορία ποσοστού αναπηρίας</legend>

          <RadioOption
            id="disabilityEightyPlus"
            name="disabilityCategory"
            value="eighty_plus"
            checked={disabilityCategoryInput === 'eighty_plus'}
            onChange={onDisabilityCategoryChange}
            label="80% και άνω"
          />

          <RadioOption
            id="disabilitySixtySeven"
            name="disabilityCategory"
            value="sixty_seven_to_seventy_nine"
            checked={
              disabilityCategoryInput ===
              'sixty_seven_to_seventy_nine'
            }
            onChange={onDisabilityCategoryChange}
            label="67% έως 79,99%"
          />

          <RadioOption
            id="disabilityFifty"
            name="disabilityCategory"
            value="fifty_to_sixty_six"
            checked={
              disabilityCategoryInput === 'fifty_to_sixty_six'
            }
            onChange={onDisabilityCategoryChange}
            label="50% έως 66,99%"
          />

          <RequiredFieldStatus
            id="disabilityCategoryStatus"
            isComplete={disabilityCategoryComplete}
            issue={issueByField.disabilityCategory}
            validationAttempted={validationAttempted}
          />
        </fieldset>
      )}

      {pensionTypeInput === 'old_age' && (
        <fieldset
          id="residenceYearsField"
          style={getRequiredFieldsetStyle({
            isComplete: residenceYearsComplete,
            issue: issueByField.residenceYears,
            validationAttempted,
          })}
          aria-invalid={
            validationAttempted &&
            Boolean(issueByField.residenceYears)
          }
          aria-describedby="residenceYearsStatus"
        >
          <legend>Έτη νόμιμης διαμονής</legend>

          <label htmlFor="residenceYears">
            Έτη νόμιμης διαμονής στην Ελλάδα
          </label>

          <br />

          <input
            id="residenceYears"
            type="text"
            value={residenceYearsInput}
            onChange={(event) =>
              onResidenceYearsChange(event.target.value)
            }
            placeholder="π.χ. 40 ή 39,5"
            style={residenceInputStyle}
          />

          <RequiredFieldStatus
            id="residenceYearsStatus"
            isComplete={residenceYearsComplete}
            issue={issueByField.residenceYears}
            validationAttempted={validationAttempted}
          />
        </fieldset>
      )}
    </>
  );
}


function resolvePensionScenarioInput({
  pensionTypeInput,
  oldAgeCategoryInput,
}) {
  if (pensionTypeInput === 'disability') {
    return 'disability';
  }

  if (
    pensionTypeInput === 'old_age' &&
    oldAgeCategoryInput === 'special_disease'
  ) {
    return 'old_age_special_disease';
  }

  if (
    pensionTypeInput === 'old_age' &&
    oldAgeCategoryInput === 'standard'
  ) {
    return 'old_age_standard';
  }

  return '';
}

function getFirstInsuranceYearClassification(value) {
  const text = String(value || '').trim();

  if (!/^\d{4}$/.test(text)) {
    return '';
  }

  const year = Number(text);

  if (year < 1900 || year > 2100) {
    return '';
  }

  return year <= 1992
    ? 'Παλαιός ασφαλισμένος'
    : 'Νέος ασφαλισμένος';
}

function RequiredFieldStatus({
  id,
  isComplete,
  issue,
  validationAttempted,
}) {
  if (validationAttempted && issue) {
    return (
      <p id={id} role="alert" style={errorStatusStyle}>
        {issue.message}
      </p>
    );
  }

  if (isComplete) {
    return (
      <p id={id} style={completeStatusStyle}>
        ✓ Συμπληρώθηκε
      </p>
    );
  }

  return (
    <p id={id} style={requiredStatusStyle}>
      Απαιτείται
    </p>
  );
}

function getRequiredFieldStyle({
  isComplete,
  issue,
  validationAttempted,
}) {
  return {
    ...requiredFieldBlockStyle,
    ...getValidationBorderStyle({
      isComplete,
      issue,
      validationAttempted,
    }),
  };
}

function getRequiredFieldsetStyle({
  isComplete,
  issue,
  validationAttempted,
}) {
  return {
    ...fieldsetStyle,
    ...getValidationBorderStyle({
      isComplete,
      issue,
      validationAttempted,
    }),
  };
}

function getValidationBorderStyle({
  isComplete,
  issue,
  validationAttempted,
}) {
  if (validationAttempted && issue) {
    return {
      borderColor: '#dc2626',
      boxShadow: '0 0 0 1px rgba(220, 38, 38, 0.15)',
      background: '#fffafa',
    };
  }

  if (isComplete) {
    return {
      borderColor: '#86efac',
      boxShadow: 'inset 4px 0 0 #16a34a',
      background: '#fbfffc',
    };
  }

  return {
    borderColor: '#f59e0b',
    boxShadow: 'inset 4px 0 0 #f59e0b',
    background: '#fffdf7',
  };
}

function hasTextValue(value) {
  return String(value || '').trim() !== '';
}

const requiredFieldBlockStyle = {
  marginBottom: '1rem',
  padding: '0.75rem',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
};

const textInputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '220px',
  maxWidth: '100%',
};

const firstInsuranceYearInputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '120px',
  maxWidth: '100%',
};

const classificationStyle = {
  margin: '0.55rem 0 0',
  color: '#1e3a8a',
  fontSize: '0.9rem',
};

const smallTextInputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '120px',
  maxWidth: '100%',
};

const residenceInputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '160px',
  maxWidth: '100%',
};

const requiredStatusStyle = {
  margin: '0.55rem 0 0',
  color: '#a16207',
  fontSize: '0.85rem',
  fontWeight: 600,
};

const completeStatusStyle = {
  margin: '0.55rem 0 0',
  color: '#15803d',
  fontSize: '0.85rem',
  fontWeight: 600,
};

const errorStatusStyle = {
  margin: '0.55rem 0 0',
  color: '#b91c1c',
  fontSize: '0.9rem',
  fontWeight: 600,
};

export default NationalPensionInputSection;
