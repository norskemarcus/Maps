// https://www.npmjs.com/package/react-native-maps
// docs: https://docs.expo.dev/versions/latest/sdk/location/
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, onPress, query } from 'react-native';
import MapView, {Marker, Callout, Circle} from 'react-native-maps'
//import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import * as Location from 'expo-location'

// key=API_KEY AIzaSyBkhhg94CvB3bV3ptmT5BphAPDQFYAgzuQ

export default function App() {

  const [pin, setPin] = useState({ latitude: 55.6936, 
    longitude: 12.5459, });

  return (
    <View style={{ marginTop: 50, flex: 1 }}>
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 55.6936, 
    longitude: 12.5459,
       
        latitudeDelta: 0.0922, // Zoom level
        longitudeDelta: 0.0421,
      }}
      provider='google'
    >
      <Marker
        coordinate={pin}
        pinColor="black"
        draggable={true}
        onDragStart={(e) => {
          console.log("Drag start", e.nativeEvent.coordinate) 
        }}
        onDragEnd={(e) => {
         setPin({
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude
         }) 
        }}
      >

          
        <Callout>
        <Text>I'm here</Text>
      </Callout>
      </Marker>
      <Circle center={pin} 
  radius={500}/>
    </MapView>
  </View>
  );
}

// latitude: 55.6936, // Meinungsgade 8, 2200 Nørrebro
// longitude: 12.5459,

//  latitude: 55.6761, // Copenhagen's latitude
//         longitude: 12.5683, // Copenhagen's longitude

{/* <GooglePlacesAutocomplete
placeholder='Search'
onPress={(data, details = null) => {
  // 'details' is provided when fetchDetails = true
  console.log(data, details);
}}
query={{
  key: 'AIzaSyBkhhg94CvB3bV3ptmT5BphAPDQFYAgzuQ',
  language: 'en',
}}
styles={autocompleteStyles} 
/> */}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});


const autocompleteStyles = StyleSheet.create({
  container: {
    flex: 0,
    position: "absolute",
    width: "100%",
    zIndex: 1, // Fixed the typo here (xIndex to zIndex)
  },
  listView: {
    backgroundColor: "white",
  },
});