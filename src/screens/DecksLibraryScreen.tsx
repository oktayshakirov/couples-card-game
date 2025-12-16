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

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

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
        {allDecks.map((deck) => {
          const isUnlocked = unlockedDecks.includes(deck.id) || deck.isDefault;
          return (
            <TouchableOpacity
              key={deck.id}
              style={[styles.deckCard, !isUnlocked && styles.deckCardLocked]}
              onPress={() => handleDeckPress(deck)}
              activeOpacity={0.7}
            >
              <View style={styles.deckIconContainer}>
                <MaterialIcons
                  name={deck.icon as any}
                  size={isTablet ? 48 : 40}
                  color={isUnlocked ? COLORS.primary : "#666"}
                />
              </View>
              <View style={styles.deckInfo}>
                <View style={styles.deckHeader}>
                  <Text style={styles.deckName}>{deck.name}</Text>
                  {!isUnlocked && (
                    <MaterialIcons name="lock" size={20} color="#666" />
                  )}
                </View>
                <Text style={styles.deckDescription}>{deck.description}</Text>
                <Text style={styles.deckCount}>{deck.cards.length} cards</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isUnlocked ? COLORS.primary : "#666"}
              />
            </TouchableOpacity>
          );
        })}
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
    paddingHorizontal: isTablet ? 32 : 16,
    paddingVertical: isSmallScreen ? 12 : 16,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    width: isSmallScreen ? 36 : isTablet ? 44 : 40,
    height: isSmallScreen ? 36 : isTablet ? 44 : 40,
    borderRadius: isSmallScreen ? 18 : isTablet ? 22 : 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
    gap: isSmallScreen ? 4 : isTablet ? 8 : 6,
  },
  title: {
    fontSize: isSmallScreen ? 22 : isTablet ? 32 : 26,
    fontWeight: "700",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: isSmallScreen ? 22 : isTablet ? 32 : 26,
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
    paddingHorizontal: isTablet ? 32 : 16,
    paddingBottom: isSmallScreen ? 20 : 32,
  },
  deckCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    borderRadius: isSmallScreen ? 16 : isTablet ? 24 : 20,
    padding: isSmallScreen ? 16 : isTablet ? 24 : 20,
    marginBottom: isSmallScreen ? 12 : isTablet ? 20 : 16,
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.3),
  },
  deckCardLocked: {
    backgroundColor: hexToRgba("#666", 0.1),
    borderColor: hexToRgba("#666", 0.2),
    opacity: 0.7,
  },
  deckIconContainer: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: isTablet ? 32 : 28,
    backgroundColor: hexToRgba(COLORS.primary, 0.2),
    alignItems: "center",
    justifyContent: "center",
    marginRight: isSmallScreen ? 12 : isTablet ? 20 : 16,
  },
  deckInfo: {
    flex: 1,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  deckName: {
    fontSize: isSmallScreen ? 18 : isTablet ? 26 : 22,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  deckDescription: {
    fontSize: isSmallScreen ? 13 : isTablet ? 18 : 15,
    color: "#ccc",
    marginBottom: 4,
  },
  deckCount: {
    fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
    color: "#999",
    fontWeight: "500",
  },
});
