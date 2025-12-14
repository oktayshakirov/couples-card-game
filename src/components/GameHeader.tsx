import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Avatar, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

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
          <MaterialIcons
            name="people"
            size={isSmallScreen ? 18 : isTablet ? 24 : 20}
            color="#999"
          />
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
            size={isSmallScreen ? 22 : isTablet ? 30 : 26}
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
            <Ionicons
              name="help-circle"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#4A90E2"
            />
            <Text style={styles.statText}>{player1Truths}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="flame"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#FF6B6B"
            />
            <Text style={styles.statText}>{player1Dares}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="close"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#999"
            />
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
            size={isSmallScreen ? 22 : isTablet ? 30 : 26}
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
            <Ionicons
              name="help-circle"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#4A90E2"
            />
            <Text style={styles.statText}>{player2Truths}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="flame"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#FF6B6B"
            />
            <Text style={styles.statText}>{player2Dares}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="close"
              size={isSmallScreen ? 12 : isTablet ? 16 : 14}
              color="#999"
            />
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
    paddingHorizontal: isSmallScreen ? 12 : isTablet ? 20 : 16,
    paddingVertical: isSmallScreen ? 8 : isTablet ? 16 : 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,107,107,0.15)",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: isSmallScreen ? 6 : isTablet ? 12 : 8,
    right: isSmallScreen ? 6 : isTablet ? 12 : 8,
    width: isSmallScreen ? 32 : isTablet ? 44 : 36,
    height: isSmallScreen ? 32 : isTablet ? 44 : 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  playerCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: isSmallScreen ? 2 : 4,
  },
  avatarContainer: {
    width: isSmallScreen ? 42 : isTablet ? 58 : 50,
    height: isSmallScreen ? 42 : isTablet ? 58 : 50,
    borderRadius: isSmallScreen ? 21 : isTablet ? 29 : 25,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 5 : isTablet ? 8 : 6,
  },
  activeAvatarContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playerLabel: {
    fontSize: isSmallScreen ? 9 : isTablet ? 13 : 11,
    fontWeight: "600",
    color: "#888",
    marginBottom: isSmallScreen ? 4 : isTablet ? 8 : 6,
    letterSpacing: 0.5,
  },
  activePlayerLabel: {
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: isSmallScreen ? 5 : isTablet ? 10 : 7,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallScreen ? 3 : isTablet ? 5 : 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: isSmallScreen ? 6 : isTablet ? 10 : 8,
    paddingVertical: isSmallScreen ? 3 : isTablet ? 5 : 4,
    borderRadius: isSmallScreen ? 8 : 10,
    minWidth: isSmallScreen ? 28 : isTablet ? 38 : 32,
    justifyContent: "center",
  },
  statText: {
    fontSize: isSmallScreen ? 12 : isTablet ? 16 : 13,
    fontWeight: "700",
    color: "#FFF",
  },
  vsDivider: {
    paddingHorizontal: isSmallScreen ? 6 : isTablet ? 14 : 10,
  },
  vsText: {
    fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
    fontWeight: "800",
    color: "#FF6B6B",
    letterSpacing: 1,
  },
});
