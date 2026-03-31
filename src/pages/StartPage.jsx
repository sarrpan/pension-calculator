import React, { useState } from 'react';
import './StartPage.css';

const ImageSlider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="slider-container">
      <div className="slider-image-wrapper">
        <img
          src={slides[currentIndex].image}
          alt={`Βήμα ${currentIndex + 1}`}
          className="slider-img"
        />

        {currentIndex > 0 && (
          <button className="slider-arrow left-arrow" onClick={prevSlide}>
            &#10094;
          </button>
        )}

        {currentIndex < slides.length - 1 && (
          <button className="slider-arrow right-arrow" onClick={nextSlide}>
            &#10095;
          </button>
        )}
      </div>

      <div className="slider-caption">
        <span className="step-badge">Βήμα {currentIndex + 1} από {slides.length}</span>
        <p>{slides[currentIndex].text}</p>
      </div>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

const StartPage = () => {
  const allSteps = [
    { text: 'Επιλέξτε συνέχεια στο Taxisnet.', image: '/img/1.png' },
    { text: 'Εισάγετε το Username και το Password σας.', image: '/img/2.png' },
    { text: 'Πατήστε Αποστολή.', image: '/img/3.png' },
    { text: 'Εισάγετε τον Αριθμό ΑΜΚΑ για ταυτοποίηση και πατήστε Είσοδος.', image: '/img/4.png' },
    { text: 'Στο μενού επιλέξτε Συνοπτικό και Αναλυτικό ιστορικό Ασφάλισης.', image: '/img/5.png' },
    { text: 'Πατήστε Εκτύπωση Αναλυτικού Ιστορικού Ασφάλισης.', image: '/img/6.png' },
    { text: 'Πατήστε το κουμπί Εκτύπωση Αναλυτικού Ιστορικού Ασφάλισης.', image: '/img/7.png' },
    { text: 'Επιλέξτε εκτύπωση που βρίσκεται δεξιά επάνω.', image: '/img/8.png' },
    {
      text: 'Επάνω βλέπετε πόσες σελίδες είναι το έγγραφο. Επιλέξτε Save as PDF ή Αποθήκευση ως PDF.',
      image: '/img/9.png'
    },
    { text: 'Επιλέξτε custom ή προσαρμοσμένο.', image: '/img/10.png' },
    { text: 'Γράψτε 2 - (τον αριθμό της τελευταίας σελίδας, π.χ. 2-5).', image: '/img/11.png' },
    { text: 'Πατήστε save ή αποθήκευση και αποθηκεύστε το στον υπολογιστή σας.', image: '/img/12.png' }
  ];

  return (
    <section className="guide-section">
      <div className="container">
        <div className="guide-header">
          <div className="guide-kicker">Οδηγός λήψης PDF</div>
          <h2 className="section-title">Πώς να κατεβάσετε σωστά το PDF από τον e-ΕΦΚΑ</h2>

          <div className="info-box">
            <h3>Πριν ξεκινήσετε</h3>
            <p>Για να ολοκληρώσετε τη διαδικασία πιο γρήγορα, βεβαιωθείτε ότι έχετε διαθέσιμα:</p>
            <ul className="requirements-list">
              <li><strong>Κωδικούς Taxisnet:</strong> Για την είσοδο στην πλατφόρμα.</li>
              <li><strong>Αριθμό ΑΜΚΑ:</strong> Θα σας ζητηθεί για την ταυτοποίηση.</li>
            </ul>

            <div className="direct-link-container">
              <a
                href="https://apps.e-efka.gov.gr/eAccess/login.xhtml"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-start-now"
              >
                Μετάβαση στον e-ΕΦΚΑ &rarr;
              </a>
              <small>* Ο σύνδεσμος ανοίγει σε νέα καρτέλα για να βλέπετε παράλληλα τις οδηγίες.</small>
            </div>
          </div>
        </div>

        <div className="single-guide-container">
          <div className="phase-box">
            <div className="phase-title">
              <h3>Αναλυτικός οδηγός λήψης αρχείου</h3>
              <p>Ακολουθήστε τα βήματα για να αποθηκεύσετε το σωστό PDF στον υπολογιστή σας.</p>
            </div>
            <ImageSlider slides={allSteps} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartPage;
