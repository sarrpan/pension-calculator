import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth, storage } from "../firebase"; 
import './AdminDashboard.css';

const CAPTURE_PAYMENT_URL = import.meta.env.VITE_CAPTURE_PAYMENT_URL;

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

  const handleUpdate = async (pin, newData) => {
    try {
      const currentRequest = requests[pin];

      if (newData.status === 'completed' && currentRequest.status !== 'completed') {
        if (currentRequest.paymentIntentId) {
          if (!CAPTURE_PAYMENT_URL) {
            throw new Error(
              'Δεν έχει οριστεί η διεύθυνση οριστικής είσπραξης.'
            );
          }

          const response = await fetch(CAPTURE_PAYMENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              paymentIntentId: currentRequest.paymentIntentId,
              customerEmail: currentRequest.email,
              pin: pin                            
            })
          });
          const result = await response.json();

          if (!response.ok || !result.success) {
            alert(`⚠️ Η πληρωμή απέτυχε: ${result.error || 'Άγνωστο σφάλμα'}`);
            return;
          }

          alert("✅ Η είσπραξη των 10€ ολοκληρώθηκε!");
        }
      }

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
            <th>Email</th>
            <th>Αρχείο Πελάτη</th>
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
                <td>{req.email}</td>
                <td>
                  <a href={req.pdfUrl} target="_blank" rel="noreferrer" className="admin-view-pdf">
                    <span className="icon">📄</span> Προβολή
                  </a>
                </td>
                <td>
                  <select 
                    className="status-select" 
                    defaultValue={req.status} 
                    onChange={(e) => req.tempStatus = e.target.value}
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
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
