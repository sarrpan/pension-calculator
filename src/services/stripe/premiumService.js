import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, set, update } from "firebase/database";
import { storage, db } from "../../firebase";

/* ══════════════════════════════════════════════════════════════
   ΣΕΙΡΑ ΤΩΝ ΒΗΜΑΤΩΝ

   1. anevasmaAitisis()   -> ανεβαίνει το PDF και δημιουργείται η αίτηση
   2. (ενδιάμεσα)            γίνεται η δέσμευση των 10€ στο Stripe
   3. katagrafiPliromis() -> η αίτηση ενημερώνεται με τον κωδικό πληρωμής

   Το αρχείο ανεβαίνει ΠΡΙΝ δεσμευτούν χρήματα. Έτσι, αν αποτύχει το
   ανέβασμα, ο πελάτης δεν έχει χάσει τίποτα.
   ══════════════════════════════════════════════════════════════ */

/* Οι καταστάσεις γράφονται με πεζά και κάτω παύλα, ώστε να ταιριάζουν
   με όσα διαβάζει η σελίδα «Παρακολούθηση Αίτησης». */
const KATASTASI_ARXIKI = "pending_payment";

const dimiourgiaKodikou = () => {
  const arithmos = Math.floor(100000 + Math.random() * 900000);
  return `PIN-${arithmos}`;
};

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΜΗΝΥΜΑΤΑ ΣΦΑΛΜΑΤΟΣ

   Κάθε μήνυμα λέει τι έγινε και τι μπορεί να κάνει ο χρήστης.
   Όπου το πρόβλημα είναι δικό μας, δεν ζητάμε από τον χρήστη να
   δοκιμάσει κάτι που δεν πρόκειται να πετύχει.
   ══════════════════════════════════════════════════════════════ */
const MINYMATA = {
  xoros: {
    kodikos: "xoris_apothikeytiko_xoro",
    minima:
      "Η υπηρεσία δεν μπορεί να δεχτεί αρχεία αυτή τη στιγμή. Δεν χρεωθήκατε. Δοκιμάστε αργότερα ή επικοινωνήστε μαζί μας.",
  },
  adeia: {
    kodikos: "xoris_adeia",
    minima:
      "Η αποστολή αρχείων δεν είναι διαθέσιμη αυτή τη στιγμή. Δεν χρεωθήκατε. Επικοινωνήστε μαζί μας για να σας εξυπηρετήσουμε.",
  },
  syndesi: {
    kodikos: "provlima_syndesis",
    minima:
      "Η αποστολή διακόπηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά. Δεν χρεωθήκατε.",
  },
  arxeio: {
    kodikos: "provlima_arxeiou",
    minima:
      "Το αρχείο δεν στάλθηκε σωστά. Δοκιμάστε ξανά, ή κατεβάστε εκ νέου το PDF από τον e-ΕΦΚΑ και ανεβάστε το.",
  },
  vasi: {
    kodikos: "provlima_katagrafis",
    minima:
      "Το αρχείο στάλθηκε, αλλά η αίτηση δεν καταχωρήθηκε. Μην πληρώσετε ξανά. Επικοινωνήστε μαζί μας για να την ολοκληρώσουμε.",
  },
  agnosto: {
    kodikos: "agnosto",
    minima:
      "Η αποστολή δεν ολοκληρώθηκε. Δοκιμάστε ξανά σε λίγο. Αν το πρόβλημα συνεχίζεται, επικοινωνήστε μαζί μας.",
  },
};

/* Μεταφράζει τον κωδικό σφάλματος του Firebase σε ελληνικό μήνυμα. */
const anagnorisiSfalmatos = (error) => {
  const kodikos = error?.code || "";

  switch (kodikos) {
    case "storage/quota-exceeded":
      return MINYMATA.xoros;

    case "storage/unauthorized":
    case "storage/unauthenticated":
    case "storage/project-not-found":
    case "storage/bucket-not-found":
      return MINYMATA.adeia;

    case "storage/retry-limit-exceeded":
    case "storage/canceled":
      return MINYMATA.syndesi;

    case "storage/invalid-checksum":
    case "storage/invalid-argument":
      return MINYMATA.arxeio;

    case "PERMISSION_DENIED":
    case "permission-denied":
      return MINYMATA.vasi;

    default:
      // Σφάλμα δικτύου χωρίς κωδικό (π.χ. κομμένη σύνδεση)
      if (error instanceof TypeError) return MINYMATA.syndesi;
      return MINYMATA.agnosto;
  }
};

/* ══════════════════════════════════════════════════════════════
   ΒΗΜΑ 1 — Ανέβασμα του αρχείου και δημιουργία της αίτησης
   Καλείται ΠΡΙΝ ζητηθεί κάρτα.
   ══════════════════════════════════════════════════════════════ */
export const anevasmaAitisis = async (email, file) => {
  const pin = dimiourgiaKodikou();
  const diadromiArxeiou = `premium_pdfs/${pin}.pdf`;

  // --- Ανέβασμα του PDF ---
  try {
    const anaforaArxeiou = storageRef(storage, diadromiArxeiou);
    await uploadBytes(anaforaArxeiou, file);
  } catch (error) {
    console.error("Σφάλμα στο ανέβασμα του αρχείου:", error);
    const { kodikos, minima } = anagnorisiSfalmatos(error);
    return { success: false, kodikos, error: minima };
  }

  // --- Καταχώριση της αίτησης στη βάση ---
  try {
    await set(dbRef(db, `premium_requests/${pin}`), {
      pin,
      email,
      pdfUrl: diadromiArxeiou,
      status: KATASTASI_ARXIKI,
      createdAt: Date.now(),
      // Συμπληρώνονται στο βήμα 3, μετά τη δέσμευση των χρημάτων.
      paymentIntentId: null,
      paymentStatus: "awaiting_payment",
    });
  } catch (error) {
    console.error("Σφάλμα στην καταχώριση της αίτησης:", error);
    const { kodikos, minima } = anagnorisiSfalmatos(error);
    return { success: false, kodikos, error: minima };
  }

  return { success: true, pin };
};

/* ══════════════════════════════════════════════════════════════
   ΒΗΜΑ 3 — Σύνδεση της αίτησης με τη δέσμευση των χρημάτων
   Καλείται ΜΕΤΑ την επιτυχή δέσμευση στο Stripe.

   Αν αποτύχει, τα χρήματα είναι δεσμευμένα αλλά η αίτηση δεν το
   γνωρίζει. Ο πελάτης δεν φταίει και δεν πρέπει να ξαναπληρώσει —
   γι' αυτό η σελίδα δείχνει τον κωδικό του κανονικά και τον καλεί
   να επικοινωνήσει αν δεν λάβει ενημέρωση.
   ══════════════════════════════════════════════════════════════ */
export const katagrafiPliromis = async (pin, paymentIntentId) => {
  try {
    await update(dbRef(db, `premium_requests/${pin}`), {
      paymentIntentId,
      paymentStatus: "authorized",
      paidAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα στην καταγραφή της πληρωμής:", error);
    return { success: false, kodikos: "provlima_katagrafis_pliromis" };
  }
};
