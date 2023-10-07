import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, db, storage } from './firebase/config';
import { addDoc, collection, GeoPoint } from '@firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PinDetailScreen from './components/PinDetailScreen.js';

export default function MainPage({ route, navigation }) {
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
  const [showMap, setShowMap] = useState(true);

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

    // Create a GeoPoint
    const geoPoint = new GeoPoint(latitude, longitude);

    // Store data in Firestore
    await addDoc(collection(db, "markers"), {
      imageURL: null,
      key: data.timeStamp,
      location: geoPoint,
      title: newMarker.title
    });
  }

  async function uploadImage() {
    const res = await fetch(imagePath);
    const blob = await res.blob();
    const uniqueImageID = Date.now().toString();
    const storageRef = ref(storage, 'maps_images/' + uniqueImageID);
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert("Image upload");
    });
  }

  const viewPinDetails = (marker) => {
    navigation.navigate('PinDetail', { key: marker.key });
  };

  return (
    <View style={styles.container}>
      {showMap ? (
        <MapView
          style={styles.map}
          region={region}
          onLongPress={addMarker}
          provider='google'
        >
          {markers.map((marker) => (
            <Marker
              coordinate={marker.coordinate}
              key={marker.key}
              title={marker.title}
              onPress={() => viewPinDetails(marker)}
            />
          ))}
  
          <Marker coordinate={region} title="I'm here" />
        </MapView>
      ) : (
        <Image style={styles.image} source={{ uri: imagePath }}></Image>
      )}
      <Button title="Upload" onPress={uploadImage} />
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
  image: {
    flex: 0.5,
  },
});
