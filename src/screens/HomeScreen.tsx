import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import firestore from '@react-native-firebase/firestore';

export const testFirestore = async () => {
  try {
    await firestore().collection('test').add({
      message: 'Firebase working 🚀',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Firestore write success');
  } catch (error) {
    console.log('❌ Firestore error:', error);
  }
};

const HomeScreen = () => {
  useEffect(() => {
    testFirestore();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen</Text>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
})