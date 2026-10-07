import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { isPaidServiceLive } from '../../../config/paidService';

const Hero = () => {
  return (
    <section className="hero-section hero-services" aria-label="Επιλογές υπηρεσιών">
      <div className="container hero-vertical-layout">
        <h2 className="hero-services-title">Δύο υπηρεσίες, ανάλογα με τις ανάγκες σας</h2>
        <p className="hero-services-intro">Επιλέξτε τη λύση που ταιριάζει σε εσάς.</p>
        <div className="hero-cards-row">
          <div className="option-card free">
            <div className="card-header">
              <h3>Δωρεάν Εκτίμηση</h3>
              <span className="price-tag price-free">Δωρεάν</span>
            </div>
            <p className="option-intro">Μια πρώτη εικόνα του ποσού της κύριας σύνταξής σας από τα στοιχεία που δηλώνετε εσείς.</p>
            <ul>
              <li>Με βάση τα στοιχεία που δηλώνετε εσείς</li>
              <li>Έως δύο ασφαλιστικές περιόδους (χωρίς επικάλυψη)</li>
              <li>Άμεσο αποτέλεσμα στην οθόνη</li>
              <li>Χωρίς εγγραφή και χωρίς αποστολή εγγράφων</li>
            </ul>
            <p className="hero-service-note">Δεν ελέγχει αν θεμελιώνετε συνταξιοδοτικό δικαίωμα.</p>
            <div className="hero-service-actions">
              <Link to="/free-guide" className="hero-service-button hero-service-free">Δείτε πώς λειτουργεί</Link>
            </div>
          </div>
          <div className="option-card premium">
            <div className="card-header">
              <h3>Αναλυτική Έκθεση</h3>
              <span className={"price-tag " + (isPaidServiceLive ? "price-paid" : "service-coming-soon")}>
                {isPaidServiceLive ? '20 € εφάπαξ' : 'Σύντομα διαθέσιμο'}
              </span>
            </div>
            <p className="option-intro">Αναλυτική εκτίμηση της σύνταξής σας, με εξέταση της προσωπικής σας περίπτωσης.</p>
            <ul>
              <li>Κύρια και επικουρική σύνταξη (όπου υπάρχουν στοιχεία)</li>
              <li>Διαφορετικά ταμεία, διαδοχική και παράλληλη ασφάλιση</li>
              <li>Σύγκριση διαφορετικών σεναρίων συνταξιοδότησης</li>
              <li>Μελλοντικές προβολές (π.χ. με επιπλέον χρόνο ασφάλισης)</li>
              <li>Κρατήσεις και εκτιμώμενο ποσό πριν από φόρο</li>
              <li>Προσωπική έκθεση σε PDF με επεξηγήσεις και παραδοχές</li>
            </ul>
            <div className="hero-service-actions">
              <Link to="/report-guide" className="hero-service-button hero-service-report">Δείτε πώς λειτουργεί</Link>
            </div>
          </div>
        </div>
        <aside className="hero-services-notice">Οι εκτιμήσεις μας βασίζονται στα στοιχεία που μας παρέχετε και σε ισχύουσα νομοθεσία. Δεν αποτελούν επίσημη απόφαση του e-ΕΦΚΑ ούτε δεσμεύουν οποιονδήποτε φορέα. Για την οριστική θεμελίωση και καταβολή της σύνταξης, αρμόδιος είναι ο e-ΕΦΚΑ.</aside>
        {!isPaidServiceLive && <Link to="/contact" className="hero-service-link hero-interest-link">Ενδιαφέρεστε; Επικοινωνήστε μαζί μας →</Link>}


      </div>
    </section>
  );
};

export default Hero;
