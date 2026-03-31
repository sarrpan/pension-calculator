import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="container">
        <header className="contact-header">
          <h1>Επικοινωνία</h1>
          <p>Θέλετε κάποια διευκρίνιση; Η ομάδα μας είναι εδώ για να σας καθοδηγήσει βήμα-βήμα.</p>
        </header>

        <div className="contact-grid">
          {/* Κάρτα Φόρμας */}
          <section className="contact-form-card">
            <form>
              <div className="input-group">
                <label>Ονοματεπώνυμο</label>
                <input type="text" placeholder="Πληκτρολογήστε το όνομά σας" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="π.χ. user@mail.com" />
              </div>
              <div className="input-group">
                <label>Το μήνυμά σας</label>
                <textarea rows="5" placeholder="Πώς μπορούμε να σας βοηθήσουμε;"></textarea>
              </div>
              <button type="submit" className="btn-submit">Αποστολή Μηνύματος</button>
            </form>
          </section>

          {/* Πλευρική Στήλη */}
          <aside className="contact-sidebar">
            <div className="sidebar-info">
              <h3>Ερωτήσεις για:</h3>
              <div className="info-item">
                <span className="info-icon">📋</span>
                <div>
                  <h4>Βοήθεια με τον ΕΦΚΑ</h4>
                  <p>Αν δυσκολεύεστε να βρείτε το PDF του ιστορικού σας.</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">💎</span>
                <div>
                  <h4>Premium Υπηρεσίες</h4>
                  <p>Λεπτομέρειες για το τι περιλαμβάνει η ανάλυση.</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <div>
                  <h4>Προστασία Δεδομένων</h4>
                  <p>Πώς διασφαλίζουμε την ανωνυμία των εγγράφων σας.</p>
                </div>
              </div>
            </div>
            
            <div className="security-banner">
              <div className="security-badge">🛡️</div>
              <div className="security-text">
                <h4>Verified Security</h4>
                <p>Μην κοινοποιείτε ευαίσθητα δεδομένα (AMKA, Taxisnet) μέσω της φόρμας.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;