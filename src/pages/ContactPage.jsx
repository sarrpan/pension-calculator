import React, { useState } from 'react';
import './ContactPage.css';

/* ══════════════════════════════════════════════════════════════
   ΡΥΘΜΙΣΕΙΣ ΤΗΣ ΣΕΛΙΔΑΣ

   Αλλάζοντας τις δύο γραμμές παρακάτω αλλάζει όλη η σελίδα.
   Δεν χρειάζεται να πειραχτεί τίποτε άλλο.
   ══════════════════════════════════════════════════════════════ */
const EMAIL_EPIKOINONIAS = 'roko.mal_husky@yahoo.gr';
const THEMA_EMAIL = 'Ερώτηση από την ιστοσελίδα';

/* Εικονίδια — γραμμικά SVG, χωρίς emoji */
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
    <path d="M8 13h8M8 17h5" />
  </svg>
);

const IconReport = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M4 19V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M8 15v-3M12 15V9M16 15v-5" />
  </svg>
);

const IconLock = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconShield = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z" />
  </svg>
);

const IconMail = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const IconAlert = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

const IconCheck = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Όταν φτιαχτεί η σελίδα Συχνών Ερωτήσεων, κάθε στοιχείο εδώ
   αποκτά και διαδρομή, ώστε να γίνει σύνδεσμος προς τη σχετική
   απάντηση. Μέχρι τότε μένουν σκέτο κείμενο. */
const THEMATA = [
  {
    Icon: IconFile,
    titlos: 'Βοήθεια με τον e-ΕΦΚΑ',
    keimeno: 'Αν δυσκολεύεστε να βρείτε ή να κατεβάσετε το PDF του ασφαλιστικού σας ιστορικού.',
  },
  {
    Icon: IconReport,
    titlos: 'Η αναλυτική έκθεση',
    keimeno: 'Τι ακριβώς περιλαμβάνει, πόσο κοστίζει και πώς παραδίδεται.',
  },
  {
    Icon: IconLock,
    titlos: 'Τα προσωπικά σας δεδομένα',
    keimeno: 'Πώς προστατεύονται τα έγγραφα που στέλνετε και πότε διαγράφονται.',
  },
];

const ContactPage = () => {
  const [onoma, setOnoma] = useState('');
  const [email, setEmail] = useState('');
  const [minima, setMinima] = useState('');
  const [sfalma, setSfalma] = useState('');
  const [estalthike, setEstalthike] = useState(false);

  /* ══════════════════════════════════════════════════════════════
     Η ΑΠΟΣΤΟΛΗ ΤΟΥ ΜΗΝΥΜΑΤΟΣ

     ΠΡΟΣΩΡΙΝΗ ΛΥΣΗ: ανοίγει το πρόγραμμα αλληλογραφίας του
     επισκέπτη με το μήνυμα ήδη γραμμένο. Δεν απαιτεί server,
     οπότε δουλεύει και στο δωρεάν πλάνο (Spark).

     ΟΤΑΝ ΕΡΘΕΙ ΤΟ BLAZE: αλλάζει ΜΟΝΟ το εσωτερικό αυτής της
     συνάρτησης. Αντί για mailto, γίνεται fetch στη function που
     θα στέλνει το email. Τίποτε άλλο στη σελίδα δεν αλλάζει.
     ══════════════════════════════════════════════════════════════ */
  const apostoliMinimatos = () => {
    const soma =
      `Όνομα: ${onoma.trim()}\n` +
      `Email: ${email.trim()}\n\n` +
      `${minima.trim()}\n`;

    const dieuthynsi =
      `mailto:${EMAIL_EPIKOINONIAS}` +
      `?subject=${encodeURIComponent(THEMA_EMAIL)}` +
      `&body=${encodeURIComponent(soma)}`;

    window.location.href = dieuthynsi;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSfalma('');

    if (!onoma.trim()) {
      setSfalma('Συμπληρώστε το όνομά σας, για να ξέρουμε πώς να σας απευθυνθούμε.');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setSfalma('Γράψτε ολόκληρη τη διεύθυνση του email σας, μαζί με το @ και την κατάληξη.');
      return;
    }
    if (minima.trim().length < 10) {
      setSfalma('Γράψτε λίγα λόγια για το τι χρειάζεστε, ώστε να σας απαντήσουμε σωστά.');
      return;
    }

    apostoliMinimatos();
    setEstalthike(true);
  };

  return (
    <div className="ct-page">
      <div className="ct-inner">

        <header className="ct-header">
          <p className="ct-eyebrow">ΕΠΙΚΟΙΝΩΝΙΑ</p>
          <h1 className="ct-title">Πώς μπορούμε να βοηθήσουμε</h1>

          {/* Δύο στήλες, στο ίδιο πλάτος με το πλέγμα από κάτω,
              ώστε να μη μακραίνει η σελίδα. */}
          <div className="ct-header-cols">
            <p className="ct-subtitle">
              Απαντάμε σε ερωτήσεις για την υπηρεσία: πώς συμπληρώνεται κάποιο πεδίο, τι
              στοιχεία χρειάζονται, τι περιλαμβάνει η έκθεση, θέματα πληρωμής και παραλαβής.
            </p>
            <p className="ct-note">
              Γράψτε μας ελεύθερα. Αν η ερώτηση δεν αφορά όσα καλύπτουμε, θα λάβετε ένα σύντομο
              τυποποιημένο μήνυμα ότι το θέμα είναι εκτός αντικειμένου.
            </p>
          </div>
        </header>

        <div className="ct-grid">

          {/* ── Στήλη 1: η φόρμα ── */}
          <section className="ct-card">
            {!estalthike ? (
              <form onSubmit={handleSubmit} noValidate>
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-onoma">Ονοματεπώνυμο</label>
                  <input
                    id="ct-onoma"
                    type="text"
                    className="ct-input"
                    value={onoma}
                    onChange={(e) => setOnoma(e.target.value)}
                    placeholder="Το όνομά σας"
                    autoComplete="name"
                  />
                </div>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-email">Email</label>
                  <input
                    id="ct-email"
                    type="email"
                    className="ct-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="onoma@example.gr"
                    autoComplete="email"
                  />
                  <p className="ct-field-hint">Εκεί θα σας απαντήσουμε.</p>
                </div>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-minima">Το μήνυμά σας</label>
                  <textarea
                    id="ct-minima"
                    rows="6"
                    className="ct-input ct-textarea"
                    value={minima}
                    onChange={(e) => setMinima(e.target.value)}
                    placeholder="Γράψτε εδώ την ερώτησή σας"
                  />
                </div>

                {sfalma && (
                  <div className="ct-notice ct-notice--error" role="alert">
                    <IconAlert className="ct-icon" />
                    <div>
                      <p className="ct-notice-title">Λείπει κάτι</p>
                      <p>{sfalma}</p>
                    </div>
                  </div>
                )}

                <button type="submit" className="ct-submit">Αποστολή μηνύματος</button>

                <p className="ct-form-foot">
                  Με το πάτημα του κουμπιού ανοίγει το πρόγραμμα αλληλογραφίας σας, με το μήνυμα
                  ήδη συμπληρωμένο. Αν δεν ανοίξει, στείλτε μας email απευθείας.
                </p>
              </form>
            ) : (
              <div className="ct-sent">
                <IconCheck className="ct-sent-icon" />
                <h2 className="ct-sent-title">Το μήνυμά σας είναι έτοιμο</h2>
                <p>
                  Θα πρέπει να άνοιξε το πρόγραμμα αλληλογραφίας σας με το μήνυμα συμπληρωμένο.
                  Πατήστε αποστολή εκεί για να μας φτάσει.
                </p>
                <p>
                  Αν δεν άνοιξε τίποτα, στείλτε το μήνυμά σας στη διεύθυνση:
                </p>
                <a className="ct-email-link" href={`mailto:${EMAIL_EPIKOINONIAS}`}>
                  {EMAIL_EPIKOINONIAS}
                </a>
                <button type="button" className="ct-again" onClick={() => setEstalthike(false)}>
                  Σύνταξη νέου μηνύματος
                </button>
              </div>
            )}
          </section>

          {/* ── Στήλη 2: πλαϊνές πληροφορίες ── */}
          <aside className="ct-side">

            <div className="ct-card">
              <p className="ct-side-title">
                <IconMail className="ct-icon-sm" />
                Απευθείας email
              </p>
              <a className="ct-email-link" href={`mailto:${EMAIL_EPIKOINONIAS}`}>
                {EMAIL_EPIKOINONIAS}
              </a>
              <p className="ct-side-note">Αν προτιμάτε να γράψετε από το δικό σας πρόγραμμα.</p>
            </div>

            <div className="ct-card">
              <p className="ct-side-title">Συχνά μας ρωτούν για</p>
              <ul className="ct-themes">
                {THEMATA.map(({ Icon, titlos, keimeno }) => (
                  <li key={titlos}>
                    <span className="ct-theme-icon"><Icon /></span>
                    <div>
                      <p className="ct-theme-title">{titlos}</p>
                      <p className="ct-theme-text">{keimeno}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ct-card ct-security">
              <p className="ct-side-title">
                <IconShield className="ct-icon-sm" />
                Ασφάλεια στοιχείων
              </p>
              <p className="ct-side-note">
                Μη στέλνετε ΑΜΚΑ, ΑΦΜ, κωδικούς Taxisnet ή άλλα ευαίσθητα στοιχεία μέσα από τη
                φόρμα. Δεν τα χρειαζόμαστε για να σας απαντήσουμε.
              </p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
