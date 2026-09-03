import React from 'react';
import { Link } from 'react-router-dom';
import './FreeGuidePage.css';

const fieldCards = [
  {
    tone: 'sand',
    title: 'Συνολικός ασφαλιστικός βίος',
    text: 'Θα χρειαστεί να γνωρίζετε τον συνολικό ασφαλιστικό βίο του εργαζομένου, δηλαδή πόσα έτη και πόσοι μήνες ασφάλισης υπάρχουν συνολικά.',
  },
  {
    tone: 'blue',
    title: 'Έτη διαμονής στην Ελλάδα',
    text: 'Το πεδίο αυτό καθορίζει το ποσό της Εθνικής Σύνταξης. Ως προσυμπληρωμένη τιμή μπαίνουν τα 40 χρόνια. Αν έχετε πάνω από 40 χρόνια διαμονής, δεν χρειάζεται να το αλλάξετε.',
  },
  {
    tone: 'green',
    title: 'Πρώτη ασφάλιση πριν την 1/1/1993',
    text: 'Αρκεί ακόμη και ένα ένσημο έως και τις 31/12/1992 για να θεωρηθεί κάποιος ασφαλισμένος πριν το 1993. Ο διαχωρισμός αυτός επηρεάζει όρια ηλικίας και προϋποθέσεις εξόδου.',
  },
  {
    tone: 'rose',
    title: 'Αποχώρηση με καθεστώς βαρέων',
    text: 'Επιλέξτε «Ναι» μόνο αν πληρούνται οι προϋποθέσεις ΒΑΕ και θα χρησιμοποιηθούν για έξοδο με ειδικές διατάξεις.',
  },
];

const FreeGuidePage = () => {
  return (
    <main className="free-guide-page">
      <div className="free-guide-container">
        <section className="free-guide-hero">
          <div className="free-guide-hero-content">
            <span className="free-guide-badge">Προετοιμασία Υπολογισμού</span>
            <h1>Οδηγίες Δωρεάν Εκτίμησης</h1>
            <p className="free-guide-lead">
              Για να είναι η εκτίμησή σας όσο το δυνατόν πιο κοντά στην πραγματικότητα,
              θα χρειαστεί να εισάγετε εσείς τα δεδομένα σας. Βεβαιωθείτε ότι έχετε
              διαθέσιμα τα απαραίτητα στοιχεία πριν ξεκινήσετε.
            </p>
          </div>
        </section>

        <section className="free-guide-section free-guide-section-intro">
          <h2>Τι στοιχεία θα χρειαστώ;</h2>
          <div className="free-guide-answer">
            <p>Θα πρέπει να έχετε διαθέσιμα τα εξής στοιχεία:</p>
            <ul className="free-guide-list">
              <li>Τις <strong>μεικτές ετήσιες αποδοχές</strong> σας από το 2002 έως σήμερα.</li>
              <li>Τον αριθμό των <strong>ενσήμων / ημερών ασφάλισης</strong> ανά έτος.</li>
              <li>Την <strong>ημερομηνία πρώτης ασφάλισης</strong> (πριν ή μετά την 1/1/1993).</li>
              <li>Τον <strong>συνολικό ασφαλιστικό βίο</strong>, δηλαδή τα συνολικά έτη και τους συνολικούς μήνες ασφάλισης.</li>
            </ul>
          </div>
        </section>

        <section className="free-guide-section">
          <div className="free-guide-section-head">
            <div>
              <div className="free-guide-section-kicker">ΒΑΣΙΚΑ ΠΕΔΙΑ</div>
              <h2>Επεξήγηση βασικών πεδίων της φόρμας</h2>
            </div>
            <p className="free-guide-section-intro-text">
              Τα παρακάτω πεδία επηρεάζουν ουσιαστικά τη σωστή πορεία του υπολογισμού,
              γι’ αυτό είναι σημαντικό να συμπληρωθούν σωστά.
            </p>
          </div>

          <div className="free-guide-feature-grid">
            {fieldCards.map((item) => (
              <article
                key={item.title}
                className={`free-guide-feature-card free-guide-feature-card-${item.tone}`}
              >
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="free-guide-visual-block">
            <article className="free-guide-feature-card free-guide-feature-card-sand free-guide-visual-card">
              <h3>Χρόνος βαρέων ανά περίοδο</h3>
              <p>
                Αν υπάρχουν βαρέα ένσημα, θα πρέπει να χωριστούν σε «Έως 2014» και
                «Από 2015 και μετά», γιατί από το 2015 αλλάζει ο τρόπος υπολογισμού.
              </p>
              <p>
                Αν όλα τα ένσημα είναι Βαρέα ή αν δεν υπάρχουν καθόλου βαρέα ένσημα,
                γίνεται η αντίστοιχη επιλογή στο radiobutton και τα πεδία ετών / μηνών
                παραμένουν ανενεργά, αφού δεν χρειάζεται να συμπληρωθούν.
              </p>
            </article>

            <div className="free-guide-image-card free-guide-image-card-soft free-guide-visual-image-card">
              <img
                src="/img/varea1.png"
                alt="Πεδία επιλογής και συμπλήρωσης βαρέων ενσήμων ανά περίοδο"
                className="free-guide-image"
              />
              <p className="free-guide-image-caption">
                Απόσπασμα από τη φόρμα υπολογισμού
              </p>
            </div>
          </div>
        </section>

        <section className="free-guide-section free-guide-section-split">
          <div className="free-guide-section-copy">
            <div className="free-guide-section-kicker">ΑΠΟΔΟΧΕΣ &amp; ΕΝΣΗΜΑ</div>
            <h2>Εισαγωγή Ποσών &amp; Ενσήμων</h2>

            <h3>Ημέρες Ασφάλισης ανά Έτος</h3>
            <p>
              Η συμπλήρωσή τους είναι το ίδιο σημαντική με τις αποδοχές.
              Το μέγιστο όριο που αναγνωρίζει ο ΕΦΚΑ είναι <strong>300 ημέρες ανά έτος</strong>.
            </p>

            <div className="free-guide-note">
              <strong>Tip για Παράλληλη Ασφάλιση (Δύο δουλειές):</strong>
              <br />
              Αν είχατε παράλληλη απασχόληση την ίδια χρονιά, θα συμπληρώσετε το μέγιστο
              των 300 ημερών ασφάλισης, αλλά στο πεδίο των ετήσιων αποδοχών
              <strong> θα προσθέσετε τα μεικτά ποσά και από τις δύο εργασίες</strong>.
            </div>
          </div>

          <div className="free-guide-upload-card free-guide-upload-card-soft">
            <div className="free-guide-upload-label">Προεπισκόπηση πίνακα</div>
            <div className="free-guide-image-card">
              <img
                src="/img/year.png"
                alt="Πίνακας εισαγωγής ετήσιων αποδοχών και ημερών ασφάλισης"
                className="free-guide-image"
              />
              <p className="free-guide-image-caption">
                Απόσπασμα από τον πίνακα της φόρμας
              </p>
            </div>
          </div>
        </section>

        <section className="free-guide-bottom-grid">
          <article className="free-guide-section free-guide-compact-card free-guide-compact-card-sand">
            <div className="free-guide-section-kicker">ΠΡΟΣΟΜΟΙΩΣΗ</div>
            <h2>Υπολογισμός για όσους πλησιάζουν στη σύνταξη</h2>
            <p>
              Αν ο ασφαλισμένος απέχει έως και δύο χρόνια από το όριο συνταξιοδότησής του,
              μπορεί να χρησιμοποιήσει το εργαλείο για προσομοίωση της κύριας και της επικουρικής
              σύνταξης που του αναλογεί, καθώς και για να δει πώς μπορεί να μεταβληθεί το ποσό αν
              παραμείνει στην εργασία του για ένα ή δύο επιπλέον έτη.
            </p>
            <p>
              Σε αυτή την περίπτωση, θα πρέπει να συμπληρωθούν για τα επόμενα χρόνια
              οι αποδοχές και τα ένσημα που εκτιμάτε ότι θα υπάρχουν.
              Όσο πιο ακριβή είναι αυτά τα στοιχεία, τόσο πιο κοντά στην πραγματικότητα
              θα είναι το αποτέλεσμα.
            </p>
            <p>
              Επειδή τα επόμενα έτη συμπληρώνονται υποθετικά, η εκτίμηση παραμένει
              ενδεικτική και μπορεί να εμφανιστεί <strong>ελαφρώς χαμηλότερη </strong>
              από το τελικό πραγματικό ποσό.
            </p>
          </article>

          <article className="free-guide-section free-guide-compact-card free-guide-compact-card-blue">
            <div className="free-guide-section-kicker">ΤΕΛΙΚΟ ΠΟΣΟ</div>
            <h2>Καθαρό Ποσό και Φόρος Εισοδήματος</h2>
            <ul className="free-guide-list">
              <li>
                Στο τελικό ποσό θα εφαρμοσθεί <strong>παρακράτηση φόρου εισοδήματος</strong>
                {' '}κατά την πληρωμή. Έχουν ήδη αφαιρεθεί οι ασφαλιστικές κρατήσεις
                (Υγεία 6%, ΕΑΣ όπου προβλέπεται).
              </li>
              <li>
                Η εφαρμογή παρέχει αποκλειστικά μια <strong>εκτίμηση</strong>.
                Δεν αποτελεί επίσημη πράξη ούτε αντικαθιστά τον ΕΦΚΑ.
              </li>
            </ul>
          </article>
        </section>

        <section className="free-guide-cta">
          <div className="free-guide-cta-content">
            <div className="free-guide-section-kicker free-guide-section-kicker-light">
              ΕΠΟΜΕΝΟ ΒΗΜΑ
            </div>
            <h2>Αφού συγκεντρώσετε τα στοιχεία, προχωρήστε στον υπολογισμό</h2>
            <p>
              Η δωρεάν εκτίμηση βασίζεται αποκλειστικά στα δεδομένα που θα εισάγετε.
              Ξεκινήστε όταν είστε έτοιμοι.
            </p>

            <div className="free-guide-actions">
              <Link to="/calculator" className="free-guide-button free-guide-button-light">
                Ξεκινήστε τώρα
              </Link>
              <Link to="/" className="free-guide-link free-guide-link-light">
                Επιστροφή στην αρχική
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FreeGuidePage;
