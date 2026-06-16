import React from 'react';

function MainPensionResultPanel({ calculationResponse }) {
  const nationalPension = calculationResponse?.nationalPension || {};
  const contributoryPension = calculationResponse?.contributoryPension || {};
  const article30Increase = calculationResponse?.article30Increase || {};
  const totals = calculationResponse?.totals || {};

  const nationalAmount = toNumberOrNull(nationalPension.amount);
  const contributoryAmount = toNumberOrNull(contributoryPension.amount);
  const article30Amount = toNumberOrNull(article30Increase.amount);
  const article30MainContributionAmount = toNumberOrNull(
    article30Increase.mainContributionAmount
  );
  const article30PremiumContributionAmount = toNumberOrNull(
    article30Increase.premiumContributionAmount
  );
  const grossMainPension = toNumberOrNull(totals.grossMainPension);

  const pensionableMonthlyEarnings = toNumberOrNull(
    contributoryPension.pensionableMonthlyEarnings
  );

  const baseReplacementRatePercentage = firstNumberOrNull(
    article30Increase.baseReplacementRatePercentage,
    contributoryPension.replacementRatePercentage
  );

  const mainContributionReplacementRatePercentage = toNumberOrNull(
    article30Increase.mainContributionReplacementRatePercentage
  );
  const premiumContributionReplacementRatePercentage = toNumberOrNull(
    article30Increase.premiumContributionReplacementRatePercentage
  );

  const additionalReplacementRatePercentage = firstNumberOrNull(
    article30Increase.additionalReplacementRatePercentage,
    sumNumbersOrNull(
      article30Increase.mainContributionReplacementRatePercentage,
      article30Increase.premiumContributionReplacementRatePercentage
    )
  );

  const combinedReplacementRatePercentage = firstNumberOrNull(
    article30Increase.combinedReplacementRatePercentage,
    sumNumbersOrNull(
      baseReplacementRatePercentage,
      additionalReplacementRatePercentage
    )
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
          title="Βασική ανταποδοτική σύνταξη"
          value={formatMoney(contributoryAmount)}
        />
        <ResultCard
          title="Προσαύξηση άρθρου 30"
          value={formatMoney(article30Amount)}
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

        {article30MainContributionAmount !== null &&
          article30MainContributionAmount > 0 && (
            <p>
              Προσαύξηση βασικών αυξημένων εισφορών:{' '}
              <strong>{formatMoney(article30MainContributionAmount)}</strong>
              {mainContributionReplacementRatePercentage !== null && (
                <>
                  {' '}({formatPercentage(
                    mainContributionReplacementRatePercentage
                  )})
                </>
              )}
            </p>
          )}

        {shouldShowPremiumDetails(article30Increase) && (
          <p>
            Προσαύξηση επασφαλίστρου / ειδικής εισφοράς:{' '}
            <strong>{formatMoney(article30PremiumContributionAmount)}</strong>
            {premiumContributionReplacementRatePercentage !== null && (
              <>
                {' '}({formatPercentage(
                  premiumContributionReplacementRatePercentage
                )})
              </>
            )}
          </p>
        )}

        {baseReplacementRatePercentage !== null && (
          <p>
            Βασικό ποσοστό αναπλήρωσης:{' '}
            <strong>{formatPercentage(baseReplacementRatePercentage)}</strong>
          </p>
        )}

        {additionalReplacementRatePercentage !== null && (
          <p>
            Πρόσθετο ποσοστό αναπλήρωσης άρθρου 30:{' '}
            <strong>
              {formatPercentage(additionalReplacementRatePercentage)}
            </strong>
          </p>
        )}

        {combinedReplacementRatePercentage !== null && (
          <p>
            Συνολικό ποσοστό αναπλήρωσης:{' '}
            <strong>
              {formatPercentage(combinedReplacementRatePercentage)}
            </strong>
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

function shouldShowPremiumDetails(article30Increase = {}) {
  const amount = toNumberOrNull(article30Increase.premiumContributionAmount);
  const status = String(article30Increase.premiumEligibilityStatus || '').trim();

  return (
    (amount !== null && amount > 0) ||
    ['yes', 'no', 'unknown', 'mixed'].includes(status)
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

function firstNumberOrNull(...values) {
  for (const value of values) {
    const numberValue = toNumberOrNull(value);

    if (numberValue !== null) {
      return numberValue;
    }
  }

  return null;
}

function sumNumbersOrNull(...values) {
  const numberValues = values
    .map((value) => toNumberOrNull(value))
    .filter((value) => value !== null);

  if (numberValues.length === 0) {
    return null;
  }

  return numberValues.reduce((sum, value) => sum + value, 0);
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
