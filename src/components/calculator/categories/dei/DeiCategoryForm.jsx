import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/GeneralInfo.css';

const sanitizeIntegerInput = (value, max = null) => {
  const digitsOnly = value.replace(/[^\d]/g, '');
  if (digitsOnly === '') return '';

  let normalized = String(parseInt(digitsOnly, 10));

  if (max !== null) {
    normalized = String(Math.min(parseInt(normalized, 10), max));
  }

  return normalized;
};

const parseIntegerOrZero = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number.parseInt(value, 10) || 0;
};

const getInitialDifferentCategoryMode = (source) => {
  if (source.differentCategoryMode === 'yes' || source.differentCategoryMode === 'no') {
    return source.differentCategoryMode;
  }

  if (source.hasDifferentDeiCategoryAfter2015 === true || source.hasDifferentDeiCategoryAfter2015 === 'yes') {
    return 'yes';
  }

  if (source.hasDifferentDeiCategoryAfter2015 === false || source.hasDifferentDeiCategoryAfter2015 === 'no') {
    return 'no';
  }

  if (
    source.differentCategoryAfter2015Years ||
    source.differentCategoryAfter2015Months ||
    source.differentCategoryAfter2015Days ||
    source.differentDeiCategoryAfter2015Years ||
    source.differentDeiCategoryAfter2015Months ||
    source.differentDeiCategoryAfter2015Days
  ) {
    return 'yes';
  }

  return 'no';
};

const getInitialPeriodInputMode = (source, modeField, daysField, legacyDaysField = null) => {
  if (source[modeField] === 'days' || source[modeField] === 'yearsMonths') {
    return source[modeField];
  }

  if (source[daysField] || (legacyDaysField && source[legacyDaysField])) {
    return 'days';
  }

  return 'yearsMonths';
};

const convertYearsMonthsToDays = (yearsValue, monthsValue) => {
  const years = parseIntegerOrZero(yearsValue);
  const months = parseIntegerOrZero(monthsValue);
  return (years * 300) + (months * 25);
};

const convertDaysToYearsMonths = (daysValue) => {
  const totalDays = parseIntegerOrZero(daysValue);
  const totalMonths = Math.floor(totalDays / 25);

  return {
    totalDays,
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  };
};

const getTotalInsuranceMonths = (generalInfoData) => {
  if (!generalInfoData) return 0;

  const years = parseIntegerOrZero(generalInfoData.totalInsuranceYears);
  const months = parseIntegerOrZero(generalInfoData.totalInsuranceMonths);

  return (years * 12) + months;
};

const DeiCategoryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const generalInfoData = location.state?.generalInfoData || null;
  const initialData = location.state?.deiCategoryData || {};
  const incomingAnnualEarningsData = location.state?.yearsData || {};

  const mapDataToState = (source) => ({
    deiCategory: source.deiCategory || 'lignite',
    retirementRegime: source.retirementRegime || 'special',

    outsideBefore2014InputMode: getInitialPeriodInputMode(
      source,
      'outsideBefore2014InputMode',
      'outsideBefore2014Days',
      'daysOutsideDeiBefore2014'
    ),
    outsideBefore2014Years:
      source.outsideBefore2014Years ||
      source.yearsOutsideDeiBefore2014 ||
      '',
    outsideBefore2014Months:
      source.outsideBefore2014Months ||
      source.monthsOutsideDeiBefore2014 ||
      '',
    outsideBefore2014Days:
      source.outsideBefore2014Days ||
      source.daysOutsideDeiBefore2014 ||
      '',

    differentCategoryMode: getInitialDifferentCategoryMode(source),
    differentCategoryAfter2015InputMode: getInitialPeriodInputMode(
      source,
      'differentCategoryAfter2015InputMode',
      'differentCategoryAfter2015Days',
      'differentDeiCategoryAfter2015Days'
    ),
    differentCategoryAfter2015Years:
      source.differentCategoryAfter2015Years ||
      source.differentDeiCategoryAfter2015Years ||
      '',
    differentCategoryAfter2015Months:
      source.differentCategoryAfter2015Months ||
      source.differentDeiCategoryAfter2015Months ||
      '',
    differentCategoryAfter2015Days:
      source.differentCategoryAfter2015Days ||
      source.differentDeiCategoryAfter2015Days ||
      ''
  });

  const [formData, setFormData] = useState(() => mapDataToState(initialData));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData(mapDataToState(initialData));
    setErrorMessage('');
  }, [location.state]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIntChange = (field, max = null) => (e) => {
    handleChange(field, sanitizeIntegerInput(e.target.value, max));
  };

  const handleDifferentCategoryModeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      differentCategoryMode: value,
      differentCategoryAfter2015Years: value === 'yes' ? prev.differentCategoryAfter2015Years : '',
      differentCategoryAfter2015Months: value === 'yes' ? prev.differentCategoryAfter2015Months : '',
      differentCategoryAfter2015Days: value === 'yes' ? prev.differentCategoryAfter2015Days : ''
    }));
  };

  const handleDeiCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      deiCategory: value,
      retirementRegime: value === 'simple' ? 'general' : prev.retirementRegime
    }));
  };

  const handlePeriodInputModeChange = ({ modeField, yearsField, monthsField, daysField, value }) => {
    setFormData((prev) => {
      const nextState = {
        ...prev,
        [modeField]: value
      };

      if (value === 'days' && !prev[daysField]) {
        const calculatedDays = convertYearsMonthsToDays(prev[yearsField], prev[monthsField]);
        nextState[daysField] = calculatedDays > 0 ? String(calculatedDays) : '';
      }

      if (value === 'yearsMonths' && !prev[yearsField] && !prev[monthsField] && prev[daysField]) {
        const converted = convertDaysToYearsMonths(prev[daysField]);
        nextState[yearsField] = converted.years ? String(converted.years) : '';
        nextState[monthsField] = converted.months ? String(converted.months) : '';
      }

      return nextState;
    });
  };

  const handleBack = () => {
    navigate('/calculator/dei', {
      state: {
        generalInfoData,
        deiCategoryData: formData,
        yearsData: incomingAnnualEarningsData
      }
    });
  };

  const handleNextStep = () => {
    setErrorMessage('');

    if (!generalInfoData) {
      setErrorMessage('Δεν βρέθηκαν τα γενικά στοιχεία σύνταξης. Επιστρέψτε στο προηγούμενο βήμα.');
      return;
    }

    const isOutsideBefore2014InDaysMode = formData.outsideBefore2014InputMode === 'days';
    let outsideBefore2014YearsNum = 0;
    let outsideBefore2014MonthsNum = 0;
    let outsideBefore2014DaysNum = 0;

    if (isOutsideBefore2014InDaysMode) {
      outsideBefore2014DaysNum = parseIntegerOrZero(formData.outsideBefore2014Days);
      const convertedOutsideBefore2014 = convertDaysToYearsMonths(formData.outsideBefore2014Days);
      outsideBefore2014YearsNum = convertedOutsideBefore2014.years;
      outsideBefore2014MonthsNum = convertedOutsideBefore2014.months;
    } else {
      outsideBefore2014YearsNum = parseIntegerOrZero(formData.outsideBefore2014Years);
      outsideBefore2014MonthsNum = parseIntegerOrZero(formData.outsideBefore2014Months);
      outsideBefore2014DaysNum = convertYearsMonthsToDays(outsideBefore2014YearsNum, outsideBefore2014MonthsNum);

      if (outsideBefore2014MonthsNum < 0 || outsideBefore2014MonthsNum > 11) {
        setErrorMessage('Οι μήνες του χρόνου εκτός της κατηγορίας ενσήμων που επιλέξατε έως 2014 πρέπει να είναι από 0 έως 11.');
        return;
      }
    }

    const isDifferentCategoryAfter2015InDaysMode = formData.differentCategoryAfter2015InputMode === 'days';
    let differentCategoryAfter2015YearsNum = 0;
    let differentCategoryAfter2015MonthsNum = 0;
    let differentCategoryAfter2015DaysNum = 0;

    if (formData.differentCategoryMode === 'yes') {
      if (isDifferentCategoryAfter2015InDaysMode) {
        differentCategoryAfter2015DaysNum = parseIntegerOrZero(formData.differentCategoryAfter2015Days);
        const convertedDifferentCategoryAfter2015 = convertDaysToYearsMonths(formData.differentCategoryAfter2015Days);
        differentCategoryAfter2015YearsNum = convertedDifferentCategoryAfter2015.years;
        differentCategoryAfter2015MonthsNum = convertedDifferentCategoryAfter2015.months;
      } else {
        differentCategoryAfter2015YearsNum = parseIntegerOrZero(formData.differentCategoryAfter2015Years);
        differentCategoryAfter2015MonthsNum = parseIntegerOrZero(formData.differentCategoryAfter2015Months);
        differentCategoryAfter2015DaysNum = convertYearsMonthsToDays(
          differentCategoryAfter2015YearsNum,
          differentCategoryAfter2015MonthsNum
        );

        if (differentCategoryAfter2015MonthsNum < 0 || differentCategoryAfter2015MonthsNum > 11) {
          setErrorMessage('Οι μήνες του χρόνου σε διαφορετική κατηγορία πρέπει να είναι από 0 έως 11.');
          return;
        }
      }
    }

    const outsideBefore2014TotalMonths =
      (outsideBefore2014YearsNum * 12) + outsideBefore2014MonthsNum;

    const differentCategoryAfter2015TotalMonths =
      formData.differentCategoryMode === 'yes'
        ? (differentCategoryAfter2015YearsNum * 12) + differentCategoryAfter2015MonthsNum
        : 0;

    if (formData.differentCategoryMode === 'yes' && differentCategoryAfter2015TotalMonths === 0) {
      setErrorMessage('Συμπληρώστε τον χρόνο σε διαφορετική κατηγορία από το 2015 και μετά ή επιλέξτε "Όχι".');
      return;
    }

    const totalDeclaredMonths = outsideBefore2014TotalMonths + differentCategoryAfter2015TotalMonths;
    const totalInsuranceMonths = getTotalInsuranceMonths(generalInfoData);

    if (totalInsuranceMonths > 0 && totalDeclaredMonths > totalInsuranceMonths) {
      const calcY = Math.floor(totalDeclaredMonths / 12);
      const calcM = totalDeclaredMonths % 12;

      setErrorMessage(
        `Αναντιστοιχία χρόνου: Ο συνολικός βίος είναι ${generalInfoData.totalInsuranceYears} έτη και ${generalInfoData.totalInsuranceMonths} μήνες, αλλά ο δηλωμένος ειδικός χρόνος βγαίνει ${calcY} έτη και ${calcM} μήνες.`
      );
      return;
    }

    const usesSpecialVAERegime =
      formData.deiCategory === 'heavy' && formData.retirementRegime === 'special';

    const usesSpecialYVAERegime =
      formData.deiCategory === 'lignite' && formData.retirementRegime === 'special';

    const data = {
      deiCategory: formData.deiCategory,
      retirementRegime: formData.retirementRegime,
      usesSpecialDeiRegime: formData.retirementRegime === 'special',
      usesSpecialVAERegime,
      usesSpecialYVAERegime,

      outsideBefore2014InputMode: formData.outsideBefore2014InputMode,
      outsideBefore2014Years: String(outsideBefore2014YearsNum),
      outsideBefore2014Months: String(outsideBefore2014MonthsNum),
      outsideBefore2014Days: String(outsideBefore2014DaysNum),

      differentCategoryMode: formData.differentCategoryMode,
      differentCategoryAfter2015InputMode: formData.differentCategoryAfter2015InputMode,
      differentCategoryAfter2015Years: String(differentCategoryAfter2015YearsNum),
      differentCategoryAfter2015Months: String(differentCategoryAfter2015MonthsNum),
      differentCategoryAfter2015Days: String(differentCategoryAfter2015DaysNum)
    };

    navigate('/calculator/dei/sc', {
      state: {
        generalInfoData,
        deiCategoryData: data,
        yearsData: incomingAnnualEarningsData
      }
    });
  };

  const isSpecialCategory = formData.deiCategory === 'heavy' || formData.deiCategory === 'lignite';

  return (
    <div className="info-wrapper">
      <div className="info-header">
        <h2>Στοιχεία κατηγορίας ΔΕΗ</h2>
      </div>

      <div className="info-form-panel info-main-panel">
        <div className="info-sections-stack">
          <div className="info-card info-card-green">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Κατηγορία ενσήμων ΔΕΗ</h3>
                <p className="info-card-text">Δηλώστε την κατηγορία με την οποία θεμελιώνεται το δικαίωμα.</p>
              </div>
            </div>

            <div className="info-section-note">
              <p className="info-helper">
                Επιλέξτε την κατηγορία με την οποία θεμελιώνετε δικαίωμα, όχι απαραίτητα την τελευταία σας εργασία.
              </p>
            </div>

            <div className="radio-group radio-group-category">
              <label className="radio-label">
                <input
                  type="radio"
                  checked={formData.deiCategory === 'simple'}
                  onChange={() => handleDeiCategoryChange('simple')}
                />
                <span>Απλά</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  checked={formData.deiCategory === 'heavy'}
                  onChange={() => handleDeiCategoryChange('heavy')}
                />
                <span>ΒΑΕ / Βαρέα</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  checked={formData.deiCategory === 'lignite'}
                  onChange={() => handleDeiCategoryChange('lignite')}
                />
                <span>ΥΒΑΕ / Λιγνίτης / Ορυχεία / Σταθμοί / Δίκτυα</span>
              </label>
            </div>

            <div className={`inline-period-box inline-period-box-spaced ${!isSpecialCategory ? 'is-disabled' : ''}`}>
              <label className="info-label ">Χρήση ειδικού καθεστώτος ΒΑΕ / ΥΒΑΕ</label>
              <p className="info-helper info-field-helper">
                Αν γίνεται χρήση του ειδικού καθεστώτος, η αντίστοιχη πρόσθετη εισφορά δεν θα υπολογιστεί ξανά ως προσαύξηση άρθρου 30.
              </p>

              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={formData.retirementRegime === 'special'}
                    onChange={() => handleChange('retirementRegime', 'special')}
                    disabled={!isSpecialCategory}
                  />
                  <span>Χρήση ειδικού καθεστώτος</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    checked={formData.retirementRegime === 'general'}
                    onChange={() => handleChange('retirementRegime', 'general')}
                    disabled={!isSpecialCategory}
                  />
                  <span>Συνταξιοδότηση με γενικές διατάξεις</span>
                </label>
              </div>
            </div>

            <div className="inline-period-box inline-period-box-spaced">
              <label className="info-label ">Χρόνος εκτός της κατηγορίας ενσήμων που επιλέξατε έως 2014</label>
              <p className="info-helper info-field-helper">
                Συμπληρώστε μόνο τον χρόνο που δεν ανήκε στην κατηγορία με την οποία θεμελιώνετε δικαίωμα.
              </p>

              <div className="radio-group radio-group-inline-cards">
                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.outsideBefore2014InputMode === 'yearsMonths'}
                    onChange={() => handlePeriodInputModeChange({
                      modeField: 'outsideBefore2014InputMode',
                      yearsField: 'outsideBefore2014Years',
                      monthsField: 'outsideBefore2014Months',
                      daysField: 'outsideBefore2014Days',
                      value: 'yearsMonths'
                    })}
                  />
                  <span>Έτη και μήνες</span>
                </label>

                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.outsideBefore2014InputMode === 'days'}
                    onChange={() => handlePeriodInputModeChange({
                      modeField: 'outsideBefore2014InputMode',
                      yearsField: 'outsideBefore2014Years',
                      monthsField: 'outsideBefore2014Months',
                      daysField: 'outsideBefore2014Days',
                      value: 'days'
                    })}
                  />
                  <span>Ημέρες</span>
                </label>
              </div>

              {formData.outsideBefore2014InputMode === 'days' ? (
                <div className="info-grid info-grid-single info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Ημέρες</label>
                    <input
                      type="text"
                      className="info-input"
                      inputMode="numeric"
                      value={formData.outsideBefore2014Days}
                      onChange={handleIntChange('outsideBefore2014Days')}
                    />
                  </div>
                </div>
              ) : (
                <div className="info-grid info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Έτη</label>
                    <input
                      type="text"
                      className="info-input"
                      inputMode="numeric"
                      value={formData.outsideBefore2014Years}
                      onChange={handleIntChange('outsideBefore2014Years')}
                    />
                  </div>

                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Μήνες</label>
                    <input
                      type="text"
                      className="info-input"
                      inputMode="numeric"
                      value={formData.outsideBefore2014Months}
                      onChange={handleIntChange('outsideBefore2014Months', 11)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="info-card info-card-neutral">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Διαφορετική κατηγορία από το 2015 και μετά</h3>
                <p className="info-card-text">Το επιπλέον πεδίο ανοίγει μόνο αν υπήρξε χρόνος σε άλλη κατηγορία ενσήμων.</p>
              </div>
            </div>

            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  checked={formData.differentCategoryMode === 'yes'}
                  onChange={() => handleDifferentCategoryModeChange('yes')}
                />
                <span>Ναι</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  checked={formData.differentCategoryMode === 'no'}
                  onChange={() => handleDifferentCategoryModeChange('no')}
                />
                <span>Όχι</span>
              </label>
            </div>

            <div className={`inline-period-box ${formData.differentCategoryMode !== 'yes' ? 'is-disabled' : ''}`}>
              <label className="info-label ">Χρόνος σε διαφορετική κατηγορία ενσήμων</label>
              <p className="info-helper info-field-helper">
                Αν δεν υπάρχει τέτοιος χρόνος, αφήστε επιλεγμένο το «Όχι».
              </p>

              <div className="radio-group radio-group-inline-cards">
                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.differentCategoryAfter2015InputMode === 'yearsMonths'}
                    onChange={() => handlePeriodInputModeChange({
                      modeField: 'differentCategoryAfter2015InputMode',
                      yearsField: 'differentCategoryAfter2015Years',
                      monthsField: 'differentCategoryAfter2015Months',
                      daysField: 'differentCategoryAfter2015Days',
                      value: 'yearsMonths'
                    })}
                    disabled={formData.differentCategoryMode !== 'yes'}
                  />
                  <span>Έτη και μήνες</span>
                </label>

                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.differentCategoryAfter2015InputMode === 'days'}
                    onChange={() => handlePeriodInputModeChange({
                      modeField: 'differentCategoryAfter2015InputMode',
                      yearsField: 'differentCategoryAfter2015Years',
                      monthsField: 'differentCategoryAfter2015Months',
                      daysField: 'differentCategoryAfter2015Days',
                      value: 'days'
                    })}
                    disabled={formData.differentCategoryMode !== 'yes'}
                  />
                  <span>Ημέρες</span>
                </label>
              </div>

              {formData.differentCategoryAfter2015InputMode === 'days' ? (
                <div className="info-grid info-grid-single info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Ημέρες</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="info-input"
                      value={formData.differentCategoryAfter2015Days}
                      onChange={handleIntChange('differentCategoryAfter2015Days')}
                      disabled={formData.differentCategoryMode !== 'yes'}
                    />
                  </div>
                </div>
              ) : (
                <div className="info-grid info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Έτη</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="info-input"
                      value={formData.differentCategoryAfter2015Years}
                      onChange={handleIntChange('differentCategoryAfter2015Years')}
                      disabled={formData.differentCategoryMode !== 'yes'}
                    />
                  </div>

                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Μήνες</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="info-input"
                      value={formData.differentCategoryAfter2015Months}
                      onChange={handleIntChange('differentCategoryAfter2015Months', 11)}
                      disabled={formData.differentCategoryMode !== 'yes'}
                    />
                  </div>
                </div>
              )}
            </div>
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
              <div className="bottom-helper">Συμπληρώστε τα στοιχεία ΔΕΗ πριν προχωρήσετε στις ετήσιες αποδοχές.</div>
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

export default DeiCategoryForm;