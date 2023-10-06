import { initializeApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7txWcuaoBoYcSpqTf4l3nKfiiV0C1BYs",
  authDomain: "notebook-32257.firebaseapp.com",
  projectId: "notebook-32257",
  storageBucket: "notebook-32257.appspot.com",
  messagingSenderId: "943342600146",
  appId: "1:943342600146:web:c7f3d4dcdea750e2f4920b",
  measurementId: "G-YD3HEKY8G3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app)

export {app, db, storage}
