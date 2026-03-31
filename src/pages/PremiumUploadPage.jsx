import React, { useState } from 'react';
import './PremiumUploadPage.css';
import { submitPremiumRequest } from '../services/stripe/premiumService';
import stripePromise from '../services/stripe/stripeService';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/stripe/StripePaymentForm';

const PremiumUploadPage = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPin, setGeneratedPin] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Παρακαλώ ανεβάστε μόνο αρχεία μορφής PDF.');
        setFile(null);
        return;
      }
      
      const MAX_FILE_SIZE = 5 * 1024 * 1024; 
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('Το αρχείο είναι πολύ μεγάλο (Μέγιστο 5MB).');
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !file) {
      setError('Το Email και το έγκυρο PDF είναι υποχρεωτικά.');
      return;
    }
    if (!isConfirmed) {
      setError('Παρακαλούμε επιβεβαιώστε ότι το αρχείο δεν περιέχει προσωπικά στοιχεία.');
      return;
    }
    setShowPayment(true);
  };

  // <-- ΝΕΟ: Εδώ προστέθηκε το paymentIntentId για να μιλάει με το StripePaymentForm και το premiumService
  const handleFinalSubmit = async (paymentIntentId) => {
    setIsSubmitting(true);
    const result = await submitPremiumRequest(email, file, paymentIntentId);
    if (result.success) {
      setGeneratedPin(result.pin);
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  if (generatedPin) {
    return (
      <div className="premium-success-container">
        <div className="success-icon">✅</div> {/* Άλλαξα το σηματάκι σε κάτι πιο επαγγελματικό */}
        <h2>Η αίτησή σας καταχωρήθηκε επιτυχώς!</h2>
        <p className="pin-label">Ο κωδικός σας (PIN) είναι:</p>
        <h1 className="pin-display">{generatedPin}</h1>
        <p className="info-text">Χρησιμοποιήστε αυτόν τον κωδικό στην «Παρακολούθηση Αίτησης» για να δείτε την εξέλιξη.</p>
      </div>
    );
  }

  return (
    <div className="premium-upload-wrapper">
      <div className="premium-upload-card">
        <h2>Αποστολή στοιχείων για εκτίμηση σύνταξης</h2>
        
        {!showPayment ? (
          <form onSubmit={handlePreSubmit} className="premium-upload-form">
            <div className="input-group">
              <label>Email για παράδοση του report</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="π.χ. user@mail.com"
                className="email-input" 
                required 
              />
            </div>

            <div className={`file-drop-area ${file ? 'has-file' : ''}`}>
              <label className="file-label-wrapper">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
                {file ? (
                  <span className="file-status-text success">✅ Έτοιμο: {file.name}</span>
                ) : (
                  <span className="file-status-text idle">📁 Κάντε κλικ εδώ για επιλογή του Ασφαλιστικού Ιστορικού (PDF)</span>
                )}
              </label>
            </div>

            {file && (
              <div className="confirmation-card">
                <div className="left-section">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="styled-checkbox"
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
                <div className="shield-section">
                  <div className="shield-emblem">
                    <div className="shield-body">
                      <div className="shield-blue-center">
                        <div className="shield-center-metal"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-section">
                  <p><strong>Επιβεβαιώνω</strong> ότι το αρχείο που ανεβάζω</p>
                  <p><strong>ΔΕΝ</strong> περιέχει την 1η σελίδα με τα προσωπικά μου</p>
                  <p>στοιχεία (ΑΜΚΑ, ΑΦΜ, Ονοματεπώνυμο),</p>
                  <p>σύμφωνα με τις οδηγίες ασφαλείας.</p>
                </div>
              </div>
            )}

            {error && <div className="error-box">⚠️ <strong>Προσοχή:</strong> {error}</div>}

            <button 
              type="submit" 
              className={`submit-btn ${(!file || !email || !isConfirmed) ? 'disabled' : ''}`}
              disabled={!file || !email || !isConfirmed}
            >
              Συνέχεια στην Πληρωμή
            </button>
          </form>
        ) : (
          <Elements stripe={stripePromise}>
            <div className="payment-confirmation-zone">
              <div className="summary-box">
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Αρχείο:</strong> {file.name}</p>
              </div>
              <StripePaymentForm onFileSubmit={handleFinalSubmit} />
              <button 
                onClick={() => setShowPayment(false)} 
                className="back-btn"
              >
                ← Επιστροφή στην αλλαγή αρχείου
              </button>
            </div>
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PremiumUploadPage;