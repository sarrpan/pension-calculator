import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container hero-vertical-layout">
        
        {/* Επάνω μέρος: Κεντραρισμένα Κείμενα */}
        <div className="hero-content-centered">
          <div className="trust-badge">Έγκυρος Υπολογισμός 2026</div>

          <h1>Μάθετε τη σύνταξή σας με ακρίβεια</h1>

          <p>
            Ο σωστός υπολογισμός σύνταξης δεν γίνεται στο περίπου.
            Χρειάζονται βασικά ασφαλιστικά στοιχεία, με ιδιαίτερη σημασία στα 
            ένσημα και τις μικτές αποδοχές σας ανά έτος από το 2002 και μετά. 
            Αν τα έχετε συγκεντρωμένα, κάντε μόνοι σας μια δωρεάν πρώτη εκτίμηση. 
            Αν όχι, στείλτε μας τα στοιχεία σας και θα σας ετοιμάσουμε ένα έγκυρο, αναλυτικό report.
          </p>

          <div className="hero-stats">
            <span><strong>2 καθαρές</strong> επιλογές</span>
            <span><strong>Χωρίς</strong> περιττή σύγχυση</span>
          </div>
        </div>

        {/* Κάτω μέρος: Οι 2 επιλογές δίπλα-δίπλα */}
        <div className="hero-cards-row">
          
          {/* ΚΑΡΤΑ 1: ΔΩΡΕΑΝ */}
          <div className="option-card free">
            <div className="card-header">
              <h3>Βασική Εκτίμηση</h3>
              <span className="price-tag free-tag">Δωρεάν</span>
            </div>

            <p className="option-intro">
              Ιδανικό για εσάς που γνωρίζετε ήδη τα ένσημα και τις αποδοχές σας ανά έτος.
            </p>

            <ul>
              <li>Συμπλήρωση πεδίων (ένσημα/αποδοχές)</li>
              <li>Βασική εκτίμηση κύριας σύνταξης</li>
              <li>Άμεσο αποτέλεσμα </li>
            </ul>

            <Link to="/free-guide" className="btn-secondary">
              Ξεκινήστε δωρεάν
            </Link>
          </div>

          <div className="hero-plus-between">ή</div>

          {/* ΚΑΡΤΑ 2: PREMIUM */}
          <div className="option-card premium">
            <div className="recommended-tag">Χωρίς Κόπο</div>

            <div className="card-header">
              <h3>Αναλυτικό Report</h3>
              <span className="price-tag free-tag">10€</span>
            </div>

            <p className="option-intro">
              Μην παιδεύεστε να ενώσετε τα κομμάτια του παζλ. Εμείς κάνουμε τους υπολογισμούς.
            </p>

            <ul>
              <li>Αποστολή του ασφαλιστικού ιστορικού (PDF ΕΦΚΑ)</li>
              <li>Προσθήκη επιπλέον βεβαιώσεων (αν χρειάζονται)</li>
              <li>Έτοιμο, καθαρό report συνταξιοδότησης</li>
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