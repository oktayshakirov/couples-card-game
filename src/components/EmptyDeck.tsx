import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const EmptyDeck: React.FC = () => {
  return (
    <View style={styles.container}>
      {/*Todo: Add Buttons (Start New Game / Select New Card Deck)*/}
      <Text style={styles.title}>All cards completed! 🎉</Text>
      <Text style={styles.subtitle}>You've finished the deck together!</Text>
      {/*Todo: Show finals stats for both players*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
