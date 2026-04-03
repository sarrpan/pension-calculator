import React from 'react';
import ResultsPanel from "../../../components/calculator/stepdei/ResultsPanel";
import "../CalculatorPage.css";

const CalculatorPageRP = () => {
  return (
    <main className="calculator-page">
      <div className="container">
        <ResultsPanel />
      </div>
    </main>
  );
};

export default CalculatorPageRP;