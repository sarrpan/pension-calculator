import React, { useEffect, useMemo, useState } from 'react';

import BackendResponsePanel from './components/BackendResponsePanel';
import PreparedInputPreview from './components/PreparedInputPreview';
import ContributoryPensionInputSection from './sections/ContributoryPensionInputSection';
import InsuranceTimeInputSection from './sections/InsuranceTimeInputSection';
import NationalPensionInputSection from './sections/NationalPensionInputSection';
import { errorSectionStyle } from './utils/calculatorStyles';
import { analyzePensionForm } from './utils/pensionFormAnalysis';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';
const LOCAL_STORAGE_KEY = 'geodora_pension_calculator_draft_v1';

function PensionCalculatorPage() {
  const savedDraft = useMemo(() => loadSavedDraft(), []);

  const [currentFormStep, setCurrentFormStep] = useState(
    getInitialFormStep(savedDraft)
  );

  const [pensionStartDateInput, setPensionStartDateInput] = useState(
    savedDraft.pensionStartDateInput || ''
  );
  const [pensionTypeInput, setPensionTypeInput] = useState(
    savedDraft.pensionTypeInput || ''
  );

  const [oldAgeCategoryInput, setOldAgeCategoryInput] = useState(
    savedDraft.oldAgeCategoryInput || 'standard'
  );
  const [pensionModeInput, setPensionModeInput] = useState(
    savedDraft.pensionModeInput || ''
  );
  const [earlyReductionMonthsInput, setEarlyReductionMonthsInput] = useState(
    savedDraft.earlyReductionMonthsInput || ''
  );

  const [disabilityCategoryInput, setDisabilityCategoryInput] = useState(
    savedDraft.disabilityCategoryInput || ''
  );

  const [insuranceTimeInputMethod, setInsuranceTimeInputMethod] = useState(
    savedDraft.insuranceTimeInputMethod || ''
  );
  const [insuranceDaysInput, setInsuranceDaysInput] = useState(
    savedDraft.insuranceDaysInput || ''
  );
  const [insuranceYearsInput, setInsuranceYearsInput] = useState(
    savedDraft.insuranceYearsInput || ''
  );
  const [insuranceMonthsInput, setInsuranceMonthsInput] = useState(
    savedDraft.insuranceMonthsInput || ''
  );
  const [insuranceExtraDaysInput, setInsuranceExtraDaysInput] = useState(
    savedDraft.insuranceExtraDaysInput || ''
  );

  const [residenceYearsInput, setResidenceYearsInput] = useState(
    savedDraft.residenceYearsInput || ''
  );

  const [contributoryEarningsInputMethod, setContributoryEarningsInputMethod] =
    useState(savedDraft.contributoryEarningsInputMethod || '');
  const [averageMonthlyPensionableEarningsInput, setAverageMonthlyPensionableEarningsInput] =
    useState(savedDraft.averageMonthlyPensionableEarningsInput || '');
  const [yearlyEarningsRows, setYearlyEarningsRows] = useState(
    Array.isArray(savedDraft.yearlyEarningsRows) && savedDraft.yearlyEarningsRows.length > 0
      ? savedDraft.yearlyEarningsRows
      : createEmptyYearlyEarningsRows()
  );

  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      currentFormStep,
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
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
      yearlyEarningsRows,
    });
  }, [
    currentFormStep,
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
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  ]);

  useEffect(() => {
    saveDraft({
      currentFormStep,
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
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
      yearlyEarningsRows,
    });
  }, [
    currentFormStep,
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
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
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

  function handleContributoryEarningsInputMethodChange(value) {
    setContributoryEarningsInputMethod(value);
    clearBackendResult();

    if (value !== 'average_monthly') {
      setAverageMonthlyPensionableEarningsInput('');
    }

    if (value === 'average_monthly') {
      setCurrentFormStep('main');
    }
  }

  function handleYearlyEarningsRowChange(index, field, value) {
    setYearlyEarningsRows((currentRows) => {
      return currentRows.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      });
    });

    clearBackendResult();
  }

  function handleLoadDevelopmentYearlyEarnings() {
    setYearlyEarningsRows(createDevelopmentYearlyEarningsRows());
    clearBackendResult();
  }

  function handleBackToMainStep() {
    setCurrentFormStep('main');
    clearBackendResult();
  }

  async function handlePrepareCalculationInput() {
    setBackendResponse(null);
    setBackendError('');

    if (!analysis.isReady || analysis.error) {
      setBackendError(
        'Συμπληρώστε σωστά τα πεδία της φόρμας πριν την προετοιμασία.'
      );
      return;
    }

    if (
      analysis.requiresContributoryYearlyStep &&
      currentFormStep !== 'contributory_yearly'
    ) {
      setCurrentFormStep('contributory_yearly');
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

  const submitButtonText = getSubmitButtonText({
    currentFormStep,
    analysis,
    isSendingToBackend,
  });

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Υπολογισμός σύνταξης</h1>

      <p style={{ color: '#555' }}>
        {currentFormStep === 'contributory_yearly'
          ? 'Βήμα 2: Αποδοχές και ένσημα ανά έτος'
          : 'Βήμα 1: Βασικά στοιχεία σύνταξης'}
      </p>

      {currentFormStep === 'contributory_yearly' && (
        <button
          type="button"
          onClick={handleBackToMainStep}
          style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem' }}
        >
          Πίσω στα βασικά στοιχεία
        </button>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handlePrepareCalculationInput();
        }}
      >
        {currentFormStep === 'main' && (
          <>
            <NationalPensionInputSection
              pensionStartDateInput={pensionStartDateInput}
              pensionTypeInput={pensionTypeInput}
              oldAgeCategoryInput={oldAgeCategoryInput}
              pensionModeInput={pensionModeInput}
              earlyReductionMonthsInput={earlyReductionMonthsInput}
              disabilityCategoryInput={disabilityCategoryInput}
              residenceYearsInput={residenceYearsInput}
              onPensionStartDateChange={(value) => {
                setPensionStartDateInput(value);
                clearBackendResult();
              }}
              onPensionTypeChange={handlePensionTypeChange}
              onOldAgeCategoryChange={handleOldAgeCategoryChange}
              onPensionModeChange={handlePensionModeChange}
              onEarlyReductionMonthsChange={(value) => {
                setEarlyReductionMonthsInput(value);
                clearBackendResult();
              }}
              onDisabilityCategoryChange={(value) => {
                setDisabilityCategoryInput(value);
                clearBackendResult();
              }}
              onResidenceYearsChange={(value) => {
                setResidenceYearsInput(value);
                clearBackendResult();
              }}
            />

            <InsuranceTimeInputSection
              insuranceTimeInputMethod={insuranceTimeInputMethod}
              insuranceDaysInput={insuranceDaysInput}
              insuranceYearsInput={insuranceYearsInput}
              insuranceMonthsInput={insuranceMonthsInput}
              insuranceExtraDaysInput={insuranceExtraDaysInput}
              onInsuranceTimeInputMethodChange={(value) => {
                setInsuranceTimeInputMethod(value);
                clearBackendResult();
              }}
              onInsuranceDaysChange={(value) => {
                setInsuranceDaysInput(value);
                clearBackendResult();
              }}
              onInsuranceYearsChange={(value) => {
                setInsuranceYearsInput(value);
                clearBackendResult();
              }}
              onInsuranceMonthsChange={(value) => {
                setInsuranceMonthsInput(value);
                clearBackendResult();
              }}
              onInsuranceExtraDaysChange={(value) => {
                setInsuranceExtraDaysInput(value);
                clearBackendResult();
              }}
            />
          </>
        )}

        <ContributoryPensionInputSection
          currentFormStep={currentFormStep}
          contributoryEarningsInputMethod={contributoryEarningsInputMethod}
          averageMonthlyPensionableEarningsInput={averageMonthlyPensionableEarningsInput}
          yearlyEarningsRows={yearlyEarningsRows}
          onContributoryEarningsInputMethodChange={handleContributoryEarningsInputMethodChange}
          onAverageMonthlyPensionableEarningsChange={(value) => {
            setAverageMonthlyPensionableEarningsInput(value);
            clearBackendResult();
          }}
          onYearlyEarningsRowChange={handleYearlyEarningsRowChange}
          onLoadDevelopmentYearlyEarnings={handleLoadDevelopmentYearlyEarnings}
        />

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
          {submitButtonText}
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

function getSubmitButtonText({ currentFormStep, analysis, isSendingToBackend }) {
  if (isSendingToBackend) {
    return 'Αποστολή...';
  }

  if (
    analysis.requiresContributoryYearlyStep &&
    currentFormStep !== 'contributory_yearly'
  ) {
    return 'Επόμενο: αποδοχές ανά έτος';
  }

  return 'Προετοιμασία δεδομένων';
}

function createEmptyYearlyEarningsRows() {
  const rows = [];

  for (let year = 2002; year <= 2025; year += 1) {
    rows.push({
      id: `year_${year}`,
      year: String(year),
      annualEarnings: '',
      insuranceDays: '',
    });
  }

  return rows;
}

function createDevelopmentYearlyEarningsRows() {
  return createEmptyYearlyEarningsRows().map((row) => ({
    ...row,
    annualEarnings: '18000',
    insuranceDays: '300',
  }));
}

function getInitialFormStep(savedDraft = {}) {
  if (
    savedDraft.currentFormStep === 'contributory_yearly' &&
    savedDraft.contributoryEarningsInputMethod === 'yearly_earnings'
  ) {
    return 'contributory_yearly';
  }

  return 'main';
}

function loadSavedDraft() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return parsedValue;
  } catch (error) {
    return {};
  }
}

function saveDraft(draft) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    // Αν ο browser δεν επιτρέπει localStorage, η φόρμα συνεχίζει να λειτουργεί.
  }
}

export default PensionCalculatorPage;
