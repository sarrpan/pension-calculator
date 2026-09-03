import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PremiumUploadPage.css';
import { anevasmaAitisis } from '../services/stripe/premiumService';
// ΓΡΑΜΜΗ ΔΟΚΙΜΩΝ 1 από 4 — σβήνεται μαζί με το αρχείο dokimastikiApostoli.jsx
import { DOKIMASTIKI_LEITOURGIA, dokimastikoAnevasma, DokimastikiPliromi } from '../services/stripe/dokimastikiApostoli';

/* ══════════════════════════════════════════════════════════════
   ΡΥΘΜΙΣΕΙΣ

   Πρέπει να συμφωνούν με το ReportGuidePage.jsx. Αν αλλάξει κάτι
   εκεί, αλλάζει και εδώ.
   ══════════════════════════════════════════════════════════════ */
const TIMI = '20 €';
const XRONOS_PARADOSIS = 10;          // εργάσιμες ημέρες
const MEGISTA_ARCHEIA = 10;
const MEGISTO_SYNOLO_MB = 50;         // συνολικά, όχι ανά αρχείο

const MEGISTO_SYNOLO = MEGISTO_SYNOLO_MB * 1024 * 1024;

/* Διαδρομές. ΝΑ ΕΠΙΒΕΒΑΙΩΘΕΙ ότι το '/privacy' είναι η πραγματική
   διαδρομή της Πολιτικής Απορρήτου στο App.jsx. */
const DIADROMES = {
  aporrito: '/privacy',
  parakolouthisi: '/report-recovery',
  epikoinonia: '/contact',
};

/* Τι δέχεται η φόρμα. Τα HEIC των iPhone μετατρέπονται μόνα τους σε
   JPEG κατά την επιλογή, οπότε σπάνια φτάνουν ως έχουν. */
const APODEKTOI_TYPOI = ['application/pdf', 'image/jpeg', 'image/png'];
const APODEKTA_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

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

const IconImage = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 5-5 4 4 3-3 4 4" />
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

const IconPlus = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const IconCopy = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a1 1 0 0 1 1-1h9" />
  </svg>
);

const IconClock = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

/* ────────────────────────────────────────────── */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatSize = (bytes) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const einaiEikona = (typos) => typos === 'image/jpeg' || typos === 'image/png';

/* Χαλαρός έλεγχος τηλεφώνου: μετράμε μόνο ψηφία, ώστε να περνούν
   και οι μορφές με κενά, παύλες ή +30. */
const psifia = (timi) => String(timi).replace(/\D/g, '');

const PremiumUploadPage = () => {
  const [email, setEmail] = useState('');
  const [tilefono, setTilefono] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proodos, setProodos] = useState(null);
  const [generatedPin, setGeneratedPin] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const successRef = useRef(null);
  const inputProsthikis = useRef(null);

  const emailIsValid = EMAIL_PATTERN.test(email.trim());
  const tilefonoIsValid = tilefono.trim() === '' || psifia(tilefono).length >= 8;
  const synolikoMegethos = files.reduce((s, f) => s + f.size, 0);

  const canContinue = emailIsValid && tilefonoIsValid && files.length > 0 && isConfirmed;

  const requirements = [
    { id: 'email', label: 'Το email σας για την παράδοση', done: emailIsValid },
    { id: 'files', label: 'Τουλάχιστον ένα αρχείο', done: files.length > 0 },
    { id: 'confirm', label: 'Η συναίνεση για την επεξεργασία των εγγράφων', done: isConfirmed },
  ];

  useEffect(() => {
    if (generatedPin && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPin]);

  /* ── Διαχείριση αρχείων ── */
  const prosthikiArxeion = (epilegmena) => {
    const nea = Array.from(epilegmena || []);
    if (!nea.length) return;

    setError('');

    const trexonta = [...files];
    const aporrifthenta = [];

    for (const arxeio of nea) {
      if (!APODEKTOI_TYPOI.includes(arxeio.type)) {
        aporrifthenta.push(arxeio.name);
        continue;
      }
      const yparxei = trexonta.some((x) => x.name === arxeio.name && x.size === arxeio.size);
      if (yparxei) continue;
      trexonta.push(arxeio);
    }

    if (trexonta.length > MEGISTA_ARCHEIA) {
      setError(`Η φόρμα δέχεται έως ${MEGISTA_ARCHEIA} αρχεία. Αφαιρέστε κάποια ή στείλτε τα υπόλοιπα με νέα αίτηση.`);
      return;
    }

    const synolo = trexonta.reduce((s, f) => s + f.size, 0);
    if (synolo > MEGISTO_SYNOLO) {
      setError(`Τα αρχεία ξεπερνούν συνολικά τα ${MEGISTO_SYNOLO_MB} MB (${formatSize(synolo)}). Αν έχετε φωτογραφίες, μια σάρωση σε ένα PDF πιάνει πολύ λιγότερο χώρο.`);
      return;
    }

    setFiles(trexonta);

    if (aporrifthenta.length) {
      setError(`Δεν έγιναν δεκτά: ${aporrifthenta.join(', ')}. Στείλτε αρχεία PDF, JPG ή PNG.`);
    }
  };

  const handleFileChange = (e) => {
    prosthikiArxeion(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    prosthikiArxeion(e.dataTransfer.files);
  };

  const afairesiArxeiou = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setError('');
  };

  /* ── Υποβολή ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailIsValid) {
      setError('Συμπληρώστε ένα έγκυρο email. Εκεί θα σας ενημερώσουμε για τη συνέχεια.');
      return;
    }
    if (!tilefonoIsValid) {
      setError('Το τηλέφωνο δεν φαίνεται σωστό. Διορθώστε το ή αφήστε το πεδίο κενό.');
      return;
    }
    if (!files.length) {
      setError('Επιλέξτε τουλάχιστον ένα αρχείο.');
      return;
    }
    if (!isConfirmed) {
      setError('Χρειάζεται η συναίνεσή σας για την επεξεργασία των εγγράφων.');
      return;
    }

    setIsSubmitting(true);
    setProodos({ trexon: 1, synolo: files.length });

    // ΓΡΑΜΜΗ ΔΟΚΙΜΩΝ 2 από 4 — σβήνεται και μένει σκέτο: const apostoli = anevasmaAitisis;
    const apostoli = DOKIMASTIKI_LEITOURGIA ? dokimastikoAnevasma : anevasmaAitisis;

    const apotelesma = await apostoli(
      { email: email.trim(), tilefono: tilefono.trim() },
      files,
      (trexon, synolo) => setProodos({ trexon, synolo })
    );

    setIsSubmitting(false);
    setProodos(null);

    if (!apotelesma.success) {
      setError(apotelesma.error);
      return;
    }

    setGeneratedPin(apotelesma.pin);
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

  /* ══════════════════════════════════════════════
     ΟΘΟΝΗ ΕΠΙΤΥΧΙΑΣ
     ══════════════════════════════════════════════ */
  if (generatedPin) {
    const pinNumber = String(generatedPin).replace(/^PIN-/i, '');

    return (
      <div className="pu-wrapper" ref={successRef}>
        <div className="pu-inner">
          <header className="pu-header">
            <p className="pu-eyebrow">ΑΠΟΣΤΟΛΗ ΕΓΓΡΑΦΩΝ</p>
            <h1 className="pu-title">Τα έγγραφά σας παραλήφθηκαν</h1>
            <p className="pu-subtitle">
              Θα τα ελέγξουμε και θα επικοινωνήσουμε μαζί σας στο <strong>{email.trim()}</strong>.
              Δεν χρειάζεται να κάνετε κάτι άλλο τώρα.
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
                  Εμφανίζεται μόνο σε αυτή την οθόνη. Με αυτόν βλέπετε την πορεία της
                  αίτησής σας και, αργότερα, παραλαμβάνετε την έκθεση.
                </p>
              </div>
            </div>
          </section>

          <section className="pu-card">
            <h2 className="pu-card-title">Τι ακολουθεί</h2>
            <ol className="pu-next-steps">
              <li>
                Ελέγχουμε τον φάκελο. Αν λείπουν στοιχεία, σας γράφουμε τι ακριβώς
                χρειάζεται και πού μπορείτε να το βρείτε.
              </li>
              <li>
                Μόλις επιβεβαιωθεί ότι ο φάκελος επαρκεί, σας στέλνουμε τον τρόπο
                πληρωμής των {TIMI}.
              </li>
              <li>
                Η έκθεση ετοιμάζεται το αργότερο εντός {XRONOS_PARADOSIS} εργάσιμων
                ημερών από την πληρωμή και παραδίδεται με email και στη σελίδα
                Παρακολούθησης.
              </li>
            </ol>

            <div className="pu-actions">
              <Link to={DIADROMES.parakolouthisi} className="pu-btn-primary">
                Παρακολούθηση αίτησης
              </Link>
              <Link to={DIADROMES.epikoinonia} className="pu-btn-secondary">
                Επικοινωνία
              </Link>
            </div>

            <p className="pu-hint">
              Στη σελίδα παρακολούθησης συμπληρώνετε μόνο τον αριθμό <strong>{pinNumber}</strong> — το
              «PIN-» υπάρχει ήδη στο πεδίο.
            </p>
          </section>

          {/* ΓΡΑΜΜΗ ΔΟΚΙΜΩΝ 3 από 4 — σβήνεται ολόκληρο το section από κάτω */}
          {DOKIMASTIKI_LEITOURGIA && (
            <section className="pu-card">
              <h2 className="pu-card-title">Προεπισκόπηση φόρμας πληρωμής</h2>
              <p className="pu-hint" style={{ marginTop: 0 }}>
                Δεν εμφανίζεται στους πελάτες. Στην κανονική υπηρεσία η φόρμα αυτή
                θα βρίσκεται στη σελίδα Παρακολούθησης Αίτησης, όταν ο φάκελος
                ελεγχθεί. Δοκιμαστική κάρτα: 4242 4242 4242 4242, οποιαδήποτε
                μελλοντική ημερομηνία, οποιοδήποτε CVC.
              </p>
              <DokimastikiPliromi />
            </section>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     ΚΥΡΙΑ ΣΕΛΙΔΑ
     ══════════════════════════════════════════════ */
  return (
    <div className="pu-wrapper">
      <div className="pu-inner">
        {/* ΓΡΑΜΜΗ ΔΟΚΙΜΩΝ 4 από 4 — σβήνεται ολόκληρο το πλαίσιο προειδοποίησης */}
        {DOKIMASTIKI_LEITOURGIA && (
          <div className="pu-notice pu-notice--error">
            <IconAlert className="pu-icon" />
            <div>
              <p className="pu-notice-title">Δοκιμαστική λειτουργία</p>
              <p>
                Τα αρχεία ΔΕΝ ανεβαίνουν. Η αίτηση καταχωρείται κανονικά στη βάση,
                με ψεύτικες διαδρομές αρχείων. Ορατό μόνο σε αυτή την οθόνη.
              </p>
            </div>
          </div>
        )}

        <header className="pu-header">
          <p className="pu-eyebrow">ΑΠΟΣΤΟΛΗ ΕΓΓΡΑΦΩΝ</p>
          <h1 className="pu-title">Στείλτε τα έγγραφά σας</h1>
          <p className="pu-subtitle">
            Ό,τι δείχνει πού και πόσο εργαστήκατε. Θα δούμε τι υπάρχει και τι
            λείπει, και θα σας ενημερώσουμε πριν πληρώσετε.
          </p>
        </header>

        {/* ── Η ροή, με την τιμή ── */}
        <section className="pu-card pu-order">
          <div className="pu-order-head">
            <div>
              <h2 className="pu-order-title">Αναλυτική έκθεση σύνταξης</h2>
              <p className="pu-order-sub">Πληρωμή αφού ελεγχθεί ο φάκελός σας</p>
            </div>
            <div className="pu-price">
              <span className="pu-price-amount">{TIMI}</span>
              <span className="pu-price-note">εφάπαξ</span>
            </div>
          </div>

          <ul className="pu-order-list">
            <li><IconCheck className="pu-icon-sm" />Στέλνετε τα έγγραφά σας και παίρνετε κωδικό παρακολούθησης</li>
            <li><IconCheck className="pu-icon-sm" />Ελέγχουμε τον φάκελο και σας λέμε αν λείπει κάτι</li>
            <li><IconCheck className="pu-icon-sm" />Πληρώνετε μόνο εφόσον ο φάκελος επαρκεί</li>
          </ul>

          <p className="pu-order-foot">
            <IconClock className="pu-icon-sm" />
            Σε αυτό το βήμα δεν ζητούνται στοιχεία κάρτας. Η έκθεση ετοιμάζεται το
            αργότερο εντός {XRONOS_PARADOSIS} εργάσιμων ημερών από την πληρωμή.
          </p>
        </section>

        {/* ── Η φόρμα ── */}
        <section className="pu-card">
          <h2 className="pu-card-title">Τα στοιχεία σας</h2>

          <form onSubmit={handleSubmit} className="pu-form" noValidate>
            <div className="pu-field">
              <label className="pu-label" htmlFor="pu-email">Email</label>
              <input
                id="pu-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="π.χ. onoma@mail.com"
                className="pu-input"
                autoComplete="email"
              />
              <p className="pu-field-hint">
                Εκεί θα σας ενημερώσουμε για τον φάκελο και εκεί θα σταλεί η έκθεση.
              </p>
            </div>

            <div className="pu-field">
              <label className="pu-label" htmlFor="pu-tel">
                Τηλέφωνο <span className="pu-optional">προαιρετικό</span>
              </label>
              <input
                id="pu-tel"
                type="tel"
                value={tilefono}
                onChange={(e) => setTilefono(e.target.value)}
                placeholder="π.χ. 6941234567"
                className="pu-input"
                autoComplete="tel"
                inputMode="tel"
              />
              <p className="pu-field-hint">
                Μόνο αν προτιμάτε να σας πάρουμε τηλέφωνο όταν χρειάζεται διευκρίνιση.
                Δεν χρησιμοποιείται για τίποτε άλλο.
              </p>
            </div>

            {/* ── Αρχεία ── */}
            <div className="pu-field">
              <span className="pu-label">
                Τα έγγραφά σας (PDF, JPG ή PNG — έως {MEGISTA_ARCHEIA} αρχεία, συνολικά {MEGISTO_SYNOLO_MB} MB)
              </span>

              {files.length === 0 ? (
                <label
                  className={`pu-drop ${isDragging ? 'is-dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept={APODEKTA_ACCEPT}
                    multiple
                    onChange={handleFileChange}
                    className="pu-visually-hidden"
                  />
                  <IconFile className="pu-drop-icon" />
                  <span className="pu-drop-main">Επιλογή αρχείων</span>
                  <span className="pu-drop-sub">ή σύρετέ τα εδώ</span>
                </label>
              ) : (
                <>
                  <ul className="pu-file-list">
                    {files.map((arxeio, index) => (
                      <li className="pu-file" key={`${arxeio.name}-${arxeio.size}-${index}`}>
                        {einaiEikona(arxeio.type)
                          ? <IconImage className="pu-file-icon" />
                          : <IconFile className="pu-file-icon" />}
                        <div className="pu-file-meta">
                          <p className="pu-file-name">{arxeio.name}</p>
                          <p className="pu-file-size">{formatSize(arxeio.size)}</p>
                        </div>
                        <button
                          type="button"
                          className="pu-file-remove"
                          onClick={() => afairesiArxeiou(index)}
                        >
                          <IconTrash className="pu-icon-sm" />
                          Αφαίρεση
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="pu-files-foot">
                    <span className="pu-files-count">
                      {files.length} από {MEGISTA_ARCHEIA} αρχεία · {formatSize(synolikoMegethos)} από {MEGISTO_SYNOLO_MB} MB
                    </span>

                    {files.length < MEGISTA_ARCHEIA && (
                      <button
                        type="button"
                        className="pu-add-more"
                        onClick={() => inputProsthikis.current?.click()}
                      >
                        <IconPlus className="pu-icon-sm" />
                        Προσθήκη αρχείων
                      </button>
                    )}
                  </div>

                  <input
                    ref={inputProsthikis}
                    type="file"
                    accept={APODEKTA_ACCEPT}
                    multiple
                    onChange={handleFileChange}
                    className="pu-visually-hidden"
                  />
                </>
              )}

              <p className="pu-field-hint">
                Το βιογραφικό του e-ΕΦΚΑ όπως κατέβηκε, και ό,τι άλλο δείχνει χρόνο
                εργασίας ή αποδοχές. Ο ευκολότερος δρόμος για τα χαρτιά είναι μία
                σάρωση σε ένα PDF, σε οποιοδήποτε φωτοτυπείο.
              </p>
            </div>

            {/* ── Συναίνεση ── */}
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
                Συναινώ στην επεξεργασία των εγγράφων που στέλνω, για τον υπολογισμό
                της σύνταξής μου, και έχω διαβάσει την{' '}
                <Link
                  to={DIADROMES.aporrito}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Πολιτική Απορρήτου
                </Link>.
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

            <button
              type="submit"
              className="pu-btn-primary pu-btn-full"
              disabled={!canContinue || isSubmitting}
            >
              {isSubmitting ? 'Γίνεται αποστολή…' : 'Αποστολή εγγράφων'}
            </button>

            {proodos && (
              <p className="pu-progress" role="status">
                Ανεβαίνει το αρχείο {proodos.trexon} από {proodos.synolo}. Μην κλείσετε τη σελίδα.
              </p>
            )}
          </form>

          <div className="pu-security">
            <p className="pu-security-title">
              <IconShield className="pu-icon-sm" />
              Τα στοιχεία σας
            </p>
            <ul>
              <li>
                <IconLock className="pu-icon-sm" />
                Τα έγγραφα και η έκθεση φυλάσσονται για έναν χρόνο σε υπολογιστή χωρίς
                σύνδεση στο διαδίκτυο, ώστε να μπορούμε να απαντήσουμε αν προκύψουν
                απορίες όταν βγει η απόφαση του ΕΦΚΑ.
              </li>
              <li>
                <IconTrash className="pu-icon-sm" />
                Διαγραφή νωρίτερα με απλό αίτημα. Έγγραφα που δεν χρειάζονται για τον
                υπολογισμό διαγράφονται αμέσως.
              </li>
              <li>
                <IconClock className="pu-icon-sm" />
                Σε αυτό το βήμα δεν γίνεται καμία χρέωση και δεν ζητούνται στοιχεία κάρτας.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PremiumUploadPage;
