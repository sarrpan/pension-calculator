import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/ResultsPanel.css";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const ResultsPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [validationMessage, setValidationMessage] = useState("");
  const [localResults, setLocalResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const savedState = sessionStorage.getItem("deiCalculatorState");
  const backupData = savedState ? JSON.parse(savedState) : null;

  const formData = location.state || backupData || {};
  const generalInfo = formData.generalInfoData || {};
  const yearsData = formData.yearsData || {};

  const payload = useMemo(
    () => ({
      ...generalInfo,
      heavyRetirement: "yes",
      yearsData: yearsData,
    }),
    [generalInfo, yearsData]
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

      console.log("=== PAYLOAD ===");
      console.log(payload);

      console.log("=== FULL RESPONSE ===");
      console.log(data);

      console.log("=== MAIN DEBUG ===");
      console.log(data?.debugInfo?.main);

      console.log("=== SUPPLEMENTARY DEBUG ===");
      console.log(data?.debugInfo?.supplementary);

      console.log("=== DEDUCTIONS DEBUG ===");
      console.log(data?.debugInfo?.deductions);
      
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
    <div className="results-layout">
      <div className="res-card">
        <button className="calc-btn" onClick={handleCalculate} disabled={isLoading}>
          {isLoading ? "ΥΠΟΛΟΓΙΣΜΟΣ..." : "ΥΠΟΛΟΓΙΣΜΟΣ ΔΕΗ"}
        </button>

        {validationMessage && <p className="err">{validationMessage}</p>}

        <div className="top-panel-head">
          <h3 className="top-panel-title">Τελικό αποτέλεσμα</h3>
          <p className="top-panel-note">Τα ποσά αυτά ορίζονται από τα νέα πεδία αποτελεσμάτων</p>
        </div>

        <div className="top-summary-grid">
          <div className="top-summary-item top-summary-item--blue">
            <span className="top-summary-label">Μεικτή ανταποδοτική</span>
            <span className="top-summary-value top-summary-value--blue">
              {formatMoney(displayResults?.contributory)} €
            </span>
          </div>

          <div className="top-summary-item top-summary-item--blue">
            <span className="top-summary-label">Εθνική σύνταξη</span>
            <span className="top-summary-value top-summary-value--blue">
              {formatMoney(displayResults?.national)} €
            </span>
          </div>

          <div className="top-summary-item top-summary-item--gold">
            <span className="top-summary-label">Μεικτό επικουρικό</span>
            <span className="top-summary-value top-summary-value--gold">
              {formatMoney(displayResults?.supplementary)} €
            </span>
          </div>

          <div className="top-summary-item top-summary-item--green">
            <span className="top-summary-label">Μεικτή κύρια + επικουρικό</span>
            <span className="top-summary-value top-summary-value--green">
              {formatMoney(displayResults?.grossGrandTotal)} €
            </span>
          </div>
        </div>
      </div>

      <div className="res-card">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Καθαρή κύρια σύνταξη</span>
            <span className="summary-value summary-value--blue">
              {formatMoney(displayResults?.finalMainAmount)} €
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Καθαρό επικουρικό</span>
            <span className="summary-value summary-value--gold">
              {formatMoney(displayResults?.finalSupplementaryAmount)} €
            </span>
          </div>

          <div className="summary-item summary-item--net">
            <span className="summary-label">Σύνολο σύνταξης</span>
            <span className="summary-value summary-value--green">
              {formatMoney(displayResults?.finalTotalAmount)} €
            </span>
          </div>
        </div>

        <div className="debug-grid">
          <div className="debug-item">
            <span className="debug-label">Κράτηση ΕΑΣ συνολική</span>
            <span className="debug-value debug-value--red">
              - {formatMoney(displayResults?.easDeduction)} €
            </span>
          </div>

          <div className="debug-item">
            <span className="debug-label">Κράτηση υγείας συνολική</span>
            <span className="debug-value debug-value--red">
              - {formatMoney(displayResults?.healthDeduction)} €
            </span>
          </div>

          <div className="debug-item">
            <span className="debug-label">Κράτηση {"<"} 60</span>
            <span className="debug-value debug-value--red">
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
                yearsData: yearsData,
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

export default ResultsPanel;