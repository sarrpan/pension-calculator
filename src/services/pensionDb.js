import { ref, get, set } from "firebase/database";
import { db } from "../firebase";

/**
 * Αποθήκευση προφίλ με κλειδί ΜΟΝΟ το AMKA σε κοινό φάκελο.
 */
export async function saveProfileByAmka(amka, payload) {
  const cleanAmka = String(amka || "").trim();
  if (!cleanAmka) throw new Error("AMKA is required");

  // Νέο path: profiles/{amka}
  const path = `profiles/${cleanAmka}`;
  await set(ref(db, path), {
    ...payload,
    amka: cleanAmka,
    updatedAt: Date.now(),
  });

  return true;
}

/**
 * Φόρτωση προφίλ με κλειδί το AMKA από τον κοινό φάκελο.
 */
export async function loadProfileByAmka(amka) {
  const cleanAmka = String(amka || "").trim();
  if (!cleanAmka) throw new Error("AMKA is required");

  // Αναζήτηση στο νέο path
  const path = `profiles/${cleanAmka}`;
  const snap = await get(ref(db, path));
  
  if (!snap.exists()) return null;

  return snap.val();
}