import React, { useMemo, useState } from 'react';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';

const INSURANCE_DAYS_PER_YEAR = 300;
const INSURANCE_DAYS_PER_MONTH = 25;
const MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION = 15;
const MAX_EARLY_REDUCTION_MONTHS = 60;

const PENSION_TYPE_OPTIONS = {
  old_age: {
    value: 'old_age',
    label: 'Γήρατος',
  },
  disability: {
    value: 'disability',
    label: 'Αναπηρίας',
  },
};

const OLD_AGE_CATEGORY_OPTIONS = {
  standard: {
    value: 'standard',
    label: 'Κανονική σύνταξη γήρατος',
  },
  special_disease: {
    value: 'special_disease',
    label: 'Γήρατος λόγω ειδικών παθήσεων',
  },
};

const PENSION_MODE_OPTIONS = {
  full: {
    value: 'full',
    label: 'Πλήρης',
  },
  reduced: {
    value: 'reduced',
    label: 'Μειωμένη',
  },
};

const DISABILITY_CATEGORY_OPTIONS = {
  eighty_plus: {
    value: 'eighty_plus',
    label: '80% και άνω',
    disabilityPercentage: 80,
  },
  sixty_seven_to_seventy_nine: {
    value: 'sixty_seven_to_seventy_nine',
    label: '67% έως 79,99%',
    disabilityPercentage: 67,
  },
  fifty_to_sixty_six: {
    value: 'fifty_to_sixty_six',
    label: '50% έως 66,99%',
    disabilityPercentage: 50,
  },
};

const INSURANCE_TIME_INPUT_METHOD_OPTIONS = {
  insurance_days: {
    value: 'insurance_days',
    label: 'Με αριθμό ενσήμων / ημερών ασφάλισης',
  },
  years_months_days: {
    value: 'years_months_days',
    label: 'Με έτη, μήνες και ημέρες',
  },
};

function PensionCalculatorPage() {
  const [pensionStartDateInput, setPensionStartDateInput] = useState('');
  const [pensionTypeInput, setPensionTypeInput] = useState('');

  const [oldAgeCategoryInput, setOldAgeCategoryInput] = useState('standard');
  const [pensionModeInput, setPensionModeInput] = useState('');
  const [earlyReductionMonthsInput, setEarlyReductionMonthsInput] = useState('');

  const [disabilityCategoryInput, setDisabilityCategoryInput] = useState('');

  const [insuranceTimeInputMethod, setInsuranceTimeInputMethod] = useState('');
  const [insuranceDaysInput, setInsuranceDaysInput] = useState('');
  const [insuranceYearsInput, setInsuranceYearsInput] = useState('');
  const [insuranceMonthsInput, setInsuranceMonthsInput] = useState('');
  const [insuranceExtraDaysInput, setInsuranceExtraDaysInput] = useState('');

  const [residenceYearsInput, setResidenceYearsInput] = useState('');

  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      pensionStartDateInput,
      pensionTypeInput,
      oldAgeCategoryInput,
      pensionModeInput,
      earlyReductionMonthsInput,
      disabilityCategoryInput,
      insuranceTimeInputMethod,
      insuranceDaysInput,
      insuranceYearsInput,
      insuranceMonthsInput,
      insuranceExtraDaysInput,
      residenceYearsInput,
    });
  }, [
    pensionStartDateInput,
    pensionTypeInput,
    oldAgeCategoryInput,
    pensionModeInput,
    earlyReductionMonthsInput,
    disabilityCategoryInput,
    insuranceTimeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
    residenceYearsInput,
  ]);

  function clearBackendResult() {
    setBackendResponse(null);
    setBackendError('');
  }

  function handlePensionTypeChange(value) {
    setPensionTypeInput(value);
    clearBackendResult();

    if (value === 'old_age') {
      setDisabilityCategoryInput('');
      return;
    }

    if (value === 'disability') {
      setPensionModeInput('');
      setEarlyReductionMonthsInput('');
      setResidenceYearsInput('');
      setOldAgeCategoryInput('standard');
    }
  }

  function handleOldAgeCategoryChange(value) {
    setOldAgeCategoryInput(value);
    clearBackendResult();

    if (value === 'special_disease') {
      setPensionModeInput('');
      setEarlyReductionMonthsInput('');
    }
  }

  function handlePensionModeChange(value) {
    setPensionModeInput(value);
    clearBackendResult();

    if (value !== 'reduced') {
      setEarlyReductionMonthsInput('');
    }
  }

  async function handlePrepareCalculationInput() {
    setBackendResponse(null);
    setBackendError('');

    if (!analysis.isReady || analysis.error) {
      setBackendError(
        'Συμπληρώστε σωστά τα πεδία της εθνικής σύνταξης πριν την προετοιμασία.'
      );
      return;
    }

    setIsSendingToBackend(true);

    try {
      const response = await fetch(PREPARE_PENSION_INPUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis.calculationInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Αποτυχία προετοιμασίας δεδομένων.');
      }

      setBackendResponse(data);
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSendingToBackend(false);
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Υπολογισμός σύνταξης</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handlePrepareCalculationInput();
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="pensionStartDate">
            Ημερομηνία έναρξης σύνταξης
          </label>

          <br />

          <input
            id="pensionStartDate"
            type="text"
            value={pensionStartDateInput}
            onChange={(event) => {
              setPensionStartDateInput(event.target.value);
              clearBackendResult();
            }}
            placeholder="π.χ. 1/1/26 ή 01/01/2026"
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              width: '220px',
            }}
          />
        </div>

        <fieldset style={fieldsetStyle}>
          <legend>Είδος σύνταξης</legend>

          <RadioOption
            id="pensionTypeOldAge"
            name="pensionType"
            value="old_age"
            checked={pensionTypeInput === 'old_age'}
            onChange={handlePensionTypeChange}
            label="Γήρατος"
          />

          <RadioOption
            id="pensionTypeDisability"
            name="pensionType"
            value="disability"
            checked={pensionTypeInput === 'disability'}
            onChange={handlePensionTypeChange}
            label="Αναπηρίας"
          />
        </fieldset>

        {pensionTypeInput === 'old_age' && (
          <fieldset style={fieldsetStyle}>
            <legend>Κατηγορία σύνταξης γήρατος</legend>

            <RadioOption
              id="oldAgeCategoryStandard"
              name="oldAgeCategory"
              value="standard"
              checked={oldAgeCategoryInput === 'standard'}
              onChange={handleOldAgeCategoryChange}
              label="Κανονική σύνταξη γήρατος"
            />

            <RadioOption
              id="oldAgeCategorySpecialDisease"
              name="oldAgeCategory"
              value="special_disease"
              checked={oldAgeCategoryInput === 'special_disease'}
              onChange={handleOldAgeCategoryChange}
              label="Γήρατος λόγω ειδικών παθήσεων"
            />
          </fieldset>
        )}

        {pensionTypeInput === 'old_age' && oldAgeCategoryInput === 'standard' && (
          <fieldset style={fieldsetStyle}>
            <legend>Πλήρης ή μειωμένη σύνταξη γήρατος</legend>

            <RadioOption
              id="pensionModeFull"
              name="pensionMode"
              value="full"
              checked={pensionModeInput === 'full'}
              onChange={handlePensionModeChange}
              label="Πλήρης"
            />

            <RadioOption
              id="pensionModeReduced"
              name="pensionMode"
              value="reduced"
              checked={pensionModeInput === 'reduced'}
              onChange={handlePensionModeChange}
              label="Μειωμένη"
            />
          </fieldset>
        )}

        {pensionTypeInput === 'old_age' &&
          oldAgeCategoryInput === 'standard' &&
          pensionModeInput === 'reduced' && (
            <fieldset style={fieldsetStyle}>
              <legend>Μήνες πρόωρης μείωσης</legend>

              <label htmlFor="earlyReductionMonths">
                Μήνες πρόωρης μείωσης από το όριο πλήρους σύνταξης
              </label>

              <br />

              <input
                id="earlyReductionMonths"
                type="text"
                value={earlyReductionMonthsInput}
                onChange={(event) => {
                  setEarlyReductionMonthsInput(event.target.value);
                  clearBackendResult();
                }}
                placeholder="0 έως 60"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  width: '120px',
                }}
              />
            </fieldset>
          )}

        {pensionTypeInput === 'disability' && (
          <fieldset style={fieldsetStyle}>
            <legend>Κατηγορία ποσοστού αναπηρίας</legend>

            <RadioOption
              id="disabilityEightyPlus"
              name="disabilityCategory"
              value="eighty_plus"
              checked={disabilityCategoryInput === 'eighty_plus'}
              onChange={(value) => {
                setDisabilityCategoryInput(value);
                clearBackendResult();
              }}
              label="80% και άνω"
            />

            <RadioOption
              id="disabilitySixtySeven"
              name="disabilityCategory"
              value="sixty_seven_to_seventy_nine"
              checked={disabilityCategoryInput === 'sixty_seven_to_seventy_nine'}
              onChange={(value) => {
                setDisabilityCategoryInput(value);
                clearBackendResult();
              }}
              label="67% έως 79,99%"
            />

            <RadioOption
              id="disabilityFifty"
              name="disabilityCategory"
              value="fifty_to_sixty_six"
              checked={disabilityCategoryInput === 'fifty_to_sixty_six'}
              onChange={(value) => {
                setDisabilityCategoryInput(value);
                clearBackendResult();
              }}
              label="50% έως 66,99%"
            />
          </fieldset>
        )}

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
            onChange={(value) => {
              setInsuranceTimeInputMethod(value);
              clearBackendResult();
            }}
            label="Με αριθμό ενσήμων / ημερών ασφάλισης"
          />

          <RadioOption
            id="insuranceTimeMethodYearsMonthsDays"
            name="insuranceTimeInputMethod"
            value="years_months_days"
            checked={insuranceTimeInputMethod === 'years_months_days'}
            onChange={(value) => {
              setInsuranceTimeInputMethod(value);
              clearBackendResult();
            }}
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
                onChange={(event) => {
                  setInsuranceDaysInput(event.target.value);
                  clearBackendResult();
                }}
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
                onChange={(value) => {
                  setInsuranceYearsInput(value);
                  clearBackendResult();
                }}
                placeholder="π.χ. 35"
                width="100px"
              />

              <InputWithLabel
                id="insuranceMonths"
                label="Μήνες"
                value={insuranceMonthsInput}
                onChange={(value) => {
                  setInsuranceMonthsInput(value);
                  clearBackendResult();
                }}
                placeholder="0-11"
                width="100px"
              />

              <InputWithLabel
                id="insuranceExtraDays"
                label="Ημέρες"
                value={insuranceExtraDaysInput}
                onChange={(value) => {
                  setInsuranceExtraDaysInput(value);
                  clearBackendResult();
                }}
                placeholder="0-24"
                width="100px"
              />
            </div>
          )}
        </fieldset>

        {pensionTypeInput === 'old_age' && (
          <fieldset style={fieldsetStyle}>
            <legend>Έτη νόμιμης διαμονής</legend>

            <label htmlFor="residenceYears">
              Έτη νόμιμης διαμονής στην Ελλάδα
            </label>

            <br />

            <input
              id="residenceYears"
              type="text"
              value={residenceYearsInput}
              onChange={(event) => {
                setResidenceYearsInput(event.target.value);
                clearBackendResult();
              }}
              placeholder="π.χ. 40 ή 39,5"
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                width: '160px',
              }}
            />
          </fieldset>
        )}

        <button
          type="submit"
          disabled={!analysis.isReady || Boolean(analysis.error) || isSendingToBackend}
          style={{
            padding: '0.6rem 1rem',
            cursor:
              !analysis.isReady || analysis.error || isSendingToBackend
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isSendingToBackend
            ? 'Αποστολή...'
            : 'Προετοιμασία δεδομένων'}
        </button>
      </form>

      {analysis.error && (
        <p style={{ color: 'crimson' }}>
          {analysis.error}
        </p>
      )}

      {!analysis.error && analysis.isReady && (
        <PreparedInputPreview analysis={analysis} />
      )}

      {backendError && (
        <section style={errorSectionStyle}>
          <h2>Απάντηση από functions</h2>
          <p style={{ color: 'crimson' }}>{backendError}</p>
        </section>
      )}

      {backendResponse && (
        <BackendResponsePanel backendResponse={backendResponse} />
      )}
    </main>
  );
}

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

function BackendResponsePanel({ backendResponse }) {
  return (
    <section style={successSectionStyle}>
      <h2>Απάντηση από functions</h2>

      <p>
        <strong>Κατάσταση:</strong>{' '}
        {backendResponse.status}
      </p>

      <p>
        <strong>Μήνυμα:</strong>{' '}
        {backendResponse.message}
      </p>

      <h3>Το backend ετοίμασε</h3>

      <pre style={preStyle}>
        {JSON.stringify(backendResponse.preparedInput, null, 2)}
      </pre>

      {Array.isArray(backendResponse.warnings) &&
        backendResponse.warnings.length > 0 && (
          <>
            <h3>Προειδοποιήσεις</h3>

            <ul>
              {backendResponse.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </>
        )}

      {Array.isArray(backendResponse.missingForCalculation) &&
        backendResponse.missingForCalculation.length > 0 && (
          <>
            <h3>Λείπουν ακόμα για κανονικό υπολογισμό</h3>

            <ul>
              {backendResponse.missingForCalculation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
    </section>
  );
}

function analyzePensionForm({
  pensionStartDateInput,
  pensionTypeInput,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  disabilityCategoryInput,
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  residenceYearsInput,
}) {
  const dateAnalysis = analyzePensionStartDate(pensionStartDateInput);
  const pensionTypeAnalysis = analyzePensionType(pensionTypeInput);
  const oldAgeAnalysis = analyzeOldAgeInputs({
    pensionType: pensionTypeAnalysis.pensionType,
    oldAgeCategoryInput,
    pensionModeInput,
    earlyReductionMonthsInput,
    residenceYearsInput,
  });
  const disabilityAnalysis = analyzeDisabilityInputs({
    pensionType: pensionTypeAnalysis.pensionType,
    disabilityCategoryInput,
  });
  const insuranceTimeAnalysis = analyzeInsuranceTime({
    insuranceTimeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
  });

  const errors = [
    dateAnalysis.error,
    pensionTypeAnalysis.error,
    oldAgeAnalysis.error,
    disabilityAnalysis.error,
    insuranceTimeAnalysis.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      isReady: false,
      error: errors[0],
    };
  }

  const isReady =
    dateAnalysis.hasValue &&
    pensionTypeAnalysis.hasValue &&
    oldAgeAnalysis.hasValue &&
    disabilityAnalysis.hasValue &&
    insuranceTimeAnalysis.hasValue;

  if (!isReady) {
    return {
      isReady: false,
      error: null,
    };
  }

  const warnings = [
    ...oldAgeAnalysis.warnings,
    ...disabilityAnalysis.warnings,
    ...insuranceTimeAnalysis.warnings,
  ];

  const calculationInput = {
    generalInfoData: {
      pensionDate: dateAnalysis.pensionDate,
      pensionYear: dateAnalysis.pensionYear,
      pensionType: pensionTypeAnalysis.pensionType,

      oldAgeCategory: oldAgeAnalysis.oldAgeCategory,
      pensionMode: oldAgeAnalysis.pensionMode,
      earlyReductionMonths: oldAgeAnalysis.earlyReductionMonths,
      residenceYears: oldAgeAnalysis.residenceYears,
      isSpecialDiseaseOldAgeCase: oldAgeAnalysis.isSpecialDiseaseOldAgeCase,
      ignoreResidenceFortyYearPenalty:
        oldAgeAnalysis.ignoreResidenceFortyYearPenalty,

      disabilityCategory: disabilityAnalysis.disabilityCategory,
      disabilityPercentage: disabilityAnalysis.disabilityPercentage,

      insuranceTimeInputMethod: insuranceTimeAnalysis.insuranceTimeInputMethod,
      totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
      totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
      totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
      totalInsuranceDaysEquivalent:
        insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
      totalInsuranceDecimalYears:
        insuranceTimeAnalysis.totalInsuranceDecimalYears,
    },
  };

  return {
    isReady: true,
    error: null,
    warnings,

    displayDate: dateAnalysis.displayDate,
    pensionYear: dateAnalysis.pensionYear,

    pensionType: pensionTypeAnalysis.pensionType,
    pensionTypeLabel: pensionTypeAnalysis.pensionTypeLabel,

    oldAgeCategory: oldAgeAnalysis.oldAgeCategory,
    oldAgeCategoryLabel: oldAgeAnalysis.oldAgeCategoryLabel,
    pensionMode: oldAgeAnalysis.pensionMode,
    pensionModeLabel: oldAgeAnalysis.pensionModeLabel,
    earlyReductionMonths: oldAgeAnalysis.earlyReductionMonths,
    residenceYears: oldAgeAnalysis.residenceYears,
    isSpecialDiseaseOldAgeCase: oldAgeAnalysis.isSpecialDiseaseOldAgeCase,

    disabilityCategory: disabilityAnalysis.disabilityCategory,
    disabilityCategoryLabel: disabilityAnalysis.disabilityCategoryLabel,
    disabilityPercentage: disabilityAnalysis.disabilityPercentage,

    insuranceTimeInputMethod: insuranceTimeAnalysis.insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      insuranceTimeAnalysis.insuranceTimeInputMethodLabel,
    insuranceTimeDisplay: insuranceTimeAnalysis.insuranceTimeDisplay,
    totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
    totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
    totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
    totalInsuranceDaysEquivalent:
      insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
    totalInsuranceDecimalYears:
      insuranceTimeAnalysis.totalInsuranceDecimalYears,

    calculationInput,
  };
}

function analyzePensionStartDate(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const parsedInput = parseGreekDateInput(trimmedValue);

  if (!parsedInput.isValidFormat) {
    return {
      hasValue: true,
      error:
        'Συμπληρώστε έγκυρη ημερομηνία, π.χ. 1/1/26, 1/1/2026 ή 01012026.',
    };
  }

  const { day, month, year } = parsedInput;
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  if (!isRealDate) {
    return {
      hasValue: true,
      error: 'Η ημερομηνία που δόθηκε δεν είναι πραγματική.',
    };
  }

  const currentYear = new Date().getFullYear();
  const earliestAllowedYear = currentYear - 1;

  if (year < earliestAllowedYear) {
    return {
      hasValue: true,
      error: `Η εφαρμογή υποστηρίζει ημερομηνίες από το ${earliestAllowedYear} και μετά.`,
    };
  }

  return {
    hasValue: true,
    error: null,
    displayDate: formatGreekDate(day, month, year),
    pensionDate: formatIsoDate(day, month, year),
    pensionYear: year,
  };
}

function analyzePensionType(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return {
      hasValue: false,
      error: null,
      pensionType: null,
    };
  }

  if (!PENSION_TYPE_OPTIONS[normalizedValue]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο είδος σύνταξης.',
      pensionType: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    pensionType: normalizedValue,
    pensionTypeLabel: PENSION_TYPE_OPTIONS[normalizedValue].label,
  };
}

function analyzeOldAgeInputs({
  pensionType,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  residenceYearsInput,
}) {
  if (!pensionType) {
    return createInactiveOldAgeAnalysis(false);
  }

  if (pensionType !== 'old_age') {
    return createInactiveOldAgeAnalysis(true);
  }

  const oldAgeCategory = String(oldAgeCategoryInput || '').trim();

  if (!OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρη κατηγορία σύνταξης γήρατος.',
      warnings: [],
    };
  }

  const residenceResult = analyzeResidenceYears(residenceYearsInput);

  if (residenceResult.error) {
    return {
      hasValue: true,
      error: residenceResult.error,
      warnings: [],
    };
  }

  if (!residenceResult.hasValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const warnings = [...residenceResult.warnings];

  if (oldAgeCategory === 'special_disease') {
    return {
      hasValue: true,
      error: null,
      warnings,
      oldAgeCategory,
      oldAgeCategoryLabel: OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory].label,
      pensionMode: 'full',
      pensionModeLabel: null,
      earlyReductionMonths: 0,
      residenceYears: residenceResult.residenceYears,
      isSpecialDiseaseOldAgeCase: true,
      ignoreResidenceFortyYearPenalty: true,
    };
  }

  const pensionMode = String(pensionModeInput || '').trim();

  if (!pensionMode) {
    return {
      hasValue: false,
      error: null,
      warnings,
    };
  }

  if (!PENSION_MODE_OPTIONS[pensionMode]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε αν η σύνταξη γήρατος είναι πλήρης ή μειωμένη.',
      warnings,
    };
  }

  const earlyReductionResult = analyzeEarlyReductionMonths({
    pensionMode,
    earlyReductionMonthsInput,
  });

  if (earlyReductionResult.error) {
    return {
      hasValue: true,
      error: earlyReductionResult.error,
      warnings,
    };
  }

  if (!earlyReductionResult.hasValue) {
    return {
      hasValue: false,
      error: null,
      warnings,
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    oldAgeCategory,
    oldAgeCategoryLabel: OLD_AGE_CATEGORY_OPTIONS[oldAgeCategory].label,
    pensionMode,
    pensionModeLabel: PENSION_MODE_OPTIONS[pensionMode].label,
    earlyReductionMonths: earlyReductionResult.earlyReductionMonths,
    residenceYears: residenceResult.residenceYears,
    isSpecialDiseaseOldAgeCase: false,
    ignoreResidenceFortyYearPenalty: false,
  };
}

function createInactiveOldAgeAnalysis(hasValue) {
  return {
    hasValue,
    error: null,
    warnings: [],
    oldAgeCategory: null,
    oldAgeCategoryLabel: null,
    pensionMode: null,
    pensionModeLabel: null,
    earlyReductionMonths: 0,
    residenceYears: null,
    isSpecialDiseaseOldAgeCase: false,
    ignoreResidenceFortyYearPenalty: false,
  };
}

function analyzeEarlyReductionMonths({ pensionMode, earlyReductionMonthsInput }) {
  if (pensionMode !== 'reduced') {
    return {
      hasValue: true,
      error: null,
      earlyReductionMonths: 0,
    };
  }

  const trimmedMonths = String(earlyReductionMonthsInput || '').trim();

  if (!trimmedMonths) {
    return {
      hasValue: false,
      error: null,
      earlyReductionMonths: null,
    };
  }

  const monthsResult = parseNonNegativeInteger(trimmedMonths);

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι μήνες πρόωρης μείωσης πρέπει να είναι ακέραιος αριθμός.',
      earlyReductionMonths: null,
    };
  }

  if (monthsResult.value > MAX_EARLY_REDUCTION_MONTHS) {
    return {
      hasValue: true,
      error: 'Οι μήνες πρόωρης μείωσης πρέπει να είναι από 0 έως 60.',
      earlyReductionMonths: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    earlyReductionMonths: monthsResult.value,
  };
}

function analyzeDisabilityInputs({ pensionType, disabilityCategoryInput }) {
  if (!pensionType) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  if (pensionType !== 'disability') {
    return {
      hasValue: true,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  const disabilityCategory = String(disabilityCategoryInput || '').trim();

  if (!disabilityCategory) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  if (!DISABILITY_CATEGORY_OPTIONS[disabilityCategory]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρη κατηγορία αναπηρίας.',
      warnings: [],
      disabilityCategory: null,
      disabilityCategoryLabel: null,
      disabilityPercentage: null,
    };
  }

  return {
    hasValue: true,
    error: null,
    warnings: [],
    disabilityCategory,
    disabilityCategoryLabel: DISABILITY_CATEGORY_OPTIONS[disabilityCategory].label,
    disabilityPercentage:
      DISABILITY_CATEGORY_OPTIONS[disabilityCategory].disabilityPercentage,
  };
}

function analyzeInsuranceTime({
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
}) {
  const normalizedMethod = String(insuranceTimeInputMethod || '').trim();

  if (!normalizedMethod) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  if (!INSURANCE_TIME_INPUT_METHOD_OPTIONS[normalizedMethod]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο τρόπο εισαγωγής χρόνου ασφάλισης.',
      warnings: [],
    };
  }

  if (normalizedMethod === 'insurance_days') {
    return analyzeInsuranceDaysInput({
      insuranceDaysInput,
      insuranceTimeInputMethod: normalizedMethod,
    });
  }

  return analyzeYearsMonthsDaysInsuranceInput({
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
    insuranceTimeInputMethod: normalizedMethod,
  });
}

function analyzeInsuranceDaysInput({
  insuranceDaysInput,
  insuranceTimeInputMethod,
}) {
  const trimmedDays = String(insuranceDaysInput || '').trim();

  if (!trimmedDays) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const daysResult = parseNonNegativeInteger(trimmedDays);

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (daysResult.value <= 0) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι περισσότερα από 0.',
      warnings: [],
    };
  }

  const displayTime = convertInsuranceDaysToDisplayTime(daysResult.value);
  const decimalYears = roundToDecimals(
    daysResult.value / INSURANCE_DAYS_PER_YEAR,
    6
  );

  return {
    hasValue: true,
    error: null,
    warnings: [],

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: 0,
    totalInsuranceMonths: 0,
    totalInsuranceDays: daysResult.value,
    totalInsuranceDaysEquivalent: daysResult.value,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay:
      `${daysResult.value} ένσημα / ημέρες ασφάλισης ` +
      `(${displayTime.years} έτη, ${displayTime.months} μήνες, ${displayTime.days} ημέρες)`,
  };
}

function analyzeYearsMonthsDaysInsuranceInput({
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  insuranceTimeInputMethod,
}) {
  const yearsText = String(insuranceYearsInput || '').trim();
  const monthsText = String(insuranceMonthsInput || '').trim();
  const daysText = String(insuranceExtraDaysInput || '').trim();

  const hasAnyTimeValue = Boolean(yearsText || monthsText || daysText);

  if (!hasAnyTimeValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const yearsResult = parseNonNegativeIntegerOrEmpty(yearsText);
  const monthsResult = parseNonNegativeIntegerOrEmpty(monthsText);
  const daysResult = parseNonNegativeIntegerOrEmpty(daysText);

  if (!yearsResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα έτη ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
      warnings: [],
    };
  }

  const years = yearsResult.value;
  const months = monthsResult.value;
  const days = daysResult.value;

  if (months > 11) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι από 0 έως 11.',
      warnings: [],
    };
  }

  if (days > 24) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι από 0 έως 24.',
      warnings: [],
    };
  }

  if (years === 0 && months === 0 && days === 0) {
    return {
      hasValue: true,
      error: 'Ο χρόνος ασφάλισης πρέπει να είναι μεγαλύτερος από 0.',
      warnings: [],
    };
  }

  const totalDays =
    years * INSURANCE_DAYS_PER_YEAR +
    months * INSURANCE_DAYS_PER_MONTH +
    days;

  const decimalYears = roundToDecimals(totalDays / INSURANCE_DAYS_PER_YEAR, 6);

  return {
    hasValue: true,
    error: null,
    warnings: [],

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: years,
    totalInsuranceMonths: months,
    totalInsuranceDays: days,
    totalInsuranceDaysEquivalent: totalDays,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay: `${years} έτη, ${months} μήνες, ${days} ημέρες`,
  };
}

function analyzeResidenceYears(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
      warnings: [],
    };
  }

  const numberResult = parseNonNegativeDecimal(trimmedValue);

  if (!numberResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα έτη νόμιμης διαμονής πρέπει να είναι αριθμός.',
      warnings: [],
    };
  }

  const residenceYears = roundToDecimals(numberResult.value, 4);
  const warnings = [];

  if (
    residenceYears <
    MIN_RESIDENCE_YEARS_FOR_OLD_AGE_NATIONAL_PENSION
  ) {
    warnings.push(
      'Με αυτά τα έτη νόμιμης διαμονής δεν δικαιούται εθνική σύνταξη.'
    );
  }

  return {
    hasValue: true,
    error: null,
    warnings,
    residenceYears,
  };
}

function RadioOption({ id, name, value, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'block',
        marginTop: '0.5rem',
        cursor: 'pointer',
      }}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.value)}
        style={{ marginRight: '0.5rem' }}
      />
      {label}
    </label>
  );
}

function InputWithLabel({ id, label, value, onChange, placeholder, width }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>

      <br />

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          width,
        }}
      />
    </div>
  );
}

function parseNonNegativeInteger(value) {
  const text = String(value || '').trim();

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

function parseNonNegativeIntegerOrEmpty(value) {
  const text = String(value || '').trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  return parseNonNegativeInteger(text);
}

function parseNonNegativeDecimal(value) {
  const normalizedText = String(value || '').trim().replace(',', '.');

  if (!/^\d+(\.\d+)?$/.test(normalizedText)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(normalizedText),
  };
}

function convertInsuranceDaysToDisplayTime(totalDays) {
  const safeTotalDays = Number(totalDays || 0);

  const years = Math.floor(safeTotalDays / INSURANCE_DAYS_PER_YEAR);
  const remainingDaysAfterYears = safeTotalDays % INSURANCE_DAYS_PER_YEAR;

  const months = Math.floor(
    remainingDaysAfterYears / INSURANCE_DAYS_PER_MONTH
  );

  const days = remainingDaysAfterYears % INSURANCE_DAYS_PER_MONTH;

  return {
    years,
    months,
    days,
  };
}

function parseGreekDateInput(value) {
  const normalizedValue = String(value || '').trim();

  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/
  );

  if (separatedDateMatch) {
    return {
      isValidFormat: true,
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: normalizeYear(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, '');

  if (digitsOnly.length === 8) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: Number(digitsOnly.slice(4, 8)),
    };
  }

  if (digitsOnly.length === 6) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: normalizeYear(digitsOnly.slice(4, 6)),
    };
  }

  return {
    isValidFormat: false,
  };
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

function formatGreekDate(day, month, year) {
  return `${padTwoDigits(day)}/${padTwoDigits(month)}/${year}`;
}

function formatIsoDate(day, month, year) {
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(day)}`;
}

function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

const fieldsetStyle = {
  marginBottom: '1rem',
  padding: '1rem',
  border: '1px solid #ddd',
};

const sectionStyle = {
  marginTop: '2rem',
  padding: '1rem',
  border: '1px solid #ddd',
};

const preparedInputSectionStyle = {
  marginTop: '1rem',
  padding: '1rem',
  border: '1px solid #ddd',
  background: '#fafafa',
};

const errorSectionStyle = {
  marginTop: '1rem',
  padding: '1rem',
  border: '1px solid crimson',
  background: '#fff5f5',
};

const successSectionStyle = {
  marginTop: '1rem',
  padding: '1rem',
  border: '1px solid #ddd',
  background: '#f8fff8',
};

const preStyle = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  background: '#f3f3f3',
  padding: '1rem',
  borderRadius: '4px',
};

export default PensionCalculatorPage;
