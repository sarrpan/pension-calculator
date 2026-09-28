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

        {/* ΔΩΡΕΑΝ ΕΡΓΑΛΕΙΟ: ΜΕΣΟΣ ΣΥΝΤΑΞΙΜΟΣ ΜΙΣΘΟΣ */}
        <aside className="hero-salary-callout" aria-labelledby="hero-salary-title">
          <div className="hero-salary-description">
            <span className="hero-salary-label">ΔΩΡΕΑΝ ΕΡΓΑΛΕΙΟ</span>
            <h2 id="hero-salary-title">Υπολογίστε τον μέσο συντάξιμο μισθό σας</h2>
            <p>
              Είναι το στοιχείο που χρειάζεται η δωρεάν εκτίμηση. Συμπληρώστε αποδοχές και ημέρες
              ασφάλισης για κάθε έτος και δείτε τον αμέσως.
            </p>
            <ul className="hero-salary-list">
              <li>Χωρίς εγγραφή και χωρίς κωδικούς</li>
              <li>Αποδοχές και ημέρες ανά έτος, όπως στο ασφαλιστικό σας ιστορικό</li>
            </ul>
            <Link to="/average-salary" className="hero-salary-button">
              Υπολογισμός μέσου μισθού
            </Link>
          </div>

          {/* Ενδεικτικό απόσπασμα. Δεν πατιέται. */}
          <div className="hero-salary-preview" aria-hidden="true">
            <div className="hero-salary-preview-title">Ενδεικτικός υπολογισμός</div>

            <div className="hero-salary-row row-head">
              <span>Έτος</span><span>Ημέρες</span><span>Αποδοχές</span>
            </div>
            <div className="hero-salary-row">
              <span>2002</span><span>300</span><span>19.500 €</span>
            </div>
            <div className="hero-salary-row">
              <span>2003</span><span>300</span><span>20.400 €</span>
            </div>

            <div className="hero-salary-gap">⋯</div>

            <div className="hero-salary-row">
              <span>2024</span><span>300</span><span>38.100 €</span>
            </div>
            <div className="hero-salary-row">
              <span>2025</span><span>300</span><span>39.300 €</span>
            </div>
            <div className="hero-salary-row row-current">
              <span>2026</span><span>200</span><span>26.800 €</span>
            </div>

            <div className="hero-salary-result">
              <span className="hero-salary-result-label">ΜΕΣΟΣ ΜΗΝΙΑΙΟΣ<br />ΣΥΝΤΑΞΙΜΟΣ ΜΙΣΘΟΣ</span>
              <span className="hero-salary-result-value">2.486,70 €</span>
            </div>

            <div className="hero-salary-next">Στην εκτίμηση →</div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Hero;
