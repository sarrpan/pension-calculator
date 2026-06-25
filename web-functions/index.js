require("dotenv").config();

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

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

// Δέσμευση 10 € χωρίς άμεση είσπραξη.
exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "POST required",
      });
    }

    try {
      const stripe = getStripeClient();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: "eur",
        capture_method: "manual",
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

// Οριστική είσπραξη και αποστολή email ολοκλήρωσης.
exports.capturePayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "POST required",
      });
    }

    try {
      const {
        paymentIntentId,
        customerEmail,
        pin,
      } = req.body || {};

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: "Missing Payment ID",
        });
      }

      const stripe = getStripeClient();
      const paymentIntent =
        await stripe.paymentIntents.capture(paymentIntentId);

      if (paymentIntent.status === "succeeded" && customerEmail) {
        const transporter = getEmailTransporter();

        await transporter.sendMail({
          from: `"Geodora Pension" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: "Το Premium Report σας είναι έτοιμο! ✅",
          html: `
            <div style="font-family: sans-serif; color: #334155;">
              <h2>Γεια σας!</h2>
              <p>
                Σας ενημερώνουμε ότι η ανάλυση της σύνταξής σας
                ολοκληρώθηκε επιτυχώς.
              </p>
              <p>
                Μπορείτε να κατεβάσετε το Report σας από την ιστοσελίδα
                χρησιμοποιώντας το PIN σας:
              </p>
              <div
                style="
                  background: #f1f5f9;
                  padding: 15px;
                  font-size: 20px;
                  font-weight: bold;
                  text-align: center;
                  border-radius: 8px;
                "
              >
                ${pin || ""}
              </div>
              <p style="margin-top: 20px;">
                Ευχαριστούμε για την εμπιστοσύνη σας!
              </p>
            </div>
          `,
        });
      }

      return res.status(200).json({
        success: true,
        status: paymentIntent.status,
      });
    } catch (error) {
      console.error("Capture payment error:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});
