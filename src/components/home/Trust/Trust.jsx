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
                <li>δεν απαιτείται εγγραφή για τη δωρεάν εκτίμηση</li>
                <li>δεν ζητάμε κωδικούς TAXIS</li>
                <li>δεν χρειάζεται να εκθέτετε περιττά προσωπικά στοιχεία</li>
                <li>η διαδικασία οργανώνεται με διακριτικότητα και σαφήνεια</li>
              </ul>
            </div>
          </div>

          <div className="trust-card-big highlight">
            <div className="trust-content">
              <div className="trust-badge-label">ΚΑΘΟΔΗΓΗΣΗ</div>
              <h3>Δεν χρειάζεται να βγάλετε άκρη μόνοι σας με το ιστορικό</h3>
              <p>
                Αν το ασφαλιστικό ιστορικό σας φαίνεται μπερδεμένο, δεν είναι δική σας
                δουλειά να ξεχωρίσετε κάθε γραμμή. Η διαδρομή του report υπάρχει ακριβώς για
                να μετατρέψει αυτό το μπέρδεμα σε οργανωμένη επεξεργασία και καθαρό
                αποτέλεσμα.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;