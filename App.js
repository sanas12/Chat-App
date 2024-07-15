import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { LogBox } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Chat } from "./components/Chat";
import Start from "./components/Start";
import { useEffect } from "react";

LogBox.ignoreAllLogs();

const firebaseConfig = {
  apiKey: "AIzaSyDWABV-3-drsK-c1vDXejvG4fw4pVziDd8",
  authDomain: "chattingapp-23633.firebaseapp.com",
  projectId: "chattingapp-23633",
  storageBucket: "chattingapp-23633.appspot.com",
  messagingSenderId: "786361937573",
  appId: "1:786361937573:web:2074b86e9f05f5f45c274c",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);
const Stack = createNativeStackNavigator();

const App = () => {
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected) {
      enableNetwork(db);
    } else {
      disableNetwork(db);
    }
  }, [netInfo.isConnected]);

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen
            name="Chat"
            component={Chat}
            initialParams={{
              db: db,
              storage: storage,
              isConnected: netInfo.isConnected,
            }}
            options={({ route }) => ({ title: route.params.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
};

export default App;
