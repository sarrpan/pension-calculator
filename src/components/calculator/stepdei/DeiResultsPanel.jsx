import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DeiResultsPanel.css";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const DeiResultsPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [validationMessage, setValidationMessage] = useState("");
  const [localResults, setLocalResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const savedState = sessionStorage.getItem("deiCalculatorState");
  const backupData = savedState ? JSON.parse(savedState) : null;

  const formData = location.state || backupData || {};
  const generalInfo = formData.generalInfoData || {};
  const specialConditions = formData.specialConditionsData || {};

  const payload = useMemo(
    () => ({
      ...generalInfo,
      heavyRetirement: "yes",
      yearsData: specialConditions,
    }),
    [generalInfo, specialConditions]
  );

  const displayResults = localResults || {};

  const handleCalculate = async () => {
    const { birthDate, pensionDate } = payload;

    if (!birthDate || !pensionDate) {
      setValidationMessage(
        "Τα δεδομένα της φόρμας χάθηκαν (πιθανώς λόγω ανανέωσης της σελίδας). Παρακαλώ επιστρέψτε στο πρώτο βήμα για να τα συμπληρώσετε ξανά."
      );
      return;
    }

    setValidationMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://us-central1-pension-calculator-f8e60.cloudfunctions.net/calculateDeiPension",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Αποτυχία υπολογισμού.");
      }

      setLocalResults(data);
    } catch (error) {
      setValidationMessage(error.message || "Παρουσιάστηκε σφάλμα στον υπολογισμό.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dei-results-layout">
      <div className="dei-res-card">
        <button className="dei-calc-btn" onClick={handleCalculate} disabled={isLoading}>
          {isLoading ? "ΥΠΟΛΟΓΙΣΜΟΣ..." : "ΥΠΟΛΟΓΙΣΜΟΣ ΔΕΗ"}
        </button>

        {validationMessage && <p className="dei-err">{validationMessage}</p>}

        <div className="dei-top-panel-head">
          <h3 className="dei-top-panel-title">Τελικό αποτέλεσμα</h3>
          <p className="dei-top-panel-note">Τα ποσά αυτά ορίζονται από τα νέα πεδία αποτελεσμάτων</p>
        </div>

        <div className="dei-top-summary-grid">
          <div className="dei-top-summary-item dei-top-summary-item--blue">
            <span className="dei-top-summary-label">Μεικτή ανταποδοτική</span>
            <span className="dei-top-summary-value dei-top-summary-value--blue">
              {formatMoney(displayResults?.contributory)} €
            </span>
          </div>

          <div className="dei-top-summary-item dei-top-summary-item--blue">
            <span className="dei-top-summary-label">Εθνική σύνταξη</span>
            <span className="dei-top-summary-value dei-top-summary-value--blue">
              {formatMoney(displayResults?.national)} €
            </span>
          </div>

          <div className="dei-top-summary-item dei-top-summary-item--gold">
            <span className="dei-top-summary-label">Μεικτό επικουρικό</span>
            <span className="dei-top-summary-value dei-top-summary-value--gold">
              {formatMoney(displayResults?.supplementary)} €
            </span>
          </div>

          <div className="dei-top-summary-item dei-top-summary-item--green">
            <span className="dei-top-summary-label">Μεικτή κύρια + επικουρικό</span>
            <span className="dei-top-summary-value dei-top-summary-value--green">
              {formatMoney(displayResults?.grossGrandTotal)} €
            </span>
          </div>
        </div>
      </div>

      <div className="dei-res-card">
        <div className="dei-summary-grid">
          <div className="dei-summary-item">
            <span className="dei-summary-label">Καθαρή κύρια σύνταξη</span>
            <span className="dei-summary-value dei-summary-value--blue">
              {formatMoney(displayResults?.finalMainAmount)} €
            </span>
          </div>

          <div className="dei-summary-item">
            <span className="dei-summary-label">Καθαρό επικουρικό</span>
            <span className="dei-summary-value dei-summary-value--gold">
              {formatMoney(displayResults?.finalSupplementaryAmount)} €
            </span>
          </div>

          <div className="dei-summary-item dei-summary-item--net">
            <span className="dei-summary-label">Σύνολο σύνταξης</span>
            <span className="dei-summary-value dei-summary-value--green">
              {formatMoney(displayResults?.finalTotalAmount)} €
            </span>
          </div>
        </div>

        <div className="dei-debug-grid">
          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση ΕΑΣ συνολική</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.easDeduction)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση υγείας συνολική</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.healthDeduction)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση {"<"} 60</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.under60Deduction)} €
            </span>
          </div>
        </div>
      </div>

      <div className="step-bottom-navigation">
        <button
          type="button"
          onClick={() =>
            navigate("/calculator/dei/sc", {
              state: {
                generalInfoData: generalInfo,
                specialConditionsData: specialConditions,
              },
            })
          }
          className="step-button step-button-back"
        >
          ← Πίσω
        </button>
      </div>
    </div>
  );
};

export default DeiResultsPanel;