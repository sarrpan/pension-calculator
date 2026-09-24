import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FreeGuidePage.css';

const guideSections = [
  { id: 'episkopisi', label: 'Επισκόπηση' },
  { id: 'katallilotita', label: 'Είναι κατάλληλη για μένα;' },
  { id: 'stoixeia', label: 'Τι θα χρειαστείτε' },
  { id: 'mesos-syntaksimos', label: 'Μέσος συντάξιμος μισθός' },
  { id: 'periodoi', label: 'Ασφαλιστικές περίοδοι' },
  { id: 'periorismoi', label: 'Τι δεν καλύπτει' },
  { id: 'apotelesma', label: 'Τι αποτέλεσμα θα δείτε' },
  { id: 'akrivia', label: 'Ακρίβεια της εκτίμησης' },
];

const requiredDetails = [
  ['Βασικά στοιχεία', 'Στοιχεία που συνήθως γνωρίζετε ήδη, όπως ημερομηνία γέννησης, πρώτη ασφάλιση, ημερομηνία για την οποία γίνεται η εκτίμηση, είδος σύνταξης και, όπου χρειάζεται, πλήρης ή μειωμένη σύνταξη και έτη νόμιμης διαμονής.'],
  ['Έως δύο ασφαλιστικές περίοδοι', 'Για κάθε ασφαλιστική περίοδο θα χρειαστούν ο ασφαλιστικός φορέας ή η κατηγορία, το χρονικό διάστημα και ο ασφαλιστικός χρόνος.'],
  ['Στοιχεία για την ανταποδοτική σύνταξη', 'Χρειάζεται ο μέσος μηνιαίος συντάξιμος μισθός σας. Αν δεν τον γνωρίζετε, μπορείτε να τον υπολογίσετε δωρεάν από τα ετήσια στοιχεία σας.', '#mesos-syntaksimos'],
];

const exclusions = [
  ['Θεμελίωση δικαιώματος', 'Δεν ελέγχει αν πληροίτε τις προϋποθέσεις για να συνταξιοδοτηθείτε.'],
  ['Παράλληλη ασφάλιση', 'Δύο ασφαλισμένες εργασίες ή δραστηριότητες που υπάρχουν ταυτόχρονα.'],
  ['Περισσότερες από δύο ασφαλιστικές περιόδους', 'Δεν μπορεί να συμπεριλάβει τρίτη ή επιπλέον ασφαλιστική περίοδο.'],
  ['Μελλοντικά έτη', 'Δεν κάνει πρόβλεψη για χρόνο ασφάλισης ή αποδοχές μελλοντικών ετών.'],
];

const GuideIcon = ({ name, className = '' }) => (
  <svg
    className={`fg-icon ${className}`}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {name === 'arrow' && <path d="M5 12h14m-6-6 6 6-6 6" />}
    {name === 'check' && <path d="m5 12 4 4L19 6" />}
    {name === 'minus' && <path d="M6 12h12" />}
    {name === 'info' && <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.01" /></>}
    {name === 'chevron' && <path d="m6 9 6 6 6-6" />}
    {name === 'table' && <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10m6-10v10" /></>}
  </svg>
);

const FreeGuidePage = () => {
  const [activeSection, setActiveSection] = useState('episkopisi');

  useEffect(() => {
    let frame;
    const updateActiveSection = () => {
      // Match the anchor offset below the existing sticky site navbar.
      let current = guideSections[0].id;
      for (const { id } of guideSections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= 140) {
          current = id;
        }
      }
      setActiveSection(current);
      frame = undefined;
    };
    const scheduleUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateActiveSection);
    };
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const navigationLinks = (compact = false) => (
    <ul className="fg-nav-list">
      {guideSections.map(({ id, label }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={activeSection === id ? 'location' : undefined}
            onClick={compact ? (event) => {
              event.currentTarget.closest('details').open = false;
            } : undefined}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="fg-page">
      <div className="fg-container">
        <aside className="fg-sidebar" aria-label="Οδηγός δωρεάν εκτίμησης">
          <div className="fg-sidebar-heading">
            <span className="fg-eyebrow">ΟΔΗΓΟΣ ΧΡΗΣΗΣ</span>
            <p>Πριν ξεκινήσετε</p>
          </div>
          <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks()}</nav>
          <div className="fg-quick-access">
            <h2>Γρήγορη πρόσβαση</h2>
            <Link to="/calculator?start=main">
              Ξεκινήστε δωρεάν <GuideIcon name="arrow" />
            </Link>
            <Link to="/average-salary">
              Υπολογισμός μέσου συντάξιμου μισθού <GuideIcon name="arrow" />
            </Link>
          </div>
        </aside>

        <div className="fg-content">
          <details className="fg-mobile-nav">
            <summary>Σε αυτή τη σελίδα <GuideIcon name="chevron" /></summary>
            <nav aria-label="Σε αυτή τη σελίδα">{navigationLinks(true)}</nav>
          </details>

          <section className="fg-hero" id="episkopisi" aria-labelledby="fg-title" tabIndex={-1}>
            <div className="fg-hero-grid">
              <div>
                <div className="fg-eyebrow">ΔΩΡΕΑΝ ΕΚΤΙΜΗΣΗ</div>
                <h1 id="fg-title">Δείτε τι χρειάζεστε πριν ξεκινήσετε</h1>
                <p className="fg-lead">
                  Γνωρίζετε τα βασικά στοιχεία της ασφάλισής σας και θέλετε μια
                  πρώτη εκτίμηση ποσού; Η δωρεάν εφαρμογή σάς βοηθά να ξεκινήσετε.
                </p>
                <p className="fg-hero-note">
                  Τα στοιχεία τα συμπληρώνετε εσείς. Η δωρεάν εκτίμηση δεν
                  διαβάζει ούτε ελέγχει ασφαλιστικά έγγραφα.
                </p>
              </div>
              <dl className="fg-summary">
                <div><dt>Κόστος</dt><dd>Δωρεάν, χωρίς εγγραφή</dd></div>
                <div><dt>Ασφαλιστικές περίοδοι</dt><dd>Έως δύο</dd></div>
                <div><dt>Αποτέλεσμα</dt><dd>Εκτίμηση ποσού</dd></div>
              </dl>
            </div>
            <div className="fg-hero-actions">
              <Link to="/calculator?start=main" className="fg-button fg-button-primary">
                Ξεκινήστε τη δωρεάν εκτίμηση <GuideIcon name="arrow" />
              </Link>
              <a href="#mesos-syntaksimos" className="fg-button fg-button-secondary">
                Υπολογίστε τον μέσο συντάξιμο μισθό
              </a>
            </div>
          </section>

          <section className="fg-section" id="katallilotita" aria-labelledby="fg-suitability-title" tabIndex={-1}>
            <div className="fg-eyebrow">01 · ΓΙΑ ΠΟΙΟΝ ΕΙΝΑΙ</div>
            <h2 id="fg-suitability-title">Είναι κατάλληλη για μένα;</h2>
            <div className="fg-suitability-grid">
              <div className="fg-suitability-card">
                <h3><span className="fg-icon-badge"><GuideIcon name="check" /></span>Ναι, αν:</h3>
                <ul className="fg-check-list">
                  <li>Γνωρίζετε τα βασικά στοιχεία της ασφάλισής σας.</li>
                  <li>Έχετε έως δύο ασφαλιστικές περιόδους.</li>
                  <li>Δεν χρειάζεται να εξεταστεί παράλληλη ασφάλιση.</li>
                  <li>Θέλετε άμεσα μια πρώτη εκτίμηση ποσού.</li>
                </ul>
              </div>
              <div className="fg-suitability-card fg-suitability-alternative">
                <h3><span className="fg-icon-badge"><GuideIcon name="minus" /></span>Δεν είναι η κατάλληλη επιλογή αν:</h3>
                <ul className="fg-check-list">
                  <li>Έχετε περισσότερες από δύο διαφορετικές ασφαλιστικές περιόδους που πρέπει να ληφθούν υπόψη.</li>
                  <li>Έχετε παράλληλη ασφάλιση.</li>
                  <li>Θέλετε να εξεταστούν μελλοντικά έτη.</li>
                  <li>Θέλετε έλεγχο του ασφαλιστικού ιστορικού ή σύνθετων ασφαλιστικών περιπτώσεων.</li>
                </ul>
                <Link to="/report-guide" className="fg-text-link">Δείτε το Αναλυτικό Report <GuideIcon name="arrow" /></Link>
              </div>
            </div>
            <aside className="fg-notice" aria-labelledby="fg-entitlement-title">
              <GuideIcon name="info" />
              <div>
                <h3 id="fg-entitlement-title">Η δωρεάν εκτίμηση δεν ελέγχει αν δικαιούστε σύνταξη</h3>
                <p>
                  Η εφαρμογή εκτιμά ποσό με βάση τα στοιχεία που εισάγετε. Δεν
                  ελέγχει αν έχετε συμπληρώσει τις νόμιμες προϋποθέσεις
                  συνταξιοδότησης. Για παράδειγμα, ακόμη και αν δηλώσετε 10 έτη
                  ασφάλισης, μπορεί να εμφανιστεί εκτιμώμενο ποσό. <strong>Αυτό δεν
                  σημαίνει ότι θεμελιώνετε δικαίωμα σύνταξης.</strong>
                </p>
              </div>
            </aside>
          </section>

          <section className="fg-section" id="stoixeia" aria-labelledby="fg-details-title" tabIndex={-1}>
            <div className="fg-eyebrow">02 · ΠΡΟΕΤΟΙΜΑΣΙΑ</div>
            <h2 id="fg-details-title">Τι θα χρειαστείτε</h2>
            <p className="fg-section-intro">Τα στοιχεία που θα συμπληρώσετε χωρίζονται σε τρεις βασικές κατηγορίες.</p>
            <ol className="fg-details-grid">
              {requiredDetails.map(([title, description, href], index) => (
                <li key={title}>
                  <span className="fg-detail-number" aria-hidden="true">{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    {href && (
                      <a href={href} className="fg-text-link fg-details-link">
                        Δεν γνωρίζετε τον μέσο συντάξιμο μισθό σας; Υπολογίστε τον εδώ <GuideIcon name="arrow" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="fg-section fg-salary-section" id="mesos-syntaksimos" aria-labelledby="fg-salary-title" tabIndex={-1}>
            <div className="fg-eyebrow">03 · ΟΙ ΑΠΟΔΟΧΕΣ ΣΑΣ</div>
            <h2 id="fg-salary-title">Ο μέσος μηνιαίος συντάξιμος μισθός</h2>
            <p className="fg-section-intro">
              Για την εκτίμηση της ανταποδοτικής σύνταξης χρειάζεται ο μέσος
              μηνιαίος συντάξιμος μισθός. <strong>Δεν είναι ο τελευταίος μισθός σας
              ούτε ένας απλός μέσος όρος.</strong>
            </p>
            <div className="fg-salary-options">
              <div>
                <h3>Γνωρίζετε ήδη το ποσό;</h3>
                <p>Αν τον γνωρίζετε ήδη, μπορείτε να τον εισαγάγετε απευθείας στη <Link to="/calculator?start=main">δωρεάν εκτίμηση</Link>.</p>
              </div>
              <div>
                <h3>Δεν το γνωρίζετε;</h3>
                <p>Αν δεν τον γνωρίζετε, μπορείτε να τον υπολογίσετε με το δωρεάν εργαλείο μέσου συντάξιμου μισθού.</p>
              </div>
            </div>
            <div className="fg-salary-requirements">
              <h3>Τι στοιχεία θα χρειαστείτε</h3>
              <p>Τα στοιχεία που θα χρειαστούν εξαρτώνται από την ασφαλιστική σας κατηγορία.</p>
              <ul className="fg-insurance-categories">
                <li>
                  <h4>Μισθωτοί</h4>
                  <p>Ετήσιες μικτές / ασφαλιστέες αποδοχές και ημέρες ασφάλισης ανά έτος.</p>
                </li>
                <li>
                  <h4>Ελεύθεροι επαγγελματίες / αυτοαπασχολούμενοι / αγρότες</h4>
                  <p>Ανάλογα με την περίπτωση, μπορείτε να χρησιμοποιήσετε είτε το ετήσιο ασφαλιστέο / συντάξιμο εισόδημα είτε τις ετήσιες εισφορές κύριας σύνταξης.</p>
                </li>
              </ul>
            </div>

            <div className="fg-tool-preview" aria-labelledby="fg-preview-title">
              <div className="fg-preview-header">
                <div className="fg-preview-title"><GuideIcon name="table" /><h3 id="fg-preview-title">Τα ετήσια στοιχεία σας</h3></div>
              </div>
              <div className="fg-preview-table-wrap">
                <table className="fg-preview-table">
                  <caption>Ενδεικτικά στοιχεία μισθωτού. Οι ενδιάμεσες χρονιές σημειώνονται με «…».</caption>
                  <thead>
                    <tr><th scope="col">Έτος</th><th scope="col">Ετήσιες μικτές αποδοχές</th><th scope="col">Ημέρες ασφάλισης</th></tr>
                  </thead>
                  <tbody>
                    <tr><th scope="row">2002</th><td>20.400 €</td><td>300</td></tr>
                    <tr><th scope="row">2003</th><td>9.800 €</td><td>150</td></tr>
                    <tr className="fg-intermediate-years"><td colSpan={3} aria-label="Ενδιάμεσα έτη">…</td></tr>
                    <tr><th scope="row">2023</th><td>17.900 €</td><td>270</td></tr>
                    <tr><th scope="row">2024</th><td>20.700 €</td><td>300</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fg-explanation">
              <h3>Πώς προκύπτει</h3>
              <p>
                Οι συντάξιμες αποδοχές των ετών που λαμβάνονται υπόψη
                αναπροσαρμόζονται με τους προβλεπόμενους συντελεστές και
                χρησιμοποιούνται για τον υπολογισμό του μέσου μηνιαίου
                συντάξιμου μισθού.
              </p>
            </div>
            <div className="fg-salary-tool-action">
              <Link to="/average-salary" className="fg-button fg-button-primary">
                Υπολογίστε τον μέσο συντάξιμο μισθό <GuideIcon name="arrow" />
              </Link>
            </div>
          </section>

          <section className="fg-section" id="periodoi" aria-labelledby="fg-periods-title" tabIndex={-1}>
            <div className="fg-eyebrow">04 · Ο ΧΡΟΝΟΣ ΑΣΦΑΛΙΣΗΣ</div>
            <h2 id="fg-periods-title">Έως δύο ασφαλιστικές περίοδοι</h2>
            <p className="fg-section-intro">
              Η δωρεάν εκτίμηση δέχεται έως δύο διαφορετικές ασφαλιστικές περιόδους.
              <strong> Οι δύο ασφαλιστικές περίοδοι δεν πρέπει να επικαλύπτονται χρονικά.</strong>
            </p>
            <div className="fg-periods-diagram" aria-label="Μπορείτε να δηλώσετε μία ή δύο ασφαλιστικές περιόδους">
              <div><span>01</span><strong>Πρώτη ασφαλιστική περίοδος</strong><p>Φορέας, διάστημα και χρόνος ασφάλισης</p></div>
              <div><span>02</span><strong>Δεύτερη ασφαλιστική περίοδος, αν υπάρχει</strong><p>Φορέας, διάστημα και χρόνος ασφάλισης</p></div>
            </div>
            <p>
              Δεν υποστηρίζονται περισσότερες από δύο ασφαλιστικές περίοδοι και
              δεν γίνεται προβολή μελλοντικών ετών. Αν υπάρχει περισσότερος
              χρόνος που δεν δηλωθεί, δεν θα ληφθεί υπόψη στην εκτίμηση.
            </p>
            <div className="fg-info-block">
              <h3>Τι σημαίνει παράλληλη ασφάλιση;</h3>
              <p>
                Παράλληλη ασφάλιση υπάρχει όταν είχατε δύο ασφαλισμένες εργασίες
                ή δραστηριότητες το ίδιο χρονικό διάστημα. Η δωρεάν εκτίμηση
                δεν υπολογίζει τέτοιες επικαλύψεις.
              </p>
            </div>
          </section>

          <section className="fg-section" id="periorismoi" aria-labelledby="fg-limits-title" tabIndex={-1}>
            <div className="fg-eyebrow">05 · ΤΑ ΟΡΙΑ ΤΗΣ ΥΠΗΡΕΣΙΑΣ</div>
            <h2 id="fg-limits-title">Τι δεν καλύπτει</h2>
            <ul className="fg-limits-grid">
              {exclusions.map(([title, description]) => (
                <li key={title}><GuideIcon name="minus" /><div><h3>{title}</h3><p>{description}</p></div></li>
              ))}
            </ul>
            <div className="fg-report-prompt">
              <p>Αν η περίπτωσή σας χρειάζεται κάποιο από τα παραπάνω, δείτε το Αναλυτικό Report.</p>
              <Link to="/report-guide" className="fg-text-link">Δείτε το Αναλυτικό Report <GuideIcon name="arrow" /></Link>
            </div>
          </section>

          <section className="fg-section" id="apotelesma" aria-labelledby="fg-result-title" tabIndex={-1}>
            <div className="fg-eyebrow">06 · Η ΠΡΩΤΗ ΕΙΚΟΝΑ</div>
            <h2 id="fg-result-title">Τι αποτέλεσμα θα δείτε</h2>
            <div className="fg-result-card">
              <div className="fg-result-stage">
                <h3>ΚΥΡΙΑ ΣΥΝΤΑΞΗ</h3>
                <p className="fg-result-intro">Αποτελείται από δύο μέρη:</p>
                <div className="fg-result-equation">
                  <span>Εθνική σύνταξη</span>
                  <span className="fg-equation-part">
                    <span className="fg-equation-operator">+</span>
                    <span>Ανταποδοτική σύνταξη</span>
                  </span>
                </div>
              </div>
              <div className="fg-result-stage">
                <h3>ΠΩΣ ΔΙΑΜΟΡΦΩΝΕΤΑΙ ΤΟ ΠΛΗΡΩΤΕΟ ΠΟΣΟ</h3>
                <div className="fg-result-flow">
                  <div className="fg-result-equation">
                    <span>Κύρια σύνταξη</span>
                    <span className="fg-equation-part">
                      <span className="fg-equation-operator">+</span>
                      <span>Επικουρική σύνταξη, αν υπάρχει</span>
                    </span>
                  </div>
                  <span className="fg-flow-arrow" aria-hidden="true">↓</span>
                  <p className="fg-gross-total">Συνολικό μικτό ποσό σύνταξης</p>
                  <p className="fg-flow-deductions">
                    <span className="fg-equation-operator">−</span>
                    <span>Συνολικό ποσό κρατήσεων</span>
                  </p>
                  <span className="fg-flow-arrow" aria-hidden="true">↓</span>
                  <p className="fg-flow-payable"><strong>Εκτιμώμενο πληρωτέο ποσό πριν από φόρο</strong></p>
                </div>
              </div>
              <p className="fg-tax-note"><GuideIcon name="info" />Ο φόρος εισοδήματος δεν υπολογίζεται.</p>
              <div className="fg-result-notice">
                <GuideIcon name="info" />
                <p>Το αποτέλεσμα αποτελεί εκτίμηση και δεν υποκαθιστά την επίσημη απόφαση του e-ΕΦΚΑ.</p>
              </div>
            </div>
          </section>

          <section className="fg-section" id="akrivia" aria-labelledby="fg-accuracy-title" tabIndex={-1}>
            <div className="fg-eyebrow">07 · ΣΩΣΤΑ ΣΤΟΙΧΕΙΑ</div>
            <h2 id="fg-accuracy-title">Η ακρίβεια της εκτίμησης εξαρτάται από τα στοιχεία που εισάγετε</h2>
            <p>
              Η εφαρμογή δεν ελέγχει τα στοιχεία σας στον e-ΕΦΚΑ και δεν διαβάζει
              ασφαλιστικά έγγραφα. Χρόνος ασφάλισης, αποδοχές ή άλλα στοιχεία που
              δεν δηλώνονται δεν μπορούν να ληφθούν υπόψη στην εκτίμηση.
            </p>
            <div className="fg-accuracy-tip"><GuideIcon name="check" /><p>Πριν συνεχίσετε, ελέγξτε τις ασφαλιστικές περιόδους, τον χρόνο ασφάλισης και τις αποδοχές που θα συμπληρώσετε.</p></div>
          </section>

          <section className="fg-cta" aria-labelledby="fg-cta-title">
            <div className="fg-eyebrow">ΕΠΟΜΕΝΟ ΒΗΜΑ</div>
            <h2 id="fg-cta-title">Έχετε τα στοιχεία σας; Ξεκινήστε.</h2>
            <p>Μια πρώτη εκτίμηση ποσού, δωρεάν και χωρίς εγγραφή.</p>
            <div className="fg-cta-actions">
              <Link to="/calculator?start=main" className="fg-button fg-button-primary">Δωρεάν Εκτίμηση <GuideIcon name="arrow" /></Link>
              <Link to="/report-guide" className="fg-button fg-button-outline">Έχω πιο σύνθετη περίπτωση</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FreeGuidePage;
