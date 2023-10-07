import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PinDetailScreen({ route, navigation }) {
  const { key } = route.params;
  const [imagePath, setImagePath] = useState(null);

  // You can fetch data for the pin based on the 'key' parameter


  useEffect(() => {
    // Fetch and set the imagePath from Firestore based on the route.params.key
    // You can use Firebase or Firestore to retrieve the image URL here.
    // For simplicity, I'm using a placeholder imagePath for demonstration purposes.
    const placeholderImagePath = 'https://example.com/placeholder.jpg';
    setImagePath(placeholderImagePath);
  }, [route.params.key]);

  
  // Der hvor man vælger et billede
  const launchImagePicker = async () => {
    try {
      const picture = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!picture.canceled) {
  
        setImagePath(picture.assets[0].uri);
      } else {
        alert('Image selection canceled or no image selected.');
      }
    } catch (error) {
      alert('Error picking an image:', error);
    }
  };



  // // Der hvor man vælger et billede
  // async function launchImagePicker(marker) {
  //   try {
  //     let picture = await ImagePicker.launchImageLibraryAsync({
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 1,
  //     });
  //     if (!picture.canceled) {
  //       setImagePath(picture.assets[0].uri);
  //     } else {
  //       alert('Image selection canceled or no image selected.');
  //     }
  //   } catch (error) {
  //     alert('Error picking an image:', error);
  //   }
  // }



  return (
    <View>
      <Text>Info about place</Text>
      <Image style={{ width: 200, height: 200 }} source={{ uri: imagePath }} />
      <Button title="Add picture" onPress={launchImagePicker} />
      <Button title="Delelte picture" onPress={launchImagePicker} />

    </View>
  );
}
