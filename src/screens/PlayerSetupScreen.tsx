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
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar, PlayerInfo, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";

const { width } = Dimensions.get("window");

interface PlayerSetupScreenProps {
  player1Info: PlayerInfo;
  player2Info: PlayerInfo;
  onUpdatePlayer1: (info: Partial<PlayerInfo>) => void;
  onUpdatePlayer2: (info: Partial<PlayerInfo>) => void;
  onStartGame: () => void;
  isEditing?: boolean;
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
];

const colors: PlayerColor[] = [
  "#FF6B6B", // Red/Pink
  "#4A90E2", // Blue
  "#50C878", // Green
  "#808080", // Grey
  "#FF69B4", // Hot Pink
  "#9B59B6", // Purple
  "#FF8C00", // Orange
  "#00CED1", // Turquoise
];

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  player1Info,
  player2Info,
  onUpdatePlayer1,
  onUpdatePlayer2,
  onStartGame,
  isEditing = false,
}) => {
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  const currentInfo = activePlayer === 1 ? player1Info : player2Info;
  const updateCurrentPlayer =
    activePlayer === 1 ? onUpdatePlayer1 : onUpdatePlayer2;

  const canStartGame =
    player1Info.name.trim() !== "" && player2Info.name.trim() !== "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: currentInfo.color }]}>
          {isEditing ? "Edit Players" : "Setup Players"}
        </Text>
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
            />
          </View>

          {/* Avatar Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarContainer}>
              {avatars.map((avatar) => (
                <TouchableOpacity
                  key={avatar.value}
                  style={[
                    styles.avatarButton,
                    currentInfo.avatar === avatar.value && [
                      styles.activeAvatarButton,
                      {
                        borderColor: currentInfo.color,
                        backgroundColor: hexToRgba(currentInfo.color, 0.15),
                      },
                    ],
                  ]}
                  onPress={() => updateCurrentPlayer({ avatar: avatar.value })}
                >
                  <MaterialIcons
                    name={avatar.icon as any}
                    size={32}
                    color={
                      currentInfo.avatar === avatar.value
                        ? currentInfo.color
                        : "#999"
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    currentInfo.color === color && styles.activeColorButton,
                    { backgroundColor: color },
                    currentInfo.color === color && {
                      borderWidth: 3,
                      borderColor: "#FFF",
                    },
                  ]}
                  onPress={() => updateCurrentPlayer({ color })}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Game Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !canStartGame && styles.startButtonDisabled,
            canStartGame && { backgroundColor: currentInfo.color },
          ]}
          onPress={onStartGame}
          disabled={!canStartGame}
        >
          <Text style={styles.startButtonText}>
            {isEditing ? "Save & Continue" : "Start Game"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  playerSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  playerTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activePlayerTab: {
    backgroundColor: "#FF6B6B",
  },
  playerTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  activePlayerTabText: {
    color: "#FFF",
  },
  setupSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  avatarButton: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeAvatarButton: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255,107,107,0.15)",
  },
  colorContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  activeColorButton: {
    transform: [{ scale: 1.15 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#1a0a0f",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,107,107,0.15)",
  },
  startButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "#444",
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
});
