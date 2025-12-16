import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface SwipeCardProps {
  truth: string;
  dare: string;
  player1Name: string;
  player2Name: string;
  currentPlayer: 1 | 2;
  currentPlayerColor: string;
  blurred?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  truth,
  dare,
  player1Name,
  player2Name,
  currentPlayer,
  currentPlayerColor,
  blurred = false,
}) => {
  const getCurrentPlayerName = () =>
    currentPlayer === 1 ? player1Name : player2Name;
  const getOtherPlayerName = () =>
    currentPlayer === 1 ? player2Name : player1Name;

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{player1}/g, getCurrentPlayerName())
      .replace(/{player2}/g, getOtherPlayerName());
  };

  const formattedTruth = replacePlaceholders(truth);
  const formattedDare = replacePlaceholders(dare);
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, blurred && styles.blurredCard]}>
        <View style={styles.cardGradient}>
          {/* Truth Section */}
          <View style={styles.truthSection}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>TRUTH</Text>
            </View>
            <Text style={[styles.truthText, { color: currentPlayerColor }]}>
              {formattedTruth}
            </Text>
            {/* Swipe Left Hint */}
            <View style={styles.swipeHint}>
              <Text style={[styles.swipeArrow, { color: currentPlayerColor }]}>
                ←
              </Text>
              <Text
                style={[styles.swipeHintText, { color: currentPlayerColor }]}
              >
                swipe left
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
              ]}
            />
            <View
              style={[
                styles.dividerHeart,
                {
                  borderColor: currentPlayerColor,
                  backgroundColor: hexToRgba(currentPlayerColor, 0.15),
                },
              ]}
            >
              <Text style={styles.dividerEmoji}>❤️</Text>
            </View>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
              ]}
            />
          </View>

          {/* Dare Section */}
          <View style={styles.dareSection}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>DARE</Text>
            </View>
            <Text style={[styles.dareText, { color: currentPlayerColor }]}>
              {formattedDare}
            </Text>
            {/* Swipe Right Hint */}
            <View style={styles.swipeHint}>
              <Text
                style={[styles.swipeHintText, { color: currentPlayerColor }]}
              >
                swipe right
              </Text>
              <Text style={[styles.swipeArrow, { color: currentPlayerColor }]}>
                →
              </Text>
            </View>
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
  },
  blurredCard: {
    opacity: 0.3,
  },
  truthSection: {
    flex: 1,
    justifyContent: "center",
  },
  sectionLabelContainer: {
    alignSelf: "flex-start",
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    paddingHorizontal: isSmallScreen ? 10 : isTablet ? 16 : 12,
    paddingVertical: isSmallScreen ? 4 : isTablet ? 8 : 6,
    borderRadius: isSmallScreen ? 8 : isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.3),
    marginBottom: isSmallScreen ? 10 : isTablet ? 18 : 14,
  },
  sectionLabel: {
    fontSize: isSmallScreen ? 10 : isTablet ? 13 : 11,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  truthText: {
    fontSize: isSmallScreen ? 18 : isTablet ? 28 : 22,
    fontWeight: "700",
    lineHeight: isSmallScreen ? 26 : isTablet ? 38 : 32,
    textAlign: "center",
    marginBottom: isSmallScreen ? 10 : isTablet ? 18 : 14,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: isSmallScreen ? 10 : isTablet ? 20 : 14,
  },
  dividerLine: {
    flex: 1,
    height: 2,
  },
  dividerHeart: {
    width: isSmallScreen ? 40 : isTablet ? 56 : 48,
    height: isSmallScreen ? 40 : isTablet ? 56 : 48,
    borderRadius: isSmallScreen ? 20 : isTablet ? 28 : 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: isSmallScreen ? 10 : isTablet ? 18 : 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dividerEmoji: {
    fontSize: isSmallScreen ? 16 : isTablet ? 24 : 20,
  },
  dareSection: {
    flex: 1,
    justifyContent: "center",
  },
  dareText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 24 : 19,
    fontWeight: "600",
    lineHeight: isSmallScreen ? 24 : isTablet ? 34 : 28,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: isSmallScreen ? 10 : isTablet ? 18 : 14,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isSmallScreen ? 6 : 8,
    opacity: 0.5,
    marginTop: isSmallScreen ? 4 : isTablet ? 8 : 6,
  },
  swipeArrow: {
    fontSize: isSmallScreen ? 16 : isTablet ? 24 : 20,
    fontWeight: "600",
  },
  swipeHintText: {
    fontSize: isSmallScreen ? 12 : isTablet ? 16 : 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
