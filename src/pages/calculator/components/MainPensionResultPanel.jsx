import React from 'react';

function MainPensionResultPanel({ calculationResponse }) {
  const nationalPension = calculationResponse?.nationalPension || {};
  const contributoryPension = calculationResponse?.contributoryPension || {};
  const totals = calculationResponse?.totals || {};

  const nationalAmount = toNumberOrNull(nationalPension.amount);
  const contributoryAmount = toNumberOrNull(contributoryPension.amount);
  const grossMainPension = toNumberOrNull(totals.grossMainPension);
  const pensionableMonthlyEarnings = toNumberOrNull(
    contributoryPension.pensionableMonthlyEarnings
  );
  const replacementRatePercentage = toNumberOrNull(
    contributoryPension.replacementRatePercentage
  );

  return (
    <section
      style={{
        marginTop: '1rem',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '1rem',
        background: '#f0fdf4',
      }}
    >
      <h2>Αποτέλεσμα κύριας σύνταξης</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <ResultCard
          title="Εθνική σύνταξη"
          value={formatMoney(nationalAmount)}
        />
        <ResultCard
          title="Ανταποδοτική σύνταξη"
          value={formatMoney(contributoryAmount)}
        />
        <ResultCard
          title="Σύνολο κύριας σύνταξης"
          value={formatMoney(grossMainPension)}
        />
      </div>

      <div style={{ color: '#166534', marginBottom: '1rem' }}>
        {pensionableMonthlyEarnings !== null && (
          <p>
            Μέσος μηνιαίος συντάξιμος μισθός:{' '}
            <strong>{formatMoney(pensionableMonthlyEarnings)}</strong>
          </p>
        )}

        {replacementRatePercentage !== null && (
          <p>
            Ποσοστό αναπλήρωσης:{' '}
            <strong>{formatPercentage(replacementRatePercentage)}</strong>
          </p>
        )}
      </div>

      {Array.isArray(calculationResponse?.warnings) &&
        calculationResponse.warnings.length > 0 && (
          <div
            style={{
              border: '1px solid #fde68a',
              background: '#fffbeb',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
            }}
          >
            <h3>Προειδοποιήσεις</h3>
            <ul>
              {calculationResponse.warnings.map((warning, index) => (
                <li key={`${warning}_${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

      <details>
        <summary>Πλήρης απάντηση calculator</summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(calculationResponse, null, 2)}
        </pre>
      </details>
    </section>
  );
}

function ResultCard({ title, value }) {
  return (
    <div
      style={{
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '0.75rem',
        background: '#ffffff',
      }}
    >
      <div style={{ color: '#166534', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function toNumberOrNull(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function formatMoney(value) {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value) {
  if (value === null) {
    return '—';
  }

  return `${value.toLocaleString('el-GR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export default MainPensionResultPanel;
