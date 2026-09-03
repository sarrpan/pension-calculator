import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/* ------------------------------------------------------------------
   ΣΤΟΙΧΕΙΑ ΕΤΑΙΡΕΙΑΣ
   Οι τιμές είναι υποθετικές. Δεν εμφανίζονται στη σελίδα όσο το
   EMFANISI_STOICHEION είναι false. Όταν οριστικοποιηθούν τα πραγματικά
   στοιχεία: συμπληρώνω τα πεδία και γυρίζω τη μεταβλητή σε true.
------------------------------------------------------------------- */
const EMFANISI_STOICHEION = false;

const STOICHEIA_ETAIREIAS = {
  eponymia: 'Επωνυμία Εταιρείας Α.Ε.',
  edra: 'Οδός Παραδείγματος 00, 50100 Κοζάνη',
  arithmosMitroou: 'Αρ. ΓΕΜΗ 000000000000',
  afm: 'ΑΦΜ 000000000',
};

/* ------------------------------------------------------------------
   ΛΟΓΟΤΥΠΟ
   Όσο το LOGOTYPO_URL είναι κενό, εμφανίζεται ένα ουδέτερο πλαίσιο
   στη θέση του. Για να μπει πραγματικό λογότυπο, βάζω τη διαδρομή
   του αρχείου, π.χ. '/img/logo.svg' (το αρχείο στον φάκελο public/img).
------------------------------------------------------------------- */
const LOGOTYPO_URL = '';

const Footer = () => {
  const etos = new Date().getFullYear();

  return (
    <footer className="ft-footer">
      <div className="container ft-grid">

        {/* ---------- Στήλη 1: ταυτότητα ---------- */}
        <div className="ft-brand">
          {LOGOTYPO_URL ? (
            <img src={LOGOTYPO_URL} alt="Υπολογισμός Σύνταξης" className="ft-logo" />
          ) : (
            <div className="ft-logo-thesi" aria-hidden="true">ΛΟΓΟΤΥΠΟ</div>
          )}

          <h4 className="ft-brand-title">Υπολογισμός Σύνταξης</h4>
          <p className="ft-brand-text">
            Ενημερωτικό εργαλείο εκτίμησης, βάσει της τρέχουσας ασφαλιστικής
            νομοθεσίας.
          </p>

          {EMFANISI_STOICHEION && (
            <address className="ft-etaireia">
              <span>{STOICHEIA_ETAIREIAS.eponymia}</span>
              <span>{STOICHEIA_ETAIREIAS.edra}</span>
              <span>{STOICHEIA_ETAIREIAS.arithmosMitroou}</span>
              <span>{STOICHEIA_ETAIREIAS.afm}</span>
            </address>
          )}
        </div>

        {/* ---------- Στήλη 2: υπηρεσίες ---------- */}
        <nav className="ft-links" aria-label="Υπηρεσίες">
          <h5 className="ft-title">Υπηρεσίες</h5>
          <ul>
            <li><Link to="/free-guide">Δωρεάν Εκτίμηση</Link></li>
            {/* Ο προορισμός είναι η σελίδα παρουσίασης, όχι η φόρμα. */}
            <li><Link to="/report-guide">Αναλυτικό Report</Link></li>
            <li><Link to="/premium-upload">Αποστολή Ιστορικού</Link></li>
            <li><Link to="/report-recovery">Παρακολούθηση Αίτησης</Link></li>
          </ul>
        </nav>

        {/* ---------- Στήλη 3: πληροφορίες ---------- */}
        <nav className="ft-links" aria-label="Πληροφορίες">
          <h5 className="ft-title">Πληροφορίες</h5>
          <ul>
            <li><Link to="/pdf-guide">Λήψη PDF από τον e-ΕΦΚΑ</Link></li>
            <li><Link to="/contact">Επικοινωνία</Link></li>
            {/* Οι δύο σελίδες δεν υπάρχουν ακόμη. Μόλις δημιουργηθούν,
                αφαιρώ τα σχόλια:
            <li><Link to="/how-it-works">Πώς υπολογίζουμε</Link></li>
            <li><Link to="/faq">Συχνές Ερωτήσεις</Link></li>
            */}
          </ul>
        </nav>

        {/* ---------- Στήλη 4: νομικά ---------- */}
        <nav className="ft-links" aria-label="Νομικά">
          <h5 className="ft-title">Νομικά</h5>
          <ul>
            <li><Link to="/terms">Όροι Χρήσης</Link></li>
            <li><Link to="/privacy">Πολιτική Απορρήτου</Link></li>
            <li><Link to="/disclaimer">Αποποίηση Ευθύνης</Link></li>
          </ul>
        </nav>

      </div>

      <div className="ft-bottom">
        <div className="container">
          <p className="ft-disclaimer">
            Τα αποτελέσματα αποτελούν εκτίμηση και δεν υποκαθιστούν την επίσημη
            απόφαση του e-ΕΦΚΑ.
          </p>
          <p className="ft-copyright">
            &copy; {etos} Υπολογισμός Σύνταξης. Με την επιφύλαξη κάθε νόμιμου
            δικαιώματος.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
