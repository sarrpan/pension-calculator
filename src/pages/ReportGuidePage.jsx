import React from 'react';
import { Link } from 'react-router-dom';
import './ReportGuidePage.css';

const ReportGuidePage = () => {
  const heroFacts = [
      {
        title: 'Ξεκάθαρη Εικόνα',
        text: 'Εκτίμηση κύριας και επικουρικής σύνταξης με βάση τα δεδομένα σας.'
      },
      {
        title: 'Απόλυτη Ασφάλεια',
        text: 'Η χρέωση προχωρά μόνο αφού επιβεβαιώσουμε ότι μας έχετε δώσει το σωστό αρχείο και όλα τα απαραίτητα στοιχεία.'
      },
      {
        title: 'Χωρίς Ταλαιπωρία',
        text: 'Λαμβάνετε ένα οργανωμένο report με ποσά και κρατήσεις, χωρίς να χάνεστε σε πολύπλοκους πίνακες.'
      }
    ];

  const commonRequirements = [
      {
        title: 'Ημερομηνία γέννησης',
        text: 'Απαραίτητη για να υπολογιστεί η ακριβής ηλικία σας.'
      },
      {
        title: 'Ημερομηνία αποχώρησης',
        text: 'Πότε επιθυμείτε να συνταξιοδοτηθείτε, ώστε να προσαρμόσουμε το σενάριο της εκτίμησης.'
      },
      {
        title: 'Έτη παραμονής στην Ελλάδα',
        text: 'Αφορά μόνο όσους έχουν λιγότερα από 40 έτη, καθώς επηρεάζει την Εθνική Σύνταξη'
      },
      {
        title: 'Πρώτη ασφάλιση πριν το 1993',
        text: 'Κρίσιμη πληροφορία (παλαιός ή νέος ασφαλισμένος) για τον τρόπο υπολογισμού.'
      },
      {
        title: 'Βαρέα ή υπερβαρέα ένσημα',
        text: 'Αν υπάρχουν, επηρεάζουν ευνοϊκά τα όρια ηλικίας και τον τελικό υπολογισμό.'
      },
      {
        title: 'Ασφαλιστικό ιστορικό ΕΦΚΑ',
        text: 'Το βασικό έγγραφο (PDF) στο οποίο στηρίζεται όλη η ανάλυση της σύνταξής σας'
      }
    ];

  const processSteps = [
      {
        title: 'Ανεβάζετε το PDF',
        text: 'Μας στέλνετε το επίσημο Αναλυτικό Ιστορικό Ασφάλισης σε μορφή PDF.'
      },
      {
        title: 'Γίνεται έλεγχος αρχείου',
        text: 'Ελέγχουμε πρώτα αν το αρχείο είναι το σωστό.'
      },
      {
        title: 'Μόνο τότε προχωρά η χρέωση',
        text: 'Η πληρωμή ολοκληρώνεται μόνο όταν επιβεβαιωθεί η λήψη του σωστού αρχείου και των απαραίτητων στοιχείων.'
      },
      {
        title: 'Αν κάτι λείπει, δεν χρεώνεστε',
        text: 'Αν το PDF δεν είναι το σωστό ή λείπουν βασικά δεδομένα, σας ενημερώνουμε και δεν προχωρά η κανονική χρέωση.'
      }
    ];

  const efkaChecklist = [
    'Το επίσημο Αναλυτικό Ιστορικό Ασφάλισης από την πλατφόρμα του e-ΕΦΚΑ.',
    'Το αρχείο στην αρχική ψηφιακή του μορφή (PDF).',
    'Όχι φωτογραφίες, screenshots ή εκτυπώσεις σε μορφή εικόνας.'
  ];

  const reportIncludes = [
    {
      title: 'Ανάλυση ποσού σύνταξης',
      text: 'Εκτίμηση κύριας σύνταξης και επικουρικής, με βάση τα πραγματικά σας δεδομένα.'
    },
    {
      title: 'Κρατήσεις και καθαρό ποσό',
      text: 'Υπολογισμός κρατήσεων για να έχετε μια πιο καθαρή εικόνα για το ποσό που απομένει.'
    },
    {
      title: 'Σενάρια εξόδου',
      text: 'Συγκριτική παρουσίαση διαφορετικών σεναρίων εξόδου, ώστε να βλέπετε πιο καθαρά τις βασικές διαφορές.'
    },
    {
      title: 'Συγκεντρωτική εικόνα ενσήμων',
      text: 'Οργανωμένη παρουσίαση ενσήμων, ημερών ασφάλισης και βασικών κατηγοριών του ιστορικού σας.'
    }
  ];

  const complexCases = [
      'Έλεγχος και υπολογισμός κόστους για πλασματικά έτη.',
      'Σενάρια με ειδικές ή πιο σπάνιες συνταξιοδοτικές διατάξεις.',
      'Περιπτώσεις που απαιτούν εκτεταμένη χειροκίνητη καταμέτρηση (π.χ. παλιές καρτέλες).',
      'Οποιοδήποτε άλλο εξειδικευμένο ερώτημα αφορά την περίπτωσή σας.'
    ];

  return (
    <main className="report-guide-page">
      <div className="report-guide-container">
        <section className="report-guide-hero">
          <div className="report-guide-hero-content">
            <span className="report-guide-badge">Αναλυτικό Report Σύνταξης - 10€</span>

            <h1>Εκτίμηση σύνταξης με βάση τα δικά σας δεδομένα</h1>

            <p className="report-guide-lead">
              Για να μπορέσουμε να ετοιμάσουμε το αναλυτικό σας report, η διαδικασία ξεκινά με
              τα δικά σας στοιχεία. Θα χρειαστούμε το ασφαλιστικό σας ιστορικό (PDF από τον e-ΕΦΚΑ),
              καθώς και ορισμένες βασικές πληροφορίες για την περίπτωσή σας (π.χ. έτη, ηλικία ή καθεστώς
              βαρέων). Εμείς κάνουμε την επεξεργασία και η χρέωση προχωρά μόνο αφού επιβεβαιώσουμε 
              ότι το αρχείο είναι το σωστό και μας έχετε δώσει όλα τα απαραίτητα στοιχεία.
            </p>

            <span className="report-guide-scroll-prompt">
              Δείτε αναλυτικά τι θα χρειαστείτε παρακάτω
            </span>
          </div>

          <aside className="report-guide-panel report-guide-panel-dark">
            <div className="report-guide-panel-label">Σε αυτή τη σελίδα</div>

            <div className="report-guide-panel-list">
              {heroFacts.map((item, index) => (
                <div key={item.title} className="report-guide-panel-row">
                  <div className="report-guide-panel-row-title">{item.title}</div>
                  <p>{item.text}</p>
                  {index !== heroFacts.length - 1 && <div className="report-guide-panel-divider" />}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="report-guide-section">
          <div className="report-guide-header-with-image">
            <div className="report-guide-header-content">
              <div className="report-guide-kicker">1. ΤΙ ΠΕΡΙΛΑΜΒΑΝΕΙ ΤΟ REPORT</div>
              <h2>Ξεκάθαρη εικόνα για τα δεδομένα σας</h2>
              <p>
                Με την ολοκλήρωση της ανάλυσης, λαμβάνετε ένα οργανωμένο έγγραφο PDF με τα 
                βασικά στοιχεία που χρειάζεστε, χωρίς να προσπαθείτε να αποκρυπτογραφήσετε 
                μόνοι σας το ιστορικό.
              </p>
            </div>
            
            <div className="report-guide-header-badges">
              <div className="report-guide-price-badge">10€</div>
              <span className="report-guide-chip">Τι αφορά</span>
            </div>
          </div>

          <div className="report-guide-card-grid report-guide-card-grid-2">
            {reportIncludes.map((item, index) => (
              <article key={item.title} className={`report-guide-card tone-${(index % 4) + 1}`}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="report-guide-section report-guide-process-section">
          <div className="report-guide-section-head report-guide-section-head-simple">
            <div>
              <div className="report-guide-kicker">2. ΔΙΑΔΙΚΑΣΙΑ & ΠΛΗΡΩΜΗ</div>
              <h2>Πώς λειτουργεί η υπηρεσία βήμα προς βήμα</h2>
            </div>
          </div>

          <div className="report-process-layout">
            <div className="report-process-grid">
              {processSteps.map((step, index) => (
                <article key={step.title} className={`report-process-card process-tone-${index + 1}`}>
                  <div className="report-process-number">{index + 1}</div>
                  
                  <div className="report-process-content">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="report-guide-side-card report-guide-emphasis-card report-guide-side-card-centered">
              <div className="report-guide-side-label">Τι σημαίνει πρακτικά</div>
              <h3>Δεν ρισκάρετε να πληρώσετε για λάθος αρχείο</h3>
              <p>
                Το βασικό σημείο εμπιστοσύνης είναι απλό: η χρέωση δεν συνδέεται απλώς με το
                πάτημα ενός κουμπιού, αλλά με την επιβεβαίωση ότι το PDF και τα στοιχεία σας
                είναι σωστά και μπορούν να αξιοποιηθούν.
              </p>
              <div className="report-guide-side-divider" />
              <p className="report-guide-emphasis-line">
                Αν έχει σταλεί λάθος αρχείο, σας ενημερώνουμε και δεν γίνεται χρέωση.
              </p>
            </aside>
          </div>
        </section>

        <section className="report-guide-section">
          <div className="report-guide-section-head-simple">
            <div className="report-guide-kicker">3. ΤΙ ΘΑ ΧΡΕΙΑΣΤΟΥΜΕ</div>
            <h2>Τα κοινά στοιχεία που ζητούνται σήμερα</h2>
            <p>
              Στις κατηγορίες που υποστηρίζονται σήμερα, αυτά είναι τα πρώτα στοιχεία που
              ζητούνται από όλους. Ο στόχος είναι να γνωρίζετε από πριν τι θα χρειαστεί,
              ώστε να μη βρεθείτε στη μέση της διαδικασίας με ελλιπή δεδομένα.
            </p>
          </div>

          <div className="report-guide-card-grid report-guide-card-grid-3">
            {commonRequirements.map((item, index) => (
              <article key={item.title} className={`report-guide-card tone-${(index % 4) + 1}`}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="report-guide-note">
            <strong>Σημείωση:</strong> Το ασφαλιστικό ιστορικό ΕΦΚΑ ανήκει στα κοινά στοιχεία,
            αλλά είναι τόσο σημαντικό που ξεχωρίζει και εξηγείται αναλυτικότερα αμέσως παρακάτω.
          </div>
        </section>

        <section className="report-guide-section report-guide-section-split">
          <div className="report-guide-copy">
            <div className="report-guide-kicker">4. ΑΣΦΑΛΙΣΤΙΚΟ ΙΣΤΟΡΙΚΟ ΕΦΚΑ</div>
            <h2>Το απαραίτητο έγγραφο για την άντληση των δεδομένων</h2>
            <p>
              Όλα τα στοιχεία είναι υποχρεωτικά για να βγει το σωστό αποτέλεσμα, αλλά το 
              ιστορικό του ΕΦΚΑ είναι η «καρδιά» των αριθμητικών δεδομένων. Είναι επίσης το σημείο 
              όπου οι περισσότεροι δυσκολεύονται: είτε δεν έχουν κατεβάσει το σωστό αρχείο, είτε 
              προσπαθούν να στείλουν φωτογραφίες.
            </p>

            <ul className="report-guide-list">
              {efkaChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="report-guide-note">
              <strong>Σημαντικό:</strong> Αν το αρχείο δεν είναι το σωστό ή δεν είναι σε PDF,
              θα χρειαστεί να το αποκτήσετε ξανά σωστά πριν μπορέσει να προχωρήσει η υπηρεσία.
            </div>
          </div>

          <aside className="report-guide-panel report-guide-panel-dark report-guide-panel-cta">
            <div className="report-guide-panel-label">Ο πιο συχνός κόμπος</div>
            <h3>Οι περισσότεροι είτε δεν το έχουν είτε δεν μπορούν να το αξιοποιήσουν</h3>
            <p>
              Γι’ αυτό υπάρχει ξεχωριστός οδηγός λήψης, ώστε να μπορέσετε να αποκτήσετε το
              σωστό αρχείο χωρίς άσκοπη ταλαιπωρία.
            </p>

            <div className="report-guide-actions report-guide-panel-actions">
              <Link to="/start" className="report-guide-button report-guide-button-light">
                Οδηγός λήψης PDF
              </Link>

              <a
                href="https://apps.e-efka.gov.gr/eAccess/login.xhtml"
                target="_blank"
                rel="noopener noreferrer"
                className="report-guide-button report-guide-button-outline-light"
              >
                Πλατφόρμα e-ΕΦΚΑ &rarr;
              </a>
            </div>
          </aside>
        </section>

        <section className="report-guide-section report-guide-section-split">
          <div className="report-guide-copy">
            <div className="report-guide-kicker">5. ΕΠΙΠΛΕΟΝ ΑΝΑΓΚΕΣ</div>
            <h2>Τι γίνεται αν χρειάζεστε κάτι πιο εξειδικευμένο;</h2>
            <p>
              Η βασική ανάλυση των 10€ καλύπτει τις περισσότερες περιπτώσεις. Αν όμως 
              γνωρίζετε ότι η περίπτωσή σας έχει ιδιαιτερότητες ή θέλετε κάποιον επιπλέον 
              υπολογισμό, είμαστε εδώ για να βοηθήσουμε.
            </p>

            <ul className="report-guide-list">
              {complexCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className="report-guide-panel report-guide-panel-emphasis">
            <span className="report-guide-chip">Εύκολη επικοινωνία</span>
            <h3>Στείλτε μας το αίτημά σας</h3>
            <p>
              Αν δεν είστε σίγουροι αν σας καλύπτει το βασικό πακέτο, περιγράψτε μας 
              με ένα email τι ακριβώς χρειάζεστε.
            </p>

            <div className="report-guide-note report-guide-note-compact">
              Θα εξετάσουμε το αίτημά σας και θα σας ενημερώσουμε άμεσα για το 
              αν μπορεί να γίνει και με ποια (μικρή) επιπλέον χρέωση, χωρίς καμία δέσμευση.
            </div>
          </aside>
        </section>

        <section className="report-guide-cta">
          <div className="report-guide-cta-grid">
            
            <div className="report-guide-cta-text">
              <div className="report-guide-kicker report-guide-kicker-light">ΕΠΟΜΕΝΟ ΒΗΜΑ</div>
              <h2>Είστε έτοιμοι να ξεκινήσετε;</h2>
              <p>
                Αν έχετε ήδη συγκεντρώσει τα βασικά στοιχεία και το ασφαλιστικό ιστορικό ΕΦΚΑ (PDF),
                μπορείτε να ξεκινήσετε τη διαδικασία. Αν όχι, δείτε πρώτα τον οδηγό λήψης.
              </p>

              <div className="report-guide-cta-assurance">
                Ανεβάζετε το αρχείο • Το ελέγχουμε • Μόνο τότε προχωρά η χρέωση
              </div>
            </div>

            <div className="report-guide-cta-actions-wrapper">
              <Link to="/premium-upload" className="report-guide-button report-guide-button-light report-guide-button-large">
                Ανέβασμα PDF & Στοιχείων
              </Link>

              <Link to="/start" className="report-guide-button report-guide-button-outline-light">
                Οδηγός λήψης ΕΦΚΑ
              </Link>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
};

export default ReportGuidePage;