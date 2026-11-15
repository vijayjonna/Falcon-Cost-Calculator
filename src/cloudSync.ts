import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, auth, googleProvider, firebaseConfig } from './firebase';
import { ProjectData } from './types';
import { sanitizeProject, isDefaultEmptyProject } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  const serialized = JSON.stringify(errInfo);
  console.error('Firestore Error: ', serialized);
  throw new Error(serialized);
}

/**
 * Formats Firebase Auth or Firestore errors into readable user-facing messages.
 */
export function formatFirebaseErrorMessage(err: unknown): string {
  const rawMessage = err instanceof Error ? err.message : String(err || '');
  const code = (err as any)?.code as string | undefined;

  // Unwrap structured FirestoreErrorInfo JSON if present
  let innerMessage = rawMessage;
  try {
    if (rawMessage.startsWith('{')) {
      const parsed = JSON.parse(rawMessage) as FirestoreErrorInfo;
      if (parsed?.error) {
        innerMessage = parsed.error;
      }
    }
  } catch {
    // Not JSON, keep rawMessage
  }

  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site and click Continue with Google again.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in popup was closed before completing. Please try again.';
  }
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `Domain "${host}" is not authorized in Firebase Auth. Add it under Firebase Console > Authentication > Settings > Authorized domains.`;
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in method is not enabled in Firebase Authentication. Please use Google Sign-In.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error while connecting to Firebase. Please check your internet connection and try again.';
  }

  if (
    innerMessage.includes("Quota exceeded for quota metric 'Free daily read units per project")
  ) {
    const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
    return `Firestore daily free-tier read quota exceeded. Quota resets tomorrow, or you can review usage/upgrade in Firebase Console: ${consoleUrl}`;
  }
  if (innerMessage.includes('Quota exceeded')) {
    return 'Firestore usage quota exceeded for today. Quota resets the next day (Spark plan Enterprise edition limits apply).';
  }
  if (innerMessage.includes('Missing or insufficient permissions') || innerMessage.includes('permission-denied')) {
    return 'Cloud sync permission denied. Please sign out and sign back in with a verified Google account.';
  }
  if (innerMessage.includes('the client is offline')) {
    return 'You appear to be offline. Changes are saved locally and will sync when reconnected.';
  }

  return innerMessage || 'An unexpected cloud sync error occurred.';
}

/**
 * Strips `undefined` and non-finite numeric values for Firestore serialization safety
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (typeof obj === 'number') return Number.isFinite(obj) ? obj : 0;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    cleaned[key] = val !== undefined ? sanitizeForFirestore(val) : null;
  }
  return cleaned;
}

/**
 * Builds a strict, schema-compliant payload matching firebase-blueprint.json & firestore.rules
 */
function buildFirestoreProjectPayload(userId: string, project: ProjectData): Record<string, any> {
  const sanitized = sanitizeProject({
    ...project,
    userId,
  });

  const payload = {
    id: sanitized.id,
    name: sanitized.name,
    clientName: sanitized.clientName,
    currency: sanitized.currency,
    globalPrices: sanitized.globalPrices,
    rooms: sanitized.rooms,
    userId,
    createdAt: sanitized.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  return sanitizeForFirestore(payload);
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

  const path = `users/${userId}/projects`;
  const projectsCol = collection(db, 'users', userId, 'projects');
  const q = query(projectsCol, where('userId', '==', userId));

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
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrappedErr) {
        if (onError) {
          onError(wrappedErr instanceof Error ? wrappedErr : new Error(String(wrappedErr)));
        } else {
          throw wrappedErr;
        }
      }
    }
  );
}

/**
 * Saves or updates a project in Firestore under the authenticated user
 */
export async function saveProjectToCloud(userId: string, project: ProjectData): Promise<void> {
  if (!userId || !project.id) return;
  const payload = buildFirestoreProjectPayload(userId, project);
  const docId = payload.id as string;
  const path = `users/${userId}/projects/${docId}`;
  const projectRef = doc(db, 'users', userId, 'projects', docId);

  try {
    await setDoc(projectRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a project from the cloud
 */
export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<void> {
  if (!userId || !projectId) return;
  const path = `users/${userId}/projects/${projectId}`;
  const projectRef = doc(db, 'users', userId, 'projects', projectId);

  try {
    await deleteDoc(projectRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Syncs initial local projects to the cloud upon user sign-in without uploading blank placeholders
 */
export async function syncLocalProjectsToCloud(
  userId: string,
  localProjects: ProjectData[]
): Promise<void> {
  if (!userId) return;

  const path = `users/${userId}/projects`;
  const projectsCol = collection(db, 'users', userId, 'projects');
  const q = query(projectsCol, where('userId', '==', userId));

  let existingSnap;
  try {
    existingSnap = await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }

  const existingIds = new Set(existingSnap.docs.map((d) => d.id));
  const nonEmptyLocals = localProjects.filter((p) => p.id && !isDefaultEmptyProject(p));

  for (const p of nonEmptyLocals) {
    if (p.id && !existingIds.has(p.id)) {
      await saveProjectToCloud(userId, p);
    }
  }
}

/**
 * Deletes all projects stored in Firestore for the authenticated user
 */
export async function clearAllCloudProjects(userId: string): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/projects`;
  const projectsCol = collection(db, 'users', userId, 'projects');
  const q = query(projectsCol, where('userId', '==', userId));

  let snap;
  try {
    snap = await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }

  for (const docSnap of snap.docs) {
    await deleteProjectFromCloud(userId, docSnap.id);
  }
}

/**
 * Google Sign-In using popup (preferred in AI Studio iframe environment)
 */
export async function signInWithGoogle(): Promise<User> {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
