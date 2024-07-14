import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

const Chat = ({ route, navigation }) => {
  const { name, bgColor, userID, db, isConnected } = route.params;

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: name });

    let unsubChat = null;

    const loadMessages = async () => {
      const cachedMessages = await loadCachedList();
      setMessages(cachedMessages);
    };

    if (isConnected) {
      const qCollect = query(
        collection(db, "messages"), // Ensure the correct collection name is used here
        orderBy("createdTime", "desc")
      );
      unsubChat = onSnapshot(qCollect, (chatData) => {
        let newList = [];
        chatData.forEach((mesg) => {
          let newItem = {
            ...mesg.data(),
            createdAt: new Date(mesg.data().createdTime.seconds * 1000),
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

  const onSend = async (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    let newItem = {
      ...newMessages[0],
      createdTime: new Date(),
    };
    await addDoc(collection(db, "messages"), newItem); // Ensure the correct collection name is used here
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: name,
        }}
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
