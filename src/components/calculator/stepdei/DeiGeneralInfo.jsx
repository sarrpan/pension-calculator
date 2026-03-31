import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DeiGeneralInfo.css';
import deiGeneralInfoMockData from './deiGeneralInfoMockData';

const sanitizeDisplayDate = (value) => {
  let cleaned = value.replace(/[^\d]/g, '').slice(0, 8);

  if (cleaned.length > 4) {
    cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  } else if (cleaned.length > 2) {
    cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }

  return cleaned;
};

const normalizeYearPart = (yearPart) => {
  if (!/^\d{2}$|^\d{4}$/.test(yearPart)) return null;

  if (yearPart.length === 4) {
    return Number(yearPart);
  }

  const yy = Number(yearPart);
  return yy <= 29 ? 2000 + yy : 1900 + yy;
};

const isValidDisplayDate = (value) => {
  if (!/^\d{2}\/\d{2}\/(\d{2}|\d{4})$/.test(value)) return false;

  const [dayStr, monthStr, yearStr] = value.split('/');
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = normalizeYearPart(yearStr);

  if (!year) return false;

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const displayToIso = (value) => {
  if (!isValidDisplayDate(value)) return '';

  const [day, month, yearStr] = value.split('/');
  const year = normalizeYearPart(yearStr);

  if (!year) return '';

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const isoToDisplay = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
};

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

const parseIsoDate = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getAgeAtDate = (birthIso, targetIso) => {
  const birth = parseIsoDate(birthIso);
  const target = parseIsoDate(targetIso);

  if (!birth || !target) return null;

  let age = target.getFullYear() - birth.getFullYear();
  const monthDiff = target.getMonth() - birth.getMonth();
  const dayDiff = target.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

const isOlderThanOneYearFromToday = (isoDate) => {
  const date = parseIsoDate(isoDate);
  if (!date) return false;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const oneYearAgo = new Date(todayOnly);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return date < oneYearAgo;
};

const getInitialDifferentCategoryMode = (source) => {
  if (source.differentCategoryMode === 'yes' || source.differentCategoryMode === 'no') {
    return source.differentCategoryMode;
  }

  if (
    source.hasDifferentDeiCategoryAfter2015 === true ||
    source.hasDifferentDeiCategoryAfter2015 === 'yes'
  ) {
    return 'yes';
  }

  if (
    source.hasDifferentDeiCategoryAfter2015 === false ||
    source.hasDifferentDeiCategoryAfter2015 === 'no'
  ) {
    return 'no';
  }

  if (
    source.differentDeiCategoryAfter2015Years ||
    source.differentDeiCategoryAfter2015Months
  ) {
    return 'yes';
  }

  return 'no';
};

const DeiGeneralInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state?.generalInfoData || null;
  const incomingSpecialConditionsData = location.state?.specialConditionsData || {};

  const birthDatePickerRef = useRef(null);
  const pensionDatePickerRef = useRef(null);

  const mapDataToState = (source) => ({
    birthDate: source.birthDate || '',
    birthDateDisplay: isoToDisplay(source.birthDate || ''),
    pensionDate: source.pensionDate || '',
    pensionDateDisplay: isoToDisplay(source.pensionDate || ''),
    totalInsuranceYears: source.totalInsuranceYears || '',
    totalInsuranceMonths: source.totalInsuranceMonths || '',
    residenceYears: source.residenceYears || '40',
    insuredType: source.insuredType || 'old',
    deiCategory: source.deiCategory || 'lignite',
    pensionMode: source.pensionMode || 'full',
    reducedYears: source.reducedYears || '',
    differentCategoryMode: getInitialDifferentCategoryMode(source),

    outsideBefore2014Years:
      source.yearsOutsideDeiBefore2014 ||
      source.outsideBefore2014Years ||
      '',
    outsideBefore2014Months:
      source.monthsOutsideDeiBefore2014 ||
      source.outsideBefore2014Months ||
      '',

    differentDeiCategoryAfter2015Years:
      source.differentDeiCategoryAfter2015Years || '',
    differentDeiCategoryAfter2015Months:
      source.differentDeiCategoryAfter2015Months || ''
  });

  const [formData, setFormData] = useState(() => mapDataToState({}));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(mapDataToState(initialData));
      setErrorMessage('');
    }
  }, [initialData]);

  const handleFillTestData = () => {
    setFormData(mapDataToState(deiGeneralInfoMockData));
    setErrorMessage('');
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIntChange = (field, max = null) => (e) => {
    handleChange(field, sanitizeIntegerInput(e.target.value, max));
  };

  const handleDateDisplayChange = (fieldIso, fieldDisplay, value) => {
    const sanitized = sanitizeDisplayDate(value);
    handleChange(fieldDisplay, sanitized);
    handleChange(fieldIso, displayToIso(sanitized));
  };

  const handleNativeDateChange = (fieldIso, fieldDisplay, value) => {
    handleChange(fieldIso, value);
    handleChange(fieldDisplay, isoToDisplay(value));
  };

  const handleDifferentCategoryModeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      differentCategoryMode: value,
      differentDeiCategoryAfter2015Years: value === 'yes' ? prev.differentDeiCategoryAfter2015Years : '',
      differentDeiCategoryAfter2015Months: value === 'yes' ? prev.differentDeiCategoryAfter2015Months : ''
    }));
  };

  const handlePensionModeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      pensionMode: value,
      reducedYears: value === 'reduced' ? prev.reducedYears : ''
    }));
  };

  const handleReducedYearsChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      reducedYears: value
    }));
  };

  const handleNextStep = () => {
    setErrorMessage('');

    const birthDateObj = parseIsoDate(formData.birthDate);
    const pensionDateObj = parseIsoDate(formData.pensionDate);

    if (!formData.birthDate || !birthDateObj) {
      setErrorMessage('Παρακαλώ συμπληρώστε έγκυρη Ημερομηνία Γέννησης.');
      return;
    }

    if (!formData.pensionDate || !pensionDateObj) {
      setErrorMessage('Παρακαλώ συμπληρώστε έγκυρη Ημερομηνία Σύνταξης.');
      return;
    }

    if (pensionDateObj <= birthDateObj) {
      setErrorMessage('Η Ημερομηνία Σύνταξης πρέπει να είναι μεταγενέστερη από την Ημερομηνία Γέννησης.');
      return;
    }

    if (isOlderThanOneYearFromToday(formData.pensionDate)) {
      setErrorMessage('Η ημερομηνία σύνταξης δεν μπορεί να είναι παλαιότερη από 1 χρόνο πριν από σήμερα.');
      return;
    }

    const ageAtPension = getAgeAtDate(formData.birthDate, formData.pensionDate);

    if (ageAtPension === null) {
      setErrorMessage('Δεν ήταν δυνατός ο έλεγχος της ηλικίας συνταξιοδότησης.');
      return;
    }

    if (ageAtPension < 50) {
      setErrorMessage('Η φόρμα δεν υπολογίζει σύνταξη για ηλικία κάτω των 50 ετών.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const maxAllowedYear = currentYear + 2;

    if (pensionDateObj.getFullYear() > maxAllowedYear) {
      setErrorMessage(`Η εφαρμογή δεν κάνει υπολογισμό σύνταξης μετά το ${maxAllowedYear}, απαιτείται η υπηρεσία Premium Report.`);
      return;
    }

    if (!formData.totalInsuranceYears && !formData.totalInsuranceMonths) {
      setErrorMessage('Παρακαλώ συμπληρώστε τον Συνολικό Ασφαλιστικό Βίο (Έτη / Μήνες).');
      return;
    }

    const totalInsuranceYearsNum = parseIntegerOrZero(formData.totalInsuranceYears);
    const totalInsuranceMonthsNum = parseIntegerOrZero(formData.totalInsuranceMonths);

    if (totalInsuranceMonthsNum < 0 || totalInsuranceMonthsNum > 11) {
      setErrorMessage('Οι μήνες του συνολικού ασφαλιστικού βίου πρέπει να είναι από 0 έως 11.');
      return;
    }

    const expectedTotalInMonths = (totalInsuranceYearsNum * 12) + totalInsuranceMonthsNum;

    if (expectedTotalInMonths < 180) {
      setErrorMessage('Ο ελάχιστος απαιτούμενος συνολικός χρόνος ασφάλισης για συνταξιοδότηση είναι τα 15 έτη.');
      return;
    }

    if (formData.residenceYears === '') {
      setErrorMessage('Παρακαλώ συμπληρώστε τα Έτη διαμονής στην Ελλάδα.');
      return;
    }

    const residenceYearsNum = parseIntegerOrZero(formData.residenceYears);

    if (residenceYearsNum < 0 || residenceYearsNum > 40) {
      setErrorMessage('Τα έτη διαμονής στην Ελλάδα πρέπει να είναι από 0 έως 40.');
      return;
    }

    const outsideBefore2014MonthsNum = parseIntegerOrZero(formData.outsideBefore2014Months);
    if (outsideBefore2014MonthsNum < 0 || outsideBefore2014MonthsNum > 11) {
      setErrorMessage('Οι μήνες του χρόνου εκτός ΔΕΗ έως 2014 πρέπει να είναι από 0 έως 11.');
      return;
    }

    const differentCategoryAfter2015MonthsNum = parseIntegerOrZero(formData.differentDeiCategoryAfter2015Months);
    if (differentCategoryAfter2015MonthsNum < 0 || differentCategoryAfter2015MonthsNum > 11) {
      setErrorMessage('Οι μήνες του χρόνου σε διαφορετική κατηγορία ΔΕΗ πρέπει να είναι από 0 έως 11.');
      return;
    }

    if (formData.pensionMode === 'reduced' && !formData.reducedYears) {
      setErrorMessage('Επιλέξτε πόσα έτη πρόωρης εξόδου θα χρησιμοποιηθούν για τη μειωμένη σύνταξη.');
      return;
    }

    const outsideBefore2014TotalMonths =
      (parseIntegerOrZero(formData.outsideBefore2014Years) * 12) + outsideBefore2014MonthsNum;

    const differentCategoryAfter2015TotalMonths =
      formData.differentCategoryMode === 'yes'
        ? (parseIntegerOrZero(formData.differentDeiCategoryAfter2015Years) * 12) + differentCategoryAfter2015MonthsNum
        : 0;

    if (formData.differentCategoryMode === 'yes' && differentCategoryAfter2015TotalMonths === 0) {
      setErrorMessage('Συμπληρώστε τον χρόνο σε διαφορετική κατηγορία ΔΕΗ από το 2015 και μετά ή επιλέξτε "Όχι".');
      return;
    }

    const totalDeclaredMonths = outsideBefore2014TotalMonths + differentCategoryAfter2015TotalMonths;

    if (totalDeclaredMonths > expectedTotalInMonths) {
      const calcY = Math.floor(totalDeclaredMonths / 12);
      const calcM = totalDeclaredMonths % 12;

      setErrorMessage(
        `Αναντιστοιχία χρόνου: Ο συνολικός βίος είναι ${totalInsuranceYearsNum} έτη και ${totalInsuranceMonthsNum} μήνες, αλλά ο δηλωμένος ειδικός χρόνος βγαίνει ${calcY} έτη και ${calcM} μήνες.`
      );
      return;
    }

    const data = {
      birthDate: formData.birthDate,
      pensionDate: formData.pensionDate,
      totalInsuranceYears: String(totalInsuranceYearsNum),
      totalInsuranceMonths: String(totalInsuranceMonthsNum),
      residenceYears: String(residenceYearsNum),
      insuredType: formData.insuredType,
      deiCategory: formData.deiCategory,
      pensionMode: formData.pensionMode,
      reducedYears: formData.pensionMode === 'reduced' ? String(formData.reducedYears) : '',

      yearsOutsideDeiBefore2014: String(parseIntegerOrZero(formData.outsideBefore2014Years)),
      monthsOutsideDeiBefore2014: String(outsideBefore2014MonthsNum),

      differentCategoryMode: formData.differentCategoryMode,
      hasDifferentDeiCategoryAfter2015: formData.differentCategoryMode,
      differentDeiCategoryAfter2015Years: String(parseIntegerOrZero(formData.differentDeiCategoryAfter2015Years)),
      differentDeiCategoryAfter2015Months: String(differentCategoryAfter2015MonthsNum)
    };

    navigate('/calculator/dei/sc', {
      state: {
        generalInfoData: data,
        specialConditionsData: incomingSpecialConditionsData
      }
    });
  };

  let currentAge = null;
  const previewBirthDate = parseIsoDate(formData.birthDate);
  const previewPensionDate = parseIsoDate(formData.pensionDate);

  if (previewBirthDate && previewPensionDate && previewPensionDate > previewBirthDate) {
    currentAge = getAgeAtDate(formData.birthDate, formData.pensionDate);
  }

  return (
    <div className="dei-info-wrapper">
      <div className="dei-info-header">
        <h2>Εργαζόμενοι ΔΕΗ</h2>
      </div>

      <div className="dei-info-top-actions">
        <button type="button" onClick={handleFillTestData} className="step-button step-button-back">
          Γέμισε δοκιμαστικά στοιχεία
        </button>
      </div>

      <div className="dei-info-form-panel dei-info-main-panel">
        <div className="dei-info-two-columns">
          <div className="dei-info-col-left">
            <div className="dei-info-section">
              <div className="dei-info-grid">
                <div className="dei-info-field">
                  <label className="dei-info-label">Ημερομηνία γέννησης</label>
                  <div className="dei-info-date-wrap">
                    <input
                      type="text"
                      className="dei-info-input"
                      placeholder="dd/mm/yyyy"
                      value={formData.birthDateDisplay}
                      onChange={(e) => handleDateDisplayChange('birthDate', 'birthDateDisplay', e.target.value)}
                    />
                    <button
                      type="button"
                      className="dei-info-date-button"
                      onClick={() => {
                        if (birthDatePickerRef.current?.showPicker) {
                          birthDatePickerRef.current.showPicker();
                        } else {
                          birthDatePickerRef.current?.click();
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V5M16 2V5M3 9H21M7 5H17C19.2 5 21 6.8 21 9V18C21 20.2 19.2 22 17 22H7C4.8 22 3 20.2 3 18V9C3 6.8 4.8 5 7 5Z" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </button>
                    <input
                      ref={birthDatePickerRef}
                      type="date"
                      className="dei-info-native-date"
                      value={formData.birthDate}
                      onChange={(e) => handleNativeDateChange('birthDate', 'birthDateDisplay', e.target.value)}
                    />
                  </div>
                </div>

                <div className="dei-info-field">
                  <label className="dei-info-label">Ημερομηνία σύνταξης</label>
                  <div className="dei-info-date-wrap">
                    <input
                      type="text"
                      className="dei-info-input"
                      placeholder="dd/mm/yyyy"
                      value={formData.pensionDateDisplay}
                      onChange={(e) => handleDateDisplayChange('pensionDate', 'pensionDateDisplay', e.target.value)}
                    />
                    <button
                      type="button"
                      className="dei-info-date-button"
                      onClick={() => {
                        if (pensionDatePickerRef.current?.showPicker) {
                          pensionDatePickerRef.current.showPicker();
                        } else {
                          pensionDatePickerRef.current?.click();
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V5M16 2V5M3 9H21M7 5H17C19.2 5 21 6.8 21 9V18C21 20.2 19.2 22 17 22H7C4.8 22 3 20.2 3 18V9C3 6.8 4.8 5 7 5Z" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </button>
                    <input
                      ref={pensionDatePickerRef}
                      type="date"
                      className="dei-info-native-date"
                      value={formData.pensionDate}
                      onChange={(e) => handleNativeDateChange('pensionDate', 'pensionDateDisplay', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="dei-info-section">
              <div className="dei-info-field">
                <label className="dei-info-label">Συνολικός ασφαλιστικός βίος</label>
                <div className="dei-info-grid dei-info-grid-inner">
                  <div className="dei-info-field dei-info-field-small">
                    <label className="dei-info-sub-label">Έτη</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="dei-info-input"
                      value={formData.totalInsuranceYears}
                      onChange={handleIntChange('totalInsuranceYears')}
                    />
                  </div>

                  <div className="dei-info-field dei-info-field-small">
                    <label className="dei-info-sub-label">Μήνες</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="dei-info-input"
                      value={formData.totalInsuranceMonths}
                      onChange={handleIntChange('totalInsuranceMonths', 11)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="dei-info-section dei-info-section-last">
              <div className="dei-compact-fields-row">
                <div className="dei-info-field">
                  <h3 className="dei-info-title">Πρώτη ασφάλιση πριν 1/1/1993</h3>
                  <div className="dei-radio-group">
                    <label className="dei-radio-label">
                      <input
                        type="radio"
                        checked={formData.insuredType === 'old'}
                        onChange={() => handleChange('insuredType', 'old')}
                      />
                      <span>Ναι</span>
                    </label>

                    <label className="dei-radio-label">
                      <input
                        type="radio"
                        checked={formData.insuredType === 'new'}
                        onChange={() => handleChange('insuredType', 'new')}
                      />
                      <span>Όχι</span>
                    </label>
                  </div>
                </div>

                <div className="dei-info-field dei-info-field-last">
                  <label className="dei-info-label">Έτη διαμονής στην Ελλάδα</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="dei-info-input"
                    value={formData.residenceYears}
                    onChange={handleIntChange('residenceYears', 40)}
                  />
                </div>
              </div>

              <div className="dei-info-extra-box">
                <h3 className="dei-info-title">Πλήρης ή Μειωμένη</h3>

                <div className="dei-radio-group">
                  <label className="dei-radio-label">
                    <input
                      type="radio"
                      checked={formData.pensionMode === 'full'}
                      onChange={() => handlePensionModeChange('full')}
                    />
                    <span>Πλήρης</span>
                  </label>

                  <label className="dei-radio-label">
                    <input
                      type="radio"
                      checked={formData.pensionMode === 'reduced'}
                      onChange={() => handlePensionModeChange('reduced')}
                    />
                    <span>Μειωμένη</span>
                  </label>
                </div>

                <div className={`dei-reduced-years-box ${formData.pensionMode !== 'reduced' ? 'is-disabled' : ''}`}>
                  <label className="dei-info-label">Έτη πρόωρης εξόδου</label>
                  <div className="dei-radio-group dei-radio-group-years">
                    {[1, 2, 3, 4, 5].map((year) => (
                      <label key={year} className="dei-radio-label">
                        <input
                          type="radio"
                          checked={formData.reducedYears === String(year)}
                          onChange={() => handleReducedYearsChange(String(year))}
                          disabled={formData.pensionMode !== 'reduced'}
                        />
                        <span>{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dei-info-col-right">
            <div className="dei-info-section">
              <h3 className="dei-info-title">Κατηγορία ΔΕΗ</h3>
              <div className="dei-radio-group dei-radio-group-category">
                <label className="dei-radio-label">
                  <input
                    type="radio"
                    checked={formData.deiCategory === 'simple'}
                    onChange={() => handleChange('deiCategory', 'simple')}
                  />
                  <span>Απλά</span>
                </label>

                <label className="dei-radio-label">
                  <input
                    type="radio"
                    checked={formData.deiCategory === 'heavy'}
                    onChange={() => handleChange('deiCategory', 'heavy')}
                  />
                  <span>Βαρέα</span>
                </label>

                <label className="dei-radio-label">
                  <input
                    type="radio"
                    checked={formData.deiCategory === 'lignite'}
                    onChange={() => handleChange('deiCategory', 'lignite')}
                  />
                  <span>Υπερβαρέα / Λιγνιτωρύχοι</span>
                </label>
              </div>
            </div>

            <div className="dei-info-section">
              <h3 className="dei-info-title">Χρόνος εκτός ΔΕΗ έως 2014</h3>
              <div className="dei-info-grid dei-info-grid-inner">
                <div className="dei-info-field dei-info-field-small">
                  <label className="dei-info-sub-label">Έτη</label>
                  <input
                    type="text"
                    className="dei-info-input"
                    inputMode="numeric"
                    value={formData.outsideBefore2014Years}
                    onChange={handleIntChange('outsideBefore2014Years')}
                  />
                </div>

                <div className="dei-info-field dei-info-field-small">
                  <label className="dei-info-sub-label">Μήνες</label>
                  <input
                    type="text"
                    className="dei-info-input"
                    inputMode="numeric"
                    value={formData.outsideBefore2014Months}
                    onChange={handleIntChange('outsideBefore2014Months', 11)}
                  />
                </div>
              </div>
            </div>

            <div className="dei-info-section dei-info-section-last">
              <h3 className="dei-info-title">Από το 2015 και μετά υπήρξαν χρόνια σε διαφορετική κατηγορία ΔΕΗ;</h3>

              <div className="dei-radio-group">
                <label className="dei-radio-label">
                  <input
                    type="radio"
                    checked={formData.differentCategoryMode === 'yes'}
                    onChange={() => handleDifferentCategoryModeChange('yes')}
                  />
                  <span>Ναι</span>
                </label>

                <label className="dei-radio-label">
                  <input
                    type="radio"
                    checked={formData.differentCategoryMode === 'no'}
                    onChange={() => handleDifferentCategoryModeChange('no')}
                  />
                  <span>Όχι</span>
                </label>
              </div>

              <div className={`dei-inline-period-box ${formData.differentCategoryMode !== 'yes' ? 'is-disabled' : ''}`}>
                <label className="dei-info-label">Χρόνος σε διαφορετική κατηγορία ΔΕΗ</label>
                <div className="dei-info-grid dei-info-grid-inner">
                  <div className="dei-info-field dei-info-field-small">
                    <label className="dei-info-sub-label">Έτη</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="dei-info-input"
                      value={formData.differentDeiCategoryAfter2015Years}
                      onChange={handleIntChange('differentDeiCategoryAfter2015Years')}
                      disabled={formData.differentCategoryMode !== 'yes'}
                    />
                  </div>

                  <div className="dei-info-field dei-info-field-small">
                    <label className="dei-info-sub-label">Μήνες</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="dei-info-input"
                      value={formData.differentDeiCategoryAfter2015Months}
                      onChange={handleIntChange('differentDeiCategoryAfter2015Months', 11)}
                      disabled={formData.differentCategoryMode !== 'yes'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="step-bottom-navigation">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="step-button step-button-back"
          >
            ← Επιστροφή στις κατηγορίες
          </button>

          {errorMessage ? (
            <div className="dei-error-message">{errorMessage}</div>
          ) : null}

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
  );
};

export default DeiGeneralInfo;