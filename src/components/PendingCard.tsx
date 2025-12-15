import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

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
        <View style={styles.content}>
          <View style={[styles.iconContainer, { borderColor: currentPlayerColor }]}>
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
    borderRadius: isSmallScreen ? 20 : isTablet ? 32 : 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFE5EC",
    borderRadius: isSmallScreen ? 20 : isTablet ? 32 : 28,
    padding: isSmallScreen ? 14 : isTablet ? 28 : 20,
    justifyContent: "center",
    alignItems: "center",
  },
  blurredCard: {
    opacity: 0.3,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isSmallScreen ? 20 : isTablet ? 40 : 30,
  },
  iconContainer: {
    width: isSmallScreen ? 60 : isTablet ? 100 : 80,
    height: isSmallScreen ? 60 : isTablet ? 100 : 80,
    borderRadius: isSmallScreen ? 30 : isTablet ? 50 : 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  icon: {
    fontSize: isSmallScreen ? 28 : isTablet ? 48 : 36,
  },
  title: {
    fontSize: isSmallScreen ? 18 : isTablet ? 28 : 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: isSmallScreen ? 12 : isTablet ? 16 : 14,
  },
  message: {
    fontSize: isSmallScreen ? 14 : isTablet ? 20 : 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#666",
    lineHeight: isSmallScreen ? 20 : isTablet ? 28 : 24,
  },
});

