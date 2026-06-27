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

  if (periods.length === 0) {
    return null;
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Στοιχεία επικουρικής ασφάλισης</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Η εφαρμογή βρίσκει αυτόματα την επικουρική ασφάλιση όταν υπάρχουν
        αρκετά στοιχεία. Θα εμφανιστεί ερώτηση μόνο όταν χρειάζεται δική σας
        επιλογή.
      </p>

      {periods.map((period) => {
        const periodValue = safeValue[period.id] || {
          extraContributionChoice: "",
          formerAuxiliaryFund: "",
        };

        return (
          <div key={period.id} style={periodBoxStyle}>
            <p style={{ marginTop: 0 }}>
              <strong>{period.label}</strong>
            </p>

            {period.showFormerFundModeSelect && (
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

            {period.showFormerFundSelect && (
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

            {period.requiresExtraContributionChoice && (
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

            {period.classification?.workerGroupLabel && (
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

      <p style={{ color: "#8a5a00", marginBottom: 0 }}>
        Αν επιλέξετε προσεγγιστικό ποσοστό, θα εφαρμοστεί σε ολόκληρη την
        ασφαλιστική περίοδο. Αν δεν γνωρίζετε το επικουρικό ταμείο, ο
        υπολογισμός του παλιού χρόνου επικουρικής μπορεί να μείνει εκκρεμής.
      </p>
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
