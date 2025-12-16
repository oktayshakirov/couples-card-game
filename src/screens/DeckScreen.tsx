import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import { isDeckUnlocked, unlockDeck } from "../utils/deckStorage";
import {
  showRewardedAd,
  ensureRewardedLoaded,
} from "../components/ads/RewardedAd";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface DeckScreenProps {
  deck: Deck;
  onSelectDeck: (deck: Deck) => void;
  onBack: () => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({
  deck,
  onSelectDeck,
  onBack,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    checkUnlockStatus();
    preloadAd();
  }, [deck.id]);

  const checkUnlockStatus = async () => {
    const isUnlocked = await isDeckUnlocked(deck.id);
    setUnlocked(isUnlocked || deck.isDefault || false);
    setLoading(false);
  };

  const preloadAd = async () => {
    if (!deck.isDefault) {
      try {
        await ensureRewardedLoaded();
      } catch {}
    }
  };

  const handleUnlock = async () => {
    if (unlocking) return;

    setUnlocking(true);
    try {
      const success = await showRewardedAd(async (reward) => {
        await unlockDeck(deck.id);
        setUnlocked(true);
      });

      if (!success) {
        setUnlocking(false);
      }
    } catch {
      setUnlocking(false);
    }
  };

  const handleSelectDeck = () => {
    if (unlocked || deck.isDefault) {
      onSelectDeck(deck);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const canSelect = unlocked || deck.isDefault;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{deck.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deckHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={deck.icon as any}
              size={isTablet ? 64 : 56}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.deckName}>{deck.name}</Text>
          <Text style={styles.deckDescription}>{deck.description}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialIcons name="style" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{deck.cards.length} Cards</Text>
            </View>
          </View>
        </View>

        {!canSelect && (
          <View style={styles.lockedContainer}>
            <MaterialIcons name="lock" size={isTablet ? 64 : 56} color="#666" />
            <Text style={styles.lockedTitle}>Deck Locked</Text>
            <Text style={styles.lockedDescription}>
              Watch a short ad to unlock this deck
            </Text>
            <TouchableOpacity
              style={[
                styles.unlockButton,
                unlocking && styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons
                    name="play-circle-filled"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.unlockButtonText}>
                    Watch Ad to Unlock
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {canSelect && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.cardsList}>
              {deck.cards.slice(0, 5).map((card, index) => (
                <View key={card.id} style={styles.cardPreview}>
                  <View style={styles.cardPreviewHeader}>
                    <Text style={styles.cardPreviewLabel}>TRUTH</Text>
                    <Text style={styles.cardPreviewNumber}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.cardPreviewText} numberOfLines={2}>
                    {card.truth
                      .replace(/{player1}/g, "You")
                      .replace(/{player2}/g, "Partner")}
                  </Text>
                  <View style={styles.cardPreviewDivider} />
                  <View style={styles.cardPreviewHeader}>
                    <Text style={styles.cardPreviewLabel}>DARE</Text>
                  </View>
                  <Text style={styles.cardPreviewText} numberOfLines={2}>
                    {card.dare
                      .replace(/{player1}/g, "You")
                      .replace(/{player2}/g, "Partner")}
                  </Text>
                </View>
              ))}
              {deck.cards.length > 5 && (
                <Text style={styles.moreCardsText}>
                  +{deck.cards.length - 5} more cards
                </Text>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.selectButton,
            !canSelect && styles.selectButtonDisabled,
          ]}
          onPress={handleSelectDeck}
          disabled={!canSelect}
        >
          <Text style={styles.selectButtonText}>
            {canSelect ? "Select This Deck" : "Unlock to Select"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  title: {
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
  deckHeader: {
    alignItems: "center",
    marginBottom: isSmallScreen ? 24 : isTablet ? 40 : 32,
  },
  iconContainer: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: hexToRgba("#FF6B9D", 0.2),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
  },
  deckName: {
    fontSize: isSmallScreen ? 28 : isTablet ? 40 : 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: isSmallScreen ? 8 : 12,
  },
  deckDescription: {
    fontSize: isSmallScreen ? 15 : isTablet ? 20 : 17,
    color: "#ccc",
    textAlign: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
    paddingHorizontal: isTablet ? 40 : 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: isTablet ? 24 : 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
    color: "#fff",
    fontWeight: "600",
  },
  lockedContainer: {
    alignItems: "center",
    backgroundColor: hexToRgba("#666", 0.1),
    borderRadius: isSmallScreen ? 16 : isTablet ? 24 : 20,
    padding: isSmallScreen ? 24 : isTablet ? 40 : 32,
    marginBottom: isSmallScreen ? 20 : isTablet ? 32 : 24,
    borderWidth: 2,
    borderColor: hexToRgba("#666", 0.3),
  },
  lockedTitle: {
    fontSize: isSmallScreen ? 22 : isTablet ? 32 : 26,
    fontWeight: "700",
    color: "#fff",
    marginTop: isSmallScreen ? 16 : isTablet ? 24 : 20,
    marginBottom: isSmallScreen ? 8 : 12,
  },
  lockedDescription: {
    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: isSmallScreen ? 20 : isTablet ? 32 : 24,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: isSmallScreen ? 12 : isTablet ? 16 : 14,
    paddingVertical: isSmallScreen ? 14 : isTablet ? 18 : 16,
    paddingHorizontal: isSmallScreen ? 24 : isTablet ? 32 : 28,
    gap: 8,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
    fontWeight: "700",
    color: "#fff",
  },
  previewContainer: {
    marginBottom: isSmallScreen ? 20 : isTablet ? 32 : 24,
  },
  previewTitle: {
    fontSize: isSmallScreen ? 20 : isTablet ? 28 : 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
  },
  cardsList: {
    gap: isSmallScreen ? 12 : isTablet ? 20 : 16,
  },
  cardPreview: {
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    borderRadius: isSmallScreen ? 12 : isTablet ? 16 : 14,
    padding: isSmallScreen ? 14 : isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.3),
  },
  cardPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 6 : 8,
  },
  cardPreviewLabel: {
    fontSize: isSmallScreen ? 10 : isTablet ? 12 : 11,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
  },
  cardPreviewNumber: {
    fontSize: isSmallScreen ? 10 : isTablet ? 12 : 11,
    fontWeight: "600",
    color: "#999",
  },
  cardPreviewText: {
    fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14,
    color: "#fff",
    fontWeight: "600",
    marginBottom: isSmallScreen ? 8 : 10,
  },
  cardPreviewDivider: {
    height: 1,
    backgroundColor: hexToRgba("#FF6B9D", 0.2),
    marginVertical: isSmallScreen ? 8 : 10,
  },
  moreCardsText: {
    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: isSmallScreen ? 8 : 12,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: isSmallScreen ? 12 : isTablet ? 16 : 14,
    paddingVertical: isSmallScreen ? 16 : isTablet ? 20 : 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: isSmallScreen ? 8 : 12,
  },
  selectButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20,
    fontWeight: "700",
    color: "#fff",
  },
});
