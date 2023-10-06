// Maps: https://www.npmjs.com/package/react-native-maps
// docs: https://docs.expo.dev/versions/latest/sdk/location/
// Storage: npm install @react-native-firebase/storage
// Firestore: npm install @react-native-firebase/firestore
// npm install firebase
// ImagePicker: npm install expo-image-picker

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, Modal, Image, Pressable} from 'react-native';
import MapView, {Marker, Callout, Circle} from 'react-native-maps'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'; 
import {app, db, storage} from './firebase/config.jsx';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'



export default function App() {
  const mapView = useRef(null); // ref for the MapView component, skaber ikke new rendering af skærmen
  const locationSubscription = useRef(null) // når vi lukker appen, skal den ikke lytte mere
  const [markers, setMarkers] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [pin, setPin] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });

   
useEffect(() => {
  async function getPermission(){
    let { status } = await Location.requestForegroundPermissionsAsync()
    
    if (status !== 'granted'){
    Alert.alert("Please grant location")
    return
    }

  locationSubscription.current = await Location.watchPositionAsync({   //await Location.getCurrentPositionAsync({})
    distanceInterval: 100,
    accuracy: Location.Accuracy.High // android; denne skal med for at den opdaterer korrekt
  },
   (location) => {
    if (location && location.coords) {
      const { latitude, longitude } = location.coords; // Destructure latitude and longitude here

      const newRegion = {
        latitude: latitude.latitude,
        longitude: longitude.longitude,
        latitudeDelta: 20,
        longitudeDelta: 20,
      }
      setRegion(newRegion) // flytter kortet til den nye location

       setPin({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }
  );
  
  //  // Set the initial region to your current location
  //   setRegion({
  //     latitude: location.coords.latitude,
  //     longitude: location.coords.longitude,
  //     latitudeDelta: 20, // Zoom level
  //     longitudeDelta: 20,
  //   });

    // Set the initial region to your current location
    if (locationSubscription.current) {
      const initialLocation = locationSubscription.current.getLastKnownPositionAsync();
      if (initialLocation) {
        const { latitude, longitude } = initialLocation.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 20,
          longitudeDelta: 20,
        });
      }
    }

    if (mapView.current) {
      mapView.current.animateToRegion({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }

    getPermission();

    return () => {
       if(locationSubscription.current){
        locationSubscription.current.remove()
       }
  }
}, [region]); // empty array: will only render ONCE pr. page render
  // no array: will render each time a component is rendered (aka all the time)
  // array with variable(s): will render each time a variable is updated


  async function addMarker(data){
    const {latitude, longitude} = data.nativeEvent.coordinate;
    const timestamp = new Date().getTime().toString();

    try {
      const image = await pickImage();
      if (!image) {
        return; // User canceled image selection
      }

      // Upload the image to Firebase Storage
      const imageUrl = await uploadImage(newMarker.image, timestamp);

      // Add the marker to Firebase Firestore
    await db.collection('Maps').doc(timestamp).set({
      location: new firebase.firestore.GeoPoint(latitude, longitude),
      image: imageUrl,
    });

    const newMarker = {
      coordinate: { latitude, longitude },
      key: timestamp,
      image: imageUrl,
      title: 'Great place',
    };

    setMarkers([...markers, newMarker]);


      // markers.push(
      // <Marker coordinate = {{latitude,longitude}}
      // key={data.timeStamp} // to ensure unique elements in collection
      // identifier={"" + data.timeStamp} // to we can see the identifier, after onPress event. (cast to String)
      
      
      // />
      // )
      // setRegion({ // hack to refresh the map
      // ...region, // since region is an object, the ... spread operator lets us update the named attributes, and leave the others as is
      // latitude: region.latitude
      // })

    } catch(error) {
      console.error('Error adding marker:', error);
    }
  }


  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        return result.uri;
      }
    } catch (error) {
      console.log('Error picking an image', error);
      setImagePath(result.assets[0].uri)
    }

    return null;
  }

 
  async function uploadImage() {

    try {
      const res = await fetch(imagePath)
      const blob = await res.blob()
      const uniqueImageID = Date.now().toString();
      const storageRef = ref(storage, uniqueImageID)
      const snapshot = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(snapshot.ref)
      setImagePath(downloadURL)
      return downloadURL
    
  } catch (err) {
      console.log("Fejl: " + err);
  }
  };
  
  
  function handleMarkerPress(marker) {
   setSelectedMarker(marker);
   setModalVisible(true);
  }
  

  function closeModal() {
    setModalVisible(false);
  }
  

  return (
    <View style={{ flex: 1 }}>
    <MapView
      style={{ flex: 1 }}
       ref={mapView} // Assign the ref to the MapView
      initialRegion={region}
      onLongPress = {addMarker} 
      provider='google'
    >
    {markers.map((marker) => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => handleMarkerPress(marker)}
          > 
          {/* Display marker's image */}
            {marker.image && (
              <Callout>
                 <Image
            source={{ uri: marker.image }}
            style={{ width: 100, height: 100 }}
          />
              </Callout>
            )}
          </Marker>
        ))}
        <Circle center={pin} radius={500} />
      </MapView>

  <Modal visible={modalVisible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {selectedMarker && selectedMarker.image && (
          <Image source={{ uri: selectedMarker.image }} style={{ width: 200, height: 200 }} />
        )}
        <Pressable onPress={closeModal}>
          <Text>Close</Text>
        </Pressable>
      </View>
    </Modal>
  </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});


// To the search field
// const autocompleteStyles = StyleSheet.create({
//   container: {
//     flex: 0,
//     position: "absolute",
//     width: "100%",
//     zIndex: 1, // Fixed the typo here (xIndex to zIndex)
//   },
//   listView: {
//     backgroundColor: "white",
//   },
// });