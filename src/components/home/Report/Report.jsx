import React from 'react';
import { Link } from 'react-router-dom';
import { isPaidServiceLive } from '../../../config/paidService';
import './Report.css';

export default function Report() {
  return (
    <section className="home-report-panel" aria-labelledby="home-report-title">
          <div className="home-report-copy">
            <div className="home-report-labels"><span className="home-eyebrow">Μια πιο αναλυτική ματιά</span>
              {!isPaidServiceLive && <span className="home-coming-soon">Σύντομα διαθέσιμο</span>}</div>
            <h2 id="home-report-title">Αναλυτική Έκθεση</h2>
            <p>{isPaidServiceLive ? 'Ανάλυση του ασφαλιστικού σας ιστορικού, με τους υπολογισμούς από εμάς.'
              : 'Ετοιμάζουμε μια αναλυτική εκτίμηση με βάση το ασφαλιστικό σας ιστορικό, με τους υπολογισμούς από εμάς.'}</p>
            <ul>
              <li>Οργανωμένη επεξεργασία του ασφαλιστικού ιστορικού</li>
              <li>Ανάλυση ποσού και σύγκριση σεναρίων εξόδου</li>
              <li>Τα αποτελέσματα συγκεντρωμένα σε αρχείο PDF</li>
            </ul>
            <div className="home-report-actions">
              <Link className="home-button home-button-primary" to="/report-guide">
                Δείτε πώς λειτουργεί <span aria-hidden="true">→</span>
              </Link>
              {!isPaidServiceLive && <Link className="home-text-link" to="/contact">Επικοινωνία ενδιαφέροντος</Link>}
            </div>
          </div>
          <figure className="home-report-preview">
            <div className="home-document" aria-hidden="true">
              <div className="home-document-header"><img src="/brand/sintaximou-logo-horizontal.svg" alt="" width="385" height="82" /><span>ΕΚΘΕΣΗ</span></div>
              <p className="home-document-kicker">ΕΚΤΙΜΗΣΗ ΣΥΝΤΑΞΗΣ</p>
              <p className="home-document-title">Η εικόνα σας,<br />με περισσότερη λεπτομέρεια.</p>
              <div className="home-document-section"><span>01</span><strong>Το ασφαλιστικό ιστορικό σας</strong></div>
              <div className="home-document-lines"><i /><i /></div>
              <div className="home-document-section"><span>02</span><strong>Ανάλυση εκτιμώμενου ποσού</strong></div>
              <div className="home-document-bars"><span /><span /><span /></div>
              <div className="home-document-section"><span>03</span><strong>Σύγκριση σεναρίων εξόδου</strong></div>
              <div className="home-document-lines"><i /><i /></div>
              <p className="home-document-footer">Sintaximou <span>Ενδεικτική παρουσίαση · 01</span></p>
            </div>
            <figcaption>Ενδεικτική εικόνα εγγράφου, χωρίς προσωπικά στοιχεία.</figcaption>
          </figure>
    </section>
  );
}
