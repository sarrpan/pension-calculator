import React from 'react';
import './Trust.css';

const Trust = () => {
  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-grid-large">

          <div className="trust-card-big">
            <div className="trust-content">
              <div className="trust-badge-label">ΙΔΙΩΤΙΚΟΤΗΤΑ</div>
              <h3>Δεν ζητάμε περισσότερα από όσα χρειάζονται</h3>
              <ul className="trust-bullets neutral">
                <li>Δεν απαιτείται εγγραφή για τη δωρεάν εκτίμηση</li>
                <li>Δεν ζητάμε ποτέ κωδικούς Taxisnet</li>
                <li>Δεν χρειαζόμαστε το ΑΜΚΑ ή το ΑΦΜ σας</li>
                <li>Τα αρχεία σας διαγράφονται δύο μήνες μετά την παράδοση</li>
              </ul>
            </div>
          </div>

          <div className="trust-card-big highlight">
            <div className="trust-content">
              <div className="trust-badge-label">ΚΑΘΟΔΗΓΗΣΗ</div>
              <h3>Δεν χρειάζεται να βγάλετε άκρη μόνοι σας</h3>
              <ul className="trust-bullets highlight-bullets">
                <li>Δεν διαβάζετε εσείς γραμμή γραμμή το ιστορικό</li>
                <li>Σας λέμε αν λείπουν στοιχεία και τι σημαίνει αυτό</li>
                <li>Λαμβάνετε καθαρό αποτέλεσμα, όχι πίνακες με κωδικούς</li>
                <li>Ρωτάτε ό,τι δεν καταλαβαίνετε</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Trust;
