import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ReportGuidePage.css';
import { isPaidServiceLive } from '../config/paidService';
import PaidServiceNotice from '../components/paid-service/PaidServiceNotice';

/* ------------------------------------------------------------------
   ΡΥΘΜΙΣΕΙΣ — αλλάζουν εδώ, χωρίς να πειραχτεί το υπόλοιπο αρχείο
   ------------------------------------------------------------------ */

// Μέγιστος χρόνος παράδοσης, σε εργάσιμες ημέρες.
// Αλλάζει ανάλογα με τον φόρτο. Όποιος πλήρωσε βλέποντας Χ, δικαιούται Χ.
const XRONOS_PARADOSIS = 10;

// Τιμή υπηρεσίας.
const TIMI = '20 €';

// Διαδρομές
const DIADROMES = {
  apostoli: '/premium-upload',
  odigosPdf: '/pdf-guide'
};

/* ------------------------------------------------------------------
   ΠΕΡΙΕΧΟΜΕΝΟ
   ------------------------------------------------------------------ */

const guideSections = [
  { id: 'episkopisi', label: 'Παρουσίαση' },
  { id: 'ekthesi', label: 'Τι θα παραλάβετε' },
  { id: 'ypiresia', label: 'Πώς σας βοηθά' },
  { id: 'diadikasia', label: 'Διαδικασία και κόστος' },
  { id: 'stoixeia', label: 'Τι χρειαζόμαστε' },
];

const VIMATA = isPaidServiceLive ? [
  { title: 'Δημιουργείτε την αίτησή σας', text: 'Στέλνετε τα έγγραφα που ήδη διαθέτετε. Με την πρώτη επιτυχή υποβολή δημιουργείται η αίτησή σας για Αναλυτική Έκθεση και λαμβάνετε κωδικό αίτησης για να παρακολουθείτε την πορεία της.' },
  { title: 'Ελέγχουμε τον φάκελό σας', text: 'Εξετάζουμε τα στοιχεία που μας στείλατε και σας ενημερώνουμε αν χρειάζεται κάτι επιπλέον. Τα συμπληρωματικά έγγραφα προστίθενται στην ίδια αίτηση.' },
  { title: 'Προχωράτε στην πληρωμή', text: 'Πληρώνετε αφού ολοκληρωθεί ο αρχικός έλεγχος και επιβεβαιωθεί ότι η αίτηση μπορεί να προχωρήσει.' },
  { title: 'Ετοιμάζουμε την Αναλυτική Έκθεση', text: 'Επεξεργαζόμαστε τα διαθέσιμα στοιχεία και συντάσσουμε την Έκθεση με τα αποτελέσματα και τις επεξηγήσεις της εκτίμησης.' },
  { title: 'Παραλαμβάνετε την Έκθεση', text: 'Όταν η Έκθεση είναι έτοιμη, ενημερώνεστε με email και μπορείτε να τη βρείτε στην «Παρακολούθηση αίτησης».' },
] : [
  { title: 'Δημιουργία αίτησης', text: 'Μετά την ενεργοποίηση της online υπηρεσίας, θα μπορείτε να στείλετε τα έγγραφά σας για να δημιουργηθεί η αίτησή σας για Αναλυτική Έκθεση και να λάβετε κωδικό αίτησης.' },
  { title: 'Έλεγχος φακέλου', text: 'Θα ελέγχουμε αν υπάρχουν τα απαραίτητα στοιχεία και θα επικοινωνούμε μαζί σας για τυχόν ελλείψεις.' },
  { title: 'Εφάπαξ χρέωση, χωρίς συνδρομή', text: 'Η πληρωμή θα ακολουθεί τον έλεγχο του φακέλου. Η τελική τιμή και οι όροι θα είναι σαφείς πριν από την παραγγελία.' },
  { title: 'Προετοιμασία της έκθεσης', text: `Η προβλεπόμενη παράδοση θα γίνεται το αργότερο εντός ${XRONOS_PARADOSIS} εργάσιμων ημερών από την πληρωμή.` },
  { title: 'Παράδοση', text: 'Η έκθεση θα αποστέλλεται με email και θα είναι διαθέσιμη στη σελίδα παρακολούθησης της αίτησης.' },
];

const EKTHESI_PERIECHOMENO = [
  { title: 'Ανάλυση της κύριας σύνταξης', text: 'Χωριστή παρουσίαση της εθνικής και της ανταποδοτικής σύνταξης, ώστε να βλέπετε πώς διαμορφώνεται το εκτιμώμενο ποσό.' },
  { title: 'Εκτίμηση επικουρικής σύνταξης', text: 'Όπου υπάρχει επικουρική ασφάλιση και είναι διαθέσιμα τα απαραίτητα στοιχεία, παρουσιάζεται χωριστά η αντίστοιχη εκτίμηση.' },
  { title: 'Κρατήσεις και εκτιμώμενο ποσό πριν από φόρο', text: 'Παρουσιάζουμε τις κρατήσεις που περιλαμβάνει η εκτίμηση και το ποσό που προκύπτει μετά από αυτές, πριν από τον φόρο εισοδήματος. Ο φόρος εισοδήματος δεν περιλαμβάνεται στην εκτίμηση.' },
  { title: 'Στοιχεία και παραδοχές', text: 'Ξεχωρίζουμε τα στοιχεία των εγγράφων, όσα μας δηλώνετε και τις παραδοχές που χρησιμοποιούνται στην εκτίμηση. Όταν εξετάζονται μελλοντικά σενάρια, αναφέρονται οι υποθέσεις στις οποίες βασίζονται.' },
];

/* ------------------------------------------------------------------ */

const ReportGuidePage = () => {
  const [activeSection, setActiveSection] = useState('episkopisi');

  useEffect(() => {
    let frame;
    const updateActiveSection = () => {
      // Match the anchor offset below the existing sticky site navbar.
      let current = guideSections[0].id;
      const offset = (document.querySelector('.navbar')?.getBoundingClientRect().height || 0) + 24;
      for (const { id } of guideSections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      setActiveSection(current);
      frame = undefined;
    };
    const scheduleUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateActiveSection);
    };
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const navigationLinks = (compact = false) => (
    <ul className="rg-nav-list">
      {guideSections.map(({ id, label }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={activeSection === id ? 'location' : undefined}
            onClick={compact ? (event) => {
              event.currentTarget.closest('details').open = false;
            } : undefined}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="rg-page">
      <div className="rg-container">
        <aside className="rg-sidebar" aria-label="Οδηγός Αναλυτικής Έκθεσης">
          <div className="rg-sidebar-heading">
            <div className="rg-eyebrow">ΟΔΗΓΟΣ ΥΠΗΡΕΣΙΑΣ</div>
            <p>Αναλυτική Έκθεση</p>
          </div>
          <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks()}</nav>
        </aside>

        <div className="rg-content">
          {!isPaidServiceLive && (
            <PaidServiceNotice>
              Η Αναλυτική Έκθεση δεν είναι ακόμη διαθέσιμη για online παραγγελία.
              Αν θέλετε να μας περιγράψετε την περίπτωσή σας ή να ενημερωθείτε για τη
              διαθεσιμότητα της υπηρεσίας, μπορείτε να επικοινωνήσετε μαζί μας.
            </PaidServiceNotice>
          )}
          <details className="rg-mobile-nav">
            <summary>Σε αυτή τη σελίδα</summary>
            <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks(true)}</nav>
          </details>

          <section className="rg-hero" id="episkopisi" tabIndex={-1}>
            <div className="rg-eyebrow">ΟΔΗΓΟΣ ΥΠΗΡΕΣΙΑΣ</div>
            <h1>Αναλυτική Έκθεση για τη σύνταξή σας</h1>
            <p className="rg-lead">Μια αναλυτική εκτίμηση του ποσού της σύνταξής σας, με επεξηγήσεις και, όπου εφαρμόζεται, σύγκριση διαφορετικών σεναρίων συνταξιοδότησης.</p>
          </section>

          <section className="rg-section" id="ekthesi" tabIndex={-1}>
            <h2>Τι θα παραλάβετε</h2>
            <p className="rg-lead">Μια προσωπική έκθεση σε PDF, με κατανοητή παρουσίαση των αποτελεσμάτων της εκτίμησης.</p>
            <div className="rg-report-list">
              {EKTHESI_PERIECHOMENO.map(item => (
                <article key={item.title} className="rg-report-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rg-section" id="ypiresia" tabIndex={-1}>
            <h2>Σε τι μπορεί να σας βοηθήσει</h2>
            <div className="rg-copy">
              <p>Να κατανοήσετε πώς διαμορφώνεται το εκτιμώμενο ποσό και πώς μπορεί να επηρεάζεται από διαφορετικό χρόνο συνταξιοδότησης ή άλλες επιλογές.</p>
            </div>
            <ul className="rg-benefits">
              <li>Σύγκριση διαφορετικών σεναρίων συνταξιοδότησης, όπου εφαρμόζονται στην περίπτωσή σας.</li>
              <li>Εξέταση σύνθετων περιπτώσεων, όπως ασφάλιση σε διαφορετικά ταμεία και παράλληλη ασφάλιση.</li>
              <li>Μελλοντικές προβολές, όταν αποτελούν μέρος της εξέτασης της περίπτωσής σας.</li>
            </ul>
            <div className="rg-copy rg-copy-spaced">
              <p>Οι δυνατότητες της ανάλυσης εξαρτώνται από την περίπτωσή σας και από τα διαθέσιμα στοιχεία.</p>
            </div>
          </section>

          <section className="rg-section" id="diadikasia" tabIndex={-1}>
            <h2>Πώς γίνεται και πόσο κοστίζει</h2>
            <div className="rg-block rg-block-warm rg-block-tight rg-cost-summary rg-copy">
              <p>{isPaidServiceLive
                ? 'Η χρέωση είναι ' + TIMI + ' εφάπαξ. Η πληρωμή γίνεται μετά τον αρχικό έλεγχο του φακέλου. Η Έκθεση παραδίδεται το αργότερο εντός ' + XRONOS_PARADOSIS + ' εργάσιμων ημερών από την πληρωμή.'
                : 'Η online παραγγελία και η πληρωμή δεν είναι ακόμη διαθέσιμες. Η πληρωμή θα ακολουθεί τον έλεγχο του φακέλου. Η τελική τιμή και οι όροι θα είναι σαφείς πριν από την παραγγελία.'}</p>
            </div>
            <ol className="rg-steps">
              {VIMATA.map(vima => (
                <li key={vima.title} className="rg-step">
                  <div className="rg-step-title">{vima.title}</div>
                  <p>{vima.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rg-section" id="stoixeia" tabIndex={-1}>
            <h2>Τι χρειαζόμαστε για να ξεκινήσετε</h2>
            <p className="rg-lead">Το ασφαλιστικό σας ιστορικό και όσα σχετικά στοιχεία ήδη διαθέτετε.</p>
            <div className="rg-block rg-block-cool rg-copy">
              <p>Το ασφαλιστικό ιστορικό σας σε PDF, όπως το κατεβάζετε από τον e-ΕΦΚΑ.</p>
              <p><Link className="rg-pdf-help" to={DIADROMES.odigosPdf}>Δεν έχετε το PDF; Δείτε πώς θα το κατεβάσετε από τον e-ΕΦΚΑ →</Link></p>
            </div>
            <div className="rg-block rg-block-warm rg-copy">
              <p>Όσα σχετικά έγγραφα διαθέτετε για χρόνο ασφάλισης, εργασία, αποδοχές ή εισφορές.</p>
              <p>Στοιχεία για το πού και πότε εργαστήκατε, ιδιαίτερα για περιόδους που δεν εμφανίζονται στο ιστορικό.</p>
            </div>
            <div className="rg-highlight">
              {!isPaidServiceLive && 'Μετά την ενεργοποίηση της υπηρεσίας: '}
              Δεν χρειάζεται να συγκεντρώσετε επιπλέον έγγραφα πριν στείλετε όσα ήδη διαθέτετε. Αν από τον έλεγχο προκύψει ότι λείπουν απαραίτητα στοιχεία για την εκτίμηση, θα σας ενημερώσουμε ποια χρειάζονται.
            </div>
          </section>

          <section className="rg-cta">
            <div className="rg-eyebrow rg-eyebrow-light">ΕΠΟΜΕΝΟ ΒΗΜΑ</div>
            <h2>{isPaidServiceLive ? 'Ξεκινήστε την αίτησή σας' : 'Ενδιαφέρεστε για την Αναλυτική Έκθεση;'}</h2>
            <p>{isPaidServiceLive
              ? 'Στείλτε τα έγγραφα που διαθέτετε. Ο αρχικός έλεγχος του φακέλου προηγείται της πληρωμής.'
              : 'Περιγράψτε μας την περίπτωσή σας ή ρωτήστε μας για τη διαθεσιμότητα της υπηρεσίας.'}</p>
            <div className="rg-cta-actions">
              <Link to={isPaidServiceLive ? DIADROMES.apostoli : '/contact'} className="rg-button rg-button-primary">
                {isPaidServiceLive ? 'Ξεκινήστε αίτηση' : 'Επικοινωνήστε μαζί μας'}
              </Link>
            </div>
          </section>
          <aside className="rg-note">Η Αναλυτική Έκθεση αποτελεί εκτίμηση βάσει των διαθέσιμων στοιχείων και δεν είναι επίσημη απόφαση του e-ΕΦΚΑ.</aside>
          <p className="rg-faq-help">Για τη διατήρηση και τη διαγραφή των αρχείων σας, δείτε τις <Link to="/enimerosi/sychnes-erotiseis#faq-report-retention">Συχνές ερωτήσεις</Link> και την <Link to="/privacy">Πολιτική Απορρήτου</Link>.</p>

        </div>
      </div>
    </main>
  );
};

export default ReportGuidePage;
