import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Button, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { app, database, storage } from '../firebase/config.jsx';
import { addDoc, onSnapshot, doc, collection, GeoPoint } from 'firebase/firestore';
// import * as Google from 'expo-auth-session/providers/google'
// import Config from 'react-native-config';
import { useRoute } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { auth } from './LoginPage.js'


export default function MainPage({ navigation }) {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [currentMarker, setCurrentMarker] = useState({})
  const [uploadImagePath, setUploadImagePath] = useState()
  const [isUploading, setIsUploading] = useState(false); 
  const [selectedMarker, setSelectedMarker] = useState(null);

  const route = useRoute(); 
  const { userId } = route.params?.userId;
  //const { userId, auth } = route.params;

  const mapView = useRef(null);
  const locationSubscription = useRef(null);
  const [imagePath, setImagePath] = useState(null);
  
  

  useEffect(() => {
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
  

    if (data.timeStamp) {
      await saveMarkerToDatabase(newMarker);
      setMarkers([...markers, newMarker]);
      setCurrentMarker(newMarker);
  
  
      await launchImagePicker();
    } else {
      alert('Timestamp is missing, marker not added.');
    }
  }

  async function saveMarkerToDatabase(marker) {
    const { latitude, longitude } = marker.coordinate;
    const geoPoint = new GeoPoint(latitude, longitude);
  
    try {
      const userCollectionPath = `${userId}`; // markers
      await addDoc(collection(database, userCollectionPath), {
        title: "TEST 23.10.23",
        imageURL: null,
        key: currentMarker.key,
        location: geoPoint,
      });
  
      console.log('currentMarker.key:', currentMarker.key)
    } catch (error) {
      console.log(error);
    }
  }
  



    async function launchImagePicker () {

      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setUploadImagePath(result.assets[0].uri)

        } else {
          alert('Image selection canceled or no image selected.');
        }
      } catch (error) {
        alert('Error picking an image:', error);
      }
      
    };
  

    async function uploadImage() {
      try {
     
        setIsUploading(true);
        const res = await fetch(uploadImagePath);
        const blob = await res.blob();
        const storageRef = ref(storage, `map_images/${userId}/${currentMarker.key}.jpg`);
        
        // Use uploadBytesResumable for large files
        const uploadTask = uploadBytesResumable(storageRef, blob);

      
        uploadTask.then((snapshot) => {
          setIsUploading(false);
          alert("Image uploaded successfully");

        }).catch((error) => {
          setIsUploading(false);
          alert('Error uploading image:', error);
        });

    } catch (error) {
      setIsUploading(false);
      console.error(error);
    }
  }
    

  async function downloadImage(key) {
    await getDownloadURL(ref(storage, `map_images/${userId}/${key}.jpg`)) // currentMarker.key?
      .then((url) => {
        const updatedMarkers = [...markers];
        const markerIndex = updatedMarkers.findIndex((marker) => marker.key === key);
  
        if (markerIndex !== -1) {
          updatedMarkers[markerIndex].imagePath = url;
          setMarkers(updatedMarkers);
        }
      })
      .catch((err) => {
        alert(err);
      });
  }
  

    async function logout(){
      await signOut(auth)
      navigation.navigate('LoginPage');
    }


  return (
    <View style={styles.container}>
         <View>

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
              onPress={() => {
                setSelectedMarker(marker);
                if (!marker.imagePath) {
                  downloadImage(marker.key);
                }
              }}
            />
          ))}
            <Marker coordinate={region} title="I'm here" />
        </MapView>
    
    
        <View style={styles.imageContainer}>
        {selectedMarker && (
          <Image style={styles.image} source={{ uri: selectedMarker.imagePath }} />
        )}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Uploading...</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          {selectedMarker && (
            <Button title="Upload" onPress={uploadImage} />
          )}
          <Button title="Sign out" onPress={logout} />

         {/* {
         uploadImagePath && currentMarker && currentMarker.key && 
         (<Image style={styles.image} source={{ uri: uploadImagePath }} />)
          }
          {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Uploading...</Text>
          </View>
        )}
     
          <View style={styles.buttonContainer}>
            { uploadImagePath &&
              <>
                <Button title="Upload" onPress={uploadImage} />
              </>
            }
        
          <Button title="Sign out" onPress={logout} /> */}
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
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  uploadingOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add a semi-transparent white background
  }  
});


