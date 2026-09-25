import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ReportGuidePage.css';

/* ------------------------------------------------------------------
   ΡΥΘΜΙΣΕΙΣ — αλλάζουν εδώ, χωρίς να πειραχτεί το υπόλοιπο αρχείο
   ------------------------------------------------------------------ */

// Μέγιστος χρόνος παράδοσης, σε εργάσιμες ημέρες.
// Αλλάζει ανάλογα με τον φόρτο. Όποιος πλήρωσε βλέποντας Χ, δικαιούται Χ.
const XRONOS_PARADOSIS = 10;

// Τιμή υπηρεσίας.
const TIMI = '20 €';

// Όρια αρχείων της φόρμας.
// ΠΡΟΣΟΧΗ: πρέπει να συμφωνούν με το PremiumUploadPage.jsx.
const MEGISTA_ARCHEIA = 10;
const MEGISTO_MEGETHOS = '50 MB';

// Διαδρομές
const DIADROMES = {
  apostoli: '/premium-upload',
  odigosPdf: '/pdf-guide'
};

/* ------------------------------------------------------------------
   ΠΕΡΙΕΧΟΜΕΝΟ
   ------------------------------------------------------------------ */

const guideSections = [
  { id: 'episkopisi', label: 'Επισκόπηση' },
  { id: 'ypiresia', label: 'Η υπηρεσία' },
  { id: 'diadikasia', label: 'Η διαδικασία' },
  { id: 'ekthesi', label: 'Τι περιλαμβάνει' },
  { id: 'stoixeia', label: 'Τι θα χρειαστείτε' },
];

const HERO_SIMEIA = [
  {
    title: 'Τι παίρνετε',
    text: 'Έκθεση εκτίμησης με ανάλυση του ποσού ανά σκέλος και, όπου εφαρμόζεται, σύγκριση διαφορετικών σεναρίων εξόδου.'
  },
  {
    title: 'Πότε πληρώνετε',
    text: 'Αφού δούμε τα έγγραφά σας και επιβεβαιώσουμε ότι μπορεί να γίνει ο υπολογισμός.'
  },
  {
    title: 'Τι κοστίζει',
    text: `${TIMI}, μία φορά. Περιλαμβάνεται και η επικοινωνία μαζί σας, αν χρειαστούν επιπλέον στοιχεία.`
  }
];

const PIGES_APODOCHON = [
  {
    title: 'Από το λογιστήριο ή την υπηρεσία σας',
    text: 'Βεβαίωση αποδοχών ανά έτος μπορεί να βοηθήσει όταν λείπουν στοιχεία από το ασφαλιστικό ιστορικό.'
  },
  {
    title: 'Από πρόγραμμα εργοδότη',
    text: 'Ορισμένοι εργοδότες παρέχουν αναλυτικές καταστάσεις αποδοχών ανά έτος ή άλλα σχετικά έντυπα μισθοδοσίας.'
  },
  {
    title: 'Από τη φορολογική σας δήλωση',
    text: 'Στοιχεία από τη φορολογική δήλωση μπορούν να χρησιμοποιηθούν συμπληρωματικά όταν είναι σχετικά. Δεν θεωρούνται αυτόματα ίδια με τις συντάξιμες αποδοχές και καταγράφεται η προέλευσή τους.'
  }
];

const VIMATA = [
  {
    title: 'Στέλνετε τα έγγραφά σας',
    text: 'Παίρνετε αμέσως κωδικό παρακολούθησης.'
  },
  {
    title: 'Ελέγχουμε τον φάκελο',
    text: 'Αν λείπουν στοιχεία, επικοινωνούμε μαζί σας.'
  },
  {
    title: `Πληρώνετε ${TIMI}`,
    text: 'Μόλις επιβεβαιώσουμε ότι υπάρχουν τα απαραίτητα στοιχεία και μπορεί να γίνει η εκτίμηση.'
  },
  {
    title: 'Ετοιμάζουμε την έκθεση',
    text: `Το αργότερο εντός ${XRONOS_PARADOSIS} εργάσιμων ημερών.`
  },
  {
    title: 'Παραδίδουμε',
    text: 'Με email και στη σελίδα Παρακολούθησης, όπου μπαίνετε με τον κωδικό σας.'
  }
];

const EKTHESI_PERIECHOMENO = [
  {
    title: 'Σενάρια εξόδου σε διαφορετικές ηλικίες',
    text: 'Αν σας ενδιαφέρουν συγκεκριμένες ηλικίες ή σενάρια, μπορείτε να τα δηλώσετε. Όπου η περίπτωση το επιτρέπει, η έκθεση συγκρίνει τις αντίστοιχες εκτιμήσεις.'
  },
  {
    title: 'Εθνική και ανταποδοτική ξεχωριστά',
    text: 'Τα δύο σκέλη της κύριας σύνταξης, αναλυμένα. Βλέπετε πώς διαμορφώνεται το εκτιμώμενο ποσό και ποια είναι τα επιμέρους σκέλη του.'
  },
  {
    title: 'Η επικουρική χωριστά',
    text: 'Όπου υπάρχει και υπάρχουν τα απαραίτητα στοιχεία, η επικουρική εκτιμάται και παρουσιάζεται ξεχωριστά από την κύρια σύνταξη.'
  },
  {
    title: 'Κρατήσεις και εκτιμώμενο πληρωτέο ποσό',
    text: 'Παρουσιάζονται οι κρατήσεις που υπολογίζονται από την υπηρεσία και το εκτιμώμενο πληρωτέο ποσό πριν από φόρο. Ο φόρος εισοδήματος δεν υπολογίζεται, καθώς εξαρτάται και από άλλα φορολογικά στοιχεία.'
  },
  {
    title: 'Διάκριση των στοιχείων',
    text: 'Τι προκύπτει από το επίσημο ιστορικό και τι από δική σας δήλωση.'
  }
];

/* ------------------------------------------------------------------ */

const ReportGuidePage = () => {
  const [activeSection, setActiveSection] = useState('episkopisi');

  useEffect(() => {
    let frame;
    const updateActiveSection = () => {
      // Match the anchor offset below the existing sticky site navbar.
      let current = guideSections[0].id;
      for (const { id } of guideSections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= 140) {
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
        <aside className="rg-sidebar" aria-label="Οδηγός Αναλυτικού Report">
          <div className="rg-sidebar-heading">
            <div className="rg-eyebrow">ΟΔΗΓΟΣ ΥΠΗΡΕΣΙΑΣ</div>
            <p>Αναλυτικό Report</p>
          </div>
          <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks()}</nav>
          <div className="rg-quick-access">
            <h2>Γρήγορη πρόσβαση</h2>
            <Link to={DIADROMES.apostoli}>Αποστολή εγγράφων</Link>
            <Link to={DIADROMES.odigosPdf}>Οδηγός λήψης PDF από τον e-ΕΦΚΑ</Link>
          </div>
        </aside>

        <div className="rg-content">
          <details className="rg-mobile-nav">
            <summary>Σε αυτή τη σελίδα</summary>
            <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks(true)}</nav>
          </details>

        {/* ---------------- HERO ---------------- */}
        <section className="rg-hero" id="episkopisi" tabIndex={-1}>
          <div className="rg-eyebrow">ΑΝΑΛΥΤΙΚΟ REPORT</div>

          <h1>Όταν το ασφαλιστικό ιστορικό δεν δείχνει όλη την εικόνα</h1>

          <p className="rg-lead">
            Το αρχείο που κατεβάζετε από τον e-ΕΦΚΑ περιλαμβάνει τα στοιχεία που είναι διαθέσιμα
            ψηφιακά. Σε ορισμένες περιπτώσεις μπορεί να λείπουν παλαιότερες περίοδοι ή να χρειάζονται
            συμπληρωματικά στοιχεία για να γίνει αξιόπιστη εκτίμηση.
          </p>

          <p className="rg-lead">
            Ελέγχουμε το ασφαλιστικό ιστορικό μαζί με τα στοιχεία που μας στέλνετε, εντοπίζουμε
            πιθανά κενά και, όπου χρειάζεται, ζητάμε συμπληρωματικά στοιχεία πριν ετοιμάσουμε
            την εκτίμηση σύνταξης.
          </p>

          <div className="rg-panel-dark">
            {HERO_SIMEIA.map((item) => (
              <div key={item.title} className="rg-panel-row">
                <div className="rg-panel-row-title">{item.title}</div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 1. Η ΥΠΗΡΕΣΙΑ ---------------- */}
        <section className="rg-section" id="ypiresia" tabIndex={-1}>
          <div className="rg-eyebrow">1. Η ΥΠΗΡΕΣΙΑ</div>
          <h2>Τι κάνουμε</h2>

          <div className="rg-copy">
            <p>
              Διαβάζουμε το ασφαλιστικό σας ιστορικό, το συνδυάζουμε με όσα μας δηλώσετε,
              ελέγχουμε για πιθανά κενά και, αν χρειάζεται, σας ζητάμε συμπληρωματικά στοιχεία.
              Με βάση τα διαθέσιμα στοιχεία ετοιμάζουμε την εκτίμηση σύνταξης.
            </p>
            <p>
              Δεν χρειάζεται να ξέρετε ποιοι κανόνες ισχύουν στην περίπτωσή σας, ούτε να
              βρείτε μόνος σας τι λείπει από το βιογραφικό σας. Στέλνετε ό,τι έχετε και
              το αναλαμβάνουμε εμείς.
            </p>
          </div>
        </section>

        {/* ---------------- 2. Η ΔΙΑΔΙΚΑΣΙΑ ---------------- */}
        <section className="rg-section" id="diadikasia" tabIndex={-1}>
          <div className="rg-eyebrow">2. Η ΔΙΑΔΙΚΑΣΙΑ</div>
          <h2>Πληρώνετε αφού δούμε τι έχουμε στα χέρια μας</h2>

          <ol className="rg-steps">
            {VIMATA.map((vima) => (
              <li key={vima.title} className="rg-step">
                <div className="rg-step-title">{vima.title}</div>
                <p>{vima.text}</p>
              </li>
            ))}
          </ol>

          <div className="rg-block rg-block-warm rg-block-tight">
            <div className="rg-copy">
              <p>
                Η δεύτερη επικοινωνία είναι κανονικό μέρος της δουλειάς, όχι ένδειξη ότι
                κάτι πήγε στραβά.
              </p>
              <p className="rg-strong-line">
                Γι' αυτό δεν ζητάμε πληρωμή πριν δούμε τον φάκελο.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- 3. Η ΕΚΘΕΣΗ ---------------- */}
        <section className="rg-section" id="ekthesi" tabIndex={-1}>
          <div className="rg-eyebrow">3. ΤΙ ΠΑΙΡΝΕΤΕ</div>
          <h2>Τι περιλαμβάνει η έκθεση</h2>

          <div className="rg-report-list">
            {EKTHESI_PERIECHOMENO.map((item) => (
              <article key={item.title} className="rg-report-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="rg-note">
            Το Αναλυτικό Report αποτελεί εκτίμηση βάσει των στοιχείων και των παραδοχών που
            χρησιμοποιήθηκαν και δεν υποκαθιστά επίσημη απόφαση του e-ΕΦΚΑ.
          </div>

          <div className="rg-copy rg-copy-spaced">
            <p>
              Η έκθεση παρουσιάζει διακριτά τα βασικά στοιχεία, τις παραδοχές και τα επιμέρους ποσά,
              ώστε να είναι σαφές πώς διαμορφώνεται η εκτίμηση.
            </p>
            <p>
              Όπου ο υπολογισμός αφορά μελλοντικά έτη, οι παραδοχές που χρησιμοποιήθηκαν
              δηλώνονται μέσα στην έκθεση.
            </p>
          </div>

          <div className="rg-retention">
            <div className="rg-retention-title">Διατήρηση στοιχείων</div>
            <p>
              Η έκθεση παραμένει διαθέσιμη online στη σελίδα Παρακολούθηση αίτησης για 2 μήνες
              από την παράδοση. Τα έγγραφα και η έκθεση διατηρούνται έως 1 έτος σε υπολογιστή χωρίς
              σύνδεση στο διαδίκτυο, ώστε να μπορούμε να απαντήσουμε αν προκύψουν απορίες.
              Μπορείτε να ζητήσετε νωρίτερη διαγραφή οποτεδήποτε.
            </p>
          </div>
        </section>

        {/* ---------------- 4. ΤΙ ΘΑ ΧΡΕΙΑΣΤΕΙΤΕ ---------------- */}
        <section className="rg-section" id="stoixeia" tabIndex={-1}>
          <div className="rg-eyebrow">4. ΤΙ ΘΑ ΧΡΕΙΑΣΤΕΙΤΕ</div>
          <h2>Τρία πράγματα</h2>

          {/* 2α — Αποδοχές */}
          <div className="rg-block rg-block-warm">
            <h3>Στοιχεία αποδοχών ή εισφορών και χρόνου ασφάλισης από το 2002</h3>

            <div className="rg-copy">
              <p>
                Για την εκτίμηση της ανταποδοτικής σύνταξης χρειαζόμαστε τα στοιχεία που αντιστοιχούν
                στην ασφαλιστική σας κατηγορία — για παράδειγμα αποδοχές και ημέρες ασφάλισης για
                μισθωτή εργασία ή ασφαλιστέο εισόδημα / εισφορές όπου αυτό εφαρμόζεται.
              </p>
              <p>
                Αν το ασφαλιστικό ιστορικό δεν περιέχει όλα τα απαιτούμενα στοιχεία ή υπάρχουν
                ασάφειες, ο έλεγχος του φακέλου δείχνει ποια συμπληρωματικά στοιχεία χρειάζονται.
              </p>
              <p className="rg-strong-line">
                Δεν χρειάζεται να τα βρείτε πριν μας γράψετε. Στείλτε πρώτα ό,τι έχετε.
                Αν λείπουν, θα σας πούμε τι ακριβώς χρειάζεται και θα σας βοηθήσουμε να
                το αναζητήσετε. Για μισθωτές περιόδους, συνήθεις συμπληρωματικές πηγές είναι:
              </p>
            </div>

            <div className="rg-sources">
              {PIGES_APODOCHON.map((pigi) => (
                <div key={pigi.title} className="rg-source">
                  <div className="rg-source-title">{pigi.title}</div>
                  <p>{pigi.text}</p>
                </div>
              ))}
            </div>

            <div className="rg-note">
              Όταν χρησιμοποιούνται στοιχεία αποδοχών, χρειαζόμαστε <strong>μικτά / ασφαλιστέα ποσά</strong>, όχι καθαρά.
            </div>

            <div className="rg-highlight">
              Αν λείπουν στοιχεία που είναι απαραίτητα για την εκτίμηση, θα σας ενημερώσουμε
              ποια χρειάζονται πριν προχωρήσει η διαδικασία.
            </div>
          </div>

          {/* 2β — Έγγραφα */}
          <div className="rg-block rg-block-cool">
            <h3>Τα έγγραφά σας</h3>

            <div className="rg-copy">
              <p>
                <strong>Το βιογραφικό του e-ΕΦΚΑ όπως κατέβηκε</strong> από την πλατφόρμα.
                Το πρωτότυπο αρχείο, όχι εκτυπωμένο και σαρωμένο ή φωτογραφημένο.
              </p>
              <p>
                <strong>Ό,τι άλλο αποδεικνύει χρόνο εργασίας ή αποδοχές:</strong> καρτέλες,
                μηχανογραφημένα δελτία, βιβλιάρια ΤΕΒΕ, βεβαιώσεις αποδοχών.
              </p>
              <p>
                Ο ευκολότερος δρόμος είναι η σάρωση. Σε οποιοδήποτε φωτοτυπείο ή βιβλιοπωλείο,
                τα χαρτιά σας γίνονται καθαρά ψηφιακά αρχεία. Η σάρωση δίνει καλύτερη
                ευκρίνεια από τη φωτογραφία και δεν δημιουργεί πρόβλημα μεγέθους.
              </p>
              <p>
                Φωτογραφίες από κινητό γίνονται δεκτές. Φροντίστε να είναι σε καλό φως,
                με ολόκληρη τη σελίδα μέσα στο κάδρο και χωρίς σκιές.
              </p>
            </div>

            <div className="rg-limit">
              Η φόρμα δέχεται έως {MEGISTA_ARCHEIA} αρχεία, συνολικά έως {MEGISTO_MEGETHOS}.
            </div>
          </div>

          {/* 2γ — Πού και πότε εργαστήκατε */}
          <div className="rg-block rg-block-cool">
            <h3>Πού και πότε εργαστήκατε</h3>

            <div className="rg-copy">
              <p>
                Στη φόρμα θα συμπληρώσετε μια σύντομη λίστα: φορέας, χρονικό διάστημα,
                είδος ενσήμων, ημέρες κατά προσέγγιση. Στο αρχικό αυτό βήμα οι ημέρες μπορούν
                να είναι κατά προσέγγιση· η εκτίμηση θα βασιστεί στα στοιχεία του φακέλου
                και σε όσα επιβεβαιωθούν.
              </p>
              <p>
                Είναι το στοιχείο που δεν βγαίνει πάντα από το αρχείο, ιδίως αν ήσασταν
                ασφαλισμένος σε δύο φορείς την ίδια περίοδο.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="rg-cta">
          <div className="rg-eyebrow rg-eyebrow-light">ΕΠΟΜΕΝΟ ΒΗΜΑ</div>
          <h2>Ξεκινήστε</h2>
          <p>
            Συγκεντρώστε ό,τι έχετε και στείλτε το. Θα ελέγξουμε αν υπάρχουν τα απαραίτητα
            στοιχεία και θα σας ενημερώσουμε πριν από οποιαδήποτε πληρωμή.
          </p>

          <div className="rg-cta-actions">
            <Link to={DIADROMES.apostoli} className="rg-button rg-button-primary">
              Αποστολή εγγράφων
            </Link>
            <Link to={DIADROMES.odigosPdf} className="rg-button rg-button-outline">
              Οδηγός λήψης PDF από τον e-ΕΦΚΑ
            </Link>
          </div>
        </section>

        </div>
      </div>
    </main>
  );
};

export default ReportGuidePage;
