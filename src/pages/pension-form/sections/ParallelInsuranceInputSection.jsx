import React from "react";

import { fieldsetStyle } from "../utils/calculatorStyles";
import {
  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS,
  PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT,
  PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE,
  PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002,
  PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED,
  normalizeParallelInsuranceDraft,
} from "../utils/parallelInsuranceFormUtils";

function ParallelInsuranceInputSection({
  calculatorEdition,
  detectedSegments,
  value,
  onChange,
  viewMode = "summary",
  onOpenDetails,
}) {
  const segments = Array.isArray(detectedSegments) ? detectedSegments : [];

  if (calculatorEdition === "free" || segments.length === 0) {
    return null;
  }

  const safeValue = normalizeParallelInsuranceDraft(value);

  if (viewMode === "summary") {
    return (
      <ParallelInsuranceSummary
        segments={segments}
        value={safeValue}
        onOpenDetails={onOpenDetails}
      />
    );
  }

  function updateSegment(segmentId, updater) {
    const currentSegment = safeValue.segments[segmentId] || {
      timeCountingPeriodId: "",
      baseEarningsConfirmed: false,
      combinedEarningsConfirmed: false,
      annualAuxiliaryContributionAmounts: {},
      additionalPeriods: {},
    };

    onChange({
      ...safeValue,
      segments: {
        ...safeValue.segments,
        [segmentId]: updater(currentSegment),
      },
    });
  }

  function updateAdditionalPeriod({ segmentId, periodId, field, fieldValue }) {
    updateSegment(segmentId, (currentSegment) => ({
      ...currentSegment,
      additionalPeriods: {
        ...(currentSegment.additionalPeriods || {}),
        [periodId]: {
          ...(currentSegment.additionalPeriods?.[periodId] || {}),
          [field]: fieldValue,
        },
      },
    }));
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Αναλυτική παράλληλη ασφάλιση</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Εδώ καταχωρίζονται τα αναλυτικά στοιχεία των περιόδων που ισχύουν
        ταυτόχρονα. Η βασική φόρμα παραμένει καθαρή και εμφανίζει μόνο τη
        σύνοψη της ανάλυσης.
      </p>

      <p style={noticeStyle}>
        Η σημερινή καταχώριση είναι το ενδιάμεσο βήμα ελέγχου του calculator.
        Στην τελική πλήρη έκδοση οι τεχνικές τιμές θα παράγονται από το
        αναλυτικό ασφαλιστικό ιστορικό ή τις καρτέλες.
      </p>

      {segments.map((segment, index) => {
        const segmentValue = safeValue.segments[segment.id] || {};
        const timeCountingPeriodId = segmentValue.timeCountingPeriodId || "";
        const additionalPeriods = segment.periods.filter(
          (period) => period.id !== timeCountingPeriodId,
        );
        const segmentHasPositiveDuplicateDays = additionalPeriods.some(
          (period) => {
            const periodValue =
              segmentValue.additionalPeriods?.[period.id] || {};
            return (
              parseNonNegativeDecimalInput(
                periodValue.insuranceDaysToRemove,
              ) > 0
            );
          },
        );

        return (
          <div key={segment.id} style={segmentBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Παράλληλο διάστημα {index + 1}</h3>

            <p>
              <strong>Διάστημα:</strong> {segment.fromDateDisplay} έως{" "}
              {segment.toDateDisplay}
            </p>

            <p>
              <strong>Τρόπος χειρισμού:</strong>{" "}
              {segment.periodType === "until_2016"
                ? "Ο χρόνος μετρά μία φορά και η άλλη ασφάλιση μπορεί να δώσει πρόσθετη παροχή."
                : "Ο χρόνος μετρά μία φορά και οι αποδοχές των δραστηριοτήτων συνυπολογίζονται."}
            </p>

            {Number.isFinite(segment.maximumDuplicateInsuranceDays) && (
              <p style={helpTextStyle}>
                Πιθανό συνολικό ανώτατο όριο ημερών που μπορούν να αφαιρεθούν
                σε αυτό το διάστημα: {segment.maximumDuplicateInsuranceDays}.
                Το πραγματικό πλήθος το δηλώνει ο χρήστης.
              </p>
            )}

            <SelectWithLabel
              id={`${segment.id}_timeCountingPeriod`}
              label="Ποια περίοδος θα κρατηθεί στον συνολικό ασφαλιστικό χρόνο;"
              value={timeCountingPeriodId}
              onChange={(fieldValue) => {
                updateSegment(segment.id, (currentSegment) => ({
                  ...currentSegment,
                  timeCountingPeriodId: fieldValue,
                  additionalPeriods: Object.fromEntries(
                    Object.entries(currentSegment.additionalPeriods || {}).filter(
                      ([periodId]) => periodId !== fieldValue,
                    ),
                  ),
                }));
              }}
              options={[
                { value: "", label: "Επιλέξτε περίοδο" },
                ...segment.periods.map((period) => ({
                  value: period.id,
                  label: period.label,
                })),
              ]}
            />

            {timeCountingPeriodId && (
              <>
                {additionalPeriods.map((period) => {
                  const additionalValue =
                    segmentValue.additionalPeriods?.[period.id] || {};
                  const displayedDays =
                    additionalValue.insuranceDaysToRemove ?? "";
                  const remainingDaysInfo =
                    getRemainingDuplicateDaysInfo({
                      segments,
                      value: safeValue,
                      segmentId: segment.id,
                      periodId: period.id,
                    });
                  const maximumDuplicateInsuranceDays =
                    remainingDaysInfo.maximumForCurrentInput;
                  const hasPositiveDuplicateDays =
                    parseNonNegativeDecimalInput(displayedDays) > 0;
                  const usesPost2002ReferenceEarnings =
                    segment.referenceEarningsMode ===
                    PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002;
                  const contributionInputMode = usesPost2002ReferenceEarnings
                    ? PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE
                    : additionalValue.contributionInputMode ||
                      PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS;

                  return (
                    <div key={period.id} style={additionalPeriodBoxStyle}>
                      <h4 style={{ marginTop: 0 }}>
                        Παράλληλη περίοδος: {period.label}
                      </h4>

                      <TextInputWithLabel
                        id={`${segment.id}_${period.id}_days`}
                        label={buildDuplicateDaysLabel(
                          maximumDuplicateInsuranceDays,
                        )}
                        value={displayedDays}
                        onChange={(fieldValue) => {
                          updateAdditionalPeriod({
                            segmentId: segment.id,
                            periodId: period.id,
                            field: "insuranceDaysToRemove",
                            fieldValue,
                          });
                        }}
                        placeholder="π.χ. 300"
                      />

                      <p style={helpTextStyle}>
                        Δηλώστε τις πραγματικές ημέρες αυτής της περιόδου που
                        έχουν ήδη μετρηθεί στην επιλεγμένη ή σε άλλη προηγούμενη
                        περίοδο. Η εφαρμογή δεν τις υπολογίζει από τις
                        ημερομηνίες. Επιτρέπεται και το 0.
                      </p>

                      {remainingDaysInfo.overlapGroupMaximum !== null && (
                        <p style={remainingTextStyle}>
                          Κοινό συνολικό όριο για όλα τα τεχνικά τμήματα της
                          ίδιας επικάλυψης: {" "}
                          {remainingDaysInfo.overlapGroupMaximum}. Έχουν ήδη
                          δηλωθεί στα υπόλοιπα τμήματα: {" "}
                          {remainingDaysInfo.usedOutsideCurrent}. Διαθέσιμο
                          υπόλοιπο για αυτό το πεδίο: {" "}
                          {remainingDaysInfo.maximumForCurrentInput}.
                        </p>
                      )}

                      {segment.periodType === "until_2016" &&
                        hasPositiveDuplicateDays &&
                        usesPost2002ReferenceEarnings && (
                          <p style={noticeStyle}>
                            Για παράλληλο χρόνο πριν από το 2002 δεν ζητούνται
                            παλιές αποδοχές, συνολικό ποσό εισφορών ή μονάδες
                            εισφοράς από τον χρήστη. Η χρηματική βάση θα ληφθεί
                            από τον μέσο συντάξιμο μισθό του 2002 και μετά και
                            το ποσοστό κύριας σύνταξης θα προσδιοριστεί αυτόματα
                            από τον φορέα, την κατηγορία και τη χρονική περίοδο.
                          </p>
                        )}

                      {segment.periodType === "until_2016" &&
                        hasPositiveDuplicateDays &&
                        !usesPost2002ReferenceEarnings && (
                        <>
                          <SelectWithLabel
                            id={`${segment.id}_${period.id}_contributionInputMode`}
                            label="Πώς θα δηλωθούν οι εισφορές της παράλληλης περιόδου;"
                            value={contributionInputMode}
                            onChange={(fieldValue) => {
                              updateAdditionalPeriod({
                                segmentId: segment.id,
                                periodId: period.id,
                                field: "contributionInputMode",
                                fieldValue,
                              });
                            }}
                            options={[
                              {
                                value:
                                  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS,
                                label:
                                  "Γνωρίζω τη μέση μηνιαία βάση και το ποσοστό εισφοράς",
                              },
                              {
                                value:
                                  PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT,
                                label:
                                  "Γνωρίζω το συνολικό ποσό εισφορών κύριας σύνταξης",
                              },
                            ]}
                          />

                          {contributionInputMode ===
                          PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT ? (
                            <>
                              <TextInputWithLabel
                                id={`${segment.id}_${period.id}_totalContributionAmount`}
                                label="Συνολικό ποσό εισφορών κύριας σύνταξης για το παράλληλο διάστημα"
                                value={
                                  additionalValue.totalContributionAmount || ""
                                }
                                onChange={(fieldValue) => {
                                  updateAdditionalPeriod({
                                    segmentId: segment.id,
                                    periodId: period.id,
                                    field: "totalContributionAmount",
                                    fieldValue,
                                  });
                                }}
                                placeholder="π.χ. 16800"
                              />

                              <p style={helpTextStyle}>
                                Δηλώνεται το συνολικό ποσό εισφορών κύριας
                                σύνταξης για αυτό ακριβώς το παράλληλο διάστημα,
                                μαζί με την εργοδοτική εισφορά όπου υπάρχει. Δεν
                                περιλαμβάνονται υγεία, επικουρική, εφάπαξ ή ποσό
                                εξαγοράς αναγνωρισμένου χρόνου.
                              </p>
                            </>
                          ) : (
                            <>
                              <div style={gridStyle}>
                                <TextInputWithLabel
                                  id={`${segment.id}_${period.id}_base`}
                                  label="Μέση μηνιαία βάση παράλληλης εισφοράς"
                                  value={
                                    additionalValue.monthlyBaseAmount || ""
                                  }
                                  onChange={(fieldValue) => {
                                    updateAdditionalPeriod({
                                      segmentId: segment.id,
                                      periodId: period.id,
                                      field: "monthlyBaseAmount",
                                      fieldValue,
                                    });
                                  }}
                                  placeholder="π.χ. 1200"
                                />

                                <TextInputWithLabel
                                  id={`${segment.id}_${period.id}_units`}
                                  label="Μονάδες εισφοράς"
                                  value={
                                    additionalValue.contributionUnits || ""
                                  }
                                  onChange={(fieldValue) => {
                                    updateAdditionalPeriod({
                                      segmentId: segment.id,
                                      periodId: period.id,
                                      field: "contributionUnits",
                                      fieldValue,
                                    });
                                  }}
                                  placeholder="π.χ. 20"
                                />
                              </div>

                              <p style={helpTextStyle}>
                                Οι μονάδες εισφοράς είναι το συνολικό ποσοστό
                                κύριας σύνταξης. Για παράδειγμα, 20 μονάδες
                                σημαίνουν συνολική εισφορά 20%.
                              </p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {segment.periodType === "until_2016" &&
                  segment.referenceEarningsMode ===
                    PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED &&
                  segmentHasPositiveDuplicateDays && (
                  <CheckboxWithLabel
                    id={`${segment.id}_baseEarningsConfirmed`}
                    checked={segmentValue.baseEarningsConfirmed === true}
                    onChange={(checked) => {
                      updateSegment(segment.id, (currentSegment) => ({
                        ...currentSegment,
                        baseEarningsConfirmed: checked,
                      }));
                    }}
                    label="Επιβεβαιώνω ότι οι βασικές αποδοχές δεν περιλαμβάνουν δεύτερη φορά την παράλληλη δραστηριότητα."
                  />
                )}

                {segment.periodType === "from_2017" &&
                  segmentHasPositiveDuplicateDays && (
                  <>
                    <CheckboxWithLabel
                      id={`${segment.id}_combinedEarningsConfirmed`}
                      checked={segmentValue.combinedEarningsConfirmed === true}
                      onChange={(checked) => {
                        updateSegment(segment.id, (currentSegment) => ({
                          ...currentSegment,
                          combinedEarningsConfirmed: checked,
                        }));
                      }}
                      label="Επιβεβαιώνω ότι τα ετήσια στοιχεία περιλαμβάνουν τις αποδοχές όλων των παράλληλων δραστηριοτήτων."
                    />

                    <details style={annualAuxiliaryDetailsStyle}>
                      <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                        Πραγματικές επικουρικές εισφορές ανά έτος από το 2017
                      </summary>

                      <p style={helpTextStyle}>
                        Συμπληρώστε το συνολικό πραγματικό ποσό επικουρικών
                        εισφορών κάθε έτους μόνο όταν οι παράλληλες
                        δραστηριότητες έχουν διαφορετικά ποσοστά επικουρικής ή
                        όταν το ποσό είναι γνωστό από το ασφαλιστικό ιστορικό.
                        Το ποσό αφορά όλες τις δραστηριότητες μαζί και
                        χρησιμοποιείται απευθείας στο NDC.
                      </p>

                      <div style={annualAuxiliaryGridStyle}>
                        {getSegmentYears(segment).map((year) => (
                          <TextInputWithLabel
                            key={`${segment.id}_auxiliary_${year}`}
                            id={`${segment.id}_auxiliary_${year}`}
                            label={`${year} — συνολικές επικουρικές εισφορές (€)`}
                            value={
                              segmentValue.annualAuxiliaryContributionAmounts?.[
                                year
                              ] ?? ""
                            }
                            onChange={(fieldValue) => {
                              updateSegment(segment.id, (currentSegment) => ({
                                ...currentSegment,
                                annualAuxiliaryContributionAmounts: {
                                  ...(currentSegment.annualAuxiliaryContributionAmounts || {}),
                                  [year]: fieldValue,
                                },
                              }));
                            }}
                            placeholder="π.χ. 2.400"
                          />
                        ))}
                      </div>
                    </details>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

function getSegmentYears(segment = {}) {
  const fromYear = Number(String(segment.fromDate || "").slice(0, 4));
  const toYear = Number(String(segment.toDate || "").slice(0, 4));

  if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
    return [];
  }

  const firstYear = Math.max(2017, fromYear);
  const years = [];

  for (let year = firstYear; year <= toYear; year += 1) {
    years.push(year);
  }

  return years;
}

function ParallelInsuranceSummary({ segments, value, onOpenDetails }) {
  const progress = buildParallelInsuranceProgress(segments, value);

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Παράλληλη ασφάλιση</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Εντοπίστηκαν {segments.length} επικαλυπτόμενα ασφαλιστικά {segments.length === 1 ? "διάστημα" : "διαστήματα"}.
        Η ανάλυση γίνεται σε ξεχωριστή φόρμα, όπως η αναλυτική καταχώριση
        αποδοχών ανά έτος.
      </p>

      <div style={summaryBoxStyle}>
        <strong>Κατάσταση:</strong>{" "}
        {progress.configuredSegments === segments.length
          ? "Έχουν δηλωθεί οι βασικές επιλογές και οι ημέρες για όλα τα διαστήματα."
          : `${progress.configuredSegments} από ${segments.length} διαστήματα έχουν βασική καταχώριση.`}
      </div>

      <button
        type="button"
        onClick={onOpenDetails}
        style={openDetailsButtonStyle}
      >
        {progress.hasAnyData
          ? "Συνέχεια ανάλυσης παράλληλης ασφάλισης"
          : "Άνοιγμα ανάλυσης παράλληλης ασφάλισης"}
      </button>
    </fieldset>
  );
}

function buildParallelInsuranceProgress(segments, value) {
  let configuredSegments = 0;
  let hasAnyData = false;

  for (const segment of segments) {
    const segmentValue = value.segments?.[segment.id] || {};
    const countingPeriodId = String(
      segmentValue.timeCountingPeriodId || "",
    ).trim();

    if (countingPeriodId) {
      hasAnyData = true;
    }

    if (!segment.periodIds.includes(countingPeriodId)) {
      continue;
    }

    const additionalPeriodIds = segment.periodIds.filter(
      (periodId) => periodId !== countingPeriodId,
    );
    const hasAllDayValues = additionalPeriodIds.every((periodId) => {
      const rawValue =
        segmentValue.additionalPeriods?.[periodId]?.insuranceDaysToRemove;
      const normalizedValue = String(rawValue ?? "").trim();

      if (normalizedValue !== "") {
        hasAnyData = true;
      }

      return /^\d+([.,]\d+)?$/.test(normalizedValue);
    });

    if (hasAllDayValues) {
      configuredSegments += 1;
    }
  }

  return {
    configuredSegments,
    hasAnyData,
  };
}

function getRemainingDuplicateDaysInfo({
  segments,
  value,
  segmentId,
  periodId,
}) {
  const currentSegment = (Array.isArray(segments) ? segments : []).find(
    (segment) => segment.id === segmentId,
  );

  if (!currentSegment) {
    return {
      overlapGroupMaximum: null,
      usedOutsideCurrent: 0,
      maximumForCurrentInput: null,
    };
  }

  const overlapGroupId = getOverlapGroupId(currentSegment);
  const groupSegments = (Array.isArray(segments) ? segments : []).filter(
    (segment) => getOverlapGroupId(segment) === overlapGroupId,
  );

  const groupMaximumCandidates = groupSegments
    .map((segment) =>
      Number(
        segment.overlapGroupMaximumDuplicateInsuranceDays ??
          segment.maximumDuplicateInsuranceDays,
      ),
    )
    .filter((candidate) => Number.isFinite(candidate) && candidate >= 0);

  const overlapGroupMaximum =
    groupMaximumCandidates.length > 0
      ? Math.min(...groupMaximumCandidates)
      : null;

  let usedOutsideCurrent = 0;

  for (const segment of groupSegments) {
    const segmentValue = value.segments?.[segment.id] || {};
    const timeCountingPeriodId = String(
      segmentValue.timeCountingPeriodId || "",
    );
    const additionalPeriods = segmentValue.additionalPeriods || {};

    for (const [candidatePeriodId, candidateValue] of Object.entries(
      additionalPeriods,
    )) {
      const isActiveAdditionalPeriod =
        Array.isArray(segment.periodIds) &&
        segment.periodIds.includes(candidatePeriodId) &&
        candidatePeriodId !== timeCountingPeriodId;
      const isCurrentField =
        segment.id === segmentId && candidatePeriodId === periodId;

      if (!isActiveAdditionalPeriod || isCurrentField) {
        continue;
      }

      usedOutsideCurrent += parseNonNegativeDecimalInput(
        candidateValue?.insuranceDaysToRemove,
      );
    }
  }

  const maximumForCurrentInput =
    overlapGroupMaximum === null
      ? null
      : Math.max(0, overlapGroupMaximum - usedOutsideCurrent);

  return {
    overlapGroupMaximum:
      overlapGroupMaximum === null
        ? null
        : roundDisplayNumber(overlapGroupMaximum),
    usedOutsideCurrent: roundDisplayNumber(usedOutsideCurrent),
    maximumForCurrentInput:
      maximumForCurrentInput === null
        ? null
        : roundDisplayNumber(maximumForCurrentInput),
  };
}

function getOverlapGroupId(segment = {}) {
  if (segment.overlapGroupId) {
    return String(segment.overlapGroupId);
  }

  const periodIds = Array.isArray(segment.periodIds)
    ? [...segment.periodIds]
    : [];

  return `parallel_group_${periodIds
    .map((value) => String(value))
    .sort((a, b) => a.localeCompare(b))
    .join("__")}`;
}

function roundDisplayNumber(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10000) / 10000;
}

function SelectWithLabel({ id, label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label htmlFor={id}>{label}</label>
      <br />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
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

function TextInputWithLabel({ id, label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function CheckboxWithLabel({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} style={checkboxLabelStyle}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginRight: "0.5rem" }}
      />
      {label}
    </label>
  );
}

function buildDuplicateDaysLabel(maximumDuplicateInsuranceDays) {
  if (!Number.isFinite(maximumDuplicateInsuranceDays)) {
    return "Πραγματικές ημέρες που δεν πρέπει να μετρηθούν δεύτερη φορά";
  }

  return (
    "Πραγματικές ημέρες που δεν πρέπει να μετρηθούν δεύτερη φορά " +
    `(0 έως ${maximumDuplicateInsuranceDays})`
  );
}

function parseNonNegativeDecimalInput(value) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return 0;
  }

  const numberValue = Number(normalizedValue);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

const summaryBoxStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  background: "#f8fafc",
};

const openDetailsButtonStyle = {
  marginTop: "0.9rem",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
};

const noticeStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #fde68a",
  borderRadius: "6px",
  background: "#fffbeb",
  color: "#854d0e",
};

const remainingTextStyle = {
  marginTop: "0.25rem",
  color: "#334155",
  fontSize: "0.9rem",
  fontWeight: 600,
};

const segmentBoxStyle = {
  marginTop: "1rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "1rem",
  background: "#f8fafc",
};

const additionalPeriodBoxStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  background: "#ffffff",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem",
};

const helpTextStyle = {
  marginTop: "-0.25rem",
  color: "#475569",
  fontSize: "0.9rem",
};

const checkboxLabelStyle = {
  display: "block",
  marginTop: "0.75rem",
  cursor: "pointer",
};

const selectStyle = {
  marginTop: "0.5rem",
  padding: "0.5rem",
  width: "520px",
  maxWidth: "100%",
};

const inputStyle = {
  marginTop: "0.5rem",
  padding: "0.5rem",
  width: "220px",
  maxWidth: "100%",
};

const annualAuxiliaryDetailsStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  background: "#f8fafc",
};

const annualAuxiliaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem",
};

export default ParallelInsuranceInputSection;
