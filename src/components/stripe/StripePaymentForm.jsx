import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ onFileSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
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

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setPaymentError(error.message);
      } else if (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded") {
        // ΤΕΛΕΙΑ! Στέλνουμε το ID της δέσμευσης (π.χ. pi_3Mtw...) στην κεντρική φόρμα
        onFileSubmit(paymentIntent.id); // <-- ΝΕΟ: Προστέθηκε το paymentIntent.id
      }
    } catch (err) {
      console.error("Σφάλμα:", err);
      setPaymentError("Υπήρξε πρόβλημα με την επικοινωνία. Δοκιμάστε ξανά.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
      <label style={{ fontWeight: 'bold', display: 'block', margin: '0 0 15px 0', color: '#334155' }}>
        Στοιχεία Κάρτας (Δέσμευση 10€)
      </label>
      
      <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#334155',
              fontFamily: 'sans-serif',
              '::placeholder': { color: '#94a3b8' },
            },
            invalid: { color: '#b91c1c' },
          },
        }} />
      </div>

      {paymentError && (
        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #fee2e2' }}>
          {paymentError}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="submit-btn" 
        style={{ width: '100%', opacity: (!stripe || isProcessing) ? 0.7 : 1 }}
      >
        {isProcessing ? 'Επεξεργασία...' : 'Έγκριση Δέσμευσης & Υποβολή'}
      </button>
      
      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign: 'center', lineHeight: '1.4' }}>
        🔒 Η πληρωμή είναι ασφαλής μέσω <strong>Stripe</strong>. Τα χρήματα θα δεσμευτούν στην κάρτα σας και θα χρεωθούν οριστικά <strong>μόνο</strong> μετά την παράδοση του Report.
      </p>
    </form>
  );
};

export default StripePaymentForm;