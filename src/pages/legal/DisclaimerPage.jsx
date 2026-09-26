import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

/* ─────────────────────────────────────────────────────────────
   ΡΥΘΜΙΣΕΙΣ ΣΕΛΙΔΑΣ
   Ό,τι αλλάζει, αλλάζει ΜΟΝΟ εδώ.
   ───────────────────────────────────────────────────────────── */

const IMEROMINIA_ENIMEROSIS = '26/09/2026';

// ΠΡΟΣΟΧΗ: ίδιες διαδρομές με το Footer.jsx.
const DIADROMES = {
  oroi: '/terms',
  aporrito: '/privacy',
};

/* ───────────────────────────────────────────────────────────── */

const DisclaimerPage = () => {
  const enotites = [
    {
      titlos: 'Τι είναι το αποτέλεσμα που λαμβάνετε',
      periechomeno: (
        <p className="lg-lead">
          Είναι εκτίμηση που δεν υποκαθιστά επίσημη συνταξιοδοτική απόφαση και δεν δεσμεύει καμία αρχή.
        </p>
      ),
    },
    {
      titlos: 'Από τι εξαρτάται η ακρίβειά του',
      periechomeno: (
        <p>
          Η ακρίβεια εξαρτάται από την ποιότητα και πληρότητα των στοιχείων που δηλώνετε
          ή προσκομίζετε. Ελλείψεις ή λάθη μπορεί να οδηγήσουν σε διαφορετικό αποτέλεσμα.
        </p>
      ),
    },
    {
      titlos: 'Θεμελίωση συνταξιοδοτικού δικαιώματος',
      periechomeno: (
        <p>
          Η δωρεάν εκτίμηση δεν ελέγχει τη θεμελίωση συνταξιοδοτικού δικαιώματος.
          Η εμφάνιση εκτιμώμενου ποσού δεν σημαίνει ότι δικαιούστε σύνταξη.
        </p>
      ),
    },
    {
      titlos: 'Περιορισμοί της δωρεάν εκτίμησης',
      periechomeno: (
        <ul className="lg-list">
          <li>
            Έως δύο μη επικαλυπτόμενες ασφαλιστικές/εργασιακές περιόδους.
          </li>
          <li>Χωρίς παράλληλη ασφάλιση.</li>
          <li>Χωρίς μελλοντική προβολή.</li>
        </ul>
      ),
    },
    {
      titlos: 'Καμία σχέση με δημόσιο φορέα',
      periechomeno: (
        <p>
          Η υπηρεσία δεν συνδέεται, δεν συνεργάζεται και δεν έχει εγκριθεί από τον
          e-ΕΦΚΑ ή άλλη δημόσια αρχή. Δεν ζητούμε ποτέ κωδικούς Taxisnet.
        </p>
      ),
    },

    {
      titlos: 'Παραδοχές και μελλοντικές προβολές',
      periechomeno: (
        <p>
          Όπου υπάρχουν ουσιώδεις παραδοχές ή μελλοντικές προβολές, δηλώνονται μαζί με
          την εκτίμηση και διακρίνονται από τα στοιχεία επίσημων εγγράφων και τις δηλώσεις σας.
        </p>
      ),
    },
  ];

  return (
    <div className="lg-page">
      <div className="container">

        {/* ── Κεφαλίδα ── */}
        <header className="lg-header">
          <span className="lg-eyebrow">ΝΟΜΙΚΑ</span>
          <h1>Αποποίηση Ευθύνης</h1>
          <p className="lg-intro">
            Τι ακριβώς είναι το αποτέλεσμα που λαμβάνετε, από τι εξαρτάται η ακρίβειά
            του και πού σταματούν τα όριά μας.
          </p>
          <p className="lg-date">Τελευταία ενημέρωση: {IMEROMINIA_ENIMEROSIS}</p>
        </header>

        {/* ── Περίληψη σε τρεις κάρτες ── */}
        <div className="lg-grid">
          <div className="lg-card">
            <span className="lg-card-num">01</span>
            <h3>Εκτίμηση, όχι απόφαση</h3>
            <p>
              Δεσμευτική απόφαση για τη σύνταξή σας εκδίδει αποκλειστικά ο e-ΕΦΚΑ.
            </p>
          </div>

          <div className="lg-card">
            <span className="lg-card-num">02</span>
            <h3>Εξαρτάται από τα στοιχεία</h3>
            <p>
              Δεν έχουμε πρόσβαση στο μητρώο. Ό,τι λείπει από τα στοιχεία σας, λείπει
              και από το αποτέλεσμα.
            </p>
          </div>

          <div className="lg-card">
            <span className="lg-card-num">03</span>
            <h3>Ιδιωτική πρωτοβουλία</h3>
            <p>
              Καμία σχέση με δημόσιο φορέα. Δεν ζητούμε ποτέ τους κωδικούς σας
              Taxisnet.
            </p>
          </div>
        </div>

        {/* ── Περιεχόμενα ── */}
        <nav className="lg-toc" aria-label="Περιεχόμενα">
          <h2 className="lg-toc-title">Περιεχόμενα</h2>
          <ol className="lg-toc-list">
            {enotites.map((en, i) => (
              <li key={i}>
                <a href={`#apop-${i + 1}`}>
                  <span className="lg-toc-num">{i + 1}</span>
                  {en.titlos}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Κύριο κείμενο ── */}
        <div className="lg-prose">
          {enotites.map((en, i) => (
            <section key={i} id={`apop-${i + 1}`} className="lg-section">
              <h2>{i + 1}. {en.titlos}</h2>
              {en.periechomeno}
            </section>
          ))}
        </div>

        {/* ── Σύνδεσμοι στα άλλα δύο νομικά κείμενα ── */}
        <div className="lg-related">
          <span className="lg-related-label">Δείτε επίσης</span>
          <div className="lg-related-links">
            <Link to={DIADROMES.oroi}>Όροι Χρήσης</Link>
            <Link to={DIADROMES.aporrito}>Πολιτική Απορρήτου</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DisclaimerPage;
