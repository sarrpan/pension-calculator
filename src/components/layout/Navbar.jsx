import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo">Υπολογισμός Σύνταξης</div>

        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Αρχική
            </Link>
          </li>
          <li>
            <Link
              to="/calculator?start=main"
              className={location.pathname === "/calculator" ? "active" : ""}
            >
              Υπολογισμός
            </Link>
          </li>
          <li>
            <Link
              to="/premium-upload"
              className={location.pathname === "/premium-upload" ? "active" : ""}
            >
              Αποστολή Ιστορικού
            </Link>
          </li>
          <li>
            <Link
              to="/report-recovery"
              className={`track-btn ${location.pathname === "/recovery" ? "active" : ""}`}
            >
              Παρακολούθηση Αίτησης
            </Link>
          </li>
          <li>
            <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>
              Επικοινωνία
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
