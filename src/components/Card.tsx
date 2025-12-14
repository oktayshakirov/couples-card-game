import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";

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
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  truth,
  dare,
  player1Name,
  player2Name,
  currentPlayer,
  currentPlayerColor,
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
      <View style={styles.card}>
        {/* Truth Section */}
        <View style={styles.truthSection}>
          <Text style={styles.sectionLabel}>TRUTH</Text>
          <Text style={[styles.truthText, { color: currentPlayerColor }]}>
            {formattedTruth}
          </Text>
          {/* Swipe Left Hint */}
          <View style={styles.swipeHint}>
            <Text style={[styles.swipeArrow, { color: currentPlayerColor }]}>
              ←
            </Text>
            <Text style={[styles.swipeHintText, { color: currentPlayerColor }]}>
              swipe left
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: hexToRgba(currentPlayerColor, 0.3) },
            ]}
          />
          <View
            style={[styles.dividerHeart, { borderColor: currentPlayerColor }]}
          >
            <Text style={styles.dividerEmoji}>❤️</Text>
          </View>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: hexToRgba(currentPlayerColor, 0.3) },
            ]}
          />
        </View>

        {/* Dare Section */}
        <View style={styles.dareSection}>
          <Text style={styles.sectionLabel}>DARE</Text>
          <Text style={[styles.dareText, { color: currentPlayerColor }]}>
            {formattedDare}
          </Text>
          {/* Swipe Right Hint */}
          <View style={styles.swipeHint}>
            <Text style={[styles.swipeHintText, { color: currentPlayerColor }]}>
              swipe right
            </Text>
            <Text style={[styles.swipeArrow, { color: currentPlayerColor }]}>
              →
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
    justifyContent: "space-between",
  },
  truthSection: {
    flex: 1,
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: isSmallScreen ? 11 : isTablet ? 14 : 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 2,
    marginBottom: isSmallScreen ? 8 : isTablet ? 16 : 12,
  },
  truthText: {
    fontSize: isSmallScreen ? 18 : isTablet ? 28 : 22,
    fontWeight: "700",
    lineHeight: isSmallScreen ? 24 : isTablet ? 36 : 30,
    textAlign: "center",
    marginBottom: isSmallScreen ? 8 : isTablet ? 16 : 12,
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
    width: isSmallScreen ? 36 : isTablet ? 52 : 44,
    height: isSmallScreen ? 36 : isTablet ? 52 : 44,
    borderRadius: isSmallScreen ? 18 : isTablet ? 26 : 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: isSmallScreen ? 8 : isTablet ? 16 : 12,
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
    lineHeight: isSmallScreen ? 22 : isTablet ? 32 : 26,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: isSmallScreen ? 8 : isTablet ? 16 : 12,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isSmallScreen ? 6 : 8,
    opacity: 0.4,
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
