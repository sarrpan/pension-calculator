import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container hero-vertical-layout">

        <div className="hero-content-centered">
          <div className="trust-badge">Συντελεστές 2026</div>

          <h1>Δείτε μια εκτίμηση του ποσού της σύνταξής σας</h1>

          <p>
            Για τη δωρεάν εκτίμηση δηλώνετε τον ασφαλιστικό χρόνο σας και τον μέσο μηνιαίο συντάξιμο μισθό σας.
            Αν δεν γνωρίζετε τον μέσο μισθό, μπορείτε πρώτα να τον υπολογίσετε από τα ετήσια στοιχεία σας.
            Για πιο σύνθετη περίπτωση, μπορείτε να επιλέξετε το Αναλυτικό Report με βάση το ασφαλιστικό σας ιστορικό.
          </p>
        </div>

        <div className="hero-cards-row">

          {/* ΚΑΡΤΑ 1: ΔΩΡΕΑΝ */}
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

            <Link to="/free-guide" className="btn-secondary">
              Δείτε τη δωρεάν εκτίμηση
            </Link>
          </div>

          <div className="hero-plus-between">ή</div>

          {/* ΚΑΡΤΑ 2: PREMIUM */}
          <div className="option-card premium">
            <div className="recommended-tag">Πλήρης ανάλυση</div>

            <div className="card-header">
              <h3>Αναλυτικό Report</h3>
              <span className="price-tag price-paid">20 €</span>
            </div>

            <p className="option-intro">
              Στέλνετε το ασφαλιστικό σας ιστορικό και τους υπολογισμούς τους κάνουμε εμείς.
            </p>

            <ul>
              <li>Αποστολή του ιστορικού (PDF από τον e-ΕΦΚΑ)</li>
              <li>Μας δηλώνετε χρόνο που δεν φαίνεται στο ιστορικό</li>
              <li>Εκτίμηση ποσού και σύγκριση σεναρίων εξόδου</li>
            </ul>

            <Link to="/report-guide" className="btn-primary">
              Δείτε πώς λειτουργεί
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
