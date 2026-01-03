import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface SwipeCardProps {
  truth: string;
  dare: string;
  player1Name: string;
  player2Name: string;
  currentPlayer: 1 | 2;
  currentPlayerColor: string;
  blurred?: boolean;
}

const SwipeCardComponent: React.FC<SwipeCardProps> = ({
  truth,
  dare,
  player1Name,
  player2Name,
  currentPlayer,
  currentPlayerColor,
  blurred = false,
}) => {
  const dimensions = useMemo(() => Dimensions.get("window"), []);
  const { width, height } = dimensions;

  const getCurrentPlayerName = useCallback(
    () => (currentPlayer === 1 ? player1Name : player2Name),
    [currentPlayer, player1Name, player2Name]
  );
  const getOtherPlayerName = useCallback(
    () => (currentPlayer === 1 ? player2Name : player1Name),
    [currentPlayer, player1Name, player2Name]
  );

  const formattedTruth = useMemo(
    () =>
      truth
        .replace(/{player1}/g, getCurrentPlayerName())
        .replace(/{player2}/g, getOtherPlayerName()),
    [truth, getCurrentPlayerName, getOtherPlayerName]
  );
  const formattedDare = useMemo(
    () =>
      dare
        .replace(/{player1}/g, getCurrentPlayerName())
        .replace(/{player2}/g, getOtherPlayerName()),
    [dare, getCurrentPlayerName, getOtherPlayerName]
  );

  const calculateFontSize = useCallback((text: string, isTablet: boolean) => {
    const baseSize = isTablet ? 24 : 20;
    const minSize = isTablet ? 16 : 14;
    const maxSize = isTablet ? 24 : 20;

    const charCount = text.length;

    if (charCount > 120) {
      return Math.max(minSize, baseSize * 0.7);
    } else if (charCount > 90) {
      return Math.max(minSize, baseSize * 0.8);
    } else if (charCount > 60) {
      return Math.max(minSize, baseSize * 0.9);
    } else if (charCount > 40) {
      return Math.max(minSize, baseSize * 0.95);
    }

    return baseSize;
  }, []);

  const truthFontSize = useMemo(
    () => calculateFontSize(formattedTruth, width >= 768),
    [formattedTruth, calculateFontSize, width]
  );

  const dareFontSize = useMemo(
    () => calculateFontSize(formattedDare, width >= 768),
    [formattedDare, calculateFontSize, width]
  );

  const stylesMemo = useMemo(
    () => createStyles(width, height, truthFontSize, dareFontSize),
    [width, height, truthFontSize, dareFontSize]
  );

  return (
    <View style={stylesMemo.cardContainer}>
      <View style={[stylesMemo.card, blurred && stylesMemo.blurredCard]}>
        <ScrollView
          style={stylesMemo.scrollView}
          contentContainerStyle={stylesMemo.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={stylesMemo.cardGradient}>
            <View style={stylesMemo.truthSection}>
              <View style={stylesMemo.sectionLabelContainer}>
                <Text style={stylesMemo.sectionLabel}>TRUTH</Text>
              </View>
              <Text
                style={[
                  stylesMemo.truthText,
                  { color: currentPlayerColor, fontSize: truthFontSize },
                ]}
              >
                {formattedTruth}
              </Text>
              <View style={stylesMemo.swipeHint}>
                <Text
                  style={[stylesMemo.swipeArrow, { color: currentPlayerColor }]}
                >
                  ←
                </Text>
                <Text
                  style={[
                    stylesMemo.swipeHintText,
                    { color: currentPlayerColor },
                  ]}
                >
                  swipe left
                </Text>
              </View>
            </View>

            <View style={stylesMemo.divider}>
              <View
                style={[
                  stylesMemo.dividerLine,
                  { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
                ]}
              />
              <Text style={stylesMemo.dividerEmoji}>❤️</Text>
              <View
                style={[
                  stylesMemo.dividerLine,
                  { backgroundColor: hexToRgba(currentPlayerColor, 0.4) },
                ]}
              />
            </View>

            <View style={stylesMemo.dareSection}>
              <View style={stylesMemo.sectionLabelContainer}>
                <Text style={stylesMemo.sectionLabel}>DARE</Text>
              </View>
              <Text
                style={[
                  stylesMemo.dareText,
                  { color: currentPlayerColor, fontSize: dareFontSize },
                ]}
              >
                {formattedDare}
              </Text>
              <View style={stylesMemo.swipeHint}>
                <Text
                  style={[
                    stylesMemo.swipeHintText,
                    { color: currentPlayerColor },
                  ]}
                >
                  swipe right
                </Text>
                <Text
                  style={[stylesMemo.swipeArrow, { color: currentPlayerColor }]}
                >
                  →
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export const SwipeCard = React.memo(SwipeCardComponent);

const createStyles = (
  width: number,
  height: number,
  truthFontSize: number,
  dareFontSize: number
) =>
  StyleSheet.create({
    cardContainer: {
      width: width >= 768 ? width * 0.75 : width * 0.92,
      height: width >= 768 ? height * 0.64 : height * 0.55,
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      minHeight: "100%",
    },
    cardGradient: {
      flex: 1,
      backgroundColor: COLORS.background,
      borderRadius: scale(36),
      padding: scale(28),
      justifyContent: "space-between",
      borderWidth: 1.5,
      borderColor: hexToRgba(COLORS.primary, 0.25),
      minHeight: "100%",
    },
    blurredCard: {
      opacity: 0.3,
    },
    truthSection: {
      flexShrink: 0,
      justifyContent: "flex-start",
      marginBottom: verticalScale(8),
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
      fontWeight: "700",
      lineHeight: truthFontSize * 1.3,
      textAlign: "center",
      marginBottom: verticalScale(10),
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      flexShrink: 0,
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
      flexShrink: 0,
      justifyContent: "flex-start",
      marginTop: verticalScale(8),
    },
    dareText: {
      fontWeight: "600",
      lineHeight: dareFontSize * 1.3,
      textAlign: "center",
      fontStyle: "italic",
      marginBottom: verticalScale(10),
      textShadowColor: "rgba(0, 0, 0, 0.4)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
      letterSpacing: 0.2,
      flexShrink: 0,
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

const styles = createStyles(0, 0, 20, 20);
