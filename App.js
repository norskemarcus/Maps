// Maps: https://www.npmjs.com/package/react-native-maps
// docs: https://docs.expo.dev/versions/latest/sdk/location/
// Storage: npm install @react-native-firebase/storage
// Firestore: npm install @react-native-firebase/firestore
// npm install firebase


import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image} from 'react-native';
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location' // To use Location: expo install expo-location
import * as ImagePicker from 'expo-image-picker'; // ImagePicker: npm install expo-image-picker
import {app, db, storage} from './firebase/config';
import { ref, uploadString, getDownloadURL } from '@react-native-firebase/storage';



export default function App() {
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
      latitude: 55,
      longitude: 12,
      latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    });

  const mapView = useRef(null) // ref. til map view objektet
  const locationSubscription = useRef(null) // når vi lukker appen, skal den ikke lytte mere
  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState(null);



    useEffect(() => {
      async function startListening () {
      
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert("Ingen adgang til lokation")
          return;
        }
        locationSubscription.current = await Location.watchPositionAsync({
          distanceInterval: 100,
          accuracy: Location.Accuracy.High
        }, (lokation) => {
          const newRegion = {
            latitude: lokation.coords.latitude,
            longitude: lokation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
          setRegion(newRegion) // flytter kortet til den nye lokation
          if(mapView.current){
            mapView.current.animateToRegion(newRegion)
          }
        })
       }
       startListening()
       return () => {
        if(locationSubscription.current){
          locationSubscription.current.remove()
        }
       }
      }, []) // useEffect skal kun køres en enkelt


  
    

    function addMarker(data){
      const {latitude, longitude} = data.nativeEvent.coordinate
      const newMarker = {
        coordinate: {latitude, longitude},
        key: data.timeStamp,
        title: "Great place"
      }
      setMarkers([...markers, newMarker]) // spread operator, markers er de vi har i forvejen + newMarker
    }



    async function launchImagePicker(marker) {
      
      try {
      
      let picture =  await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if(!picture.canceled){
        setImagePath(picture.assets[0].uri)
      } else {
        alert('Image selection canceled or no image selected.');
      }
      } catch (error){
        alert('Error picking an image:', error);
      }
    
    } 




  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map}
      region={region}
      onLongPress={addMarker}
      provider='google'
      >
        {markers.map(marker => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => launchImagePicker(marker)}
            />
        ))}
   
       <Marker coordinate={region} title="I'm here" /> 

      </MapView>
    
       <Image style={styles.image} source={{uri:imagePath}}></Image>  
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
    flex: 0.5
  }
});

