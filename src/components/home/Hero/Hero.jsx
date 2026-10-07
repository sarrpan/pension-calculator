import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { isPaidServiceLive } from '../../../config/paidService';

const Hero = () => {
  return (
    <section className="hero-section hero-services" aria-label="Επιλογές υπηρεσιών">
      <div className="container hero-vertical-layout">
        <h2 className="hero-services-title">Οι υπηρεσίες μας</h2>
        <div className="hero-cards-row">

          {/* ΚΑΡΤΑ 1: PREMIUM */}
          <div className="option-card premium">
            <div className="card-header">
              <h3>Αναλυτική Έκθεση</h3>
              <span className={`price-tag ${isPaidServiceLive ? 'price-paid' : 'service-coming-soon'}`}>
                {isPaidServiceLive ? '20 €' : 'Σύντομα διαθέσιμο'}
              </span>
            </div>

            <p className="option-intro">
              {isPaidServiceLive
                ? 'Στέλνετε το ασφαλιστικό σας ιστορικό και τους υπολογισμούς τους κάνουμε εμείς.'
                : 'Ανάλυση του ασφαλιστικού σας ιστορικού, με τους υπολογισμούς από εμάς.'}
            </p>

            <ul>
              <li>{isPaidServiceLive ? 'Αποστολή του ιστορικού (PDF από τον e-ΕΦΚΑ)' : 'Έλεγχος του ιστορικού (PDF από τον e-ΕΦΚΑ)'}</li>
              <li>{isPaidServiceLive ? 'Μας δηλώνετε χρόνο που δεν φαίνεται στο ιστορικό' : 'Συνυπολογισμός χρόνου που δεν φαίνεται στο ιστορικό'}</li>
              <li>Εκτίμηση ποσού και σύγκριση σεναρίων εξόδου</li>
            </ul>

            {!isPaidServiceLive && (
              <div className="hero-service-actions">
                <Link to="/contact" className="hero-service-link">Ενδιαφέρεστε; Επικοινωνήστε μαζί μας →</Link>
              </div>
            )}
          </div>

          {/* ΚΑΡΤΑ 2: ΔΩΡΕΑΝ */}
          <div className="option-card free">
            <div className="card-header">
              <h3>Δωρεάν Εκτίμηση</h3>
              <span className="price-tag price-free">Δωρεάν</span>
            </div>

            <p className="option-intro">
              Για μια πρώτη εκτίμηση ποσού, με έως δύο μη επικαλυπτόμενες ασφαλιστικές περιόδους.
              Δεν ελέγχει θεμελίωση συνταξιοδοτικού δικαιώματος.
            </p>

            <ul>
              <li>Δηλώνετε τον ασφαλιστικό χρόνο και τον μέσο μηνιαίο συντάξιμο μισθό</li>
              <li>Εκτίμηση κύριας σύνταξης</li>
              <li>Άμεσο αποτέλεσμα στην οθόνη</li>
            </ul>

          </div>

        </div>


      </div>
    </section>
  );
};

export default Hero;
