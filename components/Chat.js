import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView } from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";

// Chat component
const Chat = ({ route, navigation }) => {
  // Destructuring parameters passed from the Start screen
  const { name, bgColor } = route.params;

  // State to manage messages
  const [messages, setMessages] = useState([]);

  // Function to handle sending messages
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  // Function to render custom message bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000", // Sender's message bubble color
          },
          left: {
            backgroundColor: "#FFF", // Receiver's message bubble color
          },
        }}
      />
    );
  };

  // useEffect to set initial messages and update navigation options
  useEffect(() => {
    // Set the title of the navigation bar to the user's name
    navigation.setOptions({ title: name });

    // Set initial messages in the chat
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 2,
        text: "You have entered the new chat room",
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  return (
    // Main container with background color
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <GiftedChat
        messages={messages} // Messages state
        renderBubble={renderBubble} // Custom message bubble
        onSend={(messages) => onSend(messages)} // onSend handler
        user={{
          _id: 1, // Current user ID
        }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

// Styles for the Chat component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
