import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { allDecks } from "../data/decks";
import { Deck } from "../types/deck";
import { getUnlockedDecks } from "../utils/deckStorage";
import { hexToRgba } from "../utils/colorUtils";
import { useGame } from "../contexts/GameContext";
import { COLORS } from "../constants/colors";
import {
  getDeckIconSource,
  isImageIcon,
  getBadgeIconSource,
} from "../utils/deckIcons";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const getCardDimensions = (width: number) => {
  const CARDS_PER_ROW = 1;
  const screenPadding = width >= 768 ? 32 : scale(16);
  const gap = scale(16);
  const availableWidth = width - screenPadding * 2;
  const cardWidth = availableWidth;
  const cardHeight = width >= 768 ? scale(180) : scale(160);
  return {
    width: Math.floor(cardWidth),
    height: Math.floor(cardHeight),
    cardsPerRow: CARDS_PER_ROW,
    gap: gap,
    lockIconSize: width >= 768 ? scale(24) : scale(32),
    lockIconBorderRadius: width >= 768 ? scale(12) : scale(16),
    lockIconBorderWidth: width >= 768 ? 1.5 : 2,
    lockIconIconSize: width >= 768 ? 14 : 18,
  };
};

interface DecksLibraryScreenProps {
  onSelectDeck: (deck: Deck) => void;
  onBack?: () => void;
  onClose?: () => void;
  isEditing?: boolean;
}

export const DecksLibraryScreen: React.FC<DecksLibraryScreenProps> = ({
  onSelectDeck,
  onBack,
  onClose,
  isEditing = false,
}) => {
  const { width } = useWindowDimensions();
  const { gameState } = useGame();
  const [unlockedDecks, setUnlockedDecks] = useState<string[]>([]);

  const cardDimensions = useMemo(() => getCardDimensions(width), [width]);

  useEffect(() => {
    loadUnlockedDecks();
  }, []);

  const loadUnlockedDecks = async () => {
    const unlocked = await getUnlockedDecks();
    setUnlockedDecks(unlocked);
  };

  const handleDeckPress = (deck: Deck) => {
    onSelectDeck(deck);
  };

  const player1Name = gameState.player1Info.name || "Player 1";
  const player2Name = gameState.player2Info.name || "Player 2";

  const stylesMemo = useMemo(() => createStyles(width), [width]);

  return (
    <SafeAreaView style={stylesMemo.container} edges={["top", "bottom"]}>
      <View style={stylesMemo.header}>
        {onBack && !isEditing && (
          <TouchableOpacity onPress={onBack} style={stylesMemo.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {!onBack && !isEditing && <View style={stylesMemo.placeholder} />}
        <View style={stylesMemo.titleContainer}>
          <Text style={stylesMemo.title}>
            {player1Name} & {player2Name}
          </Text>
          <Text style={stylesMemo.subtitle}>Choose a Deck</Text>
        </View>
        {isEditing && onClose ? (
          <TouchableOpacity
            style={stylesMemo.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={stylesMemo.placeholder} />
        )}
      </View>

      <ScrollView
        style={stylesMemo.scrollView}
        contentContainerStyle={stylesMemo.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={stylesMemo.cardsGrid}>
          {allDecks.map((deck, index) => {
            const isUnlocked =
              unlockedDecks.includes(deck.id) || deck.isDefault;
            return (
              <TouchableOpacity
                key={deck.id}
                style={[
                  stylesMemo.deckCard,
                  {
                    width: cardDimensions.width,
                    height: cardDimensions.height,
                    marginBottom: cardDimensions.gap,
                  },
                  !isUnlocked && stylesMemo.deckCardLocked,
                ]}
                onPress={() => handleDeckPress(deck)}
                activeOpacity={0.7}
              >
                <View style={stylesMemo.cardContent}>
                  <View style={stylesMemo.cardTopSection}>
                    <View
                      style={[
                        stylesMemo.deckIconContainer,
                        {
                          width: width >= 768 ? scale(80) : scale(70),
                          height: width >= 768 ? scale(80) : scale(70),
                          borderRadius: width >= 768 ? scale(40) : scale(35),
                        },
                        isUnlocked && stylesMemo.deckIconContainerUnlocked,
                      ]}
                    >
                      {isImageIcon(deck.icon) ? (
                        <Image
                          source={getDeckIconSource(deck.icon)}
                          style={{
                            width: width >= 768 ? scale(64) : scale(56),
                            height: width >= 768 ? scale(64) : scale(56),
                            opacity: isUnlocked ? 1 : 0.5,
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <MaterialIcons
                          name={deck.icon as any}
                          size={width >= 768 ? scale(40) : scale(36)}
                          color={isUnlocked ? COLORS.primary : "#666"}
                        />
                      )}
                      {!isUnlocked && (
                        <View
                          style={[
                            styles.videoOverlay,
                            {
                              width: cardDimensions.lockIconSize,
                              height: cardDimensions.lockIconSize,
                              borderRadius: cardDimensions.lockIconBorderRadius,
                              borderWidth: cardDimensions.lockIconBorderWidth,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.videoOverlayInner,
                              {
                                borderRadius:
                                  cardDimensions.lockIconBorderRadius,
                              },
                            ]}
                          />
                          <MaterialIcons
                            name="lock"
                            size={moderateScale(
                              cardDimensions.lockIconIconSize
                            )}
                            color="#fff"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={stylesMemo.textContainer}>
                    <View style={stylesMemo.deckNameContainer}>
                      <Text
                        style={[
                          stylesMemo.deckName,
                          !isUnlocked && stylesMemo.deckNameLocked,
                        ]}
                      >
                        {deck.name}
                      </Text>
                    </View>
                    <View style={stylesMemo.deckCountContainer}>
                      <MaterialIcons
                        name="style"
                        size={moderateScale(12)}
                        color={isUnlocked ? "#999" : "#666"}
                      />
                      <Text
                        style={[
                          stylesMemo.deckCount,
                          !isUnlocked && stylesMemo.deckCountLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {deck.cards.length} cards
                      </Text>
                    </View>
                    {deck.nsfw !== undefined && (
                      <View style={stylesMemo.badgeContainer}>
                        <Image
                          source={getBadgeIconSource(deck.nsfw)}
                          style={stylesMemo.badgeIcon}
                          resizeMode="contain"
                        />
                        <Text
                          style={[
                            stylesMemo.badgeText,
                            !isUnlocked && stylesMemo.badgeTextLocked,
                          ]}
                        >
                          {deck.nsfw ? "Spicy" : "Classic"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingVertical: verticalScale(14),
    },
    backButton: {
      padding: 8,
    },
    closeButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      alignItems: "center",
      flex: 1,
      gap: verticalScale(6),
    },
    title: {
      fontSize: moderateScale(26),
      fontWeight: "700",
      color: COLORS.primary,
    },
    subtitle: {
      fontSize: moderateScale(26),
      fontWeight: "700",
      color: "#fff",
    },
    placeholder: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingBottom: verticalScale(28),
    },
    cardsGrid: {
      width: "100%",
    },
    deckCard: {
      backgroundColor: hexToRgba(COLORS.primary, 0.12),
      borderRadius: scale(24),
      padding: width >= 768 ? scale(8) : scale(16),
      borderWidth: 2,
      borderColor: hexToRgba(COLORS.primary, 0.25),
      overflow: "hidden",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    cardContent: {
      width: "100%",
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: width >= 768 ? scale(20) : scale(16),
    },
    cardTopSection: {
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginRight: width >= 768 ? scale(20) : scale(16),
    },
    badgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(4),
      width: width >= 768 ? scale(90) : scale(80),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      backgroundColor: hexToRgba(COLORS.primary, 0.1),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.15),
    },
    badgeIcon: {
      width: moderateScale(16),
      height: moderateScale(16),
    },
    badgeText: {
      fontSize: moderateScale(10),
      fontWeight: "600",
      color: COLORS.primary,
      letterSpacing: 0.5,
    },
    badgeTextLocked: {
      color: "#666",
    },
    deckCardLocked: {
      backgroundColor: hexToRgba("#333", 0.15),
      borderColor: hexToRgba("#666", 0.2),
      shadowColor: "#000",
      shadowOpacity: 0.1,
    },
    deckIconContainer: {
      backgroundColor: hexToRgba(COLORS.primary, 0.15),
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      flexShrink: 0,
      borderWidth: 2,
      borderColor: hexToRgba(COLORS.primary, 0.2),
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    deckIconContainerUnlocked: {
      borderColor: hexToRgba(COLORS.primary, 0.4),
      backgroundColor: hexToRgba(COLORS.primary, 0.2),
    },
    textContainer: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      minHeight: 0,
    },
    videoOverlay: {
      position: "absolute",
      bottom: -scale(2),
      right: -scale(2),
      backgroundColor: COLORS.primary,
      borderColor: hexToRgba(COLORS.primary, 0.8),
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 5,
    },
    videoOverlayInner: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: hexToRgba(COLORS.primary, 0.2),
    },
    deckNameContainer: {
      width: "100%",
      marginBottom: verticalScale(8),
    },
    deckName: {
      fontSize: width >= 768 ? moderateScale(20) : moderateScale(18),
      fontWeight: "700",
      color: "#fff",
      textAlign: "left",
      width: "100%",
      lineHeight: width >= 768 ? moderateScale(26) : moderateScale(24),
      letterSpacing: 0.3,
    },
    deckNameLocked: {
      color: "#aaa",
    },
    deckCountContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: scale(4),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      backgroundColor: hexToRgba(COLORS.primary, 0.1),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.15),
      marginBottom: verticalScale(6),
    },
    deckCount: {
      fontSize: moderateScale(12),
      color: "#999",
      fontWeight: "600",
      textAlign: "center",
      flexShrink: 0,
    },
    deckCountLocked: {
      color: "#666",
    },
  });

const styles = createStyles(0); // Will be recalculated in component
