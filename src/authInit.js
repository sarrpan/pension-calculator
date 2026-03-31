import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Καλείται 1 φορά στο startup για να εξασφαλίσει ότι υπάρχει auth user
export async function initAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          unsub();
          resolve(user);
          return;
        }
        await signInAnonymously(auth);
        // θα ξανα-trigger το onAuthStateChanged και θα κάνει resolve
      } catch (e) {
        unsub();
        reject(e);
      }
    });
  });
}