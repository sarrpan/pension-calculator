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
                <li>Για τη δωρεάν εκτίμηση δεν απαιτούνται ΑΜΚΑ ή ΑΦΜ</li>
                <li>Η έκθεση είναι διαθέσιμη online για 2 μήνες· τα αρχεία και η έκθεση διατηρούνται έως 1 έτος, με δυνατότητα νωρίτερης διαγραφής κατόπιν αιτήματος</li>
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
                <li>Λαμβάνετε καθαρή εκτίμηση, όχι πίνακες με κωδικούς</li>
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
