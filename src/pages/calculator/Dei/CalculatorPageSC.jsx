import React, { useState, useMemo } from 'react';
import SpecialConditions from "../../../components/calculator/stepdei/SpecialConditions";
import "../CalculatorPage.css";

const CalculatorPageSC = () => {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2002 + 1 }, (_, i) => 2002 + i);
  }, []);

  const [yearsData, setYearsData] = useState(() => {
    const obj = {};
    years.forEach(y => obj[y] = { amount: "", days: "" });
    return obj;
  });

  const setYearField = (year, field, value) => {
    setYearsData(prev => ({ ...prev, [year]: { ...prev[year], [field]: value } }));
  };

  return (
    <main className="calculator-page">
      <div className="container">
        <SpecialConditions 
          years={years} 
          yearsData={yearsData} 
          setYearField={setYearField} 
        />
      </div>
    </main>
  );
};

export default CalculatorPageSC;