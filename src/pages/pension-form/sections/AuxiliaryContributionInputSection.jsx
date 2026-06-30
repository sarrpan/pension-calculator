import React from "react";

import { fieldsetStyle } from "../utils/calculatorStyles";
import {
  AUXILIARY_EXTRA_CONTRIBUTION_OPTIONS,
  FORMER_AUXILIARY_FUND_SPECIAL_PENDING,
  getAuxiliaryQuestionPeriods,
  normalizeAuxiliaryContributionDraft,
} from "../utils/auxiliaryContributionFormUtils";

function AuxiliaryContributionInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleEmploymentCategoryInput,
  insurancePeriodGroups,
  value,
  onChange,
}) {
  const safeValue = normalizeAuxiliaryContributionDraft(value);
  const periods = getAuxiliaryQuestionPeriods({
    insurancePeriodsInputMode,
    simpleFundInput,
    simpleEmploymentCategoryInput,
    insurancePeriodGroups,
    auxiliaryContributionDraft: safeValue,
  });

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Στοιχεία επικουρικής ασφάλισης</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Η ενότητα παραμένει πάντοτε ορατή. Για κάθε ασφαλιστική περίοδο
        εμφανίζεται ως ενεργή όταν υπάρχει επικουρική ασφάλιση και ως
        ανενεργή όταν δεν προκύπτει επικουρική σύνταξη από τη συγκεκριμένη
        περίοδο.
      </p>

      {periods.length === 0 && (
        <div style={inactivePeriodBoxStyle}>
          <strong>Ανενεργή</strong>
          <p style={{ marginBottom: 0 }}>
            Επιλέξτε και ολοκληρώστε ασφαλιστική περίοδο για να ελεγχθεί η
            επικουρική ασφάλιση.
          </p>
        </div>
      )}

      {periods.map((period) => {
        const periodValue = safeValue[period.id] || {
          extraContributionChoice: "",
          formerAuxiliaryFund: "",
        };

        const isActive = period.classification?.hasAuxiliary === true;

        return (
          <div
            key={period.id}
            style={isActive ? periodBoxStyle : inactivePeriodBoxStyle}
          >
            <div style={periodHeaderStyle}>
              <strong>{period.label}</strong>
              <span style={isActive ? activeBadgeStyle : inactiveBadgeStyle}>
                {isActive ? "Ενεργή" : "Ανενεργή"}
              </span>
            </div>

            {!isActive && (
              <p style={inactiveMessageStyle}>
                {period.classification?.label ||
                  "Δεν προκύπτει επικουρική σύνταξη από αυτή την περίοδο."}
              </p>
            )}

            {isActive && period.classification?.label && (
              <p style={activeStatusTextStyle}>
                <strong>Κατάσταση:</strong>{" "}
                {period.classification.label}
              </p>
            )}

            {isActive && period.showFormerFundModeSelect && (
              <div style={fieldBlockStyle}>
                <label htmlFor={`auxiliary_fund_mode_${period.id}`}>
                  Είχατε ειδικό επικουρικό ταμείο;
                </label>

                <br />

                <select
                  id={`auxiliary_fund_mode_${period.id}`}
                  value={period.formerFundMode}
                  onChange={(event) => {
                    const usesSpecialFund = event.target.value === "special";

                    onChange(
                      period.id,
                      "formerAuxiliaryFund",
                      usesSpecialFund
                        ? FORMER_AUXILIARY_FUND_SPECIAL_PENDING
                        : "",
                    );
                    onChange(period.id, "extraContributionChoice", "");
                  }}
                  style={selectStyle}
                >
                  <option value="common">
                    Όχι, είχα την κοινή επικουρική ΙΚΑ-ΕΤΕΑΜ
                  </option>
                  <option value="special">
                    Ναι, είχα άλλο επικουρικό ταμείο
                  </option>
                </select>

                <p style={helpTextStyle}>
                  Επιλέξτε «Ναι» μόνο αν γνωρίζετε ότι είχατε διαφορετικό
                  επικουρικό ταμείο από το κοινό ΙΚΑ-ΕΤΕΑΜ.
                </p>
              </div>
            )}

            {isActive && period.showFormerFundSelect && (
              <div style={fieldBlockStyle}>
                <label htmlFor={`auxiliary_fund_${period.id}`}>
                  Σε ποιο επικουρικό ταμείο ανήκατε;
                  {period.requiresFormerAuxiliaryFundChoice ? " *" : ""}
                </label>

                <br />

                <select
                  id={`auxiliary_fund_${period.id}`}
                  value={
                    periodValue.formerAuxiliaryFund ===
                    FORMER_AUXILIARY_FUND_SPECIAL_PENDING
                      ? ""
                      : periodValue.formerAuxiliaryFund || ""
                  }
                  onChange={(event) => {
                    onChange(
                      period.id,
                      "formerAuxiliaryFund",
                      event.target.value,
                    );
                    onChange(period.id, "extraContributionChoice", "");
                  }}
                  style={selectStyle}
                >
                  {period.formerFundOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p style={helpTextStyle}>
                  Η επιλογή αφορά μόνο την επικουρική σύνταξη. Δεν αλλάζει τον
                  φορέα κύριας ασφάλισης που δηλώσατε.
                </p>
              </div>
            )}

            {isActive && period.requiresExtraContributionChoice && (
              <div style={fieldBlockStyle}>
                <label htmlFor={`auxiliary_extra_${period.id}`}>
                  Πληρώνατε επιπλέον εισφορά για την επικουρική σύνταξη;
                </label>

                <br />

                <select
                  id={`auxiliary_extra_${period.id}`}
                  value={periodValue.extraContributionChoice || ""}
                  onChange={(event) =>
                    onChange(
                      period.id,
                      "extraContributionChoice",
                      event.target.value,
                    )
                  }
                  style={selectStyle}
                >
                  {AUXILIARY_EXTRA_CONTRIBUTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isActive && period.classification?.workerGroupLabel && (
              <p style={resolvedTextStyle}>
                <strong>Επιλεγμένη κατηγορία:</strong>{" "}
                {period.classification.workerGroupLabel}
                {period.classification.formerAuxiliaryFundLabel
                  ? ` — ${period.classification.formerAuxiliaryFundLabel}`
                  : ""}
              </p>
            )}
          </div>
        );
      })}

      {periods.some((period) => period.classification?.hasAuxiliary) && (
        <p style={{ color: "#8a5a00", marginBottom: 0 }}>
          Αν επιλέξετε προσεγγιστικό ποσοστό, θα εφαρμοστεί σε ολόκληρη την
          ασφαλιστική περίοδο. Αν δεν γνωρίζετε το επικουρικό ταμείο, ο
          υπολογισμός του παλιού χρόνου επικουρικής μπορεί να μείνει εκκρεμής.
        </p>
      )}
    </fieldset>
  );
}

const periodBoxStyle = {
  marginTop: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "0.75rem",
  background: "#f8fafc",
};


const inactivePeriodBoxStyle = {
  ...periodBoxStyle,
  background: "#f1f5f9",
  color: "#64748b",
};

const periodHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem",
};

const activeBadgeStyle = {
  padding: "0.2rem 0.55rem",
  borderRadius: "999px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "0.82rem",
  fontWeight: 700,
};

const inactiveBadgeStyle = {
  ...activeBadgeStyle,
  background: "#e2e8f0",
  color: "#475569",
};

const inactiveMessageStyle = {
  marginTop: "0.65rem",
  marginBottom: 0,
  color: "#64748b",
};

const activeStatusTextStyle = {
  marginTop: "0.65rem",
  marginBottom: 0,
  color: "#1e3a8a",
};

const fieldBlockStyle = {
  marginTop: "0.75rem",
};

const helpTextStyle = {
  color: "#475569",
  fontSize: "0.9rem",
  marginTop: "0.4rem",
  marginBottom: 0,
};

const resolvedTextStyle = {
  marginTop: "0.75rem",
  marginBottom: 0,
  color: "#1e3a8a",
};

const selectStyle = {
  marginTop: "0.5rem",
  padding: "0.5rem",
  width: "620px",
  maxWidth: "100%",
};

export default AuxiliaryContributionInputSection;
