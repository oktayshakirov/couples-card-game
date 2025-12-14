import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar, PlayerInfo, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

// Calculate button size for 5 items per row
const ITEMS_PER_ROW = 5;
const getButtonSize = () => {
  const screenPadding = isTablet ? 32 : 16;
  const sectionPadding = isSmallScreen ? 16 : isTablet ? 24 : 18;
  const gap = isSmallScreen ? 8 : isTablet ? 16 : 10;
  // Available width = screen width - screen padding - section padding (both sides)
  const availableWidth = width - screenPadding * 2 - sectionPadding * 2;
  const totalGapWidth = gap * (ITEMS_PER_ROW - 1);
  const buttonSize = (availableWidth - totalGapWidth) / ITEMS_PER_ROW;
  return Math.floor(buttonSize);
};

const BUTTON_SIZE = getButtonSize();
const GAP_SIZE = isSmallScreen ? 8 : isTablet ? 16 : 10;

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
  "#B19CD9", // Pastel Purple
  "#7FCDCD", // Pastel Teal
  "#8DB4D4", // Pastel Blue
  "#8FBC8F", // Pastel Green
  "#D4A5A5", // Pastel Rose
  "#A0A0A0", // Grey
  "#E6A8D3", // Pastel Pink
  "#F4A460", // Pastel Peach
  "#B8E6B8", // Pastel Mint
  "#FFD4A3", // Pastel Apricot
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Row with Title and Close Button */}
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.title, { color: currentInfo.color }]}>
            {isEditing ? "Edit Players" : "Setup Players"}
          </Text>
          {isEditing && onClose ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={28} color="#FFF" />
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
        {/* Player Selector */}
        <View style={styles.playerSelector}>
          <TouchableOpacity
            style={[
              styles.playerTab,
              activePlayer === 1 && [
                styles.activePlayerTab,
                { backgroundColor: player1Info.color },
              ],
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
              activePlayer === 2 && [
                styles.activePlayerTab,
                { backgroundColor: player2Info.color },
              ],
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
        {/* Current Player Setup */}
        <View style={styles.setupSection}>
          {/* Name Input */}
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

          {/* Avatar Selection */}
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
                      size={Math.floor(BUTTON_SIZE * 0.5)}
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

          {/* Color Selection */}
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

        {/* Start Game Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              isButtonDisabled() && styles.startButtonDisabled,
              !isButtonDisabled() && { backgroundColor: currentInfo.color },
            ]}
            onPress={handleButtonPress}
            disabled={isButtonDisabled()}
          >
            <Text style={styles.startButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isSmallScreen ? 8 : isTablet ? 12 : 10,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    paddingHorizontal: isTablet ? 32 : 16,
    paddingTop: isSmallScreen ? 16 : isTablet ? 24 : 20,
    paddingBottom: isSmallScreen ? 24 : isTablet ? 32 : 28,
  },
  title: {
    fontSize: isSmallScreen ? 26 : isTablet ? 36 : 30,
    fontWeight: "800",
    color: "#B19CD9",
    flex: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: isSmallScreen ? 13 : isTablet ? 17 : 15,
    color: "#999",
    textAlign: "center",
    marginBottom: isSmallScreen ? 20 : isTablet ? 28 : 24,
    paddingHorizontal: isTablet ? 20 : 0,
  },
  playerSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: isSmallScreen ? 20 : isTablet ? 28 : 24,
  },
  playerTab: {
    flex: 1,
    paddingVertical: isSmallScreen ? 10 : 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activePlayerTab: {
    backgroundColor: "#B19CD9",
  },
  playerTabText: {
    fontSize: isSmallScreen ? 14 : isTablet ? 17 : 15,
    fontWeight: "600",
    color: "#999",
  },
  activePlayerTabText: {
    color: "#FFF",
  },
  setupSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: isSmallScreen ? 16 : isTablet ? 24 : 18,
    marginBottom: isSmallScreen ? 20 : isTablet ? 28 : 24,
  },
  inputGroup: {
    marginBottom: isSmallScreen ? 18 : isTablet ? 26 : 22,
  },
  lastInputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: isSmallScreen ? 12 : isTablet ? 15 : 13,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: isSmallScreen ? 6 : 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: isSmallScreen ? 12 : isTablet ? 18 : 14,
    fontSize: isSmallScreen ? 14 : isTablet ? 17 : 15,
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
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    marginRight: GAP_SIZE,
    marginBottom: GAP_SIZE,
  },
  avatarButtonLastInRow: {
    marginRight: 0,
  },
  avatarButtonLastRow: {
    marginBottom: 0,
  },
  activeAvatarButton: {
    borderColor: "#B19CD9",
    backgroundColor: "rgba(177,156,217,0.15)",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  colorButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    marginRight: GAP_SIZE,
    marginBottom: GAP_SIZE,
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
    marginTop: isSmallScreen ? 24 : isTablet ? 32 : 28,
    paddingTop: isSmallScreen ? 20 : isTablet ? 28 : 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(177,156,217,0.15)",
  },
  startButton: {
    backgroundColor: "#B19CD9",
    borderRadius: 12,
    padding: isSmallScreen ? 14 : isTablet ? 20 : 16,
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "#444",
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 20 : 17,
    fontWeight: "700",
    color: "#FFF",
  },
});
