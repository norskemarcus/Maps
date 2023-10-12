import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
import { addDoc, doc, collection, GeoPoint, updateDoc, documentId } from 'firebase/firestore';
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google'

import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// environmental variables in React Native using react-native-config:
// npm install react-native-config --save

export default function MainPage() {

  const iosGoogleClientID = Config.IOS_GOOGLE_CLIENT_ID;
  const androidGoogleClientID = Config.ANDROID_GOOGLE_CLIENT_ID;


  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const mapView = useRef(null);
  const locationSubscription = useRef(null);
  const [imagePath, setImagePath] = useState(null);
 // const [showMap, setShowMap] = useState(true);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState(null);
  const [key, setKey] = useState(null);

  const API_KEY = Config.API_KEY;
  const SIGN_IN_URL = Config.SIGN_IN_URL
  const [accessToken, setAccessToken] = useState(null)

  
  const[request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidGoogleClientID
  });

  useEffect(() => {
    if(response?.type=== "success"){
      setAccessToken(response.authentication.accessToken)
     // console.log("Tilbage fra Google", response.authentication.accessToken)
    }
  }, [response])



  useEffect(() => {
    async function startListening() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert("Ingen adgang til lokation");
        return;
      }
      locationSubscription.current = await Location.watchPositionAsync({
        distanceInterval: 100,
        accuracy: Location.Accuracy.High,
      }, (lokation) => {

        const newRegion = {
          latitude: lokation.coords.latitude,
          longitude: lokation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion); // flytter kortet til ny lokation

        if (mapView.current) {
          mapView.current.animateToRegion(newRegion);
        }
      });
    }
    startListening();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);




  async function login() {
 
    try {
      const response = await axios.post(url + API_KEY, {
        email: "test@norge.no",
        password: "test1234",
        returnSecureToken: true
      });
    
      if (response.status === 200 && response.data) {
       
        alert("Logget ind");
      } else {
        alert("Log-in failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Log-in failed. Please check your network connection.");
    }
  }
 

  async function getUserData() {

   let userInfoResponse = 
   await fetch("https://www.googleapis.com/userinfo/v2/me", {

   headers: { Authorization: `Bearer ${accessToken}`}
   })
  }


  async function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp,
      title: "Great place",
      imagePath: null,
    };
    setMarkers([...markers, newMarker]);

    // Create a GeoPoint
    const geoPoint = new GeoPoint(latitude, longitude);

    console.log(geoPoint);


    await addDoc(collection(database, "markers"), {
        title: "TEST 3",
        imageURL: null,
        key: newMarker.key,
        location: geoPoint,
    });

    // Store the selected marker's key, to use in the update
    setSelectedMarkerKey(newMarker.key);
    

  }

    // Der hvor man vælger et billede
    async function launchImagePicker  () {

      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setImagePath(result.assets[0].uri);
    
        } else {
          alert('Image selection canceled or no image selected.');
        }
      } catch (error) {
        alert('Error picking an image:', error);
      }
      console.log("ImagePath inside launchImagePicker", imagePath);
    };
  

    async function uploadImage() {
      try {
        if (!imagePath) {
          alert('Please select an image before uploading.');
          return;
        }
    
        // Fetch the image from the selected path
        const res = await fetch(imagePath);
        const blob = await res.blob();
        const uniqueImageID = Date.now().toString();
        const fileName = `${uniqueImageID}.jpg`;
        const storageRef = ref(storage, `map_images/${fileName}`);
    
        // Upload the image to Firebase Storage
        const uploadTask = uploadBytes(storageRef, blob);
    
        uploadTask.then(async (snapshot) => {
          // Get the download URL of the uploaded image
          const downloadURL = await getDownloadURL(storageRef);
    
          // Update the document's data with the image URL
          const documentId = selectedMarkerKey; // key from newMarker
          const docRef = doc(database, 'markers', documentId);
    
          const documentData = {
            imageURL: downloadURL,
          };
    
          // Reference the specific document you want to update
          await updateDoc(docRef, documentData);
    
          // Reset the imagePath to clear the selected image
          setImagePath(null);
    
          console.log('Image uploaded successfully and URL updated.');
        });
    
        uploadTask.catch((error) => {
          console.error('Error uploading image:', error);
          // Handle the error as needed
        });
      } catch (error) {
        console.error(error);
        // Handle the error as needed
      }
    }
    

  
    function onMarkerPressed(key) {
      setKey(key);
      launchImagePicker();
    }
  // const viewPinDetails = (marker) => {
  //   navigation.navigate('PinDetail', { key: marker.key });
  // };

  return (
    <View style={styles.container}>
         <View>
   {/*    <Button 
      title='Log in'
      onPress={login}
      /> */}
       <Button 
      title='Google login'
      onPress={() => promptAsync()}
      />
    </View>
        <MapView
          style={styles.map}
          region={region}
          onLongPress={addMarker}
          provider='google'
        >
          
          {markers.map((marker) => ( // tager en marker af gangen
            <Marker // returnerer en ny Marker
              coordinate={marker.coordinate}
              key={marker.key}
              title={marker.title}
              onPress={() => onMarkerPressed(marker.key)}
            />
          ))}

          <Marker coordinate={region} title="I'm here" />
       
   
        </MapView>

        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: imagePath }} />
          <View style={styles.buttonContainer}>
          <Button title="Upload" onPress={uploadImage} />
      </View>
      </View>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Set the container to relative positioning
  },
  image: {
    width: 400,
    height: 400,
  },
  button: {
    position: 'absolute', 
    bottom: 10, 
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});


