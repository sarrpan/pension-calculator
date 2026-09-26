import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AVERAGE_SALARY_FAILURE_MESSAGE, CONTRIBUTION_FUND_OPTIONS,
  calculateAveragePensionableEarnings, getInsuranceDaysError, parseAmount,
  prepareAverageSalaryInput,
} from '../services/averageSalary';
import './AverageSalaryPage.css';

const inputTypes = [
  {
    value: 'salaried',
    label: 'Μισθωτή εργασία',
    amountLabel: 'Ετήσιες μικτές / ασφαλιστέες αποδοχές',
  },
  {
    value: 'non-salaried-income',
    label: 'Μη μισθωτή δραστηριότητα — γνωρίζω το ετήσιο ασφαλιστέο / συντάξιμο εισόδημα',
    amountLabel: 'Ετήσιο ασφαλιστέο / συντάξιμο εισόδημα',
  },
  {
    value: 'non-salaried-contributions',
    label: 'Μη μισθωτή δραστηριότητα — γνωρίζω τις ετήσιες εισφορές κύριας σύνταξης',
    amountLabel: 'Ετήσια εισφορά κύριας σύνταξης',
  },
];

const DRAFT_STORAGE_KEY = 'geodora_average_salary_draft_v1';

const createDefaultRows = (currentYear) => Array.from(
  { length: currentYear - 2002 + 1 },
  (_, index) => ({ year: 2002 + index, amount: '0', days: '300' }),
);

const loadDraft = (currentYear) => {
  const defaults = { rows: createDefaultRows(currentYear), inputType: inputTypes[0].value, fund: '' };
  if (typeof window === 'undefined') return defaults;

  try {
    const draft = JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY));
    if (!draft || !inputTypes.some(({ value }) => value === draft.inputType)
      || (draft.fund !== '' && !CONTRIBUTION_FUND_OPTIONS.some(({ value }) => value === draft.fund))
      || !Array.isArray(draft.rows)
      || !draft.rows.every((row) => row && Number.isInteger(row.year)
        && row.year >= 2002 && row.year <= currentYear
        && typeof row.amount === 'string' && typeof row.days === 'string')) {
      return defaults;
    }

    const savedRows = new Map(draft.rows.map(({ year, amount, days }) => [year, { year, amount, days }]));
    return {
      rows: defaults.rows.map((row) => savedRows.get(row.year) || row),
      inputType: draft.inputType,
      fund: draft.fund,
    };
  } catch {
    return defaults;
  }
};

const AverageSalaryPage = () => {
  const currentYear = new Date().getFullYear();
  const [initialDraft] = useState(() => loadDraft(currentYear));
  const [inputType, setInputType] = useState(initialDraft.inputType);
  const [fund, setFund] = useState(initialDraft.fund);
  const [fundError, setFundError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(null);
  const draftChangedRef = useRef(false);
  const [rows, setRows] = useState(initialDraft.rows);
  const [result, setResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(false);
  const { amountLabel } = inputTypes.find(({ value }) => value === inputType);
  const hasPositiveAmount = rows.some(({ amount }) => parseAmount(amount) > 0);
  const hasNumericResult = result?.status === 'success'
    && Number.isFinite(result.monthlyAmount) && result.monthlyAmount >= 0;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Υπολογισμός μέσου μηνιαίου συντάξιμου μισθού';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    // Keep a cleared draft absent until the user edits the form again.
    if (!draftChangedRef.current || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ rows, inputType, fund }));
    } catch {
      // The form remains usable when browser storage is unavailable.
    }
  }, [rows, inputType, fund]);

  const clearResult = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsLoading(false);
    setResult(null);
    setSubmissionError(false);
  };

  const clearDraft = () => {
    draftChangedRef.current = false;
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Reset the form even when browser storage is unavailable.
    }
    setInputType(inputTypes[0].value);
    setFund('');
    setRows(createDefaultRows(currentYear));
    setFundError('');
    clearResult();
  };

  const updateRow = (year, field, value) => {
    draftChangedRef.current = true;
    setRows((previous) => previous.map((row) => (
      row.year === year ? { ...row, [field]: value } : row
    )));
    clearResult();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasPositiveAmount || requestRef.current) return;

    const form = { inputType, fund, rows };
    const preparation = prepareAverageSalaryInput(form);
    setFundError(preparation.fundError || '');
    if (!preparation.ok) {
      setResult(null);
      setSubmissionError(true);
      if (preparation.fundError) {
        event.currentTarget.elements.namedItem('fund')?.focus();
      } else if (preparation.invalidRow) {
        const invalidRow = preparation.invalidRow;
        const field = parseAmount(invalidRow.amount) === null ? 'amount' : 'days';
        event.currentTarget.elements.namedItem(`${field}-${invalidRow.year}`)?.focus();
      }
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setIsLoading(true);
    setResult(null);
    setSubmissionError(false);
    try {
      const response = await calculateAveragePensionableEarnings(form, { signal: controller.signal });
      if (!controller.signal.aborted) setResult({ status: 'success', monthlyAmount: response.monthlyAmount });
    } catch {
      if (!controller.signal.aborted) setResult({ status: 'error' });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="as-page">
      <div className="as-container">
        <Link to="/free-guide" className="as-back-link">← Οδηγός δωρεάν εκτίμησης</Link>

        <section className="as-card as-hero" aria-labelledby="as-title">
          <span className="as-eyebrow">ΔΩΡΕΑΝ ΕΡΓΑΛΕΙΟ</span>
          <h1 id="as-title">Υπολογίστε τον μέσο μηνιαίο συντάξιμο μισθό σας</h1>
          <p>
            Ο μέσος μηνιαίος συντάξιμος μισθός είναι ένα από τα στοιχεία που
            χρειάζονται για την εκτίμηση της ανταποδοτικής σύνταξης. Δεν είναι
            ο τελευταίος μισθός σας ούτε ένας απλός μέσος όρος των μισθών σας.
          </p>
          <p>
            Το εργαλείο αυτό είναι ξεχωριστό από τη δωρεάν εκτίμηση. Τα ετήσια στοιχεία
            συμπληρώνονται μόνο εδώ· στη δωρεάν εκτίμηση χρησιμοποιείται ο μέσος μηνιαίος
            συντάξιμος μισθός που θα προκύψει.
          </p>
        </section>

        <form className="as-card as-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="as-input-types">
            <legend>Ποια στοιχεία έχετε;</legend>
            <div className="as-options">
              {inputTypes.map(({ value, label }) => (
                <label key={value} className={`as-option${inputType === value ? ' as-option-selected' : ''}`}>
                  <input
                    type="radio"
                    name="input-type"
                    value={value}
                    checked={inputType === value}
                    onChange={() => {
                      draftChangedRef.current = true;
                      setInputType(value);
                      setFundError('');
                      clearResult();
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {inputType === 'non-salaried-contributions' && (
            <div className="as-fund-field">
              <label htmlFor="as-fund">Κατηγορία / πρώην ασφαλιστικός φορέας</label>
              <select id="as-fund" name="fund" required value={fund}
                aria-invalid={Boolean(fundError)} aria-describedby={fundError ? 'as-fund-error' : undefined}
                onChange={(event) => {
                  draftChangedRef.current = true;
                  setFund(event.target.value);
                  setFundError('');
                  clearResult();
                }}>
                <option value="">Επιλέξτε</option>
                {CONTRIBUTION_FUND_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              {fundError && <p className="as-error" id="as-fund-error" role="alert">{fundError}</p>}
            </div>
          )}

          <div className="as-years-heading">
            <h2>Τα ετήσια στοιχεία σας</h2>
            <span className="as-year-range">2002–{currentYear}</span>
          </div>
          <div className="as-draft-tools">
            <p className="as-help">Τα ποσά και οι ημέρες που συμπληρώνετε αποθηκεύονται μόνο στον browser αυτής της συσκευής, ώστε να μη χρειάζεται να τα εισάγετε ξανά.</p>
            <button type="button" className="as-clear-draft" onClick={clearDraft}>Καθαρισμός στοιχείων</button>
          </div>
          <p className="as-help" id="as-input-help">
            Συμπληρώστε το ετήσιο ποσό σε € και τις ημέρες ασφάλισης (0–300).
            Στα ποσά μπορείτε να χρησιμοποιήσετε κόμμα ή τελεία για τα δεκαδικά,
            χωρίς διαχωριστικό χιλιάδων. Έτη με μηδενικό ή κενό ποσό δεν συμμετέχουν.
            Για κάθε θετικό ποσό χρειάζονται από 1 έως 300 ημέρες ασφάλισης.
          </p>

          <table className="as-table" role="table" aria-describedby="as-input-help">
            <caption className="as-sr-only">Ποσά και ημέρες ασφάλισης ανά έτος, από το 2002 έως το {currentYear}</caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">Έτος</th>
                <th scope="col" role="columnheader">{amountLabel}</th>
                <th scope="col" role="columnheader">Ημέρες ασφάλισης</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {rows.map(({ year, amount, days }) => {
                const amountError = parseAmount(amount) === null;
                const daysError = getInsuranceDaysError(amount, days);
                return (
                  <tr key={year} role="row">
                    <th scope="row" role="rowheader"><span className="as-mobile-year">Έτος </span>{year}</th>
                    <td role="cell">
                      <label className="as-mobile-label" htmlFor={`as-amount-${year}`}>{amountLabel}</label>
                      <div className="as-amount-input">
                        <input
                          id={`as-amount-${year}`}
                          name={`amount-${year}`}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          spellCheck={false}
                          aria-label={`${amountLabel} σε ευρώ, ${year}`}
                          aria-invalid={amountError}
                          aria-describedby={amountError ? `as-amount-error-${year}` : undefined}
                          value={amount}
                          onChange={(event) => updateRow(year, 'amount', event.target.value)}
                        />
                        <span aria-hidden="true">€</span>
                      </div>
                      {amountError && (
                        <p className="as-error" id={`as-amount-error-${year}`} role="alert">
                          Εισαγάγετε μη αρνητικό ποσό, με κόμμα ή τελεία για τα δεκαδικά.
                        </p>
                      )}
                    </td>
                    <td role="cell">
                      <label className="as-mobile-label" htmlFor={`as-days-${year}`}>Ημέρες ασφάλισης</label>
                      <input
                        id={`as-days-${year}`}
                        name={`days-${year}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        spellCheck={false}
                        aria-label={`Ημέρες ασφάλισης, ${year}`}
                        aria-invalid={Boolean(daysError)}
                        aria-describedby={daysError ? `as-days-error-${year}` : undefined}
                        value={days}
                        onChange={(event) => updateRow(year, 'days', event.target.value)}
                      />
                      {daysError && (
                        <p className="as-error" id={`as-days-error-${year}`} role="alert">
                          {daysError}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="as-submit-area">
            <p className="as-help" id="as-submit-help">Για να συνεχίσετε, συμπληρώστε τουλάχιστον ένα ποσό μεγαλύτερο από 0.</p>
            {submissionError && (
              <p className="as-error" role="alert">Ελέγξτε τα πεδία με σφάλμα πριν συνεχίσετε.</p>
            )}
            <button type="submit" className="as-submit" disabled={!hasPositiveAmount || isLoading} aria-describedby="as-submit-help">
              {isLoading ? 'Υπολογισμός...' : 'Υπολογισμός μέσου συντάξιμου μισθού'}
            </button>
          </div>

          <section className="as-result" aria-labelledby="as-result-title" aria-live="polite" aria-atomic="true" aria-busy={isLoading}>
            <h2 id="as-result-title">
              {hasNumericResult ? 'Εκτιμώμενος μέσος μηνιαίος συντάξιμος μισθός' : 'Μέσος μηνιαίος συντάξιμος μισθός'}
            </h2>
            {hasNumericResult ? (
              <>
                <p className="as-result-amount">
                  {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(result.monthlyAmount)}
                </p>
                <p>Αυτό είναι το ποσό που μπορείτε να χρησιμοποιήσετε στη δωρεάν εκτίμηση σύνταξης. Αν συνεχίσετε από το κουμπί παρακάτω, το ποσό θα μεταφερθεί αυτόματα και θα εμφανιστεί προσυμπληρωμένο.</p>
                <Link className="as-submit as-result-link" to="/calculator?start=main"
                  state={{ averageMonthlyPensionableEarnings: result.monthlyAmount }}>
                  Ξεκινήστε δωρεάν
                </Link>
              </>
            ) : result?.status === 'error' ? (
              <p className="as-error" role="alert">{AVERAGE_SALARY_FAILURE_MESSAGE}</p>
            ) : (
              <p>{isLoading ? 'Υπολογισμός...' : 'Το αποτέλεσμα θα εμφανιστεί εδώ.'}</p>
            )}
          </section>
        </form>

        <section className="as-card as-explanation" aria-labelledby="as-explanation-title">
          <h2 id="as-explanation-title">Πώς προκύπτει</h2>
          <p>
            Οι συντάξιμες αποδοχές των ετών που λαμβάνονται υπόψη αναπροσαρμόζονται
            με τους προβλεπόμενους συντελεστές και χρησιμοποιούνται για τον
            υπολογισμό του μέσου μηνιαίου συντάξιμου μισθού.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AverageSalaryPage;
