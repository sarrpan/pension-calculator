import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicPage } from './information/usePublicPage';
import './CollaborationPage.css';

export default function CollaborationPage() {
  const headingRef = usePublicPage('Συνεργασία',
    'Προτάσεις συνεργασίας από επαγγελματίες, γραφεία και οργανισμούς σε συνταξιοδοτικά, ασφαλιστικά ή συναφή αντικείμενα.');
  return <div className="partners-page"><article className="partners-content">
    <h1 ref={headingRef} tabIndex={-1}>Συνεργασία με τη Sintaximou</h1>
    <p className="partners-intro">Ενδιαφέρεστε να συνεργαστείτε με τη Sintaximou;</p>
    <p>Είμαστε ανοιχτοί σε προτάσεις συνεργασίας από επαγγελματίες, γραφεία και οργανισμούς που δραστηριοποιούνται σε συνταξιοδοτικά, ασφαλιστικά ή συναφή αντικείμενα.</p>
    <p>Αν θεωρείτε ότι υπάρχει πεδίο συνεργασίας με τη Sintaximou, μπορείτε να επικοινωνήσετε μαζί μας και να μας περιγράψετε σύντομα την επαγγελματική σας δραστηριότητα και την πρότασή σας.</p>
    <p>Κάθε πρόταση εξετάζεται ξεχωριστά με βάση το αντικείμενο και τον τρόπο της πιθανής συνεργασίας.</p>
    <p className="partners-note">Μην συμπεριλάβετε στο μήνυμά σας προσωπικά στοιχεία ή έγγραφα πελατών ή άλλων τρίτων.</p>
    <Link className="partners-contact" to="/contact">Επικοινωνήστε για συνεργασία <span aria-hidden="true">→</span></Link>
  </article></div>;
}
