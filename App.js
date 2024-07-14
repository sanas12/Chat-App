import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { Alert } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWABV-3-drsK-c1vDXejvG4fw4pVziDd8",
  authDomain: "chattingapp-23633.firebaseapp.com",
  projectId: "chattingapp-23633",
  storageBucket: "chattingapp-23633.appspot.com",
  messagingSenderId: "786361937573",
  appId: "1:786361937573:web:2074b86e9f05f5f45c274c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Create the navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected === false) {
      Alert.alert("Connection Lost!");

      disableNetwork(db);
    } else if (netInfo.isConnected === true) {
      enableNetwork(db);
    }
  }, [netInfo.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen
          name="Chat"
          component={Chat}
          initialParams={{ db: db, isConnected: netInfo.isConnected }}
          options={({ route }) => ({ title: route.params.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
