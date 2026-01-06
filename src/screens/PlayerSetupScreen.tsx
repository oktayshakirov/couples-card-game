import React, { useState, useMemo, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar, PlayerInfo, PlayerColor } from "../hooks/useGameState";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { allDecks } from "../data/decks";
import { getUnlockedDecks } from "../utils/deckStorage";
import { ensureRewardedLoaded } from "../components/ads/RewardedAd";

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
  { value: "face-man", icon: "face-man" },
  { value: "face-woman", icon: "face-woman" },
  { value: "cat", icon: "cat" },
  { value: "dog", icon: "dog" },
  { value: "alien", icon: "alien" },
  { value: "account-cowboy-hat", icon: "account-cowboy-hat" },
  { value: "skull", icon: "skull" },
  { value: "flower", icon: "flower" },
  { value: "paw", icon: "paw" },
  { value: "heart", icon: "heart" },
];

const colors: PlayerColor[] = [
  "#B19CD9",
  "#7FCDCD",
  "#8DB4D4",
  "#E8E8E8",
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
  const { width, height } = useWindowDimensions();
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (width > 0 && height > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [width, height]);

  useEffect(() => {
    const preloadRewardedAd = async () => {
      try {
        const unlocked = await getUnlockedDecks();
        const hasLockedDecks = allDecks.some(
          (deck) => !deck.isDefault && !unlocked.includes(deck.id)
        );

        if (hasLockedDecks) {
          ensureRewardedLoaded().catch(() => {});
        }
      } catch {}
    };

    preloadRewardedAd();
  }, []);

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
      if (activePlayer === 1) {
        return "Continue";
      }
      return "Save & Continue";
    }
    if (activePlayer === 1) {
      return "Continue";
    }
    return "Start Game";
  };

  const getButtonIcon = () => {
    if (activePlayer === 1) {
      return "arrow-forward";
    }
    return "play-arrow";
  };

  const handleButtonPress = () => {
    if (isEditing) {
      if (activePlayer === 1) {
        setActivePlayer(2);
      } else {
        onStartGame();
      }
    } else if (activePlayer === 1) {
      setActivePlayer(2);
    } else {
      onStartGame();
    }
  };

  const isButtonDisabled = () => {
    if (isEditing) {
      if (activePlayer === 1) {
        return !canContinue;
      }
      return !canStartGame;
    }
    if (activePlayer === 1) {
      return !canContinue;
    }
    return !canStartGame;
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        edges={["top", "bottom"]}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.background,
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
            <MaterialIcons
              name="close"
              size={moderateScale(24)}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={stylesMemo.headerSpacer} />
        )}
      </View>

      <ScrollView
        style={stylesMemo.scrollView}
        contentContainerStyle={stylesMemo.scrollContent}
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

            <View style={stylesMemo.setupCard}>
              <View style={stylesMemo.section}>
                <View style={stylesMemo.playerIndicatorContainer}>
                  <TouchableOpacity
                    style={stylesMemo.playerIndicator}
                    onPress={() => setActivePlayer(1)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="person"
                      size={moderateScale(18)}
                      color={activePlayer === 1 ? player1Info.color : "#666"}
                    />
                    <Text
                      style={[
                        stylesMemo.playerIndicatorText,
                        activePlayer === 1 &&
                          stylesMemo.playerIndicatorTextActive,
                      ]}
                    >
                      Player 1
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={stylesMemo.playerIndicator}
                    onPress={() => setActivePlayer(2)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="person"
                      size={moderateScale(18)}
                      color={activePlayer === 2 ? player2Info.color : "#666"}
                    />
                    <Text
                      style={[
                        stylesMemo.playerIndicatorText,
                        activePlayer === 2 &&
                          stylesMemo.playerIndicatorTextActive,
                      ]}
                    >
                      Player 2
                    </Text>
                  </TouchableOpacity>
                </View>
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
                      <MaterialCommunityIcons
                        name={avatar.icon as any}
                        size={iconSize}
                        color={
                          currentInfo.avatar === avatar.value
                            ? currentInfo.color
                            : COLORS.text.secondary
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
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View
        style={[
          stylesMemo.buttonContainer,
          { paddingBottom: Math.max(insets.bottom, verticalScale(16)) },
        ]}
      >
        <TouchableOpacity
          style={[
            stylesMemo.actionButton,
            isButtonDisabled() && stylesMemo.actionButtonDisabled,
          ]}
          onPress={handleButtonPress}
          disabled={isButtonDisabled()}
        >
          <Text style={stylesMemo.actionButtonText}>{getButtonText()}</Text>
          {activePlayer === 1 && (
            <MaterialIcons
              name={getButtonIcon() as any}
              size={moderateScale(width >= 768 ? 16 : 20)}
              color={COLORS.text.primary}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (width: number) => {
  const isTablet = width >= 768;
  const padding = isTablet ? scale(32) : scale(20);
  const cardPadding = isTablet ? scale(24) : scale(20);
  const maxContentWidth = isTablet ? 600 : width - padding * 2;

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
      paddingBottom: verticalScale(20),
    },
    subtitle: {
      fontSize: moderateScale(14),
      color: COLORS.text.secondary,
      textAlign: "center",
      marginBottom: verticalScale(12),
    },
    playerIndicatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(16),
      gap: scale(16),
    },
    playerIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    playerIndicatorText: {
      fontSize: moderateScale(13),
      fontWeight: "500",
      color: "#666",
    },
    playerIndicatorTextActive: {
      color: COLORS.text.primary,
      fontWeight: "600",
    },
    setupCard: {
      backgroundColor: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: cardPadding,
      marginBottom: verticalScale(20),
      maxWidth: maxContentWidth,
      alignSelf: "center",
      width: "100%",
    },
    section: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: COLORS.text.primary,
      marginBottom: verticalScale(12),
    },
    input: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: scale(14),
      fontSize: moderateScale(16),
      color: COLORS.text.primary,
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
      borderColor: COLORS.text.primary,
      transform: [{ scale: 1.1 }],
    },
    buttonContainer: {
      paddingHorizontal: padding,
      paddingTop: verticalScale(16),
    },
    actionButton: {
      flexDirection: "row",
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: isTablet ? scale(12) : scale(16),
      alignItems: "center",
      justifyContent: "center",
      gap: isTablet ? scale(6) : scale(8),
      maxWidth: maxContentWidth,
      alignSelf: "center",
      width: "100%",
    },
    actionButtonDisabled: {
      backgroundColor: "#444",
      opacity: 0.5,
    },
    actionButtonText: {
      fontSize: moderateScale(isTablet ? 15 : 17),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.background,
    },
  });

  return {
    styles,
    iconSize,
  };
};
