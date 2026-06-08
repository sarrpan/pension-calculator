import React, { useMemo, useState } from 'react';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';

const NATIONAL_PENSION_BASE_AMOUNTS = {
  2025: {
    amount: 436.4,
    status: 'official',
  },
  2026: {
    amount: 446.87,
    status: 'official',
  },
};

function PensionCalculatorPage() {
  const [pensionStartDateInput, setPensionStartDateInput] = useState('');
  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);

  const analysis = useMemo(() => {
    return analyzePensionStartDate(pensionStartDateInput);
  }, [pensionStartDateInput]);

  async function handlePrepareCalculationInput() {
    setBackendResponse(null);
    setBackendError('');

    if (!analysis.hasValue || analysis.error) {
      setBackendError('Διορθώστε πρώτα την ημερομηνία έναρξης σύνταξης.');
      return;
    }

    setIsSendingToBackend(true);

    try {
      const response = await fetch(PREPARE_PENSION_INPUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis.calculationInput),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Αποτυχία προετοιμασίας δεδομένων.');
      }

      setBackendResponse(data);
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSendingToBackend(false);
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Υπολογισμός σύνταξης</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handlePrepareCalculationInput();
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="pensionStartDate">
            Ημερομηνία έναρξης σύνταξης
          </label>

          <br />

          <input
            id="pensionStartDate"
            type="text"
            value={pensionStartDateInput}
            onChange={(event) => {
              setPensionStartDateInput(event.target.value);
              setBackendResponse(null);
              setBackendError('');
            }}
            placeholder="π.χ. 1/1/26 ή 01/01/2026"
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              width: '220px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!analysis.hasValue || Boolean(analysis.error) || isSendingToBackend}
          style={{
            padding: '0.6rem 1rem',
            cursor:
              !analysis.hasValue || analysis.error || isSendingToBackend
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isSendingToBackend
            ? 'Αποστολή...'
            : 'Προετοιμασία δεδομένων'}
        </button>
      </form>

      {analysis.error && (
        <p style={{ color: 'crimson' }}>
          {analysis.error}
        </p>
      )}

      {!analysis.error && analysis.hasValue && (
        <>
          <section
            style={{
              marginTop: '2rem',
              padding: '1rem',
              border: '1px solid #ddd',
            }}
          >
            <h2>Τι κατάλαβε η εφαρμογή</h2>

            <p>
              <strong>Ημερομηνία που δόθηκε:</strong>{' '}
              {analysis.displayDate}
            </p>

            <p>
              <strong>Έτος σύνταξης:</strong>{' '}
              {analysis.pensionYear}
            </p>

            <p>
              <strong>Ποσό Εθνικής που θα χρησιμοποιηθεί:</strong>{' '}
              {formatEuro(analysis.nationalPensionBaseAmount)}
            </p>

            {analysis.temporaryMessage && (
              <p style={{ color: '#8a5a00' }}>
                {analysis.temporaryMessage}
              </p>
            )}
          </section>

          <section
            style={{
              marginTop: '1rem',
              padding: '1rem',
              border: '1px solid #ddd',
              background: '#fafafa',
            }}
          >
            <h2>Δεδομένα που ετοιμάζονται για τον υπολογισμό</h2>

            <p>
              <strong>Ημερομηνία σύνταξης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.pensionDate}
            </p>

            <p>
              <strong>Έτος σύνταξης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.pensionYear}
            </p>

            <p>
              <strong>Ποσό βάσης Εθνικής:</strong>{' '}
              {formatEuro(
                analysis.calculationInput.nationalPensionPreview.baseAmount
              )}
            </p>

            <p>
              <strong>Έτος ποσού Εθνικής:</strong>{' '}
              {analysis.calculationInput.nationalPensionPreview.baseAmountSourceYear}
            </p>

            <p>
              <strong>Κατάσταση ποσού:</strong>{' '}
              {analysis.calculationInput.nationalPensionPreview.baseAmountStatus ===
              'temporary'
                ? 'Προσωρινό'
                : 'Επίσημο'}
            </p>
          </section>
        </>
      )}

      {backendError && (
        <section
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid crimson',
            background: '#fff5f5',
          }}
        >
          <h2>Απάντηση από functions</h2>
          <p style={{ color: 'crimson' }}>{backendError}</p>
        </section>
      )}

      {backendResponse && (
        <section
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #ddd',
            background: '#f8fff8',
          }}
        >
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

          <p>
            <strong>Ημερομηνία σύνταξης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.pensionDate}
          </p>

          <p>
            <strong>Έτος σύνταξης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.pensionYear}
          </p>

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
      )}
    </main>
  );
}

function analyzePensionStartDate(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const parsedInput = parseGreekDateInput(trimmedValue);

  if (!parsedInput.isValidFormat) {
    return {
      hasValue: true,
      error:
        'Συμπληρώστε έγκυρη ημερομηνία, π.χ. 1/1/26, 1/1/2026 ή 01012026.',
    };
  }

  const { day, month, year } = parsedInput;

  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  if (!isRealDate) {
    return {
      hasValue: true,
      error: 'Η ημερομηνία που δόθηκε δεν είναι πραγματική.',
    };
  }

  const currentYear = new Date().getFullYear();
  const earliestAllowedYear = currentYear - 1;

  if (year < earliestAllowedYear) {
    return {
      hasValue: true,
      error: `Η εφαρμογή υποστηρίζει ημερομηνίες από το ${earliestAllowedYear} και μετά.`,
    };
  }

  const baseAmountInfo = resolveNationalPensionBaseAmount(year);
  const displayDate = formatGreekDate(day, month, year);
  const pensionDate = formatIsoDate(day, month, year);

  return {
    hasValue: true,
    error: null,

    displayDate,
    pensionDate,
    pensionYear: year,

    nationalPensionBaseAmount: baseAmountInfo.amount,
    baseAmountSourceYear: baseAmountInfo.sourceYear,
    baseAmountStatus: baseAmountInfo.status,

    temporaryMessage:
      baseAmountInfo.status === 'temporary'
        ? `Δεν υπάρχει ακόμα επίσημο ποσό Εθνικής σύνταξης για το ${year}. Χρησιμοποιήθηκε προσωρινά το ποσό του ${baseAmountInfo.sourceYear}.`
        : null,

    calculationInput: {
      generalInfoData: {
        pensionDate,
        pensionYear: year,
      },

      nationalPensionPreview: {
        baseAmount: baseAmountInfo.amount,
        baseAmountSourceYear: baseAmountInfo.sourceYear,
        baseAmountStatus: baseAmountInfo.status,
        isBaseAmountTemporary: baseAmountInfo.status === 'temporary',
      },
    },
  };
}

function parseGreekDateInput(value) {
  const normalizedValue = String(value || '').trim();

  const separatedDateMatch = normalizedValue.match(
    /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/
  );

  if (separatedDateMatch) {
    return {
      isValidFormat: true,
      day: Number(separatedDateMatch[1]),
      month: Number(separatedDateMatch[2]),
      year: normalizeYear(separatedDateMatch[3]),
    };
  }

  const digitsOnly = normalizedValue.replace(/\D/g, '');

  if (digitsOnly.length === 8) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: Number(digitsOnly.slice(4, 8)),
    };
  }

  if (digitsOnly.length === 6) {
    return {
      isValidFormat: true,
      day: Number(digitsOnly.slice(0, 2)),
      month: Number(digitsOnly.slice(2, 4)),
      year: normalizeYear(digitsOnly.slice(4, 6)),
    };
  }

  return {
    isValidFormat: false,
  };
}

function normalizeYear(value) {
  const yearText = String(value || '').trim();

  if (yearText.length === 4) {
    return Number(yearText);
  }

  const twoDigitYear = Number(yearText);

  if (twoDigitYear >= 0 && twoDigitYear <= 69) {
    return 2000 + twoDigitYear;
  }

  return 1900 + twoDigitYear;
}

function formatGreekDate(day, month, year) {
  return `${padTwoDigits(day)}/${padTwoDigits(month)}/${year}`;
}

function formatIsoDate(day, month, year) {
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(day)}`;
}

function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function resolveNationalPensionBaseAmount(pensionYear) {
  if (NATIONAL_PENSION_BASE_AMOUNTS[pensionYear]) {
    return {
      amount: NATIONAL_PENSION_BASE_AMOUNTS[pensionYear].amount,
      sourceYear: pensionYear,
      status: 'official',
    };
  }

  const knownYears = Object.keys(NATIONAL_PENSION_BASE_AMOUNTS)
    .map(Number)
    .sort((a, b) => a - b);

  const latestKnownYear = knownYears[knownYears.length - 1];

  if (pensionYear > latestKnownYear) {
    return {
      amount: NATIONAL_PENSION_BASE_AMOUNTS[latestKnownYear].amount,
      sourceYear: latestKnownYear,
      status: 'temporary',
    };
  }

  return {
    amount: null,
    sourceYear: null,
    status: 'missing',
  };
}

function formatEuro(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default PensionCalculatorPage;