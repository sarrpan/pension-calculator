import React, { useEffect, useRef, useState } from 'react';
import { usePublicPage } from './information/usePublicPage';
import { prepareReplacementRateInput, requestReplacementRate, formatReplacementRate,
  REPLACEMENT_RATE_FAILURE_MESSAGE } from '../services/replacementRate';
import './AverageSalaryPage.css';
import './ReplacementRatePage.css';

export default function ReplacementRatePage() {
  const [mode, setMode] = useState('days');
  const [values, setValues] = useState({ totalDays: '', years: '', months: '0', days: '0' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const title = 'Υπολογισμός ποσοστού αναπλήρωσης';
  const headingRef = usePublicPage(title, 'Συμπληρώστε τον συνολικό ασφαλιστικό χρόνο σας και δείτε το ποσοστό αναπλήρωσης που αντιστοιχεί σε αυτόν.');
  const clearResult = () => {
    requestRef.current?.abort(); requestRef.current = null;
    setIsLoading(false); setResult(null); setErrors({});
  };
  const handleSubmit = async event => {
    event.preventDefault();
    if (requestRef.current) return;
    const form = { mode, values };
    const prepared = prepareReplacementRateInput(form);
    setResult(null);
    setErrors(prepared.errors || {});
    if (!prepared.ok) {
      event.currentTarget.querySelector(`#rr-${Object.keys(prepared.errors)[0]}`)?.focus();
      return;
    }
    const controller = new AbortController(); requestRef.current = controller; setIsLoading(true);
    try {
      const response = await requestReplacementRate(form, { signal: controller.signal });
      if (!controller.signal.aborted) setResult({ status: 'success', percentage: response.percentage });
    } catch {
      if (!controller.signal.aborted) setResult({ status: 'error' });
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setIsLoading(false); }
    }
  };
  const field = (id, label) => <label className="rr-field" key={id} htmlFor={`rr-${id}`}>{label}
    <input id={`rr-${id}`} type="number" inputMode="numeric" min="0" step="1" value={values[id]}
      max={id === 'months' ? 11 : id === 'days' ? 24 : undefined}
      aria-invalid={Boolean(errors[id])} aria-describedby={errors[id] ? `rr-error-${id}` : undefined}
      onChange={event => { setValues(previous => ({ ...previous, [id]: event.target.value })); clearResult(); }} />
    {errors[id] && <span className="as-error" id={`rr-error-${id}`} role="alert">{errors[id]}</span>}
  </label>;
  return <div className="as-page rr-page"><div className="as-container">
    <header className="as-card as-hero">
      <span className="as-eyebrow">ΔΩΡΕΑΝ ΕΡΓΑΛΕΙΟ</span>
      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
      <p>Συμπληρώστε τον συνολικό ασφαλιστικό χρόνο σας και δείτε το ποσοστό αναπλήρωσης που αντιστοιχεί σε αυτόν.</p>
      <p className="rr-explanation">Το ποσοστό αναπλήρωσης χρησιμοποιείται στον υπολογισμό της ανταποδοτικής σύνταξης. Δεν είναι το ποσοστό της συνολικής κύριας σύνταξης ούτε έλεγχος συνταξιοδοτικού δικαιώματος.</p>
    </header>
    <form className="as-card" onSubmit={handleSubmit} noValidate>
      <fieldset className="rr-modes"><legend>Πώς θέλετε να δηλώσετε τον χρόνο;</legend>
        <div className="rr-segments">{[['days', 'Ημέρες ασφάλισης / ένσημα'], ['duration', 'Έτη / μήνες / ημέρες']].map(([value, label]) =>
          <label key={value} className={mode === value ? 'rr-selected' : ''}>
            <input type="radio" name="insurance-time-mode" value={value} checked={mode === value} onChange={() => { setMode(value); clearResult(); }} />{label}
          </label>)}</div>
      </fieldset>
      {mode === 'days' ? field('totalDays', 'Συνολικές ημέρες ασφάλισης / ένσημα') :
        <div className="rr-duration">{field('years', 'Έτη')}{field('months', 'Μήνες')}{field('days', 'Ημέρες')}</div>}
      <div className="as-submit-area"><button className="as-submit" type="submit" disabled={isLoading}>{isLoading ? 'Υπολογισμός...' : 'Υπολογισμός'}</button>
      </div>
      <div aria-live="polite" aria-atomic="true" aria-busy={isLoading}>
        {isLoading && <p role="status">Υπολογισμός...</p>}
        {result?.status === 'error' && <p className="as-error" role="alert">{REPLACEMENT_RATE_FAILURE_MESSAGE}</p>}
        {result?.status === 'success' && <section className="as-result" aria-labelledby="rr-result-title">
          <h2 id="rr-result-title">Συνολικό ποσοστό αναπλήρωσης</h2>
          <p className="as-result-amount">{formatReplacementRate(result.percentage)}</p>
          <p>Το ποσοστό αυτό χρησιμοποιείται στον υπολογισμό της ανταποδοτικής σύνταξης.</p>
        </section>}
      </div>
    </form>
  </div></div>;
}
