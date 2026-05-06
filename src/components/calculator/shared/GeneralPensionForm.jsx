import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/GeneralInfo.css';
import GeneralInfoMockData from '../categories/dei/GeneralInfoMockData';

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

const sanitizeDecimalInput = (value) => {
  let cleaned = value.replace(/[^\d.,]/g, '');
  cleaned = cleaned.replace(',', '.');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  return cleaned;
};

const parseIntegerOrZero = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number.parseInt(value, 10) || 0;
};

const parseDecimalOrZero = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number.parseFloat(String(value).replace(',', '.')) || 0;
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

const getInitialInsuranceInputMode = (source) => {
  if (source.insuranceInputMode === 'days' || source.insuranceInputMode === 'yearsMonths') {
    return source.insuranceInputMode;
  }

  if (source.totalInsuranceDays) {
    return 'days';
  }

  return 'yearsMonths';
};

const getInitialPensionableEarningsInputMode = (source) => {
  if (source.pensionableEarningsInputMode === 'manual' || source.pensionableEarningsInputMode === 'annual') {
    return source.pensionableEarningsInputMode;
  }

  if (source.pensionableMonthlyEarnings) {
    return 'manual';
  }

  return 'annual';
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

const GeneralPensionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state?.generalInfoData || null;
  const incomingAnnualEarningsData = location.state?.yearsData || {};
  const incomingDeiCategoryData = location.state?.deiCategoryData || null;

  const birthDatePickerRef = useRef(null);
  const pensionDatePickerRef = useRef(null);

  const mapDataToState = (source) => ({
    birthDate: source.birthDate || '',
    birthDateDisplay: isoToDisplay(source.birthDate || ''),
    pensionDate: source.pensionDate || '',
    pensionDateDisplay: isoToDisplay(source.pensionDate || ''),
    insuranceInputMode: getInitialInsuranceInputMode(source),
    totalInsuranceYears: source.totalInsuranceYears || '',
    totalInsuranceMonths: source.totalInsuranceMonths || '',
    totalInsuranceDays: source.totalInsuranceDays || '',
    residenceYears: source.residenceYears || '40',
    insuredType: source.insuredType || 'old',
    pensionMode: source.pensionMode || 'full',
    reducedYears: source.reducedYears || '',
    pensionableEarningsInputMode: getInitialPensionableEarningsInputMode(source),
    pensionableMonthlyEarnings: source.pensionableMonthlyEarnings || ''
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
    setFormData(mapDataToState(GeneralInfoMockData));
    setErrorMessage('');
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIntChange = (field, max = null) => (e) => {
    handleChange(field, sanitizeIntegerInput(e.target.value, max));
  };

  const handleDecimalChange = (field) => (e) => {
    handleChange(field, sanitizeDecimalInput(e.target.value));
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

  const handlePensionableEarningsInputModeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      pensionableEarningsInputMode: value,
      pensionableMonthlyEarnings: value === 'manual' ? prev.pensionableMonthlyEarnings : ''
    }));
  };

  const handleInsuranceInputModeChange = (value) => {
    setFormData((prev) => {
      const nextState = {
        ...prev,
        insuranceInputMode: value
      };

      if (value === 'days' && !prev.totalInsuranceDays) {
        const calculatedDays = convertYearsMonthsToDays(prev.totalInsuranceYears, prev.totalInsuranceMonths);
        nextState.totalInsuranceDays = calculatedDays > 0 ? String(calculatedDays) : '';
      }

      if (value === 'yearsMonths' && (!prev.totalInsuranceYears && !prev.totalInsuranceMonths) && prev.totalInsuranceDays) {
        const converted = convertDaysToYearsMonths(prev.totalInsuranceDays);
        nextState.totalInsuranceYears = converted.years ? String(converted.years) : '';
        nextState.totalInsuranceMonths = converted.months ? String(converted.months) : '';
      }

      return nextState;
    });
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

    const isInsuranceInDaysMode = formData.insuranceInputMode === 'days';

    let totalInsuranceYearsNum = 0;
    let totalInsuranceMonthsNum = 0;
    let totalInsuranceDaysNum = 0;

    if (isInsuranceInDaysMode) {
      if (!formData.totalInsuranceDays) {
        setErrorMessage('Παρακαλώ συμπληρώστε τον Συνολικό Ασφαλιστικό Βίο σε ημέρες ασφάλισης / ένσημα.');
        return;
      }

      totalInsuranceDaysNum = parseIntegerOrZero(formData.totalInsuranceDays);

      if (totalInsuranceDaysNum < 4500) {
        setErrorMessage('Ο ελάχιστος απαιτούμενος συνολικός χρόνος ασφάλισης για συνταξιοδότηση είναι 4.500 ημέρες ή 15 έτη.');
        return;
      }

      const convertedInsuranceTime = convertDaysToYearsMonths(formData.totalInsuranceDays);
      totalInsuranceYearsNum = convertedInsuranceTime.years;
      totalInsuranceMonthsNum = convertedInsuranceTime.months;
    } else {
      if (!formData.totalInsuranceYears && !formData.totalInsuranceMonths) {
        setErrorMessage('Παρακαλώ συμπληρώστε τον Συνολικό Ασφαλιστικό Βίο (Έτη / Μήνες).');
        return;
      }

      totalInsuranceYearsNum = parseIntegerOrZero(formData.totalInsuranceYears);
      totalInsuranceMonthsNum = parseIntegerOrZero(formData.totalInsuranceMonths);

      if (totalInsuranceMonthsNum < 0 || totalInsuranceMonthsNum > 11) {
        setErrorMessage('Οι μήνες του συνολικού ασφαλιστικού βίου πρέπει να είναι από 0 έως 11.');
        return;
      }

      totalInsuranceDaysNum = convertYearsMonthsToDays(totalInsuranceYearsNum, totalInsuranceMonthsNum);

      const insuranceTotalInMonths = (totalInsuranceYearsNum * 12) + totalInsuranceMonthsNum;

      if (insuranceTotalInMonths < 180) {
        setErrorMessage('Ο ελάχιστος απαιτούμενος συνολικός χρόνος ασφάλισης για συνταξιοδότηση είναι τα 15 έτη.');
        return;
      }
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

    if (formData.pensionMode === 'reduced' && !formData.reducedYears) {
      setErrorMessage('Επιλέξτε πόσα έτη πρόωρης εξόδου θα χρησιμοποιηθούν για τη μειωμένη σύνταξη.');
      return;
    }

    if (
      formData.pensionableEarningsInputMode === 'manual' &&
      parseDecimalOrZero(formData.pensionableMonthlyEarnings) <= 0
    ) {
      setErrorMessage('Παρακαλώ συμπληρώστε έγκυρο μέσο αναπροσαρμοσμένο μηνιαίο μισθό.');
      return;
    }

    const data = {
      birthDate: formData.birthDate,
      pensionDate: formData.pensionDate,
      insuranceInputMode: formData.insuranceInputMode,
      totalInsuranceYears: String(totalInsuranceYearsNum),
      totalInsuranceMonths: String(totalInsuranceMonthsNum),
      totalInsuranceDays: String(totalInsuranceDaysNum),
      residenceYears: String(residenceYearsNum),
      insuredType: formData.insuredType,
      pensionMode: formData.pensionMode,
      reducedYears: formData.pensionMode === 'reduced' ? String(formData.reducedYears) : '',
      pensionableEarningsInputMode: formData.pensionableEarningsInputMode,
      pensionableMonthlyEarnings:
        formData.pensionableEarningsInputMode === 'manual'
          ? String(parseDecimalOrZero(formData.pensionableMonthlyEarnings))
          : ''
    };

    navigate('/calculator/dei/insurance-periods', {
  state: {
    generalInfoData: data,
    insurancePeriods: location.state?.insurancePeriods || [],
    deiCategoryData: incomingDeiCategoryData,
    yearsData: incomingAnnualEarningsData
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
    <div className="info-wrapper">
      <div className="info-header">
        <h2>Γενικά στοιχεία σύνταξης</h2>
      </div>

      <div className="info-top-actions">
        <div className="info-top-actions-note">
          Συμπληρώστε τα βασικά στοιχεία που είναι κοινά για όλες τις κατηγορίες ασφαλισμένων.
        </div>
        <button type="button" onClick={handleFillTestData} className="step-button step-button-next">
          Γέμισε δοκιμαστικά στοιχεία
        </button>
      </div>

      <div className="info-form-panel info-main-panel">
        <div className="info-sections-stack">
          <div className="info-card info-card-blue">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Βασικά στοιχεία</h3>
                <p className="info-card-text">Συμπληρώστε πρώτα τις δύο ημερομηνίες και τον συνολικό ασφαλιστικό βίο.</p>
              </div>
              {currentAge !== null ? (
                <div className="info-inline-chip">Ηλικία στη σύνταξη: {currentAge}</div>
              ) : null}
            </div>

            <div className="info-grid info-grid-wide">
              <div className="info-field">
                <label className="info-label ">Ημερομηνία γέννησης</label>
                <div className="info-date-wrap">
                  <input
                    type="text"
                    className="info-input"
                    placeholder="dd/mm/yyyy"
                    value={formData.birthDateDisplay}
                    onChange={(e) => handleDateDisplayChange('birthDate', 'birthDateDisplay', e.target.value)}
                  />
                  <button
                    type="button"
                    className="info-date-button"
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
                    className="info-native-date"
                    value={formData.birthDate}
                    onChange={(e) => handleNativeDateChange('birthDate', 'birthDateDisplay', e.target.value)}
                  />
                </div>
              </div>

              <div className="info-field">
                <label className="info-label ">Ημερομηνία σύνταξης</label>
                <div className="info-date-wrap">
                  <input
                    type="text"
                    className="info-input"
                    placeholder="dd/mm/yyyy"
                    value={formData.pensionDateDisplay}
                    onChange={(e) => handleDateDisplayChange('pensionDate', 'pensionDateDisplay', e.target.value)}
                  />
                  <button
                    type="button"
                    className="info-date-button"
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
                    className="info-native-date"
                    value={formData.pensionDate}
                    onChange={(e) => handleNativeDateChange('pensionDate', 'pensionDateDisplay', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="info-field info-field-top-gap">
              <label className="info-label">Συνολικός ασφαλιστικός βίος</label>
              <p className="info-helper info-field-helper">
                Επιλέξτε αν θέλετε να δηλώσετε χρόνο σε έτη και μήνες ή απευθείας σε ημέρες ασφάλισης / ένσημα.
              </p>

              <div className="radio-group radio-group-inline-cards">
                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.insuranceInputMode === 'yearsMonths'}
                    onChange={() => handleInsuranceInputModeChange('yearsMonths')}
                  />
                  <span>Έτη και μήνες</span>
                </label>

                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.insuranceInputMode === 'days'}
                    onChange={() => handleInsuranceInputModeChange('days')}
                  />
                  <span>Ημέρες ασφάλισης / ένσημα</span>
                </label>
              </div>

              {formData.insuranceInputMode === 'days' ? (
                <div className="info-grid info-grid-single info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Ημέρες ασφάλισης / ένσημα</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="info-input"
                      value={formData.totalInsuranceDays}
                      onChange={handleIntChange('totalInsuranceDays')}
                      placeholder="π.χ. 10200"
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
                      value={formData.totalInsuranceYears}
                      onChange={handleIntChange('totalInsuranceYears')}
                    />
                  </div>

                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Μήνες</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="info-input"
                      value={formData.totalInsuranceMonths}
                      onChange={handleIntChange('totalInsuranceMonths', 11)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="info-field info-field-top-gap">
              <label className="info-label">Τρόπος εισαγωγής συντάξιμων αποδοχών</label>
              <p className="info-helper info-field-helper">
                Επιλέξτε αν θα συμπληρώσετε αναλυτικά τις αποδοχές ανά έτος ή αν γνωρίζετε ήδη τον μέσο αναπροσαρμοσμένο μηνιαίο μισθό.
              </p>

              <div className="radio-group radio-group-inline-cards">
                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.pensionableEarningsInputMode === 'annual'}
                    onChange={() => handlePensionableEarningsInputModeChange('annual')}
                  />
                  <span>Αναλυτικά ανά έτος</span>
                </label>

                <label className="radio-label radio-label-card">
                  <input
                    type="radio"
                    checked={formData.pensionableEarningsInputMode === 'manual'}
                    onChange={() => handlePensionableEarningsInputModeChange('manual')}
                  />
                  <span>Γνωρίζω ήδη τον μέσο αναπροσαρμοσμένο μηνιαίο μισθό</span>
                </label>
              </div>

              {formData.pensionableEarningsInputMode === 'manual' ? (
                <div className="info-grid info-grid-single info-grid-inner">
                  <div className="info-field info-field-small">
                    <label className="info-sub-label">Μέσος αναπροσαρμοσμένος μηνιαίος μισθός</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="info-input"
                      value={formData.pensionableMonthlyEarnings}
                      onChange={handleDecimalChange('pensionableMonthlyEarnings')}
                      placeholder="π.χ. 1850.50"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="info-card card-orange">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Ασφαλιστική κατάσταση</h3>
                <p className="info-card-text">Δηλώστε το ασφαλιστικό καθεστώς και αν πρόκειται για πλήρη ή μειωμένη σύνταξη.</p>
              </div>
            </div>

            <div className="compact-fields-row compact-fields-row-wide">
              <div className="info-field">
                <h3 className="info-title">Πρώτη ασφάλιση πριν 1/1/1993</h3>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={formData.insuredType === 'old'}
                      onChange={() => handleChange('insuredType', 'old')}
                    />
                    <span>Ναι</span>
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={formData.insuredType === 'new'}
                      onChange={() => handleChange('insuredType', 'new')}
                    />
                    <span>Όχι</span>
                  </label>
                </div>
              </div>

              <div className="info-field info-field-last">
                <label className="info-label ">Έτη διαμονής στην Ελλάδα</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="info-input"
                  value={formData.residenceYears}
                  onChange={handleIntChange('residenceYears', 40)}
                />
              </div>
            </div>

            <div className="info-extra-box">
              <div className="pension-mode-row">
                <div className="info-field">
                  <h3 className="info-title">Πλήρης ή Μειωμένη</h3>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={formData.pensionMode === 'full'}
                        onChange={() => handlePensionModeChange('full')}
                      />
                      <span>Πλήρης</span>
                    </label>

                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={formData.pensionMode === 'reduced'}
                        onChange={() => handlePensionModeChange('reduced')}
                      />
                      <span>Μειωμένη</span>
                    </label>
                  </div>
                </div>

                <div className={`reduced-years-box ${formData.pensionMode !== 'reduced' ? 'is-disabled' : ''}`}>
                  <label className="info-label ">Έτη πρόωρης εξόδου</label>
                  <div className="radio-group radio-group-years">
                    {[1, 2, 3, 4, 5].map((year) => (
                      <label key={year} className="radio-label">
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
        </div>

        <div className="step-bottom-navigation">
          <div className="step-bottom-navigation-left">
            <button
              type="button"
              onClick={() => navigate('/calculator')}
              className="step-button step-button-back"
            >
              ← Επιστροφή στις κατηγορίες
            </button>
          </div>

          <div className="step-bottom-navigation-center">
            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : (
              <div className="bottom-helper">Ελέγξτε μία τελευταία φορά τα στοιχεία σας πριν προχωρήσετε.</div>
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

export default GeneralPensionForm;