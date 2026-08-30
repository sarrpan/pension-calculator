import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import './ReportRecoveryPage.css';

/* ══════════════════════════════════════════════════════════════
   ΑΛΛΑΞΕ ΕΔΩ ΤΟ ΚΕΙΜΕΝΟ ΓΙΑ ΤΟ ΠΟΥ ΒΡΙΣΚΕΙ Ο ΧΡΗΣΤΗΣ ΤΟΝ ΚΩΔΙΚΟ

   Τώρα λέει ότι τον είδε στην οθόνη μετά την αποστολή.
   Όταν φτιάξεις τα email επιβεβαίωσης, γράψε εδώ κάτι σαν:
   'Θα τον βρείτε στο email που λάβατε μόλις ολοκληρώθηκε η αποστολή.'
   ══════════════════════════════════════════════════════════════ */
const KEIMENO_VOITHEIAS_PIN =
  'Ο κωδικός εμφανίστηκε στην οθόνη μόλις ολοκληρώθηκε η αποστολή του αρχείου σας. Αποτελείται από έξι ψηφία.';

/* Τα τέσσερα στάδια, με τη σειρά που εμφανίζονται */
const STADIA = ['Παραλήφθηκε', 'Έλεγχος αρχείου', 'Επεξεργασία', 'Απεστάλη'];

/* ══════════════════════════════════════════════════════════════
   ΑΝΤΙΣΤΟΙΧΙΑ: κατάσταση στον πίνακα διαχείρισης  ->  τι βλέπει ο πελάτης

   Αν κάποια στιγμή προσθέσεις νέα κατάσταση στον πίνακα διαχείρισης,
   πρόσθεσέ την κι εδώ. Αν την ξεχάσεις, η σελίδα ΔΕΝ σπάει -
   δείχνει τα δύο πρώτα στάδια και την κατάσταση όπως τη γράφεις εσύ.
   ══════════════════════════════════════════════════════════════ */
const KATASTASEIS = {
  pending_payment: {
    stadio: 1, // βρισκόμαστε στο "Έλεγχος αρχείου"
    perigrafi: 'Η αίτησή σας καταχωρήθηκε. Ελέγχουμε το αρχείο και τα στοιχεία που στείλατε.',
  },
  processing: {
    stadio: 2, // βρισκόμαστε στην "Επεξεργασία"
    perigrafi: 'Το αρχείο σας ελέγχθηκε. Γίνεται ο υπολογισμός της σύνταξής σας.',
  },
  completed: {
    stadio: 3, // ολοκληρώθηκε
    perigrafi: 'Ο υπολογισμός ολοκληρώθηκε. Μπορείτε να κατεβάσετε την αναλυτική έκθεση.',
  },
};

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΜΗΝΥΜΑΤΑ ΣΦΑΛΜΑΤΟΣ

   Κάθε μήνυμα έχει: τίτλο (τι έγινε), κείμενο (τι να κάνει ο χρήστης)
   και αν θα δείχνει link προς την Επικοινωνία.

   ΣΗΜΕΙΩΣΗ ΑΣΦΑΛΕΙΑΣ: λάθος κωδικός και λάθος email δίνουν επίτηδες
   το ΙΔΙΟ μήνυμα. Αν λέγαμε "ο κωδικός είναι σωστός αλλά το email όχι",
   όποιος δοκίμαζε τυχαίους εξαψήφιους αριθμούς θα καταλάβαινε πότε
   βρήκε αληθινή αίτηση.
   ══════════════════════════════════════════════════════════════ */
const MINYMATA = {
  leipeiPin: {
    titlos: 'Λείπει ο κωδικός της αίτησης',
    keimeno: 'Γράψτε τα έξι ψηφία του κωδικού σας. Το «PIN-» μπαίνει αυτόματα, δεν χρειάζεται να το πληκτρολογήσετε.',
    epikoinonia: false,
  },
  lathosEmail: {
    titlos: 'Ελέγξτε το email',
    keimeno: 'Γράψτε ολόκληρη τη διεύθυνση, μαζί με το @ και την κατάληξη. Για παράδειγμα: onoma@example.gr',
    epikoinonia: false,
  },
  denVrethike: {
    titlos: 'Δεν βρέθηκε αίτηση με αυτά τα στοιχεία',
    keimeno: 'Ελέγξτε ότι ο κωδικός έχει έξι ψηφία και ότι το email είναι ακριβώς αυτό που δηλώσατε όταν στείλατε το αρχείο σας. Αν κάποιο από τα δύο δεν ταιριάζει, η αίτηση δεν εμφανίζεται.',
    epikoinonia: true,
  },
  provlimaSyndesis: {
    titlos: 'Η αναζήτηση δεν ολοκληρώθηκε',
    keimeno: 'Δοκιμάστε ξανά σε λίγο. Αν το πρόβλημα συνεχίζεται, στείλτε μας τον κωδικό σας και θα σας ενημερώσουμε εμείς.',
    epikoinonia: true,
  },
};

const ReportRecoveryPage = () => {
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Σημεία της σελίδας όπου θα κατέβει αυτόματα η οθόνη
  const errorRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    const stoxos = reportData ? resultRef.current : error ? errorRef.current : null;
    if (!stoxos) return;

    // Αν ο χρήστης έχει ζητήσει "λιγότερη κίνηση" στο λειτουργικό του,
    // η μετακίνηση γίνεται ακαριαία αντί για ομαλή.
    const ligoteriKinisi =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    stoxos.scrollIntoView({
      behavior: ligoteriKinisi ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [reportData, error]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setReportData(null);

    // Καθαρίζουμε το PIN: κενά, πεζά/κεφαλαία, και το "PIN-" αν το έγραψε κι αυτός
    const cleanPin = pin.trim().toUpperCase().replace(/^PIN[-\s]*/, '');
    const cleanEmail = email.trim().toLowerCase();

    // --- Έλεγχοι πριν καν ρωτήσουμε τη βάση ---
    if (!cleanPin) {
      setError(MINYMATA.leipeiPin);
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(MINYMATA.lathosEmail);
      return;
    }

    setLoading(true);

    try {
      const reportRef = ref(db, `premium_requests/PIN-${cleanPin}`);
      const snapshot = await get(reportRef);

      if (!snapshot.exists()) {
        setError(MINYMATA.denVrethike);
        return;
      }

      const data = snapshot.val();

      // Έλεγχος ασφαλείας: το email πρέπει να ταιριάζει με αυτό της αίτησης
      if (data?.email?.trim().toLowerCase() !== cleanEmail) {
        setError(MINYMATA.denVrethike);
        return;
      }

      setReportData(data);
    } catch (err) {
      console.error(err);
      setError(MINYMATA.provlimaSyndesis);
    } finally {
      setLoading(false);
    }
  };

  // Υπολογισμός σταδίου με βάση την κατάσταση της αίτησης
  const katastasi = reportData ? KATASTASEIS[reportData.status] : null;
  const trexonStadio = katastasi ? katastasi.stadio : 1;
  const oloklirothike = reportData?.status === 'completed';
  const perigrafi = katastasi ? katastasi.perigrafi : reportData?.status;

  return (
    <div className="recovery-page">
      <div className="recovery-inner">

        <span className="recovery-eyebrow">Παρακολούθηση Αίτησης</span>
        <h1 className="recovery-title">Δείτε πού βρίσκεται η αίτησή σας</h1>
        <p className="recovery-subtitle">
          Συμπληρώστε τον κωδικό της αίτησης και το email που δηλώσατε, για να
          δείτε σε ποιο στάδιο βρίσκεται και να κατεβάσετε την έκθεσή σας όταν
          είναι έτοιμη.
        </p>

        <div className="recovery-card">
          <form onSubmit={handleSearch} noValidate>

            {/* --- Κωδικός αίτησης --- */}
            <div className="field">
              <label className="field-label" htmlFor="pin">
                Κωδικός αίτησης
              </label>
              <div className="pin-input-group">
                <span className="pin-prefix" aria-hidden="true">PIN-</span>
                <input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="146138"
                  aria-label="Κωδικός αίτησης, τα έξι ψηφία μετά το PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
              <p className="field-help">{KEIMENO_VOITHEIAS_PIN}</p>
            </div>

            {/* --- Email --- */}
            <div className="field">
              <label className="field-label" htmlFor="email">
                Email αίτησης
              </label>
              <input
                id="email"
                type="email"
                className="text-input"
                autoComplete="email"
                placeholder="onoma@example.gr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="field-help">
                Το email που δώσατε όταν στείλατε το αρχείο σας.
              </p>
            </div>

            <button type="submit" className="recovery-submit" disabled={loading}>
              {loading ? 'Γίνεται αναζήτηση…' : 'Έλεγχος κατάστασης'}
            </button>
          </form>

          {/* --- Μήνυμα σφάλματος --- */}
          <div aria-live="polite">
            {error && (
              <div className="form-error" role="alert" ref={errorRef}>
                <svg className="form-error-icon" width="22" height="22" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="7.5" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.5" />
                </svg>

                <div className="form-error-body">
                  <p className="form-error-title">{error.titlos}</p>
                  <p className="form-error-text">{error.keimeno}</p>
                  {error.epikoinonia && (
                    <Link to="/contact" className="form-error-link">
                      Επικοινωνήστε μαζί μας
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="recovery-help-link">
          Δεν βρίσκετε τον κωδικό σας; <Link to="/contact">Επικοινωνήστε μαζί μας</Link>
        </p>

        {/* --- Αποτέλεσμα --- */}
        {reportData && (
          <div className="status-box" aria-live="polite" ref={resultRef}>
            <span className="status-eyebrow">Κατάσταση αίτησης</span>

            <ol className="stages">
              {STADIA.map((onoma, i) => {
                const done = i < trexonStadio || (oloklirothike && i <= trexonStadio);
                const current = i === trexonStadio && !oloklirothike;
                const telos = oloklirothike && i === STADIA.length - 1;
                return (
                  <li
                    key={onoma}
                    className={
                      'stage' +
                      (done ? ' is-done' : '') +
                      (current ? ' is-current' : '') +
                      (telos ? ' is-final' : '')
                    }
                  >
                    <span className="stage-dot">
                      {done ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="3.5"
                             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="stage-label">{onoma}</span>
                  </li>
                );
              })}
            </ol>

            <p className="status-text">{perigrafi}</p>

            {oloklirothike && reportData.finalReportUrl && (
              <a
                href={reportData.finalReportUrl}
                target="_blank"
                rel="noreferrer"
                className="download-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Κατέβασμα έκθεσης (PDF)
              </a>
            )}

            {oloklirothike && !reportData.finalReportUrl && (
              <p className="status-note">
                Η έκθεση ολοκληρώθηκε και αναρτάται. Δοκιμάστε ξανά σε λίγο.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportRecoveryPage;
