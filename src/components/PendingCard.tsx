import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface PendingCardProps {
  player1Name: string;
  player2Name: string;
  currentPlayerColor: string;
  nextPlayerName: string;
}

export const PendingCard: React.FC<PendingCardProps> = ({
  player1Name,
  player2Name,
  currentPlayerColor,
  nextPlayerName,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, styles.blurredCard]}>
        <View style={styles.cardGradient}>
          <View style={styles.content}>
            <View
              style={[
                styles.iconContainer,
                {
                  borderColor: currentPlayerColor,
                  backgroundColor: hexToRgba(currentPlayerColor, 0.15),
                },
              ]}
            >
              <Text style={styles.icon}>⏳</Text>
            </View>
            <Text style={[styles.title, { color: currentPlayerColor }]}>
              Waiting for confirmation
            </Text>
            <Text style={styles.message}>
              The next card will appear once {nextPlayerName} confirms.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: isSmallScreen
      ? width * 0.92
      : isTablet
      ? width * 0.75
      : width * 0.88,
    height: isSmallScreen
      ? height * 0.48
      : isTablet
      ? height * 0.52
      : height * 0.55,
    borderRadius: isSmallScreen ? 24 : isTablet ? 36 : 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#1a0a0f",
    borderRadius: isSmallScreen ? 24 : isTablet ? 36 : 32,
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.3),
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    backgroundColor: "#1a0a0f",
    borderRadius: isSmallScreen ? 24 : isTablet ? 36 : 32,
    padding: isSmallScreen ? 18 : isTablet ? 32 : 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
  },
  blurredCard: {
    opacity: 0.5,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isSmallScreen ? 20 : isTablet ? 40 : 30,
  },
  iconContainer: {
    width: isSmallScreen ? 64 : isTablet ? 104 : 84,
    height: isSmallScreen ? 64 : isTablet ? 104 : 84,
    borderRadius: isSmallScreen ? 32 : isTablet ? 52 : 42,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 20 : isTablet ? 28 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: isSmallScreen ? 28 : isTablet ? 48 : 36,
  },
  title: {
    fontSize: isSmallScreen ? 18 : isTablet ? 28 : 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: isSmallScreen ? 14 : isTablet ? 20 : 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: isSmallScreen ? 14 : isTablet ? 20 : 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#999",
    lineHeight: isSmallScreen ? 22 : isTablet ? 30 : 26,
  },
});

