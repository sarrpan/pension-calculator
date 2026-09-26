import { ref as storageRef, uploadBytes, deleteObject } from "firebase/storage";
import { storage } from "../../firebase";
import { initAuth } from "../../authInit";

const DIEFTHYNSI_SYMPLIROSIS = import.meta.env.VITE_SYMPLIROSI_AITISIS_URL;
const DIEFTHYNSI_KATASTASIS = import.meta.env.VITE_GET_REQUEST_STATUS_URL;
const DIEFTHYNSI_EPIVEVAIOSIS = import.meta.env.VITE_EPIVEVAIOSI_PLIROMIS_URL;
const DIEFTHYNSI_YPANACHORISIS = import.meta.env.VITE_REQUEST_WITHDRAWAL_URL;

export const KATASTASEIS = {
  PARALIFTHIKAN: "documents_received",
  ELLIPI: "needs_more_info",
  ANAMONI_PLIROMIS: "awaiting_payment",
  SE_EPEXERGASIA: "processing",
  PARADOTHIKE: "delivered",
  YPANACHORISI: "withdrawn",
};

export const UPLOAD_LIMITS = { files: 10, bytes: 50 * 1024 * 1024 };
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGES = {
  report_delivered: "Η υπηρεσία έχει ολοκληρωθεί. Για οποιοδήποτε θέμα, επικοινωνήστε μαζί μας.",
  withdrawal_unavailable: "Η υπαναχώρηση δεν είναι διαθέσιμη για αυτή την αίτηση. Επικοινωνήστε μαζί μας.",
  confirmation_required: "Επιβεβαιώστε ότι επιθυμείτε να υπαναχωρήσετε από τη σύμβαση.",
  invalid_withdrawal_name: "Συμπληρώστε το ονοματεπώνυμό σας στη δήλωση υπαναχώρησης (2–200 χαρακτήρες).",
  upload_limits: "Κάθε αίτηση δέχεται έως 10 αρχεία και έως 50 MB συνολικά, μαζί με τα ήδη αποθηκευμένα. Αφαιρέστε, ενώστε ή μειώστε αρχεία, ή επικοινωνήστε μαζί μας.",
  invalid_files: "Επιλέξτε έγκυρα, μη κενά αρχεία PDF, JPG/JPEG ή PNG.",
  upload_stage: "Η αίτηση έχει ήδη προχωρήσει σε επόμενο στάδιο. Επικοινωνήστε μαζί μας για επιπλέον έγγραφα.",
  not_found: "Δεν βρέθηκε αίτηση με αυτά τα στοιχεία. Ελέγξτε τον κωδικό και το email σας.",
  pin_conflict: "Η αποστολή δεν ολοκληρώθηκε. Δοκιμάστε ξανά για να δημιουργηθεί νέος κωδικός.",
  unavailable: "Η υπηρεσία δεν είναι διαθέσιμη αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο ή επικοινωνήστε μαζί μας.",
  uncertain: "Δεν επιβεβαιώθηκε η καταχώριση. Ελέγξτε την Παρακολούθηση αίτησης με τον κωδικό που ακολουθεί πριν ξαναστείλετε αρχεία, ή επικοινωνήστε μαζί μας.",
};
const kanoniko = (email) => String(email || "").trim().toLowerCase();
const plirisKodikos = (pin) => `PIN-${String(pin || "").replace(/^PIN[-\s]*/i, "").trim()}`;
const validEmail = (email) => EMAIL_PATTERN.test(email) && email.length <= 254;
const katharoOnoma = (name) => String(name || "arxeio").replace(/[^\w.\-]+/g, "_").slice(-60);

// Used both by the page and by every service upload, including supplementary files.
export const validateUploadFiles = (files, existing = { fileCount: 0, totalBytes: 0 }) => {
  const list = Array.from(files || []);
  if (!list.length || list.some((file) => !file || !ALLOWED_TYPES.includes(file.type)
    || !Number.isSafeInteger(file.size) || file.size <= 0)) return MESSAGES.invalid_files;
  if (!Number.isSafeInteger(existing.fileCount) || existing.fileCount < 0
    || !Number.isSafeInteger(existing.totalBytes) || existing.totalBytes < 0) return MESSAGES.unavailable;
  if (existing.fileCount + list.length > UPLOAD_LIMITS.files
    || existing.totalBytes + list.reduce((sum, file) => sum + file.size, 0) > UPLOAD_LIMITS.bytes) {
    return MESSAGES.upload_limits;
  }
  return '';
};

const klisiSynartisis = async (body, url = DIEFTHYNSI_SYMPLIROSIS, user = null) => {
  if (!url) return { success: false, error: MESSAGES.unavailable };
  try {
    const headers = { "Content-Type": "application/json" };
    if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || data.success !== true) {
      return {
        success: false,
        code: data.code,
        uncertain: response.status >= 500,
        error: MESSAGES[data.code] || MESSAGES.unavailable,
      };
    }
    return data;
  } catch {
    return { success: false, uncertain: true, error: MESSAGES.unavailable };
  }
};

const cleanup = async (files) => {
  await Promise.all(files.map(async ({ path }) => {
    try { await deleteObject(storageRef(storage, path)); } catch { /* Best effort, owner only. */ }
  }));
};

const uploadFiles = async (pin, files, user, uploaded, onProgress) => {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const path = `premium_uploads/${pin}/${crypto.randomUUID()}-${katharoOnoma(file.name)}`;
    onProgress?.(index + 1, files.length);
    await uploadBytes(storageRef(storage, path), file, {
      contentType: file.type,
      customMetadata: { ownerUid: user.uid },
    });
    uploaded.push({ path, name: file.name.slice(0, 255), size: file.size, type: file.type });
  }
};

export const katastasiAitisis = async (pin, email) => {
  const result = await klisiSynartisis({ pin: plirisKodikos(pin), email: kanoniko(email) }, DIEFTHYNSI_KATASTASIS);
  if (!result.success) return { success: false };
  return {
    success: true,
    vrethike: Boolean(result.vrethike),
    aitisi: result.vrethike ? {
      pin: result.pin, email: result.email, status: result.status,
      finalReportUrl: result.finalReportUrl || null,
      reportAvailabilityExpired: result.reportAvailabilityExpired === true,
      paymentStatus: result.paymentStatus,
      reportDelivered: result.reportDelivered === true,
      canWithdraw: result.canWithdraw === true,
      withdrawalStatus: result.withdrawalStatus || null,
      withdrawalRequestedAt: result.withdrawalRequestedAt || null,
      refundStatus: result.refundStatus || null,
    } : null,
  };
};

export const ypovoliYpanachorisis = (pin, email, confirmed, fullName) => {
  if (!DIEFTHYNSI_YPANACHORISIS) return Promise.resolve({ success: false, error: MESSAGES.unavailable });
  return klisiSynartisis({
    pin: plirisKodikos(pin), email: kanoniko(email), confirmed: confirmed === true, fullName,
  }, DIEFTHYNSI_YPANACHORISIS);
};

export const anevasmaAitisis = async (stoicheia, arxeia, onProodos) => {
  const email = kanoniko(stoicheia?.email);
  const phone = String(stoicheia?.tilefono || '').trim();
  const files = Array.from(arxeia || []);
  const error = validateUploadFiles(files);
  if (error) return { success: false, error };
  if (!validEmail(email) || phone.length > 40 || !DIEFTHYNSI_SYMPLIROSIS) {
    return { success: false, error: MESSAGES.unavailable };
  }
  const uploaded = [];
  try {
    const user = await initAuth();
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    const pin = `PIN-${100000 + random % 900000}`;
    await uploadFiles(pin, files, user, uploaded, onProodos);
    // Creation is server-owned: no browser writes payment/status fields to the database.
    const result = await klisiSynartisis({
      energeia: "nea_aitisi", pin, email, phone, arxeia: uploaded,
    }, DIEFTHYNSI_SYMPLIROSIS, user);
    if (!result.success) {
      // A lost response might follow a successful commit. Do not delete its documents.
      if (!result.uncertain) await cleanup(uploaded);
      return { success: false, error: result.uncertain ? `${MESSAGES.uncertain} ${pin}` : result.error };
    }
    return { success: true, pin, plithosArxeion: result.plithosArxeion };
  } catch {
    await cleanup(uploaded);
    return { success: false, error: MESSAGES.unavailable };
  }
};

export const prosthikiSeAitisi = async (pin, email, arxeia, onProodos) => {
  const kodikos = plirisKodikos(pin);
  const emailKanoniko = kanoniko(email);
  const files = Array.from(arxeia || []);
  const error = validateUploadFiles(files);
  if (error) return { success: false, error };
  if (!/^PIN-\d{6}$/.test(kodikos) || !validEmail(emailKanoniko)) {
    return { success: false, error: MESSAGES.not_found };
  }
  const uploaded = [];
  try {
    const user = await initAuth();
    const existing = await klisiSynartisis({
      energeia: "elegxos_kodikou", pin: kodikos, email: emailKanoniko,
    }, DIEFTHYNSI_SYMPLIROSIS, user);
    if (!existing.success) return { success: false, error: existing.error };
    if (!existing.tairiazei) return { success: false, error: MESSAGES.not_found };
    if (!existing.canUpload) return { success: false, error: MESSAGES.upload_stage };
    const cumulativeError = validateUploadFiles(files, existing);
    if (cumulativeError) return { success: false, error: cumulativeError };
    await uploadFiles(kodikos, files, user, uploaded, onProodos);
    const result = await klisiSynartisis({
      energeia: "prosthiki_arxeion", pin: kodikos, email: emailKanoniko, arxeia: uploaded,
    }, DIEFTHYNSI_SYMPLIROSIS, user);
    if (!result.success) {
      if (!result.uncertain) await cleanup(uploaded);
      return { success: false, error: result.uncertain ? `${MESSAGES.uncertain} ${kodikos}` : result.error };
    }
    return { success: true, pin: kodikos, symplirosi: true, synolikaArxeia: result.plithosArxeion };
  } catch {
    await cleanup(uploaded);
    return { success: false, error: MESSAGES.unavailable };
  }
};

export const katagrafiPliromis = async (pin, paymentIntentId, epipleon = {}) => {
  const result = await klisiSynartisis({
    pin: plirisKodikos(pin), email: kanoniko(epipleon.email), paymentIntentId,
    ypanaxorisiAt: epipleon.ypanaxorisiAt || null,
  }, DIEFTHYNSI_EPIVEVAIOSIS);
  return result.success && result.plirothike
    ? { success: true, status: result.status }
    : { success: false, kodikos: "provlima_katagrafis_pliromis" };
};
