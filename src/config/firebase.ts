import firestore, {
  FieldValue as FirestoreFieldValue,
  Timestamp as FirestoreTimestamp,
} from '@react-native-firebase/firestore'

let emulatorConnected = false
let settingsApplied = false

export const configureFirebase = async () => {
  const db = firestore()

  if (__DEV__ && !emulatorConnected) {
    emulatorConnected = true
  }

  if (!settingsApplied) {
    await db.settings({
      ignoreUndefinedProperties: true,
    })
    settingsApplied = true
  }

  return db
}

export const getFirestore = () => firestore()

export const FieldValue = FirestoreFieldValue
export const Timestamp = FirestoreTimestamp
