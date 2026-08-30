
import React from "react";

import { InputWithLabel, RadioOption } from "../components/FormControls";
import { fieldsetStyle } from "../utils/calculatorStyles";
import { normalizeParallelInsuranceDraft } from "../utils/parallelInsuranceFormUtils";

const CONTRIBUTION_BASED_FUNDS = ["oaee", "etaa", "tsmede", "tsay", "oga"];

const FUND_LABELS = {
  oaee: "ΟΑΕΕ",
  etaa: "ΕΤΑΑ",
  tsmede: "ΤΣΜΕΔΕ",
  tsay: "ΤΣΑΥ — Ελεύθερος επαγγελματίας",
  tsay_salaried: "ΤΣΑΥ — Μισθωτός",
  oga: "πρώην ΟΓΑ",
};

const NON_SALARIED_MODE_LABELS = {
  annual_pensionable_earnings: "Ετήσιο ασφαλιστέο / συντάξιμο εισόδημα",
  annual_pension_contribution: "Ετήσια εισφορά κύριας σύνταξης",
};

function ContributoryPensionInputSection({
  currentFormStep,
  contributoryEarningsInputMethod,
  averageMonthlyPensionableEarningsInput,
  yearlyEarningsRows,
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleNonSalariedEarningsInputMode,
  simpleFromDateInput,
  simpleToDateInput,
  insurancePeriodGroups,
  parallelInsuranceSegments,
  parallelInsuranceDraft,
  validationAttempted = false,
  fieldIssues = [],
  onContributoryEarningsInputMethodChange,
  onAverageMonthlyPensionableEarningsChange,
  onYearlyEarningsRowChange,
  onLoadDevelopmentYearlyEarnings,
}) {
  const yearlyInputContext = buildYearlyInputContext({
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleNonSalariedEarningsInputMode,
    simpleFromDateInput,
    simpleToDateInput,
    insurancePeriodGroups,
    parallelInsuranceSegments,
    parallelInsuranceDraft,
  });
  const displayedYearlyEarningsRows = buildDisplayedYearlyEarningsRows({
    rows: yearlyEarningsRows,
    latestDeclaredEmploymentYear:
      yearlyInputContext.latestDeclaredEmploymentYear,
  });

  const earningsMethodIssue = findFieldIssue(
    fieldIssues,
    "contributoryEarningsInputMethod",
  );
  const averageMonthlyIssue = findFieldIssue(
    fieldIssues,
    "averageMonthlyPensionableEarnings",
  );
  const hasSelectedEarningsMethod = [
    "average_monthly",
    "yearly_earnings",
  ].includes(contributoryEarningsInputMethod);
  const hasValidAverageMonthlyAmount =
    contributoryEarningsInputMethod !== "average_monthly" ||
    Boolean(
      !averageMonthlyIssue &&
      String(averageMonthlyPensionableEarningsInput || "").trim(),
    );
  const hasCompletedContributoryInput =
    hasSelectedEarningsMethod &&
    hasValidAverageMonthlyAmount;

  if (currentFormStep === "contributory_yearly") {
    return (
      <fieldset style={fieldsetStyle}>
        <legend>
          {yearlyInputContext.isActive
            ? "Ετήσια στοιχεία ασφαλιστικών περιόδων"
            : "Αποδοχές και ένσημα ανά έτος"}
        </legend>

        <p style={{ marginTop: 0 }}>
          {yearlyInputContext.isActive
            ? "Συμπληρώστε για κάθε έτος το ποσό που αντιστοιχεί στον τρόπο εισαγωγής της ασφαλιστικής περιόδου και τις ημέρες ασφάλισης. Το backend θα καλέσει τη σωστή ρουτίνα ΟΑΕΕ / ΕΤΑΑ / ΟΓΑ και θα δημιουργήσει τις ετήσιες συντάξιμες αποδοχές."
            : "Συμπληρώστε τις ετήσιες αποδοχές και τα ένσημα / ημέρες ασφάλισης ανά έτος. Ο μέσος μηνιαίος συντάξιμος μισθός δεν υπολογίζεται εδώ. Θα υπολογιστεί αργότερα από τον calculator με τους ΔΤΚ."}
        </p>

        {yearlyInputContext.latestDeclaredEmploymentYear !== null && (
          <p style={{ color: "#475569" }}>
            Εμφανίζονται μόνο έτη έως το{" "}
            <strong>{yearlyInputContext.latestDeclaredEmploymentYear}</strong>,
            επειδή αυτό είναι το τελευταίο έτος εργασίας που έχει δηλωθεί.
          </p>
        )}

        {onLoadDevelopmentYearlyEarnings && (
          <button
            type="button"
            onClick={onLoadDevelopmentYearlyEarnings}
            style={{ marginBottom: "1rem", padding: "0.5rem 0.75rem" }}
          >
            Φόρτωση ετήσιων ποσών δοκιμής
          </button>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Έτος</th>
                <th style={tableHeaderStyle}>
                  {yearlyInputContext.amountColumnLabel}
                </th>
                <th style={tableHeaderStyle}>Ένσημα / ημέρες</th>
              </tr>
            </thead>

            <tbody>
              {displayedYearlyEarningsRows.map(
                ({ row, sourceIndex }, displayIndex) => {
                  const rowMeaning = resolveRowMeaning({
                    year: row.year,
                    context: yearlyInputContext,
                  });

                  return (
                    <tr key={row.id || row.year || displayIndex}>
                      <td style={tableCellStyle}>
                        <input
                          type="text"
                          value={row.year}
                          onChange={(event) => {
                            onYearlyEarningsRowChange(
                              sourceIndex,
                              "year",
                              event.target.value,
                            );
                          }}
                          style={yearInputStyle}
                        />
                      </td>

                      <td style={tableCellStyle}>
                        <input
                          type="text"
                          value={row.annualEarnings}
                          onChange={(event) => {
                            onYearlyEarningsRowChange(
                              sourceIndex,
                              "annualEarnings",
                              event.target.value,
                            );
                          }}
                          placeholder="π.χ. 18000,50"
                          style={moneyInputStyle}
                        />

                        {rowMeaning && (
                          <div style={rowMeaningStyle}>{rowMeaning}</div>
                        )}
                      </td>

                      <td style={tableCellStyle}>
                        <input
                          type="text"
                          value={row.insuranceDays}
                          onChange={(event) => {
                            onYearlyEarningsRowChange(
                              sourceIndex,
                              "insuranceDays",
                              event.target.value,
                            );
                          }}
                          placeholder="π.χ. 300"
                          style={daysInputStyle}
                        />
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </fieldset>
    );
  }

  if (yearlyInputContext.isActive) {
    return (
      <fieldset style={fieldsetStyle}>
        <legend>Στοιχεία ανταποδοτικής σύνταξης</legend>

        <p style={{ marginTop: 0 }}>
          Για τις μη μισθωτές περιόδους ο τρόπος εισαγωγής έχει ήδη επιλεγεί
          μέσα σε κάθε ασφαλιστική περίοδο.
        </p>

        <p style={{ color: "#8a5a00", marginBottom: 0 }}>
          Με την προετοιμασία θα ανοίξει ο ετήσιος πίνακας. Για κάθε έτος θα
          δηλώσετε το αντίστοιχο ασφαλιστέο / συντάξιμο εισόδημα ή την εισφορά
          κύριας σύνταξης και τις ημέρες ασφάλισης.
        </p>
      </fieldset>
    );
  }

  return (
    <fieldset
      id="contributoryEarningsMethodField"
      aria-invalid={
        validationAttempted && earningsMethodIssue ? "true" : "false"
      }
      style={{
        ...fieldsetStyle,
        ...getValidationContainerStyle({
          validationAttempted,
          issue: earningsMethodIssue,
          completed: hasCompletedContributoryInput,
        }),
      }}
    >
      <legend>
        Στοιχεία ανταποδοτικής σύνταξης
        <ValidationStatus
          validationAttempted={validationAttempted}
          issue={earningsMethodIssue}
          completed={hasCompletedContributoryInput}
        />
      </legend>

      <p style={{ marginTop: 0 }}>
        Πώς θέλετε να εισάγετε τις συντάξιμες αποδοχές;
      </p>

      <RadioOption
        id="contributoryAverageMonthly"
        name="contributoryEarningsInputMethod"
        value="average_monthly"
        checked={contributoryEarningsInputMethod === "average_monthly"}
        onChange={onContributoryEarningsInputMethodChange}
        label="Έχω έτοιμο μέσο μηνιαίο συντάξιμο μισθό"
      />

      <RadioOption
        id="contributoryYearlyEarnings"
        name="contributoryEarningsInputMethod"
        value="yearly_earnings"
        checked={contributoryEarningsInputMethod === "yearly_earnings"}
        onChange={onContributoryEarningsInputMethodChange}
        label="Θέλω να εισάγω αποδοχές και ένσημα ανά έτος"
      />

      {validationAttempted && earningsMethodIssue && (
        <ValidationMessage message={earningsMethodIssue.message} />
      )}

      {contributoryEarningsInputMethod === "average_monthly" && (
        <div
          id="averageMonthlyPensionableEarningsField"
          aria-invalid={
            validationAttempted && averageMonthlyIssue
              ? "true"
              : "false"
          }
          style={{
            ...averageMonthlyFieldStyle,
            ...getValidationContainerStyle({
              validationAttempted,
              issue: averageMonthlyIssue,
              completed: Boolean(hasValidAverageMonthlyAmount),
            }),
          }}
        >
          <div style={averageMonthlyHeadingStyle}>
            <strong>Μέσος μηνιαίος συντάξιμος μισθός</strong>

            <ValidationStatus
              validationAttempted={validationAttempted}
              issue={averageMonthlyIssue}
              completed={Boolean(hasValidAverageMonthlyAmount)}
            />
          </div>

          <InputWithLabel
            id="averageMonthlyPensionableEarnings"
            label="Ποσό"
            value={averageMonthlyPensionableEarningsInput}
            onChange={onAverageMonthlyPensionableEarningsChange}
            placeholder="π.χ. 1450,75"
            width="180px"
          />

          {validationAttempted && averageMonthlyIssue && (
            <ValidationMessage message={averageMonthlyIssue.message} />
          )}
        </div>
      )}

      {contributoryEarningsInputMethod === "yearly_earnings" && (
        <p style={{ color: "#8a5a00" }}>
          Με την επιλογή αυτή, μετά τα βασικά στοιχεία θα ανοίξει επόμενη φόρμα
          για αποδοχές και ένσημα ανά έτος.
        </p>
      )}
    </fieldset>
  );
}

function findFieldIssue(fieldIssues, key) {
  return (Array.isArray(fieldIssues) ? fieldIssues : []).find(
    (issue) => issue?.key === key,
  );
}

function getValidationContainerStyle({
  validationAttempted,
  issue,
  completed,
}) {
  if (validationAttempted && issue) {
    return {
      border: "2px solid #dc2626",
      background: "#fff7f7",
    };
  }

  if (completed && !issue) {
    return {
      border: "1px solid #22c55e",
      background: "#f0fdf4",
    };
  }

  return {};
}

function ValidationStatus({
  validationAttempted,
  issue,
  completed,
}) {
  if (validationAttempted && issue) {
    return <span style={requiredStatusStyle}>Απαιτείται</span>;
  }

  if (completed && !issue) {
    return <span style={completedStatusStyle}>✓ Συμπληρώθηκε</span>;
  }

  return <span style={neutralRequiredStyle}>Απαιτείται</span>;
}

function ValidationMessage({ message }) {
  return (
    <p role="alert" style={validationMessageStyle}>
      {message}
    </p>
  );
}

function buildYearlyInputContext({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleNonSalariedEarningsInputMode,
  simpleFromDateInput,
  simpleToDateInput,
  insurancePeriodGroups,
  parallelInsuranceSegments,
  parallelInsuranceDraft,
}) {
  const periods = [];

  if (insurancePeriodsInputMode === "simple") {
    periods.push({
      id: "period_1",
      fund: simpleFundInput,
      inputMode: simpleNonSalariedEarningsInputMode,
      fromYear: parseDisplayOrIsoYear(simpleFromDateInput),
      toYear: parseDisplayOrIsoYear(simpleToDateInput),
    });
  }

  if (
    insurancePeriodsInputMode === "multiple" &&
    Array.isArray(insurancePeriodGroups)
  ) {
    for (const group of insurancePeriodGroups) {
      periods.push({
        id: group?.id || "",
        fund: group?.fund || "",
        inputMode: group?.nonSalariedEarningsInputMode || "",
        fromYear: parseDisplayOrIsoYear(group?.fromDate),
        toYear: parseDisplayOrIsoYear(group?.toDate),
      });
    }
  }

  const safeParallelInsuranceSegments = Array.isArray(parallelInsuranceSegments)
    ? parallelInsuranceSegments
    : [];
  const hasPost2017ParallelSegment = safeParallelInsuranceSegments.some(
    (segment) => segment?.periodType === "from_2017",
  );
  const nonSalariedPeriods = periods.filter((period) => {
    return CONTRIBUTION_BASED_FUNDS.includes(period.fund);
  });
  const modeSet = new Set(
    nonSalariedPeriods.map((period) => period.inputMode).filter(Boolean),
  );

  let amountColumnLabel = "Ετήσιες αποδοχές";

  if (hasPost2017ParallelSegment) {
    amountColumnLabel = "Ετήσιο ποσό σύμφωνα με την ένδειξη κάθε έτους";
  } else if (nonSalariedPeriods.length > 0 && modeSet.size === 1) {
    const [singleMode] = Array.from(modeSet);
    amountColumnLabel = NON_SALARIED_MODE_LABELS[singleMode] || "Ετήσιο ποσό";
  } else if (nonSalariedPeriods.length > 0) {
    amountColumnLabel = "Ετήσιο ποσό σύμφωνα με την περίοδο";
  }

  const declaredToYears = periods
    .map((period) => period.toYear)
    .filter((year) => Number.isInteger(year));
  const latestDeclaredEmploymentYear =
    declaredToYears.length > 0 ? Math.max(...declaredToYears) : null;

  return {
    isActive: nonSalariedPeriods.length > 0 || hasPost2017ParallelSegment,
    periods,
    amountColumnLabel,
    latestDeclaredEmploymentYear,
    parallelInsuranceSegments: safeParallelInsuranceSegments,
    parallelInsuranceDraft: normalizeParallelInsuranceDraft(
      parallelInsuranceDraft,
    ),
  };
}

function buildDisplayedYearlyEarningsRows({
  rows,
  latestDeclaredEmploymentYear,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows
    .map((row, sourceIndex) => ({ row, sourceIndex }))
    .filter(({ row }) => {
      if (latestDeclaredEmploymentYear === null) {
        return true;
      }

      const numericYear = Number(String(row?.year || "").trim());

      if (!Number.isInteger(numericYear)) {
        return true;
      }

      return numericYear <= latestDeclaredEmploymentYear;
    });
}

function resolveRowMeaning({ year, context }) {
  if (!context.isActive) {
    return null;
  }

  const numericYear = Number(year);

  if (!Number.isInteger(numericYear)) {
    return null;
  }

  const matchingPeriods = context.periods.filter((period) => {
    return (
      period.fromYear !== null &&
      period.toYear !== null &&
      numericYear >= period.fromYear &&
      numericYear <= period.toYear
    );
  });

  if (matchingPeriods.length > 1) {
    const parallelMeaning = resolveParallelRowMeaning({
      year: numericYear,
      matchingPeriods,
      context,
    });

    return parallelMeaning;
  }

  if (matchingPeriods.length !== 1) {
    return null;
  }

  const period = matchingPeriods[0];

  if (!CONTRIBUTION_BASED_FUNDS.includes(period.fund)) {
    return "Ετήσιες αποδοχές μισθωτής περιόδου";
  }

  const modeLabel = NON_SALARIED_MODE_LABELS[period.inputMode];
  const fundLabel = FUND_LABELS[period.fund] || period.fund;

  if (!modeLabel) {
    return null;
  }

  return `${modeLabel} — ${fundLabel}`;
}

function resolveParallelRowMeaning({ year, matchingPeriods, context }) {
  const matchingIds = matchingPeriods
    .map((period) => String(period?.id || ""))
    .sort((left, right) => left.localeCompare(right));

  const segment = context.parallelInsuranceSegments.find((candidate) => {
    const fromYear = parseDisplayOrIsoYear(candidate?.fromDate);
    const toYear = parseDisplayOrIsoYear(candidate?.toDate);
    const candidateIds = [...(candidate?.periodIds || [])].sort((left, right) =>
      left.localeCompare(right),
    );

    return (
      fromYear !== null &&
      toYear !== null &&
      year >= fromYear &&
      year <= toYear &&
      matchingIds.length === candidateIds.length &&
      matchingIds.every((periodId, index) => periodId === candidateIds[index])
    );
  });

  if (!segment) {
    return "Απαιτείται ανάλυση παράλληλης ασφάλισης για το έτος.";
  }

  if (segment.periodType === "from_2017") {
    return "Συνολικές ετήσιες συντάξιμες αποδοχές όλων των παράλληλων δραστηριοτήτων";
  }

  const segmentDraft =
    context.parallelInsuranceDraft.segments[segment.id] || {};
  const mainPeriod = matchingPeriods.find(
    (period) => period.id === segmentDraft.timeCountingPeriodId,
  );

  if (!mainPeriod) {
    return "Επιλέξτε πρώτα ποια περίοδος θα χρησιμοποιηθεί ως βασική.";
  }

  if (!CONTRIBUTION_BASED_FUNDS.includes(mainPeriod.fund)) {
    return `Βασικές ετήσιες αποδοχές — ${
      FUND_LABELS[mainPeriod.fund] || mainPeriod.fund
    }`;
  }

  const modeLabel = NON_SALARIED_MODE_LABELS[mainPeriod.inputMode];
  const fundLabel = FUND_LABELS[mainPeriod.fund] || mainPeriod.fund;

  return modeLabel
    ? `${modeLabel} της βασικής περιόδου — ${fundLabel}`
    : `Ετήσιο ποσό της βασικής περιόδου — ${fundLabel}`;
}

function parseDisplayOrIsoYear(value) {
  const text = String(value || "").trim();

  const isoMatch = /^(\d{4})-\d{1,2}-\d{1,2}$/.exec(text);

  if (isoMatch) {
    return Number(isoMatch[1]);
  }

  const displayMatch =
    /^\d{1,2}[\/\-. ]\d{1,2}[\/\-. ](\d{4})$/.exec(text);

  if (displayMatch) {
    return Number(displayMatch[1]);
  }

  return null;
}

const requiredStatusStyle = {
  marginLeft: "0.6rem",
  color: "#b91c1c",
  fontSize: "0.8rem",
  fontWeight: 700,
};

const completedStatusStyle = {
  marginLeft: "0.6rem",
  color: "#15803d",
  fontSize: "0.8rem",
  fontWeight: 700,
};

const neutralRequiredStyle = {
  marginLeft: "0.6rem",
  color: "#64748b",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const validationMessageStyle = {
  margin: "0.55rem 0 0",
  color: "#b91c1c",
  fontWeight: 600,
};

const averageMonthlyFieldStyle = {
  marginTop: "1rem",
  padding: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
};

const averageMonthlyHeadingStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  marginBottom: "0.6rem",
  flexWrap: "wrap",
};

const tableHeaderStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "0.5rem",
};

const tableCellStyle = {
  borderBottom: "1px solid #eee",
  padding: "0.5rem",
  verticalAlign: "top",
};

const yearInputStyle = {
  width: "80px",
  padding: "0.4rem",
};

const moneyInputStyle = {
  width: "180px",
  padding: "0.4rem",
};

const daysInputStyle = {
  width: "120px",
  padding: "0.4rem",
};

const rowMeaningStyle = {
  marginTop: "0.35rem",
  color: "#475569",
  fontSize: "0.85rem",
};

export default ContributoryPensionInputSection;
