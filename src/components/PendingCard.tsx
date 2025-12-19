import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
  const { width, height } = useWindowDimensions();
  const stylesMemo = useMemo(
    () => createStyles(width, height),
    [width, height]
  );

  return (
    <View style={stylesMemo.cardContainer}>
      <View style={[stylesMemo.card, stylesMemo.blurredCard]}>
        <View style={stylesMemo.cardGradient}>
          <View style={stylesMemo.content}>
            <View
              style={[
                stylesMemo.iconContainer,
                {
                  borderColor: currentPlayerColor,
                  backgroundColor: hexToRgba(currentPlayerColor, 0.15),
                },
              ]}
            >
              <Text style={stylesMemo.icon}>⏳</Text>
            </View>
            <Text
              style={[stylesMemo.title, { color: currentPlayerColor }]}
              adjustsFontSizeToFit
              numberOfLines={2}
              minimumFontScale={0.7}
            >
              Waiting for confirmation
            </Text>
            <Text
              style={stylesMemo.message}
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

const createStyles = (width: number, height: number) =>
  StyleSheet.create({
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

const styles = createStyles(0, 0); // Will be recalculated in component
