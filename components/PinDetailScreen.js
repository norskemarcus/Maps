import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { app, database, storage } from '../firebase/config.jsx';
import { doc, getDoc, updateDoc } from 'firebase/firestore';





export default function PinDetailScreen({ route }) {
 
  const [imagePath, setImagePath] = useState(null);



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

  async function uploadImage() {

    try {

    const res = await fetch(imagePath);
    const blob = await res.blob();
    const uniqueImageID = Date.now().toString();
    
    const storageRef = ref(storage, 'maps_images/' + uniqueImageID);

    // Upload the image to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);

    // Get the download URL of the uploaded image
    const imageURL = await getDownloadURL(snapshot.ref);

    // Get the document ID (key) from route.params
    const documentId = route.params.key;

    // Reference the specific document you want to update
    const docRef = doc(database, 'markers', documentId);

    await updateDoc(docRef, {
      imageURL: imageURL,
  });

    alert("Image upload successful");

  }catch (error) {
    console.error("Error uploading image:", error);
  }  
  }

  // Delete picture
    //   const docRef = doc(databse, 'markers', key);
     // await deleteDoc(docRef);




  return (
    <View>
      <Text>Info about place</Text>
      <Image style={{ width: 400, height: 400 }} source={{ uri: imagePath }} />
      <Button title="Add picture" onPress={launchImagePicker} />
      <Button title="Upload" onPress={uploadImage} />
      <Button title="Delete picture" onPress={launchImagePicker} />

    </View>
  );
}
