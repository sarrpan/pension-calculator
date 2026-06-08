import React, { useMemo, useState } from 'react';

import BackendResponsePanel from './components/BackendResponsePanel';
import PreparedInputPreview from './components/PreparedInputPreview';
import InsuranceTimeInputSection from './sections/InsuranceTimeInputSection';
import NationalPensionInputSection from './sections/NationalPensionInputSection';
import { errorSectionStyle } from './utils/calculatorStyles';
import { analyzePensionForm } from './utils/pensionFormAnalysis';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';

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

export default PensionCalculatorPage;
