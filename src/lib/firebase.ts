import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    providerInfo?: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogleCitizen(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userDocRef);
    if (!existingSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: (user.displayName || 'Citizen User').slice(0, 120),
        role: 'citizen',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }

  const privateDocRef = doc(db, 'users', user.uid, 'private', 'info');
  try {
    await setDoc(
      privateDocRef,
      {
        uid: user.uid,
        email: (user.email || '').slice(0, 160),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/private/info`);
  }

  return user;
}

export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export async function mirrorGrievanceToFirestore(payload: {
  referenceNumber: string;
  citizenName: string;
  state: string;
  district: string;
  city: string;
  department: string;
  category: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  addressLabel: string;
  photoCount: number;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return;
  }
  const path = 'grievances';
  try {
    const docRef = await addDoc(collection(db, path), {
      referenceNumber: payload.referenceNumber.slice(0, 32),
      citizenUid: user.uid,
      citizenName: payload.citizenName.slice(0, 120),
      state: payload.state.slice(0, 80),
      district: payload.district.slice(0, 80),
      city: payload.city.slice(0, 80),
      department: payload.department.slice(0, 120),
      category: payload.category.slice(0, 120),
      title: payload.title.slice(0, 200),
      description: payload.description.slice(0, 3000),
      latitude: payload.latitude,
      longitude: payload.longitude,
      addressLabel: payload.addressLabel.slice(0, 250),
      photoCount: Math.min(5, Math.max(0, payload.photoCount)),
      status: 'Registered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, `grievances/${docRef.id}/history`), {
      grievanceId: docRef.id,
      status: 'Registered',
      remarks: 'Grievance registered by citizen on LokSudhar (लोक सुधार) Portal.',
      updatedByUid: user.uid,
      updatedByName: payload.citizenName.slice(0, 120),
      updatedByRole: 'citizen',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}
