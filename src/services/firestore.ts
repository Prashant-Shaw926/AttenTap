import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

import {
  configureFirebase,
  getFirestore,
  FieldValue,
  Timestamp,
} from '../config/firebase';

export type FirestoreDocument<T extends FirebaseFirestoreTypes.DocumentData> = T & {
  id: string;
};

export type CollectionQueryBuilder<
  T extends FirebaseFirestoreTypes.DocumentData,
> = (
  collection: FirebaseFirestoreTypes.CollectionReference<T>,
) => FirebaseFirestoreTypes.Query<T>;

export type FirestoreUpdate<T extends FirebaseFirestoreTypes.DocumentData> =
  Partial<T> & FirebaseFirestoreTypes.DocumentData;

const serializeDocument = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot<T>,
): FirestoreDocument<T> | null => {
  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();

  if (!data) {
    return null;
  }

  return {
    id: snapshot.id,
    ...data,
  };
};

const serializeQuerySnapshot = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  snapshot: FirebaseFirestoreTypes.QuerySnapshot<T>,
): FirestoreDocument<T>[] =>
  snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }));

export const ensureFirestoreReady = async (): Promise<
  FirebaseFirestoreTypes.Module
> => configureFirebase();

export const db = (): FirebaseFirestoreTypes.Module => getFirestore();

export const collectionRef = async <
  T extends FirebaseFirestoreTypes.DocumentData = FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
): Promise<FirebaseFirestoreTypes.CollectionReference<T>> => {
  const firestoreDb = await ensureFirestoreReady();
  return firestoreDb.collection<T>(collectionPath);
};

export const documentRef = async <
  T extends FirebaseFirestoreTypes.DocumentData = FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
): Promise<FirebaseFirestoreTypes.DocumentReference<T>> => {
  const firestoreDb = await ensureFirestoreReady();
  return firestoreDb.doc<T>(documentPath);
};

export const addDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  data: T,
): Promise<string> => {
  const collection = await collectionRef<T>(collectionPath);
  const reference = await collection.add(data);
  return reference.id;
};

export const setDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
  data: FirebaseFirestoreTypes.SetValue<T>,
  options?: FirebaseFirestoreTypes.SetOptions,
): Promise<void> => {
  const document = await documentRef<T>(documentPath);
  await document.set(data, options);
};

export const updateDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
  data: FirestoreUpdate<T>,
): Promise<void> => {
  const document = await documentRef<T>(documentPath);
  await document.update(data);
};

export const deleteDocument = async (documentPath: string): Promise<void> => {
  const document = await documentRef(documentPath);
  await document.delete();
};

export const getDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
): Promise<FirestoreDocument<T> | null> => {
  const document = await documentRef<T>(documentPath);
  const snapshot = await document.get();
  return serializeDocument(snapshot);
};

export const getCollection = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  buildQuery?: CollectionQueryBuilder<T>,
): Promise<FirestoreDocument<T>[]> => {
  const collection = await collectionRef<T>(collectionPath);
  const query = buildQuery ? buildQuery(collection) : collection;
  const snapshot = await query.get();
  return serializeQuerySnapshot(snapshot);
};

export const subscribeToDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
  onNext: (document: FirestoreDocument<T> | null) => void,
  onError?: (error: Error) => void,
): Promise<() => void> => {
  const document = await documentRef<T>(documentPath);

  return document.onSnapshot(
    snapshot => {
      onNext(serializeDocument(snapshot));
    },
    error => {
      onError?.(error);
    },
  );
};

export const subscribeToCollection = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  onNext: (documents: FirestoreDocument<T>[]) => void,
  onError?: (error: Error) => void,
  buildQuery?: CollectionQueryBuilder<T>,
): Promise<() => void> => {
  const collection = await collectionRef<T>(collectionPath);
  const query = buildQuery ? buildQuery(collection) : collection;

  return query.onSnapshot(
    snapshot => {
      onNext(serializeQuerySnapshot(snapshot));
    },
    error => {
      onError?.(error);
    },
  );
};

export const runBatch = async (
  applyWrites: (
    batch: FirebaseFirestoreTypes.WriteBatch,
    firestoreDb: FirebaseFirestoreTypes.Module,
  ) => void | Promise<void>,
): Promise<void> => {
  const firestoreDb = await ensureFirestoreReady();
  const batch = firestoreDb.batch();

  await applyWrites(batch, firestoreDb);
  await batch.commit();
};

export const runFirestoreTransaction = async <T>(
  updateFunction: (
    transaction: FirebaseFirestoreTypes.Transaction,
    firestoreDb: FirebaseFirestoreTypes.Module,
  ) => Promise<T>,
): Promise<T> => {
  const firestoreDb = await ensureFirestoreReady();

  return firestoreDb.runTransaction(transaction =>
    updateFunction(transaction, firestoreDb),
  );
};

export const serverTimestamp = (): FirebaseFirestoreTypes.FieldValue =>
  FieldValue.serverTimestamp();

export const arrayUnion = (
  ...values: unknown[]
): FirebaseFirestoreTypes.FieldValue => FieldValue.arrayUnion(...values);

export const arrayRemove = (
  ...values: unknown[]
): FirebaseFirestoreTypes.FieldValue => FieldValue.arrayRemove(...values);

export const increment = (value: number): FirebaseFirestoreTypes.FieldValue =>
  FieldValue.increment(value);

export const now = (): FirebaseFirestoreTypes.Timestamp => Timestamp.now();
