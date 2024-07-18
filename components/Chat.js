import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

export const Chat = ({ route, navigation }) => {
  const { db, storage, isConnected } = route.params;
  const { username, bgColor, userID } = route.params;
  const [messages, setMessages] = useState([]);
  const collectionName = "messages";

  useEffect(() => {
    navigation.setOptions({ title: username });

    let unsubChat = null;
    if (isConnected) {
      const qCollect = query(
        collection(db, collectionName),
        orderBy("createdTime", "desc")
      );
      unsubChat = onSnapshot(qCollect, (chatData) => {
        let newList = [];
        chatData.forEach((mesg) => {
          let newItem = {
            ...mesg.data(),
            _id: mesg.id,
            createdAt: new Date(mesg.data().createdTime.seconds * 1000),
            user: mesg.data().user ?? { _id: "unknown", name: "Unknown" },
          };
          newList.push(newItem);
        });
        setMessages(newList);
        setCachedList(newList);
      });
    } else {
      Alert.alert("Connection Lost!!");
      loadCachedList().then((cachedList) => {
        setMessages(cachedList);
      });
    }

    return () => {
      if (unsubChat) unsubChat();
    };
  }, [isConnected]);

  const setCachedList = async (mesgList) => {
    try {
      await AsyncStorage.setItem("mesgList", JSON.stringify(mesgList));
    } catch (err) {
      Alert.alert("Unable to cache messages");
    }
  };

  const loadCachedList = async () => {
    try {
      let cachedList = await AsyncStorage.getItem("mesgList");
      return cachedList != null ? JSON.parse(cachedList) : [];
    } catch (err) {
      Alert.alert("Unable to load cached messages");
      return [];
    }
  };

  const onSend = async (newMessages = []) => {
    try {
      const message = newMessages[0];
      const newItem = {
        ...message,
        createdTime: new Date(),
        user: {
          _id: userID,
          name: username ?? "Unknown User",
        },
      };
      await addDoc(collection(db, collectionName), newItem);
    } catch (error) {
      Alert.alert("Error sending message", error.message);
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#000" },
        left: { backgroundColor: "#FFF" },
      }}
      textStyle={{
        right: { color: "green" },
        left: { color: "red" },
      }}
    />
  );

  const renderInputToolbar = (props) =>
    isConnected ? <InputToolbar {...props} /> : null;

  const renderCustomActions = (props) => (
    <CustomActions
      storage={storage}
      userID={userID}
      username={username}
      onSend={onSend}
    />
  );

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  const renderMessageImage = (props) => {
    return (
      <MessageImage
        {...props}
        imageStyle={{ width: 200, height: 200, borderRadius: 13, margin: 3 }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        user={{ _id: userID, name: username }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
