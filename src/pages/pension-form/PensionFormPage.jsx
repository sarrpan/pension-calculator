import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


import BackendResponsePanel from "./components/BackendResponsePanel";
import MainPensionResultPanel from "./components/MainPensionResultPanel";
import PreparedInputPreview from "./components/PreparedInputPreview";
import ContributoryPensionInputSection from "./sections/ContributoryPensionInputSection";
import AuxiliaryContributionInputSection from "./sections/AuxiliaryContributionInputSection";
import EtaaExtraBenefitInputSection from "./sections/EtaaExtraBenefitInputSection";
import InsurancePeriodsInputSection from "./sections/InsurancePeriodsInputSection";
import PlasticYearsInputSection from "./sections/PlasticYearsInputSection";
import ParallelInsuranceInputSection from "./sections/ParallelInsuranceInputSection";
import NationalPensionInputSection from "./sections/NationalPensionInputSection";
import { errorSectionStyle } from "./utils/calculatorStyles";
import { analyzePensionForm } from "./utils/pensionFormAnalysis";
import {
  createPensionInputPackage,
  downloadPensionInputPackage,
} from "./utils/pensionInputPackage";
import { normalizeParallelInsuranceDraft } from "./utils/parallelInsuranceFormUtils";
import { normalizeAuxiliaryContributionDraft } from "./utils/auxiliaryContributionFormUtils";
import {
  deriveUniformedInsuranceRegimeFromDate,
  normalizeArticle36ACategoryForUniformedBody,
  normalizeUniformedBody,
} from "./utils/uniformedBodyOptions";

const PENSION_ENGINE_URL = String(
  import.meta.env.VITE_PENSION_ENGINE_URL || "",
).trim();
const PENSION_DEBUG_ENABLED =
  import.meta.env.DEV &&
  String(import.meta.env.VITE_PENSION_DEBUG || "")
    .trim()
    .toLowerCase() === "true";
const LOCAL_STORAGE_KEY = "geodora_pension_calculator_draft_v1";
const MAX_INSURANCE_PERIOD_GROUPS = 2;

function PensionFormPage({ calculatorEdition = "professional" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const savedDraft = useMemo(() => loadSavedDraft(), []);

  const [currentFormStep, setCurrentFormStep] = useState(() =>
    shouldOpenMainStep(location.search)
      ? "main"
      : getInitialFormStep(savedDraft),
  );

  const [birthDateInput, setBirthDateInput] = useState(
    savedDraft.birthDateInput || "",
  );
  const [firstInsuranceYearInput, setFirstInsuranceYearInput] = useState(
    savedDraft.firstInsuranceYearInput || "",
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

  const [insuranceTimeInputMethod, setInsuranceTimeInputMethod] = useState("");
  const [insuranceDaysInput, setInsuranceDaysInput] = useState("");
  const [insuranceYearsInput, setInsuranceYearsInput] = useState("");
  const [insuranceMonthsInput, setInsuranceMonthsInput] = useState("");
  const [insuranceExtraDaysInput, setInsuranceExtraDaysInput] = useState("");

  const [residenceYearsInput, setResidenceYearsInput] = useState(
    savedDraft.residenceYearsInput || "",
  );

  const [insurancePeriodsInputMode, setInsurancePeriodsInputMode] =
    useState("multiple");
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
  const [pensionInputExportError, setPensionInputExportError] = useState("");
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [mainValidationAttempted, setMainValidationAttempted] =
    useState(false);

  const derivedInsuredTypeInput =
    getInsuredTypeFromFirstInsuranceYear(
      firstInsuranceYearInput,
    );

  useEffect(() => {
    if (
      calculatorEdition !== "free" ||
      !derivedInsuredTypeInput
    ) {
      return;
    }

    setSimpleInsuredTypeInput(
      getInsuredTypeForFund({
        fund: simpleFundInput,
        derivedInsuredType: derivedInsuredTypeInput,
      }),
    );

    setSimpleEmploymentCategoryInput((currentValue) => {
      if (
        derivedInsuredTypeInput === "new" &&
        currentValue === "ota_ika_yvae"
      ) {
        return "";
      }

      return currentValue;
    });

    setInsurancePeriodGroups((currentGroups) => {
      let hasChanges = false;

      const nextGroups = currentGroups.map((group) => {
        const nextInsuredType = getInsuredTypeForFund({
          fund: group.fund,
          derivedInsuredType: derivedInsuredTypeInput,
        });
        const nextEmploymentCategory =
          derivedInsuredTypeInput === "new" &&
          group.employmentCategory === "ota_ika_yvae"
            ? ""
            : group.employmentCategory;

        if (
          group.insuredType === nextInsuredType &&
          group.employmentCategory === nextEmploymentCategory
        ) {
          return group;
        }

        hasChanges = true;

        return {
          ...group,
          insuredType: nextInsuredType,
          employmentCategory: nextEmploymentCategory,
        };
      });

      return hasChanges ? nextGroups : currentGroups;
    });

    clearBackendResult();
  }, [
    calculatorEdition,
    derivedInsuredTypeInput,
    simpleFundInput,
  ]);

  useEffect(() => {
    if (!shouldOpenMainStep(location.search)) {
      return;
    }

    setCurrentFormStep("main");
    setBackendResponse(null);
    setBackendError("");
    setCalculationResponse(null);
    setPensionInputExportError("");

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("start");

    const nextSearch = searchParams.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      currentFormStep,
      calculatorEdition,
      birthDateInput,
      firstInsuranceYearInput,
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
    firstInsuranceYearInput,
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

  const nationalFieldIssues = useMemo(() => {
    return getNationalFieldIssues({
      calculatorEdition,
      birthDateInput,
      firstInsuranceYearInput,
      pensionStartDateInput,
      pensionTypeInput,
      oldAgeCategoryInput,
      pensionModeInput,
      earlyReductionMonthsInput,
      disabilityCategoryInput,
      residenceYearsInput,
      insurancePeriodsInputMode,
      simpleFromDateInput,
      insurancePeriodGroups,
    });
  }, [
    calculatorEdition,
    birthDateInput,
    firstInsuranceYearInput,
    pensionStartDateInput,
    pensionTypeInput,
    oldAgeCategoryInput,
    pensionModeInput,
    earlyReductionMonthsInput,
    disabilityCategoryInput,
    residenceYearsInput,
    insurancePeriodsInputMode,
    simpleFromDateInput,
    insurancePeriodGroups,
  ]);

  const contributoryFieldIssues = useMemo(() => {
    return getContributoryFieldIssues({
      requiresExplicitMethod: !hasContributionBasedPeriodInput({
        insurancePeriodsInputMode,
        simpleFundInput,
        insurancePeriodGroups,
      }),
      contributoryEarningsInputMethod,
      averageMonthlyPensionableEarningsInput,
    });
  }, [
    calculatorEdition,
    insurancePeriodsInputMode,
    simpleFundInput,
    insurancePeriodGroups,
    contributoryEarningsInputMethod,
    averageMonthlyPensionableEarningsInput,
  ]);

  const plasticYearsFieldIssues = useMemo(() => {
    return getPlasticYearsFieldIssues({
      calculatorEdition,
      plasticYearsDraft,
    });
  }, [calculatorEdition, plasticYearsDraft]);

  const mainFieldIssues = useMemo(() => {
    return [
      ...nationalFieldIssues,
      ...contributoryFieldIssues,
      ...plasticYearsFieldIssues,
    ];
  }, [
    nationalFieldIssues,
    contributoryFieldIssues,
    plasticYearsFieldIssues,
  ]);

  useEffect(() => {
    saveDraft({
      currentFormStep,
      birthDateInput,
      firstInsuranceYearInput,
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
    firstInsuranceYearInput,
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

  function handlePensionScenarioChange(value) {
    clearBackendResult();

    if (value === "old_age_standard") {
      setPensionTypeInput("old_age");
      setOldAgeCategoryInput("standard");
      setDisabilityCategoryInput("");
      return;
    }

    if (value === "old_age_special_disease") {
      setPensionTypeInput("old_age");
      setOldAgeCategoryInput("special_disease");
      setPensionModeInput("");
      setEarlyReductionMonthsInput("");
      setDisabilityCategoryInput("");
      return;
    }

    if (value === "disability") {
      setPensionTypeInput("disability");
      setOldAgeCategoryInput("standard");
      setPensionModeInput("");
      setEarlyReductionMonthsInput("");
      setResidenceYearsInput("");
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
            uniformedBody: "",
            insuredType:
              calculatorEdition === "free"
                ? getInsuredTypeForFund({
                    fund: value,
                    derivedInsuredType: derivedInsuredTypeInput,
                  })
                : "",
            employmentCategory: "",
            nonSalariedEarningsInputMode: "",
            uniformedSpecialTimeDraft:
              createEmptyUniformedSpecialTimeDraft(),
          };
        }

        if (field === "uniformedBody") {
          const uniformedBody =
            normalizeUniformedBody(value);

          return {
            ...group,
            uniformedBody,
            uniformedSpecialTimeDraft:
              normalizeSavedUniformedSpecialTimeDraft(
                group.uniformedSpecialTimeDraft,
                {
                  fromDate: group.fromDate,
                  uniformedBody,
                },
              ),
          };
        }

        if (field === "fromDate") {
          return {
            ...group,
            fromDate: value,
            uniformedSpecialTimeDraft:
              group.fund === "uniformed"
                ? normalizeSavedUniformedSpecialTimeDraft(
                    group.uniformedSpecialTimeDraft,
                    {
                      fromDate: value,
                      uniformedBody: group.uniformedBody,
                    },
                  )
                : group.uniformedSpecialTimeDraft,
          };
        }

        if (field === "uniformedSpecialTimeDraft") {
          return {
            ...group,
            uniformedSpecialTimeDraft:
              normalizeSavedUniformedSpecialTimeDraft(
                value,
                {
                  fromDate: group.fromDate,
                  uniformedBody: group.uniformedBody,
                },
              ),
          };
        }

        return {
          ...group,
          [field]: value,
        };
      });
    });

    if (
      field === "fund" ||
      field === "employmentCategory" ||
      field === "uniformedBody"
    ) {
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

  function handleOpenParallelInsuranceStep() {
    setCurrentFormStep("parallel_insurance");
    clearBackendResult();
  }

  function handleMainFormSubmit() {
    if (currentFormStep === "main") {
      setMainValidationAttempted(true);

      if (mainFieldIssues.length > 0) {
        setBackendError("");
        setCalculationResponse(null);
        scrollToFormField(mainFieldIssues[0].targetId);
        return;
      }
    }

    handleCalculateFromInputPackage();
  }

  async function handleCalculateFromInputPackage() {
    setBackendResponse(null);
    setBackendError("");
    setCalculationResponse(null);

    if (!analysis.isReady || analysis.error) {
      const validationMessage = analysis.error
        ? `Ελέγξτε τα στοιχεία της φόρμας: ${analysis.error}`
        : "Συμπληρώστε τα υποχρεωτικά πεδία της φόρμας πριν τον υπολογισμό.";

      setBackendError(`FORM_VALIDATION::${validationMessage}`);
      return;
    }

    if (
      analysis.requiresContributoryYearlyStep &&
      currentFormStep !== "contributory_yearly"
    ) {
      setCurrentFormStep("contributory_yearly");
      return;
    }

    if (!PENSION_ENGINE_URL) {
      setBackendError(
        "Δεν έχει οριστεί η διεύθυνση του Pension Engine στη ρύθμιση VITE_PENSION_ENGINE_URL.",
      );
      return;
    }

    setIsSendingToBackend(true);

    try {
      const pensionInputPackage = createPensionInputPackage({
        calculationInput: analysis.calculationInput,
        calculatorEdition,
      });

      const response = await fetch(PENSION_ENGINE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pensionInputPackage),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        const responseError =
          data.error ||
          "Αποτυχία αποστολής ή υπολογισμού από το Pension Engine.";
        const isInputValidationError =
          response.status === 400 || response.status === 422;

        throw new Error(
          isInputValidationError
            ? `FORM_VALIDATION::${responseError}`
            : responseError,
        );
      }

      if (!data.pensionResult) {
        throw new Error(
          "Το Pension Engine ολοκλήρωσε την επεξεργασία χωρίς να επιστρέψει αποτέλεσμα σύνταξης.",
        );
      }

      setBackendResponse({
        ...data,
        message:
          "Το versioned JSON ελέγχθηκε, προετοιμάστηκε και υπολογίστηκε από το ανεξάρτητο Pension Engine.",
      });
      setCalculationResponse(data.pensionResult);
    } catch (error) {
      setBackendError(
        error?.message ||
          "Αποτυχία επικοινωνίας με το ανεξάρτητο Pension Engine.",
      );
    } finally {
      setIsSendingToBackend(false);
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

  const canShowDiagnostics =
    calculatorEdition === "professional" && PENSION_DEBUG_ENABLED;

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Υπολογισμός σύνταξης</h1>

      {canShowDiagnostics && (
        <section
          style={{
            marginBottom: "1rem",
            border: "1px solid #94a3b8",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>Λειτουργία ελέγχου</strong>
              <div style={{ color: "#475569", fontSize: "0.9rem" }}>
                Εμφανίζεται μόνο όταν είναι ενεργό το VITE_PENSION_DEBUG.
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsDiagnosticsOpen((currentValue) => !currentValue)
              }
              style={{ padding: "0.55rem 0.9rem" }}
            >
              {isDiagnosticsOpen
                ? "Κλείσιμο ελέγχου δεδομένων"
                : "Έλεγχος δεδομένων"}
            </button>
          </div>
        </section>
      )}

      <p style={{ color: "#555" }}>
        {currentFormStep === "contributory_yearly"
          ? hasNonSalariedPeriodInput
            ? "Βήμα 2: Ετήσια στοιχεία ασφαλιστικών περιόδων"
            : "Βήμα 2: Αποδοχές και ένσημα ανά έτος"
          : currentFormStep === "parallel_insurance"
            ? "Ξεχωριστή φόρμα: Ανάλυση παράλληλης ασφάλισης"
            : "Βήμα 1: Βασικά στοιχεία σύνταξης"}
      </p>

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
          handleMainFormSubmit();
        }}
      >
        {currentFormStep === "main" && (
          <>
            <NationalPensionInputSection
              birthDateInput={birthDateInput}
              firstInsuranceYearInput={firstInsuranceYearInput}
              pensionStartDateInput={pensionStartDateInput}
              pensionTypeInput={pensionTypeInput}
              oldAgeCategoryInput={oldAgeCategoryInput}
              pensionModeInput={pensionModeInput}
              earlyReductionMonthsInput={earlyReductionMonthsInput}
              disabilityCategoryInput={disabilityCategoryInput}
              residenceYearsInput={residenceYearsInput}
              validationAttempted={mainValidationAttempted}
              fieldIssues={nationalFieldIssues}
              onBirthDateChange={(value) => {
                setBirthDateInput(value);
                clearBackendResult();
              }}
              onFirstInsuranceYearChange={(value) => {
                setFirstInsuranceYearInput(value);
                clearBackendResult();
              }}
              onPensionStartDateChange={(value) => {
                setPensionStartDateInput(value);
                clearBackendResult();
              }}
              onPensionScenarioChange={handlePensionScenarioChange}
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
              globalInsuredTypeInput={derivedInsuredTypeInput}
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
              validationAttempted={mainValidationAttempted}
              fieldIssues={plasticYearsFieldIssues}
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
          validationAttempted={mainValidationAttempted}
          fieldIssues={contributoryFieldIssues}
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

        {currentFormStep === "main" &&
          mainValidationAttempted &&
          mainFieldIssues.length > 0 && (
            <section
              role="alert"
              style={requiredFieldsSummaryStyle}
            >
              <strong>
                Συμπληρώστε τα παρακάτω υποχρεωτικά πεδία:
              </strong>

              <ul style={requiredFieldsListStyle}>
                {mainFieldIssues.map((issue) => (
                  <li key={issue.key}>
                    <button
                      type="button"
                      onClick={() =>
                        scrollToFormField(issue.targetId)
                      }
                      style={requiredFieldLinkStyle}
                    >
                      {issue.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

        {currentFormStep !== "parallel_insurance" && (
          <button
            type="submit"
            disabled={isSendingToBackend}
            style={{
              padding: "0.6rem 1rem",
              cursor: isSendingToBackend
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitButtonText}
          </button>
        )}
      </form>

      {analysis.error && <p style={{ color: "crimson" }}>{analysis.error}</p>}

      {backendError && (
        <section style={errorSectionStyle}>
          <h2>Δεν ήταν δυνατός ο υπολογισμός</h2>
          <p style={{ color: "crimson" }}>
            {getUserFacingBackendError(backendError)}
          </p>
        </section>
      )}

      {canShowDiagnostics && isDiagnosticsOpen && (
        <section
          style={{
            marginTop: "1rem",
            border: "2px solid #64748b",
            borderRadius: "10px",
            padding: "1rem",
            background: "#f8fafc",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Έλεγχος δεδομένων</h2>
          <p style={{ color: "#475569" }}>
            Οι παρακάτω ενότητες είναι μόνο για δικό μας έλεγχο. Δεν
            εμφανίζονται στην κανονική λειτουργία της εφαρμογής.
          </p>

          {analysis.error && (
            <details open style={diagnosticDetailsStyle}>
              <summary style={diagnosticSummaryStyle}>
                1. Σφάλμα προετοιμασίας της φόρμας
              </summary>
              <p style={{ color: "crimson" }}>{analysis.error}</p>
            </details>
          )}

          {!analysis.error && analysis.isReady && (
            <details open style={diagnosticDetailsStyle}>
              <summary style={diagnosticSummaryStyle}>
                1. Τι καταχώρισε και τι κατάλαβε η εφαρμογή
              </summary>
              <PreparedInputPreview analysis={analysis} />
            </details>
          )}

          {!analysis.error && analysis.isReady && (
            <details style={diagnosticDetailsStyle}>
              <summary style={diagnosticSummaryStyle}>
                2. Αρχείο που στέλνεται στον Pension Engine
              </summary>

              <p style={{ color: "#475569" }}>
                Περιέχει ακριβώς τα ίδια δεδομένα εισόδου που αποστέλλονται
                αυτόματα στον ανεξάρτητο Pension Engine.
              </p>

              <button
                type="button"
                onClick={handleExportPensionInputJson}
                style={{ padding: "0.6rem 1rem" }}
              >
                Λήψη διαγνωστικού JSON
              </button>

              {pensionInputExportError && (
                <p style={{ color: "crimson" }}>{pensionInputExportError}</p>
              )}
            </details>
          )}

          {backendError && (
            <details style={diagnosticDetailsStyle}>
              <summary style={diagnosticSummaryStyle}>
                3. Πλήρες τεχνικό μήνυμα σφάλματος
              </summary>
              <pre style={diagnosticPreStyle}>{backendError}</pre>
            </details>
          )}

          {backendResponse && (
            <details style={diagnosticDetailsStyle}>
              <summary style={diagnosticSummaryStyle}>
                3. Απάντηση του Pension Engine
              </summary>
              <BackendResponsePanel backendResponse={backendResponse} />
            </details>
          )}

          {!backendError && !backendResponse && (
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Η απάντηση του Pension Engine θα εμφανιστεί εδώ μετά τον
              υπολογισμό.
            </p>
          )}
        </section>
      )}

      {calculationResponse && (
        <MainPensionResultPanel
          calculationResponse={calculationResponse}
          showDiagnostics={canShowDiagnostics && isDiagnosticsOpen}
        />
      )}
    </main>
  );
}

function getContributoryFieldIssues({
  requiresExplicitMethod,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
}) {
  if (!requiresExplicitMethod) {
    return [];
  }

  const issues = [];
  const method = String(
    contributoryEarningsInputMethod || "",
  ).trim();

  if (!method) {
    issues.push({
      key: "contributoryEarningsInputMethod",
      targetId: "contributoryEarningsMethodField",
      label: "Τρόπος εισαγωγής συντάξιμων αποδοχών",
      message:
        "Επιλέξτε πώς θέλετε να εισαγάγετε τις συντάξιμες αποδοχές.",
    });

    return issues;
  }

  if (!["average_monthly", "yearly_earnings"].includes(method)) {
    issues.push({
      key: "contributoryEarningsInputMethod",
      targetId: "contributoryEarningsMethodField",
      label: "Τρόπος εισαγωγής συντάξιμων αποδοχών",
      message:
        "Η επιλογή τρόπου εισαγωγής συντάξιμων αποδοχών δεν είναι έγκυρη.",
    });

    return issues;
  }

  if (method !== "average_monthly") {
    return issues;
  }

  const normalizedAmount = String(
    averageMonthlyPensionableEarningsInput || "",
  )
    .trim()
    .replace(",", ".");

  if (!normalizedAmount) {
    issues.push({
      key: "averageMonthlyPensionableEarnings",
      targetId: "averageMonthlyPensionableEarningsField",
      label: "Μέσος μηνιαίος συντάξιμος μισθός",
      message:
        "Συμπληρώστε τον μέσο μηνιαίο συντάξιμο μισθό.",
    });

    return issues;
  }

  if (
    !/^\d+(\.\d+)?$/.test(normalizedAmount) ||
    Number(normalizedAmount) <= 0
  ) {
    issues.push({
      key: "averageMonthlyPensionableEarnings",
      targetId: "averageMonthlyPensionableEarningsField",
      label: "Μέσος μηνιαίος συντάξιμος μισθός",
      message:
        "Ο μέσος μηνιαίος συντάξιμος μισθός πρέπει να είναι αριθμός μεγαλύτερος από 0.",
    });
  }

  return issues;
}

function getPlasticYearsFieldIssues({
  calculatorEdition,
  plasticYearsDraft,
}) {
  if (calculatorEdition !== "free") {
    return [];
  }

  const issues = [];
  const choice = resolveFreePlasticYearsChoice(
    plasticYearsDraft,
  );

  function addIssue(key, targetId, label, message) {
    issues.push({
      key,
      targetId,
      label,
      message,
    });
  }

  if (
    ![
      "none",
      "free",
      "paid_known",
      "paid_unknown",
    ].includes(choice)
  ) {
    addIssue(
      "plasticYearsChoice",
      "plasticYearsChoiceField",
      "Πλασματικός χρόνος",
      "Επιλέξτε ποια περίπτωση πλασματικού χρόνου ισχύει.",
    );

    return issues;
  }

  if (!["free", "paid_known"].includes(choice)) {
    return issues;
  }

  const entry = Array.isArray(plasticYearsDraft?.entries)
    ? plasticYearsDraft.entries[0] || {}
    : {};

  if (!isValidPlasticYearsDurationInput(entry)) {
    addIssue(
      "plasticYearsDuration",
      "plasticYearsDurationField",
      choice === "free"
        ? "Πλασματικός χρόνος χωρίς εξαγορά"
        : "Χρόνος εξαγοράς πλασματικών ετών",
      choice === "free"
        ? "Συμπληρώστε τον πλασματικό χρόνο χωρίς εξαγορά με έτη, μήνες και ημέρες."
        : "Συμπληρώστε έγκυρο χρόνο εξαγοράς μεγαλύτερο από 0.",
    );
  }

  if (choice === "free") {
    return issues;
  }

  if (!isValidPlasticYearsApplicationYear(entry.applicationYear)) {
    addIssue(
      "plasticYearsApplicationYear",
      "plasticYearsApplicationYearField",
      "Έτος αίτησης εξαγοράς",
      "Συμπληρώστε έγκυρο τετραψήφιο έτος αίτησης εξαγοράς.",
    );
  }

  if (
    String(entry.applicationYear || "").trim() === "2016" &&
    ![
      "until_2016_05_12",
      "from_2016_05_13",
    ].includes(entry.applicationPeriod2016)
  ) {
    addIssue(
      "plasticYearsApplicationPeriod",
      "plasticYearsApplicationPeriodField",
      "Χρονική περίοδος αίτησης μέσα στο 2016",
      "Επιλέξτε αν η αίτηση έγινε έως 12/05/2016 ή από 13/05/2016 και μετά.",
    );
  }

  if (!isPositiveDecimalText(entry.buyoutAmount)) {
    addIssue(
      "plasticYearsBuyoutAmount",
      "plasticYearsBuyoutAmountField",
      "Συνολικό ποσό εξαγοράς",
      "Συμπληρώστε συνολικό ποσό εξαγοράς μεγαλύτερο από 0.",
    );
  }

  return issues;
}

function isValidPlasticYearsDurationInput(entry = {}) {
  const years = parseOptionalWholeNumber(entry.years);
  const months = parseOptionalWholeNumber(entry.months);
  const days = parseOptionalWholeNumber(entry.days);

  if (years === null || months === null || days === null) {
    return false;
  }

  if (months > 11 || days > 24) {
    return false;
  }

  return years * 300 + months * 25 + days > 0;
}

function isValidPlasticYearsApplicationYear(value) {
  const text = String(value || "").trim();

  if (!/^\d{4}$/.test(text)) {
    return false;
  }

  const year = Number(text);
  return year >= 1900 && year <= 2100;
}

function parseOptionalWholeNumber(value) {
  const text = String(value || "").trim();

  if (!text) {
    return 0;
  }

  return /^\d+$/.test(text) ? Number(text) : null;
}

function isPositiveDecimalText(value) {
  const normalizedText = String(value || "")
    .trim()
    .replace(",", ".");

  return (
    /^\d+(\.\d+)?$/.test(normalizedText) &&
    Number(normalizedText) > 0
  );
}

function getNationalFieldIssues({
  calculatorEdition,
  birthDateInput,
  firstInsuranceYearInput,
  pensionStartDateInput,
  pensionTypeInput,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  disabilityCategoryInput,
  residenceYearsInput,
  insurancePeriodsInputMode,
  simpleFromDateInput,
  insurancePeriodGroups,
}) {
  const issues = [];

  function addIssue(key, targetId, label, message) {
    issues.push({
      key,
      targetId,
      label,
      message,
    });
  }

  if (!hasTextValue(birthDateInput)) {
    addIssue(
      "birthDate",
      "birthDateField",
      "Ημερομηνία γέννησης",
      "Συμπληρώστε την ημερομηνία γέννησης.",
    );
  } else if (!isValidBirthDateInput(birthDateInput)) {
    addIssue(
      "birthDate",
      "birthDateField",
      "Ημερομηνία γέννησης",
      "Συμπληρώστε έγκυρη ημερομηνία γέννησης, π.χ. 31/12/1967.",
    );
  }

  const firstInsuranceYear =
    parseFirstInsuranceYearInput(firstInsuranceYearInput);

  if (calculatorEdition === "free") {
    if (!hasTextValue(firstInsuranceYearInput)) {
      addIssue(
        "firstInsuranceYear",
        "firstInsuranceYearField",
        "Έτος πρώτης ασφάλισης",
        "Συμπληρώστε το έτος της πρώτης σας ασφάλισης.",
      );
    } else if (firstInsuranceYear === null) {
      addIssue(
        "firstInsuranceYear",
        "firstInsuranceYearField",
        "Έτος πρώτης ασφάλισης",
        "Το έτος πρώτης ασφάλισης πρέπει να είναι τετραψήφιο έτος.",
      );
    } else {
      const parsedBirthDate = parseRequiredDateInput(
        birthDateInput,
        { allowTwoDigitYear: false },
      );
      const parsedPensionDate = parseRequiredDateInput(
        pensionStartDateInput,
        { allowTwoDigitYear: true },
      );
      const earliestDeclaredStartYear =
        getEarliestDeclaredInsuranceStartYear({
          insurancePeriodsInputMode,
          simpleFromDateInput,
          insurancePeriodGroups,
        });

      if (
        parsedBirthDate &&
        firstInsuranceYear < parsedBirthDate.getUTCFullYear()
      ) {
        addIssue(
          "firstInsuranceYear",
          "firstInsuranceYearField",
          "Έτος πρώτης ασφάλισης",
          "Το έτος πρώτης ασφάλισης δεν μπορεί να είναι πριν από το έτος γέννησης.",
        );
      } else if (
        parsedPensionDate &&
        firstInsuranceYear > parsedPensionDate.getUTCFullYear()
      ) {
        addIssue(
          "firstInsuranceYear",
          "firstInsuranceYearField",
          "Έτος πρώτης ασφάλισης",
          "Το έτος πρώτης ασφάλισης δεν μπορεί να είναι μετά την έναρξη της σύνταξης.",
        );
      } else if (
        earliestDeclaredStartYear !== null &&
        earliestDeclaredStartYear < firstInsuranceYear
      ) {
        addIssue(
          "firstInsuranceYear",
          "firstInsuranceYearField",
          "Έτος πρώτης ασφάλισης",
          `Έχετε δηλώσει ασφαλιστική περίοδο που ξεκινά το ${earliestDeclaredStartYear}, πριν από το έτος πρώτης ασφάλισης ${firstInsuranceYear}. Ελέγξτε το έτος.`,
        );
      }
    }
  }

  if (!hasTextValue(pensionStartDateInput)) {
    addIssue(
      "pensionStartDate",
      "pensionStartDateField",
      "Ημερομηνία έναρξης σύνταξης",
      "Συμπληρώστε την ημερομηνία έναρξης σύνταξης.",
    );
  } else if (!isValidPensionDateInput(pensionStartDateInput)) {
    addIssue(
      "pensionStartDate",
      "pensionStartDateField",
      "Ημερομηνία έναρξης σύνταξης",
      "Συμπληρώστε έγκυρη ημερομηνία έναρξης σύνταξης.",
    );
  }

  const pensionScenarioInput = resolvePensionScenarioInput({
    pensionTypeInput,
    oldAgeCategoryInput,
  });

  if (!pensionScenarioInput) {
    addIssue(
      "pensionScenario",
      "pensionTypeField",
      "Είδος σύνταξης",
      "Επιλέξτε το είδος της σύνταξης.",
    );
  }

  if (
    pensionScenarioInput === "old_age_standard" &&
    !hasTextValue(pensionModeInput)
  ) {
    addIssue(
      "pensionMode",
      "pensionModeField",
      "Πλήρης ή μειωμένη σύνταξη",
      "Επιλέξτε αν η σύνταξη είναι πλήρης ή μειωμένη.",
    );
  }

  if (
    pensionScenarioInput === "old_age_standard" &&
    pensionModeInput === "reduced"
  ) {
    if (!hasTextValue(earlyReductionMonthsInput)) {
      addIssue(
        "earlyReductionMonths",
        "earlyReductionMonthsField",
        "Μήνες πρόωρης μείωσης",
        "Συμπληρώστε τους μήνες πρόωρης μείωσης.",
      );
    } else if (
      !isValidEarlyReductionMonths(
        earlyReductionMonthsInput,
      )
    ) {
      addIssue(
        "earlyReductionMonths",
        "earlyReductionMonthsField",
        "Μήνες πρόωρης μείωσης",
        "Οι μήνες πρόωρης μείωσης πρέπει να είναι ακέραιος αριθμός από 0 έως 60.",
      );
    }
  }

  if (
    pensionScenarioInput === "old_age_standard" ||
    pensionScenarioInput === "old_age_special_disease"
  ) {
    if (!hasTextValue(residenceYearsInput)) {
      addIssue(
        "residenceYears",
        "residenceYearsField",
        "Έτη νόμιμης διαμονής",
        "Συμπληρώστε τα έτη νόμιμης διαμονής στην Ελλάδα.",
      );
    } else if (!isValidNonNegativeDecimal(residenceYearsInput)) {
      addIssue(
        "residenceYears",
        "residenceYearsField",
        "Έτη νόμιμης διαμονής",
        "Τα έτη νόμιμης διαμονής πρέπει να είναι μη αρνητικός αριθμός.",
      );
    }
  }

  if (
    pensionScenarioInput === "disability" &&
    !hasTextValue(disabilityCategoryInput)
  ) {
    addIssue(
      "disabilityCategory",
      "disabilityCategoryField",
      "Κατηγορία ποσοστού αναπηρίας",
      "Επιλέξτε την κατηγορία ποσοστού αναπηρίας.",
    );
  }

  return issues;
}

function resolvePensionScenarioInput({
  pensionTypeInput,
  oldAgeCategoryInput,
}) {
  if (pensionTypeInput === "disability") {
    return "disability";
  }

  if (
    pensionTypeInput === "old_age" &&
    oldAgeCategoryInput === "standard"
  ) {
    return "old_age_standard";
  }

  if (
    pensionTypeInput === "old_age" &&
    oldAgeCategoryInput === "special_disease"
  ) {
    return "old_age_special_disease";
  }

  return "";
}

function parseFirstInsuranceYearInput(value) {
  const text = String(value || "").trim();

  if (!/^\d{4}$/.test(text)) {
    return null;
  }

  const year = Number(text);

  return year >= 1900 && year <= 2100 ? year : null;
}

function getInsuredTypeFromFirstInsuranceYear(value) {
  const year = parseFirstInsuranceYearInput(value);

  if (year === null) {
    return "";
  }

  return year <= 1992 ? "old" : "new";
}

function getInsuredTypeForFund({
  fund,
  derivedInsuredType,
}) {
  if (!fund) {
    return "";
  }

  if (
    ["oaee", "etaa", "tsmede", "tsay", "oga"].includes(
      fund,
    )
  ) {
    return "not_applicable";
  }

  return derivedInsuredType || "";
}

function getEarliestDeclaredInsuranceStartYear({
  insurancePeriodsInputMode,
  simpleFromDateInput,
  insurancePeriodGroups,
}) {
  const dateValues =
    insurancePeriodsInputMode === "simple"
      ? [simpleFromDateInput]
      : (Array.isArray(insurancePeriodGroups)
          ? insurancePeriodGroups
          : []
        ).map((group) => group?.fromDate);

  const years = dateValues
    .map((value) =>
      parseRequiredDateInput(value, {
        allowTwoDigitYear: true,
      }),
    )
    .filter(Boolean)
    .map((date) => date.getUTCFullYear());

  return years.length > 0 ? Math.min(...years) : null;
}

function isValidBirthDateInput(value) {
  const parsed = parseRequiredDateInput(value, {
    allowTwoDigitYear: false,
  });

  return parsed !== null;
}

function isValidPensionDateInput(value) {
  const parsed = parseRequiredDateInput(value, {
    allowTwoDigitYear: true,
  });

  return parsed !== null;
}

function parseRequiredDateInput(value, { allowTwoDigitYear }) {
  const normalizedValue = String(value || "").trim();
  const yearPattern = allowTwoDigitYear
    ? "(\\d{2}|\\d{4})"
    : "(\\d{4})";
  const separatedPattern = new RegExp(
    `^(\\d{1,2})[\\/\\-. ](\\d{1,2})[\\/\\-. ]${yearPattern}$`,
  );
  const separatedMatch = normalizedValue.match(separatedPattern);
  const digitsOnly = normalizedValue.replace(/\D/g, "");

  let day;
  let month;
  let yearText;

  if (separatedMatch) {
    day = Number(separatedMatch[1]);
    month = Number(separatedMatch[2]);
    yearText = separatedMatch[3];
  } else if (digitsOnly.length === 8) {
    day = Number(digitsOnly.slice(0, 2));
    month = Number(digitsOnly.slice(2, 4));
    yearText = digitsOnly.slice(4, 8);
  } else if (allowTwoDigitYear && digitsOnly.length === 6) {
    day = Number(digitsOnly.slice(0, 2));
    month = Number(digitsOnly.slice(2, 4));
    yearText = digitsOnly.slice(4, 6);
  } else {
    return null;
  }

  const year =
    yearText.length === 2
      ? normalizeRequiredTwoDigitYear(yearText)
      : Number(yearText);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  return isRealDate ? parsedDate : null;
}

function normalizeRequiredTwoDigitYear(value) {
  const year = Number(value);
  return year <= 69 ? 2000 + year : 1900 + year;
}

function isValidEarlyReductionMonths(value) {
  const text = String(value || "").trim();

  if (!/^\d+$/.test(text)) {
    return false;
  }

  const months = Number(text);
  return months >= 0 && months <= 60;
}

function isValidNonNegativeDecimal(value) {
  const normalizedText = String(value || "")
    .trim()
    .replace(",", ".");

  return /^\d+(\.\d+)?$/.test(normalizedText);
}

function scrollToFormField(targetId) {
  window.requestAnimationFrame(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const focusableElement = target.querySelector(
      "input, select, textarea, button",
    );

    focusableElement?.focus({
      preventScroll: true,
    });
  });
}

function hasTextValue(value) {
  return String(value || "").trim() !== "";
}

const requiredFieldsSummaryStyle = {
  marginBottom: "1rem",
  padding: "0.85rem 1rem",
  border: "1px solid #dc2626",
  borderRadius: "8px",
  background: "#fff7f7",
  color: "#991b1b",
};

const requiredFieldsListStyle = {
  margin: "0.6rem 0 0",
  paddingLeft: "1.25rem",
};

const requiredFieldLinkStyle = {
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#b91c1c",
  textDecoration: "underline",
  cursor: "pointer",
  font: "inherit",
};

const diagnosticDetailsStyle = {
  marginTop: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "0.75rem",
  background: "#ffffff",
};

const diagnosticSummaryStyle = {
  cursor: "pointer",
  fontWeight: 700,
  color: "#334155",
};

const diagnosticPreStyle = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#0f172a",
  color: "#e2e8f0",
  padding: "0.75rem",
  borderRadius: "6px",
};

function getUserFacingBackendError(errorMessage) {
  const normalizedMessage = String(errorMessage || "").trim();
  const formValidationPrefix = "FORM_VALIDATION::";

  if (normalizedMessage.startsWith(formValidationPrefix)) {
    return normalizedMessage.slice(formValidationPrefix.length);
  }

  return (
    "Δεν ήταν δυνατή η ολοκλήρωση του υπολογισμού. " +
    "Δοκιμάστε ξανά σε λίγο."
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

  return "Υπολογισμός σύνταξης";
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
    fromDate: "",
    toDate: "",
    timeInputMethod: "",
    insuranceDays: "",
    insuranceYears: "",
    insuranceMonths: "",
    insuranceExtraDays: "",
    fund: "",
    uniformedBody: "",
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
  if (savedDraft.insurancePeriodsInputMode === "simple") {
    return [createInsurancePeriodGroupFromSimpleDraft(savedDraft)];
  }

  if (Array.isArray(savedDraft.insurancePeriodGroups)) {
    const normalizedGroups = savedDraft.insurancePeriodGroups
      .slice(0, MAX_INSURANCE_PERIOD_GROUPS)
      .map((group) => {
        const uniformedBody =
          group.fund === "uniformed"
            ? normalizeUniformedBody(group.uniformedBody)
            : "";

        return {
          id: group.id || createInsurancePeriodGroupId(),
          fromDate: group.fromDate || "",
          toDate: group.toDate || "",
          timeInputMethod: group.timeInputMethod || "",
          insuranceDays: group.insuranceDays || "",
          insuranceYears: group.insuranceYears || "",
          insuranceMonths: group.insuranceMonths || "",
          insuranceExtraDays: group.insuranceExtraDays || "",
          fund: group.fund || "",
          uniformedBody,
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
          uniformedSpecialTimeDraft:
            normalizeSavedUniformedSpecialTimeDraft(
              group.uniformedSpecialTimeDraft,
              {
                fromDate: group.fromDate,
                uniformedBody,
              },
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

function createInsurancePeriodGroupFromSimpleDraft(savedDraft = {}) {
  const uniformedBody =
    savedDraft.simpleFundInput === "uniformed"
      ? normalizeUniformedBody(
          savedDraft.simpleUniformedBodyInput,
        )
      : "";

  return {
    id: "period_1",
    fromDate: savedDraft.simpleFromDateInput || "",
    toDate: savedDraft.simpleToDateInput || "",
    timeInputMethod: savedDraft.simpleTimeInputMethod || "",
    insuranceDays: savedDraft.simpleInsuranceDaysInput || "",
    insuranceYears: savedDraft.simpleInsuranceYearsInput || "",
    insuranceMonths: savedDraft.simpleInsuranceMonthsInput || "",
    insuranceExtraDays: savedDraft.simpleInsuranceExtraDaysInput || "",
    fund: savedDraft.simpleFundInput || "",
    uniformedBody,
    insuredType: savedDraft.simpleInsuredTypeInput || "",
    employmentCategory: normalizeSavedEmploymentCategory({
      fund: savedDraft.simpleFundInput,
      insuredType: savedDraft.simpleInsuredTypeInput,
      employmentCategory: savedDraft.simpleEmploymentCategoryInput,
    }),
    nonSalariedEarningsInputMode:
      normalizeSavedNonSalariedEarningsInputMode(
        savedDraft.simpleNonSalariedEarningsInputMode,
      ),
    tsaySinglePensionerStatus: normalizeSavedYesNoValue(
      savedDraft.simpleTsaySinglePensionerStatus,
    ),
    uniformedSpecialTimeDraft:
      normalizeSavedUniformedSpecialTimeDraft(
        savedDraft.simpleUniformedSpecialTimeDraft,
        {
          fromDate: savedDraft.simpleFromDateInput,
          uniformedBody,
        },
      ),
  };
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
    fromDate: "",
    toDate: "",
    timeInputMethod: timeInputMethod || "",
    insuranceDays: insuranceDays || "",
    insuranceYears: insuranceYears || "",
    insuranceMonths: insuranceMonths || "",
    insuranceExtraDays: insuranceExtraDays || "",
    fund: fund || "",
    uniformedBody: "",
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

function normalizeSavedUniformedSpecialTimeDraft(
  value,
  {
    fromDate = "",
    uniformedBody = "",
  } = {},
) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();
  const normalizedValue =
    value && typeof value === "object"
      ? value
      : {};
  const derivedInsuranceRegime =
    deriveUniformedInsuranceRegimeFromDate(fromDate);
  return {
    insuranceRegime:
      derivedInsuranceRegime ||
      normalizedValue.insuranceRegime ||
      "",
    article36ACategory:
      normalizeArticle36ACategoryForUniformedBody(
        normalizedValue.article36ACategory,
        uniformedBody,
      ),
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(normalizedValue.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(normalizedValue.specialSemesters || {}),
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
    applicationYear: "",
    applicationPeriod2016: "",
  };
}

function normalizeSavedPlasticYearsDraft(value) {
  const freeFlowChoice = resolveFreePlasticYearsChoice(value);
  const explicitStatus = String(value?.status || "").trim();
  const status =
    freeFlowChoice === "none"
      ? "no"
      : freeFlowChoice
        ? "yes"
        : explicitStatus === "yes" || explicitStatus === "no"
          ? explicitStatus
          : "";
  const entries = Array.isArray(value?.entries)
    ? value.entries.slice(0, 10).map((entry) => ({
        ...createEmptyPlasticYearEntry(),
        ...(entry || {}),
        id: entry?.id || createEmptyPlasticYearEntry().id,
      }))
    : [];

  return {
    ...(value && typeof value === "object" ? value : {}),
    status,
    freeFlowChoice,
    entries:
      entries.length > 0
        ? entries
        : [createEmptyPlasticYearEntry()],
  };
}

function resolveFreePlasticYearsChoice(value) {
  const explicitChoice = String(
    value?.freeFlowChoice || "",
  ).trim();

  if (
    [
      "none",
      "free",
      "paid_known",
      "paid_unknown",
    ].includes(explicitChoice)
  ) {
    return explicitChoice;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (value.status === "no") {
    return "none";
  }

  if (value.status !== "yes") {
    return "";
  }

  const entry = Array.isArray(value.entries)
    ? value.entries[0] || {}
    : {};

  if (entry.recognitionMode === "free") {
    return "free";
  }

  if (
    entry.recognitionMode === "paid" &&
    isPositiveDecimalText(entry.buyoutAmount)
  ) {
    return "paid_known";
  }

  return "paid_unknown";
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

function shouldOpenMainStep(search = "") {
  const searchParams = new URLSearchParams(search);
  return searchParams.get("start") === "main";
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

export default PensionFormPage;
