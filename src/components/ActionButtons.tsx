import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSkip: () => void;
  canSkip: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSkip,
  canSkip,
}) => {
  const handleSkip = () => {
    if (canSkip) {
      onSkip();
    }
  };

  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.leftButton]}
        onPress={onSwipeLeft}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: COLORS.accent.blue }]}>
          ←
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.skipButton,
          !canSkip && styles.disabledButton,
        ]}
        onPress={handleSkip}
        disabled={!canSkip}
        activeOpacity={canSkip ? 0.7 : 1}
      >
        <Text
          style={[styles.buttonText, !canSkip && styles.disabledButtonText]}
        >
          ✗
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rightButton]}
        onPress={onSwipeRight}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: COLORS.accent.red }]}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: isSmallScreen ? 20 : isTablet ? 40 : 30,
  },
  button: {
    width: isSmallScreen ? 50 : isTablet ? 72 : 60,
    height: isSmallScreen ? 50 : isTablet ? 72 : 60,
    borderRadius: isSmallScreen ? 25 : isTablet ? 36 : 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  leftButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.accent.blue,
  },
  skipButton: {
    backgroundColor: COLORS.background,
    borderColor: "#666",
  },
  rightButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.accent.red,
  },
  buttonText: {
    fontSize: isSmallScreen ? 24 : isTablet ? 32 : 28,
    color: "#FFF",
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: COLORS.background,
    borderColor: "#333",
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#666",
  },
});
