import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h4>Υπολογισμός Σύνταξης</h4>
          <p>Ενημερωτικό εργαλείο υπολογισμού βάσει της τρέχουσας ασφαλιστικής νομοθεσίας.</p>
        </div>
        
        <div className="footer-links">
          <h5>Υπηρεσίες</h5>
          <ul>
            <li><Link to="/premium-upload" className="premium-accent">Premium Ανάλυση</Link></li>
            <li><Link to="/track-request">Παρακολούθηση Αίτησης</Link></li>
            <li><Link to="/contact">Επικοινωνία</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h5>Πληροφορίες</h5>
          <ul>
            <li><Link to="/terms">Όροι Χρήσης</Link></li>
            <li><Link to="/privacy">Πολιτική Απορρήτου</Link></li>
            <li><Link to="/disclaimer">Αποποίηση Ευθύνης</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 Υπολογισμός Σύνταξης. Με την επιφύλαξη κάθε νόμιμου δικαιώματος.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;