//  // import { NavigationContainer } from '@react-navigation/native';
// // import { createNativeStackNavigator } from '@react-navigation/native-stack';

// // environmental variables in React Native using react-native-config:
// // npm install react-native-config --save

 
 
//  // const [accessToken, setAccessToken] = useState(null)


//   // const[request, response, promptAsync] = Google.useAuthRequest({
//   //   iosClientId: iosGoogleClientID,
//   //   androidClientId: androidGoogleClientID,
//   // });

//   // useEffect(() => {
//   //   if(response?.type=== "success"){
//   //     setAccessToken(response.authentication.accessToken)
//   //    // console.log("Tilbage fra Google", response.authentication.accessToken)
//   //   }
//   // }, [response])


  
//   async function addMarker2(data) {
//     const { latitude, longitude } = data.nativeEvent.coordinate;
//     const newMarker = {
//       coordinate: { latitude, longitude },
//       key: data.timeStamp,
//       title: "Great place",
//       imagePath: null,
//     };
//     setMarkers([...markers, newMarker]);
//     setCurrentMarker(newMarker); 

//     await launchImagePicker();
//   }


//   async function addMarkerToDatabase2(){

//     const { latitude, longitude } = currentMarker.coordinate;
//     const geoPoint = new GeoPoint(latitude, longitude);

//     try{

//          const userCollectionPath = `${userId}`;

//         await addDoc(collection(database, userCollectionPath), {
//           title: "Har jeg fået en ny collection nu?!",
//           imageURL: null,
//           key: currentMarker.key, 
//           location: geoPoint,
       
//       });

//       console.log('currentMarker.key:', currentMarker.key)
  
//     } catch (error){
//       console.log(error)
//     }
//   }


     {/* <Button 
      title='Log out'
      onPress={() => logout}
      /> */}
       {/* <Button 
      title='Google login'
      onPress={() => promptAsync()}
      /> */}