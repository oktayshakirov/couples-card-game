import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GameHeaderProps {
  currentPlayer: 1 | 2;
  player1Dares: number;
  player1Questions: number;
  player1Skipped: number;
  player2Dares: number;
  player2Questions: number;
  player2Skipped: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentPlayer,
  player1Dares,
  player1Questions,
  player1Skipped,
  player2Dares,
  player2Questions,
  player2Skipped,
}) => {
  return (
    <View style={styles.header}>
      {/* Player 1 */}
      <View style={styles.playerCard}>
        <View
          style={[
            styles.avatarContainer,
            currentPlayer === 1 && styles.activeAvatarContainer,
          ]}
        >
          <Ionicons
            name="person"
            size={24}
            color={currentPlayer === 1 ? "#FF6B6B" : "#999"}
          />
        </View>
        <Text
          style={[
            styles.playerLabel,
            currentPlayer === 1 && styles.activePlayerLabel,
          ]}
        >
          Player 1
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="help-circle" size={12} color="#4A90E2" />
            <Text style={styles.statText}>{player1Questions}</Text>
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
            currentPlayer === 2 && styles.activeAvatarContainer,
          ]}
        >
          <Ionicons
            name="person"
            size={24}
            color={currentPlayer === 2 ? "#FF6B6B" : "#999"}
          />
        </View>
        <Text
          style={[
            styles.playerLabel,
            currentPlayer === 2 && styles.activePlayerLabel,
          ]}
        >
          Player 2
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="help-circle" size={12} color="#4A90E2" />
            <Text style={styles.statText}>{player2Questions}</Text>
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  activeAvatarContainer: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255,107,107,0.15)",
    shadowColor: "#FF6B6B",
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
    color: "#FF6B6B",
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

