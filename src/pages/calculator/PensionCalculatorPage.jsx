import { useEffect, useMemo, useState } from "react";


import BackendResponsePanel from "./components/BackendResponsePanel";
import MainPensionResultPanel from "./components/MainPensionResultPanel";
import PreparedInputPreview from "./components/PreparedInputPreview";
import PensionInputJsonImportSection from "./components/PensionInputJsonImportSection";
import ContributoryPensionInputSection from "./sections/ContributoryPensionInputSection";
import AuxiliaryContributionInputSection from "./sections/AuxiliaryContributionInputSection";
import EtaaExtraBenefitInputSection from "./sections/EtaaExtraBenefitInputSection";
import InsurancePeriodsInputSection from "./sections/InsurancePeriodsInputSection";
import InsuranceTimeInputSection from "./sections/InsuranceTimeInputSection";
import PlasticYearsInputSection from "./sections/PlasticYearsInputSection";
import ParallelInsuranceInputSection from "./sections/ParallelInsuranceInputSection";
import NationalPensionInputSection from "./sections/NationalPensionInputSection";
import { errorSectionStyle } from "./utils/calculatorStyles";
import { analyzePensionForm } from "./utils/pensionFormAnalysis";
import {
  createPensionInputPackage,
  downloadPensionInputPackage,
  readPensionInputPackageFile,
} from "./utils/pensionInputPackage";
import { normalizeParallelInsuranceDraft } from "./utils/parallelInsuranceFormUtils";
import { normalizeAuxiliaryContributionDraft } from "./utils/auxiliaryContributionFormUtils";

const PREPARE_PENSION_INPUT_URL =
  "http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput";
const CALCULATE_PENSION_URL =
  "http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/calculateDeiPension";
const LOCAL_STORAGE_KEY = "geodora_pension_calculator_draft_v1";
const MAX_INSURANCE_PERIOD_GROUPS = 10;

function PensionCalculatorPage({ calculatorEdition = "professional" }) {
  const savedDraft = useMemo(() => loadSavedDraft(), []);

  const [currentFormStep, setCurrentFormStep] = useState(
    getInitialFormStep(savedDraft),
  );

  const [birthDateInput, setBirthDateInput] = useState(
    savedDraft.birthDateInput || "",
  );
  const [pensionStartDateInput, setPensionStartDateInput] = useState(
    savedDraft.pensionStartDateInput || "",
  );
  const [pensionTypeInput, setPensionTypeInput] = useState(
    savedDraft.pensionTypeInput || "",
  );

  const [oldAgeCategoryInput, setOldAgeCategoryInput] = useState(
    savedDraft.oldAgeCategoryInput || "standard",
  );
  const [pensionModeInput, setPensionModeInput] = useState(
    savedDraft.pensionModeInput || "",
  );
  const [earlyReductionMonthsInput, setEarlyReductionMonthsInput] = useState(
    savedDraft.earlyReductionMonthsInput || "",
  );

  const [disabilityCategoryInput, setDisabilityCategoryInput] = useState(
    savedDraft.disabilityCategoryInput || "",
  );

  const [insuranceTimeInputMethod, setInsuranceTimeInputMethod] = useState(
    savedDraft.insuranceTimeInputMethod || "",
  );
  const [insuranceDaysInput, setInsuranceDaysInput] = useState(
    savedDraft.insuranceDaysInput || "",
  );
  const [insuranceYearsInput, setInsuranceYearsInput] = useState(
    savedDraft.insuranceYearsInput || "",
  );
  const [insuranceMonthsInput, setInsuranceMonthsInput] = useState(
    savedDraft.insuranceMonthsInput || "",
  );
  const [insuranceExtraDaysInput, setInsuranceExtraDaysInput] = useState(
    savedDraft.insuranceExtraDaysInput || "",
  );

  const [residenceYearsInput, setResidenceYearsInput] = useState(
    savedDraft.residenceYearsInput || "",
  );

  const [insurancePeriodsInputMode, setInsurancePeriodsInputMode] = useState(
    savedDraft.insurancePeriodsInputMode || "disabled",
  );
  const [simpleFundInput, setSimpleFundInput] = useState(
    savedDraft.simpleFundInput || "",
  );
  const [simpleInsuredTypeInput, setSimpleInsuredTypeInput] = useState(
    savedDraft.simpleInsuredTypeInput || "",
  );
  const [simpleEmploymentCategoryInput, setSimpleEmploymentCategoryInput] =
    useState(
      normalizeSavedEmploymentCategory({
        fund: savedDraft.simpleFundInput,
        insuredType: savedDraft.simpleInsuredTypeInput,
        employmentCategory: savedDraft.simpleEmploymentCategoryInput,
      }),
    );
  const [
    simpleNonSalariedEarningsInputMode,
    setSimpleNonSalariedEarningsInputMode,
  ] = useState(
    normalizeSavedNonSalariedEarningsInputMode(
      savedDraft.simpleNonSalariedEarningsInputMode,
    ),
  );
  const [
    simpleTsaySinglePensionerStatus,
    setSimpleTsaySinglePensionerStatus,
  ] = useState(
    normalizeSavedYesNoValue(savedDraft.simpleTsaySinglePensionerStatus),
  );
  const [simpleFromDateInput, setSimpleFromDateInput] = useState(
    savedDraft.simpleFromDateInput || "",
  );
  const [simpleToDateInput, setSimpleToDateInput] = useState(
    savedDraft.simpleToDateInput || "",
  );
  const [simpleTimeInputMethod, setSimpleTimeInputMethod] = useState(
    savedDraft.simpleTimeInputMethod || "",
  );
  const [simpleInsuranceDaysInput, setSimpleInsuranceDaysInput] = useState(
    savedDraft.simpleInsuranceDaysInput || "",
  );
  const [simpleInsuranceYearsInput, setSimpleInsuranceYearsInput] = useState(
    savedDraft.simpleInsuranceYearsInput || "",
  );
  const [simpleInsuranceMonthsInput, setSimpleInsuranceMonthsInput] = useState(
    savedDraft.simpleInsuranceMonthsInput || "",
  );
  const [simpleInsuranceExtraDaysInput, setSimpleInsuranceExtraDaysInput] =
    useState(savedDraft.simpleInsuranceExtraDaysInput || "");
  const [simpleUniformedSpecialTimeDraft, setSimpleUniformedSpecialTimeDraft] =
    useState(
      normalizeSavedUniformedSpecialTimeDraft(
        savedDraft.simpleUniformedSpecialTimeDraft,
      ),
    );
  const [
    article30SpecialRegimeUsageInput,
    setArticle30SpecialRegimeUsageInput,
  ] = useState(
    normalizeSavedArticle30SpecialRegimeUsageInput(
      savedDraft.article30SpecialRegimeUsageInput,
    ),
  );

  const [insurancePeriodGroups, setInsurancePeriodGroups] = useState(() => {
    return normalizeSavedInsurancePeriodGroups(savedDraft);
  });

  const [parallelInsuranceDraft, setParallelInsuranceDraft] = useState(
    normalizeParallelInsuranceDraft(savedDraft.parallelInsuranceDraft),
  );

  const [plasticYearsDraft, setPlasticYearsDraft] = useState(
    normalizeSavedPlasticYearsDraft(savedDraft.plasticYearsDraft),
  );

  const [etaaExtraBenefitDraft, setEtaaExtraBenefitDraft] = useState(
    normalizeSavedEtaaExtraBenefitDraft(savedDraft.etaaExtraBenefitDraft),
  );

  const [auxiliaryContributionDraft, setAuxiliaryContributionDraft] = useState(
    normalizeAuxiliaryContributionDraft(savedDraft.auxiliaryContributionDraft),
  );

  const [contributoryEarningsInputMethod, setContributoryEarningsInputMethod] =
    useState(savedDraft.contributoryEarningsInputMethod || "");
  const [
    averageMonthlyPensionableEarningsInput,
    setAverageMonthlyPensionableEarningsInput,
  ] = useState(savedDraft.averageMonthlyPensionableEarningsInput || "");
  const [yearlyEarningsRows, setYearlyEarningsRows] = useState(
    Array.isArray(savedDraft.yearlyEarningsRows) &&
      savedDraft.yearlyEarningsRows.length > 0
      ? savedDraft.yearlyEarningsRows
      : createEmptyYearlyEarningsRows(),
  );

  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);

  const [calculationResponse, setCalculationResponse] = useState(null);
  const [calculationError, setCalculationError] = useState("");
  const [isCalculatingPension, setIsCalculatingPension] = useState(false);
  const [pensionInputExportError, setPensionInputExportError] = useState("");
  const [importedPensionInputPackage, setImportedPensionInputPackage] =
    useState(null);
  const [importedPensionInputFileName, setImportedPensionInputFileName] =
    useState("");
  const [pensionInputImportError, setPensionInputImportError] = useState("");
  const [isPreparingImportedJson, setIsPreparingImportedJson] =
    useState(false);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      currentFormStep,
      calculatorEdition,
      birthDateInput,
      pensionStartDateInput,
      pensionTypeInput,
      oldAgeCategoryInput,
      pensionModeInput,
      earlyReductionMonthsInput,
      disabilityCategoryInput,
      insuranceTimeInputMethod:
        insurancePeriodsInputMode === "simple"
          ? simpleTimeInputMethod
          : insuranceTimeInputMethod,
      insuranceDaysInput:
        insurancePeriodsInputMode === "simple"
          ? simpleInsuranceDaysInput
          : insuranceDaysInput,
      insuranceYearsInput:
        insurancePeriodsInputMode === "simple"
          ? simpleInsuranceYearsInput
          : insuranceYearsInput,
      insuranceMonthsInput:
        insurancePeriodsInputMode === "simple"
          ? simpleInsuranceMonthsInput
          : insuranceMonthsInput,
      insuranceExtraDaysInput:
        insurancePeriodsInputMode === "simple"
          ? simpleInsuranceExtraDaysInput
          : insuranceExtraDaysInput,
      residenceYearsInput,
      insurancePeriodsInputMode,
      simpleFundInput,
      simpleInsuredTypeInput,
      simpleEmploymentCategoryInput,
      simpleNonSalariedEarningsInputMode,
      simpleTsaySinglePensionerStatus,
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
      parallelInsuranceDraft,
      plasticYearsDraft,
      etaaExtraBenefitDraft,
      auxiliaryContributionDraft,
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
      yearlyEarningsRows,
    });
  }, [
    currentFormStep,
    calculatorEdition,
    birthDateInput,
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
    simpleTsaySinglePensionerStatus,
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
    parallelInsuranceDraft,
    plasticYearsDraft,
    etaaExtraBenefitDraft,
    auxiliaryContributionDraft,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  ]);

  useEffect(() => {
    saveDraft({
      currentFormStep,
      birthDateInput,
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
      simpleTsaySinglePensionerStatus,
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
      parallelInsuranceDraft,
      plasticYearsDraft,
      etaaExtraBenefitDraft,
      auxiliaryContributionDraft,
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
      yearlyEarningsRows,
    });
  }, [
    currentFormStep,
    birthDateInput,
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
    simpleTsaySinglePensionerStatus,
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
    parallelInsuranceDraft,
    plasticYearsDraft,
    etaaExtraBenefitDraft,
    auxiliaryContributionDraft,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
    yearlyEarningsRows,
  ]);

  function clearBackendResult() {
    setBackendResponse(null);
    setBackendError("");
    setCalculationResponse(null);
    setCalculationError("");
    setPensionInputExportError("");
  }

  function clearAuxiliaryContributionForPeriod(periodId) {
    setAuxiliaryContributionDraft((currentValue) => {
      const normalizedValue = normalizeAuxiliaryContributionDraft(currentValue);

      if (!Object.prototype.hasOwnProperty.call(normalizedValue, periodId)) {
        return normalizedValue;
      }

      const nextValue = { ...normalizedValue };
      delete nextValue[periodId];
      return nextValue;
    });
  }

  function clearAllAuxiliaryContributionSelections() {
    setAuxiliaryContributionDraft({});
  }

  function handlePensionTypeChange(value) {
    setPensionTypeInput(value);
    clearBackendResult();

    if (value === "old_age") {
      setDisabilityCategoryInput("");
      return;
    }

    if (value === "disability") {
      setPensionModeInput("");
      setEarlyReductionMonthsInput("");
      setResidenceYearsInput("");
      setOldAgeCategoryInput("standard");
    }
  }

  function handleOldAgeCategoryChange(value) {
    setOldAgeCategoryInput(value);
    clearBackendResult();

    if (value === "special_disease") {
      setPensionModeInput("");
      setEarlyReductionMonthsInput("");
    }
  }

  function handlePensionModeChange(value) {
    setPensionModeInput(value);
    clearBackendResult();

    if (value !== "reduced") {
      setEarlyReductionMonthsInput("");
    }
  }

  function handleInsurancePeriodsInputModeChange(value) {
    setInsurancePeriodsInputMode(value);
    clearAllAuxiliaryContributionSelections();
    clearBackendResult();

    if (value !== "simple") {
      setSimpleFundInput("");
      setSimpleInsuredTypeInput("");
      setSimpleEmploymentCategoryInput("");
      setSimpleNonSalariedEarningsInputMode("");
      setSimpleTsaySinglePensionerStatus("");
      setSimpleFromDateInput("");
      setSimpleToDateInput("");
      setSimpleTimeInputMethod("");
      setSimpleInsuranceDaysInput("");
      setSimpleInsuranceYearsInput("");
      setSimpleInsuranceMonthsInput("");
      setSimpleInsuranceExtraDaysInput("");
      setSimpleUniformedSpecialTimeDraft(
        createEmptyUniformedSpecialTimeDraft(),
      );
    }

    if (value !== "multiple") {
      setInsurancePeriodGroups([createEmptyInsurancePeriodGroup()]);
    }

    if (value === "multiple") {
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
    setSimpleInsuranceDaysInput("");
    setSimpleInsuranceYearsInput("");
    setSimpleInsuranceMonthsInput("");
    setSimpleInsuranceExtraDaysInput("");
    clearBackendResult();
  }

  function handleInsurancePeriodGroupChange(groupId, field, value) {
    setInsurancePeriodGroups((currentGroups) => {
      return currentGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        if (field === "timeInputMethod") {
          return {
            ...group,
            timeInputMethod: value,
            insuranceDays: "",
            insuranceYears: "",
            insuranceMonths: "",
            insuranceExtraDays: "",
          };
        }

        if (field === "insuredType") {
          return {
            ...group,
            insuredType: value,
            employmentCategory:
              group.fund === "ota" &&
              value === "new" &&
              group.employmentCategory === "ota_ika_yvae"
                ? ""
                : group.employmentCategory,
          };
        }

        if (field === "fund") {
          return {
            ...group,
            fund: value,
            insuredType: "",
            employmentCategory: "",
            nonSalariedEarningsInputMode: "",
          };
        }

        return {
          ...group,
          [field]: value,
        };
      });
    });

    if (field === "fund" || field === "employmentCategory") {
      clearAuxiliaryContributionForPeriod(groupId);
    }

    clearBackendResult();
  }

  function handleAddInsurancePeriodGroup() {
    setInsurancePeriodGroups((currentGroups) => {
      if (currentGroups.length >= MAX_INSURANCE_PERIOD_GROUPS) {
        return currentGroups;
      }

      return [...currentGroups, createEmptyInsurancePeriodGroup()];
    });

    clearBackendResult();
  }

  function handleRemoveInsurancePeriodGroup(groupId) {
    clearAuxiliaryContributionForPeriod(groupId);

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

    if (value !== "average_monthly") {
      setAverageMonthlyPensionableEarningsInput("");
    }

    if (value === "average_monthly") {
      setCurrentFormStep("main");
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
    setCurrentFormStep("main");
    clearBackendResult();
  }

  function handleExportPensionInputJson() {
    setPensionInputExportError("");

    try {
      const pensionInputPackage = createPensionInputPackage({
        calculationInput: analysis.calculationInput,
        calculatorEdition,
      });

      downloadPensionInputPackage(pensionInputPackage);
    } catch (error) {
      setPensionInputExportError(
        error?.message || "Αποτυχία δημιουργίας του αρχείου JSON.",
      );
    }
  }

  async function handlePensionInputJsonFileSelected(file) {
    setPensionInputImportError("");
    setImportedPensionInputPackage(null);
    setImportedPensionInputFileName("");
    clearBackendResult();

    if (!file) {
      return;
    }

    try {
      const parsedPackage = await readPensionInputPackageFile(file);

      setImportedPensionInputPackage(parsedPackage);
      setImportedPensionInputFileName(file.name || "");
    } catch (error) {
      setPensionInputImportError(
        error?.message || "Αποτυχία ανάγνωσης του αρχείου JSON.",
      );
    }
  }

  async function handlePrepareImportedPensionInput() {
    setBackendResponse(null);
    setBackendError("");
    setCalculationResponse(null);
    setCalculationError("");

    const calculationInput = importedPensionInputPackage?.calculationInput;

    if (!calculationInput) {
      setPensionInputImportError(
        "Δεν έχει φορτωθεί έγκυρο κοινό αρχείο JSON.",
      );
      return;
    }

    setIsPreparingImportedJson(true);

    try {
      const response = await fetch(PREPARE_PENSION_INPUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Αποτυχία προετοιμασίας δεδομένων.");
      }

      setBackendResponse(data);
      setPensionInputImportError("");
    } catch (error) {
      setPensionInputImportError(
        error?.message || "Αποτυχία προετοιμασίας του αρχείου JSON.",
      );
    } finally {
      setIsPreparingImportedJson(false);
    }
  }

  function handleOpenParallelInsuranceStep() {
    setCurrentFormStep("parallel_insurance");
    clearBackendResult();
  }

  async function handlePrepareCalculationInput() {
    setBackendResponse(null);
    setBackendError("");

    if (!analysis.isReady || analysis.error) {
      setBackendError(
        "Συμπληρώστε σωστά τα πεδία της φόρμας πριν την προετοιμασία.",
      );
      return;
    }

    if (
      analysis.requiresContributoryYearlyStep &&
      currentFormStep !== "contributory_yearly"
    ) {
      setCurrentFormStep("contributory_yearly");
      return;
    }

    setIsSendingToBackend(true);

    try {
      const response = await fetch(PREPARE_PENSION_INPUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysis.calculationInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Αποτυχία προετοιμασίας δεδομένων.");
      }

      setBackendResponse(data);
      setCalculationResponse(null);
      setCalculationError("");
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSendingToBackend(false);
    }
  }

  async function handleCalculatePension() {
    setCalculationResponse(null);
    setCalculationError("");

    const preparedInput = backendResponse?.preparedInput;

    if (!preparedInput) {
      setCalculationError(
        "Δεν υπάρχει preparedInput. Πατήστε πρώτα «Προετοιμασία δεδομένων».",
      );
      return;
    }

    setIsCalculatingPension(true);

    try {
      const response = await fetch(CALCULATE_PENSION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preparedInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Αποτυχία υπολογισμού σύνταξης.");
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
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Υπολογισμός σύνταξης</h1>

      <p style={{ color: "#555" }}>
        {currentFormStep === "contributory_yearly"
          ? hasNonSalariedPeriodInput
            ? "Βήμα 2: Ετήσια στοιχεία ασφαλιστικών περιόδων"
            : "Βήμα 2: Αποδοχές και ένσημα ανά έτος"
          : currentFormStep === "parallel_insurance"
            ? "Ξεχωριστή φόρμα: Ανάλυση παράλληλης ασφάλισης"
            : "Βήμα 1: Βασικά στοιχεία σύνταξης"}
      </p>

      <PensionInputJsonImportSection
        importedPackage={importedPensionInputPackage}
        importedFileName={importedPensionInputFileName}
        importError={pensionInputImportError}
        isPreparing={isPreparingImportedJson}
        onFileSelected={handlePensionInputJsonFileSelected}
        onPrepare={handlePrepareImportedPensionInput}
      />

      {(currentFormStep === "contributory_yearly" ||
        currentFormStep === "parallel_insurance") && (
        <button
          type="button"
          onClick={handleBackToMainStep}
          style={{ marginBottom: "1rem", padding: "0.5rem 0.75rem" }}
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
        {currentFormStep === "main" && (
          <>
            <NationalPensionInputSection
              birthDateInput={birthDateInput}
              pensionStartDateInput={pensionStartDateInput}
              pensionTypeInput={pensionTypeInput}
              oldAgeCategoryInput={oldAgeCategoryInput}
              pensionModeInput={pensionModeInput}
              earlyReductionMonthsInput={earlyReductionMonthsInput}
              disabilityCategoryInput={disabilityCategoryInput}
              residenceYearsInput={residenceYearsInput}
              onBirthDateChange={(value) => {
                setBirthDateInput(value);
                clearBackendResult();
              }}
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

            {insurancePeriodsInputMode === "disabled" && (
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
              simpleNonSalariedEarningsInputMode={
                simpleNonSalariedEarningsInputMode
              }
              simpleTsaySinglePensionerStatus={
                simpleTsaySinglePensionerStatus
              }
              simpleFromDateInput={simpleFromDateInput}
              simpleToDateInput={simpleToDateInput}
              simpleTimeInputMethod={simpleTimeInputMethod}
              simpleInsuranceDaysInput={simpleInsuranceDaysInput}
              simpleInsuranceYearsInput={simpleInsuranceYearsInput}
              simpleInsuranceMonthsInput={simpleInsuranceMonthsInput}
              simpleInsuranceExtraDaysInput={simpleInsuranceExtraDaysInput}
              simpleUniformedSpecialTimeDraft={simpleUniformedSpecialTimeDraft}
              calculatorEdition={calculatorEdition}
              article30SpecialRegimeUsageInput={
                article30SpecialRegimeUsageInput
              }
              insurancePeriodGroups={insurancePeriodGroups}
              maxInsurancePeriodGroups={MAX_INSURANCE_PERIOD_GROUPS}
              onInsurancePeriodsInputModeChange={
                handleInsurancePeriodsInputModeChange
              }
              onSimpleFundChange={(value) => {
                setSimpleFundInput(value);
                clearAuxiliaryContributionForPeriod("period_1");
                clearBackendResult();
              }}
              onSimpleInsuredTypeChange={(value) => {
                setSimpleInsuredTypeInput(value);
                clearBackendResult();
              }}
              onSimpleEmploymentCategoryChange={(value) => {
                setSimpleEmploymentCategoryInput(value);
                clearAuxiliaryContributionForPeriod("period_1");
                clearBackendResult();
              }}
              onSimpleNonSalariedEarningsInputModeChange={(value) => {
                setSimpleNonSalariedEarningsInputMode(value);
                clearBackendResult();
              }}
              onSimpleTsaySinglePensionerStatusChange={(value) => {
                setSimpleTsaySinglePensionerStatus(
                  normalizeSavedYesNoValue(value),
                );
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
                  normalizeSavedUniformedSpecialTimeDraft(value),
                );
                clearBackendResult();
              }}
              onArticle30SpecialRegimeUsageChange={(premiumType, value) => {
                setArticle30SpecialRegimeUsageInput((currentValue) => ({
                  ...normalizeSavedArticle30SpecialRegimeUsageInput(
                    currentValue,
                  ),
                  [premiumType]: value,
                }));
                clearBackendResult();
              }}
              onInsurancePeriodGroupChange={handleInsurancePeriodGroupChange}
              onAddInsurancePeriodGroup={handleAddInsurancePeriodGroup}
              onRemoveInsurancePeriodGroup={handleRemoveInsurancePeriodGroup}
            />

            <AuxiliaryContributionInputSection
              insurancePeriodsInputMode={insurancePeriodsInputMode}
              simpleFundInput={simpleFundInput}
              simpleEmploymentCategoryInput={simpleEmploymentCategoryInput}
              insurancePeriodGroups={insurancePeriodGroups}
              value={auxiliaryContributionDraft}
              onChange={(periodId, field, fieldValue) => {
                setAuxiliaryContributionDraft((currentValue) => {
                  const normalizedValue =
                    normalizeAuxiliaryContributionDraft(currentValue);
                  const currentPeriodValue = normalizedValue[periodId] || {
                    extraContributionChoice: "",
                    formerAuxiliaryFund: "",
                  };

                  return {
                    ...normalizedValue,
                    [periodId]: {
                      ...currentPeriodValue,
                      [field]: fieldValue,
                    },
                  };
                });
                clearBackendResult();
              }}
            />

            <ParallelInsuranceInputSection
              calculatorEdition={calculatorEdition}
              detectedSegments={analysis.parallelInsuranceSegments || []}
              value={parallelInsuranceDraft}
              viewMode="summary"
              onOpenDetails={handleOpenParallelInsuranceStep}
              onChange={(value) => {
                setParallelInsuranceDraft(
                  normalizeParallelInsuranceDraft(value),
                );
                clearBackendResult();
              }}
            />

            <PlasticYearsInputSection
              calculatorEdition={calculatorEdition}
              value={plasticYearsDraft}
              onChange={(value) => {
                setPlasticYearsDraft(normalizeSavedPlasticYearsDraft(value));
                clearBackendResult();
              }}
            />

            <EtaaExtraBenefitInputSection
              insurancePeriodsInputMode={insurancePeriodsInputMode}
              simpleFundInput={simpleFundInput}
              insurancePeriodGroups={insurancePeriodGroups}
              value={etaaExtraBenefitDraft}
              onChange={(benefitKey, field, value) => {
                setEtaaExtraBenefitDraft((currentValue) => {
                  const normalizedValue =
                    normalizeSavedEtaaExtraBenefitDraft(currentValue);

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

        {currentFormStep === "parallel_insurance" && (
          <>
            <ParallelInsuranceInputSection
              calculatorEdition={calculatorEdition}
              detectedSegments={analysis.parallelInsuranceSegments || []}
              value={parallelInsuranceDraft}
              viewMode="details"
              onChange={(value) => {
                setParallelInsuranceDraft(
                  normalizeParallelInsuranceDraft(value),
                );
                clearBackendResult();
              }}
            />

            <button
              type="button"
              onClick={handleBackToMainStep}
              style={{ marginBottom: "1rem", padding: "0.6rem 1rem" }}
            >
              Αποθήκευση και επιστροφή στα βασικά στοιχεία
            </button>
          </>
        )}

        {currentFormStep !== "parallel_insurance" && (
          <ContributoryPensionInputSection
          currentFormStep={currentFormStep}
          contributoryEarningsInputMethod={contributoryEarningsInputMethod}
          averageMonthlyPensionableEarningsInput={
            averageMonthlyPensionableEarningsInput
          }
          yearlyEarningsRows={yearlyEarningsRows}
          insurancePeriodsInputMode={insurancePeriodsInputMode}
          simpleFundInput={simpleFundInput}
          simpleNonSalariedEarningsInputMode={
            simpleNonSalariedEarningsInputMode
          }
          simpleFromDateInput={simpleFromDateInput}
          simpleToDateInput={simpleToDateInput}
          insurancePeriodGroups={insurancePeriodGroups}
          parallelInsuranceSegments={analysis.parallelInsuranceSegments || []}
          parallelInsuranceDraft={parallelInsuranceDraft}
          onContributoryEarningsInputMethodChange={
            handleContributoryEarningsInputMethodChange
          }
          onAverageMonthlyPensionableEarningsChange={(value) => {
            setAverageMonthlyPensionableEarningsInput(value);
            clearBackendResult();
          }}
          onYearlyEarningsRowChange={handleYearlyEarningsRowChange}
          onLoadDevelopmentYearlyEarnings={handleLoadDevelopmentYearlyEarnings}
        />
        )}

        {currentFormStep !== "parallel_insurance" && (
          <button
          type="submit"
          disabled={
            !analysis.isReady || Boolean(analysis.error) || isSendingToBackend
          }
          style={{
            padding: "0.6rem 1rem",
            cursor:
              !analysis.isReady || analysis.error || isSendingToBackend
                ? "not-allowed"
                : "pointer",
          }}
        >
          {submitButtonText}
        </button>
        )}
      </form>

      {analysis.error && <p style={{ color: "crimson" }}>{analysis.error}</p>}

      {!analysis.error && analysis.isReady && (
        <PreparedInputPreview analysis={analysis} />
      )}

      {!analysis.error && analysis.isReady && (
        <section
          style={{
            marginTop: "1rem",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "1rem",
            background: "#f8fafc",
          }}
        >
          <h2>Κοινό αρχείο εισόδου</h2>

          <p style={{ color: "#475569" }}>
            Το αρχείο περιέχει τα ίδια δεδομένα που στέλνει σήμερα η φόρμα
            στο function προετοιμασίας. Δεν περιέχει αποτέλεσμα σύνταξης και
            δεν αλλάζει κανέναν calculator.
          </p>

          <button
            type="button"
            onClick={handleExportPensionInputJson}
            style={{ padding: "0.6rem 1rem" }}
          >
            Εξαγωγή αρχείου JSON
          </button>

          {pensionInputExportError && (
            <p style={{ color: "crimson" }}>{pensionInputExportError}</p>
          )}
        </section>
      )}

      {backendError && (
        <section style={errorSectionStyle}>
          <h2>Απάντηση από functions</h2>
          <p style={{ color: "crimson" }}>{backendError}</p>
        </section>
      )}

      {backendResponse && (
        <BackendResponsePanel backendResponse={backendResponse} />
      )}

      {backendResponse?.preparedInput && (
        <section
          style={{
            marginTop: "1rem",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "1rem",
            background: "#f8fafc",
          }}
        >
          <h2>Υπολογισμός κύριας και επικουρικής σύνταξης</h2>
          <p style={{ color: "#475569" }}>
            Αυτό το κουμπί στέλνει τα προετοιμασμένα δεδομένα στον calculator.
            Εμφανίζει την κύρια σύνταξη και, όταν υπάρχει επικουρική ασφάλιση,
            το παλαιό τμήμα της επικουρικής έως 31/12/2014.
          </p>

          <button
            type="button"
            onClick={handleCalculatePension}
            disabled={isCalculatingPension}
            style={{
              padding: "0.6rem 1rem",
              cursor: isCalculatingPension ? "not-allowed" : "pointer",
            }}
          >
            {isCalculatingPension ? "Υπολογισμός..." : "Υπολογισμός σύνταξης"}
          </button>

          {calculationError && (
            <p style={{ color: "crimson" }}>{calculationError}</p>
          )}
        </section>
      )}

      {calculationResponse && (
        <MainPensionResultPanel calculationResponse={calculationResponse} />
      )}
    </main>
  );
}

function getSubmitButtonText({
  currentFormStep,
  analysis,
  isSendingToBackend,
}) {
  if (isSendingToBackend) {
    return "Αποστολή...";
  }

  if (
    analysis.requiresContributoryYearlyStep &&
    currentFormStep !== "contributory_yearly"
  ) {
    return "Επόμενο: ετήσια στοιχεία ανά έτος";
  }

  return "Προετοιμασία δεδομένων";
}

function createEmptyYearlyEarningsRows() {
  const rows = [];

  for (let year = 2002; year <= 2025; year += 1) {
    rows.push({
      id: `year_${year}`,
      year: String(year),
      annualEarnings: "",
      insuranceDays: "",
    });
  }

  return rows;
}

const REAL_YEARLY_EARNINGS_ROWS = [
  { year: 2002, annualEarnings: "16115", insuranceDays: "300" },
  { year: 2003, annualEarnings: "16626", insuranceDays: "300" },
  { year: 2004, annualEarnings: "17897", insuranceDays: "300" },
  { year: 2005, annualEarnings: "19949", insuranceDays: "300" },
  { year: 2006, annualEarnings: "22505", insuranceDays: "300" },
  { year: 2007, annualEarnings: "23591", insuranceDays: "300" },
  { year: 2008, annualEarnings: "26778", insuranceDays: "300" },
  { year: 2009, annualEarnings: "30034", insuranceDays: "300" },
  { year: 2010, annualEarnings: "27565", insuranceDays: "300" },
  { year: 2011, annualEarnings: "26982", insuranceDays: "300" },
  { year: 2012, annualEarnings: "27612", insuranceDays: "300" },
  { year: 2013, annualEarnings: "27392", insuranceDays: "300" },
  { year: 2014, annualEarnings: "28866", insuranceDays: "300" },
  { year: 2015, annualEarnings: "29254", insuranceDays: "300" },
  { year: 2016, annualEarnings: "28778", insuranceDays: "300" },
  { year: 2017, annualEarnings: "29629", insuranceDays: "300" },
  { year: 2018, annualEarnings: "29867", insuranceDays: "300" },
  { year: 2019, annualEarnings: "37902", insuranceDays: "300" },
  { year: 2020, annualEarnings: "37305", insuranceDays: "300" },
  { year: 2021, annualEarnings: "50781", insuranceDays: "300" },
  { year: 2022, annualEarnings: "50438", insuranceDays: "300" },
  { year: 2023, annualEarnings: "51828", insuranceDays: "300" },
  { year: 2024, annualEarnings: "55250", insuranceDays: "300" },
  { year: 2025, annualEarnings: "57497", insuranceDays: "299" },
];

function createDevelopmentYearlyEarningsRows() {
  return createEmptyYearlyEarningsRows().map((row) => {
    const matchingRealRow = REAL_YEARLY_EARNINGS_ROWS.find(
      (realRow) => String(realRow.year) === String(row.year),
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
    timeInputMethod: "",
    insuranceDays: "",
    insuranceYears: "",
    insuranceMonths: "",
    insuranceExtraDays: "",
    fund: "",
    insuredType: "",
    employmentCategory: "",
    nonSalariedEarningsInputMode: "",
    tsaySinglePensionerStatus: "",
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
          timeInputMethod: group.timeInputMethod || "",
          insuranceDays: group.insuranceDays || "",
          insuranceYears: group.insuranceYears || "",
          insuranceMonths: group.insuranceMonths || "",
          insuranceExtraDays: group.insuranceExtraDays || "",
          fund: group.fund || "",
          insuredType: group.insuredType || "",
          employmentCategory: normalizeSavedEmploymentCategory({
            fund: group.fund,
            insuredType: group.insuredType,
            employmentCategory: group.employmentCategory,
          }),
          nonSalariedEarningsInputMode:
            normalizeSavedNonSalariedEarningsInputMode(
              group.nonSalariedEarningsInputMode,
            ),
          tsaySinglePensionerStatus: normalizeSavedYesNoValue(
            group.tsaySinglePensionerStatus,
          ),
          uniformedSpecialTimeDraft: normalizeSavedUniformedSpecialTimeDraft(
            group.uniformedSpecialTimeDraft,
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
  ].some((value) => String(value || "").trim() !== "");

  if (!hasAnyValue) {
    return null;
  }

  return {
    id: createInsurancePeriodGroupId(),
    timeInputMethod: timeInputMethod || "",
    insuranceDays: insuranceDays || "",
    insuranceYears: insuranceYears || "",
    insuranceMonths: insuranceMonths || "",
    insuranceExtraDays: insuranceExtraDays || "",
    fund: fund || "",
    insuredType: insuredType || "",
    employmentCategory: employmentCategory || "",
    nonSalariedEarningsInputMode: "",
    tsaySinglePensionerStatus: "",
    uniformedSpecialTimeDraft: createEmptyUniformedSpecialTimeDraft(),
  };
}

function normalizeSavedYesNoValue(value) {
  return value === "yes" || value === "no" ? value : "";
}

function createEmptyUniformedSpecialTimeDraft() {
  return {
    insuranceRegime: "",
    article36ACategory: "",
    combatFiveYearService: {
      status: "none",
      years: "",
      months: "",
      days: "",
      recognitionPeriod: "",
      paidAmount: "",
      contributionRatePercent: "",
      explicitPensionableEarningsBase: "",
      earningsReferenceYear: "",
    },
    specialSemesters: {
      status: "none",
      specialSemestersType: "",
      semestersCount: "",
      milestoneCompletionYear: "",
      recognitionPeriod: "",
      paidAmount: "",
      contributionRatePercent: "",
      explicitPensionableEarningsBase: "",
      earningsReferenceYear: "",
    },
  };
}

function normalizeSavedUniformedSpecialTimeDraft(value) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== "object") {
    return defaultValue;
  }

  return {
    insuranceRegime: value.insuranceRegime || "",
    article36ACategory: value.article36ACategory || "",
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

function normalizeSavedEmploymentCategory({
  fund,
  insuredType,
  employmentCategory,
}) {
  const normalizedFund = String(fund || "").trim();
  const normalizedInsuredType = String(insuredType || "").trim();
  const normalizedCategory = String(employmentCategory || "").trim();

  if (normalizedFund !== "ota") {
    return normalizedCategory;
  }

  // Η παλιά ενιαία επιλογή δεν αντιστοιχεί με βεβαιότητα σε μία από τις
  // τρεις νέες κατηγορίες. Ζητείται νέα επιλογή ώστε να μη γίνει λάθος.
  if (normalizedCategory === "ota_cleaning") {
    return "";
  }

  if (
    normalizedCategory === "ota_ika_yvae" &&
    normalizedInsuredType === "new"
  ) {
    return "";
  }

  return normalizedCategory;
}

function normalizeSavedArticle30SpecialRegimeUsageInput(value) {
  if (typeof value === "string") {
    return {
      vae: value,
      yvae: value,
      ota_ika_vae: value,
      ota_public_vae: value,
      ota_ika_yvae: value,
    };
  }

  if (!value || typeof value !== "object") {
    return {
      vae: "",
      yvae: "",
      ota_ika_vae: "",
      ota_public_vae: "",
      ota_ika_yvae: "",
    };
  }

  return {
    vae: value.vae || "",
    yvae: value.yvae || "",
    ota_ika_vae: value.ota_ika_vae || "",
    ota_public_vae: value.ota_public_vae || "",
    ota_ika_yvae: value.ota_ika_yvae || value.ota_cleaning || "",
  };
}

function createEmptyPlasticYearEntry() {
  return {
    id: `plastic_year_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recognitionStatus: "",
    recognitionMode: "",
    years: "",
    months: "",
    days: "",
    applicationDate: "",
    financialInputMode: "",
    monthlyPensionableBase: "",
    buyoutAmount: "",
    contributionRatePercent: "",
  };
}

function normalizeSavedPlasticYearsDraft(value) {
  const status = value?.status === "yes" ? "yes" : "no";
  const entries = Array.isArray(value?.entries)
    ? value.entries.slice(0, 10).map((entry) => ({
        ...createEmptyPlasticYearEntry(),
        ...(entry || {}),
        id: entry?.id || createEmptyPlasticYearEntry().id,
      }))
    : [];

  return {
    status,
    entries:
      status === "yes" && entries.length === 0
        ? [createEmptyPlasticYearEntry()]
        : entries,
  };
}

function normalizeSavedEtaaExtraBenefitDraft(value) {
  const defaultValue = {
    tsmede: {
      status: "",
      baseAmount: "",
      contributionYears: "",
      contributionMonths: "",
      hasHigherSalariedRateBefore2007: "no",
      higherRateYears: "",
      higherRateMonths: "",
      additionalPointsAboveTwelve: "",
      hasAdditionalTwoPercent: "no",
      additionalTwoPercentYears: "",
      additionalTwoPercentMonths: "",
    },
    tsay: {
      status: "",
      baseAmount: "",
      contributionYears: "",
      contributionMonths: "",
    },
  };

  if (!value || typeof value !== "object") {
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
  if (savedDraft.currentFormStep !== "contributory_yearly") {
    return "main";
  }

  if (savedDraft.contributoryEarningsInputMethod === "yearly_earnings") {
    return "contributory_yearly";
  }

  const simpleMode = normalizeSavedNonSalariedEarningsInputMode(
    savedDraft.simpleNonSalariedEarningsInputMode,
  );
  const hasGroupMode =
    Array.isArray(savedDraft.insurancePeriodGroups) &&
    savedDraft.insurancePeriodGroups.some((group) => {
      return Boolean(
        normalizeSavedNonSalariedEarningsInputMode(
          group?.nonSalariedEarningsInputMode,
        ),
      );
    });

  return simpleMode || hasGroupMode ? "contributory_yearly" : "main";
}

function normalizeSavedNonSalariedEarningsInputMode(value) {
  const normalizedValue = String(value || "").trim();

  if (
    normalizedValue === "annual_pensionable_earnings" ||
    normalizedValue === "annual_pension_contribution"
  ) {
    return normalizedValue;
  }

  return "";
}

function hasContributionBasedPeriodInput({
  insurancePeriodsInputMode,
  simpleFundInput,
  insurancePeriodGroups,
}) {
  const contributionBasedFunds = ["oaee", "etaa", "tsmede", "tsay", "oga"];

  if (insurancePeriodsInputMode === "simple") {
    return contributionBasedFunds.includes(simpleFundInput);
  }

  if (
    insurancePeriodsInputMode === "multiple" &&
    Array.isArray(insurancePeriodGroups)
  ) {
    return insurancePeriodGroups.some((group) => {
      return contributionBasedFunds.includes(group?.fund);
    });
  }

  return false;
}

function loadSavedDraft() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return parsedValue;
  } catch (error) {
    return {};
  }
}

function saveDraft(draft) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    // Αν ο browser δεν επιτρέπει localStorage, η φόρμα συνεχίζει να λειτουργεί.
  }
}

export default PensionCalculatorPage;



