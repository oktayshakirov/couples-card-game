import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

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
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>All cards completed! 🎉</Text>
        <Text style={styles.subtitle}>You've finished the deck together!</Text>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {/* Player 1 Stats */}
          <View style={[styles.playerStatsCard, { borderColor: player1Color }]}>
            <Text style={[styles.playerName, { color: player1Color }]}>
              {player1Name}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#4A90E2" />
                <Text style={styles.statLabel}>Truths</Text>
                <Text style={styles.statValue}>{player1Truths}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#FF6B6B" />
                <Text style={styles.statLabel}>Dares</Text>
                <Text style={styles.statValue}>{player1Dares}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="close" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#999" />
                <Text style={styles.statLabel}>Skipped</Text>
                <Text style={styles.statValue}>{player1Skipped}</Text>
              </View>
            </View>
          </View>

          {/* Player 2 Stats */}
          <View style={[styles.playerStatsCard, { borderColor: player2Color }]}>
            <Text style={[styles.playerName, { color: player2Color }]}>
              {player2Name}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#4A90E2" />
                <Text style={styles.statLabel}>Truths</Text>
                <Text style={styles.statValue}>{player2Truths}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#FF6B6B" />
                <Text style={styles.statLabel}>Dares</Text>
                <Text style={styles.statValue}>{player2Dares}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="close" size={isSmallScreen ? 18 : isTablet ? 24 : 20} color="#999" />
                <Text style={styles.statLabel}>Skipped</Text>
                <Text style={styles.statValue}>{player2Skipped}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Play Again Button */}
        <TouchableOpacity
          style={[styles.playAgainButton, { backgroundColor: player1Color }]}
          onPress={onPlayAgain}
        >
          <MaterialIcons name="refresh" size={isSmallScreen ? 20 : isTablet ? 28 : 24} color="#FFF" />
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
