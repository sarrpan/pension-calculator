import React from 'react';
import './Features.css';

/* ══════════════════════════════════════════════════════════════
   ΕΝΔΕΙΚΤΙΚΑ ΠΟΣΑ ΤΩΝ ΓΡΑΦΙΚΩΝ

   Δεν προέρχονται από πραγματικό υπολογισμό. Είναι παράδειγμα
   για να καταλάβει ο επισκέπτης τι θα δει. Αλλάζουν από εδώ.
   ══════════════════════════════════════════════════════════════ */
const SENARIA = [
  { ilikia: '62', typos: 'Μειωμένη', poso: '664,50 €' },
  { ilikia: '65', typos: 'Μειωμένη', poso: '747,60 €' },
  { ilikia: '67', typos: 'Πλήρης', poso: '830,67 €' },
];

const Features = () => {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Τι περιλαμβάνει το αναλυτικό report</h2>

        {/* ROW 1: ΤΙ ΧΡΕΙΑΖΟΜΑΣΤΕ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΧΡΕΙΑΖΟΜΑΣΤΕ ΑΠΟ ΕΣΑΣ</span>
            <h3>Μόνο τα απαραίτητα στοιχεία</h3>
            <p>Η διαδικασία ξεκινάει με τα δικά σας δεδομένα, χωρίς περιττές ερωτήσεις.</p>
            <ul className="feature-bullets">
              <li>Το ασφαλιστικό σας ιστορικό (PDF από τον e-ΕΦΚΑ)</li>
              <li>Συμπλήρωση κενών, αν λείπουν παλιά έτη</li>
              <li>Ηλικία και συνολικός χρόνος ασφάλισης</li>
            </ul>
          </div>
          <div className="feature-visual">
            {/* Απόσπασμα της πραγματικής φόρμας, όχι placeholder */}
            <div className="ui-mockup mk-form">
              <p className="mk-caption">Απόσπασμα της φόρμας</p>
              <div className="mk-field">
                <span className="mk-label">Έτος γέννησης</span>
                <span className="mk-value">1964</span>
              </div>
              <div className="mk-field">
                <span className="mk-label">Ένσημα έως 2001</span>
                <span className="mk-value">4.320</span>
              </div>
              <div className="mk-field">
                <span className="mk-label">Μικτές αποδοχές 2024</span>
                <span className="mk-value">1.480 €</span>
              </div>
              <div className="mk-field mk-field-empty">
                <span className="mk-label">Μικτές αποδοχές 2025</span>
                <span className="mk-cursor" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: ΤΙ ΥΠΟΛΟΓΙΖΟΥΜΕ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΥΠΟΛΟΓΙΖΟΥΜΕ</span>
            <h3>Τα μεγέθη που διαμορφώνουν τη σύνταξη</h3>
            <p>Αναλύουμε τα δεδομένα σας και δείχνουμε από τι αποτελείται το ποσό.</p>
            <ul className="feature-bullets">
              <li>Εθνική και ανταποδοτική σύνταξη</li>
              <li>Επικουρική σύνταξη, αν υπάρχει</li>
              <li>Ασφαλιστικές κρατήσεις</li>
              <li>Τελικό καθαρό ποσό</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup mk-stats">
              <p className="mk-caption">Ενδεικτική ανάλυση ποσού</p>
              <div className="stat-chip">
                <span>Εθνική</span>
                <span>426,17 €</span>
              </div>
              <div className="stat-chip">
                <span>Ανταποδοτική</span>
                <span>345,50 €</span>
              </div>
              <div className="stat-chip">
                <span>Επικουρική</span>
                <span>112,00 €</span>
              </div>
              <div className="stat-chip deduction">
                <span>Κρατήσεις</span>
                <span>− 53,00 €</span>
              </div>
              <div className="stat-total">
                <span>ΤΕΛΙΚΟ ΠΟΣΟ</span>
                <span>830,67 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: ΣΕΝΑΡΙΑ ΕΞΟΔΟΥ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΣΕΝΑΡΙΑ ΕΞΕΤΑΖΟΥΜΕ</span>
            <h3>Πόσο κοστίζει να βγείτε νωρίτερα</h3>
            <p>
              Δεν αρκεί να ξέρετε πότε μπορείτε να βγείτε. Χρειάζεται να δείτε τη διαφορά στο ποσό
              για κάθε ηλικία εξόδου.
            </p>
            <ul className="feature-bullets">
              <li>Πρώτο δυνατό σημείο εξόδου</li>
              <li>Μειωμένη έναντι πλήρους σύνταξης</li>
              <li>Τι κερδίζετε αν μείνετε περισσότερο</li>
            </ul>
          </div>
          <div className="feature-visual">
            {/* Αντικαθιστά το κρυπτικό «62 ↔ 67 ↔ +5 ΕΤΗ» */}
            <div className="ui-mockup mk-scenarios">
              <p className="mk-caption">Ενδεικτική σύγκριση σεναρίων</p>
              {SENARIA.map(({ ilikia, typos, poso }) => (
                <div className="mk-scenario" key={ilikia}>
                  <span className="mk-age">{ilikia} ετών</span>
                  <span className="mk-type">{typos}</span>
                  <span className="mk-amount">{poso}</span>
                </div>
              ))}
              <p className="mk-note">Ίδιος ασφαλισμένος, τρεις ηλικίες εξόδου.</p>
            </div>
          </div>
        </div>

        {/* ROW 4: Η ΑΞΙΑ ΤΗΣ ΥΠΗΡΕΣΙΑΣ */}
        <div className="feature-row feature-row-last">
          <div className="feature-text">
            <span className="step-label">Η ΑΞΙΑ ΤΗΣ ΥΠΗΡΕΣΙΑΣ</span>
            <h3>Ξεκάθαρο αποτέλεσμα, με 20 €</h3>
            <p>Η ανάγνωση του ασφαλιστικού ιστορικού θέλει εξειδίκευση. Την αναλαμβάνουμε εμείς.</p>
            <ul className="feature-bullets">
              <li>Γλιτώνετε χρόνο και ταλαιπωρία</li>
              <li>Αποφεύγετε λάθη που κοστίζουν</li>
              <li>Λαμβάνετε αρχείο PDF στο email σας</li>
            </ul>
          </div>
          <div className="feature-visual">
            {/* Αντικαθιστά το ξεθωριασμένο «REPORT (20 €)» */}
            <div className="ui-mockup mk-report">
              <p className="mk-caption">Απόσπασμα της έκθεσης</p>
              <p className="mk-report-title">Έκθεση εκτίμησης σύνταξης</p>
              <div className="mk-report-row">
                <span>Θεμελίωση δικαιώματος</span>
                <strong>Μάρτιος 2029</strong>
              </div>
              <div className="mk-report-row">
                <span>Χρόνος ασφάλισης</span>
                <strong>36 έτη, 4 μήνες</strong>
              </div>
              <div className="mk-report-row">
                <span>Εκτιμώμενο καθαρό ποσό</span>
                <strong>830,67 €</strong>
              </div>
              <p className="mk-note">Το πλήρες αρχείο περιλαμβάνει και τη σύγκριση σεναρίων.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
