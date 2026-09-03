import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

/* ============================================================
   ΜΠΑΡΑ ΠΛΟΗΓΗΣΗΣ

   Η δομή του μενού καθρεφτίζει τα δύο προϊόντα:
   μία δωρεάν επιλογή και μία επί πληρωμή.

   Αρχική · Δωρεάν Εκτίμηση · Αναλυτικό Report · Επικοινωνία
   και δεξιά, χωρισμένα με γραμμή:
   Παρακολούθηση αίτησης + κουμπί Δωρεάν Υπολογισμός.
   ============================================================ */

/* Όλες οι διευθύνσεις μαζεμένες εδώ.
   Αν αλλάξει κάποια στο App.jsx, αλλάζει μόνο σε αυτό το σημείο. */
const DIADROMES = {
  arxiki:         '/',
  dorean:         '/free-guide',
  report:         '/report-guide',
  epikoinonia:    '/contact',
  apostoli:       '/premium-upload',
  parakolouthisi: '/report-recovery',
  ypologismos:    '/calculator?start=main',
};

const Navbar = () => {
  const location = useLocation();
  const [anoiktoMenu, setAnoiktoMenu] = useState(false);

  // Μας λέει αν βρισκόμαστε ήδη σε αυτή τη σελίδα
  const einaiEnergi = (diadromi) => location.pathname === diadromi;

  // Κάθε φορά που αλλάζει σελίδα, το μενού του κινητού κλείνει μόνο του
  useEffect(() => {
    setAnoiktoMenu(false);
  }, [location.pathname]);

  // Όσο το μενού του κινητού είναι ανοιχτό, η σελίδα από πίσω δεν κυλάει
  useEffect(() => {
    document.body.style.overflow = anoiktoMenu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [anoiktoMenu]);

  // Το πλήκτρο Escape κλείνει το μενού
  useEffect(() => {
    const otanPatithei = (e) => {
      if (e.key === 'Escape') setAnoiktoMenu(false);
    };
    window.addEventListener('keydown', otanPatithei);
    return () => window.removeEventListener('keydown', otanPatithei);
  }, []);

  /* Μικρή βοηθητική, για να μη γράφουμε τις ίδιες γραμμές τέσσερις φορές */
  const syndesmos = (diadromi, keimeno) => (
    <li key={diadromi}>
      <Link
        to={diadromi}
        className={`nv-link ${einaiEnergi(diadromi) ? 'nv-active' : ''}`}
        aria-current={einaiEnergi(diadromi) ? 'page' : undefined}
      >
        {keimeno}
      </Link>
    </li>
  );

  return (
    <nav className="navbar" aria-label="Κύρια πλοήγηση">
      <div className="container nv-container">

        {/* --- Λογότυπο: πηγαίνει στην Αρχική --- */}
        <Link to={DIADROMES.arxiki} className="nv-logo">
          Υπολογισμός Σύνταξης
        </Link>

        {/* --- Κουμπί μενού, φαίνεται μόνο σε μικρές οθόνες --- */}
        <button
          type="button"
          className={`nv-burger ${anoiktoMenu ? 'nv-burger-open' : ''}`}
          onClick={() => setAnoiktoMenu(!anoiktoMenu)}
          aria-label={anoiktoMenu ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
          aria-expanded={anoiktoMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* --- Το δεξί μέρος. Σε κινητό γίνεται το πτυσσόμενο μενού --- */}
        <div className={`nv-right ${anoiktoMenu ? 'nv-open' : ''}`}>

          <ul className="nv-links">
            {syndesmos(DIADROMES.arxiki, 'Αρχική')}
            {syndesmos(DIADROMES.dorean, 'Δωρεάν Εκτίμηση')}
            {syndesmos(DIADROMES.report, 'Αναλυτικό Report')}
            {syndesmos(DIADROMES.epikoinonia, 'Επικοινωνία')}

            {/*
              Η Αποστολή Ιστορικού δεν είναι εδώ. Βρίσκεται στη δεξιά ομάδα,
              μαζί με την Παρακολούθηση: και οι δύο απευθύνονται σε όποιον
              είναι ήδη μέσα στη διαδικασία, όχι σε νέο επισκέπτη.
            */}
          </ul>

          {/* --- Δευτερεύουσα ομάδα: παρακολούθηση + κουμπί δράσης --- */}
          <div className="nv-secondary">
            <Link
              to={DIADROMES.apostoli}
              className={`nv-track ${einaiEnergi(DIADROMES.apostoli) ? 'nv-active' : ''}`}
              aria-current={einaiEnergi(DIADROMES.apostoli) ? 'page' : undefined}
            >
              Αποστολή ιστορικού
            </Link>

            <Link
              to={DIADROMES.parakolouthisi}
              className={`nv-track ${einaiEnergi(DIADROMES.parakolouthisi) ? 'nv-active' : ''}`}
              aria-current={einaiEnergi(DIADROMES.parakolouthisi) ? 'page' : undefined}
            >
              Παρακολούθηση αίτησης
            </Link>

            <Link to={DIADROMES.ypologismos} className="nv-cta">
              Δωρεάν Υπολογισμός
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
