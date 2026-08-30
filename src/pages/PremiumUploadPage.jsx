import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PremiumUploadPage.css';
import { anevasmaAitisis, katagrafiPliromis } from '../services/stripe/premiumService';
import stripePromise from '../services/stripe/stripeService';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/stripe/StripePaymentForm';

/* ──────────────────────────────────────────────
   Εικονίδια (inline SVG, γραμμικά — χωρίς emoji)
   ────────────────────────────────────────────── */
const svgBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

const IconFile = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const IconCheck = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconCircleCheck = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

const IconCircle = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const IconAlert = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

const IconShield = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z" />
  </svg>
);

const IconLock = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconTrash = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
  </svg>
);

const IconCard = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const IconCopy = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a1 1 0 0 1 1-1h9" />
  </svg>
);


/* ────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════
   ΔΟΚΙΜΑΣΤΙΚΗ ΠΑΡΑΚΑΜΨΗ

   Με τιμή true, η σελίδα ΔΕΝ ανεβάζει αρχείο και ΔΕΝ ζητά κάρτα.
   Πηγαίνει κατευθείαν στην οθόνη επιτυχίας με ψεύτικο κωδικό,
   ώστε να ελεγχθεί η εμφάνιση χωρίς Blaze.

   ΠΡΙΝ ΤΟ ΑΝΕΒΑΣΜΑ ΣΤΟ LIVE ΠΡΕΠΕΙ ΝΑ ΓΙΝΕΙ false.
   ══════════════════════════════════════════════════════════════ */
const DOKIMASTIKI_PARAKAMPSI = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatSize = (bytes) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const PremiumUploadPage = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPin, setGeneratedPin] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinAitisis, setPinAitisis] = useState(null);
  const [prosochiPliromis, setProsochiPliromis] = useState(false);

  const successRef = useRef(null);

  const emailIsValid = EMAIL_PATTERN.test(email.trim());
  const canContinue = emailIsValid && !!file && isConfirmed;

  const requirements = [
    { id: 'email', label: 'Το email σας για την παράδοση', done: emailIsValid },
    { id: 'file', label: 'Το αρχείο PDF του ασφαλιστικού ιστορικού', done: !!file },
    { id: 'confirm', label: 'Η επιβεβαίωση για τα προσωπικά στοιχεία', done: isConfirmed },
  ];

  useEffect(() => {
    if (generatedPin && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPin]);

  useEffect(() => {
    if (showPayment) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showPayment]);

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Δεκτά είναι μόνο αρχεία PDF. Επιλέξτε το αρχείο που κατεβάσατε από τον e-ΕΦΚΑ.');
      setFile(null);
      setIsConfirmed(false);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Το αρχείο ξεπερνά τα 5 MB (${formatSize(selectedFile.size)}). Ανεβάστε μόνο τις σελίδες του ασφαλιστικού ιστορικού.`);
      setFile(null);
      setIsConfirmed(false);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setIsConfirmed(false);
    setError('');
  };

  const handlePreSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailIsValid) {
      setError('Συμπληρώστε ένα έγκυρο email. Εκεί θα σταλεί η ολοκληρωμένη έκθεση.');
      return;
    }
    if (!file) {
      setError('Επιλέξτε το αρχείο PDF του ασφαλιστικού σας ιστορικού.');
      return;
    }
    if (!isConfirmed) {
      setError('Επιβεβαιώστε ότι το αρχείο δεν περιέχει τη σελίδα με τα προσωπικά σας στοιχεία.');
      return;
    }

    // Δοκιμαστική παράκαμψη: ούτε ανέβασμα ούτε πληρωμή.
    if (DOKIMASTIKI_PARAKAMPSI) {
      setGeneratedPin('PIN-146138');
      return;
    }

    // Το αρχείο ανεβαίνει ΠΡΙΝ ζητηθεί κάρτα.
    setIsSubmitting(true);
    const apotelesma = await anevasmaAitisis(email.trim(), file);
    setIsSubmitting(false);

    if (!apotelesma.success) {
      setError(apotelesma.error);
      return;
    }

    setPinAitisis(apotelesma.pin);
    setShowPayment(true);
  };

  const handleFinalSubmit = async (paymentIntentId) => {
    setIsSubmitting(true);
    const apotelesma = await katagrafiPliromis(pinAitisis, paymentIntentId);
    if (!apotelesma.success) {
      // Η πληρωμή πέτυχε αλλά δεν καταγράφηκε. Ο πελάτης δεν φταίει
      // και δεν πρέπει να ξαναπληρώσει — του δείχνουμε τον κωδικό του.
      setProsochiPliromis(true);
    }
    setGeneratedPin(pinAitisis);
    setIsSubmitting(false);
  };

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(generatedPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  /* ── Οθόνη επιτυχίας ── */
  if (generatedPin) {
    const pinNumber = String(generatedPin).replace(/^PIN-/i, '');

    return (
      <div className="pu-wrapper" ref={successRef}>
        <div className="pu-inner">
          <header className="pu-header">
            <p className="pu-eyebrow">ΑΠΟΣΤΟΛΗ ΙΣΤΟΡΙΚΟΥ</p>
            <h1 className="pu-title">Η αίτησή σας καταχωρήθηκε</h1>
            <p className="pu-subtitle">
              Λάβαμε το αρχείο σας. Η έκθεση θα σταλεί στο <strong>{email.trim()}</strong> μόλις ολοκληρωθεί ο έλεγχος.
            </p>
          </header>

          <section className="pu-card pu-pin-card">
            <p className="pu-pin-label">Ο κωδικός παρακολούθησης της αίτησής σας</p>
            <p className="pu-pin-value">{generatedPin}</p>

            <button type="button" className="pu-copy-btn" onClick={handleCopyPin}>
              {copied ? <IconCheck className="pu-icon-sm" /> : <IconCopy className="pu-icon-sm" />}
              {copied ? 'Αντιγράφηκε' : 'Αντιγραφή κωδικού'}
            </button>

            <div className="pu-notice pu-notice--warn">
              <IconAlert className="pu-icon" />
              <div>
                <p className="pu-notice-title">Σημειώστε τον κωδικό τώρα</p>
                <p>
                  Εμφανίζεται μόνο σε αυτή την οθόνη. Αν κλείσετε τη σελίδα, θα τον ξαναδείτε μόνο στο
                  τελικό email, όταν η έκθεση είναι έτοιμη.
                </p>
              </div>
            </div>

            {prosochiPliromis && (
              <div className="pu-notice pu-notice--warn">
                <IconAlert className="pu-icon" />
                <div>
                  <p className="pu-notice-title">Η πληρωμή σας καταχωρήθηκε με καθυστέρηση</p>
                  <p>
                    Το αρχείο σας παραλήφθηκε κανονικά και δεν χρειάζεται να πληρώσετε ξανά. Αν δεν
                    λάβετε ενημέρωση εντός 24 ωρών, στείλτε μας τον κωδικό σας.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="pu-card">
            <h2 className="pu-card-title">Τι ακολουθεί</h2>
            <ol className="pu-next-steps">
              <li>Ελέγχουμε ότι το αρχείο είναι πλήρες και αναγνώσιμο.</li>
              <li>Υπολογίζουμε τη σύνταξη και συντάσσουμε την έκθεση.</li>
              <li>Λαμβάνετε το PDF στο email σας. Η χρέωση των 10€ ολοκληρώνεται τότε.</li>
            </ol>

            <div className="pu-actions">
              <Link to="/report-recovery" className="pu-btn-primary">
                Παρακολούθηση αίτησης
              </Link>
              <Link to="/contact" className="pu-btn-secondary">
                Επικοινωνία
              </Link>
            </div>

            <p className="pu-hint">
              Στη σελίδα παρακολούθησης συμπληρώνετε μόνο τον αριθμό <strong>{pinNumber}</strong> — το
              «PIN-» υπάρχει ήδη στο πεδίο.
            </p>
          </section>
        </div>
      </div>
    );
  }

  /* ── Κύρια σελίδα ── */
  return (
    <div className="pu-wrapper">
      <div className="pu-inner">
        <header className="pu-header">
          <p className="pu-eyebrow">ΑΠΟΣΤΟΛΗ ΙΣΤΟΡΙΚΟΥ</p>
          {!showPayment ? (
            <>
              <h1 className="pu-title">Στείλτε το ασφαλιστικό σας ιστορικό</h1>
              <p className="pu-subtitle">
                Ανεβάζετε το PDF του e-ΕΦΚΑ και λαμβάνετε αναλυτική έκθεση σύνταξης στο email σας.
              </p>
            </>
          ) : (
            <>
              <h1 className="pu-title">Ολοκλήρωση πληρωμής</h1>
              <p className="pu-subtitle">
                Το αρχείο σας παραλήφθηκε. Δέσμευση 10€ — η χρέωση γίνεται μόνο όταν παραδοθεί η έκθεση.
              </p>
            </>
          )}
        </header>

        {/* Σύνοψη παραγγελίας — μόνο στο πρώτο βήμα */}
        {!showPayment && (
        <section className="pu-card pu-order">
          <div className="pu-order-head">
            <div>
              <h2 className="pu-order-title">Αναλυτική έκθεση σύνταξης</h2>
              <p className="pu-order-sub">Με βάση το πραγματικό σας ασφαλιστικό ιστορικό</p>
            </div>
            <div className="pu-price">
              <span className="pu-price-amount">10€</span>
              <span className="pu-price-note">εφάπαξ</span>
            </div>
          </div>

          <ul className="pu-order-list">
            <li><IconCheck className="pu-icon-sm" />Ημερομηνία που θεμελιώνετε δικαίωμα σύνταξης</li>
            <li><IconCheck className="pu-icon-sm" />Ανάλυση ποσού: εθνική, ανταποδοτική, επικουρική, κρατήσεις</li>
            <li><IconCheck className="pu-icon-sm" />Σύγκριση σεναρίων εξόδου, σε αρχείο PDF στο email σας</li>
          </ul>

          <p className="pu-order-foot">
            Η κάρτα δεσμεύεται τώρα και χρεώνεται μόνο όταν παραδοθεί η έκθεση. Αν το αρχείο σας δεν
            επαρκεί, η δέσμευση ακυρώνεται.
          </p>
        </section>
        )}

        {!showPayment ? (
          <section className="pu-card">
            <h2 className="pu-card-title">Τα στοιχεία σας</h2>

            <form onSubmit={handlePreSubmit} className="pu-form" noValidate>
              <div className="pu-field">
                <label className="pu-label" htmlFor="pu-email">
                  Email παράδοσης
                </label>
                <input
                  id="pu-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="π.χ. onoma@mail.com"
                  className="pu-input"
                  autoComplete="email"
                />
                <p className="pu-field-hint">Εκεί θα σταλεί η έκθεση και ο κωδικός παρακολούθησης.</p>
              </div>

              <div className="pu-field">
                <span className="pu-label">Ασφαλιστικό ιστορικό (PDF, έως 5 MB)</span>

                {!file ? (
                  <label
                    className={`pu-drop ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="pu-visually-hidden"
                    />
                    <IconFile className="pu-drop-icon" />
                    <span className="pu-drop-main">Επιλογή αρχείου PDF</span>
                    <span className="pu-drop-sub">ή σύρετέ το εδώ</span>
                  </label>
                ) : (
                  <div className="pu-file">
                    <IconFile className="pu-file-icon" />
                    <div className="pu-file-meta">
                      <p className="pu-file-name">{file.name}</p>
                      <p className="pu-file-size">{formatSize(file.size)}</p>
                    </div>
                    <button type="button" className="pu-file-remove" onClick={removeFile}>
                      <IconTrash className="pu-icon-sm" />
                      Αφαίρεση
                    </button>
                  </div>
                )}
              </div>

              <label className={`pu-confirm ${isConfirmed ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="pu-visually-hidden"
                />
                <span className="pu-checkbox" aria-hidden="true">
                  <IconCheck className="pu-checkbox-icon" />
                </span>
                <span className="pu-confirm-text">
                  Επιβεβαιώνω ότι το αρχείο <strong>δεν περιέχει</strong> την πρώτη σελίδα με τα
                  προσωπικά μου στοιχεία (ΑΜΚΑ, ΑΦΜ, ονοματεπώνυμο).
                </span>
              </label>

              {error && (
                <div className="pu-notice pu-notice--error" role="alert">
                  <IconAlert className="pu-icon" />
                  <div>
                    <p className="pu-notice-title">Δεν μπορούμε να συνεχίσουμε</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {!canContinue && (
                <div className="pu-checklist">
                  <p className="pu-checklist-title">Για να συνεχίσετε χρειάζονται:</p>
                  <ul>
                    {requirements.map((r) => (
                      <li key={r.id} className={r.done ? 'is-done' : ''}>
                        {r.done ? <IconCircleCheck className="pu-icon-sm" /> : <IconCircle className="pu-icon-sm" />}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="submit" className="pu-btn-primary pu-btn-full" disabled={!canContinue || isSubmitting}>
                {isSubmitting ? 'Γίνεται αποστολή του αρχείου…' : 'Αποστολή αρχείου και πληρωμή'}
              </button>
            </form>

            <div className="pu-security">
              <p className="pu-security-title">
                <IconShield className="pu-icon-sm" />
                Τα στοιχεία σας
              </p>
              <ul>
                <li><IconLock className="pu-icon-sm" />Η πληρωμή γίνεται μέσω Stripe. Δεν βλέπουμε ούτε αποθηκεύουμε τα στοιχεία της κάρτας σας.</li>
                <li><IconTrash className="pu-icon-sm" />Το αρχείο διαγράφεται μετά την παράδοση της έκθεσης.</li>
                <li><IconCard className="pu-icon-sm" />Η χρέωση ολοκληρώνεται μόνο εφόσον παραδοθεί η έκθεση.</li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="pu-card">
            <div className="pu-review">
              <div className="pu-review-row">
                <span>Email παράδοσης</span>
                <strong>{email.trim()}</strong>
              </div>
              <div className="pu-review-row">
                <span>Αρχείο</span>
                <strong>{file.name}</strong>
              </div>
              <div className="pu-review-row pu-review-total">
                <span>Σύνολο</span>
                <strong>10€</strong>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <div className="pu-payment">
                <StripePaymentForm onFileSubmit={handleFinalSubmit} />
              </div>
            </Elements>

            {isSubmitting && <p className="pu-hint">Ολοκληρώνεται η καταχώριση…</p>}

            {error && (
              <div className="pu-notice pu-notice--error" role="alert">
                <IconAlert className="pu-icon" />
                <div>
                  <p className="pu-notice-title">Η υποβολή δεν ολοκληρώθηκε</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <p className="pu-hint">
              Αν διακόψετε εδώ, δεν χρεώνεστε και η αίτηση δεν προχωρά σε επεξεργασία.
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PremiumUploadPage;
