import { initializeApp } from 'firebase/app'; // npm install firebase
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7txWcuaoBoYcSpqTf4l3nKfiiV0C1BYs",
  authDomain: "notebook-32257.firebaseapp.com",
  projectId: "notebook-32257",
  storageBucket: "notebook-32257.appspot.com",
  messagingSenderId: "943342600146",
  appId: "1:943342600146:web:76028beced4c9b74f4920b",
  measurementId: "G-CNLQHQ94PR"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore, db
const database = getFirestore(app);

// Initialize Storage
const storage = getStorage(app)

export {app, database, storage};
