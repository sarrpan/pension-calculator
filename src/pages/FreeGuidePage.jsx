import React from 'react';
import { Link } from 'react-router-dom';
import './FreeGuidePage.css';

const FreeGuidePage = () => {
  return (
    <main className="fg-page">
      <div className="fg-container">

        <section className="fg-hero">
          <div className="fg-eyebrow">ΔΩΡΕΑΝ ΕΚΤΙΜΗΣΗ</div>
          <h1>Τα στοιχεία τα βάζετε εσείς</h1>

          <p className="fg-lead">
            Το εργαλείο υπολογίζει με όσα του δώσετε. Δεν διαβάζει αρχεία και δεν
            ελέγχει αν λείπει χρόνος από το ασφαλιστικό σας ιστορικό.
          </p>
          <p className="fg-lead">
            Συγκεντρώστε τα παρακάτω πριν ξεκινήσετε, ώστε να μη διακόψετε τη
            συμπλήρωση στη μέση.
          </p>

          <div className="fg-panel-dark">
            <div className="fg-panel-row">
              <div className="fg-panel-row-title">Τι κοστίζει</div>
              <p>Τίποτα. Χωρίς εγγραφή.</p>
            </div>
            <div className="fg-panel-row">
              <div className="fg-panel-row-title">Τι δίνει</div>
              <p>Εκτίμηση κύριας και επικουρικής σύνταξης.</p>
            </div>
          </div>
        </section>

        <section className="fg-section">
          <div className="fg-eyebrow">1. ΤΙ ΘΑ ΧΡΕΙΑΣΤΕΙΤΕ</div>
          <h2>Δύο τρόποι για τις αποδοχές — διαλέγετε</h2>

          <div className="fg-copy">
            <p>
              Ο ένας θέλει νούμερα για κάθε χρονιά, ο άλλος ένα μόνο ποσό. Και οι δύο
              βγάζουν αποτέλεσμα.
            </p>
          </div>

          <div className="fg-block fg-block-warm">
            <h3>Αναλυτικά, ανά έτος</h3>
            <div className="fg-copy">
              <p>
                Οι μεικτές ετήσιες αποδοχές σας και οι ημέρες ασφάλισης για κάθε χρονιά
                από το 2002 και μετά.
              </p>
            </div>

            <figure className="fg-figure">
              <img
                src="/img/year.png"
                alt="Πίνακας εισαγωγής ετήσιων αποδοχών και ημερών ασφάλισης"
              />
              <figcaption>Απόσπασμα από τον πίνακα της φόρμας</figcaption>
            </figure>

            <div className="fg-source-title fg-sources-head">Πού θα βρείτε τα ποσά</div>

            <div className="fg-sources">
              <div className="fg-source">
                <div className="fg-source-title">Από το λογιστήριο ή τη μισθοδοσία</div>
                <p>Η ακριβέστερη πηγή, και η μόνη που δίνει μεικτά ποσά κατευθείαν.</p>
              </div>

              <div className="fg-source">
                <div className="fg-source-title">Από πρόγραμμα του εργοδότη</div>
                <p>Όπου υπάρχει ηλεκτρονική υπηρεσία για το προσωπικό.</p>
              </div>

              <div className="fg-source">
                <div className="fg-source-title">Από τη φορολογική σας δήλωση</div>
                <p>Στο Taxisnet, ανά έτος, στο Ε1.</p>
              </div>
            </div>

            <div className="fg-note">
              Το Ε1 δείχνει το ποσό <strong>μετά</strong> την αφαίρεση των εισφορών.
              Η φόρμα ζητάει μεικτά ποσά, που είναι μεγαλύτερα.
            </div>
          </div>

          <div className="fg-block fg-block-cool">
            <h3>Συνολικά, με ένα ποσό</h3>
            <div className="fg-copy">
              <p>
                Ο μέσος μηνιαίος συντάξιμος μισθός σας, αν τον έχετε ήδη υπολογισμένο.
                Ένα νούμερο, χωρίς πίνακα.
              </p>
            </div>
          </div>

          <div className="fg-block fg-block-cool">
            <h3>Τα χρόνια πριν το 2002</h3>
            <div className="fg-copy">
              <p>
                Συνήθως δεν χρειάζονται αποδοχές. Αρκεί ο φορέας, το διάστημα, το είδος
                των ενσήμων και οι ημέρες.
              </p>
            </div>
          </div>

          <div className="fg-copy fg-copy-spaced">
            <p>
              Ανεξάρτητα από τον τρόπο που θα επιλέξετε, θα χρειαστείτε επίσης την
              ημερομηνία γέννησής σας, την ημερομηνία που θέλετε να αρχίσει η σύνταξη
              και το έτος της πρώτης σας ασφάλισης.
            </p>
          </div>
        </section>

        <section className="fg-section">
          <div className="fg-eyebrow">2. ΠΩΣ ΣΥΜΠΛΗΡΩΝΕΤΑΙ</div>
          <h2>Έως δύο ασφαλιστικές περίοδοι</h2>

          <div className="fg-copy">
            <p>
              Δηλώνετε δύο από τα διαφορετικά ταμεία που έχετε. Ο συνολικός χρόνος
              προκύπτει από το άθροισμα των δύο περιόδων. Αν ο ασφαλιστικός σας χρόνος
              είναι μοιρασμένος σε περισσότερα ταμεία, ο χρόνος που θα μείνει αδήλωτος
              δεν θα μπει στον υπολογισμό.
            </p>
            <p>
              Αυτό σημαίνει ότι το ποσό που θα δείτε δεν θα είναι ακριβές. Μπορεί να
              βγει μεγαλύτερο ή μικρότερο από το πραγματικό, ανάλογα με το τι μένει
              έξω. Αν πρόκειται για λίγα ένσημα μέσα σε μια ολόκληρη καριέρα, η διαφορά
              θα είναι μικρή. Αν πρόκειται για χρόνια, θα είναι αισθητή.
            </p>
            <p>
              Το εργαλείο δεν υπολογίζει παράλληλη ασφάλιση. Αν είχατε δύο δουλειές την
              ίδια χρονιά, ο χρόνος μετριέται μία φορά.
            </p>
          </div>

          <div className="fg-block fg-block-cool">
            <h3>Τρία πεδία που παρεξηγούνται</h3>

            <div className="fg-source-title fg-field-title">Έτος πρώτης ασφάλισης</div>
            <div className="fg-copy">
              <p>
                Το έτος που ασφαλιστήκατε για πρώτη φορά, ακόμη κι αν εκείνη η παλιά
                περίοδος δεν δηλωθεί παρακάτω. Επηρεάζει τα όρια ηλικίας.
              </p>
            </div>

            <div className="fg-source-title fg-field-title">Έτη νόμιμης διαμονής</div>
            <div className="fg-copy">
              <p>
                Καθορίζουν το ποσό της Εθνικής Σύνταξης. Είναι προσυμπληρωμένα με 40
                χρόνια. Αν έχετε περισσότερα, αφήστε το όπως είναι.
              </p>
            </div>

            <div className="fg-source-title fg-field-title">Ημέρες ανά έτος</div>
            <div className="fg-copy">
              <p>Το ανώτατο όριο που αναγνωρίζει ο ΕΦΚΑ είναι 300 ημέρες τον χρόνο.</p>
            </div>
          </div>
        </section>

        <section className="fg-section">
          <div className="fg-eyebrow">3. ΤΟ ΑΠΟΤΕΛΕΣΜΑ</div>
          <h2>Τι περιλαμβάνει το ποσό που θα δείτε</h2>

          <div className="fg-copy">
            <p>
              Οι ασφαλιστικές κρατήσεις έχουν ήδη αφαιρεθεί. Ο φόρος εισοδήματος όχι:
              παρακρατείται αργότερα, κατά την πληρωμή της σύνταξης.
            </p>
            <p>
              Αν απέχετε έως δύο χρόνια από το όριο συνταξιοδότησής σας, μπορείτε να
              δείτε πώς μεταβάλλεται το ποσό αν μείνετε στη δουλειά ένα ή δύο χρόνια
              ακόμη. Συμπληρώνετε για τα επόμενα έτη τις αποδοχές και τα ένσημα που
              εκτιμάτε ότι θα υπάρχουν. Επειδή τα έτη αυτά είναι υποθετικά, το
              αποτέλεσμα μπορεί να βγει ελαφρώς χαμηλότερο από το πραγματικό.
            </p>
          </div>

          <div className="fg-highlight">
            Το αποτέλεσμα είναι εκτίμηση. Δεν αποτελεί επίσημη πράξη και δεν
            υποκαθιστά την απόφαση του e-ΕΦΚΑ.
          </div>
        </section>

        <section className="fg-cta">
          <div className="fg-eyebrow fg-eyebrow-light">ΕΠΟΜΕΝΟ ΒΗΜΑ</div>
          <h2>Ξεκινήστε</h2>
          <p>
            Η εκτίμηση είναι δωρεάν και δεν χρειάζεται εγγραφή. Αν θέλετε να δείτε τι
            λείπει από το ιστορικό σας, αυτό το κάνει η αναλυτική έκθεση.
          </p>

          <div className="fg-cta-actions">
            <Link to="/calculator" className="fg-button fg-button-primary">
              Δωρεάν Υπολογισμός
            </Link>
            <Link to="/report-guide" className="fg-button fg-button-outline">
              Αναλυτικό Report
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default FreeGuidePage;
