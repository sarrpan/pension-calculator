import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
import { storage, db } from "../../firebase";

const generatePin = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `PIN-${randomNum}`;
};

/**
 * Υποβάλλει το αίτημα Premium: Ανεβάζει το PDF και σώζει τα δεδομένα.
 */
// <-- ΝΕΟ: Προστέθηκε η παράμετρος paymentIntentId
export const submitPremiumRequest = async (email, file, paymentIntentId) => { 
  try {
    const pin = generatePin();

    const fileRef = storageRef(storage, `premium_pdfs/${pin}.pdf`);
    await uploadBytes(fileRef, file);
    
    const downloadUrl = await getDownloadURL(fileRef);

    const requestData = {
      pin: pin,
      email: email,
      pdfUrl: downloadUrl,
      status: "Pending Payment", // Το έκανα Αγγλικά για να ταιριάζει με το Admin Panel σου
      createdAt: Date.now(),
      paymentIntentId: paymentIntentId // <-- ΝΕΟ: Αποθηκεύουμε τον κωδικό του Stripe στη βάση
    };

    await set(dbRef(db, `premium_requests/${pin}`), requestData);

    return { success: true, pin: pin };
    
  } catch (error) {
    console.error("Σφάλμα κατά την υποβολή:", error);
    return { success: false, error: "Υπήρξε πρόβλημα με το ανέβασμα του αρχείου." };
  }
};