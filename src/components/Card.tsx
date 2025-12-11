import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";

const { width, height } = Dimensions.get("window");

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
    width: width * 0.85,
    height: height * 0.58,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFE5EC",
    borderRadius: 28,
    padding: 28,
    justifyContent: "space-between",
  },
  truthSection: {
    flex: 1,
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 2,
    marginBottom: 15,
  },
  truthText: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
    marginBottom: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 2,
  },
  dividerHeart: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 15,
  },
  dividerEmoji: {
    fontSize: 22,
  },
  dareSection: {
    flex: 1,
    justifyContent: "center",
  },
  dareText: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 30,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 15,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.4,
  },
  swipeArrow: {
    fontSize: 20,
    fontWeight: "600",
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
