import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

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
            <Text
              style={[styles.title, { color: currentPlayerColor }]}
              adjustsFontSizeToFit
              numberOfLines={2}
              minimumFontScale={0.7}
            >
              Waiting for confirmation
            </Text>
            <Text
              style={styles.message}
              adjustsFontSizeToFit
              numberOfLines={3}
              minimumFontScale={0.7}
            >
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
    width: width >= 768 ? width * 0.75 : width * 0.92,
    height: width >= 768 ? height * 0.55 : height * 0.55,
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
    paddingHorizontal: scale(34),
  },
  iconContainer: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: moderateScale(36),
  },
  title: {
    fontSize: moderateScale(width >= 768 ? 20 : 24),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(20),
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: moderateScale(width >= 768 ? 15 : 17),
    fontWeight: "500",
    textAlign: "center",
    color: "#aaa",
    lineHeight: moderateScale(width >= 768 ? 24 : 28),
    letterSpacing: 0.2,
  },
});
