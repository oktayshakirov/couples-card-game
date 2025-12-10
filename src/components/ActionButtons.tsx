import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSkip: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSkip,
}) => {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.leftButton]}
        onPress={onSwipeLeft}
      >
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.skipButton]}
        onPress={onSkip}
      >
        <Text style={styles.buttonText}>✗</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rightButton]}
        onPress={onSwipeRight}
      >
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftButton: {
    backgroundColor: "#4A90E2",
  },
  skipButton: {
    backgroundColor: "#666",
  },
  rightButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "700",
  },
});
