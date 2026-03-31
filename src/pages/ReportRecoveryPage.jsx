import React, { useState } from 'react';
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import './ReportRecoveryPage.css';

const ReportRecoveryPage = () => {
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setReportData(null);
    setLoading(true);

    try {
      // Καθαρίζουμε το PIN από τυχόν κενά 
      const cleanPin = pin.trim().toUpperCase();
      
      // Ο χρήστης γράφει μόνο τον αριθμό, εμείς προσθέτουμε το PIN- για την αναζήτηση
      const searchPin = `PIN-${cleanPin}`;

      // Ψάχνουμε στη διαδρομή του συγκεκριμένου PIN
      const reportRef = ref(db, `premium_requests/${searchPin}`);
      const snapshot = await get(reportRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Έλεγχος Ασφαλείας με το Email
        if (data.email.toLowerCase() === email.trim().toLowerCase()) {
          setReportData(data);
        } else {
          setError('Τα στοιχεία δεν ταιριάζουν. Ελέγξτε το PIN και το Email σας.');
        }
      } else {
        setError('Δεν βρέθηκε αίτηση με αυτόν τον κωδικό.');
      }
    } catch (err) {
      console.error(err);
      setError('Υπήρξε κάποιο πρόβλημα κατά την αναζήτηση.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-container">
      <h2>Παρακολούθηση Αίτησης</h2>
      <p>Συμπληρώστε τα παρακάτω πεδία για να ενημερωθείτε για την εξέλιξη της αίτησής σας.</p>

      <form onSubmit={handleSearch} className="recovery-form">
        {/* Νέο πεδίο με το σταθερό "PIN-" */}
        <div className="pin-input-group">
          <span className="pin-prefix">PIN-</span>
          <input 
            type="text" 
            placeholder="π.χ. 146138" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required 
          />
        </div>
        
        <input 
          type="email" 
          placeholder="Το Email της αίτησης" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Αναζήτηση...' : 'Έλεγχος Κατάστασης'}
        </button>
      </form>

      {error && <p className="error-text" style={{marginTop: '20px'}}>{error}</p>}

      {reportData && (
        <div className="status-box">
          <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Κατάσταση Αίτησης</h3>
          
          <div className="status-badge-site">
            {reportData.status === 'pending_payment' ? 'Η αίτηση καταχωρήθηκε - Γίνεται έλεγχος δικαιολογητικών' : 
             reportData.status === 'processing' ? 'Σε εξέλιξη - Υπολογισμός σύνταξης' : 
             reportData.status === 'completed' ? 'Ολοκληρώθηκε - Το Report είναι έτοιμο' : reportData.status}
          </div>
          
          {reportData.status === 'completed' && reportData.finalReportUrl && (
            <a href={reportData.finalReportUrl} target="_blank" rel="noreferrer" className="download-btn">
              📥 Κατέβασμα Report (PDF)
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportRecoveryPage;