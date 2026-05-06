import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/GeneralInfo.css';

const FUND_OPTIONS = [
  { value: 'tap_dei', label: 'ΤΑΠ-ΔΕΗ' },
  { value: 'ika', label: 'ΙΚΑ' },
  { value: 'oga', label: 'ΟΓΑ' },
  { value: 'oaee', label: 'ΟΑΕΕ' },
  { value: 'public_sector', label: 'Δημόσιο' },
  { value: 'nat', label: 'ΝΑΤ' },
  { value: 'etaa', label: 'ΕΤΑΑ' },
  { value: 'other', label: 'Άλλο' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const INSURED_TYPE_OPTIONS = [
  { value: 'old', label: 'Παλαιός ασφαλισμένος' },
  { value: 'new', label: 'Νέος ασφαλισμένος' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const EMPLOYMENT_CATEGORY_OPTIONS = [
  { value: 'plain', label: 'Απλή ασφάλιση' },
  { value: 'plain_dei', label: 'Απλή ΔΕΗ' },
  { value: 'vae', label: 'ΒΑΕ' },
  { value: 'yvae', label: 'ΥΒΑΕ' },
  { value: 'farmer', label: 'Αγρότης' },
  { value: 'self_employed', label: 'Ελεύθερος επαγγελματίας' },
  { value: 'public_employee', label: 'Δημόσιος υπάλληλος' },
  { value: 'military', label: 'Στρατιωτικός' },
  { value: 'seafarer', label: 'Ναυτικός' },
  { value: 'other', label: 'Άλλη κατηγορία' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const CONTRIBUTION_CATEGORY_OPTIONS = [
  { value: 'old_tap_dei_plain', label: 'Παλαιός ΤΑΠ-ΔΕΗ απλά' },
  { value: 'old_tap_dei_vae', label: 'Παλαιός ΤΑΠ-ΔΕΗ ΒΑΕ' },
  { value: 'old_tap_dei_yvae', label: 'Παλαιός ΤΑΠ-ΔΕΗ ΥΒΑΕ' },
  { value: 'new_tap_dei_plain', label: 'Νέος ΤΑΠ-ΔΕΗ απλά' },
  { value: 'new_tap_dei_vae', label: 'Νέος ΤΑΠ-ΔΕΗ ΒΑΕ' },
  { value: 'new_tap_dei_yvae', label: 'Νέος ΤΑΠ-ΔΕΗ ΥΒΑΕ' },
  { value: 'ika_plain', label: 'ΙΚΑ απλά' },
  { value: 'ika_vae', label: 'ΙΚΑ ΒΑΕ' },
  { value: 'oga', label: 'ΟΓΑ' },
  { value: 'oaee', label: 'ΟΑΕΕ' },
  { value: 'public_sector', label: 'Δημόσιο' },
  { value: 'nat', label: 'ΝΑΤ' },
  { value: 'etaa', label: 'ΕΤΑΑ' },
  { value: 'other', label: 'Άλλο' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const EARNINGS_TYPE_OPTIONS = [
  { value: 'salary', label: 'Μισθός' },
  { value: 'contributions', label: 'Εισφορές' },
  { value: 'manual', label: 'Χειροκίνητη τιμή' },
  { value: 'none', label: 'Χωρίς αποδοχές' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const PERIOD_TYPE_OPTIONS = [
  { value: 'employment', label: 'Εργασία / ασφάλιση' },
  { value: 'recognized', label: 'Αναγνωριζόμενος χρόνος' },
  { value: 'purchased', label: 'Εξαγορασμένος χρόνος' },
  { value: 'other', label: 'Άλλο' },
  { value: 'unknown', label: 'Άγνωστο' }
];

const createEmptyPeriod = (index) => ({
  id: `period_${index}`,
  fromDate: '',
  toDate: '',
  fund: 'tap_dei',
  insuredType: 'old',
  employmentCategory: 'yvae',
  contributionCategory: 'old_tap_dei_yvae',
  earningsType: 'salary',
  periodType: 'employment',
  isRecognizedTime: false,
  isPurchasedTime: false,
  notes: ''
});

const normalizePeriods = (periods) => {
  if (!Array.isArray(periods) || periods.length === 0) {
    return [createEmptyPeriod(1)];
  }

  return periods.map((period, index) => ({
    id: period.id || `period_${index + 1}`,
    fromDate: period.fromDate || '',
    toDate: period.toDate || '',
    fund: period.fund || 'unknown',
    insuredType: period.insuredType || 'unknown',
    employmentCategory: period.employmentCategory || 'unknown',
    contributionCategory: period.contributionCategory || 'unknown',
    earningsType: period.earningsType || 'unknown',
    periodType: period.periodType || 'employment',
    isRecognizedTime: Boolean(period.isRecognizedTime),
    isPurchasedTime: Boolean(period.isPurchasedTime),
    notes: period.notes || ''
  }));
};

const InsurancePeriodsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const generalInfoData = location.state?.generalInfoData || null;
  const initialInsurancePeriods = location.state?.insurancePeriods || [];
  const deiCategoryData = location.state?.deiCategoryData || null;
  const yearsData = location.state?.yearsData || {};

  const [insurancePeriods, setInsurancePeriods] = useState(() =>
    normalizePeriods(initialInsurancePeriods)
  );
  const [errorMessage, setErrorMessage] = useState('');

  const handlePeriodChange = (periodId, field, value) => {
    setInsurancePeriods((prev) =>
      prev.map((period) =>
        period.id === periodId
          ? {
              ...period,
              [field]: value
            }
          : period
      )
    );
  };

  const handleAddPeriod = () => {
    setInsurancePeriods((prev) => [
      ...prev,
      createEmptyPeriod(prev.length + 1)
    ]);
  };

  const handleRemovePeriod = (periodId) => {
    setInsurancePeriods((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((period) => period.id !== periodId);
    });
  };

  const validatePeriods = () => {
    if (!insurancePeriods.length) {
      return 'Πρέπει να υπάρχει τουλάχιστον μία ασφαλιστική περίοδος.';
    }

    for (let index = 0; index < insurancePeriods.length; index += 1) {
      const period = insurancePeriods[index];

      if (!period.fromDate) {
        return `Συμπληρώστε την ημερομηνία έναρξης στην περίοδο ${index + 1}.`;
      }

      if (!period.toDate) {
        return `Συμπληρώστε την ημερομηνία λήξης στην περίοδο ${index + 1}.`;
      }

      if (period.toDate < period.fromDate) {
        return `Η ημερομηνία λήξης δεν μπορεί να είναι πριν την ημερομηνία έναρξης στην περίοδο ${index + 1}.`;
      }

      if (!period.fund) {
        return `Επιλέξτε φορέα στην περίοδο ${index + 1}.`;
      }

      if (!period.insuredType) {
        return `Επιλέξτε αν είναι παλαιός ή νέος ασφαλισμένος στην περίοδο ${index + 1}.`;
      }

      if (!period.employmentCategory) {
        return `Επιλέξτε κατηγορία εργασίας στην περίοδο ${index + 1}.`;
      }

      if (!period.contributionCategory) {
        return `Επιλέξτε κατηγορία εισφορών στην περίοδο ${index + 1}.`;
      }

      if (!period.earningsType) {
        return `Επιλέξτε τύπο αποδοχών στην περίοδο ${index + 1}.`;
      }

      if (!period.periodType) {
        return `Επιλέξτε τύπο περιόδου στην περίοδο ${index + 1}.`;
      }
    }

    return '';
  };

  const handleBack = () => {
    navigate('/calculator/dei', {
      state: {
        generalInfoData,
        insurancePeriods,
        deiCategoryData,
        yearsData
      }
    });
  };

  const handleNextStep = () => {
    const validationError = validatePeriods();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');

    navigate('/calculator/dei/category', {
      state: {
        generalInfoData,
        insurancePeriods,
        deiCategoryData,
        yearsData
      }
    });
  };

  return (
    <div className="info-wrapper">
      <div className="info-header">
        <h2>Ασφαλιστικές περίοδοι</h2>
      </div>

      <div className="info-form-panel info-main-panel">
        <div className="info-sections-stack">
          <div className="info-card info-card-blue">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Καταγραφή περιόδων ασφάλισης</h3>
                <p className="info-card-text">
                  Δηλώστε όλες τις πραγματικές περιόδους εργασίας ή ασφάλισης, ανεξάρτητα από φορέα.
                </p>
              </div>
            </div>

            <p className="info-helper">
              Ο χρήστης δηλώνει τις πραγματικές περιόδους. Η εφαρμογή θα αναλύσει αργότερα αν υπάρχει
              διαδοχική ή παράλληλη ασφάλιση, ειδικές κατηγορίες ή αυξημένες εισφορές.
            </p>
          </div>

          {insurancePeriods.map((period, index) => (
            <div key={period.id} className="info-card info-card-neutral">
              <div className="info-card-header">
                <div>
                  <h3 className="info-card-title">Περίοδος {index + 1}</h3>
                  <p className="info-card-text">
                    Συμπληρώστε τα βασικά στοιχεία της περιόδου ασφάλισης.
                  </p>
                </div>

                {index > 0 ? (
                <button
                  type="button"
                  onClick={() => handleRemovePeriod(period.id)}
                  className="step-button step-button-next"
                >
                  Διαγραφή περιόδου
                </button>
              ) : null}
              </div>

              <div className="info-grid info-grid-wide">
                <div className="info-field">
                  <label className="info-label">Από ημερομηνία</label>
                  <input
                    type="date"
                    className="info-input"
                    value={period.fromDate}
                    onChange={(e) => handlePeriodChange(period.id, 'fromDate', e.target.value)}
                  />
                </div>

                <div className="info-field">
                  <label className="info-label">Έως ημερομηνία</label>
                  <input
                    type="date"
                    className="info-input"
                    value={period.toDate}
                    onChange={(e) => handlePeriodChange(period.id, 'toDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="info-grid info-grid-wide info-field-top-gap">
                <div className="info-field">
                  <label className="info-label">Φορέας</label>
                  <select
                    className="info-input"
                    value={period.fund}
                    onChange={(e) => handlePeriodChange(period.id, 'fund', e.target.value)}
                  >
                    {FUND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="info-field">
                  <label className="info-label">Παλαιός / νέος ασφαλισμένος</label>
                  <select
                    className="info-input"
                    value={period.insuredType}
                    onChange={(e) => handlePeriodChange(period.id, 'insuredType', e.target.value)}
                  >
                    {INSURED_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="info-grid info-grid-wide info-field-top-gap">
                <div className="info-field">
                  <label className="info-label">Κατηγορία εργασίας</label>
                  <select
                    className="info-input"
                    value={period.employmentCategory}
                    onChange={(e) => handlePeriodChange(period.id, 'employmentCategory', e.target.value)}
                  >
                    {EMPLOYMENT_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="info-field">
                  <label className="info-label">Κατηγορία εισφορών</label>
                  <select
                    className="info-input"
                    value={period.contributionCategory}
                    onChange={(e) => handlePeriodChange(period.id, 'contributionCategory', e.target.value)}
                  >
                    {CONTRIBUTION_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="info-grid info-grid-wide info-field-top-gap">
                <div className="info-field">
                  <label className="info-label">Τύπος αποδοχών</label>
                  <select
                    className="info-input"
                    value={period.earningsType}
                    onChange={(e) => handlePeriodChange(period.id, 'earningsType', e.target.value)}
                  >
                    {EARNINGS_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="info-field">
                  <label className="info-label">Τύπος περιόδου</label>
                  <select
                    className="info-input"
                    value={period.periodType}
                    onChange={(e) => handlePeriodChange(period.id, 'periodType', e.target.value)}
                  >
                    {PERIOD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="info-field info-field-top-gap">
                <label className="info-label">Σημειώσεις</label>
                <textarea
                  className="info-input"
                  value={period.notes}
                  onChange={(e) => handlePeriodChange(period.id, 'notes', e.target.value)}
                  rows="3"
                  placeholder="Προαιρετικές σημειώσεις για την περίοδο"
                />
              </div>
            </div>
          ))}

          <div className="info-card info-card-blue">
            <button
              type="button"
              onClick={handleAddPeriod}
              className="step-button step-button-next"
            >
              + Προσθήκη περιόδου
            </button>
          </div>
        </div>

        <div className="step-bottom-navigation">
          <div className="step-bottom-navigation-left">
            <button
              type="button"
              onClick={handleBack}
              className="step-button step-button-back"
            >
              ← Πίσω στα γενικά στοιχεία
            </button>
          </div>

          <div className="step-bottom-navigation-center">
            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : (
              <div className="bottom-helper">
                Οι περίοδοι θα χρησιμοποιηθούν αργότερα για ανάλυση διαδοχικής, παράλληλης ασφάλισης και εισφορών.
              </div>
            )}
          </div>

          <div className="step-bottom-navigation-right">
            <button
              type="button"
              onClick={handleNextStep}
              className="step-button step-button-next"
            >
              Συνέχεια →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurancePeriodsForm;