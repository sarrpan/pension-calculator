import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth, storage } from "../firebase";
import './AdminDashboard.css';

/* ══════════════════════════════════════════════════════════════
   ΟΙ ΠΕΝΤΕ ΚΑΤΑΣΤΑΣΕΙΣ

   Ίδιοι κωδικοί με το premiumService.js και το ReportRecoveryPage.jsx.
   Αν αλλάξει ένας, αλλάζει και στα τρία αρχεία.
   ══════════════════════════════════════════════════════════════ */
const KATASTASEIS = [
  { kodikos: 'documents_received', etiketa: 'Τα έγγραφα παραλήφθηκαν' },
  { kodikos: 'needs_more_info', etiketa: 'Χρειάζονται επιπλέον στοιχεία' },
  { kodikos: 'awaiting_payment', etiketa: 'Αναμονή πληρωμής' },
  { kodikos: 'processing', etiketa: 'Σε επεξεργασία' },
  { kodikos: 'delivered', etiketa: 'Η έκθεση παραδόθηκε' },
];

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΑΡΧΕΙΑ ΤΟΥ ΠΕΛΑΤΗ

   Στη βάση αποθηκεύεται η διαδρομή του κάθε αρχείου, όχι σύνδεσμος.
   Ο σύνδεσμος λήψης παράγεται τη στιγμή που τον ζητάς, ώστε να μην
   γίνονται δεκάδες κλήσεις κάθε φορά που ανοίγει ο πίνακας.

   Δέχεται και τη ΠΑΛΙΑ μορφή (ένα πεδίο pdfUrl), για τις δοκιμαστικές
   αιτήσεις που είχαν καταχωρηθεί πριν την αλλαγή.
   ══════════════════════════════════════════════════════════════ */
const ArxeiaPelati = ({ req }) => {
  const [fortoni, setFortoni] = useState(null);

  const lista =
    Array.isArray(req.files) && req.files.length
      ? req.files
      : req.pdfUrl
      ? [{ path: req.pdfUrl, name: 'Αρχείο πελάτη' }]
      : [];

  if (!lista.length) {
    return <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>;
  }

  const anoigma = async (arxeio, index) => {
    setFortoni(index);
    try {
      const url = await getDownloadURL(sRef(storage, arxeio.path));
      window.open(url, '_blank', 'noopener');
    } catch (error) {
      console.error(error);
      alert('Το αρχείο δεν βρέθηκε. Ελέγξτε αν έχει διαγραφεί.');
    }
    setFortoni(null);
  };

  return (
    <div className="admin-file-list">
      {lista.map((arxeio, index) => (
        <button
          key={arxeio.path || index}
          type="button"
          className="admin-view-pdf"
          onClick={() => anoigma(arxeio, index)}
          title={arxeio.name}
        >
          {fortoni === index ? '⏳' : '📄'} {index + 1}. {arxeio.name}
        </button>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uploadingPin, setUploadingPin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const adminRef = ref(db, 'premium_requests');
    return onValue(adminRef, (snapshot) => {
      setRequests(snapshot.val() || {});
      setLoading(false);
    });
  }, [isAuthenticated]);

  const handleAdminFileUpload = async (e, pin) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPin(pin);
    try {
      const reportRef = sRef(storage, `final_reports/${pin}_Report.pdf`);
      await uploadBytes(reportRef, file);

      const downloadUrl = await getDownloadURL(reportRef);

      const requestRef = ref(db, `premium_requests/${pin}`);
      await update(requestRef, { finalReportUrl: downloadUrl });

      alert(`✅ Το Report για το ${pin} ανέβηκε και συνδέθηκε!`);
    } catch (error) {
      console.error(error);
      alert("Σφάλμα κατά το ανέβασμα του αρχείου.");
    }
    setUploadingPin(null);
  };

  /* Αλλάζει μόνο την κατάσταση της αίτησης στη βάση.
     Καμία επικοινωνία με το Stripe — η πληρωμή δεν έχει στηθεί ακόμη. */
  const handleUpdate = async (pin, newData) => {
    try {
      const requestRef = ref(db, `premium_requests/${pin}`);
      await update(requestRef, newData);
      alert('Ενημερώθηκε!');
    } catch (err) {
      console.error(err);
      alert(`Σφάλμα: ${err.message || 'Η ενέργεια δεν ολοκληρώθηκε.'}`);
    }
  };

  const handleDelete = async (pin) => {
    if (window.confirm(`Διαγραφή;`)) await remove(ref(db, `premium_requests/${pin}`));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Λάθος email ή κωδικός πρόσβασης!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container" style={{textAlign: 'center', marginTop: '100px'}}>
        <h2>Είσοδος Διαχειριστή</h2>
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{padding: '10px', width: '250px'}} />
          <input type="password" placeholder="Κωδικός" value={password} onChange={(e) => setPassword(e.target.value)} required style={{padding: '10px', width: '250px'}} />
          <button type="submit" className="save-btn" style={{width: '250px'}}>Είσοδος</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="admin-container">Φόρτωση...</div>;

  return (
    <div className="admin-container">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Διαχείριση Premium Αιτήσεων</h2>
        <button onClick={() => signOut(auth)} className="save-btn" style={{backgroundColor: '#ef4444'}}>Έξοδος</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>PIN</th>
            <th>Επικοινωνία</th>
            <th>Αρχεία Πελάτη</th>
            <th>Κατάσταση</th>
            <th>Παράδοση Report (PDF)</th>
            <th>Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(requests).map((pin) => {
            const req = requests[pin];
            return (
              <tr key={pin}>
                <td><strong>{pin}</strong></td>
                <td>
                  <div>{req.email}</div>
                  {req.phone && (
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      ☎ {req.phone}
                    </div>
                  )}
                </td>
                <td>
                  <ArxeiaPelati req={req} />
                </td>
                <td>
                  <select
                    className="status-select"
                    defaultValue={req.status}
                    onChange={(e) => req.tempStatus = e.target.value}
                  >
                    {KATASTASEIS.map((k) => (
                      <option key={k.kodikos} value={k.kodikos}>{k.etiketa}</option>
                    ))}
                  </select>
                </td>
                <td>
                   <div className="admin-upload-wrapper">
                      <label className="custom-file-upload">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleAdminFileUpload(e, pin)}
                        />
                        {uploadingPin === pin ? "⏳..." : "📤 Ανέβασμα"}
                      </label>
                      {req.finalReportUrl && <span className="upload-success-badge">✅ Έτοιμο</span>}
                   </div>
                </td>
                <td style={{display: 'flex', gap: '5px'}}>
                  <button className="save-btn" onClick={() => handleUpdate(pin, { status: req.tempStatus || req.status })}>💾</button>
                  <button onClick={() => handleDelete(pin)} className="delete-btn">🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
