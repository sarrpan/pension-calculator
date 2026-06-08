import React from 'react';

import {
  preStyle,
  successSectionStyle,
} from '../utils/calculatorStyles';

function BackendResponsePanel({ backendResponse }) {
  return (
    <section style={successSectionStyle}>
      <h2>Απάντηση από functions</h2>

      <p>
        <strong>Κατάσταση:</strong>{' '}
        {backendResponse.status}
      </p>

      <p>
        <strong>Μήνυμα:</strong>{' '}
        {backendResponse.message}
      </p>

      <h3>Το backend ετοίμασε</h3>

      <pre style={preStyle}>
        {JSON.stringify(backendResponse.preparedInput, null, 2)}
      </pre>

      {Array.isArray(backendResponse.warnings) &&
        backendResponse.warnings.length > 0 && (
          <>
            <h3>Προειδοποιήσεις</h3>

            <ul>
              {backendResponse.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </>
        )}

      {Array.isArray(backendResponse.missingForCalculation) &&
        backendResponse.missingForCalculation.length > 0 && (
          <>
            <h3>Λείπουν ακόμα για κανονικό υπολογισμό</h3>

            <ul>
              {backendResponse.missingForCalculation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
    </section>
  );
}


export default BackendResponsePanel;
