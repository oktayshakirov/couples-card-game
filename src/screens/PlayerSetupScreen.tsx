import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar, PlayerInfo, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

const ITEMS_PER_ROW = 5;

const getResponsiveValues = () => {
  const screenPadding = width >= 768 ? 32 : scale(16);
  const sectionPadding = width >= 768 ? 24 : scale(16);
  const gap = width >= 768 ? 16 : scale(8);

  const availableWidth = width - screenPadding * 2 - sectionPadding * 2;
  const totalGapWidth = gap * (ITEMS_PER_ROW - 1);
  const buttonSize = (availableWidth - totalGapWidth) / ITEMS_PER_ROW;

  return {
    screenPadding,
    sectionPadding,
    gap: Math.floor(gap),
    buttonSize: Math.floor(buttonSize),
  };
};

const responsive = getResponsiveValues();

interface PlayerSetupScreenProps {
  player1Info: PlayerInfo;
  player2Info: PlayerInfo;
  onUpdatePlayer1: (info: Partial<PlayerInfo>) => void;
  onUpdatePlayer2: (info: Partial<PlayerInfo>) => void;
  onStartGame: () => void;
  isEditing?: boolean;
  onClose?: () => void;
}

const avatars: { value: Avatar; icon: string }[] = [
  { value: "person", icon: "person" },
  { value: "auto-awesome", icon: "auto-awesome" },
  { value: "mood", icon: "mood" },
  { value: "favorite", icon: "favorite" },
  { value: "local-florist", icon: "local-florist" },
  { value: "bedtime", icon: "bedtime" },
  { value: "pets", icon: "pets" },
  { value: "local-fire-department", icon: "local-fire-department" },
  { value: "star", icon: "star" },
  { value: "celebration", icon: "celebration" },
];

const colors: PlayerColor[] = [
  "#B19CD9",
  "#7FCDCD",
  "#8DB4D4",
  "#8FBC8F",
  "#D4A5A5",
  "#A0A0A0",
  "#E6A8D3",
  "#F4A460",
  "#B8E6B8",
  "#FFD4A3",
];

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  player1Info,
  player2Info,
  onUpdatePlayer1,
  onUpdatePlayer2,
  onStartGame,
  isEditing = false,
  onClose,
}) => {
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const insets = useSafeAreaInsets();

  const currentInfo = activePlayer === 1 ? player1Info : player2Info;
  const updateCurrentPlayer =
    activePlayer === 1 ? onUpdatePlayer1 : onUpdatePlayer2;

  const canStartGame =
    player1Info.name.trim() !== "" && player2Info.name.trim() !== "";

  const canContinue = currentInfo.name.trim() !== "";

  const getButtonText = () => {
    if (isEditing) {
      return "Save & Continue";
    }
    if (activePlayer === 1) {
      return "Continue";
    }
    return "Start Game";
  };

  const handleButtonPress = () => {
    if (isEditing) {
      onStartGame();
    } else if (activePlayer === 1) {
      setActivePlayer(2);
    } else {
      onStartGame();
    }
  };

  const isButtonDisabled = () => {
    if (isEditing) {
      return !canStartGame;
    }
    if (activePlayer === 1) {
      return !canContinue;
    }
    return !canStartGame;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View
        style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>
            {isEditing ? "Edit Players" : "Setup Players"}
          </Text>
          {isEditing && onClose ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="close"
                size={moderateScale(24)}
                color="#fff"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
        <Text style={styles.subtitle}>
          {isEditing
            ? "Update your profiles and continue the game"
            : "Customize your profiles before starting the game"}
        </Text>
        <View style={styles.playerSelector}>
          <TouchableOpacity
            style={[
              styles.playerTab,
              activePlayer === 1 && styles.activePlayerTab,
            ]}
            onPress={() => setActivePlayer(1)}
          >
            <Text
              style={[
                styles.playerTabText,
                activePlayer === 1 && styles.activePlayerTabText,
              ]}
            >
              Player 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.playerTab,
              activePlayer === 2 && styles.activePlayerTab,
            ]}
            onPress={() => setActivePlayer(2)}
          >
            <Text
              style={[
                styles.playerTabText,
                activePlayer === 2 && styles.activePlayerTabText,
              ]}
            >
              Player 2
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.setupSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter Player ${activePlayer}'s name`}
              placeholderTextColor="#666"
              value={currentInfo.name}
              onChangeText={(text) => updateCurrentPlayer({ name: text })}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarContainer}>
              {avatars.map((avatar, index) => {
                const isLastInRow = (index + 1) % ITEMS_PER_ROW === 0;
                const isInLastRow = index >= avatars.length - ITEMS_PER_ROW;
                return (
                  <TouchableOpacity
                    key={avatar.value}
                    style={[
                      styles.avatarButton,
                      isLastInRow && styles.avatarButtonLastInRow,
                      isInLastRow && styles.avatarButtonLastRow,
                      currentInfo.avatar === avatar.value && [
                        styles.activeAvatarButton,
                        {
                          borderColor: currentInfo.color,
                          backgroundColor: hexToRgba(currentInfo.color, 0.15),
                        },
                      ],
                    ]}
                    onPress={() =>
                      updateCurrentPlayer({ avatar: avatar.value })
                    }
                  >
                    <MaterialIcons
                      name={avatar.icon as any}
                      size={moderateScale(
                        Math.floor(responsive.buttonSize * 0.5)
                      )}
                      color={
                        currentInfo.avatar === avatar.value
                          ? currentInfo.color
                          : "#999"
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.inputGroup, styles.lastInputGroup]}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {colors.map((color, index) => {
                const isLastInRow = (index + 1) % ITEMS_PER_ROW === 0;
                const isInLastRow = index >= colors.length - ITEMS_PER_ROW;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      isLastInRow && styles.colorButtonLastInRow,
                      isInLastRow && styles.colorButtonLastRow,
                      currentInfo.color === color && styles.activeColorButton,
                      { backgroundColor: color },
                      currentInfo.color === color && {
                        borderWidth: 3,
                        borderColor: "#FFF",
                      },
                    ]}
                    onPress={() => updateCurrentPlayer({ color })}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              isButtonDisabled() && styles.startButtonDisabled,
            ]}
            onPress={handleButtonPress}
            disabled={isButtonDisabled()}
          >
            <Text style={styles.startButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsive.screenPadding,
    paddingTop: verticalScale(20),
    minHeight: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(6),
  },
  headerSpacer: {
    width: scale(44),
    height: verticalScale(44),
  },
  closeButton: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(30),
    fontWeight: "800",
    color: COLORS.primary,
    flex: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#999",
    textAlign: "center",
    marginBottom: verticalScale(14),
    paddingHorizontal: width >= 768 ? 20 : 0,
  },
  playerSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: verticalScale(14),
  },
  playerTab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderRadius: 8,
  },
  activePlayerTab: {
    backgroundColor: COLORS.primary,
  },
  playerTabText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#999",
  },
  activePlayerTabText: {
    color: "#FFF",
  },
  setupSection: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: responsive.sectionPadding,
    marginBottom: verticalScale(12),
    minHeight: 0,
  },
  inputGroup: {
    marginBottom: verticalScale(14),
    flexShrink: 1,
  },
  lastInputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#FFF",
    marginBottom: verticalScale(6),
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: scale(14),
    fontSize: moderateScale(15),
    color: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  avatarButton: {
    width: responsive.buttonSize,
    height: responsive.buttonSize,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: responsive.buttonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    marginRight: responsive.gap,
    marginBottom: responsive.gap,
  },
  avatarButtonLastInRow: {
    marginRight: 0,
  },
  avatarButtonLastRow: {
    marginBottom: 0,
  },
  activeAvatarButton: {
    borderColor: COLORS.primary,
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  colorButton: {
    width: responsive.buttonSize,
    height: responsive.buttonSize,
    borderRadius: responsive.buttonSize / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    marginRight: responsive.gap,
    marginBottom: responsive.gap,
  },
  colorButtonLastInRow: {
    marginRight: 0,
  },
  colorButtonLastRow: {
    marginBottom: 0,
  },
  activeColorButton: {
    transform: [{ scale: 1.15 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    marginTop: verticalScale(12),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(177,156,217,0.15)",
    flexShrink: 0,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: scale(16),
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "#444",
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#FFF",
  },
});
