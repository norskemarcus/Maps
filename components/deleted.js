
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
            onPress={() => launchImagePicker()}
          />
        ))}


        <Marker coordinate={region} title="I'm here" />
      </MapView>
    ) : (
      <View style={styles.imageContainer}>
      {imagePath ? (
        <Image style={styles.image} source={{ uri: imagePath }} />
      ) : (
        <Text>No image selected</Text>
      )}
      <Button title="Upload" onPress={uploadImage} />
      <Button title="Back to Map" onPress={() => setShowMap(true)} />
    </View>
  )}
</View>
);