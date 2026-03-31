import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Γιατί να επιλέξετε το αναλυτικό report;</h2>

        {/* ROW 1: ΤΙ ΧΡΕΙΑΖΟΜΑΣΤΕ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΧΡΕΙΑΖΟΜΑΣΤΕ ΑΠΟ ΕΣΑΣ</span>
            <h3>Μόνο τα απαραίτητα στοιχεία</h3>
            <p>Η διαδικασία ξεκινάει με τα δικά σας δεδομένα, χωρίς να ζητάμε περιττές πληροφορίες.</p>
            <ul className="feature-bullets">
              <li>Το Ασφαλιστικό σας Ιστορικό (PDF ΕΦΚΑ)</li>
              <li>Συμπλήρωση κενών αν λείπουν παλιά έτη</li>
              <li>Βασικές πληροφορίες (ηλικία, συνολικός χρόνος)</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup form-card">
              <div className="input-placeholder"></div>
              <div className="input-placeholder"></div>
              <div className="input-placeholder short-input"></div>
              <div className="btn-placeholder"></div>
            </div>
          </div>
        </div>

        {/* ROW 2: ΤΙ ΥΠΟΛΟΓΙΖΟΥΜΕ (Αντίστροφο) */}
        <div className="feature-row reverse">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΥΠΟΛΟΓΙΖΟΥΜΕ</span>
            <h3>Τα μεγέθη που διαμορφώνουν τη σύνταξη</h3>
            <p>Αναλύουμε τα δεδομένα σας και υπολογίζουμε με ακρίβεια κάθε πτυχή.</p>
            <ul className="feature-bullets">
              <li>Εθνική & Ανταποδοτική Σύνταξη</li>
              <li>Επικουρική Σύνταξη (αν υπάρχει)</li>
              <li>Ασφαλιστικές Κρατήσεις & Φόροι</li>
              <li>Τελικό Καθαρό Ποσό (στην τσέπη σας)</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup stat-card">
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
                <span>Κρατήσεις (ΕΑΣ, Υγεία)</span>
                <span>- 53,00 €</span>
              </div>
              <div className="stat-total">
                <span>ΤΕΛΙΚΟ ΠΟΣΟ</span>
                <span>830,67 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: ΤΙ ΣΕΝΑΡΙΑ ΕΞΕΤΑΖΟΥΜΕ */}
        <div className="feature-row">
          <div className="feature-text">
            <span className="step-label">ΤΙ ΣΕΝΑΡΙΑ ΕΞΕΤΑΖΟΥΜΕ</span>
            <h3>Συγκρίνουμε εναλλακτικές επιλογές εξόδου</h3>
            <p>Σας βοηθάμε να αποφασίσετε πότε σας συμφέρει πραγματικά να βγείτε.</p>
            <ul className="feature-bullets">
              <li>Πρώτο δυνατό σημείο εξόδου</li>
              <li>Μειωμένη έναντι Πλήρους Σύνταξης</li>
              <li>Σενάριο παραμονής (έως και +5 έτη)</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup result-card">
              <div className="flow-label">62</div>
              <div className="flow-arrow">↔</div>
              <div className="flow-label">67</div>
              <div className="flow-arrow">↔</div>
              <div className="flow-label">+5 ΕΤΗ</div>
            </div>
          </div>
        </div>

        {/* ROW 4: Η ΑΞΙΑ ΤΗΣ ΥΠΗΡΕΣΙΑΣ (Αντίστροφο) */}
        <div className="feature-row reverse feature-row-last">
          <div className="feature-text">
            <span className="step-label">Η ΑΞΙΑ ΤΗΣ ΥΠΗΡΕΣΙΑΣ</span>
            <h3>Ξεκάθαρο αποτέλεσμα, με 10€</h3>
            <p>Η αποκρυπτογράφηση του ΕΦΚΑ απαιτεί εξειδίκευση. Εμείς σας προσφέρουμε τη λύση.</p>
            <ul className="feature-bullets">
              <li>Γλιτώνετε χρόνο, ταλαιπωρία και άγχος</li>
              <li>Αποφεύγετε ακριβά λάθη στον υπολογισμό</li>
              <li>Επαγγελματική ανάλυση στο κόστος δύο καφέδων</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="ui-mockup doc-card">
              <div className="line long"></div>
              <div className="line mid"></div>
              <div className="line short"></div>
              <div className="stamp">REPORT (10€)</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;