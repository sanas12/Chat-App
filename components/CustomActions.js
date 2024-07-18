import { TouchableOpacity } from "react-native";
import { StyleSheet, View, Text, Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({
  wrapperStyle = {},
  iconTextStyle = {},
  onSend,
  storage,
  userID,
  username, // Add username here
}) => {
  const actionSheet = useActionSheet();

  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/").pop();
    return `${userID}-${timeStamp}-${imageName}`;
  };

  const uploadAndSendImage = async (imageURI) => {
    try {
      const uniqueRefString = generateReference(imageURI);
      const newUploadRef = ref(storage, uniqueRefString);
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const snapshot = await uploadBytes(newUploadRef, blob);
      const imageURL = await getDownloadURL(snapshot.ref);
      onSend([
        {
          _id: new Date().getTime(),
          image: imageURL,
          user: { _id: userID, name: username }, // Use username here
          createdAt: new Date(),
        },
      ]);
      console.log("Image sent successfully:", imageURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error uploading image", error.message);
    }
  };

  const pickImage = async () => {
    try {
      let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissions.granted) {
        let result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
          await uploadAndSendImage(result.assets[0].uri);
        } else {
          Alert.alert("You haven't selected any image.");
        }
      } else {
        Alert.alert("Permissions haven't been granted.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error picking image", error.message);
    }
  };

  const takePhoto = async () => {
    try {
      let permissions = await ImagePicker.requestCameraPermissionsAsync();
      if (permissions.granted) {
        let result = await ImagePicker.launchCameraAsync();
        if (!result.canceled) {
          await uploadAndSendImage(result.assets[0].uri);
        } else {
          Alert.alert("You haven't taken any photo.");
        }
      } else {
        Alert.alert("Permissions haven't been granted.");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error taking photo", error.message);
    }
  };

  const getLocation = async () => {
    try {
      const permissions = await Location.requestForegroundPermissionsAsync();
      if (permissions.granted) {
        const location = await Location.getCurrentPositionAsync({});
        if (location) {
          onSend([
            {
              _id: new Date().getTime(),
              location: {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
              },
              user: { _id: userID, name: username }, // Use username here
              createdAt: new Date(),
            },
          ]);
          console.log("Location sent successfully:", location);
        } else {
          Alert.alert("Error occurred while fetching location");
        }
      } else {
        Alert.alert("Permissions haven't been granted.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error getting location", error.message);
    }
  };

  const onActionPress = () => {
    const options = [
      "Select an image from library",
      "Take a photo",
      "Share location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return pickImage();
          case 1:
            return takePhoto();
          case 2:
            return getLocation();
          default:
        }
      }
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;
