import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Avatar, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
  onMenuPress?: () => void;
}

const GameHeaderComponent: React.FC<GameHeaderProps> = ({
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
  onMenuPress,
}) => {
  const width = useMemo(() => Dimensions.get("window").width, []);
  const stylesMemo = useMemo(() => createStyles(width), [width]);

  return (
    <View style={stylesMemo.header}>
      {onMenuPress && (
        <TouchableOpacity
          style={stylesMemo.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="menu"
            size={moderateScale(width >= 768 ? 20 : 22)}
            color="#999"
          />
        </TouchableOpacity>
      )}
      <View style={stylesMemo.playerCard}>
        <View
          style={[
            stylesMemo.avatarContainer,
            {
              backgroundColor: hexToRgba(player1Color, 0.12),
              borderColor:
                currentPlayer === 1 ? player1Color : "rgba(255,255,255,0.15)",
            },
            currentPlayer === 1 && [
              stylesMemo.activeAvatarContainer,
              {
                borderColor: player1Color,
                backgroundColor: hexToRgba(player1Color, 0.15),
                shadowColor: player1Color,
              },
            ],
          ]}
        >
          <MaterialCommunityIcons
            name={player1Avatar as any}
            size={moderateScale(width >= 768 ? 18 : 22)}
            color={currentPlayer === 1 ? player1Color : "#999"}
          />
        </View>
        <Text
          style={[
            stylesMemo.playerLabel,
            currentPlayer === 1 && [
              stylesMemo.activePlayerLabel,
              { color: player1Color },
            ],
          ]}
        >
          {player1Name}
        </Text>
        <View style={stylesMemo.statsRow}>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="help-circle"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#4A90E2"
            />
            <Text style={stylesMemo.statText}>{player1Truths}</Text>
          </View>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="flame"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#FF6B6B"
            />
            <Text style={stylesMemo.statText}>{player1Dares}</Text>
          </View>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="close"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#999"
            />
            <Text style={stylesMemo.statText}>{player1Skipped}</Text>
          </View>
        </View>
      </View>

      <View style={stylesMemo.vsDivider}>
        <Text style={stylesMemo.vsText}>VS</Text>
      </View>

      <View style={stylesMemo.playerCard}>
        <View
          style={[
            stylesMemo.avatarContainer,
            {
              backgroundColor: hexToRgba(player2Color, 0.12),
              borderColor:
                currentPlayer === 2 ? player2Color : "rgba(255,255,255,0.15)",
            },
            currentPlayer === 2 && [
              stylesMemo.activeAvatarContainer,
              {
                borderColor: player2Color,
                backgroundColor: hexToRgba(player2Color, 0.15),
                shadowColor: player2Color,
              },
            ],
          ]}
        >
          <MaterialCommunityIcons
            name={player2Avatar as any}
            size={moderateScale(width >= 768 ? 18 : 22)}
            color={currentPlayer === 2 ? player2Color : "#999"}
          />
        </View>
        <Text
          style={[
            stylesMemo.playerLabel,
            currentPlayer === 2 && [
              stylesMemo.activePlayerLabel,
              { color: player2Color },
            ],
          ]}
        >
          {player2Name}
        </Text>
        <View style={stylesMemo.statsRow}>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="help-circle"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#4A90E2"
            />
            <Text style={stylesMemo.statText}>{player2Truths}</Text>
          </View>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="flame"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#FF6B6B"
            />
            <Text style={stylesMemo.statText}>{player2Dares}</Text>
          </View>
          <View style={stylesMemo.statBadge}>
            <Ionicons
              name="close"
              size={moderateScale(width >= 768 ? 10 : 12)}
              color="#999"
            />
            <Text style={stylesMemo.statText}>{player2Skipped}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: width >= 768 ? verticalScale(4) : verticalScale(8),
      backgroundColor: "rgba(255,255,255,0.03)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(177,156,217,0.15)",
      position: "relative",
    },
    menuButton: {
      position: "absolute",
      top: width >= 768 ? verticalScale(4) : verticalScale(8),
      right: scale(16),
      width: width >= 768 ? scale(32) : scale(36),
      height: width >= 768 ? verticalScale(32) : verticalScale(36),
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    playerCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: width >= 768 ? verticalScale(1) : verticalScale(2),
    },
    avatarContainer: {
      width: width >= 768 ? scale(36) : scale(42),
      height: width >= 768 ? scale(36) : scale(42),
      borderRadius: width >= 768 ? scale(18) : scale(21),
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: width >= 768 ? verticalScale(2) : verticalScale(4),
    },
    activeAvatarContainer: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    playerLabel: {
      fontSize: width >= 768 ? moderateScale(9) : moderateScale(10),
      fontWeight: "600",
      color: "#888",
      marginBottom: width >= 768 ? verticalScale(2) : verticalScale(4),
      letterSpacing: 0.5,
    },
    activePlayerLabel: {
      fontWeight: "700",
    },
    statsRow: {
      flexDirection: "row",
      gap: width >= 768 ? scale(5) : scale(7),
    },
    statBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(3),
      backgroundColor: "rgba(255,255,255,0.05)",
      paddingHorizontal: width >= 768 ? scale(5) : scale(6),
      paddingVertical: width >= 768 ? verticalScale(2) : verticalScale(3),
      borderRadius: 8,
      minWidth: width >= 768 ? scale(24) : scale(28),
      justifyContent: "center",
    },
    statText: {
      fontSize: width >= 768 ? moderateScale(10) : moderateScale(11),
      fontWeight: "700",
      color: "#FFF",
    },
    vsDivider: {
      paddingHorizontal: scale(10),
    },
    vsText: {
      fontSize: moderateScale(14),
      fontWeight: "800",
      color: COLORS.primary,
      letterSpacing: 1,
    },
  });

export const GameHeader = React.memo(GameHeaderComponent);

const styles = createStyles(0);
