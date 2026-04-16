import firestore from '@react-native-firebase/firestore';

// Native Firebase auto-initializes using google-services.json

let emulatorConnected = false;

export const configureFirebase = async () => {
  const db = firestore();

  if (__DEV__ && !emulatorConnected) {
    // optional
    // db.useEmulator('localhost', 8080);
    emulatorConnected = true;
  }

  await db.settings({
    ignoreUndefinedProperties: true,
  });

  return db;
};

export const getFirestore = () => firestore();

export const FieldValue = firestore.FieldValue;
export const Timestamp = firestore.Timestamp;