import React from 'react';
import { Link } from 'react-router-dom';
import './Trust.css';

export default function Trust() {
  return (
    <section className="trust-section" aria-labelledby="home-trust-title">
      <div className="container">
        <h2 id="home-trust-title">Ιδιωτικότητα και ασφάλεια</h2>
        <div className="home-trust-columns">
          <div>
            <h3>Προσωπικά δεδομένα</h3>
            <p>Ζητάμε μόνο τα στοιχεία που χρειάζονται για την υπηρεσία που χρησιμοποιείτε.</p>
          </div>
          <div>
            <h3>Χωρίς κωδικούς Taxisnet</h3>
            <p>Δεν ζητάμε τους προσωπικούς σας κωδικούς Taxisnet.</p>
          </div>
          <div>
            <h3>Αποθήκευση και διαγραφή</h3>
            <p>Στην <Link to="/privacy">Πολιτική Απορρήτου</Link> εξηγούμε ποια στοιχεία αποθηκεύονται και τι ισχύει για τη διαγραφή τους.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
