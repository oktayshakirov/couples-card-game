import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { PlayerColor } from "../hooks/useGameState";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
                <Ionicons name="close" size={moderateScale(18)} color="#999" />
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
                <Ionicons name="close" size={moderateScale(18)} color="#999" />
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
              color="#FFF"
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
                color="#FFF"
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
      color: "#999",
      textAlign: "center",
      marginBottom: verticalScale(20),
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
      color: "#999",
      fontWeight: "600",
    },
    statValue: {
      fontSize: moderateScale(20),
      color: "#FFF",
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
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      width: "100%",
    },
    playAgainText: {
      fontSize: moderateScale(18),
      color: "#FFF",
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
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      width: "100%",
    },
    changeDeckText: {
      fontSize: moderateScale(18),
      color: "#FFF",
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

const styles = createStyles(0); // Will be recalculated in component
