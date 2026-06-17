
import React, { useEffect, useMemo, useState } from 'react';

import BackendResponsePanel from './components/BackendResponsePanel';
import MainPensionResultPanel from './components/MainPensionResultPanel';
import PreparedInputPreview from './components/PreparedInputPreview';
import ContributoryPensionInputSection from './sections/ContributoryPensionInputSection';
import EtaaExtraBenefitInputSection from './sections/EtaaExtraBenefitInputSection';
import InsurancePeriodsInputSection from './sections/InsurancePeriodsInputSection';
import InsuranceTimeInputSection from './sections/InsuranceTimeInputSection';
import NationalPensionInputSection from './sections/NationalPensionInputSection';
import { errorSectionStyle } from './utils/calculatorStyles';
import { analyzePensionForm } from './utils/pensionFormAnalysis';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';
const CALCULATE_PENSION_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/calculateDeiPension';
const LOCAL_STORAGE_KEY = 'geodora_pension_calculator_draft_v1';
const MAX_INSURANCE_PERIOD_GROUPS = 10;

function PensionCalculatorPage({ calculatorEdition = 'professional' }) {
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

  const [insurancePeriodsInputMode, setInsurancePeriodsInputMode] = useState(
    savedDraft.insurancePeriodsInputMode || 'disabled'
  );
  const [simpleFundInput, setSimpleFundInput] = useState(
    savedDraft.simpleFundInput || ''
  );
  const [simpleInsuredTypeInput, setSimpleInsuredTypeInput] = useState(
    savedDraft.simpleInsuredTypeInput || ''
  );
  const [simpleEmploymentCategoryInput, setSimpleEmploymentCategoryInput] = useState(
    savedDraft.simpleEmploymentCategoryInput || ''
  );
  const [simpleNonSalariedEarningsInputMode, setSimpleNonSalariedEarningsInputMode] =
    useState(
      normalizeSavedNonSalariedEarningsInputMode(
        savedDraft.simpleNonSalariedEarningsInputMode
      )
    );
  const [simpleFromDateInput, setSimpleFromDateInput] = useState(
    savedDraft.simpleFromDateInput || ''
  );
  const [simpleToDateInput, setSimpleToDateInput] = useState(
    savedDraft.simpleToDateInput || ''
  );
  const [simpleTimeInputMethod, setSimpleTimeInputMethod] = useState(
    savedDraft.simpleTimeInputMethod || ''
  );
  const [simpleInsuranceDaysInput, setSimpleInsuranceDaysInput] = useState(
    savedDraft.simpleInsuranceDaysInput || ''
  );
  const [simpleInsuranceYearsInput, setSimpleInsuranceYearsInput] = useState(
    savedDraft.simpleInsuranceYearsInput || ''
  );
  const [simpleInsuranceMonthsInput, setSimpleInsuranceMonthsInput] = useState(
    savedDraft.simpleInsuranceMonthsInput || ''
  );
  const [simpleInsuranceExtraDaysInput, setSimpleInsuranceExtraDaysInput] = useState(
    savedDraft.simpleInsuranceExtraDaysInput || ''
  );
  const [simpleUniformedSpecialTimeDraft, setSimpleUniformedSpecialTimeDraft] = useState(
    normalizeSavedUniformedSpecialTimeDraft(savedDraft.simpleUniformedSpecialTimeDraft)
  );
  const [article30SpecialRegimeUsageInput, setArticle30SpecialRegimeUsageInput] =
    useState(
      normalizeSavedArticle30SpecialRegimeUsageInput(
        savedDraft.article30SpecialRegimeUsageInput
      )
    );

  const [insurancePeriodGroups, setInsurancePeriodGroups] = useState(() => {
    return normalizeSavedInsurancePeriodGroups(savedDraft);
  });

  const [etaaExtraBenefitDraft, setEtaaExtraBenefitDraft] = useState(
    normalizeSavedEtaaExtraBenefitDraft(savedDraft.etaaExtraBenefitDraft)
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

  const [calculationResponse, setCalculationResponse] = useState(null);
  const [calculationError, setCalculationError] = useState('');
  const [isCalculatingPension, setIsCalculatingPension] = useState(false);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      currentFormStep,
      calculatorEdition,
      pensionStartDateInput,
      pensionTypeInput,
      oldAgeCategoryInput,
      pensionModeInput,
      earlyReductionMonthsInput,
      disabilityCategoryInput,
      insuranceTimeInputMethod:
        insurancePeriodsInputMode === 'simple'
          ? simpleTimeInputMethod
          : insuranceTimeInputMethod,
      insuranceDaysInput:
        insurancePeriodsInputMode === 'simple'
          ? simpleInsuranceDaysInput
          : insuranceDaysInput,
      insuranceYearsInput:
        insurancePeriodsInputMode === 'simple'
          ? simpleInsuranceYearsInput
          : insuranceYearsInput,
      insuranceMonthsInput:
        insurancePeriodsInputMode === 'simple'
          ? simpleInsuranceMonthsInput
          : insuranceMonthsInput,
      insuranceExtraDaysInput:
        insurancePeriodsInputMode === 'simple'
          ? simpleInsuranceExtraDaysInput
          : insuranceExtraDaysInput,
      residenceYearsInput,
      insurancePeriodsInputMode,
      simpleFundInput,
      simpleInsuredTypeInput,
      simpleEmploymentCategoryInput,
      simpleNonSalariedEarningsInputMode,
      simpleFromDateInput,
      simpleToDateInput,
      simpleTimeInputMethod,
      simpleInsuranceDaysInput,
      simpleInsuranceYearsInput,
      simpleInsuranceMonthsInput,
      simpleInsuranceExtraDaysInput,
      simpleUniformedSpecialTimeDraft,
      article30SpecialRegimeUsageInput,
      insurancePeriodGroups,
      etaaExtraBenefitDraft,
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
      yearlyEarningsRows,
    });
  }, [
    currentFormStep,
    calculatorEdition,
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
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleInsuredTypeInput,
    simpleEmploymentCategoryInput,
    simpleNonSalariedEarningsInputMode,
    simpleFromDateInput,
    simpleToDateInput,
    simpleTimeInputMethod,
    simpleInsuranceDaysInput,
    simpleInsuranceYearsInput,
    simpleInsuranceMonthsInput,
    simpleInsuranceExtraDaysInput,
    simpleUniformedSpecialTimeDraft,
    article30SpecialRegimeUsageInput,
    insurancePeriodGroups,
    etaaExtraBenefitDraft,
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
      insurancePeriodsInputMode,
      simpleFundInput,
      simpleInsuredTypeInput,
      simpleEmploymentCategoryInput,
      simpleNonSalariedEarningsInputMode,
      simpleFromDateInput,
      simpleToDateInput,
      simpleTimeInputMethod,
      simpleInsuranceDaysInput,
      simpleInsuranceYearsInput,
      simpleInsuranceMonthsInput,
      simpleInsuranceExtraDaysInput,
      simpleUniformedSpecialTimeDraft,
      article30SpecialRegimeUsageInput,
      insurancePeriodGroups,
      etaaExtraBenefitDraft,
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
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleInsuredTypeInput,
    simpleEmploymentCategoryInput,
    simpleNonSalariedEarningsInputMode,
    simpleFromDateInput,
    simpleToDateInput,
    simpleTimeInputMethod,
    simpleInsuranceDaysInput,
    simpleInsuranceYearsInput,
    simpleInsuranceMonthsInput,
    simpleInsuranceExtraDaysInput,
    simpleUniformedSpecialTimeDraft,
    article30SpecialRegimeUsageInput,
    insurancePeriodGroups,
    etaaExtraBenefitDraft,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  ]);

  function clearBackendResult() {
    setBackendResponse(null);
    setBackendError('');
    setCalculationResponse(null);
    setCalculationError('');
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

  function handleInsurancePeriodsInputModeChange(value) {
    setInsurancePeriodsInputMode(value);
    clearBackendResult();

    if (value !== 'simple') {
      setSimpleFundInput('');
      setSimpleInsuredTypeInput('');
      setSimpleEmploymentCategoryInput('');
      setSimpleNonSalariedEarningsInputMode('');
      setSimpleFromDateInput('');
      setSimpleToDateInput('');
      setSimpleTimeInputMethod('');
      setSimpleInsuranceDaysInput('');
      setSimpleInsuranceYearsInput('');
      setSimpleInsuranceMonthsInput('');
      setSimpleInsuranceExtraDaysInput('');
      setSimpleUniformedSpecialTimeDraft(createEmptyUniformedSpecialTimeDraft());
    }

    if (value !== 'multiple') {
      setInsurancePeriodGroups([createEmptyInsurancePeriodGroup()]);
    }

    if (value === 'multiple') {
      setInsurancePeriodGroups((currentGroups) => {
        if (Array.isArray(currentGroups) && currentGroups.length > 0) {
          return currentGroups.slice(0, MAX_INSURANCE_PERIOD_GROUPS);
        }

        return [createEmptyInsurancePeriodGroup()];
      });
    }
  }

  function handleSimpleTimeInputMethodChange(value) {
    setSimpleTimeInputMethod(value);
    setSimpleInsuranceDaysInput('');
    setSimpleInsuranceYearsInput('');
    setSimpleInsuranceMonthsInput('');
    setSimpleInsuranceExtraDaysInput('');
    clearBackendResult();
  }

  function handleInsurancePeriodGroupChange(groupId, field, value) {
    setInsurancePeriodGroups((currentGroups) => {
      return currentGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        if (field === 'timeInputMethod') {
          return {
            ...group,
            timeInputMethod: value,
            insuranceDays: '',
            insuranceYears: '',
            insuranceMonths: '',
            insuranceExtraDays: '',
          };
        }

        if (field === 'fund') {
          return {
            ...group,
            fund: value,
            insuredType: '',
            employmentCategory: '',
            nonSalariedEarningsInputMode: '',
          };
        }

        return {
          ...group,
          [field]: value,
        };
      });
    });

    clearBackendResult();
  }

  function handleAddInsurancePeriodGroup() {
    setInsurancePeriodGroups((currentGroups) => {
      if (currentGroups.length >= MAX_INSURANCE_PERIOD_GROUPS) {
        return currentGroups;
      }

      return [
        ...currentGroups,
        createEmptyInsurancePeriodGroup(),
      ];
    });

    clearBackendResult();
  }

  function handleRemoveInsurancePeriodGroup(groupId) {
    setInsurancePeriodGroups((currentGroups) => {
      if (currentGroups.length <= 1) {
        return [createEmptyInsurancePeriodGroup()];
      }

      return currentGroups.filter((group) => group.id !== groupId);
    });

    clearBackendResult();
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
      setCalculationResponse(null);
      setCalculationError('');
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSendingToBackend(false);
    }
  }

  async function handleCalculatePension() {
    setCalculationResponse(null);
    setCalculationError('');

    const preparedInput = backendResponse?.preparedInput;

    if (!preparedInput) {
      setCalculationError(
        'Δεν υπάρχει preparedInput. Πατήστε πρώτα «Προετοιμασία δεδομένων».'
      );
      return;
    }

    setIsCalculatingPension(true);

    try {
      const response = await fetch(CALCULATE_PENSION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Αποτυχία υπολογισμού σύνταξης.');
      }

      setCalculationResponse(data);
    } catch (error) {
      setCalculationError(error.message);
    } finally {
      setIsCalculatingPension(false);
    }
  }

  const submitButtonText = getSubmitButtonText({
    currentFormStep,
    analysis,
    isSendingToBackend,
  });

  const hasNonSalariedPeriodInput = hasContributionBasedPeriodInput({
    insurancePeriodsInputMode,
    simpleFundInput,
    insurancePeriodGroups,
  });

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Υπολογισμός σύνταξης</h1>

      <p style={{ color: '#555' }}>
        {currentFormStep === 'contributory_yearly'
          ? hasNonSalariedPeriodInput
            ? 'Βήμα 2: Ετήσια στοιχεία ασφαλιστικών περιόδων'
            : 'Βήμα 2: Αποδοχές και ένσημα ανά έτος'
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

            {insurancePeriodsInputMode === 'disabled' && (
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
            )}

            <InsurancePeriodsInputSection
              insurancePeriodsInputMode={insurancePeriodsInputMode}
              simpleFundInput={simpleFundInput}
              simpleInsuredTypeInput={simpleInsuredTypeInput}
              simpleEmploymentCategoryInput={simpleEmploymentCategoryInput}
              simpleNonSalariedEarningsInputMode={simpleNonSalariedEarningsInputMode}
              simpleFromDateInput={simpleFromDateInput}
              simpleToDateInput={simpleToDateInput}
              simpleTimeInputMethod={simpleTimeInputMethod}
              simpleInsuranceDaysInput={simpleInsuranceDaysInput}
              simpleInsuranceYearsInput={simpleInsuranceYearsInput}
              simpleInsuranceMonthsInput={simpleInsuranceMonthsInput}
              simpleInsuranceExtraDaysInput={simpleInsuranceExtraDaysInput}
              simpleUniformedSpecialTimeDraft={simpleUniformedSpecialTimeDraft}
              calculatorEdition={calculatorEdition}
              article30SpecialRegimeUsageInput={article30SpecialRegimeUsageInput}
              insurancePeriodGroups={insurancePeriodGroups}
              maxInsurancePeriodGroups={MAX_INSURANCE_PERIOD_GROUPS}
              onInsurancePeriodsInputModeChange={handleInsurancePeriodsInputModeChange}
              onSimpleFundChange={(value) => {
                setSimpleFundInput(value);
                clearBackendResult();
              }}
              onSimpleInsuredTypeChange={(value) => {
                setSimpleInsuredTypeInput(value);
                clearBackendResult();
              }}
              onSimpleEmploymentCategoryChange={(value) => {
                setSimpleEmploymentCategoryInput(value);
                clearBackendResult();
              }}
              onSimpleNonSalariedEarningsInputModeChange={(value) => {
                setSimpleNonSalariedEarningsInputMode(value);
                clearBackendResult();
              }}
              onSimpleFromDateChange={(value) => {
                setSimpleFromDateInput(value);
                clearBackendResult();
              }}
              onSimpleToDateChange={(value) => {
                setSimpleToDateInput(value);
                clearBackendResult();
              }}
              onSimpleTimeInputMethodChange={handleSimpleTimeInputMethodChange}
              onSimpleInsuranceDaysChange={(value) => {
                setSimpleInsuranceDaysInput(value);
                clearBackendResult();
              }}
              onSimpleInsuranceYearsChange={(value) => {
                setSimpleInsuranceYearsInput(value);
                clearBackendResult();
              }}
              onSimpleInsuranceMonthsChange={(value) => {
                setSimpleInsuranceMonthsInput(value);
                clearBackendResult();
              }}
              onSimpleInsuranceExtraDaysChange={(value) => {
                setSimpleInsuranceExtraDaysInput(value);
                clearBackendResult();
              }}
              onSimpleUniformedSpecialTimeDraftChange={(value) => {
                setSimpleUniformedSpecialTimeDraft(
                  normalizeSavedUniformedSpecialTimeDraft(value)
                );
                clearBackendResult();
              }}
              onArticle30SpecialRegimeUsageChange={(premiumType, value) => {
                setArticle30SpecialRegimeUsageInput((currentValue) => ({
                  ...normalizeSavedArticle30SpecialRegimeUsageInput(
                    currentValue
                  ),
                  [premiumType]: value,
                }));
                clearBackendResult();
              }}
              onInsurancePeriodGroupChange={handleInsurancePeriodGroupChange}
              onAddInsurancePeriodGroup={handleAddInsurancePeriodGroup}
              onRemoveInsurancePeriodGroup={handleRemoveInsurancePeriodGroup}
            />

            <EtaaExtraBenefitInputSection
              insurancePeriodsInputMode={insurancePeriodsInputMode}
              simpleFundInput={simpleFundInput}
              insurancePeriodGroups={insurancePeriodGroups}
              value={etaaExtraBenefitDraft}
              onChange={(benefitKey, field, value) => {
                setEtaaExtraBenefitDraft((currentValue) => {
                  const normalizedValue = normalizeSavedEtaaExtraBenefitDraft(
                    currentValue
                  );

                  return {
                    ...normalizedValue,
                    [benefitKey]: {
                      ...normalizedValue[benefitKey],
                      [field]: value,
                    },
                  };
                });
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
          insurancePeriodsInputMode={insurancePeriodsInputMode}
          simpleFundInput={simpleFundInput}
          simpleNonSalariedEarningsInputMode={simpleNonSalariedEarningsInputMode}
          simpleFromDateInput={simpleFromDateInput}
          simpleToDateInput={simpleToDateInput}
          insurancePeriodGroups={insurancePeriodGroups}
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

      {backendResponse?.preparedInput && (
        <section
          style={{
            marginTop: '1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '1rem',
            background: '#f8fafc',
          }}
        >
          <h2>Υπολογισμός κύριας σύνταξης</h2>
          <p style={{ color: '#475569' }}>
            Αυτό το κουμπί στέλνει το preparedInput στο actual calculator και
            εμφανίζει εθνική, ανταποδοτική και σύνολο κύριας σύνταξης.
          </p>

          <button
            type="button"
            onClick={handleCalculatePension}
            disabled={isCalculatingPension}
            style={{
              padding: '0.6rem 1rem',
              cursor: isCalculatingPension ? 'not-allowed' : 'pointer',
            }}
          >
            {isCalculatingPension ? 'Υπολογισμός...' : 'Υπολογισμός σύνταξης'}
          </button>

          {calculationError && (
            <p style={{ color: 'crimson' }}>{calculationError}</p>
          )}
        </section>
      )}

      {calculationResponse && (
        <MainPensionResultPanel calculationResponse={calculationResponse} />
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
    return 'Επόμενο: ετήσια στοιχεία ανά έτος';
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

const REAL_YEARLY_EARNINGS_ROWS = [
  { year: 2002, annualEarnings: '16115', insuranceDays: '300' },
  { year: 2003, annualEarnings: '16626', insuranceDays: '300' },
  { year: 2004, annualEarnings: '17897', insuranceDays: '300' },
  { year: 2005, annualEarnings: '19949', insuranceDays: '300' },
  { year: 2006, annualEarnings: '22505', insuranceDays: '300' },
  { year: 2007, annualEarnings: '23591', insuranceDays: '300' },
  { year: 2008, annualEarnings: '26778', insuranceDays: '300' },
  { year: 2009, annualEarnings: '30034', insuranceDays: '300' },
  { year: 2010, annualEarnings: '27565', insuranceDays: '300' },
  { year: 2011, annualEarnings: '26982', insuranceDays: '300' },
  { year: 2012, annualEarnings: '27612', insuranceDays: '300' },
  { year: 2013, annualEarnings: '27392', insuranceDays: '300' },
  { year: 2014, annualEarnings: '28866', insuranceDays: '300' },
  { year: 2015, annualEarnings: '29254', insuranceDays: '300' },
  { year: 2016, annualEarnings: '28778', insuranceDays: '300' },
  { year: 2017, annualEarnings: '29629', insuranceDays: '300' },
  { year: 2018, annualEarnings: '29867', insuranceDays: '300' },
  { year: 2019, annualEarnings: '37902', insuranceDays: '300' },
  { year: 2020, annualEarnings: '37305', insuranceDays: '300' },
  { year: 2021, annualEarnings: '50781', insuranceDays: '300' },
  { year: 2022, annualEarnings: '50438', insuranceDays: '300' },
  { year: 2023, annualEarnings: '51828', insuranceDays: '300' },
  { year: 2024, annualEarnings: '55250', insuranceDays: '300' },
  { year: 2025, annualEarnings: '57497', insuranceDays: '299' },
];

function createDevelopmentYearlyEarningsRows() {
  return createEmptyYearlyEarningsRows().map((row) => {
    const matchingRealRow = REAL_YEARLY_EARNINGS_ROWS.find(
      (realRow) => String(realRow.year) === String(row.year)
    );

    if (!matchingRealRow) {
      return row;
    }

    return {
      ...row,
      annualEarnings: matchingRealRow.annualEarnings,
      insuranceDays: matchingRealRow.insuranceDays,
    };
  });
}

function createEmptyInsurancePeriodGroup() {
  return {
    id: createInsurancePeriodGroupId(),
    timeInputMethod: '',
    insuranceDays: '',
    insuranceYears: '',
    insuranceMonths: '',
    insuranceExtraDays: '',
    fund: '',
    insuredType: '',
    employmentCategory: '',
    nonSalariedEarningsInputMode: '',
    uniformedSpecialTimeDraft: createEmptyUniformedSpecialTimeDraft(),
  };
}

function createInsurancePeriodGroupId() {
  return `insurance_group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSavedInsurancePeriodGroups(savedDraft = {}) {
  if (Array.isArray(savedDraft.insurancePeriodGroups)) {
    const normalizedGroups = savedDraft.insurancePeriodGroups
      .slice(0, MAX_INSURANCE_PERIOD_GROUPS)
      .map((group) => {
        return {
          id: group.id || createInsurancePeriodGroupId(),
          timeInputMethod: group.timeInputMethod || '',
          insuranceDays: group.insuranceDays || '',
          insuranceYears: group.insuranceYears || '',
          insuranceMonths: group.insuranceMonths || '',
          insuranceExtraDays: group.insuranceExtraDays || '',
          fund: group.fund || '',
          insuredType: group.insuredType || '',
          employmentCategory: group.employmentCategory || '',
          nonSalariedEarningsInputMode:
            normalizeSavedNonSalariedEarningsInputMode(
              group.nonSalariedEarningsInputMode
            ),
          uniformedSpecialTimeDraft:
            normalizeSavedUniformedSpecialTimeDraft(
              group.uniformedSpecialTimeDraft
            ),
        };
      });

    if (normalizedGroups.length > 0) {
      return normalizedGroups;
    }
  }

  const legacyFirstGroup = createLegacyInsurancePeriodGroup({
    timeInputMethod: savedDraft.multiPeriodTimeInputMethod,
    insuranceDays: savedDraft.multiPeriodInsuranceDaysInput,
    insuranceYears: savedDraft.multiPeriodInsuranceYearsInput,
    insuranceMonths: savedDraft.multiPeriodInsuranceMonthsInput,
    insuranceExtraDays: savedDraft.multiPeriodInsuranceExtraDaysInput,
    fund: savedDraft.multiPeriodFundInput,
    insuredType: savedDraft.multiPeriodInsuredTypeInput,
    employmentCategory: savedDraft.multiPeriodEmploymentCategoryInput,
  });

  const legacySecondGroup = createLegacyInsurancePeriodGroup({
    timeInputMethod: savedDraft.multiPeriod2TimeInputMethod,
    insuranceDays: savedDraft.multiPeriod2InsuranceDaysInput,
    insuranceYears: savedDraft.multiPeriod2InsuranceYearsInput,
    insuranceMonths: savedDraft.multiPeriod2InsuranceMonthsInput,
    insuranceExtraDays: savedDraft.multiPeriod2InsuranceExtraDaysInput,
    fund: savedDraft.multiPeriod2FundInput,
    insuredType: savedDraft.multiPeriod2InsuredTypeInput,
    employmentCategory: savedDraft.multiPeriod2EmploymentCategoryInput,
  });

  const legacyGroups = [legacyFirstGroup, legacySecondGroup].filter(Boolean);

  if (legacyGroups.length > 0) {
    return legacyGroups;
  }

  return [createEmptyInsurancePeriodGroup()];
}

function createLegacyInsurancePeriodGroup({
  timeInputMethod,
  insuranceDays,
  insuranceYears,
  insuranceMonths,
  insuranceExtraDays,
  fund,
  insuredType,
  employmentCategory,
}) {
  const hasAnyValue = [
    timeInputMethod,
    insuranceDays,
    insuranceYears,
    insuranceMonths,
    insuranceExtraDays,
    fund,
    insuredType,
    employmentCategory,
  ].some((value) => String(value || '').trim() !== '');

  if (!hasAnyValue) {
    return null;
  }

  return {
    id: createInsurancePeriodGroupId(),
    timeInputMethod: timeInputMethod || '',
    insuranceDays: insuranceDays || '',
    insuranceYears: insuranceYears || '',
    insuranceMonths: insuranceMonths || '',
    insuranceExtraDays: insuranceExtraDays || '',
    fund: fund || '',
    insuredType: insuredType || '',
    employmentCategory: employmentCategory || '',
    nonSalariedEarningsInputMode: '',
    uniformedSpecialTimeDraft: createEmptyUniformedSpecialTimeDraft(),
  };
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

function normalizeSavedUniformedSpecialTimeDraft(value) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  return {
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };
}

function normalizeSavedArticle30SpecialRegimeUsageInput(value) {
  if (typeof value === 'string') {
    return {
      vae: value,
      yvae: value,
      ota_cleaning: value,
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      vae: '',
      yvae: '',
      ota_cleaning: '',
    };
  }

  return {
    vae: value.vae || '',
    yvae: value.yvae || '',
    ota_cleaning: value.ota_cleaning || '',
  };
}

function normalizeSavedEtaaExtraBenefitDraft(value) {
  const defaultValue = {
    tsmede: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
      hasHigherSalariedRateBefore2007: 'no',
      higherRateYears: '',
      higherRateMonths: '',
      additionalPointsAboveTwelve: '',
      hasAdditionalTwoPercent: 'no',
      additionalTwoPercentYears: '',
      additionalTwoPercentMonths: '',
    },
    tsay: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
    },
  };

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  return {
    tsmede: {
      ...defaultValue.tsmede,
      ...(value.tsmede || {}),
    },
    tsay: {
      ...defaultValue.tsay,
      ...(value.tsay || {}),
    },
  };
}

function getInitialFormStep(savedDraft = {}) {
  if (savedDraft.currentFormStep !== 'contributory_yearly') {
    return 'main';
  }

  if (savedDraft.contributoryEarningsInputMethod === 'yearly_earnings') {
    return 'contributory_yearly';
  }

  const simpleMode = normalizeSavedNonSalariedEarningsInputMode(
    savedDraft.simpleNonSalariedEarningsInputMode
  );
  const hasGroupMode = Array.isArray(savedDraft.insurancePeriodGroups) &&
    savedDraft.insurancePeriodGroups.some((group) => {
      return Boolean(
        normalizeSavedNonSalariedEarningsInputMode(
          group?.nonSalariedEarningsInputMode
        )
      );
    });

  return simpleMode || hasGroupMode ? 'contributory_yearly' : 'main';
}

function normalizeSavedNonSalariedEarningsInputMode(value) {
  const normalizedValue = String(value || '').trim();

  if (
    normalizedValue === 'annual_pensionable_earnings' ||
    normalizedValue === 'annual_pension_contribution'
  ) {
    return normalizedValue;
  }

  return '';
}

function hasContributionBasedPeriodInput({
  insurancePeriodsInputMode,
  simpleFundInput,
  insurancePeriodGroups,
}) {
  const contributionBasedFunds = [
    'oaee',
    'etaa',
    'tsmede',
    'tsay',
    'oga',
  ];

  if (insurancePeriodsInputMode === 'simple') {
    return contributionBasedFunds.includes(simpleFundInput);
  }

  if (
    insurancePeriodsInputMode === 'multiple' &&
    Array.isArray(insurancePeriodGroups)
  ) {
    return insurancePeriodGroups.some((group) => {
      return contributionBasedFunds.includes(group?.fund);
    });
  }

  return false;
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
