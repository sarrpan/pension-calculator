import React, { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './StripePaymentForm.css';

const CREATE_PAYMENT_INTENT_URL = import.meta.env.VITE_CREATE_PAYMENT_INTENT_URL;

/* ══════════════════════════════════════════════════════════════
   ΜΗΝΥΜΑΤΑ ΣΦΑΛΜΑΤΟΣ

   Ο browser και το Stripe δίνουν μηνύματα στα αγγλικά, γραμμένα για
   προγραμματιστές. Ο πελάτης δεν πρέπει να τα δει ποτέ.
   ══════════════════════════════════════════════════════════════ */
const MINYMA_DIKTYOU =
  'Η σύνδεση με την υπηρεσία πληρωμών δεν ήταν δυνατή. Δεν χρεωθήκατε. Δοκιμάστε ξανά σε λίγο· αν το πρόβλημα συνεχίζεται, επικοινωνήστε μαζί μας.';

const MINYMA_AGNOSTO =
  'Η πληρωμή δεν ολοκληρώθηκε. Δεν χρεωθήκατε. Δοκιμάστε ξανά σε λίγο ή επικοινωνήστε μαζί μας.';

/* Ξεχωρίζει τα σφάλματα δικτύου από τα υπόλοιπα. Το «Failed to fetch»
   είναι ό,τι λέει ο browser όταν δεν βρίσκει καθόλου τον διακομιστή. */
const elliniko_minima = (err) => {
  const keimeno = String(err?.message || '');

  if (
    err instanceof TypeError ||
    keimeno.includes('Failed to fetch') ||
    keimeno.includes('NetworkError') ||
    keimeno.includes('Load failed')
  ) {
    return MINYMA_DIKTYOU;
  }

  // Τα δικά μας μηνύματα είναι ήδη ελληνικά και τα κρατάμε.
  if (/[\u0370-\u03ff\u1f00-\u1fff]/.test(keimeno)) return keimeno;

  return MINYMA_AGNOSTO;
};

/* ──────────────────────────────────────────────
   Εικονίδια (inline SVG, χωρίς emoji)
   ────────────────────────────────────────────── */
const svgBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

const IconCard = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
  </svg>
);

const IconLock = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconAlert = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

const IconCheck = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   ΦΟΡΜΑ ΠΛΗΡΩΜΗΣ

   Εμφανίζεται αφού ελεγχθεί ο φάκελος του πελάτη. Η χρέωση είναι
   κανονική και εφάπαξ — δεν υπάρχει δέσμευση που εισπράττεται
   αργότερα, όπως στην παλιά σειρά των βημάτων.

   Το κουτάκι της υπαναχώρησης είναι νομική υποχρέωση, όχι επιλογή:
   χωρίς ρητή δήλωση του πελάτη ότι ζητά άμεση εκτέλεση, διατηρεί
   δικαίωμα επιστροφής χρημάτων για 14 ημέρες ακόμη και αφού λάβει
   την έκθεση. Είναι χωριστό από κάθε άλλη αποδοχή όρων· αν ήταν
   ενωμένο, δεν θα μετρούσε ως ρητή δήλωση.
   ══════════════════════════════════════════════════════════════ */
const StripePaymentForm = ({ onFileSubmit, timi = '20 €', pin, email }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Παρακολούθηση της συμπλήρωσης των τριών πεδίων της κάρτας
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isCardExpiryComplete, setIsCardExpiryComplete] = useState(false);
  const [isCardCvcComplete, setIsCardCvcComplete] = useState(false);

  // Η δήλωση υπαναχώρησης. Ποτέ προεπιλεγμένη.
  const [ypanaxorisi, setYpanaxorisi] = useState(false);

  const isCardComplete =
    isCardNumberComplete && isCardExpiryComplete && isCardCvcComplete;
  const isFormComplete = isCardComplete && ypanaxorisi;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !isFormComplete) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      if (!CREATE_PAYMENT_INTENT_URL) {
        throw new Error('Δεν έχει οριστεί η διεύθυνση δημιουργίας πληρωμής.');
      }

      /* Ο κωδικός και το email ταξιδεύουν μαζί, ώστε η συναλλαγή στο
         Stripe να μπορεί να αντιστοιχηθεί με την αίτηση. */
      const response = await fetch(CREATE_PAYMENT_INTENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, email }),
      });
      const data = await response.json();

      if (!response.ok || data.success === false || !data.clientSecret) {
        throw new Error(data.error || 'Αποτυχία δημιουργίας της πληρωμής.');
      }

      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false);
        return;
      }

      /* Αν η κατάσταση δεν είναι μία από τις δύο επιτυχείς, η πληρωμή
         ΔΕΝ πέρασε. Παλιότερα η περίπτωση αυτή περνούσε σιωπηλά και η
         σελίδα προχωρούσε σαν να είχε πληρωθεί. */
      if (
        paymentIntent?.status !== 'requires_capture' &&
        paymentIntent?.status !== 'succeeded'
      ) {
        setPaymentError(MINYMA_AGNOSTO);
        setIsProcessing(false);
        return;
      }

      /* Η δήλωση υπαναχώρησης περνάει μαζί με την πληρωμή, ώστε να
         καταγραφεί στη βάση με ημερομηνία και ώρα. */
      await onFileSubmit(paymentIntent.id, { ypanaxorisiAt: Date.now() });
      // Το isProcessing μένει ενεργό: η σελίδα από πάνω αλλάζει οθόνη.
    } catch (err) {
      console.error('Σφάλμα πληρωμής:', err);
      setPaymentError(elliniko_minima(err));
      setIsProcessing(false);
    }
  };

  // Κοινό στυλ για τα πεδία της κάρτας
  const ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#334155',
        fontFamily: 'inherit',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: { color: '#b91c1c' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="sp-form">
      <p className="sp-title">
        <IconCard className="sp-icon" />
        Στοιχεία κάρτας — πληρωμή {timi}
      </p>

      {/* Αριθμός κάρτας */}
      <div className="sp-field">
        <label className="sp-label" htmlFor="sp-card-number">Αριθμός κάρτας</label>
        <div className="sp-input" id="sp-card-number">
          <CardNumberElement
            options={ELEMENT_OPTIONS}
            onChange={(e) => setIsCardNumberComplete(e.complete)}
          />
        </div>
      </div>

      {/* Λήξη και CVC, δίπλα-δίπλα */}
      <div className="sp-row">
        <div className="sp-field">
          <label className="sp-label" htmlFor="sp-card-expiry">Λήξη (ΜΜ/ΕΕ)</label>
          <div className="sp-input" id="sp-card-expiry">
            <CardExpiryElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => setIsCardExpiryComplete(e.complete)}
            />
          </div>
        </div>

        <div className="sp-field">
          <label className="sp-label" htmlFor="sp-card-cvc">CVC</label>
          <div className="sp-input" id="sp-card-cvc">
            <CardCvcElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => setIsCardCvcComplete(e.complete)}
            />
          </div>
        </div>
      </div>

      {/* Δήλωση υπαναχώρησης — υποχρεωτική, ποτέ προεπιλεγμένη */}
      <label className={`sp-confirm ${ypanaxorisi ? 'is-checked' : ''}`}>
        <input
          type="checkbox"
          checked={ypanaxorisi}
          onChange={(e) => setYpanaxorisi(e.target.checked)}
          className="sp-visually-hidden"
          disabled={isProcessing}
        />
        <span className="sp-checkbox" aria-hidden="true">
          <IconCheck className="sp-checkbox-icon" />
        </span>
        <span className="sp-confirm-text">
          Ζητώ να ξεκινήσει άμεσα η εκτέλεση της υπηρεσίας και γνωρίζω ότι, μόλις
          ολοκληρωθεί, χάνω το δικαίωμα υπαναχώρησης.
        </span>
      </label>

      {paymentError && (
        <div className="sp-error" role="alert">
          <IconAlert className="sp-icon" />
          <span>{paymentError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !isFormComplete}
        className="sp-btn"
      >
        {isProcessing ? 'Γίνεται η πληρωμή…' : `Πληρωμή ${timi}`}
      </button>

      {isCardComplete && !ypanaxorisi && (
        <p className="sp-hint">
          Για να συνεχίσετε, επιλέξτε τη δήλωση παραπάνω.
        </p>
      )}

      <p className="sp-secure">
        <IconLock className="sp-icon-sm" />
        Η πληρωμή γίνεται μέσω Stripe. Τα στοιχεία της κάρτας σας δεν περνούν
        ούτε αποθηκεύονται στη δική μας σελίδα.
      </p>
    </form>
  );
};

export default StripePaymentForm;
