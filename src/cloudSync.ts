import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import { ProjectData } from './types';
import { sanitizeProject } from './storage';

/**
 * Strips `undefined` values for Firestore serialization safety
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    } else {
      cleaned[key] = null;
    }
  }
  return cleaned;
}

/**
 * Normalizes Firestore document back into ProjectData
 */
function normalizeFromFirestore(data: any, id: string): ProjectData {
  return sanitizeProject({
    ...data,
    id,
  });
}

/**
 * Listen to real-time changes of the user's projects in Firestore
 */
export function subscribeToUserProjects(
  userId: string,
  onProjectsUpdate: (projects: ProjectData[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    return () => {};
  }

  const projectsCol = collection(db, 'users', userId, 'projects');
  const q = query(projectsCol);

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ProjectData[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          list.push(normalizeFromFirestore(docSnap.data(), docSnap.id));
        }
      });
      // Sort newest updated first
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onProjectsUpdate(list);
    },
    (error) => {
      console.error('Firestore snapshot subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves or updates a project in Firestore under the authenticated user
 */
export async function saveProjectToCloud(userId: string, project: ProjectData): Promise<void> {
  if (!userId || !project.id) return;
  const projectRef = doc(db, 'users', userId, 'projects', project.id);
  const payload = sanitizeForFirestore({
    ...project,
    userId,
    updatedAt: Date.now(),
  });
  await setDoc(projectRef, payload, { merge: true });
}

/**
 * Deletes a project from the cloud
 */
export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<void> {
  if (!userId || !projectId) return;
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await deleteDoc(projectRef);
}

/**
 * Syncs initial local projects to the cloud upon user sign-in so no data is lost
 */
export async function syncLocalProjectsToCloud(
  userId: string,
  localProjects: ProjectData[]
): Promise<void> {
  if (!userId || !localProjects.length) return;
  try {
    const projectsCol = collection(db, 'users', userId, 'projects');
    const existingSnap = await getDocs(projectsCol);
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));

    // Upload local projects that don't yet exist in cloud
    for (const p of localProjects) {
      if (p.id && !existingIds.has(p.id)) {
        await saveProjectToCloud(userId, p);
      }
    }
  } catch (err) {
    console.warn('Initial local-to-cloud sync warning:', err);
  }
}

/**
 * Auth Helpers
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err: any) {
    // Fallback to redirect if popup is blocked in iframe/mobile
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting for sign-in...');
    }
    throw err;
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
