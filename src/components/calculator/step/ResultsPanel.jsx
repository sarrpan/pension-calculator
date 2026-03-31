import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResultsPanel.css';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('el-GR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const ResultsPanel = ({ results }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [validationMessage, setValidationMessage] = useState('');
  const [localResults, setLocalResults] = useState(results || null);
  const [isLoading, setIsLoading] = useState(false);

  const formData = location.state || {};
  const generalInfo = formData.generalInfoData || {};
  const specialConditions = formData.specialConditionsData || {};

  useEffect(() => {
    if (results) {
      setLocalResults(results);
    }
  }, [results]);

  const payload = useMemo(
    () => ({
      ...generalInfo,
      yearsData: specialConditions,
    }),
    [generalInfo, specialConditions]
  );

  const displayResults = localResults || {};

  const mainPension = Number(displayResults?.contributory || 0) + Number(displayResults?.national || 0);

  const finalMainAmount = Number(displayResults?.finalMainAmount ?? mainPension);
  const finalSupplementaryAmount = Number(
    displayResults?.finalSupplementaryAmount ?? displayResults?.supplementary ?? 0
  );
  const finalTotalAmount = Number(
    displayResults?.finalTotalAmount ??
      displayResults?.netAmount ??
      displayResults?.grossGrandTotal ??
      displayResults?.grossTotal ??
      0
  );

  const handleCalculate = async () => {
    setValidationMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://us-central1-pension-calculator-f8e60.cloudfunctions.net/calculatePrivateSectorPension',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Αποτυχία υπολογισμού.');
      }

      setLocalResults(data);
    } catch (error) {
      setValidationMessage(error.message || 'Παρουσιάστηκε σφάλμα στον υπολογισμό.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ika-results-layout">
      <div className="ika-res-card">
        <button
          type="button"
          className="ika-button step-button step-button-next"
          onClick={handleCalculate}
          disabled={isLoading}
        >
          {isLoading ? 'ΥΠΟΛΟΓΙΣΜΟΣ...' : 'ΥΠΟΛΟΓΙΣΜΟΣ ΣΥΝΤΑΞΗΣ'}
        </button>

        {validationMessage && <p className="ika-error">{validationMessage}</p>}

        <div className="ika-top-panel-head">
          <h3 className="ika-top-panel-title">Τελικό αποτέλεσμα</h3>
          <p className="ika-top-panel-note">Τα ποσά αυτά ορίζονται από τα νέα πεδία αποτελεσμάτων</p>
        </div>

        <div className="ika-top-summary-grid">
          <div className="ika-top-summary-item ika-top-summary-item--blue">
            <span className="ika-top-summary-label">Κύρια σύνταξη</span>
            <span className="ika-top-summary-value ika-top-summary-value--blue">
              {formatMoney(finalMainAmount)} €
            </span>
          </div>

          <div className="ika-top-summary-item ika-top-summary-item--gold">
            <span className="ika-top-summary-label">Επικουρική σύνταξη</span>
            <span className="ika-top-summary-value ika-top-summary-value--gold">
              {formatMoney(finalSupplementaryAmount)} €
            </span>
          </div>

          <div className="ika-top-summary-item ika-top-summary-item--green">
            <span className="ika-top-summary-label">Σύνολο</span>
            <span className="ika-top-summary-value ika-top-summary-value--green">
              {formatMoney(finalTotalAmount)} €
            </span>
          </div>
        </div>
      </div>

      <div className="ika-res-card">
        <div className="ika-panel-head">
          <h3 className="ika-panel-title">Αναλυτικά ποσά ελέγχου</h3>
          <p className="ika-panel-subtitle">Προσωρινό panel για έλεγχο υπολογισμών</p>
        </div>

        <div className="ika-summary-grid">
          <div className="ika-summary-item">
            <span className="ika-summary-label">Κύρια σύνταξη</span>
            <span className="ika-summary-value ika-summary-value--blue">{formatMoney(mainPension)} €</span>
          </div>

          <div className="ika-summary-item">
            <span className="ika-summary-label">Επικουρικό</span>
            <span className="ika-summary-value ika-summary-value--gold">
              {formatMoney(displayResults?.supplementary)} €
            </span>
          </div>

          <div className="ika-summary-item">
            <span className="ika-summary-label">Μεικτή</span>
            <span className="ika-summary-value ika-summary-value--green">
              {formatMoney(displayResults?.grossGrandTotal || displayResults?.grossTotal)} €
            </span>
          </div>

          <div className="ika-summary-item ika-summary-item--net">
            <span className="ika-summary-label">Καθαρή</span>
            <span className="ika-summary-value ika-summary-value--green">
              {formatMoney(displayResults?.netAmount)} €
            </span>
          </div>
        </div>

        <div className="ika-debug-grid">
          <div className="ika-debug-item">
            <span className="ika-debug-label">Ανταποδοτική</span>
            <span className="ika-debug-value ika-debug-value--blue">
              {formatMoney(displayResults?.contributory)} €
            </span>
          </div>

          <div className="ika-debug-item">
            <span className="ika-debug-label">Εθνική</span>
            <span className="ika-debug-value ika-debug-value--blue">
              {formatMoney(displayResults?.national)} €
            </span>
          </div>

          <div className="ika-debug-item">
            <span className="ika-debug-label">Κράτηση ΕΑΣ</span>
            <span className="ika-debug-value ika-debug-value--red">
              - {formatMoney(displayResults?.easDeduction)} €
            </span>
          </div>

          <div className="ika-debug-item">
            <span className="ika-debug-label">Κράτηση υγείας</span>
            <span className="ika-debug-value ika-debug-value--red">
              - {formatMoney(displayResults?.healthDeduction)} €
            </span>
          </div>

          <div className="ika-debug-item">
            <span className="ika-debug-label">Φόρος</span>
            <span className="ika-debug-value ika-debug-value--red">
              - {formatMoney(displayResults?.taxDeduction)} €
            </span>
          </div>
        </div>
      </div>

      <div className="step-top-navigation">
        <button
          type="button"
          onClick={() =>
            navigate('/calculator/misthotoi/sc', {
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

export default ResultsPanel;