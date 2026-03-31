import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DeiResultsPanel.css';
import { calculateDeiSector } from '../../../services/calculators/DeiResultsCalculator';

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

  // Διαβάζουμε το backup από τη μνήμη του browser
  const savedState = sessionStorage.getItem('deiCalculatorState');
  const backupData = savedState ? JSON.parse(savedState) : null;

  // Αν το location.state χάθηκε (π.χ. λόγω F5), παίρνουμε το backupData
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

  const mainPension =
    Number(displayResults?.contributory || 0) +
    Number(displayResults?.national || 0);

  const finalMainAmount = Number(displayResults?.finalMainAmount ?? mainPension);
  const finalSupplementaryAmount = Number(
    displayResults?.finalSupplementaryAmount ??
      displayResults?.supplementary ??
      0
  );
  const finalTotalAmount = Number(
    displayResults?.finalTotalAmount ??
      displayResults?.netAmount ??
      displayResults?.grossGrandTotal ??
      displayResults?.grossTotal ??
      0
  );

  const handleCalculate = () => {
    const { birthDate, pensionDate } = payload;

    if (!birthDate || !pensionDate) {
      setValidationMessage(
        "Τα δεδομένα της φόρμας χάθηκαν (πιθανώς λόγω ανανέωσης της σελίδας). Παρακαλώ επιστρέψτε στο πρώτο βήμα για να τα συμπληρώσετε ξανά."
      );
      return;
    }

    setValidationMessage("");

    const calculatedResults = calculateDeiSector(payload);
    setLocalResults(calculatedResults);
  };

  return (
    <div className="dei-results-layout">
      <div className="dei-res-card">
        <button className="dei-calc-btn" onClick={handleCalculate}>
          ΥΠΟΛΟΓΙΣΜΟΣ ΔΕΗ
        </button>

        {validationMessage && <p className="dei-err">{validationMessage}</p>}

        <div className="dei-top-panel-head">
          <h3 className="dei-top-panel-title">Τελικό αποτέλεσμα</h3>
          <p className="dei-top-panel-note">Τα ποσά αυτά ορίζονται από τα νέα πεδία αποτελεσμάτων</p>
        </div>

        <div className="dei-top-summary-grid">
          <div className="dei-top-summary-item dei-top-summary-item--blue">
            <span className="dei-top-summary-label">Κύρια σύνταξη</span>
            <span className="dei-top-summary-value dei-top-summary-value--blue">
              {formatMoney(finalMainAmount)} €
            </span>
          </div>

          <div className="dei-top-summary-item dei-top-summary-item--gold">
            <span className="dei-top-summary-label">Επικουρική σύνταξη</span>
            <span className="dei-top-summary-value dei-top-summary-value--gold">
              {formatMoney(finalSupplementaryAmount)} €
            </span>
          </div>

          <div className="dei-top-summary-item dei-top-summary-item--green">
            <span className="dei-top-summary-label">Σύνολο</span>
            <span className="dei-top-summary-value dei-top-summary-value--green">
              {formatMoney(finalTotalAmount)} €
            </span>
          </div>
        </div>
      </div>

      <div className="dei-res-card">
        <div className="dei-summary-grid">
          <div className="dei-summary-item">
            <span className="dei-summary-label">Κύρια σύνταξη</span>
            <span className="dei-summary-value dei-summary-value--blue">
              {formatMoney(mainPension)} €
            </span>
          </div>

          <div className="dei-summary-item">
            <span className="dei-summary-label">Επικουρικό</span>
            <span className="dei-summary-value dei-summary-value--gold">
              {formatMoney(displayResults?.supplementary)} €
            </span>
          </div>

          <div className="dei-summary-item">
            <span className="dei-summary-label">Μεικτή</span>
            <span className="dei-summary-value dei-summary-value--green">
              {formatMoney(displayResults?.grossGrandTotal || displayResults?.grossTotal)} €
            </span>
          </div>

          <div className="dei-summary-item dei-summary-item--net">
            <span className="dei-summary-label">Καθαρή</span>
            <span className="dei-summary-value dei-summary-value--green">
              {formatMoney(displayResults?.netAmount)} €
            </span>
          </div>
        </div>

        <div className="dei-debug-grid">
          <div className="dei-debug-item">
            <span className="dei-debug-label">Ανταποδοτική</span>
            <span className="dei-debug-value dei-debug-value--blue">
              {formatMoney(displayResults?.contributory)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Εθνική</span>
            <span className="dei-debug-value dei-debug-value--blue">
              {formatMoney(displayResults?.national)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση ΕΑΣ</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.easDeduction)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση {"<"} 60</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.under60Deduction)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Κράτηση υγείας</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.healthDeduction)} €
            </span>
          </div>

          <div className="dei-debug-item">
            <span className="dei-debug-label">Φόρος</span>
            <span className="dei-debug-value dei-debug-value--red">
              - {formatMoney(displayResults?.taxDeduction)} €
            </span>
          </div>
        </div>
      </div>

      <div className="step-bottom-navigation">
        <button
          type="button"
          onClick={() =>
            navigate('/calculator/dei/sc', {
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