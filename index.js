require("dotenv").config();

const functions = require("firebase-functions");
const { calculateDeiSector } = require("./src/calculators/dei/ResultsCalculator");
const cors = require("cors")({ origin: true });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. Δέσμευση χρημάτων (Το αφήνουμε όπως είναι)
exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(400).send("POST required");
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, 
        currency: "eur",
        capture_method: "manual", 
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
});

// 2. Είσπραξη χρημάτων ΚΑΙ αποστολή Email
exports.capturePayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(400).send("POST required");

    try {
      // Παίρνουμε το ID, το email του πελάτη και το PIN από το Dashboard
      const { paymentIntentId, customerEmail, pin } = req.body; // <-- ΝΕΟ: Προστέθηκαν email και pin

      if (!paymentIntentId) {
        return res.status(400).send({ error: "Missing Payment ID" });
      }

      // α) Οριστική χρέωση στο Stripe
      const intent = await stripe.paymentIntents.capture(paymentIntentId);

      // β) Αποστολή Email στον πελάτη αν η χρέωση πέτυχε
      if (intent.status === "succeeded" && customerEmail) {
        const mailOptions = {
          from: '"Geodora Pension" <ΤΟ_EMAIL_ΣΟΥ@gmail.com>', // <-- ΒΑΛΕ ΤΟ EMAIL ΣΟΥ ΕΔΩ
          to: customerEmail,
          subject: "Το Premium Report σας είναι έτοιμο! ✅",
          html: `
            <div style="font-family: sans-serif; color: #334155;">
              <h2>Γεια σας!</h2>
              <p>Σας ενημερώνουμε ότι η ανάλυση της σύνταξής σας ολοκληρώθηκε επιτυχώς.</p>
              <p>Μπορείτε να κατεβάσετε το Report σας από την ιστοσελίδα μας χρησιμοποιώντας το PIN σας:</p>
              <div style="background: #f1f5f9; padding: 15px; font-size: 20px; font-weight: bold; text-align: center; border-radius: 8px;">
                ${pin}
              </div>
              <p style="margin-top: 20px;">Ευχαριστούμε για την εμπιστοσύνη σας!</p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
      }

      res.send({ success: true, status: intent.status });
      
    } catch (error) {
      console.error("Σφάλμα:", error);
      res.status(500).send({ error: error.message });
    }
  });
});
exports.calculateDeiPension = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(400).send("POST required");
  }

  try {
    const result = calculateDeiSector(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Σφάλμα στον υπολογισμό ΔΕΗ:", error);
    return res.status(500).json({ error: error.message });
  }
});
