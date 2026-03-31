import React, { useState } from 'react';
import ResultsPanel from "../../../components/calculator/step/ResultsPanel";
import "../CalculatorPage.css";

const CalculatorPage = () => {
  const [results, setResults] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");

  const formatMoney = (value) => 
    Number(value || 0).toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCalculate = () => {
    console.log("Trigger calculation logic...");
  };

  return (
    <main className="calculator-page">
      <div className="container">
        <ResultsPanel 
          results={results}
          mainPension={0}
          formatMoney={formatMoney}
          handleCalculate={handleCalculate}
          validationMessage={validationMessage}
        />
      </div>
    </main>
  );
};

export default CalculatorPage;