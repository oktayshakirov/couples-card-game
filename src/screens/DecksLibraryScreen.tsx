import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { allDecks } from "../data/decks";
import { Deck } from "../types/deck";
import { getUnlockedDecks } from "../utils/deckStorage";
import { hexToRgba } from "../utils/colorUtils";
import { useGame } from "../contexts/GameContext";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

const CARDS_PER_ROW = width >= 768 ? 3 : 2;
const getCardDimensions = () => {
  const screenPadding = width >= 768 ? 32 : scale(16);
  const gap = scale(16);
  const availableWidth = width - screenPadding * 2;
  const totalGapWidth = gap * (CARDS_PER_ROW - 1);
  const cardWidth = (availableWidth - totalGapWidth) / CARDS_PER_ROW;
  const cardHeight = cardWidth * 1.3;
  return {
    width: Math.floor(cardWidth),
    height: Math.floor(cardHeight),
  };
};

const CARD_DIMENSIONS = getCardDimensions();
const CARD_GAP = scale(16);

const LOCK_ICON_SIZE = width >= 768 ? scale(24) : scale(32);
const LOCK_ICON_BORDER_RADIUS = width >= 768 ? scale(12) : scale(16);
const LOCK_ICON_BORDER_WIDTH = width >= 768 ? 1.5 : 2;
const LOCK_ICON_ICON_SIZE = width >= 768 ? 14 : 18;

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
  const { gameState } = useGame();
  const [unlockedDecks, setUnlockedDecks] = useState<string[]>([]);

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

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        {onBack && !isEditing && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {!onBack && !isEditing && <View style={styles.placeholder} />}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {player1Name} & {player2Name}
          </Text>
          <Text style={styles.subtitle}>Choose a Deck</Text>
        </View>
        {isEditing && onClose ? (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsGrid}>
          {allDecks.map((deck, index) => {
            const isUnlocked =
              unlockedDecks.includes(deck.id) || deck.isDefault;
            const isLastInRow = (index + 1) % CARDS_PER_ROW === 0;
            return (
              <TouchableOpacity
                key={deck.id}
                style={[
                  styles.deckCard,
                  !isUnlocked && styles.deckCardLocked,
                  isLastInRow && styles.deckCardLastInRow,
                ]}
                onPress={() => handleDeckPress(deck)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTopSection}>
                    <View
                      style={[
                        styles.deckIconContainer,
                        isUnlocked && styles.deckIconContainerUnlocked,
                      ]}
                    >
                      <MaterialIcons
                        name={deck.icon as any}
                        size={moderateScale(CARD_DIMENSIONS.width * 0.24)}
                        color={isUnlocked ? COLORS.primary : "#666"}
                      />
                      {!isUnlocked && (
                        <View style={styles.videoOverlay}>
                          <View style={styles.videoOverlayInner} />
                          <MaterialIcons
                            name="lock"
                            size={moderateScale(LOCK_ICON_ICON_SIZE)}
                            color="#fff"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.deckNameContainer}>
                      <Text
                        style={[
                          styles.deckName,
                          !isUnlocked && styles.deckNameLocked,
                        ]}
                      >
                        {deck.name}
                      </Text>
                    </View>
                    <View style={styles.deckCountContainer}>
                      <MaterialIcons
                        name="style"
                        size={moderateScale(12)}
                        color={isUnlocked ? "#999" : "#666"}
                      />
                      <Text
                        style={[
                          styles.deckCount,
                          !isUnlocked && styles.deckCountLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {deck.cards.length} cards
                      </Text>
                    </View>
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

const styles = StyleSheet.create({
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
    height: verticalScale(40),
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  deckCard: {
    width: CARD_DIMENSIONS.width,
    height: CARD_DIMENSIONS.height,
    backgroundColor: hexToRgba(COLORS.primary, 0.12),
    borderRadius: scale(24),
    padding: scale(16),
    marginRight: CARD_GAP,
    marginBottom: CARD_GAP,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTopSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deckCardLastInRow: {
    marginRight: 0,
  },
  deckCardLocked: {
    backgroundColor: hexToRgba("#333", 0.15),
    borderColor: hexToRgba("#666", 0.2),
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  deckIconContainer: {
    width: CARD_DIMENSIONS.width * 0.5,
    height: CARD_DIMENSIONS.width * 0.5,
    borderRadius: (CARD_DIMENSIONS.width * 0.5) / 2,
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
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(4),
    minHeight: 0,
  },
  videoOverlay: {
    position: "absolute",
    bottom: -scale(2),
    right: -scale(2),
    width: LOCK_ICON_SIZE,
    height: LOCK_ICON_SIZE,
    borderRadius: LOCK_ICON_BORDER_RADIUS,
    backgroundColor: COLORS.primary,
    borderWidth: LOCK_ICON_BORDER_WIDTH,
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
    borderRadius: LOCK_ICON_BORDER_RADIUS,
    backgroundColor: hexToRgba(COLORS.primary, 0.2),
  },
  deckNameContainer: {
    width: "100%",
    height: moderateScale(44),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  deckName: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: scale(4),
    lineHeight: moderateScale(22),
    letterSpacing: 0.3,
  },
  deckNameLocked: {
    color: "#aaa",
  },
  deckCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.15),
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
