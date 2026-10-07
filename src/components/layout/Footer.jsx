import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { isPaidServiceLive } from '../../config/paidService';
import { toolsNavigation, toolPaths } from '../../config/toolsNavigation';
import { informationSections } from '../../content/information/navigation.js';

const Footer = () => (
  <footer className="ft-footer">
    <div className="container ft-grid">
      <div className="ft-brand">
        <Link to="/" aria-label="Sintaximou — Αρχική"><img className="ft-brand-logo" src="/brand/sintaximou-logo-horizontal.svg" alt="Sintaximou" width="385" height="82" /></Link>
        <p className="ft-brand-text">Ενημερωτικό εργαλείο εκτίμησης, βάσει της τρέχουσας ασφαλιστικής νομοθεσίας.</p>
      </div>
      <nav className="ft-links" aria-label="Υπηρεσίες στο υποσέλιδο">
        <h2 className="ft-title">Υπηρεσίες / Εργαλεία</h2>
        <ul>
          <li><Link to={toolPaths['free-estimation']}>Δωρεάν Εκτίμηση</Link></li>
          {toolsNavigation.filter(tool => tool.id !== 'free-estimation').map(tool => <li key={tool.id}><Link to={tool.path}>{tool.footerLabel}</Link></li>)}
          <li><Link to="/report-guide">Αναλυτική Έκθεση</Link></li>
          <li><Link to="/free-guide">Οδηγός δωρεάν εκτίμησης</Link></li>
          <li><Link to="/pdf-guide">Οδηγός λήψης PDF</Link></li>
        </ul>
      </nav>
      <nav className="ft-links" aria-label="Ενημέρωση στο υποσέλιδο">
        <h2 className="ft-title">Ενημέρωση</h2>
        <ul>{informationSections.map(section => <li key={section.id}><Link to={section.path}>{section.label}</Link></li>)}</ul>
      </nav>
      <div className="ft-support-column">
        <nav className="ft-links" aria-label="Υποστήριξη στο υποσέλιδο">
          <h2 className="ft-title">Υποστήριξη / Συνεργασία</h2>
          <ul>
            <li><Link to="/contact">Επικοινωνία</Link></li>
            <li><Link to="/synergasies">Συνεργασία με τη Sintaximou</Link></li>
            {isPaidServiceLive && <>
              <li><Link to="/premium-upload">Αποστολή εγγράφων</Link></li>
              <li><Link to="/report-recovery">Παρακολούθηση αίτησης</Link></li>
            </>}
          </ul>
        </nav>
      </div>
      <nav className="ft-links" aria-label="Νομικά στο υποσέλιδο">
        <h2 className="ft-title">Νομικά</h2>
        <ul>
          <li><Link to="/terms">Όροι Χρήσης</Link></li>
          <li><Link to="/privacy">Πολιτική Απορρήτου</Link></li>
          <li><Link to="/disclaimer">Αποποίηση Ευθύνης</Link></li>
        </ul>
      </nav>
    </div>
    <div className="ft-bottom">
      <div className="container">
        <p className="ft-disclaimer">Τα αποτελέσματα αποτελούν εκτίμηση και δεν υποκαθιστούν την επίσημη απόφαση του e-ΕΦΚΑ.</p>
        <p className="ft-copyright">&copy; {new Date().getFullYear()} Sintaximou. Με την επιφύλαξη κάθε νόμιμου δικαιώματος.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
