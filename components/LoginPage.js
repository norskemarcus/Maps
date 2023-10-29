import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Image, Button, Alert, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
//import { addDoc, doc, collection, GeoPoint, updateDoc, documentId } from 'firebase/firestore';

import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';


import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// web
// device eller emulator

let auth;

if(Platform.OS === 'web'){
  auth = getAuth(app)
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  })
}


// Initialize Firebase Auth with ReactNativeAsyncStorage
//  auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });
// npm install @react-native-async-storage/async-storage



export default function LoginPage({ navigation }) {
  
  const [enteredEmail, setEnteredEmail] = useState("ola.nordmand@norge.no")
  const [enteredPassword, setEnteredPassword] = useState("test1234")
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    const auth_ = getAuth()
    const unsubscribe = onAuthStateChanged(auth_, (currentUser) => {
      if(currentUser){
        setUserId(currentUser.uid)
      } else {
        setUserId(null);
      }
    })
    return () => unsubscribe() // kaldes når componenten unmountes
  }, [])

  
  async function login() {

    try {
        const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);
        const user = userCredential.user; // Access the user object
        const localId = user.uid; // Get the localId (UID) of the authenticated
        console.log("Logged in as:", enteredEmail);
        console.log('LocalId (UID) of the authenticated user:', localId);
        setAccessToken(userCredential.user.idToken);
        setUserId(localId);
        navigation.navigate('MainPage', { userId: localId});

     
      } catch (error) {
      alert("Error logging in:", error.userCredential.data.error.errors[0].message);
   
    }
 
  }



  async function signUp(){

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, enteredEmail, enteredPassword)
      console.log("Oprettet ny bruger", userCredential.user.uid)

      const user = userCredential.user; 
      const localId = user.uid; 

      navigation.navigate('MainPage', { userId: localId, auth });

    } catch (error){
      console.log(error)
    }

  
  }


  // async function getUserData() {

  //  let userInfoResponse = 
  //  await fetch("https://www.googleapis.com/userinfo/v2/me", {

  //  headers: { Authorization: `Bearer ${accessToken}`}
  //  })
  // }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.inputField}
        onChangeText={(newText) => setEnteredEmail(newText)}
        value={enteredEmail}
        placeholder="Email"
      />
      <TextInput
        style={styles.inputField}
        onChangeText={(newText) => setEnteredPassword(newText)}
        value={enteredPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Pressable style={styles.loginButton} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable style={styles.signupButton} onPress={signUp}>
        <Text style={styles.buttonText}>Sign up</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputField: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#00b33c',
    width: '100%',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: '#ffad33',
    width: '100%',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export { auth }