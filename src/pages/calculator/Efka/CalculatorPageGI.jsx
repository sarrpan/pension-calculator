import React, { useState } from 'react';
import GeneralInfo from "../../../components/calculator/step/GeneralInfo"; // Σωστό path βάσει εικόνας
import "../CalculatorPage.css";

const CalculatorPage = () => {
  // Ορισμός των states που χρειάζεται το GeneralInfo
  const [birthDate, setBirthDate] = useState("");
  const [pensionDate, setPensionDate] = useState("");
  const [totalInsuranceYears, setTotalInsuranceYears] = useState("");
  const [totalInsuranceMonths, setTotalInsuranceMonths] = useState("");
  const [residenceYears, setResidenceYears] = useState("");
  const [heavyRetirement, setHeavyRetirement] = useState("no");
  const [heavyMode, setHeavyMode] = useState("none");
  const [insuredType, setInsuredType] = useState("new");

  const maxPensionDate = "2026-12-31"; // Παράδειγμα ημερομηνίας

  return (
    <main className="calculator-page">
      <div className="container">
        <GeneralInfo 
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          pensionDate={pensionDate}
          setPensionDate={setPensionDate}
          totalInsuranceYears={totalInsuranceYears}
          setTotalInsuranceYears={setTotalInsuranceYears}
          totalInsuranceMonths={totalInsuranceMonths}
          setTotalInsuranceMonths={setTotalInsuranceMonths}
          residenceYears={residenceYears}
          setResidenceYears={setResidenceYears}
          heavyRetirement={heavyRetirement}
          setHeavyRetirement={setHeavyRetirement}
          heavyMode={heavyMode}
          setHeavyMode={setHeavyMode}
          insuredType={insuredType}
          setInsuredType={setInsuredType}
          maxPensionDate={maxPensionDate}
        />
      </div>
    </main>
  );
};

export default CalculatorPage;