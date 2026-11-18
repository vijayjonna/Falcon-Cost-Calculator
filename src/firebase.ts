import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long-polling enabled so WebChannel works reliably across proxies, iframes, and mobile networks
function createFirestoreInstance(): Firestore {
  const dbId =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      dbId
    );
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = createFirestoreInstance();

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Ensure persistence is stored in local storage for mobile & desktop sessions
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Could not set auth persistence:', err);
});

// Test connection to Firestore as per skill guidelines
export async function testFirestoreConnection(): Promise<{ ok: boolean; error?: string }> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, error: 'Device is offline. Changes are saved locally and will sync when reconnected.' };
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true };
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    const code = error?.code as string | undefined;
    if (msg.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
      return { ok: false, error: 'Firestore client is offline. Check your internet connection or Firebase config.' };
    }
    if (code === 'unavailable' || msg.includes('unavailable')) {
      return { ok: false, error: 'Cloud Firestore is temporarily unreachable. Changes are saved locally and will sync when reconnected.' };
    }
    if (msg.includes('Quota exceeded')) {
      console.error('Firestore quota exceeded:', msg);
      return { ok: false, error: msg };
    }
    // Non-fatal if test/connection document does not exist
    return { ok: true };
  }
}

export { firebaseConfig };
export default app;
