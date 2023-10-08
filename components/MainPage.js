import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
import { addDoc, doc, collection, GeoPoint, updateDoc } from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';


export default function MainPage() {
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
    };
  

    async function uploadImage() {

      try {
        if (!imagePath) {
          alert('Please select an image before uploading.');
          return;
        }
    
      const res = await fetch(imagePath);
      const blob = await res.blob();
      const uniqueImageID = Date.now().toString();
      const fileName = uniqueImageID + '.jpg';
      const storageRef = ref(storage, 'map_images/' + fileName); 
      console.log(storageRef);

      const uploadTask = uploadBytesResumable(storageRef, blob);
     
      // Upload the image to Firebase Storage
      // const snapshot = await uploadBytes(storageRef, blob).then((snapshot) => {
      //   alert("Image upload successful");
      // });
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);

    // For now, you can simply log the imageURL:
      console.log('Image URL:', imageURL);

      const documentId = selectedMarkerKey;
  
      // Reference the specific document you want to update
      const docRef = doc(database, 'markers', documentId);

  
      await updateDoc(docRef, {
        imageURL: downloadURL,
    });
  
      // You can also set the imagePath back to null to clear the selected image
      setImagePath(null);

      
  
    }catch (error) {
      console.error("Error uploading image:", error);
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


