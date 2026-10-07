import React from 'react';
import './Report.css';

export default function Report() {
  return (
    <section className="home-report-panel" aria-labelledby="home-report-title">
          <div className="home-report-copy">
            <h2 id="home-report-title">Τι θα δείτε στην Αναλυτική Έκθεση</h2>
            <p>Θα λάβετε μια προσωπική και αναλυτική έκθεση με τα αποτελέσματα της εκτίμησης, σε εύκολη και κατανοητή μορφή.</p>
            <h3 className="home-example-title">Ενδεικτικό παράδειγμα</h3>
            <dl className="home-example-amounts">
              <div><dt>Εθνική σύνταξη</dt><dd>446,87 €</dd></div>
              <div><dt>Ανταποδοτική σύνταξη</dt><dd>573,13 €</dd></div>
              <div><dt>Επικουρική σύνταξη</dt><dd>260,00 €</dd></div>
              <div><dt>Κρατήσεις</dt><dd>−76,80 €</dd></div>
              <div className="home-example-total"><dt>Εκτιμώμενο καθαρό ποσό</dt><dd>1.203,20 €</dd></div>
            </dl>
            <p className="home-example-note">Ενδεικτικά ποσά για την παρουσίαση της μορφής της Έκθεσης. Δεν αποτελούν πραγματική εκτίμηση συγκεκριμένου προσώπου.</p>
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
          <aside className="home-report-notice" aria-labelledby="home-report-notice-title">
            <h3 id="home-report-notice-title">Σημαντικό</h3>
            <p>Η Αναλυτική Έκθεση αποτελεί εκτίμηση βάσει των διαθέσιμων στοιχείων και <strong>δεν είναι επίσημη απόφαση του e-ΕΦΚΑ</strong>.</p>
          </aside>
    </section>
  );
}
