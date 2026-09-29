import React from 'react';
import { isPaidServiceLive } from '../../../config/paidService';
import './Features.css';

/* ══════════════════════════════════════════════════════════════
   ΕΝΔΕΙΚΤΙΚΑ ΠΟΣΑ ΤΩΝ ΓΡΑΦΙΚΩΝ

   Δεν προέρχονται από πραγματικό υπολογισμό. Είναι παράδειγμα
   για να καταλάβει ο επισκέπτης τι θα δει. Αλλάζουν από εδώ.
   ══════════════════════════════════════════════════════════════ */
const SENARIA = [
  { ilikia: '62', typos: 'Μειωμένη', poso: '1.077,18 €' },
  { ilikia: '65', typos: 'Μειωμένη', poso: '1.152,79 €' },
  { ilikia: '67', typos: 'Πλήρης', poso: '1.203,20 €' },
];

const Features = () => {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Τι περιλαμβάνει το Αναλυτικό Report</h2>

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
                <span className="mk-label">Συνολικές ημέρες ασφάλισης</span>
                <span className="mk-value">10.200</span>
              </div>
              <div className="mk-field">
                <span className="mk-label">Ετήσιες μικτές αποδοχές 2024</span>
                <span className="mk-value">25.200 €</span>
              </div>
              <div className="mk-field mk-field-empty">
                <span className="mk-label">Ετήσιες μικτές αποδοχές 2025</span>
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
            <p>Αναλύουμε τα δεδομένα σας και δείχνουμε από τι αποτελείται το εκτιμώμενο ποσό.</p>
            <ul className="feature-bullets">
              <li>Εθνική και ανταποδοτική σύνταξη</li>
              <li>Επικουρική σύνταξη, αν υπάρχει</li>
              <li>Ασφαλιστικές κρατήσεις</li>
              <li>Εκτιμώμενο καθαρό ποσό</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup mk-stats">
              <p className="mk-caption">Ενδεικτική ανάλυση ποσού</p>
              <div className="stat-chip">
                <span>Εθνική</span>
                <span>446,87 €</span>
              </div>
              <div className="stat-chip">
                <span>Ανταποδοτική</span>
                <span>573,13 €</span>
              </div>
              <div className="stat-chip">
                <span>Επικουρική</span>
                <span>260,00 €</span>
              </div>
              <div className="stat-chip deduction">
                <span>Κρατήσεις</span>
                <span>− 76,80 €</span>
              </div>
              <div className="stat-total">
                <span>Εκτιμώμενο καθαρό ποσό</span>
                <span>1.203,20 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: ΣΕΝΑΡΙΑ ΕΞΟΔΟΥ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΣΕΝΑΡΙΑ ΕΞΕΤΑΖΟΥΜΕ</span>
            <h3>Πώς αλλάζει η εκτίμηση σε διαφορετικά σενάρια εξόδου</h3>
            <p>
              Η εκτίμηση μπορεί να συγκρίνει διαφορετικά σενάρια συνταξιοδότησης και τη διαφορά στο ποσό για κάθε ηλικία εξόδου.
            </p>
            <ul className="feature-bullets">
              <li>Εκτίμηση πρώτου δυνατού σημείου εξόδου</li>
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

            <h3>
              {isPaidServiceLive
                ? 'Ξεκάθαρη εκτίμηση, με 20 €'
                : 'Ξεκάθαρη εκτίμηση, με εφάπαξ χρέωση'}
            </h3>

            {!isPaidServiceLive && <p>Χωρίς συνδρομή.</p>}

            <div className="feature-projection">
              <span className="feature-projection-label">ΜΕΛΛΟΝΤΙΚΗ ΠΡΟΒΟΛΗ</span>
              <p className="feature-projection-text">
                Όπου η περίπτωση το επιτρέπει, εξετάζουμε και μελλοντικά
                σενάρια συνταξιοδότησης.
              </p>
            </div>

            <p>
              Η ανάγνωση του ασφαλιστικού ιστορικού θέλει εξειδίκευση.
              Την αναλαμβάνουμε εμείς.
            </p>

            <ul className="feature-bullets">
              <li>Γλιτώνετε χρόνο και ταλαιπωρία</li>
              <li>Συγκρίνετε διαφορετικά σενάρια εξόδου</li>
              <li>Έχετε οργανωμένη επεξεργασία των στοιχείων σας</li>
              <li>Λαμβάνετε αρχείο PDF στο email σας</li>
            </ul>
          </div>

          <div className="feature-visual">
            <div className="ui-mockup mk-report">
              <p className="mk-caption">Ενδεικτικό απόσπασμα της έκθεσης</p>
              <p className="mk-report-title">Έκθεση εκτίμησης σύνταξης</p>

              <div className="mk-report-row">
                <span>Μελλοντικό σενάριο εξόδου</span>
                <strong>Μάρτιος 2029</strong>
              </div>

              <div className="mk-report-row">
                <span>Χρόνος ασφάλισης στο σενάριο</span>
                <strong>36 έτη, 4 μήνες</strong>
              </div>

              <div className="mk-report-row">
                <span>Εκτιμώμενο πληρωτέο ποσό πριν από φόρο</span>
                <strong>1.285,00 €</strong>
              </div>

              <p className="mk-note">
                Το πλήρες αρχείο περιλαμβάνει και τη σύγκριση διαφορετικών σεναρίων.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
