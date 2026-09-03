/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΕΙΟ ΔΟΚΙΜΩΝ — ΠΡΟΣΩΡΙΝΟ

   Υπάρχει μόνο επειδή το Firebase βρίσκεται σε δωρεάν πλάνο (Spark)
   και δεν δέχεται ανεβάσματα αρχείων.

   Τι κάνει: γράφει κανονικά την αίτηση στη βάση, με ψεύτικες διαδρομές
   αρχείων. Έτσι δουλεύουν και δοκιμάζονται ο πίνακας διαχείρισης και η
   σελίδα Παρακολούθησης, χωρίς να ανέβει τίποτα στο Storage.

   Περιέχει επίσης ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΤΗΣ ΦΟΡΜΑΣ ΚΑΡΤΑΣ, ώστε να ελέγχεται η
   εμφάνισή της. Η φόρμα είναι η αληθινή· απλώς δεν μπορεί να πληρώσει,
   γιατί λείπει ο server. Στην κανονική υπηρεσία η φόρμα αυτή θα ζει στη
   σελίδα Παρακολούθησης Αίτησης, όχι εδώ.

   ────────────────────────────────────────────────────────────────────
   ΠΩΣ ΔΙΑΓΡΑΦΕΤΑΙ, ΟΤΑΝ ΕΝΕΡΓΟΠΟΙΗΘΕΙ ΤΟ BLAZE

   1. Σβήνεις ΟΛΟΚΛΗΡΟ αυτό το αρχείο.
   2. Στο PremiumUploadPage.jsx σβήνεις τις δύο γραμμές που είναι
      σημειωμένες με «ΓΡΑΜΜΗ ΔΟΚΙΜΩΝ». Είναι δύο, όχι περισσότερες.

   Τίποτε άλλο δεν έχει πειραχτεί. Ο κανονικός κώδικας είναι ανέπαφος.
   ══════════════════════════════════════════════════════════════════════ */

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ref as dbRef, set } from "firebase/database";
import { db } from "../../firebase";

/* Διαδρομή προς το StripePaymentForm.jsx, από τον φάκελο services/stripe.
   Το αρχείο βρίσκεται στο src/components/stripe. */
import StripePaymentForm from '../../components/stripe/StripePaymentForm';

/* Ο διακόπτης. Με false, η σελίδα δουλεύει κανονικά και προσπαθεί
   πραγματικό ανέβασμα — χρήσιμο για να ελέγξεις αν το Blaze δούλεψε,
   χωρίς να πειράξεις τίποτα άλλο. */
export const DOKIMASTIKI_LEITOURGIA = true;

const dimiourgiaKodikou = () => {
  const arithmos = Math.floor(100000 + Math.random() * 900000);
  return `PIN-${arithmos}`;
};

/* Ίδια υπογραφή με το anevasmaAitisis του premiumService.js, ώστε η
   σελίδα να μη χρειάζεται να ξέρει ποιο από τα δύο καλεί. */
export const dokimastikoAnevasma = async (stoicheia, arxeia, onProodos) => {
  const { email, tilefono } = stoicheia || {};
  const pin = dimiourgiaKodikou();
  const lista = Array.from(arxeia || []);

  /* Ψεύτικο ανέβασμα, με μισό δευτερόλεπτο ανά αρχείο, ώστε να φαίνεται
     η ένδειξη προόδου όπως θα φαίνεται και στην πραγματικότητα. */
  const anevasmena = [];
  for (let i = 0; i < lista.length; i++) {
    const arxeio = lista[i];
    if (typeof onProodos === "function") onProodos(i + 1, lista.length);
    await new Promise((r) => setTimeout(r, 500));

    anevasmena.push({
      path: `DOKIMASTIKO/${pin}/${String(i + 1).padStart(2, "0")}`,
      name: arxeio.name,
      size: arxeio.size,
      type: arxeio.type,
    });
  }

  /* Η εγγραφή στη βάση είναι ΑΛΗΘΙΝΗ. Η Realtime Database λειτουργεί
     κανονικά και στο Spark. Μόνο τα αρχεία λείπουν. */
  try {
    await set(dbRef(db, `premium_requests/${pin}`), {
      pin,
      email,
      phone: tilefono || null,
      files: anevasmena,
      fileCount: anevasmena.length,
      status: "documents_received",
      createdAt: Date.now(),
      consentAt: Date.now(),
      paymentIntentId: null,
      paymentStatus: "not_requested",
      // Σημάδι ότι είναι δοκιμαστική. Βοηθάει να τις ξεχωρίζεις και να
      // τις σβήσεις μαζικά αργότερα.
      dokimastiki: true,
    });
  } catch (error) {
    console.error("Δοκιμαστική καταχώριση: σφάλμα στη βάση", error);
    return {
      success: false,
      kodikos: "provlima_katagrafis",
      error:
        "Η δοκιμαστική αίτηση δεν καταχωρήθηκε. Ελέγξτε τους κανόνες της βάσης στο Firebase.",
    };
  }

  return { success: true, pin, plithosArxeion: anevasmena.length };
};


/* ══════════════════════════════════════════════════════════════════════
   ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΤΗΣ ΦΟΡΜΑΣ ΚΑΡΤΑΣ

   Δείχνει την πραγματική φόρμα του Stripe. Τα πεδία εμφανίζονται και
   δέχονται νούμερα κανονικά — δεν χρειάζονται server γι' αυτό.

   Μόλις πατηθεί το κουμπί, η φόρμα ζητά από τον server να ετοιμάσει την
   πληρωμή. Ο server δεν απαντά (δωρεάν πλάνο), οπότε εμφανίζεται μήνυμα
   σφάλματος. Αυτό είναι το αναμενόμενο.

   Δοκιμαστικός αριθμός κάρτας του Stripe: 4242 4242 4242 4242,
   οποιαδήποτε μελλοντική ημερομηνία, οποιοδήποτε CVC.
   ══════════════════════════════════════════════════════════════════════ */

/* Το δημόσιο κλειδί του Stripe. Δοκιμάζονται τα συνηθισμένα ονόματα,
   ώστε να μη χρειαστεί να ψάξεις πώς το έχεις γράψει. */
const KLEIDI_STRIPE =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  import.meta.env.VITE_STRIPE_KEY;

const stripePromise = KLEIDI_STRIPE ? loadStripe(KLEIDI_STRIPE) : null;

export const DokimastikiPliromi = () => {
  if (!stripePromise) {
    return (
      <div className="pu-notice pu-notice--error">
        <div>
          <p className="pu-notice-title">Η φόρμα κάρτας δεν μπορεί να εμφανιστεί</p>
          <p>
            Δεν βρέθηκε το δημόσιο κλειδί του Stripe στις μεταβλητές
            περιβάλλοντος. Ελέγξτε το αρχείο .env.local.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm onFileSubmit={async () => {}} />
    </Elements>
  );
};
