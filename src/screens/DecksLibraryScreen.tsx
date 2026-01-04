import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { allDecks } from "../data/decks";
import { Deck } from "../types/deck";
import { getUnlockedDecks } from "../utils/deckStorage";
import { useGame } from "../contexts/GameContext";
import { COLORS } from "../constants/colors";
import { DeckPack } from "../components/DeckPack";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { hexToRgba } from "../utils/colorUtils";

const getCardDimensions = (width: number) => {
  const CARDS_PER_ROW = 1;
  const screenPadding = width >= 768 ? 32 : scale(16);
  const gap = scale(16);
  const availableWidth = width - screenPadding * 2;
  const cardWidth = availableWidth;
  const cardHeight = width >= 768 ? scale(220) : scale(200);
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

  const sortedDecks = useMemo(() => {
    return [...allDecks].sort((a, b) => {
      const aIsUnlocked = unlockedDecks.includes(a.id) || !!a.isDefault;
      const bIsUnlocked = unlockedDecks.includes(b.id) || !!b.isDefault;

      // Unlocked decks first (return -1), then locked decks (return 1)
      if (aIsUnlocked && !bIsUnlocked) return -1;
      if (!aIsUnlocked && bIsUnlocked) return 1;
      return 0; // Keep original order for same unlock status
    });
  }, [unlockedDecks]);

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
  const player1Avatar = gameState.player1Info.avatar;
  const player2Avatar = gameState.player2Info.avatar;
  const player1Color = gameState.player1Info.color;
  const player2Color = gameState.player2Info.color;

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
          <View style={stylesMemo.titleRow}>
            <View style={stylesMemo.playerNameContainer}>
              <View
                style={[
                  stylesMemo.avatarContainer,
                  {
                    backgroundColor: hexToRgba(player1Color, 0.15),
                    borderColor: player1Color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={player1Avatar as any}
                  size={moderateScale(width >= 768 ? 20 : 24)}
                  color={player1Color}
                />
              </View>
              <Text style={[stylesMemo.title, { color: player1Color }]}>
                {player1Name}
              </Text>
            </View>
            <Text style={stylesMemo.ampersand}>&</Text>
            <View style={stylesMemo.playerNameContainer}>
              <View
                style={[
                  stylesMemo.avatarContainer,
                  {
                    backgroundColor: hexToRgba(player2Color, 0.15),
                    borderColor: player2Color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={player2Avatar as any}
                  size={moderateScale(width >= 768 ? 20 : 24)}
                  color={player2Color}
                />
              </View>
              <Text style={[stylesMemo.title, { color: player2Color }]}>
                {player2Name}
              </Text>
            </View>
          </View>
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
          {sortedDecks.map((deck) => {
            const isUnlocked =
              unlockedDecks.includes(deck.id) || !!deck.isDefault;
            return (
              <DeckPack
                key={deck.id}
                deck={deck}
                isUnlocked={isUnlocked}
                onPress={handleDeckPress}
                cardDimensions={cardDimensions}
              />
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
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      flexWrap: "wrap",
    },
    playerNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    avatarContainer: {
      width: width >= 768 ? scale(32) : scale(36),
      height: width >= 768 ? scale(32) : scale(36),
      borderRadius: width >= 768 ? scale(16) : scale(18),
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: moderateScale(26),
      fontWeight: "700",
    },
    ampersand: {
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
  });
