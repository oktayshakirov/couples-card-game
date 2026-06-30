import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { PlayerInfo } from "../hooks/useGameState";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface WelcomeBackScreenProps {
  player1Info: PlayerInfo;
  player2Info: PlayerInfo;
  onContinue: () => void;
  onEditPlayers: () => void;
  onStartNew: () => void;
}

const PlayerBadge: React.FC<{
  info: PlayerInfo;
  styles: ReturnType<typeof createStyles>;
  avatarSize: number;
}> = ({ info, styles, avatarSize }) => (
  <View style={styles.player}>
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: hexToRgba(info.color, 0.15),
          borderColor: info.color,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={info.avatar as any}
        size={avatarSize}
        color={info.color}
      />
    </View>
    <Text style={[styles.playerName, { color: info.color }]} numberOfLines={1}>
      {info.name}
    </Text>
  </View>
);

export const WelcomeBackScreen: React.FC<WelcomeBackScreenProps> = ({
  player1Info,
  player2Info,
  onContinue,
  onEditPlayers,
  onStartNew,
}) => {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const avatarSize = moderateScale(width >= 768 ? 32 : 40);

  const handleStartNew = () => {
    Alert.alert(
      "Start with new players?",
      "This will clear the current profiles so you can set up two new players.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start new",
          style: "destructive",
          onPress: onStartNew,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="cards-heart"
              size={moderateScale(36)}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Pick up where you left off</Text>
        </View>

        <View style={styles.playersCard}>
          <PlayerBadge
            info={player1Info}
            styles={styles}
            avatarSize={avatarSize}
          />
          <Text style={styles.ampersand}>&</Text>
          <PlayerBadge
            info={player2Info}
            styles={styles}
            avatarSize={avatarSize}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="play-arrow"
            size={moderateScale(22)}
            color={COLORS.text.primary}
          />
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onEditPlayers}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="edit"
            size={moderateScale(18)}
            color={COLORS.primary}
          />
          <Text style={styles.secondaryButtonText}>Edit Players</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={handleStartNew}
          activeOpacity={0.7}
        >
          <Text style={styles.textButtonText}>Start with new players</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (width: number) => {
  const isTablet = width >= 768;
  const padding = isTablet ? scale(32) : scale(24);
  const maxWidth = isTablet ? 520 : width - padding * 2;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: padding,
    },
    hero: {
      alignItems: "center",
      marginBottom: verticalScale(32),
    },
    heroIcon: {
      width: scale(76),
      height: scale(76),
      borderRadius: scale(38),
      backgroundColor: hexToRgba(COLORS.primary, 0.12),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.25),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: "800",
      color: COLORS.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: moderateScale(15),
      color: COLORS.text.secondary,
      textAlign: "center",
      marginTop: verticalScale(6),
    },
    playersCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(16),
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.2),
      borderRadius: scale(20),
      paddingVertical: verticalScale(24),
      paddingHorizontal: scale(20),
      width: "100%",
      maxWidth,
    },
    player: {
      alignItems: "center",
      flex: 1,
      gap: verticalScale(10),
    },
    avatar: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    playerName: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      maxWidth: scale(110),
    },
    ampersand: {
      fontSize: moderateScale(20),
      fontWeight: "800",
      color: COLORS.primary,
    },
    actions: {
      paddingHorizontal: padding,
      paddingBottom: verticalScale(16),
      gap: verticalScale(12),
      alignItems: "center",
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      backgroundColor: COLORS.primary,
      borderRadius: scale(14),
      paddingVertical: verticalScale(16),
      width: "100%",
      maxWidth,
    },
    primaryButtonText: {
      fontSize: moderateScale(17),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.4),
      paddingVertical: verticalScale(15),
      width: "100%",
      maxWidth,
    },
    secondaryButtonText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: COLORS.primary,
    },
    textButton: {
      paddingVertical: verticalScale(10),
    },
    textButtonText: {
      fontSize: moderateScale(14),
      fontWeight: "500",
      color: COLORS.text.secondary,
      textDecorationLine: "underline",
    },
  });
};
