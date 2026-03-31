import React, { useState } from 'react';
import DeiGeneralInfo from "../../../components/calculator/stepdei/DeiGeneralInfo";
import "../CalculatorPage.css";

const CalculatorDeiPageGI = () => {
  const [birthDate, setBirthDate] = useState("");
  const [pensionDate, setPensionDate] = useState("");
  const [totalInsuranceYears, setTotalInsuranceYears] = useState("");
  const [totalInsuranceMonths, setTotalInsuranceMonths] = useState("");
  const [residenceYears, setResidenceYears] = useState("");
  const [insuredType, setInsuredType] = useState("new");
  const [heavyMode, setHeavyMode] = useState("all");
  const [heavyUntil2014Years, setHeavyUntil2014Years] = useState("");
  const [heavyUntil2014Months, setHeavyUntil2014Months] = useState("");
  const [heavyFrom2015Years, setHeavyFrom2015Years] = useState("");
  const [heavyFrom2015Months, setHeavyFrom2015Months] = useState("");

  return (
    <main className="calculator-page">
      <div className="container">
        <DeiGeneralInfo 
          birthDate={birthDate} setBirthDate={setBirthDate}
          pensionDate={pensionDate} setPensionDate={setPensionDate}
          totalInsuranceYears={totalInsuranceYears} setTotalInsuranceYears={setTotalInsuranceYears}
          totalInsuranceMonths={totalInsuranceMonths} setTotalInsuranceMonths={setTotalInsuranceMonths}
          residenceYears={residenceYears} setResidenceYears={setResidenceYears}
          insuredType={insuredType} setInsuredType={setInsuredType}
          heavyMode={heavyMode} setHeavyMode={setHeavyMode}
          heavyUntil2014Years={heavyUntil2014Years} setHeavyUntil2014Years={setHeavyUntil2014Years}
          heavyUntil2014Months={heavyUntil2014Months} setHeavyUntil2014Months={setHeavyUntil2014Months}
          heavyFrom2015Years={heavyFrom2015Years} setHeavyFrom2015Years={setHeavyFrom2015Years}
          heavyFrom2015Months={heavyFrom2015Months} setHeavyFrom2015Months={setHeavyFrom2015Months}
          maxPensionDate="2026-12-31"
        />
      </div>
    </main>
  );
};

export default CalculatorDeiPageGI;