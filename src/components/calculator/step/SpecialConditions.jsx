import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SpecialConditions.css';
import SpecialConditionsMockData from './SpecialConditionsMockData';

const sanitizeAmount = (value) => {
  let cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');

  if (cleaned === '') return '';

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  const [rawInt = '', rawDec = ''] = cleaned.split('.');

  let intPart = rawInt;
  if (intPart !== '') {
    intPart = String(Math.min(parseInt(intPart, 10), 200000));
  }

  const decPart = rawDec.slice(0, 2);

  if (intPart === '' && decPart === '') return '';

  if (cleaned.includes('.')) {
    return `${intPart}.${decPart}`;
  }

  return intPart;
};

const sanitizeDays = (value) => {
  const digitsOnly = value.replace(/[^\d]/g, '');

  if (digitsOnly === '') return '';

  return String(Math.min(parseInt(digitsOnly, 10), 300));
};

const DeiSpecialConditions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const generalInfoData = location.state?.generalInfoData || {};
  const incomingSpecialConditionsData = location.state?.specialConditionsData || {};

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 2;
    return Array.from({ length: maxYear - 2002 + 1 }, (_, i) => 2002 + i);
  }, []);

  const buildEmptyYearsData = () => {
    const obj = {};
    for (const year of years) {
      obj[year] = { amount: '', days: '' };
    }
    return obj;
  };

  const buildInitialYearsData = () => {
    const emptyData = buildEmptyYearsData();

    for (const year of years) {
      if (incomingSpecialConditionsData?.[year]) {
        emptyData[year] = {
          amount: incomingSpecialConditionsData[year]?.amount || '',
          days: incomingSpecialConditionsData[year]?.days || ''
        };
      }
    }

    return emptyData;
  };

  const [yearsData, setYearsData] = useState(buildInitialYearsData);

  function setYearField(year, field, value) {
    setYearsData((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        [field]: value,
      },
    }));
  }

  const handleFillTestData = () => {
    const nextData = buildEmptyYearsData();

    for (const year of years) {
      if (SpecialConditionsMockData?.[year]) {
        nextData[year] = {
          amount: SpecialConditionsMockData[year]?.amount || '',
          days: SpecialConditionsMockData[year]?.days || ''
        };
      }
    }

    setYearsData(nextData);
  };

  const handleNextStep = () => {
    const errors = [];

    for (const year of years) {
      const amount = yearsData[year]?.amount?.trim() || '';
      const days = yearsData[year]?.days?.trim() || '';

      const hasAmount = amount !== '';
      const hasDays = days !== '';

      if (hasAmount && !hasDays) {
        errors.push(`Το έτος ${year} έχει απολαβές αλλά δεν έχει ημέρες.`);
      }

      if (!hasAmount && hasDays) {
        errors.push(`Το έτος ${year} έχει ημέρες αλλά δεν έχει απολαβές.`);
      }
    }

    if (errors.length > 0) {
      window.alert(errors.join('\n'));
      return;
    }

    const finalData = {
      generalInfoData: generalInfoData,
      specialConditionsData: yearsData
    };

    // Αποθήκευση στη μνήμη του browser για να αντέχει στο F5
    sessionStorage.setItem('specialConditionsCalculatorState', JSON.stringify(finalData));

    navigate('/calculator/misthotoi/results', { state: finalData });
  };

  return (
    <div className="ika-years-card">
      <div className="ika-years-header">
        <h3 className="ika-years-title">Ανά έτος στοιχεία</h3>
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

      <div className="ika-years-grid">
        {years.map((year) => (
          <div key={year} className="ika-year-card">
            <span className="ika-year-label">{year}</span>

            <div className="ika-year-fields">
              <input
                type="text"
                inputMode="decimal"
                className="ika-year-input"
                placeholder="Ποσό €"
                value={yearsData[year]?.amount || ''}
                onChange={(e) => setYearField(year, 'amount', sanitizeAmount(e.target.value))}
              />
              <input
                type="text"
                inputMode="numeric"
                className="ika-year-input"
                placeholder="Ημέρες"
                value={yearsData[year]?.days || ''}
                onChange={(e) => setYearField(year, 'days', sanitizeDays(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="step-navigation">
        <button
          type="button"
          onClick={() => navigate('/calculator/misthotoi', {
            state: {
              generalInfoData,
              specialConditionsData: yearsData
            }
          })}
          className="step-button step-button-back"
        >
          ← Πίσω
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
  );
};

export default DeiSpecialConditions;