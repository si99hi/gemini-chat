import { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import ChatBubble from "./components/ChatBubble";
import { askGemini } from "./utils/gemini";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, user: true };
    setMessages(prev => [...prev, userMsg]);

    const reply = await askGemini(input);
    const botMsg = { text: reply, user: false };

    setMessages(prev => [...prev, botMsg]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Gemini Chatbot</Text>
      <ScrollView style={styles.scrollView}>
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m.text} isUser={m.user} />
        ))}
      </ScrollView>

      <TextInput
        placeholder="Ask anything..."
        value={input}
        onChangeText={setInput}
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Send" onPress={sendMessage} color="#061122" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: "#e9dfdf",
  },
  scrollView: {
    flex: 1,
    marginVertical: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: "#03132d",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 5,
    backgroundColor: "#ffffff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonWrapper: {
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#03132d",
  },
});
