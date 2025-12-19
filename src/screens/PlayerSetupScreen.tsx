import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
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
  const { width } = useWindowDimensions();
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const insets = useSafeAreaInsets();

  const currentInfo = activePlayer === 1 ? player1Info : player2Info;
  const updateCurrentPlayer =
    activePlayer === 1 ? onUpdatePlayer1 : onUpdatePlayer2;

  const canStartGame =
    player1Info.name.trim() !== "" && player2Info.name.trim() !== "";

  const canContinue = currentInfo.name.trim() !== "";

  const { stylesMemo, iconSize } = useMemo(() => {
    const result = createStyles(width);
    return { stylesMemo: result.styles, iconSize: result.iconSize };
  }, [width]);

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
    <SafeAreaView style={stylesMemo.container} edges={["top", "bottom"]}>
      <View style={stylesMemo.header}>
        <View style={stylesMemo.headerSpacer} />
        <Text style={stylesMemo.title}>
          {isEditing ? "Edit Players" : "Setup Players"}
        </Text>
        {isEditing && onClose ? (
          <TouchableOpacity
            style={stylesMemo.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={moderateScale(24)} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={stylesMemo.headerSpacer} />
        )}
      </View>

      <ScrollView
        style={stylesMemo.scrollView}
        contentContainerStyle={[
          stylesMemo.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text style={stylesMemo.subtitle}>
              {isEditing
                ? "Update your profiles and continue the game"
                : "Customize your profiles before starting the game"}
            </Text>

            <View style={stylesMemo.playerSelector}>
              <TouchableOpacity
                style={[
                  stylesMemo.playerTab,
                  activePlayer === 1 && stylesMemo.activePlayerTab,
                ]}
                onPress={() => setActivePlayer(1)}
              >
                <MaterialIcons
                  name="person"
                  size={moderateScale(18)}
                  color={activePlayer === 1 ? "#FFF" : "#999"}
                  style={stylesMemo.playerTabIcon}
                />
                <Text
                  style={[
                    stylesMemo.playerTabText,
                    activePlayer === 1 && stylesMemo.activePlayerTabText,
                  ]}
                >
                  Player 1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesMemo.playerTab,
                  activePlayer === 2 && stylesMemo.activePlayerTab,
                ]}
                onPress={() => setActivePlayer(2)}
              >
                <MaterialIcons
                  name="person"
                  size={moderateScale(18)}
                  color={activePlayer === 2 ? "#FFF" : "#999"}
                  style={stylesMemo.playerTabIcon}
                />
                <Text
                  style={[
                    stylesMemo.playerTabText,
                    activePlayer === 2 && stylesMemo.activePlayerTabText,
                  ]}
                >
                  Player 2
                </Text>
              </TouchableOpacity>
            </View>

            <View style={stylesMemo.setupCard}>
              <View style={stylesMemo.section}>
                <Text style={stylesMemo.label}>Name</Text>
                <TextInput
                  style={stylesMemo.input}
                  placeholder={`Enter Player ${activePlayer}'s name`}
                  placeholderTextColor="#666"
                  value={currentInfo.name}
                  onChangeText={(text) => updateCurrentPlayer({ name: text })}
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={stylesMemo.section}>
                <Text style={stylesMemo.label}>Avatar</Text>
                <View style={stylesMemo.optionsContainer}>
                  {avatars.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.value}
                      style={[
                        stylesMemo.optionButton,
                        currentInfo.avatar === avatar.value && [
                          stylesMemo.activeOptionButton,
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
                        size={iconSize}
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

              <View style={stylesMemo.section}>
                <Text style={stylesMemo.label}>Color</Text>
                <View style={stylesMemo.optionsContainer}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        stylesMemo.colorButton,
                        { backgroundColor: color },
                        currentInfo.color === color &&
                          stylesMemo.activeColorButton,
                      ]}
                      onPress={() => updateCurrentPlayer({ color })}
                    />
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                stylesMemo.actionButton,
                isButtonDisabled() && stylesMemo.actionButtonDisabled,
              ]}
              onPress={handleButtonPress}
              disabled={isButtonDisabled()}
            >
              <Text style={stylesMemo.actionButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (width: number) => {
  const isTablet = width >= 768;
  const padding = isTablet ? scale(32) : scale(20);
  const cardPadding = isTablet ? scale(24) : scale(20);
  const maxContentWidth = isTablet ? 600 : width - padding * 2;

  // Calculate button size: 5 items per row with consistent spacing
  const itemsPerRow = 5;
  const gap = isTablet ? scale(12) : scale(10);
  const availableWidth = maxContentWidth - cardPadding * 2;
  const totalGapWidth = gap * (itemsPerRow - 1);
  const buttonSize = Math.floor((availableWidth - totalGapWidth) / itemsPerRow);
  const iconSize = Math.floor(buttonSize * 0.5);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: padding,
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(4),
    },
    headerSpacer: {
      width: scale(44),
    },
    closeButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: "800",
      color: COLORS.primary,
      textAlign: "center",
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: padding,
      paddingTop: verticalScale(2),
    },
    subtitle: {
      fontSize: moderateScale(14),
      color: "#999",
      textAlign: "center",
      marginBottom: verticalScale(8),
    },
    playerSelector: {
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 12,
      padding: 4,
      marginBottom: verticalScale(20),
    },
    playerTab: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: verticalScale(12),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },
    activePlayerTab: {
      backgroundColor: COLORS.primary,
    },
    playerTabIcon: {
      marginRight: scale(6),
    },
    playerTabText: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      color: "#999",
    },
    activePlayerTabText: {
      color: "#FFF",
    },
    setupCard: {
      backgroundColor: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: cardPadding,
      marginBottom: verticalScale(24),
      maxWidth: maxContentWidth,
      alignSelf: "center",
      width: "100%",
    },
    section: {
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: "#FFF",
      marginBottom: verticalScale(12),
    },
    input: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: scale(14),
      fontSize: moderateScale(16),
      color: "#FFF",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: gap,
    },
    optionButton: {
      width: buttonSize,
      height: buttonSize,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: buttonSize / 2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.1)",
    },
    activeOptionButton: {
      borderWidth: 2,
    },
    colorButton: {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.2)",
    },
    activeColorButton: {
      borderWidth: 3,
      borderColor: "#FFF",
      transform: [{ scale: 1.1 }],
    },
    actionButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: scale(16),
      alignItems: "center",
      marginBottom: verticalScale(20),
      maxWidth: maxContentWidth,
      alignSelf: "center",
      width: "100%",
    },
    actionButtonDisabled: {
      backgroundColor: "#444",
      opacity: 0.5,
    },
    actionButtonText: {
      fontSize: moderateScale(17),
      fontWeight: "700",
      color: "#FFF",
    },
  });

  return {
    styles,
    iconSize,
  };
};
