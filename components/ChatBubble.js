import { View, Text, StyleSheet } from "react-native";

export default function ChatBubble({ message, isUser }) {
  return (
    <View style={isUser ? styles.user : styles.bot}>
      <Text style={{ color: isUser ? "#fff" : "#000" }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  user: {
    alignSelf: "flex-end",
    backgroundColor: "black",
    padding: 10,
    margin: 6,
    borderRadius: 10,
    maxWidth: "80%",
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 10,
    margin: 6,
    borderRadius: 10,
    maxWidth: "80%",
  },
});
