import React from 'react';
import { Link } from 'react-router-dom';
import { isPaidServiceLive } from '../config/paidService';
import { supportingTools } from '../config/toolsNavigation';
import Hero from '../components/home/Hero/Hero';
import Report from '../components/home/Report/Report';
import Trust from '../components/home/Trust/Trust';
import './HomePage.css';

const toolDetails = {
  'average-salary': {
    description: 'Υπολογίστε τον από τα ετήσια στοιχεία αποδοχών ή εισφορών σας. Μεταφέρετε το αποτέλεσμα απευθείας στη Δωρεάν Εκτίμηση.',
    action: 'Υπολογισμός μέσου μισθού',
  },
  'replacement-rate': {
    description: 'Δείτε το ποσοστό που αντιστοιχεί στον χρόνο ασφάλισής σας και πώς διαμορφώνει την ανταποδοτική σύνταξη.',
    action: 'Υπολογισμός ποσοστού',
  },
};


function ToolIcon({ id }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {id === 'replacement-rate' ? <><path d="m6 18 12-12" /><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /></>
      : <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 10h2m4 0h2M8 14h2m4 0h2M8 18h2m4 0h2" /></>}
  </svg>;
}

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="container home-intro-layout">
          <div className="home-intro-copy">
          <p className="home-eyebrow">Δωρεάν Εκτίμηση · Sintaximou</p>
          <h1 id="home-title">Μια πιο καθαρή εικόνα<br className="home-title-break" /> για τη σύνταξή σας.</h1>
          <p className="home-intro-text">Ξεκινήστε με τον χρόνο ασφάλισης και τον μέσο συντάξιμο μισθό σας.
            Δείτε μια πρώτη εκτίμηση του ποσού της κύριας σύνταξης, χωρίς εγγραφή.</p>
          <div className="home-intro-actions">
            <div className="home-start-entry">
              <Link className="home-button home-intro-free-button" to="/free-guide">Γνωρίστε τη Δωρεάν Εκτίμηση</Link>
            </div>
            <div className="home-report-entry">
              <Link className="home-button home-intro-report-button" to="/report-guide">Γνωρίστε την Αναλυτική Έκθεση</Link>
              {!isPaidServiceLive && <span className="home-coming-soon">Σύντομα διαθέσιμο</span>}
            </div>
          </div>
          <p className="home-disclaimer"><span aria-hidden="true">ⓘ</span> Η εκτίμηση δεν αποτελεί επίσημη απόφαση του e-ΕΦΚΑ.</p>
          </div>
          <div className="home-handwritten" aria-hidden="true">Ενημερωθείτε<br />Σχεδιάστε<br />Αποφασίστε<br /><span>πιο σίγουρα</span></div>
        </div>
      </section>

      <div className="home-tools-surface">
      <section className="home-tools container" aria-labelledby="home-tools-title">
        <div className="home-section-heading">
          <h2 id="home-tools-title">Χρήσιμα δωρεάν εργαλεία</h2>
          <p>Γνωρίστε τα βασικά μεγέθη, ένα βήμα τη φορά.</p>
        </div>
        <div className="home-tools-grid">
          {supportingTools.map(tool => <article className="home-tool-card" key={tool.id}>
            <span className="home-tool-icon"><ToolIcon id={tool.id} /></span>
            <h3>{tool.label}</h3>
            <p>{toolDetails[tool.id]?.description || 'Ένα ακόμη δωρεάν εργαλείο για την εκτίμηση της σύνταξής σας.'}</p>
            <Link className="home-button home-button-outline" to={tool.path}>{toolDetails[tool.id]?.action || 'Άνοιγμα εργαλείου'} <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      </div>

      <Hero />
      <section className="home-report-section"><div className="container"><Report /></div></section>
      <Trust />
    </div>
  );
}
