import { ref as storageRef, uploadBytes, deleteObject } from "firebase/storage";
import { ref as dbRef, set, update } from "firebase/database";
import { storage, db } from "../../firebase";

/* ══════════════════════════════════════════════════════════════
   Η ΣΕΙΡΑ ΤΩΝ ΒΗΜΑΤΩΝ

   1. anevasmaAitisis()   -> ανεβαίνουν τα αρχεία και δημιουργείται η αίτηση
   2. (εκτός εφαρμογής)      ελέγχουμε τον φάκελο· αν λείπει κάτι, επικοινωνούμε
   3. katagrafiPliromis() -> η αίτηση ενημερώνεται όταν γίνει η πληρωμή

   ΠΡΟΣΟΧΗ: το βήμα 3 ΔΕΝ καλείται σήμερα από πουθενά. Η πληρωμή δεν
   ζητείται πλέον τη στιγμή της αποστολής, αλλά αφού ελεγχθεί ο φάκελος.
   Η συνάρτηση μένει εδώ έτοιμη για το κανάλι πληρωμής, όταν φτιαχτεί.
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   ΟΙ ΠΕΝΤΕ ΚΑΤΑΣΤΑΣΕΙΣ ΤΗΣ ΑΙΤΗΣΗΣ

   Είναι τα πέντε στάδια της σελίδας «Παρακολούθηση Αίτησης».
   Τα ίδια ακριβώς κείμενα πρέπει να αναγνωρίζονται και από το
   ReportRecoveryPage.jsx και από το AdminDashboard.
   ══════════════════════════════════════════════════════════════ */
export const KATASTASEIS = {
  PARALIFTHIKAN: "documents_received",   // Τα έγγραφα παραλήφθηκαν
  ELLIPI: "needs_more_info",             // Χρειάζονται επιπλέον στοιχεία
  ANAMONI_PLIROMIS: "awaiting_payment",  // Αναμονή πληρωμής
  SE_EPEXERGASIA: "processing",          // Σε επεξεργασία
  PARADOTHIKE: "delivered",              // Η έκθεση παραδόθηκε
};

const dimiourgiaKodikou = () => {
  const arithmos = Math.floor(100000 + Math.random() * 900000);
  return `PIN-${arithmos}`;
};

/* Το όνομα του αρχείου καθαρίζεται πριν αποθηκευτεί: ελληνικά, κενά
   και σημεία στίξης γίνονται κάτω παύλα. Η κατάληξη διατηρείται. */
const katharoOnoma = (onoma) => {
  const asfales = String(onoma || "arxeio")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_");
  return asfales.length > 60 ? asfales.slice(-60) : asfales;
};

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΜΗΝΥΜΑΤΑ ΣΦΑΛΜΑΤΟΣ

   Κάθε μήνυμα λέει τι έγινε και τι μπορεί να κάνει ο χρήστης.
   Δεν αναφέρεται πουθενά χρέωση: σε αυτό το βήμα δεν ζητούνται
   χρήματα, οπότε η διαβεβαίωση «δεν χρεωθήκατε» μόνο απορία θα
   δημιουργούσε.
   ══════════════════════════════════════════════════════════════ */
const MINYMATA = {
  xoros: {
    kodikos: "xoris_apothikeytiko_xoro",
    minima:
      "Η υπηρεσία δεν μπορεί να δεχτεί αρχεία αυτή τη στιγμή. Δοκιμάστε αργότερα ή επικοινωνήστε μαζί μας.",
  },
  adeia: {
    kodikos: "xoris_adeia",
    minima:
      "Η αποστολή αρχείων δεν είναι διαθέσιμη αυτή τη στιγμή. Επικοινωνήστε μαζί μας για να σας εξυπηρετήσουμε.",
  },
  syndesi: {
    kodikos: "provlima_syndesis",
    minima:
      "Η αποστολή διακόπηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
  },
  arxeio: {
    kodikos: "provlima_arxeiou",
    minima:
      "Κάποιο αρχείο δεν στάλθηκε σωστά. Δοκιμάστε ξανά ή αφαιρέστε το και στείλτε το χωριστά.",
  },
  vasi: {
    kodikos: "provlima_katagrafis",
    minima:
      "Τα αρχεία στάλθηκαν, αλλά η αίτηση δεν καταχωρήθηκε. Μην τα ξαναστείλετε. Επικοινωνήστε μαζί μας για να την ολοκληρώσουμε.",
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

/* Αν σπάσει το ανέβασμα στη μέση, τα ήδη ανεβασμένα αρχεία σβήνονται.
   Διαφορετικά μένουν ορφανά στο Storage, χωρίς αίτηση που να τα δείχνει. */
const katharismosMisoanevasmenon = async (diadromes) => {
  await Promise.all(
    diadromes.map(async (diadromi) => {
      try {
        await deleteObject(storageRef(storage, diadromi));
      } catch {
        // Αν δεν σβηστεί, δεν σταματά τίποτα. Το βλέπουμε από τον πίνακα.
      }
    })
  );
};

/* ══════════════════════════════════════════════════════════════
   ΒΗΜΑ 1 — Ανέβασμα των αρχείων και δημιουργία της αίτησης

   stoicheia: { email, tilefono }
   arxeia:    πίνακας File (1 έως 10)
   onProodos: προαιρετική συνάρτηση (trexon, synolo) για την ένδειξη
              προόδου στην οθόνη. Τα αρχεία ανεβαίνουν ένα-ένα, ώστε
              να ξέρουμε πάντα ποιο απέτυχε.
   ══════════════════════════════════════════════════════════════ */
export const anevasmaAitisis = async (stoicheia, arxeia, onProodos) => {
  const { email, tilefono } = stoicheia || {};
  const pin = dimiourgiaKodikou();
  const lista = Array.from(arxeia || []);

  if (!lista.length) {
    return { success: false, kodikos: "xoris_arxeia", error: MINYMATA.arxeio.minima };
  }

  const anevasmena = [];

  // --- Ανέβασμα των αρχείων, ένα-ένα ---
  for (let i = 0; i < lista.length; i++) {
    const arxeio = lista[i];
    const arithmos = String(i + 1).padStart(2, "0");
    const diadromi = `premium_uploads/${pin}/${arithmos}-${katharoOnoma(arxeio.name)}`;

    if (typeof onProodos === "function") onProodos(i + 1, lista.length);

    try {
      await uploadBytes(storageRef(storage, diadromi), arxeio);
      anevasmena.push({
        path: diadromi,
        name: arxeio.name,
        size: arxeio.size,
        type: arxeio.type,
      });
    } catch (error) {
      console.error(`Σφάλμα στο ανέβασμα του αρχείου ${arxeio.name}:`, error);
      await katharismosMisoanevasmenon(anevasmena.map((a) => a.path));
      const { kodikos, minima } = anagnorisiSfalmatos(error);
      return { success: false, kodikos, error: minima };
    }
  }

  // --- Καταχώριση της αίτησης στη βάση ---
  try {
    await set(dbRef(db, `premium_requests/${pin}`), {
      pin,
      email,
      phone: tilefono || null,
      files: anevasmena,
      fileCount: anevasmena.length,
      status: KATASTASEIS.PARALIFTHIKAN,
      createdAt: Date.now(),
      // Η συναίνεση για την επεξεργασία των εγγράφων, με χρόνο.
      consentAt: Date.now(),
      // Συμπληρώνονται αργότερα, όταν γίνει η πληρωμή.
      paymentIntentId: null,
      paymentStatus: "not_requested",
    });
  } catch (error) {
    console.error("Σφάλμα στην καταχώριση της αίτησης:", error);
    await katharismosMisoanevasmenon(anevasmena.map((a) => a.path));
    const { kodikos, minima } = anagnorisiSfalmatos(error);
    return { success: false, kodikos, error: minima };
  }

  return { success: true, pin, plithosArxeion: anevasmena.length };
};

/* ══════════════════════════════════════════════════════════════
   ΒΗΜΑ 3 — Σύνδεση της αίτησης με την πληρωμή

   ΔΕΝ ΚΑΛΕΙΤΑΙ ΣΗΜΕΡΑ. Μένει έτοιμη για το κανάλι πληρωμής, το
   οποίο θα ενεργοποιείται αφού ελεγχθεί ο φάκελος.
   ══════════════════════════════════════════════════════════════ */
export const katagrafiPliromis = async (pin, paymentIntentId, epipleon = {}) => {
  try {
    await update(dbRef(db, `premium_requests/${pin}`), {
      paymentIntentId,
      paymentStatus: "paid",
      paidAt: Date.now(),
      status: KATASTASEIS.SE_EPEXERGASIA,
      /* Η ώρα που ο πελάτης δήλωσε ότι ζητά άμεση εκτέλεση και
         παραιτείται από το δικαίωμα υπαναχώρησης. Νομικό τεκμήριο. */
      withdrawalConsentAt: epipleon.ypanaxorisiAt || null,
    });
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα στην καταγραφή της πληρωμής:", error);
    return { success: false, kodikos: "provlima_katagrafis_pliromis" };
  }
};
