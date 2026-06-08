import React, { useMemo, useState } from 'react';

const PREPARE_PENSION_INPUT_URL = 'http://127.0.0.1:5001/pension-calculator-f8e60/us-central1/preparePensionCalculationInput';

const INSURANCE_DAYS_PER_YEAR = 300;
const INSURANCE_DAYS_PER_MONTH = 25;

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

const PENSION_TYPE_OPTIONS = {
  old_age: {
    value: 'old_age',
    label: 'Γήρατος',
  },
  disability: {
    value: 'disability',
    label: 'Αναπηρίας',
  },
};

const PENSION_MODE_OPTIONS = {
  full: {
    value: 'full',
    label: 'Πλήρης',
  },
  reduced: {
    value: 'reduced',
    label: 'Μειωμένη',
  },
};

const INSURANCE_TIME_INPUT_METHOD_OPTIONS = {
  insurance_days: {
    value: 'insurance_days',
    label: 'Με αριθμό ενσήμων / ημερών ασφάλισης',
  },
  years_months_days: {
    value: 'years_months_days',
    label: 'Με έτη, μήνες και ημέρες',
  },
};

function PensionCalculatorPage() {
  const [pensionStartDateInput, setPensionStartDateInput] = useState('');
  const [pensionTypeInput, setPensionTypeInput] = useState('');
  const [pensionModeInput, setPensionModeInput] = useState('');

  const [insuranceTimeInputMethod, setInsuranceTimeInputMethod] = useState('');
  const [insuranceDaysInput, setInsuranceDaysInput] = useState('');
  const [insuranceYearsInput, setInsuranceYearsInput] = useState('');
  const [insuranceMonthsInput, setInsuranceMonthsInput] = useState('');
  const [insuranceExtraDaysInput, setInsuranceExtraDaysInput] = useState('');

  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);

  const analysis = useMemo(() => {
    return analyzePensionForm({
      pensionStartDateInput,
      pensionTypeInput,
      pensionModeInput,
      insuranceTimeInputMethod,
      insuranceDaysInput,
      insuranceYearsInput,
      insuranceMonthsInput,
      insuranceExtraDaysInput,
    });
  }, [
    pensionStartDateInput,
    pensionTypeInput,
    pensionModeInput,
    insuranceTimeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
  ]);

  function clearBackendResult() {
    setBackendResponse(null);
    setBackendError('');
  }

  async function handlePrepareCalculationInput() {
    setBackendResponse(null);
    setBackendError('');

    if (!analysis.isReady || analysis.error) {
      setBackendError(
        'Συμπληρώστε σωστά την ημερομηνία έναρξης, το είδος σύνταξης, αν είναι πλήρης ή μειωμένη και τον χρόνο ασφάλισης.'
      );
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
              clearBackendResult();
            }}
            placeholder="π.χ. 1/1/26 ή 01/01/2026"
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              width: '220px',
            }}
          />
        </div>

        <fieldset
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #ddd',
          }}
        >
          <legend>Είδος σύνταξης</legend>

          <label
            htmlFor="pensionTypeOldAge"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="pensionTypeOldAge"
              type="radio"
              name="pensionType"
              value="old_age"
              checked={pensionTypeInput === 'old_age'}
              onChange={(event) => {
                setPensionTypeInput(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Γήρατος
          </label>

          <label
            htmlFor="pensionTypeDisability"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="pensionTypeDisability"
              type="radio"
              name="pensionType"
              value="disability"
              checked={pensionTypeInput === 'disability'}
              onChange={(event) => {
                setPensionTypeInput(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Αναπηρίας
          </label>
        </fieldset>

        <fieldset
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #ddd',
          }}
        >
          <legend>Πλήρης ή μειωμένη σύνταξη</legend>

          <label
            htmlFor="pensionModeFull"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="pensionModeFull"
              type="radio"
              name="pensionMode"
              value="full"
              checked={pensionModeInput === 'full'}
              onChange={(event) => {
                setPensionModeInput(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Πλήρης
          </label>

          <label
            htmlFor="pensionModeReduced"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="pensionModeReduced"
              type="radio"
              name="pensionMode"
              value="reduced"
              checked={pensionModeInput === 'reduced'}
              onChange={(event) => {
                setPensionModeInput(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Μειωμένη
          </label>
        </fieldset>

        <fieldset
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #ddd',
          }}
        >
          <legend>Χρόνος ασφάλισης</legend>

          <p style={{ marginTop: 0 }}>
            Πώς θέλετε να δηλώσετε τον χρόνο ασφάλισης;
          </p>

          <label
            htmlFor="insuranceTimeMethodDays"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="insuranceTimeMethodDays"
              type="radio"
              name="insuranceTimeInputMethod"
              value="insurance_days"
              checked={insuranceTimeInputMethod === 'insurance_days'}
              onChange={(event) => {
                setInsuranceTimeInputMethod(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Με αριθμό ενσήμων / ημερών ασφάλισης
          </label>

          <label
            htmlFor="insuranceTimeMethodYearsMonthsDays"
            style={{
              display: 'block',
              marginTop: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="insuranceTimeMethodYearsMonthsDays"
              type="radio"
              name="insuranceTimeInputMethod"
              value="years_months_days"
              checked={insuranceTimeInputMethod === 'years_months_days'}
              onChange={(event) => {
                setInsuranceTimeInputMethod(event.target.value);
                clearBackendResult();
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Με έτη, μήνες και ημέρες
          </label>

          {insuranceTimeInputMethod === 'insurance_days' && (
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="insuranceDays">
                Αριθμός ενσήμων / ημερών ασφάλισης
              </label>

              <br />

              <input
                id="insuranceDays"
                type="text"
                value={insuranceDaysInput}
                onChange={(event) => {
                  setInsuranceDaysInput(event.target.value);
                  clearBackendResult();
                }}
                placeholder="π.χ. 10225"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  width: '160px',
                }}
              />
            </div>
          )}

          {insuranceTimeInputMethod === 'years_months_days' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="insuranceYears">Έτη</label>

                <br />

                <input
                  id="insuranceYears"
                  type="text"
                  value={insuranceYearsInput}
                  onChange={(event) => {
                    setInsuranceYearsInput(event.target.value);
                    clearBackendResult();
                  }}
                  placeholder="π.χ. 35"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    width: '100px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="insuranceMonths">Μήνες</label>

                <br />

                <input
                  id="insuranceMonths"
                  type="text"
                  value={insuranceMonthsInput}
                  onChange={(event) => {
                    setInsuranceMonthsInput(event.target.value);
                    clearBackendResult();
                  }}
                  placeholder="0-11"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    width: '100px',
                  }}
                />
              </div>

              <div>
                <label htmlFor="insuranceExtraDays">Ημέρες</label>

                <br />

                <input
                  id="insuranceExtraDays"
                  type="text"
                  value={insuranceExtraDaysInput}
                  onChange={(event) => {
                    setInsuranceExtraDaysInput(event.target.value);
                    clearBackendResult();
                  }}
                  placeholder="0-24"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    width: '100px',
                  }}
                />
              </div>
            </div>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={!analysis.isReady || Boolean(analysis.error) || isSendingToBackend}
          style={{
            padding: '0.6rem 1rem',
            cursor:
              !analysis.isReady || analysis.error || isSendingToBackend
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

      {!analysis.error && analysis.isReady && (
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
              <strong>Είδος σύνταξης:</strong>{' '}
              {analysis.pensionTypeLabel}
            </p>

            <p>
              <strong>Πλήρης ή μειωμένη:</strong>{' '}
              {analysis.pensionModeLabel}
            </p>

            <p>
              <strong>Τρόπος εισαγωγής χρόνου ασφάλισης:</strong>{' '}
              {analysis.insuranceTimeInputMethodLabel}
            </p>

            <p>
              <strong>Χρόνος ασφάλισης:</strong>{' '}
              {analysis.insuranceTimeDisplay}
            </p>

            <p>
              <strong>Σύνολο ημερών ασφάλισης:</strong>{' '}
              {analysis.totalInsuranceDaysEquivalent}
            </p>

            <p>
              <strong>Σύνολο σε δεκαδικά έτη:</strong>{' '}
              {analysis.totalInsuranceDecimalYears}
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
              <strong>Είδος σύνταξης:</strong>{' '}
              {analysis.pensionTypeLabel}
            </p>

            <p>
              <strong>Internal value είδους:</strong>{' '}
              {analysis.calculationInput.generalInfoData.pensionType}
            </p>

            <p>
              <strong>Πλήρης ή μειωμένη:</strong>{' '}
              {analysis.pensionModeLabel}
            </p>

            <p>
              <strong>Internal value πλήρους/μειωμένης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.pensionMode}
            </p>

            <p>
              <strong>Internal τρόπος χρόνου ασφάλισης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.insuranceTimeInputMethod}
            </p>

            <p>
              <strong>Έτη ασφάλισης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.totalInsuranceYears}
            </p>

            <p>
              <strong>Μήνες ασφάλισης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.totalInsuranceMonths}
            </p>

            <p>
              <strong>Ημέρες ασφάλισης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.totalInsuranceDays}
            </p>

            <p>
              <strong>Σύνολο ημερών ασφάλισης:</strong>{' '}
              {analysis.calculationInput.generalInfoData.totalInsuranceDaysEquivalent}
            </p>

            <p>
              <strong>Σύνολο δεκαδικών ετών:</strong>{' '}
              {analysis.calculationInput.generalInfoData.totalInsuranceDecimalYears}
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

          <p>
            <strong>Είδος σύνταξης:</strong>{' '}
            {getPensionTypeLabel(
              backendResponse.preparedInput?.generalInfoData?.pensionType
            )}
          </p>

          <p>
            <strong>Internal value είδους:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.pensionType}
          </p>

          <p>
            <strong>Πλήρης ή μειωμένη:</strong>{' '}
            {getPensionModeLabel(
              backendResponse.preparedInput?.generalInfoData?.pensionMode
            )}
          </p>

          <p>
            <strong>Internal value πλήρους/μειωμένης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.pensionMode}
          </p>

          <p>
            <strong>Τρόπος εισαγωγής χρόνου ασφάλισης:</strong>{' '}
            {getInsuranceTimeInputMethodLabel(
              backendResponse.preparedInput?.generalInfoData?.insuranceTimeInputMethod
            )}
          </p>

          <p>
            <strong>Έτη ασφάλισης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.totalInsuranceYears}
          </p>

          <p>
            <strong>Μήνες ασφάλισης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.totalInsuranceMonths}
          </p>

          <p>
            <strong>Ημέρες ασφάλισης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.totalInsuranceDays}
          </p>

          <p>
            <strong>Σύνολο ημερών ασφάλισης:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.totalInsuranceDaysEquivalent}
          </p>

          <p>
            <strong>Σύνολο δεκαδικών ετών:</strong>{' '}
            {backendResponse.preparedInput?.generalInfoData?.totalInsuranceDecimalYears}
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

function analyzePensionForm({
  pensionStartDateInput,
  pensionTypeInput,
  pensionModeInput,
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
}) {
  const dateAnalysis = analyzePensionStartDate(pensionStartDateInput);
  const pensionTypeAnalysis = analyzePensionType(pensionTypeInput);
  const pensionModeAnalysis = analyzePensionMode(pensionModeInput);
  const insuranceTimeAnalysis = analyzeInsuranceTime({
    insuranceTimeInputMethod,
    insuranceDaysInput,
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
  });

  const hasAnyValue =
    dateAnalysis.hasValue ||
    pensionTypeAnalysis.hasValue ||
    pensionModeAnalysis.hasValue ||
    insuranceTimeAnalysis.hasValue;

  if (dateAnalysis.error) {
    return {
      hasValue: hasAnyValue,
      isReady: false,
      error: dateAnalysis.error,
    };
  }

  if (pensionTypeAnalysis.error) {
    return {
      hasValue: hasAnyValue,
      isReady: false,
      error: pensionTypeAnalysis.error,
    };
  }

  if (pensionModeAnalysis.error) {
    return {
      hasValue: hasAnyValue,
      isReady: false,
      error: pensionModeAnalysis.error,
    };
  }

  if (insuranceTimeAnalysis.error) {
    return {
      hasValue: hasAnyValue,
      isReady: false,
      error: insuranceTimeAnalysis.error,
    };
  }

  const isReady =
    dateAnalysis.hasValue &&
    pensionTypeAnalysis.hasValue &&
    pensionModeAnalysis.hasValue &&
    insuranceTimeAnalysis.hasValue &&
    !dateAnalysis.error &&
    !pensionTypeAnalysis.error &&
    !pensionModeAnalysis.error &&
    !insuranceTimeAnalysis.error;

  if (!isReady) {
    return {
      hasValue: hasAnyValue,
      isReady: false,
      error: null,
    };
  }

  return {
    ...dateAnalysis,

    hasValue: true,
    isReady: true,
    error: null,

    pensionType: pensionTypeAnalysis.pensionType,
    pensionTypeLabel: pensionTypeAnalysis.pensionTypeLabel,

    pensionMode: pensionModeAnalysis.pensionMode,
    pensionModeLabel: pensionModeAnalysis.pensionModeLabel,

    insuranceTimeInputMethod: insuranceTimeAnalysis.insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      insuranceTimeAnalysis.insuranceTimeInputMethodLabel,
    insuranceTimeDisplay: insuranceTimeAnalysis.insuranceTimeDisplay,
    totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
    totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
    totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
    totalInsuranceDaysEquivalent:
      insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
    totalInsuranceDecimalYears:
      insuranceTimeAnalysis.totalInsuranceDecimalYears,

    calculationInput: {
      generalInfoData: {
        pensionDate: dateAnalysis.pensionDate,
        pensionYear: dateAnalysis.pensionYear,
        pensionType: pensionTypeAnalysis.pensionType,
        pensionMode: pensionModeAnalysis.pensionMode,

        insuranceTimeInputMethod:
          insuranceTimeAnalysis.insuranceTimeInputMethod,
        totalInsuranceYears: insuranceTimeAnalysis.totalInsuranceYears,
        totalInsuranceMonths: insuranceTimeAnalysis.totalInsuranceMonths,
        totalInsuranceDays: insuranceTimeAnalysis.totalInsuranceDays,
        totalInsuranceDaysEquivalent:
          insuranceTimeAnalysis.totalInsuranceDaysEquivalent,
        totalInsuranceDecimalYears:
          insuranceTimeAnalysis.totalInsuranceDecimalYears,
      },

      nationalPensionPreview: {
        baseAmount: dateAnalysis.nationalPensionBaseAmount,
        baseAmountSourceYear: dateAnalysis.baseAmountSourceYear,
        baseAmountStatus: dateAnalysis.baseAmountStatus,
        isBaseAmountTemporary: dateAnalysis.baseAmountStatus === 'temporary',
      },
    },
  };
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
  };
}

function analyzePensionType(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  if (!PENSION_TYPE_OPTIONS[normalizedValue]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο είδος σύνταξης.',
    };
  }

  return {
    hasValue: true,
    error: null,
    pensionType: normalizedValue,
    pensionTypeLabel: PENSION_TYPE_OPTIONS[normalizedValue].label,
  };
}

function analyzePensionMode(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  if (!PENSION_MODE_OPTIONS[normalizedValue]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε αν η σύνταξη είναι πλήρης ή μειωμένη.',
    };
  }

  return {
    hasValue: true,
    error: null,
    pensionMode: normalizedValue,
    pensionModeLabel: PENSION_MODE_OPTIONS[normalizedValue].label,
  };
}

function analyzeInsuranceTime({
  insuranceTimeInputMethod,
  insuranceDaysInput,
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
}) {
  const normalizedMethod = String(insuranceTimeInputMethod || '').trim();

  if (!normalizedMethod) {
    return {
      hasValue: false,
      error: null,
    };
  }

  if (!INSURANCE_TIME_INPUT_METHOD_OPTIONS[normalizedMethod]) {
    return {
      hasValue: true,
      error: 'Επιλέξτε έγκυρο τρόπο εισαγωγής χρόνου ασφάλισης.',
    };
  }

  if (normalizedMethod === 'insurance_days') {
    return analyzeInsuranceDaysInput({
      insuranceDaysInput,
      insuranceTimeInputMethod: normalizedMethod,
    });
  }

  return analyzeYearsMonthsDaysInsuranceInput({
    insuranceYearsInput,
    insuranceMonthsInput,
    insuranceExtraDaysInput,
    insuranceTimeInputMethod: normalizedMethod,
  });
}

function analyzeInsuranceDaysInput({
  insuranceDaysInput,
  insuranceTimeInputMethod,
}) {
  const trimmedDays = String(insuranceDaysInput || '').trim();

  if (!trimmedDays) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const daysResult = parseNonNegativeInteger(trimmedDays);

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
    };
  }

  if (daysResult.value <= 0) {
    return {
      hasValue: true,
      error: 'Τα ένσημα / ημέρες ασφάλισης πρέπει να είναι περισσότερα από 0.',
    };
  }

  const displayTime = convertInsuranceDaysToDisplayTime(daysResult.value);
  const decimalYears = roundToDecimals(
    daysResult.value / INSURANCE_DAYS_PER_YEAR,
    6
  );

  return {
    hasValue: true,
    error: null,

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: 0,
    totalInsuranceMonths: 0,
    totalInsuranceDays: daysResult.value,
    totalInsuranceDaysEquivalent: daysResult.value,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay:
      `${daysResult.value} ένσημα / ημέρες ασφάλισης ` +
      `(${displayTime.years} έτη, ${displayTime.months} μήνες, ${displayTime.days} ημέρες)`,
  };
}

function analyzeYearsMonthsDaysInsuranceInput({
  insuranceYearsInput,
  insuranceMonthsInput,
  insuranceExtraDaysInput,
  insuranceTimeInputMethod,
}) {
  const yearsText = String(insuranceYearsInput || '').trim();
  const monthsText = String(insuranceMonthsInput || '').trim();
  const daysText = String(insuranceExtraDaysInput || '').trim();

  const hasAnyTimeValue = Boolean(yearsText || monthsText || daysText);

  if (!hasAnyTimeValue) {
    return {
      hasValue: false,
      error: null,
    };
  }

  const yearsResult = parseNonNegativeIntegerOrEmpty(yearsText);
  const monthsResult = parseNonNegativeIntegerOrEmpty(monthsText);
  const daysResult = parseNonNegativeIntegerOrEmpty(daysText);

  if (!yearsResult.isValid) {
    return {
      hasValue: true,
      error: 'Τα έτη ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
    };
  }

  if (!monthsResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
    };
  }

  if (!daysResult.isValid) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι ακέραιος αριθμός.',
    };
  }

  const years = yearsResult.value;
  const months = monthsResult.value;
  const days = daysResult.value;

  if (months > 11) {
    return {
      hasValue: true,
      error: 'Οι μήνες ασφάλισης πρέπει να είναι από 0 έως 11.',
    };
  }

  if (days > 24) {
    return {
      hasValue: true,
      error: 'Οι ημέρες ασφάλισης πρέπει να είναι από 0 έως 24.',
    };
  }

  if (years === 0 && months === 0 && days === 0) {
    return {
      hasValue: true,
      error: 'Ο χρόνος ασφάλισης πρέπει να είναι μεγαλύτερος από 0.',
    };
  }

  const totalDays =
    years * INSURANCE_DAYS_PER_YEAR +
    months * INSURANCE_DAYS_PER_MONTH +
    days;

  const decimalYears = roundToDecimals(totalDays / INSURANCE_DAYS_PER_YEAR, 6);

  return {
    hasValue: true,
    error: null,

    insuranceTimeInputMethod,
    insuranceTimeInputMethodLabel:
      INSURANCE_TIME_INPUT_METHOD_OPTIONS[insuranceTimeInputMethod].label,

    totalInsuranceYears: years,
    totalInsuranceMonths: months,
    totalInsuranceDays: days,
    totalInsuranceDaysEquivalent: totalDays,
    totalInsuranceDecimalYears: decimalYears,

    insuranceTimeDisplay: `${years} έτη, ${months} μήνες, ${days} ημέρες`,
  };
}

function parseNonNegativeInteger(value) {
  const text = String(value || '').trim();

  if (!/^\d+$/.test(text)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(text),
  };
}

function parseNonNegativeIntegerOrEmpty(value) {
  const text = String(value || '').trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  return parseNonNegativeInteger(text);
}

function convertInsuranceDaysToDisplayTime(totalDays) {
  const safeTotalDays = Number(totalDays || 0);

  const years = Math.floor(safeTotalDays / INSURANCE_DAYS_PER_YEAR);
  const remainingDaysAfterYears = safeTotalDays % INSURANCE_DAYS_PER_YEAR;

  const months = Math.floor(
    remainingDaysAfterYears / INSURANCE_DAYS_PER_MONTH
  );

  const days = remainingDaysAfterYears % INSURANCE_DAYS_PER_MONTH;

  return {
    years,
    months,
    days,
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

function getPensionTypeLabel(value) {
  if (!value || !PENSION_TYPE_OPTIONS[value]) {
    return '-';
  }

  return PENSION_TYPE_OPTIONS[value].label;
}

function getPensionModeLabel(value) {
  if (!value || !PENSION_MODE_OPTIONS[value]) {
    return '-';
  }

  return PENSION_MODE_OPTIONS[value].label;
}

function getInsuranceTimeInputMethodLabel(value) {
  if (!value || !INSURANCE_TIME_INPUT_METHOD_OPTIONS[value]) {
    return '-';
  }

  return INSURANCE_TIME_INPUT_METHOD_OPTIONS[value].label;
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
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