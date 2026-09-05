import { ref as storageRef, uploadBytes, deleteObject } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
import { storage, db } from "../../firebase";

/* ══════════════════════════════════════════════════════════════
   Η ΣΕΙΡΑ ΤΩΝ ΒΗΜΑΤΩΝ

   1. anevasmaAitisis()   -> ανεβαίνουν τα αρχεία και δημιουργείται η αίτηση
   2. (εκτός εφαρμογής)      ελέγχουμε τον φάκελο· αν λείπει κάτι, επικοινωνούμε
   3. prosthikiSeAitisi() -> ο πελάτης στέλνει τα συμπληρωματικά έγγραφα
   4. katagrafiPliromis() -> η αίτηση ενημερώνεται όταν γίνει η πληρωμή

   ΠΡΟΣΟΧΗ: το βήμα 4 ΔΕΝ καλείται από εδώ. Η πληρωμή δεν ζητείται
   πλέον τη στιγμή της αποστολής, αλλά αφού ελεγχθεί ο φάκελος.
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   Η ΔΙΕΥΘΥΝΣΗ ΤΗΣ ΣΥΝΑΡΤΗΣΗΣ

   Μπαίνει στο .env.local ως VITE_SYMPLIROSI_AITISIS_URL και στις
   Environment Variables του Vercel. Παίρνεται από το αποτέλεσμα του
   firebase deploy: είναι η γραμμή που τελειώνει σε symplirosiAitisis.
   ══════════════════════════════════════════════════════════════ */
const DIEFTHYNSI_SYMPLIROSIS = import.meta.env.VITE_SYMPLIROSI_AITISIS_URL;

/* Η κατάσταση της αίτησης. Παίρνεται από το αποτέλεσμα του
   firebase deploy: η γραμμή που τελειώνει σε getRequestStatus. */
const DIEFTHYNSI_KATASTASIS = import.meta.env.VITE_GET_REQUEST_STATUS_URL;

/* Η επιβεβαίωση της πληρωμής. Η γραμμή που τελειώνει σε
   epivevaiosiPliromis. */
const DIEFTHYNSI_EPIVEVAIOSIS = import.meta.env.VITE_EPIVEVAIOSI_PLIROMIS_URL;

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

/* Ο κωδικός γράφεται πάντα ολόκληρος, όπως αποθηκεύεται στη βάση,
   ακόμη κι αν ο χρήστης πληκτρολόγησε μόνο τα έξι ψηφία. */
const plirisKodikos = (pin) =>
  `PIN-${String(pin || "").replace(/^PIN[-\s]*/i, "").trim()}`;

/* Οι διευθύνσεις email αποθηκεύονται και συγκρίνονται με πεζά. Χωρίς
   αυτό, το «Onoma@Mail.com» δεν θα ταίριαζε ποτέ με το ίδιο του τον
   εαυτό γραμμένο αλλιώς. */
const kanoniko = (email) => String(email || "").trim().toLowerCase();

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
  kodikos_lathos: {
    kodikos: "kodikos_den_tairiazei",
    minima:
      "Δεν βρέθηκε αίτηση με αυτόν τον κωδικό και αυτό το email. Ελέγξτε τα έξι ψηφία και τη διεύθυνση που είχατε δώσει, ή αφήστε το πεδίο του κωδικού κενό για να ανοίξει νέα αίτηση.",
  },
  ypiresia: {
    kodikos: "ypiresia_mi_diathesimi",
    minima:
      "Η υπηρεσία δεν είναι διαθέσιμη αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο ή επικοινωνήστε μαζί μας.",
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

/* Μιλάει με τη συνάρτηση symplirosiAitisis. Επιστρέφει πάντα
   αντικείμενο, ποτέ δεν πετάει σφάλμα προς τα έξω. */
const klisiSynartisis = async (soma, diefthynsi = DIEFTHYNSI_SYMPLIROSIS) => {
  if (!diefthynsi) {
    console.error("Λείπει η διεύθυνση της συνάρτησης στο .env.local.");
    return { success: false, kodikos: MINYMATA.ypiresia.kodikos };
  }

  try {
    const apantisi = await fetch(diefthynsi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soma),
    });

    const dedomena = await apantisi.json().catch(() => ({}));

    if (!apantisi.ok || dedomena.success === false) {
      return { success: false, kodikos: MINYMATA.ypiresia.kodikos };
    }

    return { success: true, ...dedomena };
  } catch (error) {
    console.error("Σφάλμα επικοινωνίας με τη συνάρτηση:", error);
    return { success: false, kodikos: MINYMATA.syndesi.kodikos };
  }
};

/* ══════════════════════════════════════════════════════════════
   ΕΛΕΓΧΟΣ: υπάρχει ήδη αίτηση με αυτό το email;

   Καλείται ΜΟΝΟ τη στιγμή της υποβολής, όχι καθώς πληκτρολογεί ο
   χρήστης. Έτσι κανείς δεν μπορεί να δοκιμάζει διευθύνσεις γρήγορα
   για να μάθει ποιος χρησιμοποίησε την υπηρεσία.

   Αν η υπηρεσία δεν απαντήσει, επιστρέφει false: ο έλεγχος αυτός
   είναι βοήθεια, όχι φραγμός. Δεν σταματά ποτέ την αποστολή.
   ══════════════════════════════════════════════════════════════ */
export const elegxosYparxousasAitisis = async (email) => {
  const apotelesma = await klisiSynartisis({
    energeia: "elegxos_email",
    email: kanoniko(email),
  });

  return Boolean(apotelesma.success && apotelesma.yparxei);
};

/* ══════════════════════════════════════════════════════════════
   Η ΚΑΤΑΣΤΑΣΗ ΜΙΑΣ ΑΙΤΗΣΗΣ

   Καλείται από τη σελίδα Παρακολούθησης. Μέχρι σήμερα η σελίδα
   διάβαζε τη βάση απευθείας από τον browser του επισκέπτη, κάτι που
   απαιτούσε ανοιχτή βάση για όλους. Τώρα ρωτάει τη συνάρτηση, που
   απαντά μόνο με το στάδιο της αίτησης.

   Επιστρέφει πάντα αντικείμενο. Το «vrethike» ξεχωρίζει τα δύο
   αποτελέσματα: δεν βρέθηκε αίτηση, ή δεν απάντησε η υπηρεσία.
   ══════════════════════════════════════════════════════════════ */
export const katastasiAitisis = async (pin, email) => {
  const apotelesma = await klisiSynartisis(
    {
      pin: plirisKodikos(pin),
      email: kanoniko(email),
    },
    DIEFTHYNSI_KATASTASIS
  );

  if (!apotelesma.success) {
    return { success: false, kodikos: MINYMATA.ypiresia.kodikos };
  }

  return {
    success: true,
    vrethike: Boolean(apotelesma.vrethike),
    aitisi: apotelesma.vrethike
      ? {
          pin: apotelesma.pin,
          email: apotelesma.email,
          status: apotelesma.status,
          finalReportUrl: apotelesma.finalReportUrl || null,
        }
      : null,
  };
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
      email: kanoniko(email),
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
   ΒΗΜΑ 3 — Συμπληρωματικά έγγραφα σε ΥΠΑΡΧΟΥΣΑ αίτηση

   Ο πελάτης που του ζητήσαμε κάτι επιπλέον γράφει τον κωδικό του
   στη φόρμα. Τα αρχεία μπαίνουν στον ίδιο φάκελο και ΔΕΝ ανοίγει
   δεύτερη αίτηση με άλλον κωδικό.

   Η σειρά έχει σημασία:
   1. Ελέγχουμε ΠΡΩΤΑ αν ταιριάζουν κωδικός και email. Αλλιώς θα
      ανέβαιναν αρχεία που κανείς δεν θα μπορούσε να χρησιμοποιήσει.
   2. Ανεβαίνουν τα αρχεία.
   3. Η συνάρτηση τα προσθέτει στη λίστα της αίτησης.

   Τα ονόματα των νέων αρχείων ξεκινούν με χρονοσήμανση, ώστε να μην
   πατήσουν πάνω σε παλιότερα με το ίδιο όνομα.
   ══════════════════════════════════════════════════════════════ */
export const prosthikiSeAitisi = async (pin, email, arxeia, onProodos) => {
  const kodikos = plirisKodikos(pin);
  const emailKanoniko = kanoniko(email);
  const lista = Array.from(arxeia || []);

  if (!lista.length) {
    return { success: false, kodikos: "xoris_arxeia", error: MINYMATA.arxeio.minima };
  }

  // --- 1. Ταιριάζουν κωδικός και email; ---
  const elegxos = await klisiSynartisis({
    energeia: "elegxos_kodikou",
    pin: kodikos,
    email: emailKanoniko,
  });

  if (!elegxos.success) {
    return {
      success: false,
      kodikos: MINYMATA.ypiresia.kodikos,
      error: MINYMATA.ypiresia.minima,
    };
  }

  if (!elegxos.tairiazei) {
    return {
      success: false,
      kodikos: MINYMATA.kodikos_lathos.kodikos,
      error: MINYMATA.kodikos_lathos.minima,
    };
  }

  // --- 2. Ανέβασμα των αρχείων ---
  const stigmi = Date.now();
  const anevasmena = [];

  for (let i = 0; i < lista.length; i++) {
    const arxeio = lista[i];
    const arithmos = String(i + 1).padStart(2, "0");
    const diadromi = `premium_uploads/${kodikos}/${stigmi}-${arithmos}-${katharoOnoma(arxeio.name)}`;

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
      const { kodikos: kod, minima } = anagnorisiSfalmatos(error);
      return { success: false, kodikos: kod, error: minima };
    }
  }

  // --- 3. Προσθήκη στη λίστα της αίτησης ---
  const prosthiki = await klisiSynartisis({
    energeia: "prosthiki_arxeion",
    pin: kodikos,
    email: emailKanoniko,
    arxeia: anevasmena,
  });

  if (!prosthiki.success || !prosthiki.tairiazei) {
    await katharismosMisoanevasmenon(anevasmena.map((a) => a.path));
    return {
      success: false,
      kodikos: MINYMATA.vasi.kodikos,
      error: MINYMATA.vasi.minima,
    };
  }

  return {
    success: true,
    pin: kodikos,
    symplirosi: true,
    plithosArxeion: anevasmena.length,
    synolikaArxeia: prosthiki.plithosArxeion,
  };
};

/* ══════════════════════════════════════════════════════════════
   ΒΗΜΑ 4 — Σύνδεση της αίτησης με την πληρωμή

   Καλείται από τη σελίδα Παρακολούθησης, όταν ο πελάτης πληρώσει.

   Η ΑΛΛΑΓΗ: μέχρι σήμερα η σελίδα έγραφε μόνη της «πληρώθηκε» στη
   βάση, χωρίς να ρωτήσει κανέναν. Όποιος ακύρωνε τη χρέωση μπορούσε
   να εμφανιστεί ως πληρωμένος. Τώρα η σελίδα δεν γράφει τίποτα:
   στέλνει τον αριθμό της συναλλαγής στη συνάρτηση, εκείνη ρωτάει το
   Stripe, και η ένδειξη μπαίνει μόνο αν το Stripe το επιβεβαιώσει.
   ══════════════════════════════════════════════════════════════ */
export const katagrafiPliromis = async (pin, paymentIntentId, epipleon = {}) => {
  const apotelesma = await klisiSynartisis(
    {
      pin: plirisKodikos(pin),
      email: kanoniko(epipleon.email),
      paymentIntentId,
      ypanaxorisiAt: epipleon.ypanaxorisiAt || null,
    },
    DIEFTHYNSI_EPIVEVAIOSIS
  );

  if (!apotelesma.success || !apotelesma.plirothike) {
    console.error("Η πληρωμή δεν επιβεβαιώθηκε από τον server.");
    return { success: false, kodikos: "provlima_katagrafis_pliromis" };
  }

  return { success: true };
};
