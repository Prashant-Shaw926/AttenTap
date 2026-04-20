import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore'

import {configureFirebase} from '../config/firebase'

export const ensureFirestoreReady = async (): Promise<
  FirebaseFirestoreTypes.Module
> => configureFirebase()

export const setDocument = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  documentPath: string,
  data: FirebaseFirestoreTypes.SetValue<T>,
  options?: FirebaseFirestoreTypes.SetOptions,
): Promise<void> => {
  const firestoreDb = await ensureFirestoreReady()
  await firestoreDb.doc<T>(documentPath).set(data, options)
}
