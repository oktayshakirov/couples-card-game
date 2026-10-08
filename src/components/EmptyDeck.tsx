import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PlayerColor } from "../hooks/useGameState";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface Highlight {
  title: string;
  detail: string;
  color: string;
}

// Bravest player = more dares; equal dares falls back to fewer skips.
const getHighlight = (
  p1: { name: string; color: string; dares: number; skipped: number },
  p2: { name: string; color: string; dares: number; skipped: number }
): Highlight => {
  const daresLabel = (n: number) => `${n} ${n === 1 ? "dare" : "dares"}`;

  if (p1.dares !== p2.dares) {
    const [winner, loser] = p1.dares > p2.dares ? [p1, p2] : [p2, p1];
    return {
      title: `${winner.name} was the braver one 🔥`,
      detail: `${daresLabel(winner.dares)} vs ${loser.dares}`,
      color: winner.color,
    };
  }

  if (p1.skipped !== p2.skipped) {
    const winner = p1.skipped < p2.skipped ? p1 : p2;
    return {
      title: `${winner.name} was the braver one 🔥`,
      detail: `Same dares, fewer skips`,
      color: winner.color,
    };
  }

  return {
    title: "Perfect match 💞",
    detail: `${daresLabel(p1.dares)} each, nobody backed down`,
    color: COLORS.primary,
  };
};

interface EmptyDeckProps {
  player1Name: string;
  player2Name: string;
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  player1Truths: number;
  player1Dares: number;
  player1Skipped: number;
  player2Truths: number;
  player2Dares: number;
  player2Skipped: number;
  onPlayAgain: () => void;
  onChangeDeck?: () => void;
}

export const EmptyDeck: React.FC<EmptyDeckProps> = ({
  player1Name,
  player2Name,
  player1Color,
  player2Color,
  player1Truths,
  player1Dares,
  player1Skipped,
  player2Truths,
  player2Dares,
  player2Skipped,
  onPlayAgain,
  onChangeDeck,
}) => {
  const { width } = useWindowDimensions();
  const stylesMemo = useMemo(() => createStyles(width), [width]);
  const highlight = getHighlight(
    {
      name: player1Name,
      color: player1Color,
      dares: player1Dares,
      skipped: player1Skipped,
    },
    {
      name: player2Name,
      color: player2Color,
      dares: player2Dares,
      skipped: player2Skipped,
    }
  );

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={stylesMemo.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={stylesMemo.container}>
        <Text style={stylesMemo.title}>All cards completed! 🎉</Text>
        <Text style={stylesMemo.subtitle}>
          You've finished the deck together!
        </Text>

        <View
          style={[stylesMemo.highlightCard, { borderColor: highlight.color }]}
        >
          <Text style={[stylesMemo.highlightTitle, { color: highlight.color }]}>
            {highlight.title}
          </Text>
          <Text style={stylesMemo.highlightDetail}>{highlight.detail}</Text>
        </View>

        <View style={stylesMemo.statsContainer}>
          <View
            style={[stylesMemo.playerStatsCard, { borderColor: player1Color }]}
          >
            <Text style={[stylesMemo.playerName, { color: player1Color }]}>
              {player1Name}
            </Text>
            <View style={stylesMemo.statsRow}>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="help-circle"
                  size={moderateScale(18)}
                  color="#4A90E2"
                />
                <Text style={stylesMemo.statLabel}>Truths</Text>
                <Text style={stylesMemo.statValue}>{player1Truths}</Text>
              </View>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="flame"
                  size={moderateScale(18)}
                  color="#FF6B6B"
                />
                <Text style={stylesMemo.statLabel}>Dares</Text>
                <Text style={stylesMemo.statValue}>{player1Dares}</Text>
              </View>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="close"
                  size={moderateScale(18)}
                  color={COLORS.text.secondary}
                />
                <Text style={stylesMemo.statLabel}>Skipped</Text>
                <Text style={stylesMemo.statValue}>{player1Skipped}</Text>
              </View>
            </View>
          </View>

          <View
            style={[stylesMemo.playerStatsCard, { borderColor: player2Color }]}
          >
            <Text style={[stylesMemo.playerName, { color: player2Color }]}>
              {player2Name}
            </Text>
            <View style={stylesMemo.statsRow}>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="help-circle"
                  size={moderateScale(18)}
                  color="#4A90E2"
                />
                <Text style={stylesMemo.statLabel}>Truths</Text>
                <Text style={stylesMemo.statValue}>{player2Truths}</Text>
              </View>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="flame"
                  size={moderateScale(18)}
                  color="#FF6B6B"
                />
                <Text style={stylesMemo.statLabel}>Dares</Text>
                <Text style={stylesMemo.statValue}>{player2Dares}</Text>
              </View>
              <View style={stylesMemo.statItem}>
                <Ionicons
                  name="close"
                  size={moderateScale(18)}
                  color={COLORS.text.secondary}
                />
                <Text style={stylesMemo.statLabel}>Skipped</Text>
                <Text style={stylesMemo.statValue}>{player2Skipped}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={stylesMemo.buttonsContainer}>
          <TouchableOpacity
            style={stylesMemo.playAgainButton}
            onPress={onPlayAgain}
          >
            <MaterialIcons
              name="refresh"
              size={moderateScale(20)}
              color={COLORS.text.primary}
            />
            <Text style={stylesMemo.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          {onChangeDeck && (
            <TouchableOpacity
              style={stylesMemo.changeDeckButton}
              onPress={onChangeDeck}
            >
              <MaterialIcons
                name="style"
                size={moderateScale(20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.changeDeckText}>Change Deck</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingVertical: verticalScale(20),
    },
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: width >= 768 ? 32 : scale(24),
      paddingBottom: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: "700",
      color: "#B19CD9",
      marginBottom: verticalScale(8),
      textAlign: "center",
    },
    subtitle: {
      fontSize: moderateScale(14),
      color: COLORS.text.secondary,
      textAlign: "center",
      marginBottom: verticalScale(20),
    },
    highlightCard: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(16),
    },
    highlightTitle: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      textAlign: "center",
    },
    highlightDetail: {
      fontSize: moderateScale(13),
      color: COLORS.text.secondary,
      marginTop: verticalScale(4),
      textAlign: "center",
    },
    statsContainer: {
      width: "100%",
      gap: verticalScale(10),
      marginBottom: verticalScale(16),
    },
    playerStatsCard: {
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 14,
      padding: scale(12),
      borderWidth: 2,
      borderStyle: "solid",
    },
    playerName: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      textAlign: "center",
      marginBottom: verticalScale(8),
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    statItem: {
      alignItems: "center",
      gap: verticalScale(3),
    },
    statLabel: {
      fontSize: moderateScale(11),
      color: COLORS.text.secondary,
      fontWeight: "600",
    },
    statValue: {
      fontSize: moderateScale(20),
      color: COLORS.text.primary,
      fontWeight: "700",
    },
    buttonsContainer: {
      flexDirection: "column",
      gap: scale(12),
      width: "100%",
      alignItems: "stretch",
    },
    playAgainButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(10),
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(32),
      borderRadius: scale(16),
      backgroundColor: COLORS.primary,
      width: "100%",
    },
    playAgainText: {
      fontSize: moderateScale(18),
      color: COLORS.text.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    changeDeckButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(10),
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(32),
      borderRadius: scale(16),
      backgroundColor: COLORS.primary,
      width: "100%",
    },
    changeDeckText: {
      fontSize: moderateScale(18),
      color: COLORS.text.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

const styles = createStyles(0);
