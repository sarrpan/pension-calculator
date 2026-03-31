import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GeneralInfo.css';
import generalInfoMockData from './generalInfoMockData';

const sanitizeDisplayDate = (value) => {
  let cleaned = value.replace(/[^\d]/g, '').slice(0, 8);

  if (cleaned.length > 4) {
    cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  } else if (cleaned.length > 2) {
    cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }

  return cleaned;
};

const isValidDisplayDate = (value) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const displayToIso = (value) => {
  if (!isValidDisplayDate(value)) return '';

  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
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
  return Number.parseInt(value, 10);
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

const inputErrorStyle = {
  borderColor: '#d93025',
  boxShadow: '0 0 0 1px rgba(217, 48, 37, 0.2)'
};

const fieldErrorTextStyle = {
  marginTop: '6px',
  color: '#d93025',
  fontSize: '0.9rem'
};

const GeneralInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialGeneralInfoData = location.state?.generalInfoData || null;
  const preservedSpecialConditionsData = location.state?.specialConditionsData || null;

  const [birthDate, setBirthDate] = useState('');
  const [pensionDate, setPensionDate] = useState('');
  const [totalInsuranceYears, setTotalInsuranceYears] = useState('');
  const [totalInsuranceMonths, setTotalInsuranceMonths] = useState('');
  const [residenceYears, setResidenceYears] = useState('40');

  const [insuredType, setInsuredType] = useState('new');
  const [heavyRetirement, setHeavyRetirement] = useState('no');
  const [heavyMode, setHeavyMode] = useState('none');

  const [heavyUntil2014Years, setHeavyUntil2014Years] = useState('');
  const [heavyUntil2014Months, setHeavyUntil2014Months] = useState('');
  const [heavyFrom2015Years, setHeavyFrom2015Years] = useState('');
  const [heavyFrom2015Months, setHeavyFrom2015Months] = useState('');

  const [birthDateDisplay, setBirthDateDisplay] = useState('');
  const [pensionDateDisplay, setPensionDateDisplay] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const birthDatePickerRef = useRef(null);
  const pensionDatePickerRef = useRef(null);
  const fieldRefs = useRef({});
  const allowBirthPickerRef = useRef(false);
  const allowPensionPickerRef = useRef(false);

  useEffect(() => {
    if (!initialGeneralInfoData) return;

    setBirthDate(initialGeneralInfoData.birthDate || '');
    setPensionDate(initialGeneralInfoData.pensionDate || '');
    setBirthDateDisplay(isoToDisplay(initialGeneralInfoData.birthDate || ''));
    setPensionDateDisplay(isoToDisplay(initialGeneralInfoData.pensionDate || ''));
    setTotalInsuranceYears(initialGeneralInfoData.totalInsuranceYears || '');
    setTotalInsuranceMonths(initialGeneralInfoData.totalInsuranceMonths || '');
    setResidenceYears(initialGeneralInfoData.residenceYears || '40');
    setInsuredType(initialGeneralInfoData.insuredType || 'new');
    setHeavyRetirement(initialGeneralInfoData.heavyRetirement || 'no');
    setHeavyMode(initialGeneralInfoData.heavyMode || 'none');
    setHeavyUntil2014Years(initialGeneralInfoData.heavyUntil2014Years || '');
    setHeavyUntil2014Months(initialGeneralInfoData.heavyUntil2014Months || '');
    setHeavyFrom2015Years(initialGeneralInfoData.heavyFrom2015Years || '');
    setHeavyFrom2015Months(initialGeneralInfoData.heavyFrom2015Months || '');
    setFieldErrors({});
  }, [initialGeneralInfoData]);

  const collectValues = () => ({
    birthDate,
    pensionDate,
    totalInsuranceYears,
    totalInsuranceMonths,
    residenceYears,
    heavyRetirement,
    heavyMode,
    heavyUntil2014Years,
    heavyUntil2014Months,
    heavyFrom2015Years,
    heavyFrom2015Months
  });

  const validateBirthDate = (values) => {
    const birthDateObj = parseIsoDate(values.birthDate);

    if (!values.birthDate || !birthDateObj) {
      return 'Συμπληρώστε έγκυρη ημερομηνία γέννησης.';
    }

    return '';
  };

  const validatePensionDate = (values) => {
    const pensionDateObj = parseIsoDate(values.pensionDate);

    if (!values.pensionDate || !pensionDateObj) {
      return 'Συμπληρώστε έγκυρη ημερομηνία σύνταξης.';
    }

    if (isOlderThanOneYearFromToday(values.pensionDate)) {
      return 'Η ημερομηνία σύνταξης δεν μπορεί να είναι παλαιότερη από 1 χρόνο πριν από σήμερα.';
    }

    const birthDateObj = parseIsoDate(values.birthDate);
    if (birthDateObj) {
      const ageAtPension = getAgeAtDate(values.birthDate, values.pensionDate);
      if (ageAtPension !== null && ageAtPension < 50) {
        return 'Η ηλικία κατά την ημερομηνία σύνταξης πρέπει να είναι τουλάχιστον 50 ετών.';
      }
    }

    return '';
  };

  const validateTotalInsurance = (values) => {
    const totalInsuranceYearsNum = parseIntegerOrZero(values.totalInsuranceYears);
    const totalInsuranceMonthsNum = parseIntegerOrZero(values.totalInsuranceMonths);

    if (values.totalInsuranceYears === '') {
      return 'Συμπληρώστε τα συνολικά έτη ασφάλισης.';
    }

    if (totalInsuranceMonthsNum < 0 || totalInsuranceMonthsNum > 11) {
      return 'Οι μήνες του συνολικού ασφαλιστικού βίου πρέπει να είναι από 0 έως 11.';
    }

    const totalInsuranceInYears = totalInsuranceYearsNum + totalInsuranceMonthsNum / 12;
    if (totalInsuranceInYears < 15) {
      return 'Για να προχωρήσετε απαιτούνται τουλάχιστον 15 έτη ασφάλισης.';
    }

    return '';
  };

  const validateResidenceYears = (values) => {
    const residenceYearsNum = parseIntegerOrZero(values.residenceYears);

    if (values.residenceYears === '') {
      return 'Συμπληρώστε τα έτη διαμονής στην Ελλάδα.';
    }

    if (residenceYearsNum < 0 || residenceYearsNum > 40) {
      return 'Τα έτη διαμονής στην Ελλάδα πρέπει να είναι από 0 έως 40.';
    }

    return '';
  };

  const validateHeavyPartial = (values) => {
    if (values.heavyMode !== 'partial') {
      return '';
    }

    const totalInsuranceError = validateTotalInsurance(values);
    if (totalInsuranceError) {
      return 'Συμπληρώστε πρώτα σωστά τον συνολικό ασφαλιστικό βίο.';
    }

    const heavyUntil2014YearsNum = parseIntegerOrZero(values.heavyUntil2014Years);
    const heavyUntil2014MonthsNum = parseIntegerOrZero(values.heavyUntil2014Months);
    const heavyFrom2015YearsNum = parseIntegerOrZero(values.heavyFrom2015Years);
    const heavyFrom2015MonthsNum = parseIntegerOrZero(values.heavyFrom2015Months);
    const totalInsuranceInYears =
      parseIntegerOrZero(values.totalInsuranceYears) +
      parseIntegerOrZero(values.totalInsuranceMonths) / 12;

    if (heavyUntil2014MonthsNum < 0 || heavyUntil2014MonthsNum > 11) {
      return 'Οι μήνες βαρέων έως το 2014 πρέπει να είναι από 0 έως 11.';
    }

    if (heavyFrom2015MonthsNum < 0 || heavyFrom2015MonthsNum > 11) {
      return 'Οι μήνες βαρέων από το 2015 και μετά πρέπει να είναι από 0 έως 11.';
    }

    const totalHeavyInYears =
      heavyUntil2014YearsNum +
      heavyUntil2014MonthsNum / 12 +
      heavyFrom2015YearsNum +
      heavyFrom2015MonthsNum / 12;

    if (totalHeavyInYears <= 0) {
      return 'Στα μερικώς βαρέα πρέπει να συμπληρωθεί τουλάχιστον ένας χρόνος ή μήνας βαρέων.';
    }

    if (totalHeavyInYears > totalInsuranceInYears) {
      return 'Ο συνολικός χρόνος βαρέων δεν μπορεί να ξεπερνά τον συνολικό ασφαλιστικό βίο.';
    }

    if (totalHeavyInYears < 12) {
      return 'Στα μερικώς βαρέα το άθροισμα πριν το 2014 και από το 2015 και μετά πρέπει να είναι τουλάχιστον 12 έτη.';
    }

    return '';
  };

  const runAllValidations = (values) => {
    return {
      birthDate: validateBirthDate(values),
      pensionDate: validatePensionDate(values),
      totalInsurance: validateTotalInsurance(values),
      residenceYears: validateResidenceYears(values),
      heavyPartial: validateHeavyPartial(values)
    };
  };

  const getFirstErrorFocusName = (errors, values) => {
    if (errors.birthDate) return 'birthDate';
    if (errors.pensionDate) return 'pensionDate';
    if (errors.totalInsurance) return 'totalInsuranceYears';
    if (errors.residenceYears) return 'residenceYears';
    if (errors.heavyPartial && values.heavyMode === 'partial') return 'heavyUntil2014Years';
    return null;
  };

  const focusField = (fieldName) => {
    const ref = fieldRefs.current[fieldName];
    if (ref?.focus) {
      setTimeout(() => ref.focus(), 0);
    }
  };

  const handleBirthDateTextChange = (value) => {
    const formatted = sanitizeDisplayDate(value);
    setBirthDateDisplay(formatted);
    setBirthDate(displayToIso(formatted));
    setFieldErrors((prev) => ({ ...prev, birthDate: '', pensionDate: '' }));
  };

  const handlePensionDateTextChange = (value) => {
    const formatted = sanitizeDisplayDate(value);
    setPensionDateDisplay(formatted);
    setPensionDate(displayToIso(formatted));
    setFieldErrors((prev) => ({ ...prev, pensionDate: '' }));
  };

  const handleBirthDatePickerChange = (value) => {
    setBirthDate(value);
    setBirthDateDisplay(isoToDisplay(value));
    setFieldErrors((prev) => ({ ...prev, birthDate: '', pensionDate: '' }));
  };

  const handlePensionDatePickerChange = (value) => {
    setPensionDate(value);
    setPensionDateDisplay(isoToDisplay(value));
    setFieldErrors((prev) => ({ ...prev, pensionDate: '' }));
  };

  const openBirthDatePicker = () => {
    if (birthDatePickerRef.current?.showPicker) {
      birthDatePickerRef.current.showPicker();
    } else if (birthDatePickerRef.current) {
      birthDatePickerRef.current.click();
    }
  };

  const openPensionDatePicker = () => {
    if (pensionDatePickerRef.current?.showPicker) {
      pensionDatePickerRef.current.showPicker();
    } else if (pensionDatePickerRef.current) {
      pensionDatePickerRef.current.click();
    }
  };

  const handleIntegerFieldChange = (setter, errorKey, max = null) => (e) => {
    setter(sanitizeIntegerInput(e.target.value, max));
    if (errorKey) {
      setFieldErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateOnBlur = (errorKey, focusFieldName, allowRef = null) => {
    if (errorKey === 'heavyPartial') {
      return;
    }

    const values = collectValues();
    const errors = runAllValidations(values);
    const message = errors[errorKey] || '';

    setFieldErrors((prev) => ({
      ...prev,
      [errorKey]: message
    }));

    if (message) {
      const shouldSkipRefocus = allowRef?.current === true;
      if (allowRef) allowRef.current = false;
      if (!shouldSkipRefocus) {
        focusField(focusFieldName);
      }
      return;
    }

    if (allowRef) allowRef.current = false;
  };

  const handleHeavyModeChange = (nextMode) => {
    setHeavyMode(nextMode);
    setFieldErrors((prev) => ({ ...prev, heavyPartial: '' }));

    if (nextMode !== 'partial') {
      setHeavyUntil2014Years('');
      setHeavyUntil2014Months('');
      setHeavyFrom2015Years('');
      setHeavyFrom2015Months('');
    }
  };

  const handleFillTestData = () => {
    setBirthDate(generalInfoMockData.birthDate || '');
    setPensionDate(generalInfoMockData.pensionDate || '');
    setBirthDateDisplay(isoToDisplay(generalInfoMockData.birthDate || ''));
    setPensionDateDisplay(isoToDisplay(generalInfoMockData.pensionDate || ''));
    setTotalInsuranceYears(generalInfoMockData.totalInsuranceYears || '');
    setTotalInsuranceMonths(generalInfoMockData.totalInsuranceMonths || '');
    setResidenceYears(generalInfoMockData.residenceYears || '40');
    setInsuredType(generalInfoMockData.insuredType || 'new');
    setHeavyRetirement(generalInfoMockData.heavyRetirement || 'no');
    setHeavyMode(generalInfoMockData.heavyMode || 'none');
    setHeavyUntil2014Years(generalInfoMockData.heavyUntil2014Years || '');
    setHeavyUntil2014Months(generalInfoMockData.heavyUntil2014Months || '');
    setHeavyFrom2015Years(generalInfoMockData.heavyFrom2015Years || '');
    setHeavyFrom2015Months(generalInfoMockData.heavyFrom2015Months || '');
    setFieldErrors({});
  };

  const handleNextStep = () => {
    const values = collectValues();
    const errors = runAllValidations(values);
    setFieldErrors(errors);

    const firstErrorField = getFirstErrorFocusName(errors, values);
    if (firstErrorField) {
      focusField(firstErrorField);
      return;
    }

    const totalInsuranceYearsNum = parseIntegerOrZero(totalInsuranceYears);
    const totalInsuranceMonthsNum = parseIntegerOrZero(totalInsuranceMonths);
    const residenceYearsNum = parseIntegerOrZero(residenceYears);
    const heavyUntil2014YearsNum = parseIntegerOrZero(heavyUntil2014Years);
    const heavyUntil2014MonthsNum = parseIntegerOrZero(heavyUntil2014Months);
    const heavyFrom2015YearsNum = parseIntegerOrZero(heavyFrom2015Years);
    const heavyFrom2015MonthsNum = parseIntegerOrZero(heavyFrom2015Months);

    const generalInfoData = {
      birthDate,
      pensionDate,
      totalInsuranceYears: String(totalInsuranceYearsNum),
      totalInsuranceMonths: String(totalInsuranceMonthsNum),
      residenceYears: String(residenceYearsNum),
      insuredType,
      heavyRetirement,
      heavyMode,
      heavyUntil2014Years: String(heavyUntil2014YearsNum),
      heavyUntil2014Months: String(heavyUntil2014MonthsNum),
      heavyFrom2015Years: String(heavyFrom2015YearsNum),
      heavyFrom2015Months: String(heavyFrom2015MonthsNum)
    };

    navigate('/calculator/misthotoi/sc', {
      state: {
        generalInfoData,
        specialConditionsData: preservedSpecialConditionsData
      }
    });
  };

  const hasError = (key) => Boolean(fieldErrors[key]);

  return (
    <div className="gen-info-wrapper">
      <div className="gen-info-header">
        <h2>Μισθωτοί</h2>
        <p>Συμπληρώστε τις βασικές πληροφορίες του ασφαλιστικού σας βίου</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handleFillTestData}
          className="step-button step-button-back"
        >
          Γέμισε δοκιμαστικά στοιχεία
        </button>
      </div>

      <div className="gen-info-main-panel">
        <div className="gen-info-two-columns">
          <div className="gen-info-col-left">
            <div className="gen-info-section">
              <div className="gen-info-grid">
                <div className="gen-info-field">
                  <label className="gen-info-label">Ημερομηνία γέννησης</label>
                  <div className="gen-info-date-wrap">
                    <input
                      ref={(el) => {
                        fieldRefs.current.birthDate = el;
                      }}
                      type="text"
                      className="gen-info-input date-gr"
                      style={hasError('birthDate') ? inputErrorStyle : undefined}
                      placeholder="dd/mm/yyyy"
                      inputMode="numeric"
                      value={birthDateDisplay}
                      onChange={(e) => handleBirthDateTextChange(e.target.value)}
                      onBlur={() => validateOnBlur('birthDate', 'birthDate', allowBirthPickerRef)}
                    />
                    <button
                      type="button"
                      className="gen-info-date-button"
                      onMouseDown={() => {
                        allowBirthPickerRef.current = true;
                      }}
                      onClick={openBirthDatePicker}
                      aria-label="Άνοιγμα ημερολογίου"
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M8 2V5M16 2V5M3 9H21M7 5H17C19.2091 5 21 6.79086 21 9V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V9C3 6.79086 4.79086 5 7 5Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <input
                      ref={birthDatePickerRef}
                      type="date"
                      className="gen-info-native-date"
                      value={birthDate}
                      onChange={(e) => handleBirthDatePickerChange(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                  {fieldErrors.birthDate && <div style={fieldErrorTextStyle}>{fieldErrors.birthDate}</div>}
                </div>

                <div className="gen-info-field">
                  <label className="gen-info-label">Ημερομηνία σύνταξης</label>
                  <div className="gen-info-date-wrap">
                    <input
                      ref={(el) => {
                        fieldRefs.current.pensionDate = el;
                      }}
                      type="text"
                      className="gen-info-input date-gr"
                      style={hasError('pensionDate') ? inputErrorStyle : undefined}
                      placeholder="dd/mm/yyyy"
                      inputMode="numeric"
                      value={pensionDateDisplay}
                      onChange={(e) => handlePensionDateTextChange(e.target.value)}
                      onBlur={() => validateOnBlur('pensionDate', 'pensionDate', allowPensionPickerRef)}
                    />
                    <button
                      type="button"
                      className="gen-info-date-button"
                      onMouseDown={() => {
                        allowPensionPickerRef.current = true;
                      }}
                      onClick={openPensionDatePicker}
                      aria-label="Άνοιγμα ημερολογίου"
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M8 2V5M16 2V5M3 9H21M7 5H17C19.2091 5 21 6.79086 21 9V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V9C3 6.79086 4.79086 5 7 5Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <input
                      ref={pensionDatePickerRef}
                      type="date"
                      className="gen-info-native-date"
                      value={pensionDate}
                      onChange={(e) => handlePensionDatePickerChange(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                  {fieldErrors.pensionDate && <div style={fieldErrorTextStyle}>{fieldErrors.pensionDate}</div>}
                </div>
              </div>
            </div>

            <div className="gen-info-section">
              <div className="gen-info-field">
                <label className="gen-info-label">Συνολικός ασφαλιστικός βίος</label>
                <div className="gen-info-grid gen-info-grid-inner">
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Έτη</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.totalInsuranceYears = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('totalInsurance') ? inputErrorStyle : undefined}
                      value={totalInsuranceYears}
                      onChange={handleIntegerFieldChange(setTotalInsuranceYears, 'totalInsurance')}
                      onBlur={() => validateOnBlur('totalInsurance', 'totalInsuranceYears')}
                    />
                  </div>
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Μήνες</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.totalInsuranceMonths = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('totalInsurance') ? inputErrorStyle : undefined}
                      value={totalInsuranceMonths}
                      onChange={handleIntegerFieldChange(setTotalInsuranceMonths, 'totalInsurance', 11)}
                      onBlur={() => validateOnBlur('totalInsurance', 'totalInsuranceYears')}
                    />
                  </div>
                </div>
                {fieldErrors.totalInsurance && <div style={fieldErrorTextStyle}>{fieldErrors.totalInsurance}</div>}
              </div>
            </div>

            <div className="gen-info-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div className="gen-info-field gen-info-field-last">
                <label className="gen-info-label">Έτη διαμονής στην Ελλάδα</label>
                <input
                  ref={(el) => {
                    fieldRefs.current.residenceYears = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  className="gen-info-input"
                  style={hasError('residenceYears') ? inputErrorStyle : undefined}
                  value={residenceYears}
                  onChange={handleIntegerFieldChange(setResidenceYears, 'residenceYears', 40)}
                  onBlur={() => validateOnBlur('residenceYears', 'residenceYears')}
                />
                {fieldErrors.residenceYears && <div style={fieldErrorTextStyle}>{fieldErrors.residenceYears}</div>}
              </div>
            </div>
          </div>

          <div className="gen-info-col-right">
            <div className="gen-info-section">
              <h3 className="gen-info-title">Πρώτη ασφάλιση πριν 1/1/1993</h3>
              <div className="classic-radio-group">
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={insuredType === 'old'}
                    onChange={() => setInsuredType('old')}
                  />
                  <span>Ναι</span>
                </label>
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={insuredType === 'new'}
                    onChange={() => setInsuredType('new')}
                  />
                  <span>Όχι</span>
                </label>
              </div>
            </div>

            <div className="gen-info-section">
              <h3 className="gen-info-title">Αποχώρηση με καθεστώς βαρέων</h3>
              <div className="classic-radio-group">
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={heavyRetirement === 'yes'}
                    onChange={() => {
                      setHeavyRetirement('yes');
                      setFieldErrors((prev) => ({ ...prev, heavyPartial: '' }));
                    }}
                  />
                  <span>Ναι</span>
                </label>
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={heavyRetirement === 'no'}
                    onChange={() => {
                      setHeavyRetirement('no');
                      setFieldErrors((prev) => ({ ...prev, heavyPartial: '' }));
                    }}
                  />
                  <span>Όχι</span>
                </label>
              </div>
            </div>

            <div className="gen-info-section">
              <h3 className="gen-info-title">Βαρέα</h3>
              <div className="classic-radio-group">
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={heavyMode === 'none'}
                    onChange={() => handleHeavyModeChange('none')}
                  />
                  <span>Καθόλου βαρέα</span>
                </label>
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={heavyMode === 'all'}
                    onChange={() => handleHeavyModeChange('all')}
                  />
                  <span>Όλα βαρέα</span>
                </label>
                <label className="classic-radio">
                  <input
                    type="radio"
                    checked={heavyMode === 'partial'}
                    onChange={() => handleHeavyModeChange('partial')}
                  />
                  <span>Μερικώς βαρέα</span>
                </label>
              </div>
            </div>

            <div
              className={`gen-info-section ${heavyMode !== 'partial' ? 'section-disabled' : ''}`}
              style={{ borderBottom: 'none', paddingBottom: 0 }}
            >
              <h3 className="gen-info-title">Χρόνος βαρέων ανά περίοδο</h3>

              <div className="gen-info-field" style={{ marginBottom: '16px' }}>
                <label className="gen-info-label">Έως 2014</label>
                <div className="gen-info-grid gen-info-grid-inner">
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Έτη</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.heavyUntil2014Years = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('heavyPartial') ? inputErrorStyle : undefined}
                      value={heavyUntil2014Years}
                      onChange={handleIntegerFieldChange(setHeavyUntil2014Years, 'heavyPartial')}
                      disabled={heavyMode !== 'partial'}
                    />
                  </div>
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Μήνες</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.heavyUntil2014Months = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('heavyPartial') ? inputErrorStyle : undefined}
                      value={heavyUntil2014Months}
                      onChange={handleIntegerFieldChange(setHeavyUntil2014Months, 'heavyPartial', 11)}
                      disabled={heavyMode !== 'partial'}
                    />
                  </div>
                </div>
              </div>

              <div className="gen-info-field gen-info-field-last">
                <label className="gen-info-label">Από 2015 και μετά</label>
                <div className="gen-info-grid gen-info-grid-inner">
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Έτη</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.heavyFrom2015Years = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('heavyPartial') ? inputErrorStyle : undefined}
                      value={heavyFrom2015Years}
                      onChange={handleIntegerFieldChange(setHeavyFrom2015Years, 'heavyPartial')}
                      disabled={heavyMode !== 'partial'}
                    />
                  </div>
                  <div className="gen-info-field gen-info-field-small">
                    <label className="gen-info-sub-label">Μήνες</label>
                    <input
                      ref={(el) => {
                        fieldRefs.current.heavyFrom2015Months = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      className="gen-info-input"
                      style={hasError('heavyPartial') ? inputErrorStyle : undefined}
                      value={heavyFrom2015Months}
                      onChange={handleIntegerFieldChange(setHeavyFrom2015Months, 'heavyPartial', 11)}
                      disabled={heavyMode !== 'partial'}
                    />
                  </div>
                </div>
                {fieldErrors.heavyPartial && <div style={fieldErrorTextStyle}>{fieldErrors.heavyPartial}</div>}
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

export default GeneralInfo;
