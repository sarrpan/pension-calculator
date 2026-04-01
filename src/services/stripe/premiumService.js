import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
import { storage, db } from "../../firebase";

const generatePin = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `PIN-${randomNum}`;
};

/**
 * Υποβάλλει το αίτημα Premium: Ανεβάζει το PDF και σώζει τα δεδομένα.
 */
export const submitPremiumRequest = async (email, file, paymentIntentId) => { 
  try {
    const pin = generatePin();
    const filePath = `premium_pdfs/${pin}.pdf`; // Ορίζουμε τη διαδρομή

    const fileRef = storageRef(storage, filePath);
    // 1. Ανεβάζουμε το αρχείο
    await uploadBytes(fileRef, file);
    
    // ΑΦΑΙΡΕΘΗΚΕ: const downloadUrl = await getDownloadURL(fileRef);

    const requestData = {
      pin: pin,
      email: email,
      pdfUrl: filePath, // ΑΛΛΑΓΗ: Αποθηκεύουμε το Path, όχι το πλήρες URL
      status: "Pending Payment", 
      createdAt: Date.now(),
      paymentIntentId: paymentIntentId 
    };

    // 2. Αποθηκεύουμε τα στοιχεία στη βάση
    await set(dbRef(db, `premium_requests/${pin}`), requestData);

    return { success: true, pin: pin };
    
  } catch (error) {
    console.error("Σφάλμα κατά την υποβολή:", error);
    return { success: false, error: "Υπήρξε πρόβλημα με το ανέβασμα του αρχείου." };
  }
};