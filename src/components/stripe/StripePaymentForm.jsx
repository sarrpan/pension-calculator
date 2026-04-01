import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ onFileSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States για να παρακολουθούμε αν συμπληρώθηκαν σωστά τα πεδία
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isCardExpiryComplete, setIsCardExpiryComplete] = useState(false);
  const [isCardCvcComplete, setIsCardCvcComplete] = useState(false);

  // Το κουμπί είναι ενεργό ΜΟΝΟ αν και τα τρία πεδία είναι πλήρη (true)
  const isFormComplete = isCardNumberComplete && isCardExpiryComplete && isCardCvcComplete;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !isFormComplete) {
      return;
    }

    setIsProcessing(true); // Ξεκινάει το loading και ΔΕΝ το σταματάμε εμείς!
    setPaymentError(null);

    try {
      const response = await fetch("https://createpaymentintent-jh2ye45fkq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false); // Σταματάμε το loading ΜΟΝΟ αν υπάρξει σφάλμα στην κάρτα
      } else if (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded") {
        // Καλούμε την κεντρική συνάρτηση για να ανεβάσει το PDF. 
        // ΔΕΝ κάνουμε setIsProcessing(false) εδώ, το αφήνουμε να γυρίζει μέχρι να βγει το PIN!
        await onFileSubmit(paymentIntent.id); 
      }
    } catch (err) {
      console.error("Σφάλμα:", err);
      setPaymentError("Υπήρξε πρόβλημα με την επικοινωνία. Δοκιμάστε ξανά.");
      setIsProcessing(false); // Σταματάμε το loading αν "σκάσει" το fetch
    }
  };

  // Κοινό στυλ για όλα τα πεδία της κάρτας
  const ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#334155',
        fontFamily: 'sans-serif',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: { color: '#b91c1c' },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <label style={{ fontWeight: '600', display: 'block', margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        💳 Στοιχεία Κάρτας (Δέσμευση 10€)
      </label>
      
      {/* Πεδίο: Αριθμός Κάρτας */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Αριθμός Κάρτας</label>
        <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', transition: 'border-color 0.2s' }}>
          <CardNumberElement 
            options={ELEMENT_OPTIONS} 
            onChange={(e) => setIsCardNumberComplete(e.complete)} 
          />
        </div>
      </div>

      {/* Δίπλα-δίπλα: Ημερομηνία & CVC */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Λήξη (ΜΜ/ΕΕ)</label>
          <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
            <CardExpiryElement 
              options={ELEMENT_OPTIONS} 
              onChange={(e) => setIsCardExpiryComplete(e.complete)}
            />
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>CVC</label>
          <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
            <CardCvcElement 
              options={ELEMENT_OPTIONS} 
              onChange={(e) => setIsCardCvcComplete(e.complete)}
            />
          </div>
        </div>
      </div>

      {paymentError && (
        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
          ⚠️ {paymentError}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing || !isFormComplete}
        className="submit-btn" 
        style={{ 
          width: '100%', 
          padding: '14px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: (!stripe || isProcessing || !isFormComplete) ? '#cbd5e1' : '#f97316',
          color: (!stripe || isProcessing || !isFormComplete) ? '#64748b' : '#ffffff',
          cursor: (!stripe || isProcessing || !isFormComplete) ? 'not-allowed' : 'pointer',
          border: 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        {isProcessing ? 'Επεξεργασία & Ανέβασμα Αρχείου... ⏳' : 'Έγκριση Δέσμευσης & Υποβολή'}
      </button>
      
      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px', textAlign: 'center', lineHeight: '1.5' }}>
        🔒 Η πληρωμή είναι απολύτως ασφαλής μέσω <strong>Stripe</strong>. <br/> Τα χρήματα θα δεσμευτούν και θα χρεωθούν οριστικά <strong>μόνο</strong> μετά την παράδοση του Report.
      </p>
    </form>
  );
};

export default StripePaymentForm;