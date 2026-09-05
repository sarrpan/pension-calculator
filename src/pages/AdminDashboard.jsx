import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, update, remove } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth, storage } from "../firebase";
import './AdminDashboard.css';

/* ══════════════════════════════════════════════════════════════
   Η ΔΙΕΥΘΥΝΣΗ ΤΗΣ ΣΥΝΑΡΤΗΣΗΣ

   Μπαίνει στο .env.local ως VITE_ALLAGI_KATASTASIS_URL και στις
   Environment Variables του Vercel. Παίρνεται από το αποτέλεσμα του
   firebase deploy: είναι η γραμμή που τελειώνει σε allagiKatastasis.
   ══════════════════════════════════════════════════════════════ */
const DIEFTHYNSI_ALLAGIS = import.meta.env.VITE_ALLAGI_KATASTASIS_URL;

/* ══════════════════════════════════════════════════════════════
   ΟΙ ΠΕΝΤΕ ΚΑΤΑΣΤΑΣΕΙΣ

   Ίδιοι κωδικοί με το premiumService.js και το ReportRecoveryPage.jsx.
   Αν αλλάξει ένας, αλλάζει και στα τρία αρχεία.

   Το «stelneiEmail» δηλώνει ποιες στέλνουν μήνυμα στον πελάτη. Η
   «Σε επεξεργασία» δεν στέλνει: ο πελάτης μόλις πλήρωσε και ξέρει
   ήδη ότι ξεκινά η δουλειά.
   ══════════════════════════════════════════════════════════════ */
const KATASTASEIS = [
  {
    kodikos: 'documents_received',
    etiketa: 'Τα έγγραφα παραλήφθηκαν',
    stelneiEmail: true,
  },
  {
    kodikos: 'needs_more_info',
    etiketa: 'Χρειάζονται επιπλέον στοιχεία',
    stelneiEmail: true,
    theleiKeimeno: true,
  },
  {
    kodikos: 'awaiting_payment',
    etiketa: 'Αναμονή πληρωμής',
    stelneiEmail: true,
  },
  {
    kodikos: 'processing',
    etiketa: 'Σε επεξεργασία',
    stelneiEmail: false,
  },
  {
    kodikos: 'delivered',
    etiketa: 'Η έκθεση παραδόθηκε',
    stelneiEmail: true,
    theleiEkthesi: true,
  },
];

const vresKatastasi = (kodikos) =>
  KATASTASEIS.find((k) => k.kodikos === kodikos) || null;

/* Ημερομηνία και ώρα σε ελληνική μορφή, για το ιστορικό. */
const imerominia = (xronos) => {
  if (!xronos) return '';
  try {
    return new Date(xronos).toLocaleString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/* ══════════════════════════════════════════════════════════════
   Η ΛΙΣΤΑ ΤΩΝ ΑΡΧΕΙΩΝ ΜΙΑΣ ΑΙΤΗΣΗΣ

   Βγήκε έξω από το ArxeiaPelati ώστε να μπορεί να τη διαβάσει και ο
   έλεγχος για τα νέα αρχεία, χωρίς να γραφτεί δεύτερη φορά.

   Δέχεται και τη ΠΑΛΙΑ μορφή (ένα πεδίο pdfUrl), για τις δοκιμαστικές
   αιτήσεις που είχαν καταχωρηθεί πριν την αλλαγή.
   ══════════════════════════════════════════════════════════════ */
const listaArxeion = (req) => {
  if (!req) return [];
  if (Array.isArray(req.files) && req.files.length) return req.files;
  if (req.pdfUrl) return [{ path: req.pdfUrl, name: 'Αρχείο πελάτη' }];
  return [];
};

/* ══════════════════════════════════════════════════════════════
   Η ΤΕΛΕΥΤΑΙΑ ΑΠΟΣΤΟΛΗ ΜΙΑΣ ΑΙΤΗΣΗΣ

   Από όλο το ιστορικό κρατά μόνο την πιο πρόσφατη εγγραφή, ώστε να
   φαίνεται σε μία γραμμή τι έγινε τελευταίο.
   ══════════════════════════════════════════════════════════════ */
const teleftaiaApostoli = (istoriko) => {
  const kleidia = Object.keys(istoriko || {});
  if (!kleidia.length) return null;

  let korifi = kleidia[0];
  kleidia.forEach((k) => {
    if ((istoriko[k] || 0) > (istoriko[korifi] || 0)) korifi = k;
  });

  const katastasi = vresKatastasi(korifi);
  return {
    etiketa: katastasi ? katastasi.etiketa : korifi,
    xronos: istoriko[korifi],
  };
};

/* ══════════════════════════════════════════════════════════════
   ΕΙΚΟΝΙΔΙΑ

   Αντικαθιστούν τα emoji, όπως έγινε και στη φόρμα πληρωμής. Τα
   emoji εμφανίζονται διαφορετικά σε κάθε σύστημα και σε κάποια
   δεν εμφανίζονται καθόλου.
   ══════════════════════════════════════════════════════════════ */
const svgBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  width: 16,
  height: 16,
};

const IconArxeio = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

const IconAnevasma = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

const IconOk = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconDiagrafi = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M9 7V4h6v3" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΑΡΧΕΙΑ ΤΟΥ ΠΕΛΑΤΗ

   Στη βάση αποθηκεύεται η διαδρομή του κάθε αρχείου, όχι σύνδεσμος.
   Ο σύνδεσμος λήψης παράγεται τη στιγμή που τον ζητάς, ώστε να μην
   γίνονται δεκάδες κλήσεις κάθε φορά που ανοίγει ο πίνακας.

   Όποιο αρχείο έφτασε ΑΦΟΥ άνοιξε η σελίδα παίρνει σήμανση ΝΕΟ.
   ══════════════════════════════════════════════════════════════ */
const ArxeiaPelati = ({ req, nea }) => {
  const [fortoni, setFortoni] = useState(null);

  const lista = listaArxeion(req);
  const neaSet = new Set(nea || []);

  if (!lista.length) {
    return <span className="ad-keno">—</span>;
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
      {lista.map((arxeio, index) => {
        const einaiNeo = neaSet.has(arxeio.path);
        return (
          <button
            key={arxeio.path || index}
            type="button"
            className={einaiNeo ? 'admin-view-pdf ad-arxeio-neo' : 'admin-view-pdf'}
            onClick={() => anoigma(arxeio, index)}
            title={arxeio.name}
          >
            <IconArxeio />
            {fortoni === index ? ' Άνοιγμα…' : ` ${index + 1}. ${arxeio.name}`}
            {einaiNeo && <span className="ad-neo">ΝΕΟ</span>}
          </button>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ΤΟ ΙΣΤΟΡΙΚΟ ΤΩΝ EMAIL

   Δείχνει τι έχει σταλεί και πότε. Χωρίς αυτό δεν υπάρχει τρόπος να
   ξέρεις αν ο πελάτης ειδοποιήθηκε ή αν το email κόλλησε.
   ══════════════════════════════════════════════════════════════ */
const IstorikoEmail = ({ istoriko }) => {
  const kleidia = Object.keys(istoriko || {});

  if (!kleidia.length) {
    return <span className="ad-keno">Καμία αποστολή</span>;
  }

  return (
    <ul className="ad-istoriko">
      {kleidia.map((k) => {
        const katastasi = vresKatastasi(k);
        return (
          <li key={k}>
            <IconOk width={12} height={12} />
            {' '}
            {katastasi ? katastasi.etiketa : k}
            <span className="ad-istoriko-ora"> · {imerominia(istoriko[k])}</span>
          </li>
        );
      })}
    </ul>
  );
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uploadingPin, setUploadingPin] = useState(null);

  /* Ο κωδικός της συνάρτησης. Πληκτρολογείται μία φορά ανά επίσκεψη
     και ΔΕΝ αποθηκεύεται πουθενά. Αν γραφόταν μέσα στον κώδικα, θα
     ήταν ορατός σε όποιον δει τον πηγαίο κώδικα της σελίδας. */
  const [kodikosSynartisis, setKodikosSynartisis] = useState('');

  /* Γίνεται true μόλις ολοκληρωθεί η πρώτη επιτυχημένη ενέργεια.
     Δεν υπάρχει τρόπος να ελεγχθεί ο κωδικός ενώ πληκτρολογείται —
     μόνο η πρώτη αποστολή αποδεικνύει ότι είναι σωστός. */
  const [kodikosOk, setKodikosOk] = useState(false);

  /* Οι επιλογές σου ανά αίτηση, μέχρι να πατήσεις αποθήκευση.
     Παλιότερα γράφονταν πάνω στο ίδιο το αντικείμενο της αίτησης
     (req.tempStatus). Το React δεν το παρακολουθούσε, οπότε κάθε
     ενημέρωση από τη βάση έσβηνε σιωπηλά την επιλογή. */
  const [epiloges, setEpiloges] = useState({});
  const [keimena, setKeimena] = useState({});
  const [stelnei, setStelnei] = useState(null);
  const [apotelesmata, setApotelesmata] = useState({});

  /* Τα αρχεία που υπήρχαν τη στιγμή που πρωτοεμφανίστηκε η κάθε
     αίτηση στην οθόνη. Ό,τι έρθει μετά σημαίνεται ως ΝΕΟ, μέχρι να
     ανανεωθεί η σελίδα. */
  const arxikaArxeia = useRef({});
  const [neaArxeia, setNeaArxeia] = useState({});

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
      const dedomena = snapshot.val() || {};

      const nea = {};
      Object.keys(dedomena).forEach((pin) => {
        const diadromes = listaArxeion(dedomena[pin]).map((a) => a.path);

        if (!arxikaArxeia.current[pin]) {
          arxikaArxeia.current[pin] = new Set(diadromes);
          return;
        }

        const arxika = arxikaArxeia.current[pin];
        const kainourgia = diadromes.filter((d) => d && !arxika.has(d));
        if (kainourgia.length) nea[pin] = kainourgia;
      });

      setNeaArxeia(nea);
      setRequests(dedomena);
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

      setApotelesmata((p) => ({
        ...p,
        [pin]: { ok: true, minima: 'Η έκθεση ανέβηκε και συνδέθηκε με την αίτηση.' },
      }));
    } catch (error) {
      console.error(error);
      setApotelesmata((p) => ({
        ...p,
        [pin]: { ok: false, minima: 'Το ανέβασμα της έκθεσης απέτυχε.' },
      }));
    }
    setUploadingPin(null);
  };

  /* ══════════════════════════════════════════════════════════════
     ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ ΚΑΙ ΑΠΟΣΤΟΛΗ EMAIL

     Ένα πάτημα κάνει και τα δύο. Η αλλαγή ΔΕΝ γίνεται πια απευθείας
     στη βάση από εδώ: γίνεται μέσα στη συνάρτηση, μαζί με το email,
     ώστε να μην υπάρξει ποτέ κατάσταση που άλλαξε χωρίς να σταλεί
     μήνυμα, ή μήνυμα που στάλθηκε χωρίς να αλλάξει η κατάσταση.
     ══════════════════════════════════════════════════════════════ */
  const apostoli = async (pin, req) => {
    const nea = epiloges[pin] || req.status;
    const katastasi = vresKatastasi(nea);

    // --- Έλεγχοι πριν φύγει οτιδήποτε ---
    if (!DIEFTHYNSI_ALLAGIS) {
      setApotelesmata((p) => ({
        ...p,
        [pin]: {
          ok: false,
          minima: 'Δεν έχει οριστεί η διεύθυνση της συνάρτησης (VITE_ALLAGI_KATASTASIS_URL).',
        },
      }));
      return;
    }

    if (!kodikosSynartisis) {
      setApotelesmata((p) => ({
        ...p,
        [pin]: { ok: false, minima: 'Γράψτε πρώτα τον κωδικό διαχείρισης, πάνω στη σελίδα.' },
      }));
      return;
    }

    if (katastasi?.theleiKeimeno && !String(keimena[pin] || '').trim()) {
      setApotelesmata((p) => ({
        ...p,
        [pin]: { ok: false, minima: 'Γράψτε τι ακριβώς λείπει, πριν σταλεί το email.' },
      }));
      return;
    }

    if (katastasi?.theleiEkthesi && !req.finalReportUrl) {
      setApotelesmata((p) => ({
        ...p,
        [pin]: {
          ok: false,
          minima: 'Ανεβάστε πρώτα την έκθεση. Αλλιώς το email θα φύγει χωρίς συνημμένο.',
        },
      }));
      return;
    }

    setStelnei(pin);
    setApotelesmata((p) => ({ ...p, [pin]: null }));

    try {
      const apantisi = await fetch(DIEFTHYNSI_ALLAGIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-kodikos': kodikosSynartisis,
        },
        body: JSON.stringify({
          pin,
          katastasi: nea,
          keimeno: keimena[pin] || '',
          reportUrl: req.finalReportUrl || '',
        }),
      });

      const dedomena = await apantisi.json().catch(() => ({}));

      if (!apantisi.ok || dedomena.success === false) {
        // Λάθος κωδικός: η ένδειξη πάνω στη σελίδα ξαναγίνεται «δεν επιβεβαιώθηκε».
        if (apantisi.status === 401 || apantisi.status === 403) {
          setKodikosOk(false);
        }
        setApotelesmata((p) => ({
          ...p,
          [pin]: {
            ok: false,
            minima: dedomena.error || 'Η ενέργεια δεν ολοκληρώθηκε.',
          },
        }));
        setStelnei(null);
        return;
      }

      // Η ενέργεια πέρασε, άρα ο κωδικός είναι σωστός.
      setKodikosOk(true);

      const minima = dedomena.emailStalthike
        ? `Η κατάσταση άλλαξε και το email στάλθηκε στο ${dedomena.paraliptis}.`
        : dedomena.minima || 'Η κατάσταση άλλαξε. Δεν στάλθηκε email.';

      setApotelesmata((p) => ({ ...p, [pin]: { ok: true, minima } }));

      // Το πλαίσιο κειμένου αδειάζει, ώστε να μη σταλεί κατά λάθος ξανά.
      if (katastasi?.theleiKeimeno) {
        setKeimena((p) => ({ ...p, [pin]: '' }));
      }
    } catch (error) {
      console.error(error);
      setApotelesmata((p) => ({
        ...p,
        [pin]: {
          ok: false,
          minima:
            'Δεν βρέθηκε η συνάρτηση. Ελέγξτε αν είναι ανοιχτός ο λογαριασμός χρέωσης και αν έχει γίνει deploy.',
        },
      }));
    }

    setStelnei(null);
  };

  const handleDelete = async (pin) => {
    if (window.confirm(`Οριστική διαγραφή της αίτησης ${pin};`)) {
      await remove(ref(db, `premium_requests/${pin}`));
    }
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
      <div className="admin-container ad-login">
        <h2>Είσοδος Διαχειριστή</h2>
        <form onSubmit={handleLogin} className="ad-login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="save-btn">Είσοδος</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="admin-container">Φόρτωση...</div>;

  /* Οι νεότερες αιτήσεις πρώτες. Χωρίς ταξινόμηση, η σειρά είναι
     αυτή που τυχαίνει να δώσει η βάση. */
  const seira = Object.keys(requests).sort(
    (a, b) => (requests[b]?.createdAt || 0) - (requests[a]?.createdAt || 0)
  );

  /* Δύο αιτήσεις με το ίδιο email σημαίνει, συνήθως, ότι ο πελάτης
     ξανάστειλε έγγραφα χωρίς να γράψει τον κωδικό του (§9.11). */
  const metriteEmail = {};
  seira.forEach((pin) => {
    const e = (requests[pin]?.email || '').toLowerCase();
    if (e) metriteEmail[e] = (metriteEmail[e] || 0) + 1;
  });

  return (
    <div className="admin-container">
      <div className="ad-header">
        <h2>Διαχείριση Premium Αιτήσεων</h2>
        <button onClick={() => signOut(auth)} className="delete-btn">Έξοδος</button>
      </div>

      {/* Ο κωδικός της συνάρτησης, μία φορά για όλες τις αιτήσεις */}
      <div className="ad-kodikos-bar">
        <label htmlFor="ad-kodikos">Κωδικός διαχείρισης</label>
        <input
          id="ad-kodikos"
          type="password"
          value={kodikosSynartisis}
          onChange={(e) => {
            setKodikosSynartisis(e.target.value);
            setKodikosOk(false);
          }}
          placeholder="ADMIN_EMAIL_KODIKOS"
          autoComplete="off"
        />

        {kodikosOk ? (
          <span className="ad-kodikos-ok">
            <IconOk width={14} height={14} /> Ο κωδικός επιβεβαιώθηκε
          </span>
        ) : (
          <span className="ad-kodikos-akyros">Δεν έχει επιβεβαιωθεί ακόμα</span>
        )}

        <span className="ad-kodikos-note">
          Χρειάζεται για να σταλεί οποιοδήποτε email. Δεν αποθηκεύεται —
          γράφεται ξανά σε κάθε επίσκεψη.
        </span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>PIN</th>
            <th>Επικοινωνία</th>
            <th>Αρχεία Πελάτη</th>
            <th>Κατάσταση και email</th>
            <th>Παράδοση Report (PDF)</th>
            <th>Ιστορικό</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {seira.map((pin) => {
            const req = requests[pin];
            const epilogi = epiloges[pin] || req.status;
            const katastasi = vresKatastasi(epilogi);
            const apotelesma = apotelesmata[pin];
            const diplo =
              req.email && metriteEmail[(req.email || '').toLowerCase()] > 1;

            /* Η τελευταία αποστολή της αίτησης, και το αν η κατάσταση
               που είναι ΤΩΡΑ επιλεγμένη έχει ήδη σταλεί κάποτε. */
            const teleftaia = teleftaiaApostoli(req.emailIstoriko);
            const stalthikeXronos = (req.emailIstoriko || {})[epilogi];

            return (
              <tr key={pin}>
                <td><strong>{pin}</strong></td>

                <td>
                  <div>{req.email}</div>
                  {req.phone && <div className="ad-tilefono">{req.phone}</div>}
                  {diplo && (
                    <div className="ad-proeidopoiisi">
                      Υπάρχει και άλλη αίτηση με το ίδιο email
                    </div>
                  )}
                </td>

                <td><ArxeiaPelati req={req} nea={neaArxeia[pin]} /></td>

                <td>
                  {/* Τι έγινε τελευταίο σε αυτή την αίτηση */}
                  {teleftaia ? (
                    <p className="ad-teleftaia">
                      Τελευταία αποστολή: <strong>{teleftaia.etiketa}</strong>
                      <span className="ad-teleftaia-ora">
                        {' · '}{imerominia(teleftaia.xronos)}
                      </span>
                    </p>
                  ) : (
                    <p className="ad-teleftaia ad-teleftaia-kamia">
                      Δεν έχει σταλεί ποτέ email σε αυτή την αίτηση.
                    </p>
                  )}

                  <select
                    className="status-select"
                    value={epilogi}
                    onChange={(e) =>
                      setEpiloges((p) => ({ ...p, [pin]: e.target.value }))
                    }
                  >
                    {KATASTASEIS.map((k) => (
                      <option key={k.kodikos} value={k.kodikos}>{k.etiketa}</option>
                    ))}
                  </select>

                  {/* Το ελεύθερο κείμενο μπαίνει αυτούσιο μέσα στο email */}
                  {katastasi?.theleiKeimeno && (
                    <textarea
                      className="ad-keimeno"
                      rows={4}
                      value={keimena[pin] || ''}
                      onChange={(e) =>
                        setKeimena((p) => ({ ...p, [pin]: e.target.value }))
                      }
                      placeholder={
                        'Τι λείπει. Γράψτε το όπως θα το διαβάσει ο πελάτης, μία γραμμή ανά στοιχείο.'
                      }
                    />
                  )}

                  <button
                    type="button"
                    className="save-btn ad-apostoli"
                    disabled={stelnei === pin}
                    onClick={() => apostoli(pin, req)}
                  >
                    {stelnei === pin
                      ? 'Γίνεται…'
                      : !katastasi?.stelneiEmail
                      ? 'Αλλαγή κατάστασης'
                      : stalthikeXronos
                      ? 'Αποστολή ξανά'
                      : 'Αλλαγή και αποστολή email'}
                  </button>

                  {/* Η επιλεγμένη κατάσταση: στάλθηκε ήδη ή όχι; */}
                  {katastasi?.stelneiEmail && (
                    stalthikeXronos ? (
                      <p className="ad-stalthike">
                        Στάλθηκε ήδη — {imerominia(stalthikeXronos)}
                      </p>
                    ) : (
                      <p className="ad-den-stalthike">Δεν έχει σταλεί</p>
                    )
                  )}

                  {katastasi && !katastasi.stelneiEmail && (
                    <p className="ad-simeiosi">
                      Σε αυτό το στάδιο δεν στέλνεται email στον πελάτη.
                    </p>
                  )}

                  {apotelesma && (
                    <p className={apotelesma.ok ? 'ad-ok' : 'ad-lathos'}>
                      {apotelesma.minima}
                    </p>
                  )}
                </td>

                <td>
                  <div className="admin-upload-wrapper">
                    <label className="custom-file-upload">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleAdminFileUpload(e, pin)}
                      />
                      <IconAnevasma />
                      {uploadingPin === pin ? ' Ανεβαίνει…' : ' Ανέβασμα'}
                    </label>
                    {req.finalReportUrl && (
                      <span className="upload-success-badge">
                        <IconOk width={12} height={12} /> Έτοιμο
                      </span>
                    )}
                  </div>
                </td>

                <td><IstorikoEmail istoriko={req.emailIstoriko} /></td>

                <td>
                  <button
                    onClick={() => handleDelete(pin)}
                    className="delete-btn"
                    title="Διαγραφή αίτησης"
                  >
                    <IconDiagrafi />
                  </button>
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
