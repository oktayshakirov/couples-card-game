import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

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
          <View style={styles.truthSection}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>TRUTH</Text>
            </View>
            <Text style={[styles.truthText, { color: currentPlayerColor }]}>
              {formattedTruth}
            </Text>
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

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
              ]}
            />
            <Text style={styles.dividerEmoji}>❤️</Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
              ]}
            />
          </View>

          <View style={styles.dareSection}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>DARE</Text>
            </View>
            <Text style={[styles.dareText, { color: currentPlayerColor }]}>
              {formattedDare}
            </Text>
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
    width: width >= 768 ? width * 0.75 : width * 0.92,
    height: width >= 768 ? height * 0.58 : height * 0.55,
    borderRadius: scale(32),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: scale(36),
    borderWidth: 2.5,
    borderColor: hexToRgba(COLORS.primary, 0.35),
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: scale(36),
    padding: scale(28),
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: hexToRgba(COLORS.primary, 0.25),
  },
  blurredCard: {
    opacity: 0.3,
  },
  truthSection: {
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 0,
  },
  sectionLabelContainer: {
    alignSelf: "flex-start",
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.3),
    marginBottom: verticalScale(10),
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  truthText: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    lineHeight: moderateScale(32),
    textAlign: "center",
    marginBottom: verticalScale(10),
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(12),
    flexShrink: 0,
  },
  dividerLine: {
    flex: 1,
    height: 2.5,
    borderRadius: 1,
  },
  dividerEmoji: {
    fontSize: moderateScale(24),
    marginHorizontal: scale(12),
  },
  dareSection: {
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 0,
  },
  dareText: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    lineHeight: moderateScale(32),
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: verticalScale(10),
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    opacity: 0.5,
    marginTop: verticalScale(8),
    flexShrink: 0,
  },
  swipeArrow: {
    fontSize: moderateScale(20),
    fontWeight: "600",
  },
  swipeHintText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
