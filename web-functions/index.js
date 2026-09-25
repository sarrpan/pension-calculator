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
const ONOMA_APOSTOLEA = "Sintaximou";

// Η διεύθυνση της σελίδας, χωρίς κάθετο στο τέλος.
const DIEFTHYNSI_SITE = (() => {
  try {
    const url = new URL(process.env.PUBLIC_SITE_URL || "");
    return url.protocol === "https:" && !url.username && !url.password ? url.origin : "";
  } catch { return ""; }
})();

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
          "Ελέγξαμε τον φάκελό σας. Για να γίνει η εκτίμηση σύνταξης χρειαζόμαστε ακόμη τα εξής:",
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
          "Ελέγξαμε τα έγγραφά σας. Ο φάκελος είναι πλήρης και μπορεί να γίνει η εκτίμηση σύνταξης.",
      },
      {
        t: "p",
        keimeno: `Μένει η πληρωμή των ${TIMI_KEIMENO}, εφάπαξ, για το Αναλυτικό Report.`,
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
        keimeno: `Χρόνος παράδοσης: έως ${IMERES_PARADOSIS} εργάσιμες ημέρες από την πληρωμή, με email και μέσω της σελίδας Παρακολούθησης.`,
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
    thema: `Το Αναλυτικό Report είναι έτοιμο — ${aitisi.pin}`,
    blokia: [
      { t: "p", keimeno: "Καλησπέρα σας," },
      {
        t: "p",
        keimeno:
          "Το Αναλυτικό Report με την εκτίμηση σύνταξης ολοκληρώθηκε. Θα βρείτε την έκθεση συνημμένη σε αυτό το μήνυμα, σε μορφή PDF.",
      },
      {
        t: "p",
        keimeno:
          "Είναι επίσης αναρτημένη στη σελίδα Παρακολούθησης, με τον κωδικό και το email σας, για δύο μήνες από σήμερα:",
      },
      { t: "syndesmos", url: SELIDA_PARAKOLOUTHISIS },
      {
        t: "p",
        keimeno:
          "Αν τη χρειαστείτε αργότερα, ζητήστε τη με ένα μήνυμα.",
      },
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

    // Επιβεβαίωση μόνο του header, χωρίς PIN, πρόσβαση σε αίτηση ή email.
    if (req.body?.energeia === "epivevaiosi_kodikou") {
      return res.status(200).json({ success: true });
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

    if (KATASTASEIS_ME_EMAIL.includes(katastasi) && !DIEFTHYNSI_SITE) {
      return res.status(503).json({ success: false, katastasiAllaxe: false, emailStalthike: false,
        error: "Χρειάζεται έγκυρο PUBLIC_SITE_URL πριν από την αποστολή email." });
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

const MAX_FILES = 10;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const validEmail = (value) => typeof value === "string" && value.length <= 254
  && /^[^\s@<>,;:"\\]+@[^\s@<>,;:"\\]+\.[^\s@<>,;:"\\]+$/.test(value);
const uploadAllowed = (request) => request && request.paymentStatus !== "paid"
  && [KATASTASEIS.PARALIFTHIKAN, KATASTASEIS.ELLIPI].includes(request.status);
const fail = (res, status, code, error = "Η ενέργεια δεν ολοκληρώθηκε. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.") =>
  res.status(status).json({ success: false, code, error });
const publicError = (code, status = 400) => Object.assign(new Error(code), { publicCode: code, status });

async function uploadUser(req) {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!match) throw publicError("unauthorized", 401);
  try { return await admin.auth().verifyIdToken(match[1]); }
  catch { throw publicError("unauthorized", 401); }
}

function fileTotals(files) {
  if (!Array.isArray(files) || files.some((file) => !file || !Number.isSafeInteger(file.size) || file.size <= 0)) {
    throw publicError("invalid_files");
  }
  return { fileCount: files.length, totalBytes: files.reduce((sum, file) => sum + file.size, 0) };
}

function withinUploadLimits(files) {
  const { fileCount, totalBytes } = fileTotals(files);
  return fileCount <= MAX_FILES && totalBytes <= MAX_UPLOAD_BYTES;
}

// Client-supplied sizes/types are not authoritative: inspect the stored objects.
async function verifiedFiles(pin, files, uid) {
  if (!Array.isArray(files) || files.length === 0) throw publicError("invalid_files");
  if (files.length > MAX_FILES) throw publicError("upload_limits");
  const prefix = `premium_uploads/${pin}/`;
  const paths = new Set();
  const verified = [];
  for (const file of files) {
    if (!file || typeof file.path !== "string" || !file.path.startsWith(prefix)
      || !file.path.slice(prefix.length) || file.path.slice(prefix.length).includes("/")
      || file.path.length > 512 || paths.has(file.path)) throw publicError("invalid_files");
    paths.add(file.path);
    let metadata;
    try { [metadata] = await admin.storage().bucket().file(file.path).getMetadata(); }
    catch (error) {
      if (Number(error.code) === 404) throw publicError("invalid_files");
      throw error;
    }
    if (uid && metadata.metadata?.ownerUid !== uid) throw publicError("invalid_files");
    const size = Number(metadata.size);
    if (!Number.isSafeInteger(size) || size <= 0 || !DOCUMENT_TYPES.includes(metadata.contentType)) {
      throw publicError("invalid_files");
    }
    verified.push({ path: file.path, name: String(file.name || file.path.slice(prefix.length)).slice(0, 255),
      size, type: metadata.contentType });
  }
  if (!withinUploadLimits(verified)) throw publicError("upload_limits");
  return verified;
}

async function existingFiles(pin, request) {
  const files = request.files || [];
  if (request.uploadLimitsVersion === 1) { fileTotals(files); return files; }
  // Legacy rows may contain client-reported byte counts. Recheck before extending them.
  return files.length ? verifiedFiles(pin, files) : [];
}

/* New requests and supplementary documents share the same upload endpoint.
   Every write verifies Firebase Auth, stored metadata and cumulative limits. */
exports.symplirosiAitisis = onRequest(ORIA, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") return fail(res, 405, "method");
    const { energeia, email, pin, arxeia, phone } = req.body || {};
    if (!["nea_aitisi", "elegxos_kodikou", "prosthiki_arxeion"].includes(energeia)) {
      return fail(res, 400, "invalid_action");
    }
    const emailKanoniko = kanoniko(email);
    if (!validEmail(emailKanoniko)) return fail(res, 400, "invalid_email");
    try {
      const vasi = admin.database().ref("premium_requests");
      const user = await uploadUser(req);
      const kodikos = plirisKodikos(pin);
      if (!/^PIN-\d{6}$/.test(kodikos)) return fail(res, 400, "not_found");
      const reference = vasi.child(kodikos);
      const request = (await reference.once("value")).val();

      if (energeia === "nea_aitisi") {
        if (phone != null && (typeof phone !== "string" || phone.length > 40)) return fail(res, 400, "invalid_phone");
        const files = await verifiedFiles(kodikos, arxeia, user.uid);
        const createdAt = Date.now();
        const result = await reference.transaction((current) => {
          if (current) return;
          return { pin: kodikos, email: emailKanoniko, phone: phone || null, ownerUid: user.uid,
            files, ...fileTotals(files), uploadLimitsVersion: 1, status: KATASTASEIS.PARALIFTHIKAN,
            createdAt, consentAt: createdAt, paymentStatus: "not_requested" };
        });
        if (!result.committed) return fail(res, 409, "pin_conflict");
        return res.status(200).json({ success: true, pin: kodikos, plithosArxeion: files.length });
      }

      const matches = request && kanoniko(request.email) === emailKanoniko;
      if (!matches) {
        if (energeia === "elegxos_kodikou") return res.status(200).json({ success: true, tairiazei: false });
        return fail(res, 404, "not_found", "Δεν βρέθηκε αίτηση με αυτά τα στοιχεία.");
      }
      const previousFiles = await existingFiles(kodikos, request);
      if (energeia === "elegxos_kodikou") {
        return res.status(200).json({ success: true, tairiazei: true,
          canUpload: uploadAllowed(request), ...fileTotals(previousFiles) });
      }
      const files = await verifiedFiles(kodikos, arxeia, user.uid);
      const verifiedPrevious = new Map(previousFiles.map((file) => [file.path, file]));
      let rejection = "upload_stage";
      const result = await reference.transaction((current) => {
        // The Admin SDK can start with an empty local cache. Returning null lets
        // the server compare/retry with its current value; undefined would abort.
        if (current === null) return null;
        if (!current || kanoniko(current.email) !== emailKanoniko) { rejection = "not_found"; return; }
        const previous = (current.files || []).map((file) => verifiedPrevious.get(file.path) || file);
        const paths = new Set(previous.map((file) => file.path));
        const added = files.filter((file) => !paths.has(file.path));
        if (!added.length) return current; // Retry of a committed upload: no status regression.
        if (!uploadAllowed(current)) return;
        const combined = previous.concat(added);
        if (!withinUploadLimits(combined)) { rejection = "upload_limits"; return; }
        return { ...current, files: combined, ...fileTotals(combined), uploadLimitsVersion: 1,
          status: KATASTASEIS.PARALIFTHIKAN, lastUploadAt: Date.now() };
      });
      if (!result.committed || !result.snapshot.exists()) return fail(res, 409, rejection);
      return res.status(200).json({ success: true, tairiazei: true, plithosArxeion: result.snapshot.val().files.length });
    } catch (error) {
      if (!error.publicCode) console.error("Upload request failed:", error.code || error.name);
      return fail(res, error.status || 500, error.publicCode || "unavailable");
    }
  });
});

exports.createPaymentIntent = onRequest(ORIA, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") return fail(res, 405, "method");
    const { pin, email } = req.body || {};
    const kodikos = plirisKodikos(pin);
    const emailKanoniko = kanoniko(email);
    if (!/^PIN-\d{6}$/.test(kodikos) || !validEmail(emailKanoniko)) return fail(res, 404, "not_found");
    try {
      const reference = admin.database().ref(`premium_requests/${kodikos}`);
      const request = (await reference.once("value")).val();
      if (!request || kanoniko(request.email) !== emailKanoniko) return fail(res, 404, "not_found");
      if (request.status !== KATASTASEIS.ANAMONI_PLIROMIS || request.paymentStatus === "paid") {
        return fail(res, 409, "payment_unavailable");
      }
      const stripe = getStripeClient();
      // Reuse the stored intent across visits; the idempotency key also covers concurrent creation.
      const paymentIntent = request.paymentIntentId
        ? await stripe.paymentIntents.retrieve(request.paymentIntentId)
        : await stripe.paymentIntents.create({
          amount: POSO_SE_LEPTA, currency: "eur", capture_method: "automatic",
          receipt_email: emailKanoniko, metadata: { pin: kodikos, email: emailKanoniko },
        }, { idempotencyKey: `premium-${kodikos}-${request.createdAt}` });
      if (!paymentIntent || paymentIntent.status === "canceled"
        || paymentIntent.amount !== POSO_SE_LEPTA || paymentIntent.currency !== "eur"
        || plirisKodikos(paymentIntent.metadata?.pin) !== kodikos
        || kanoniko(paymentIntent.metadata?.email) !== emailKanoniko) return fail(res, 409, "payment_unavailable");
      const result = await reference.transaction((current) => {
        if (current === null) return null;
        if (!current || kanoniko(current.email) !== emailKanoniko
          || current.status !== KATASTASEIS.ANAMONI_PLIROMIS || current.paymentStatus === "paid"
          || (current.paymentIntentId && current.paymentIntentId !== paymentIntent.id)) return;
        return { ...current, paymentIntentId: paymentIntent.id };
      });
      if (!result.committed || !result.snapshot.exists()) return fail(res, 409, "payment_unavailable");
      // An already successful intent can be verified again without another charge.
      return res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret,
        ...(paymentIntent.status === "succeeded" ? { paidIntentId: paymentIntent.id } : {}) });
    } catch (error) {
      console.error("Create payment intent failed:", error.code || error.name);
      return fail(res, 500, "unavailable");
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
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "POST required" });
    }

    const { pin, email } = req.body || {};
    const kodikos = plirisKodikos(pin);
    const emailKanoniko = kanoniko(email);

    if (!/^PIN-\d{6}$/.test(kodikos) || !validEmail(emailKanoniko)) {
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

      /* Δύο ημερολογιακοί μήνες από την παράδοση, σε UTC.
         Αν λείπει η αντίστοιχη ημέρα, λήγει την τελευταία ημέρα του μήνα. */
      const now = Date.now();
      const deliveredAt = aitisi.deliveredAt;
      if (apantisi.status === KATASTASEIS.PARADOTHIKE
        && Number.isSafeInteger(deliveredAt) && deliveredAt > 0 && deliveredAt <= now) {
        const expiresAt = new Date(deliveredAt);
        const day = expiresAt.getUTCDate();
        expiresAt.setUTCDate(1);
        expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 2);
        const lastDay = new Date(Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth() + 1, 0)).getUTCDate();
        expiresAt.setUTCDate(Math.min(day, lastDay));
        apantisi.reportAvailabilityExpired = now >= expiresAt.getTime();
        if (!apantisi.reportAvailabilityExpired && aitisi.finalReportUrl) {
          apantisi.finalReportUrl = aitisi.finalReportUrl;
        }
      }

      return res.status(200).json(apantisi);
    } catch (error) {
      console.error("Σφάλμα στην ανάγνωση κατάστασης:", error.code || error.name);

      return res.status(500).json({
        success: false,
        error: "Η αναζήτηση δεν ολοκληρώθηκε. Δοκιμάστε ξανά σε λίγο.",
      });
    }
  });
});

exports.epivevaiosiPliromis = onRequest(ORIA, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") return fail(res, 405, "method");
    const { pin, email, paymentIntentId, ypanaxorisiAt } = req.body || {};
    const kodikos = plirisKodikos(pin);
    const emailKanoniko = kanoniko(email);
    if (!/^PIN-\d{6}$/.test(kodikos) || !validEmail(emailKanoniko)
      || typeof paymentIntentId !== "string" || !/^pi_[a-zA-Z0-9]+$/.test(paymentIntentId)) {
      return fail(res, 400, "invalid_payment");
    }
    try {
      const reference = admin.database().ref(`premium_requests/${kodikos}`);
      const request = (await reference.once("value")).val();
      if (!request || kanoniko(request.email) !== emailKanoniko) return fail(res, 404, "not_found");
      if (request.paymentStatus === "paid" && request.paymentIntentId === paymentIntentId) {
        return res.status(200).json({ success: true, plirothike: true, status: request.status });
      }
      if (request.status !== KATASTASEIS.ANAMONI_PLIROMIS || request.paymentStatus === "paid"
        || (request.paymentIntentId && request.paymentIntentId !== paymentIntentId)) {
        return fail(res, 409, "payment_unavailable");
      }
      const payment = await getStripeClient().paymentIntents.retrieve(paymentIntentId);
      if (!payment || payment.status !== "succeeded" || payment.currency !== "eur"
        || payment.amount_received !== POSO_SE_LEPTA || payment.amount !== POSO_SE_LEPTA
        || plirisKodikos(payment.metadata?.pin) !== kodikos
        || kanoniko(payment.metadata?.email) !== emailKanoniko) {
        return fail(res, 409, "payment_unverified", "Η πληρωμή δεν επιβεβαιώθηκε.");
      }
      const result = await reference.transaction((current) => {
        if (current === null) return null;
        if (!current || kanoniko(current.email) !== emailKanoniko) return;
        if (current.paymentStatus === "paid" && current.paymentIntentId === paymentIntentId) return current;
        if (current.status !== KATASTASEIS.ANAMONI_PLIROMIS || current.paymentStatus === "paid"
          || (current.paymentIntentId && current.paymentIntentId !== paymentIntentId)) return;
        return { ...current, paymentIntentId, paymentStatus: "paid", paidAt: Date.now(),
          status: KATASTASEIS.SE_EPEXERGASIA,
          withdrawalConsentAt: Number.isSafeInteger(ypanaxorisiAt) && ypanaxorisiAt > 0 && ypanaxorisiAt <= Date.now()
            ? ypanaxorisiAt : Date.now() };
      });
      if (!result.committed || !result.snapshot.exists()) return fail(res, 409, "payment_unavailable");
      return res.status(200).json({ success: true, plirothike: true, status: result.snapshot.val().status });
    } catch (error) {
      console.error("Payment verification failed:", error.code || error.name);
      return fail(res, 500, "unavailable");
    }
  });
});

exports.sendContactMessage = onRequest(ORIA, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") return fail(res, 405, "method");
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)
      || Object.keys(body).some((key) => !["email", "message"].includes(key))
      || typeof body.email !== "string" || typeof body.message !== "string"
      || !validEmail(body.email.trim()) || body.message.trim().length < 10
      || body.message.length > 5000 || body.email.length > 254) {
      return fail(res, 400, "invalid_contact", "Ελέγξτε το email και το μήνυμά σας (10–5000 χαρακτήρες).");
    }
    try {
      const recipient = (process.env.CONTACT_EMAIL || process.env.EMAIL_USER || "").trim();
      if (!validEmail(recipient)) throw new Error("Contact recipient unavailable");
      const result = await getEmailTransporter().sendMail({
        from: `"${ONOMA_APOSTOLEA}" <${process.env.EMAIL_USER}>`,
        to: recipient,
        replyTo: body.email.trim(),
        subject: "Ερώτηση από την ιστοσελίδα Sintaximou",
        text: body.message.trim(),
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (!result.accepted?.length) throw new Error("Message not accepted");
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Contact delivery failed:", error.code || error.name);
      return fail(res, 503, "contact_failed", "Το μήνυμα δεν στάλθηκε. Δοκιμάστε ξανά σε λίγο.");
    }
  });
});
