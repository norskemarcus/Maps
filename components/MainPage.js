import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
import { addDoc, forEach, onSnapshot, doc, collection, GeoPoint, updateDoc, documentId } from 'firebase/firestore';
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google'
import Config from 'react-native-config';
 import { useRoute } from '@react-navigation/native';

import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export default function MainPage({}) {
  const route = useRoute(); 
  const userId = route.params?.userId;

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMarkerImage, setSelectedMarkerImage] = useState(null); 
  const [selectedMarkerKey, setSelectedMarkerKey] = useState(null);
  const [currentMarker, setCurrentMarker] = useState({})
  const [key, setKey] = useState(null);
  const [imageID, setImageID] = useState(null);
  const [uploadImagePath, setUploadImagePath] = useState()


  useEffect(() => {
    // Query the Firestore collection for the current user
    const userCollectionPath = `${userId}`;
    const markersRef = collection(database, userCollectionPath);
  
    // Listen for updates to the markers
    const unsubscribe = onSnapshot(markersRef, (querySnapshot) => {
      const updatedMarkers = [];
      querySnapshot.forEach((doc) => {
        // Build marker objects from the documents in the collection
        const markerData = doc.data();
        const marker = {
          key: markerData.key,
          coordinate: {
            latitude: markerData.location.latitude,
            longitude: markerData.location.longitude,
          },
          title: markerData.title,
          // You may need to handle imageURL as well
        };
        updatedMarkers.push(marker);
      });
  
      // Update the markers state with the retrieved markers
      setMarkers(updatedMarkers);
    });
  
    return () => {
      // Unsubscribe from the Firestore listener when the component unmounts
      unsubscribe();
    };
  }, [userId]);





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
        setRegion(newRegion); 

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


  async function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp,
      title: "Great place",
      imagePath: null,
    };
    setMarkers([...markers, newMarker]);
    setCurrentMarker(newMarker); 

    await launchImagePicker();
  }


  async function addMarkerToDatabase(){

  
    const { latitude, longitude } = currentMarker.coordinate;
    const geoPoint = new GeoPoint(latitude, longitude);

    try{

         const userCollectionPath = `${userId}`;

        await addDoc(collection(database, userCollectionPath), {
          title: "Har jeg fået en ny collection nu?!",
          imageURL: null,
          key: currentMarker.key, 
          location: geoPoint,
       
      });

      console.log('currentMarker.key:', currentMarker.key)
  
    } catch (error){
      console.log(error)
    }
  }


    async function launchImagePicker  () {

      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setUploadImagePath(result.assets[0].uri)
          addMarkerToDatabase()
    
        } else {
          alert('Image selection canceled or no image selected.');
        }
      } catch (error) {
        alert('Error picking an image:', error);
      }
      
    };
  

    async function uploadImage() {
      try {
        if (!currentMarker || !currentMarker.key) {
       //   alert('Please add a marker before uploading an image.');
          return;
        }

        if (!uploadImagePath) {
          alert('Please select an image before uploading.');
          return;
        }
        
        const res = await fetch(uploadImagePath);
        const blob = await res.blob();
        const storageRef = ref(storage, `map_images/${userId}/${currentMarker.key}.jpg`);
        
        // Use uploadBytesResumable for large files
        const uploadTask = uploadBytesResumable(storageRef, blob);

      
        uploadTask.then((snapshot) => {
          alert("Image uploaded successfully");

        }).catch((error) => {
          console.error('Error uploading image:', error);
        });

    } catch (error) {
      console.error(error);
    }
  }
    


    // Daniel B sin kode:
    async function downloadImage(key){
      await getDownloadURL(ref(storage, `map_images/${key}.jpg`))
      .then((url) => {
        setImagePath(url)
      })
      .catch((err) => {
        alert(err)
      })
    }
   

  
    // function onMarkerPressed(key) {
    //   if (key) {
    //     setKey(key);
    //     launchImagePicker();
    //   } else {
    //     // Handle the case where key is not available
    //     console.error('Key is not available for the marker.');
    //   }
    // }


  // function logout(){

  //   if (accessToken){
  //     setAccessToken(null);
  //     alert("You are logged out")
  //   } else {
  //     alert("You are not logged in.")
  //   }
    
  // }


  return (
    <View style={styles.container}>
         <View>
      {/* <Button 
      title='Log out'
      onPress={() => logout}
      /> */}
       {/* <Button 
      title='Google login'
      onPress={() => promptAsync()}
      /> */}
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
              onPress={() => downloadImage(marker.key)}
            />
          ))}

          <Marker coordinate={region} title="I'm here" />
       
   
        </MapView>

        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: uploadImagePath }} />
     
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


