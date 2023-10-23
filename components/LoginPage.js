import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Image, Button, Alert, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
import { addDoc, doc, collection, GeoPoint, updateDoc, documentId } from 'firebase/firestore';
import axios from 'axios';



export default function LoginPage({ navigation }) {

  const API_KEY = "AIzaSyA7txWcuaoBoYcSpqTf4l3nKfiiV0C1BYs";
  const SIGN_IN_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="
  const [enteredEmail, setEnteredEmail] = useState("ola.nordmand@norge.no")
  const [enteredPassword, setEnteredPassword] = useState("test1234")
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);


  
  async function login() {
 
    try {
      const response = await axios.post(SIGN_IN_URL + API_KEY, {
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true
      });
    
      if (response.status === 200 && response.data) {
       
        console.log("Logget ind som: \n\n" + enteredEmail);
        console.log('localId = User UID authentication firebase:', response.data.localId);
        setAccessToken(response.data.idToken);
        setUserId(response.data.localId);
        navigation.navigate('MainPage', { userId: response.data.localId });

      } else {
        alert("Error logging in:", error.response.data.error.errors[0].message);
    
      }
    } catch (error) {
      alert("Error logging in:", error.response.data.error.errors[0].message);
   
    }
  }

 // token = response.data.idToken


  function logout(){

    if (accessToken){
      setAccessToken(null);
      alert("You are logged out")
    } else {
      alert("You are not logged in.")
    }
    
  }


  async function getUserData() {

   let userInfoResponse = 
   await fetch("https://www.googleapis.com/userinfo/v2/me", {

   headers: { Authorization: `Bearer ${accessToken}`}
   })
  }


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
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
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
  logoutButton: {
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

