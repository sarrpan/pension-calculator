require("dotenv").config();

/* ΝΕΑ ΓΕΝΙΑ. Οι λειτουργίες είναι ήδη ανεβασμένες ως 2ης γενιάς
   (οι διευθύνσεις τους τελειώνουν σε .a.run.app). Δεν γυρίζουν πίσω
   σε 1ης γενιάς κρατώντας το ίδιο όνομα, οπότε το αρχείο γράφεται
   για τη νέα γενιά. */
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

admin.initializeApp();

/* ══════════════════════════════════════════════════════════════
   ΤΟ ΤΑΒΑΝΙ

   maxInstances: πόσους υπολογιστές το πολύ σηκώνει η Google για να
   εξυπηρετήσει ταυτόχρονες κλήσεις. Χωρίς αυτό, μια επίθεση με
   χιλιάδες αιτήματα σηκώνει απεριόριστους και χρεώνεται.

   Τρεις αρκούν για το κοινό της υπηρεσίας. Αν κάποτε χρειαστούν
   περισσότεροι, αλλάζει ΜΟΝΟ ο αριθμός εδώ.

   Η μνήμη ΔΕΝ ορίζεται εδώ επίτηδες. Όταν οριζόταν, το εργαλείο της
   Firebase προσπαθούσε να ορίσει και επεξεργαστική ισχύ, που η παλιά
   γενιά δεν δέχεται, και το ανέβασμα σταματούσε. Η προεπιλογή αρκεί.
   ══════════════════════════════════════════════════════════════ */
const ORIA = {
  maxInstances: 3,
  timeoutSeconds: 60,
};

/* ══════════════════════════════════════════════════════════════
   ΤΟ ΠΟΣΟ

   Γράφεται σε ΛΕΠΤΑ του ευρώ: 2000 = 20,00 €.
   Είναι το μόνο σημείο όπου ορίζεται η τιμή στον server. Πρέπει να
   συμφωνεί με το ReportGuidePage.jsx, το PremiumUploadPage.jsx και
   το ReportRecoveryPage.jsx.
   ══════════════════════════════════════════════════════════════ */
const POSO_SE_LEPTA = 2000;

/* ══════════════════════════════════════════════════════════════
   ΟΙ ΡΥΘΜΙΣΕΙΣ ΤΩΝ EMAIL

   Ό,τι αλλάζει με τον χρόνο ή με τον φόρτο, αλλάζει ΕΔΩ και μόνο
   εδώ. Τα κείμενα πιο κάτω τα διαβάζουν από αυτές τις σταθερές.
   ══════════════════════════════════════════════════════════════ */

// Το όνομα που βλέπει ο πελάτης στα εισερχόμενά του.
const ONOMA_APOSTOLEA = "CalculatorPension";

// Η διεύθυνση της σελίδας, χωρίς κάθετο στο τέλος.
const DIEFTHYNSI_SITE = "https://pension-calculator-six.vercel.app";

// Οι δύο δεσμεύσεις χρόνου. Όποιος τις διάβασε, τις δικαιούται.
const IMERES_ELEGXOU = 3;
const IMERES_PARADOSIS = 10;

// Η τιμή, όπως γράφεται μέσα στα κείμενα.
const TIMI_KEIMENO = "20 €";

/* Τα στοιχεία της επιχείρησης. Όσο ο διακόπτης είναι false, δεν
   εμφανίζεται τίποτα — ούτε κενά, ούτε αγκύλες. Ίδια λογική με το
   Footer.jsx και τις νομικές σελίδες. */
const EMFANISI_STOICHEION = false;
const STOICHEIA_ETAIREIAS = {
  eponymia: "",
  edra: "",
  arithmosMitroou: "",
  afm: "",
};

/* ══════════════════════════════════════════════════════════════
   ΟΙ ΠΕΝΤΕ ΚΑΤΑΣΤΑΣΕΙΣ

   Ίδιες ακριβώς με το premiumService.js και το ReportRecoveryPage.jsx.
   Αν αλλάξει μία, αλλάζει και στα τρία αρχεία.
   ══════════════════════════════════════════════════════════════ */
const KATASTASEIS = {
  PARALIFTHIKAN: "documents_received",
  ELLIPI: "needs_more_info",
  ANAMONI_PLIROMIS: "awaiting_payment",
  SE_EPEXERGASIA: "processing",
  PARADOTHIKE: "delivered",
};

// Οι καταστάσεις που στέλνουν email. Η «processing» λείπει επίτηδες:
// ο πελάτης μόλις πλήρωσε και ξέρει ήδη ότι ξεκινά η δουλειά.
const KATASTASEIS_ME_EMAIL = [
  KATASTASEIS.PARALIFTHIKAN,
  KATASTASEIS.ELLIPI,
  KATASTASEIS.ANAMONI_PLIROMIS,
  KATASTASEIS.PARADOTHIKE,
];

const OLES_OI_KATASTASEIS = Object.values(KATASTASEIS);

/* ══════════════════════════════════════════════════════════════
   ΒΟΗΘΗΤΙΚΑ
   ══════════════════════════════════════════════════════════════ */

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(secretKey);
}

function getEmailTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

// Τα έξι ψηφία, χωρίς το «PIN-». Χρησιμεύουν στις οδηγίες.
const psifiaKodikou = (pin) => String(pin || "").replace(/^PIN[-\s]*/i, "");

// Ο πλήρης κωδικός, όπως αποθηκεύεται στη βάση.
const plirisKodikos = (pin) => `PIN-${psifiaKodikou(pin)}`;

// Οι διευθύνσεις email συγκρίνονται πάντα με πεζά και χωρίς κενά.
const kanoniko = (email) => String(email || "").trim().toLowerCase();

/* Καθαρίζει κείμενο που γράφτηκε από εμάς στον πίνακα διαχείρισης,
   πριν μπει σε HTML. Χωρίς αυτό, ένα σύμβολο < θα χαλούσε το μήνυμα. */
const asfalesKeimeno = (keimeno) =>
  String(keimeno || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/* ══════════════════════════════════════════════════════════════
   ΤΑ ΚΕΙΜΕΝΑ ΤΩΝ EMAIL

   Κάθε κείμενο γράφεται ΜΙΑ φορά, σε μπλοκ. Από τα ίδια μπλοκ
   παράγονται και η HTML μορφή και η απλή μορφή κειμένου, ώστε να
   μην υπάρχει κίνδυνος να αλλάξει η μία και να ξεχαστεί η άλλη.

   Τα είδη των μπλοκ:
     p         — κανονική παράγραφος
     titlos    — μικρός τίτλος ενότητας
     kodikos   — το PIN, σε πλαίσιο
     lista     — αριθμημένα βήματα
     parathesi — κείμενο σε πλαίσιο (η δήλωση υπαναχώρησης)
     syndesmos — σύνδεσμος με ορατή διεύθυνση
   ══════════════════════════════════════════════════════════════ */

const SELIDA_PARAKOLOUTHISIS = `${DIEFTHYNSI_SITE}/report-recovery`;
const SELIDA_APOSTOLIS = `${DIEFTHYNSI_SITE}/premium-upload`;

const KEIMENA = {
  /* ── Τα έγγραφα παραλήφθηκαν, πρώτη φορά ────────────────── */
  [KATASTASEIS.PARALIFTHIKAN]: (aitisi) => ({
    thema: `Λάβαμε τα έγγραφά σας — κωδικός ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno: `Τα έγγραφα που μας στείλατε παραλήφθηκαν (${
          aitisi.fileCount || 1
        } ${aitisi.fileCount === 1 ? "αρχείο" : "αρχεία"}).`,
      },
      { t: "kodikos", keimeno: aitisi.pin },
      {
        t: "p",
        keimeno:
          "Κρατήστε τον κωδικό. Με αυτόν και με τη διεύθυνση email αυτού του μηνύματος μπορείτε να δείτε οποιαδήποτε στιγμή σε ποιο στάδιο βρίσκεται η αίτησή σας:",
      },
      { t: "syndesmos", url: SELIDA_PARAKOLOUTHISIS },
      { t: "titlos", keimeno: "Τι γίνεται τώρα" },
      {
        t: "p",
        keimeno: `Ελέγχουμε τον φάκελό σας και θα σας απαντήσουμε μέσα σε ${IMERES_ELEGXOU} εργάσιμες ημέρες. Αν χρειάζεται κάτι επιπλέον, θα σας πούμε ακριβώς τι. Αν είναι πλήρης, θα σας στείλουμε email για να προχωρήσετε στην πληρωμή.`,
      },
      {
        t: "p",
        keimeno:
          "Μέχρι τότε δεν χρειάζεται να κάνετε τίποτα. Δεν έχει γίνει καμία χρέωση.",
      },
      {
        t: "p",
        keimeno:
          "Αν θέλετε να μας πείτε κάτι για την περίπτωσή σας, απαντήστε σε αυτό το μήνυμα.",
      },
    ],
  }),

  /* ── Τα έγγραφα παραλήφθηκαν, δεύτερη φορά και μετά ──────── */
  documents_received_epanalipsi: (aitisi) => ({
    thema: `Λάβαμε τα επιπλέον έγγραφα — ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno: `Λάβαμε τα επιπλέον έγγραφα που μας στείλατε για την αίτηση ${aitisi.pin}.`,
      },
      {
        t: "p",
        keimeno: `Τα ελέγχουμε και θα σας απαντήσουμε μέσα σε ${IMERES_ELEGXOU} εργάσιμες ημέρες. Δεν έχει γίνει καμία χρέωση.`,
      },
    ],
  }),

  /* ── Χρειάζονται επιπλέον στοιχεία ───────────────────────── */
  [KATASTASEIS.ELLIPI]: (aitisi, extra) => ({
    thema: `Χρειαζόμαστε κάποια επιπλέον στοιχεία — ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno:
          "Ελέγξαμε τον φάκελό σας. Για να γίνει σωστά ο υπολογισμός χρειαζόμαστε ακόμη τα εξής:",
      },
      { t: "parathesi", keimeno: extra.keimeno },
      { t: "titlos", keimeno: "Πώς μας τα στέλνετε" },
      {
        t: "p",
        keimeno: `Ανοίξτε τη σελίδα αποστολής. Στην κορυφή θα δείτε το πεδίο «Έχετε ήδη κωδικό αίτησης;». Γράψτε εκεί τα έξι ψηφία ${psifiaKodikou(
          aitisi.pin
        )} και από κάτω το ίδιο email με πριν. Έτσι τα νέα αρχεία θα προστεθούν στον φάκελό σας και δεν θα ανοίξει δεύτερη αίτηση.`,
      },
      { t: "syndesmos", url: SELIDA_APOSTOLIS },
      {
        t: "p",
        keimeno:
          "Αν σας βολεύει, μπορείτε απλώς να απαντήσετε σε αυτό το μήνυμα με τα αρχεία συνημμένα.",
      },
      {
        t: "p",
        keimeno:
          "Αν κάτι από αυτά δεν το βρίσκετε ή νομίζετε ότι δεν υπάρχει, γράψτε μας το. Στις περισσότερες περιπτώσεις υπάρχει άλλος δρόμος και τον ξέρουμε.",
      },
      {
        t: "p",
        keimeno:
          "Δεν έχει γίνει χρέωση και δεν θα γίνει μέχρι να είναι πλήρης ο φάκελός σας.",
      },
    ],
  }),

  /* ── Ο φάκελος είναι πλήρης, αναμονή πληρωμής ───────────── */
  [KATASTASEIS.ANAMONI_PLIROMIS]: (aitisi) => ({
    thema: `Ο φάκελός σας είναι πλήρης — ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno:
          "Ελέγξαμε τα έγγραφά σας. Ο φάκελος είναι πλήρης και ο υπολογισμός μπορεί να γίνει.",
      },
      {
        t: "p",
        keimeno: `Μένει η πληρωμή των ${TIMI_KEIMENO}, εφάπαξ.`,
      },
      { t: "titlos", keimeno: "Πώς γίνεται" },
      {
        t: "lista",
        stoicheia: [
          "Ανοίξτε τη σελίδα Παρακολούθησης Αίτησης (ο σύνδεσμος πιο κάτω).",
          `Γράψτε τα έξι ψηφία του κωδικού σας (${psifiaKodikou(
            aitisi.pin
          )}) και αυτή τη διεύθυνση email.`,
          `Θα δείτε την κατάσταση της αίτησής σας και το κουμπί «Πληρωμή ${TIMI_KEIMENO}».`,
        ],
      },
      { t: "syndesmos", url: SELIDA_PARAKOLOUTHISIS },
      {
        t: "p",
        keimeno:
          "Η πληρωμή γίνεται με κάρτα, μέσω Stripe. Τα στοιχεία της κάρτας σας δεν περνούν ούτε αποθηκεύονται στη δική μας σελίδα.",
      },
      { t: "titlos", keimeno: "Μια δήλωση που θα σας ζητηθεί" },
      {
        t: "p",
        keimeno: "Πριν την πληρωμή θα πρέπει να επιλέξετε το εξής:",
      },
      /* ΠΡΟΣΟΧΗ: η διατύπωση είναι ίδια, γράμμα προς γράμμα, με το
         StripePaymentForm.jsx. Αν αλλάξει εκεί, αλλάζει και εδώ. */
      {
        t: "parathesi",
        keimeno:
          "Ζητώ να ξεκινήσει άμεσα η εκτέλεση της υπηρεσίας και γνωρίζω ότι, μόλις ολοκληρωθεί, χάνω το δικαίωμα υπαναχώρησης.",
      },
      {
        t: "p",
        keimeno:
          "Σημαίνει ότι δεχόμαστε να ξεκινήσουμε τη δουλειά αμέσως, χωρίς να περιμένουμε τις 14 ημέρες που ορίζει ο νόμος για τις αγορές από απόσταση. Σε αντάλλαγμα, δεν μπορείτε να ζητήσετε επιστροφή χρημάτων αφού παραδοθεί η έκθεση. Χωρίς αυτή τη δήλωση δεν μπορούμε να ξεκινήσουμε νωρίτερα.",
      },
      {
        t: "p",
        keimeno: `Χρόνος παράδοσης: έως ${IMERES_PARADOSIS} εργάσιμες ημέρες από την πληρωμή.`,
      },
      {
        t: "p",
        keimeno:
          "Αν τελικά δεν θέλετε να προχωρήσετε, δεν χρειάζεται να κάνετε τίποτα. Δεν υπάρχει χρέωση. Αν θέλετε να διαγράψουμε τα έγγραφά σας, γράψτε μας.",
      },
    ],
  }),

  /* ── Η έκθεση παραδόθηκε ─────────────────────────────────── */
  [KATASTASEIS.PARADOTHIKE]: (aitisi) => ({
    thema: `Η έκθεσή σας είναι έτοιμη — ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno:
          "Η αναλυτική έκθεση για τη σύνταξή σας ολοκληρώθηκε. Θα τη βρείτε συνημμένη σε αυτό το μήνυμα, σε μορφή PDF.",
      },
      {
        t: "p",
        keimeno:
          "Είναι επίσης αναρτημένη για δύο μήνες στη σελίδα Παρακολούθησης, με τον κωδικό και το email σας:",
      },
      { t: "syndesmos", url: SELIDA_PARAKOLOUTHISIS },
      {
        t: "p",
        keimeno:
          "Η έκθεση ακολουθεί τη δομή του εγγράφου του e-ΕΦΚΑ, ώστε να μπορείτε να τα βάλετε το ένα δίπλα στο άλλο.",
      },
      {
        t: "p",
        keimeno:
          "Αν κάτι δεν σας είναι κατανοητό, ή αν νομίζετε ότι κάποιο στοιχείο δεν είναι σωστό, απαντήστε σε αυτό το μήνυμα. Κρατάμε τα έγγραφά σας για έναν χρόνο, ακριβώς για να μπορούμε να απαντήσουμε αν προκύψουν απορίες όταν βγει η απόφαση του e-ΕΦΚΑ. Αν θέλετε να διαγραφούν νωρίτερα, αρκεί να μας το ζητήσετε.",
      },
      {
        t: "p",
        keimeno:
          "Η έκθεση είναι εκτίμηση βάσει της ισχύουσας νομοθεσίας και των στοιχείων που μας δώσατε. Δεσμευτική απόφαση εκδίδει μόνο ο e-ΕΦΚΑ.",
      },
      {
        t: "p",
        keimeno:
          "Αν σας φάνηκε χρήσιμη, πείτε το σε συνάδελφο που πλησιάζει σύνταξη. Είμαστε νέα υπηρεσία και δεν κάνουμε διαφήμιση.",
      },
    ],
  }),
};

/* ══════════════════════════════════════════════════════════════
   Η ΜΟΡΦΟΠΟΙΗΣΗ

   Δύο συναρτήσεις διαβάζουν τα ίδια μπλοκ: η μία βγάζει HTML, η
   άλλη απλό κείμενο. Το απλό κείμενο δεν είναι διακόσμηση — χωρίς
   αυτό τα φίλτρα ανεπιθύμητης αλληλογραφίας βαθμολογούν χειρότερα
   το μήνυμα, και κάποια προγράμματα δείχνουν μόνο αυτό.
   ══════════════════════════════════════════════════════════════ */

const XROMA_NAVY = "#0f172a";
const XROMA_KEIMENOU = "#334155";
const XROMA_GRAMMIS = "#e2e8f0";
const XROMA_FONTOU = "#f8fafc";

const ypografiHtml = () => {
  const grammes = [ONOMA_APOSTOLEA, DIEFTHYNSI_SITE.replace("https://", "")];

  if (EMFANISI_STOICHEION) {
    if (STOICHEIA_ETAIREIAS.eponymia) grammes.push(STOICHEIA_ETAIREIAS.eponymia);
    if (STOICHEIA_ETAIREIAS.edra) grammes.push(STOICHEIA_ETAIREIAS.edra);
    if (STOICHEIA_ETAIREIAS.arithmosMitroou) {
      grammes.push(`Αρ. ΓΕΜΗ: ${STOICHEIA_ETAIREIAS.arithmosMitroou}`);
    }
    if (STOICHEIA_ETAIREIAS.afm) grammes.push(`ΑΦΜ: ${STOICHEIA_ETAIREIAS.afm}`);
  }

  return grammes;
};

const htmlApoBlokia = (blokia) => {
  const soma = blokia
    .map((b) => {
      switch (b.t) {
        case "titlos":
          return `<p style="margin:28px 0 8px;font-size:15px;font-weight:700;color:${XROMA_NAVY};">${asfalesKeimeno(
            b.keimeno
          )}</p>`;

        case "kodikos":
          return `<div style="margin:20px 0;padding:16px;background:${XROMA_FONTOU};border:1px solid ${XROMA_GRAMMIS};border-radius:8px;text-align:center;font-size:22px;font-weight:700;letter-spacing:1px;color:${XROMA_NAVY};">${asfalesKeimeno(
            b.keimeno
          )}</div>`;

        case "parathesi":
          return `<div style="margin:16px 0;padding:14px 16px;background:${XROMA_FONTOU};border-left:3px solid ${XROMA_NAVY};border-radius:4px;font-size:15px;line-height:1.6;color:${XROMA_KEIMENOU};white-space:pre-wrap;">${asfalesKeimeno(
            b.keimeno
          )}</div>`;

        case "lista": {
          const items = (b.stoicheia || [])
            .map(
              (s) =>
                `<li style="margin-bottom:8px;">${asfalesKeimeno(s)}</li>`
            )
            .join("");
          return `<ol style="margin:12px 0;padding-left:22px;font-size:15px;line-height:1.7;color:${XROMA_KEIMENOU};">${items}</ol>`;
        }

        case "syndesmos":
          return `<p style="margin:12px 0 20px;font-size:15px;word-break:break-all;"><a href="${b.url}" style="color:${XROMA_NAVY};font-weight:600;">${b.url}</a></p>`;

        default:
          return `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${XROMA_KEIMENOU};">${asfalesKeimeno(
            b.keimeno
          )}</p>`;
      }
    })
    .join("");

  const ypografi = ypografiHtml()
    .map((g) => `<div>${asfalesKeimeno(g)}</div>`)
    .join("");

  return `<div style="background:#ffffff;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    ${soma}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid ${XROMA_GRAMMIS};font-size:13px;line-height:1.6;color:#64748b;">
      ${ypografi}
    </div>
  </div>
</div>`;
};

const keimenoApoBlokia = (blokia) => {
  const soma = blokia
    .map((b) => {
      switch (b.t) {
        case "titlos":
          return `\n${b.keimeno.toUpperCase()}\n`;
        case "kodikos":
          return `\n    ${b.keimeno}\n`;
        case "parathesi":
          return `\n"${b.keimeno}"\n`;
        case "lista":
          return (b.stoicheia || [])
            .map((s, i) => `${i + 1}. ${s}`)
            .join("\n");
        case "syndesmos":
          return b.url;
        default:
          return b.keimeno;
      }
    })
    .join("\n\n");

  return `${soma}\n\n---\n${ypografiHtml().join("\n")}\n`;
};

/* ══════════════════════════════════════════════════════════════
   ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ ΚΑΙ ΑΠΟΣΤΟΛΗ EMAIL

   Καλείται ΜΟΝΟ από τον πίνακα διαχείρισης. Δέχεται:
     pin        — ο κωδικός της αίτησης
     katastasi  — μία από τις πέντε
     keimeno    — τι λείπει (υποχρεωτικό μόνο στο needs_more_info)
     reportUrl  — η διεύθυνση του PDF (μόνο στο delivered)

   Στην κεφαλίδα x-admin-kodikos πρέπει να έρθει ο κωδικός που
   βρίσκεται στο .env ως ADMIN_EMAIL_KODIKOS. Χωρίς αυτόν, η
   συνάρτηση αρνείται — αλλιώς οποιοσδήποτε θα μπορούσε να στέλνει
   μηνύματα από τη δική μας διεύθυνση.

   Η διεύθυνση του παραλήπτη ΔΕΝ έρχεται από έξω. Διαβάζεται από τη
   βάση, με βάση τον κωδικό. Έτσι δεν γίνεται να σταλεί email σε
   διεύθυνση που δεν ανήκει σε πραγματική αίτηση.
   ══════════════════════════════════════════════════════════════ */
exports.allagiKatastasis = onRequest(ORIA, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "POST required" });
    }

    // --- Έλεγχος του κωδικού διαχείρισης ---
    const kodikosDiaxeirisis = process.env.ADMIN_EMAIL_KODIKOS;

    if (!kodikosDiaxeirisis) {
      console.error("Λείπει το ADMIN_EMAIL_KODIKOS από το .env.");
      return res.status(500).json({
        success: false,
        error: "Η υπηρεσία δεν είναι ρυθμισμένη.",
      });
    }

    if (req.headers["x-admin-kodikos"] !== kodikosDiaxeirisis) {
      return res.status(403).json({
        success: false,
        error: "Λάθος κωδικός διαχείρισης.",
      });
    }

    const { pin, katastasi, keimeno, reportUrl } = req.body || {};

    // --- Έλεγχοι των στοιχείων που ήρθαν ---
    if (!pin) {
      return res.status(400).json({ success: false, error: "Λείπει ο κωδικός." });
    }

    if (!OLES_OI_KATASTASEIS.includes(katastasi)) {
      return res.status(400).json({
        success: false,
        error: "Άγνωστη κατάσταση αίτησης.",
      });
    }

    if (katastasi === KATASTASEIS.ELLIPI && !String(keimeno || "").trim()) {
      return res.status(400).json({
        success: false,
        error: "Γράψτε τι ακριβώς λείπει, πριν σταλεί το email.",
      });
    }

    try {
      // --- Η αίτηση από τη βάση ---
      const anafora = admin.database().ref(`premium_requests/${pin}`);
      const stigmiotypo = await anafora.once("value");

      if (!stigmiotypo.exists()) {
        return res.status(404).json({
          success: false,
          error: "Δεν βρέθηκε αίτηση με αυτόν τον κωδικό.",
        });
      }

      const aitisi = stigmiotypo.val();

      /* Η κατάσταση αλλάζει πρώτη. Αν αποτύχει το email, το ξέρουμε
         και το ξαναστέλνουμε — ενώ μια κατάσταση που δεν άλλαξε ενώ
         το email έφυγε αφήνει τον πελάτη να βλέπει λάθος οθόνη. */
      const allages = { status: katastasi };

      if (katastasi === KATASTASEIS.ELLIPI) {
        allages.lastRequestNote = String(keimeno).trim();
        allages.lastRequestNoteAt = Date.now();
      }

      if (katastasi === KATASTASEIS.PARADOTHIKE && reportUrl) {
        allages.finalReportUrl = reportUrl;
        allages.deliveredAt = Date.now();
      }

      await anafora.update(allages);

      // --- Χρειάζεται email αυτή η κατάσταση; ---
      if (!KATASTASEIS_ME_EMAIL.includes(katastasi)) {
        return res.status(200).json({
          success: true,
          katastasiAllaxe: true,
          emailStalthike: false,
          minima: "Η κατάσταση άλλαξε. Σε αυτό το στάδιο δεν στέλνεται email.",
        });
      }

      if (!aitisi.email) {
        return res.status(200).json({
          success: true,
          katastasiAllaxe: true,
          emailStalthike: false,
          error: "Η αίτηση δεν έχει διεύθυνση email.",
        });
      }

      /* Αν τα έγγραφα έχουν ξαναπαραληφθεί, στέλνεται η σύντομη
         εκδοχή. Αλλιώς ο πελάτης θα διάβαζε δεύτερη φορά «ο κωδικός
         της αίτησής σας είναι…», σαν να μην τον έχει ήδη. */
      const istoriko = aitisi.emailIstoriko || {};
      const eixeXanaparalifthei =
        katastasi === KATASTASEIS.PARALIFTHIKAN &&
        Boolean(istoriko[KATASTASEIS.PARALIFTHIKAN]);

      const kleidiKeimenou = eixeXanaparalifthei
        ? "documents_received_epanalipsi"
        : katastasi;

      const { thema, blokia } = KEIMENA[kleidiKeimenou](
        { ...aitisi, pin },
        { keimeno }
      );

      // --- Η αποστολή ---
      const transporter = getEmailTransporter();

      const minima = {
        from: `"${ONOMA_APOSTOLEA}" <${process.env.EMAIL_USER}>`,
        to: aitisi.email,
        subject: thema,
        text: keimenoApoBlokia(blokia),
        html: htmlApoBlokia(blokia),
      };

      /* Η έκθεση πάει συνημμένη. Το nodemailer κατεβάζει μόνο του το
         αρχείο από τη διεύθυνση που του δίνουμε. */
      const diefthynsiEkthesis = reportUrl || aitisi.finalReportUrl;

      if (katastasi === KATASTASEIS.PARADOTHIKE && diefthynsiEkthesis) {
        minima.attachments = [
          {
            filename: `Ekthesi-${pin}.pdf`,
            path: diefthynsiEkthesis,
          },
        ];
      }

      await transporter.sendMail(minima);

      // --- Καταγραφή, ώστε να ξέρουμε τι έχει σταλεί και πότε ---
      await anafora.child(`emailIstoriko/${katastasi}`).set(Date.now());

      return res.status(200).json({
        success: true,
        katastasiAllaxe: true,
        emailStalthike: true,
        paraliptis: aitisi.email,
      });
    } catch (error) {
      console.error("Σφάλμα στην αλλαγή κατάστασης:", error);

      return res.status(500).json({
        success: false,
        katastasiAllaxe: true,
        emailStalthike: false,
        error: error.message,
      });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   ΣΥΜΠΛΗΡΩΜΑΤΙΚΑ ΕΓΓΡΑΦΑ ΣΤΗΝ ΙΔΙΑ ΑΙΤΗΣΗ

   Τρεις δουλειές, μία διεύθυνση. Η ενέργεια δηλώνεται στο πεδίο
   «energeia»:

     elegxos_email      { email }            -> { yparxei: true/false }
     elegxos_kodikou    { pin, email }       -> { tairiazei: true/false }
     prosthiki_arxeion  { pin, email, arxeia } -> προσθέτει τα αρχεία

   ΓΙΑΤΙ ΣΤΟΝ SERVER ΚΑΙ ΟΧΙ ΣΤΗ ΣΕΛΙΔΑ

   Και οι τρεις απαιτούν να διαβάσει ή να αλλάξει κάποιος αίτηση που
   δεν είναι δική του. Μόλις κλείσουν οι κανόνες της βάσης (§9.3), ο
   browser δεν θα μπορεί να κάνει τίποτε από αυτά. Εδώ θα δουλεύουν.

   ΤΙ ΔΕΝ ΑΠΟΚΑΛΥΠΤΕΤΑΙ

   Ο έλεγχος του email απαντά μόνο ναι ή όχι. Δεν επιστρέφει κωδικό,
   ούτε πόσες αιτήσεις, ούτε πότε. Ο έλεγχος του κωδικού απαντά μόνο
   αν το ζευγάρι ταιριάζει — λάθος κωδικός και λάθος email δίνουν το
   ίδιο «όχι», όπως και στη σελίδα Παρακολούθησης.
   ══════════════════════════════════════════════════════════════ */
exports.symplirosiAitisis = onRequest(ORIA, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "POST required" });
    }

    const { energeia, email, pin, arxeia } = req.body || {};
    const emailKanoniko = kanoniko(email);

    if (!emailKanoniko) {
      return res.status(400).json({ success: false, error: "Λείπει το email." });
    }

    try {
      const vasi = admin.database().ref("premium_requests");

      /* ── 1. Υπάρχει ήδη αίτηση με αυτό το email; ── */
      if (energeia === "elegxos_email") {
        const apotelesma = await vasi
          .orderByChild("email")
          .equalTo(emailKanoniko)
          .once("value");

        return res.status(200).json({
          success: true,
          yparxei: apotelesma.exists(),
        });
      }

      /* Οι δύο επόμενες ενέργειες θέλουν κωδικό. */
      const kodikos = plirisKodikos(pin);

      if (!/^PIN-\d{6}$/.test(kodikos)) {
        return res.status(400).json({
          success: false,
          error: "Ο κωδικός πρέπει να έχει έξι ψηφία.",
        });
      }

      const anafora = vasi.child(kodikos);
      const stigmiotypo = await anafora.once("value");
      const aitisi = stigmiotypo.val();

      const tairiazei =
        Boolean(aitisi) && kanoniko(aitisi.email) === emailKanoniko;

      /* ── 2. Ταιριάζουν κωδικός και email; ── */
      if (energeia === "elegxos_kodikou") {
        return res.status(200).json({ success: true, tairiazei });
      }

      /* ── 3. Προσθήκη των αρχείων στον ίδιο φάκελο ── */
      if (energeia === "prosthiki_arxeion") {
        if (!tairiazei) {
          return res.status(200).json({ success: true, tairiazei: false });
        }

        if (!Array.isArray(arxeia) || !arxeia.length) {
          return res.status(400).json({
            success: false,
            error: "Δεν στάλθηκε κανένα αρχείο.",
          });
        }

        /* Κάθε διαδρομή πρέπει να βρίσκεται μέσα στον φάκελο ΑΥΤΗΣ
           της αίτησης. Χωρίς τον έλεγχο, θα μπορούσε κάποιος να
           κολλήσει στην αίτησή του αρχεία τρίτου. */
        const arxi = `premium_uploads/${kodikos}/`;
        const egkyra = arxeia.filter(
          (a) => a && typeof a.path === "string" && a.path.startsWith(arxi)
        );

        if (egkyra.length !== arxeia.length) {
          return res.status(400).json({
            success: false,
            error: "Κάποιο αρχείο δεν ανήκει σε αυτή την αίτηση.",
          });
        }

        const palia = Array.isArray(aitisi.files) ? aitisi.files : [];
        const ola = palia.concat(egkyra);

        await anafora.update({
          files: ola,
          fileCount: ola.length,
          status: KATASTASEIS.PARALIFTHIKAN,
          lastUploadAt: Date.now(),
        });

        return res.status(200).json({
          success: true,
          tairiazei: true,
          plithosArxeion: ola.length,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Άγνωστη ενέργεια.",
      });
    } catch (error) {
      console.error("Σφάλμα στη συμπλήρωση αίτησης:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   ΚΑΝΟΝΙΚΗ ΧΡΕΩΣΗ

   Μέχρι τις 03/09 η κάρτα δεσμευόταν (capture_method: manual) και τα
   χρήματα εισπράττονταν αργότερα, κατά την παράδοση της έκθεσης.

   Η σειρά των βημάτων άλλαξε: ο πελάτης πληρώνει ΑΦΟΥ ελεγχθεί ο
   φάκελός του, δηλαδή αφού ξέρουμε ότι η δουλειά μπορεί να γίνει.
   Επομένως δεν υπάρχει λόγος για δέσμευση — η χρέωση είναι άμεση και
   δεν χρειάζεται δεύτερο βήμα είσπραξης.

   Η συνάρτηση capturePayment διαγράφηκε στις 03/09. Έμενε μόνο
   επειδή περιείχε τη μοναδική δουλεμένη αποστολή email· τώρα η
   αποστολή έχει δική της συνάρτηση, πιο πάνω.
   ══════════════════════════════════════════════════════════════ */
exports.createPaymentIntent = onRequest(ORIA, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "POST required",
      });
    }

    try {
      const stripe = getStripeClient();

      /* Ο κωδικός και το email της αίτησης καταγράφονται πάνω στη
         συναλλαγή. Χωρίς αυτά, μια πληρωμή στο Stripe δεν μπορεί να
         αντιστοιχηθεί με πελάτη — κάτι που έχει σημασία σε κάθε
         διαφορά, επιστροφή ή έλεγχο. */
      const { pin, email } = req.body || {};

      const paymentIntent = await stripe.paymentIntents.create({
        amount: POSO_SE_LEPTA,
        currency: "eur",
        receipt_email: email || undefined,
        metadata: {
          pin: pin || "",
          email: email || "",
        },
      });

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Create payment intent error:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   Η ΚΑΤΑΣΤΑΣΗ ΤΗΣ ΑΙΤΗΣΗΣ

   Καλείται από τη σελίδα Παρακολούθησης. Δέχεται κωδικό και email
   και απαντά ΜΟΝΟ με το στάδιο στο οποίο βρίσκεται η αίτηση.

   ΓΙΑΤΙ ΣΤΟΝ SERVER

   Μέχρι σήμερα η σελίδα διάβαζε απευθείας τη βάση από τον browser
   του επισκέπτη. Αυτό σημαίνει ότι η βάση έπρεπε να είναι ανοιχτή
   για διάβασμα σε οποιονδήποτε. Τώρα διαβάζει εδώ, και η βάση
   κλείνει.

   ΤΙ ΔΕΝ ΕΠΙΣΤΡΕΦΕΤΑΙ

   Ούτε τηλέφωνο, ούτε λίστα αρχείων, ούτε στοιχεία πληρωμής, ούτε
   το σημείωμα του needs_more_info — αυτό στέλνεται με email. Λάθος
   κωδικός και λάθος email δίνουν το ίδιο «δεν βρέθηκε», ώστε να μην
   μπορεί κανείς να καταλάβει πότε πέτυχε αληθινό κωδικό.
   ══════════════════════════════════════════════════════════════ */
exports.getRequestStatus = onRequest(ORIA, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "POST required" });
    }

    const { pin, email } = req.body || {};
    const kodikos = plirisKodikos(pin);
    const emailKanoniko = kanoniko(email);

    if (!/^PIN-\d{6}$/.test(kodikos) || !emailKanoniko) {
      return res.status(200).json({ success: true, vrethike: false });
    }

    try {
      const stigmiotypo = await admin
        .database()
        .ref(`premium_requests/${kodikos}`)
        .once("value");

      const aitisi = stigmiotypo.val();

      if (!aitisi || kanoniko(aitisi.email) !== emailKanoniko) {
        return res.status(200).json({ success: true, vrethike: false });
      }

      const apantisi = {
        success: true,
        vrethike: true,
        pin: kodikos,
        email: aitisi.email,
        status: aitisi.status || KATASTASEIS.PARALIFTHIKAN,
      };

      /* Ο σύνδεσμος της έκθεσης δίνεται μόνο όταν η έκθεση έχει
         πράγματι παραδοθεί. */
      if (
        apantisi.status === KATASTASEIS.PARADOTHIKE &&
        aitisi.finalReportUrl
      ) {
        apantisi.finalReportUrl = aitisi.finalReportUrl;
      }

      return res.status(200).json(apantisi);
    } catch (error) {
      console.error("Σφάλμα στην ανάγνωση κατάστασης:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   ΕΠΙΒΕΒΑΙΩΣΗ ΤΗΣ ΠΛΗΡΩΜΗΣ

   Μέχρι σήμερα, η ένδειξη «πληρώθηκε» γραφόταν στη βάση από τον
   υπολογιστή του πελάτη, αμέσως μετά την οθόνη της κάρτας. Κανείς
   δεν ρωτούσε το Stripe αν τα χρήματα ήρθαν πράγματι. Όποιος
   ακύρωνε τη χρέωση μπορούσε να εμφανιστεί ως πληρωμένος.

   Τώρα η ένδειξη μπαίνει ΜΟΝΟ εδώ, και μόνο αφού το Stripe
   επιβεβαιώσει τέσσερα πράγματα μαζί:

     1. η συναλλαγή έχει ολοκληρωθεί (succeeded)
     2. το ποσό είναι το σωστό
     3. το νόμισμα είναι ευρώ
     4. η συναλλαγή ανήκει σε ΑΥΤΗ την αίτηση

   Χωρίς τα τέσσερα, η αίτηση μένει απλήρωτη.
   ══════════════════════════════════════════════════════════════ */
exports.epivevaiosiPliromis = onRequest(ORIA, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "POST required" });
    }

    const { pin, email, paymentIntentId, ypanaxorisiAt } = req.body || {};
    const kodikos = plirisKodikos(pin);
    const emailKanoniko = kanoniko(email);

    if (!/^PIN-\d{6}$/.test(kodikos) || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Λείπουν στοιχεία της πληρωμής.",
      });
    }

    try {
      const anafora = admin.database().ref(`premium_requests/${kodikos}`);
      const stigmiotypo = await anafora.once("value");
      const aitisi = stigmiotypo.val();

      if (!aitisi || kanoniko(aitisi.email) !== emailKanoniko) {
        return res.status(404).json({
          success: false,
          error: "Δεν βρέθηκε αίτηση με αυτά τα στοιχεία.",
        });
      }

      // --- Η ερώτηση προς το Stripe ---
      const stripe = getStripeClient();
      const pliromi = await stripe.paymentIntents.retrieve(paymentIntentId);

      const egkyri =
        Boolean(pliromi) &&
        pliromi.status === "succeeded" &&
        pliromi.currency === "eur" &&
        Number(pliromi.amount_received) >= POSO_SE_LEPTA &&
        plirisKodikos(pliromi.metadata && pliromi.metadata.pin) === kodikos;

      if (!egkyri) {
        console.error(
          "Απορρίφθηκε επιβεβαίωση πληρωμής:",
          kodikos,
          paymentIntentId,
          pliromi && pliromi.status
        );

        return res.status(200).json({
          success: false,
          plirothike: false,
          error: "Η πληρωμή δεν επιβεβαιώθηκε.",
        });
      }

      await anafora.update({
        paymentIntentId,
        paymentStatus: "paid",
        paidAt: Date.now(),
        status: KATASTASEIS.SE_EPEXERGASIA,
        /* Η ώρα που ο πελάτης δήλωσε ότι ζητά άμεση εκτέλεση και
           παραιτείται από το δικαίωμα υπαναχώρησης. Νομικό τεκμήριο. */
        withdrawalConsentAt: ypanaxorisiAt || Date.now(),
      });

      return res.status(200).json({ success: true, plirothike: true });
    } catch (error) {
      console.error("Σφάλμα στην επιβεβαίωση της πληρωμής:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});
