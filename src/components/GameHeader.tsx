import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Avatar, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";

interface GameHeaderProps {
  currentPlayer: 1 | 2;
  player1Dares: number;
  player1Truths: number;
  player1Skipped: number;
  player2Dares: number;
  player2Truths: number;
  player2Skipped: number;
  player1Name: string;
  player2Name: string;
  player1Avatar: Avatar;
  player2Avatar: Avatar;
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  onSettingsPress?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentPlayer,
  player1Dares,
  player1Truths,
  player1Skipped,
  player2Dares,
  player2Truths,
  player2Skipped,
  player1Name,
  player2Name,
  player1Avatar,
  player2Avatar,
  player1Color,
  player2Color,
  onSettingsPress,
}) => {
  return (
    <View style={styles.header}>
      {onSettingsPress && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
        >
          <MaterialIcons name="mode" size={20} color="#999" />
        </TouchableOpacity>
      )}
      {/* Player 1 */}
      <View style={styles.playerCard}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: hexToRgba(player1Color, 0.12),
              borderColor:
                currentPlayer === 1 ? player1Color : "rgba(255,255,255,0.15)",
            },
            currentPlayer === 1 && [
              styles.activeAvatarContainer,
              {
                borderColor: player1Color,
                backgroundColor: hexToRgba(player1Color, 0.15),
                shadowColor: player1Color,
              },
            ],
          ]}
        >
          <MaterialIcons
            name={player1Avatar as any}
            size={24}
            color={currentPlayer === 1 ? player1Color : "#999"}
          />
        </View>
        <Text
          style={[
            styles.playerLabel,
            currentPlayer === 1 && [
              styles.activePlayerLabel,
              { color: player1Color },
            ],
          ]}
        >
          {player1Name}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="help-circle" size={12} color="#4A90E2" />
            <Text style={styles.statText}>{player1Truths}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="flame" size={12} color="#FF6B6B" />
            <Text style={styles.statText}>{player1Dares}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="close" size={12} color="#999" />
            <Text style={styles.statText}>{player1Skipped}</Text>
          </View>
        </View>
      </View>

      {/* VS Divider */}
      <View style={styles.vsDivider}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      {/* Player 2 */}
      <View style={styles.playerCard}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: hexToRgba(player2Color, 0.12),
              borderColor:
                currentPlayer === 2 ? player2Color : "rgba(255,255,255,0.15)",
            },
            currentPlayer === 2 && [
              styles.activeAvatarContainer,
              {
                borderColor: player2Color,
                backgroundColor: hexToRgba(player2Color, 0.15),
                shadowColor: player2Color,
              },
            ],
          ]}
        >
          <MaterialIcons
            name={player2Avatar as any}
            size={24}
            color={currentPlayer === 2 ? player2Color : "#999"}
          />
        </View>
        <Text
          style={[
            styles.playerLabel,
            currentPlayer === 2 && [
              styles.activePlayerLabel,
              { color: player2Color },
            ],
          ]}
        >
          {player2Name}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="help-circle" size={12} color="#4A90E2" />
            <Text style={styles.statText}>{player2Truths}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="flame" size={12} color="#FF6B6B" />
            <Text style={styles.statText}>{player2Dares}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="close" size={12} color="#999" />
            <Text style={styles.statText}>{player2Skipped}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,107,107,0.15)",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  playerCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  activeAvatarContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  activePlayerLabel: {
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 28,
    justifyContent: "center",
  },
  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  vsDivider: {
    paddingHorizontal: 10,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6B6B",
    letterSpacing: 1,
  },
});
