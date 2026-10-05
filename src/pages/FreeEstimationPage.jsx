import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { freeEstimationCategories } from '../config/freeEstimationCategories';
import './FreeEstimationPage.css';

export default function FreeEstimationPage() {
  const location = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Sintaximou — Επιλογή κατηγορίας για τη Δωρεάν Εκτίμηση';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="fe-page">
      <div className="container">
        <header className="fe-header">
          <h1>Με ποια ασφαλιστική κατηγορία θέλετε να γίνει η εκτίμηση;</h1>
          <p>Επιλέξτε την κατηγορία με βάση την οποία θέλετε να γίνει η εκτίμηση. 
            Η δωρεάν εφαρμογή δεν ελέγχει αν θεμελιώνετε δικαίωμα συνταξιοδότησης.</p>
        </header>

        <section className="fe-grid" aria-label="Ασφαλιστικές κατηγορίες">
          {freeEstimationCategories.filter((category) => category.active).map((category) => {
            const content = (
              <>
                <span className="fe-badge">{category.badge}</span>
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <span className="fe-action">
                  Συνέχεια <span aria-hidden="true">→</span>
                </span>
              </>
            );
            return (
              <Link key={category.id} className="fe-card" to="/calculator?start=main"
                style={{ '--fe-card-accent': category.accent }}
                state={{ ...location.state, primaryFund: category.fund }}>
                {content}
              </Link>
            );
          })}
        </section>
        <p className="fe-availability-notice">
          Περισσότερες ασφαλιστικές κατηγορίες θα προστίθενται σταδιακά.
        </p>

        <section className="fe-explanation" aria-labelledby="fe-basic-title">
          <h2 id="fe-basic-title">Έχετε χρόνο και σε άλλη ασφαλιστική κατηγορία;</h2>
          <p>Στην επόμενη φόρμα μπορείτε να δηλώσετε και προηγούμενο ασφαλιστικό χρόνο από άλλη κατηγορία, 
            έως το όριο των δύο ασφαλιστικών περιόδων.</p>
          <p>Για τα στοιχεία που χρειάζεστε και τους περιορισμούς της υπηρεσίας,
            δείτε τον <Link to="/free-guide">οδηγό της δωρεάν εκτίμησης</Link>.</p>
        </section>
      </div>
    </div>
  );
}
