import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container hero-vertical-layout">

        <div className="hero-content-centered">
          <div className="trust-badge">Συντελεστές 2026</div>

          <h1>Δείτε πότε μπορείτε να βγείτε και με τι ποσό</h1>

          <p>
            Ο υπολογισμός σύνταξης δεν γίνεται στο περίπου. Χρειάζονται τα ένσημα και οι μικτές
            αποδοχές σας ανά έτος, από το 2002 και μετά. Αν τα έχετε συγκεντρωμένα, κάντε μόνοι σας
            μια δωρεάν πρώτη εκτίμηση. Αν όχι, στείλτε μας το ασφαλιστικό σας ιστορικό και
            αναλαμβάνουμε εμείς.
          </p>
        </div>

        <div className="hero-cards-row">

          {/* ΚΑΡΤΑ 1: ΔΩΡΕΑΝ */}
          <div className="option-card free">
            <div className="card-header">
              <h3>Βασική Εκτίμηση</h3>
              <span className="price-tag price-free">Δωρεάν</span>
            </div>

            <p className="option-intro">
              Για εσάς που γνωρίζετε ήδη τα ένσημα και τις αποδοχές σας ανά έτος.
            </p>

            <ul>
              <li>Συμπληρώνετε μόνοι σας τα πεδία</li>
              <li>Εκτίμηση κύριας σύνταξης</li>
              <li>Άμεσο αποτέλεσμα στην οθόνη</li>
            </ul>

            <Link to="/free-guide" className="btn-secondary">
              Ξεκινήστε δωρεάν
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
