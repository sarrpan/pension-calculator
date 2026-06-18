import React from "react";

import { fieldsetStyle } from "../utils/calculatorStyles";
import { normalizeParallelInsuranceDraft } from "../utils/parallelInsuranceFormUtils";

function ParallelInsuranceInputSection({
  calculatorEdition,
  detectedSegments,
  value,
  onChange,
}) {
  const segments = Array.isArray(detectedSegments) ? detectedSegments : [];

  if (calculatorEdition === "free" || segments.length === 0) {
    return null;
  }

  const safeValue = normalizeParallelInsuranceDraft(value);

  function updateSegment(segmentId, updater) {
    const currentSegment = safeValue.segments[segmentId] || {
      timeCountingPeriodId: "",
      baseEarningsConfirmed: false,
      combinedEarningsConfirmed: false,
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
      <legend>Παράλληλη κύρια ασφάλιση</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Εντοπίστηκαν ασφαλιστικές περίοδοι που ισχύουν ταυτόχρονα. Ο υπολογισμός
        θα γίνει ως μία ενιαία κύρια σύνταξη, χωρίς δεύτερη σύνταξη.
      </p>

      {segments.map((segment, index) => {
        const segmentValue = safeValue.segments[segment.id] || {};
        const timeCountingPeriodId = segmentValue.timeCountingPeriodId || "";
        const additionalPeriods = segment.periods.filter(
          (period) => period.id !== timeCountingPeriodId,
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

            <SelectWithLabel
              id={`${segment.id}_timeCountingPeriod`}
              label="Ποια περίοδος θα κρατηθεί στον συνολικό ασφαλιστικό χρόνο;"
              value={timeCountingPeriodId}
              onChange={(fieldValue) => {
                updateSegment(segment.id, (currentSegment) => ({
                  ...currentSegment,
                  timeCountingPeriodId: fieldValue,
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
                    additionalValue.insuranceDaysToRemove ??
                    String(segment.suggestedInsuranceDays);

                  return (
                    <div key={period.id} style={additionalPeriodBoxStyle}>
                      <h4 style={{ marginTop: 0 }}>
                        Παράλληλη περίοδος: {period.label}
                      </h4>

                      <TextInputWithLabel
                        id={`${segment.id}_${period.id}_days`}
                        label="Ημέρες που δεν πρέπει να μετρηθούν δεύτερη φορά"
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
                        Η εφαρμογή προτείνει τις ημέρες από τις ημερομηνίες.
                        Μπορείτε να τις διορθώσετε με τις πραγματικές ημέρες
                        παράλληλης ασφάλισης.
                      </p>

                      {segment.periodType === "until_2016" && (
                        <div style={gridStyle}>
                          <TextInputWithLabel
                            id={`${segment.id}_${period.id}_base`}
                            label="Μέση μηνιαία βάση παράλληλης εισφοράς"
                            value={additionalValue.monthlyBaseAmount || ""}
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
                            value={additionalValue.contributionUnits || ""}
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
                      )}
                    </div>
                  );
                })}

                {segment.periodType === "until_2016" && (
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

                {segment.periodType === "from_2017" && (
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
                )}
              </>
            )}
          </div>
        );
      })}
    </fieldset>
  );
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
  width: "420px",
  maxWidth: "100%",
};

const inputStyle = {
  marginTop: "0.5rem",
  padding: "0.5rem",
  width: "220px",
  maxWidth: "100%",
};

export default ParallelInsuranceInputSection;
