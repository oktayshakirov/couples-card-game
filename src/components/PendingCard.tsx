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
    borderRadius: isSmallScreen ? 28 : isTablet ? 40 : 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: isSmallScreen ? 28 : isTablet ? 40 : 36,
    borderWidth: 2.5,
    borderColor: hexToRgba(COLORS.primary, 0.35),
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: isSmallScreen ? 28 : isTablet ? 40 : 36,
    padding: isSmallScreen ? 20 : isTablet ? 36 : 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: hexToRgba(COLORS.primary, 0.25),
  },
  blurredCard: {
    opacity: 0.55,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isSmallScreen ? 24 : isTablet ? 44 : 34,
  },
  iconContainer: {
    width: isSmallScreen ? 64 : isTablet ? 104 : 84,
    height: isSmallScreen ? 64 : isTablet ? 104 : 84,
    borderRadius: isSmallScreen ? 32 : isTablet ? 52 : 42,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 24 : isTablet ? 32 : 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: isSmallScreen ? 32 : isTablet ? 52 : 40,
  },
  title: {
    fontSize: isSmallScreen ? 20 : isTablet ? 32 : 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: isSmallScreen ? 15 : isTablet ? 22 : 17,
    fontWeight: "500",
    textAlign: "center",
    color: "#aaa",
    lineHeight: isSmallScreen ? 24 : isTablet ? 34 : 28,
    letterSpacing: 0.2,
  },
});
