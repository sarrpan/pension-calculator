import React from 'react';
import './Features.css';

const analysisCards = [
  {
    title: 'Χρόνος και αποδοχές',
    description: 'Εξετάζουμε τα βασικά στοιχεία της ασφαλιστικής σας πορείας, που επηρεάζουν το εκτιμώμενο ποσό σύνταξης.',
    points: ['Συνολικός χρόνος ασφάλισης', 'Συντάξιμες αποδοχές', 'Εισφορές και ασφαλιστικές περίοδοι'],
    icon: 'calendar',
  },
  {
    title: 'Σύνθετες περιπτώσεις',
    description: 'Λαμβάνουμε υπόψη περιπτώσεις που χρειάζονται πιο αναλυτική εξέταση, ώστε η εκτίμηση να είναι όσο το δυνατόν πληρέστερη.',
    points: ['Διαφορετικά ταμεία', 'Παράλληλη ή διαδοχική ασφάλιση', 'Ειδικές κατηγορίες (π.χ. ΒΑΕ)', 'Ειδικές παροχές όπου εφαρμόζονται'],
    icon: 'document',
  },
  {
    title: 'Σενάρια και χρόνος εξόδου',
    description: 'Εξετάζουμε εναλλακτικές επιλογές, ώστε να δείτε πώς μπορεί να διαμορφωθεί η εκτίμηση σε διαφορετικά σενάρια.',
    points: ['Πλήρης ή μειωμένη σύνταξη', 'Διαφορετικός χρόνος συνταξιοδότησης', 'Εναλλακτικά σενάρια', 'Μελλοντικές προβολές όταν αυτό είναι μέρος της υπηρεσίας'],
    icon: 'sliders',
  },
];

function AnalysisIcon({ name }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'calendar' ? <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3" /></>
        : name === 'document' ? <><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6" /></>
          : <><path d="M4 6h4m4 0h8M4 12h10m4 0h2M4 18h2m4 0h10" /><circle cx="10" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="8" cy="18" r="2" /></>}
    </svg>
  );
}

export default function Features() {
  return (
    <section className="home-analysis" aria-labelledby="home-analysis-title">
      <div className="container">
        <header className="home-analysis-heading">
          <p className="home-analysis-eyebrow">ΑΝΑΛΥΤΙΚΗ ΠΡΟΣΕΓΓΙΣΗ</p>
          <h2 id="home-analysis-title">Τι εξετάζουμε για τη δική σας περίπτωση</h2>
          <p>Λαμβάνουμε υπόψη όλα τα διαθέσιμα στοιχεία και εξετάζουμε αναλυτικά την ασφαλιστική σας πορεία, ώστε να έχετε μια όσο το δυνατόν πιο πλήρη και ρεαλιστική εκτίμηση.</p>
        </header>
        <div className="home-analysis-cards">
          {analysisCards.map(card => (
            <article className="home-analysis-card" key={card.icon}>
              <span className="home-analysis-icon"><AnalysisIcon name={card.icon} /></span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <ul>{card.points.map(point => <li key={point}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="home-analysis-delivery">
          <section className="home-analysis-example" aria-labelledby="home-example-title">
            <h3 id="home-example-title">Τι θα δείτε στην Αναλυτική Έκθεση</h3>
            <p>Θα λάβετε μια πλήρη και αναλυτική έκθεση με τα αποτελέσματα της εκτίμησης, σε εύκολη και κατανοητή μορφή.</p>
            {/* Static presentation amounts, independent of all calculation rules and user data. */}
            <table className="home-analysis-amounts" aria-describedby="home-example-note">
              <caption>Ενδεικτικό παράδειγμα</caption>
              <tbody>
                <tr><th scope="row">Εθνική σύνταξη</th><td>446,87 €</td></tr>
                <tr><th scope="row">Ανταποδοτική σύνταξη</th><td>573,13 €</td></tr>
                <tr><th scope="row">Επικουρική σύνταξη</th><td>260,00 €</td></tr>
                <tr><th scope="row">Κρατήσεις</th><td>−76,80 €</td></tr>
              </tbody>
              <tfoot><tr><th scope="row">Εκτιμώμενο καθαρό ποσό</th><td>1.203,20 €</td></tr></tfoot>
            </table>
            <p className="home-analysis-example-note" id="home-example-note">Ενδεικτικά ποσά για την παρουσίαση της μορφής της Έκθεσης. Δεν αποτελούν πραγματική εκτίμηση συγκεκριμένου προσώπου.</p>
          </section>
          <section className="home-analysis-extras" aria-labelledby="home-extras-title">
            <h3 id="home-extras-title">Επιπλέον, στην Έκθεση θα βρείτε:</h3>
            <ul>
              <li>Αναλυτική παρουσίαση υπολογισμών</li>
              <li>Επεξηγήσεις με απλή γλώσσα</li>
              <li>Συμπεράσματα και πρακτικές επισημάνσεις</li>
              <li>Εκτίμηση ποσού και, όπου έχει νόημα, εκτίμηση χρόνου συνταξιοδότησης</li>
            </ul>
          </section>
          <aside className="home-analysis-important" aria-labelledby="home-important-title">
            <div>
              <h3 id="home-important-title">Σημαντικό</h3>
              <p>Η εκτίμηση δεν αποτελεί επίσημη απόφαση του e-ΕΦΚΑ. Τα αποτελέσματα βασίζονται στα διαθέσιμα έγγραφα, στα στοιχεία που μας δηλώνετε και στις παραδοχές που αναφέρονται στην Έκθεση.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
