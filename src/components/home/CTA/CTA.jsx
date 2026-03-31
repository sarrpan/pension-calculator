import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          <h2>Επιλέξτε τη διαδρομή που σας ταιριάζει</h2>

          <p>
            Αν γνωρίζετε ήδη τα βασικά στοιχεία σας, ξεκινήστε με τη δωρεάν εκτίμηση. Αν
            θέλετε πιο οργανωμένη επεξεργασία με βάση το ασφαλιστικό ιστορικό σας,
            προχωρήστε στο αναλυτικό report.
          </p>

          <div className="cta-buttons">
            <Link to="/free-guide" className="cta-btn secondary">
              Ξεκινήστε δωρεάν
            </Link>
            <Link to="/report-guide" className="cta-btn primary">
              Στείλτε το ιστορικό σας για report
            </Link>
          </div>

          <div className="cta-footer-note">
            Δύο ξεκάθαρες επιλογές, χωρίς να μπερδεύεται το δωρεάν εργαλείο με το
            ασφαλιστικό ιστορικό.
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;