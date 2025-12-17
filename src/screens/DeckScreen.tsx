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
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import { isDeckUnlocked, unlockDeck } from "../utils/deckStorage";
import {
  showRewardedAd,
  ensureRewardedLoaded,
  isRewardedReady,
} from "../components/ads/RewardedAd";
import {
  showGlobalInterstitial,
  trackRewardedAdShown,
} from "../components/ads/adsManager";
import { ensureInterstitialLoaded } from "../components/ads/InterstitialAd";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface DeckScreenProps {
  deck: Deck;
  onSelectDeck: (deck: Deck) => void;
  onDeckUnlocked?: (deck: Deck) => void;
  onBack: () => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({
  deck,
  onSelectDeck,
  onDeckUnlocked,
  onBack,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [adReady, setAdReady] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    checkUnlockStatus();
    checkConnectivity();
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => {
      unsubscribe();
    };
  }, [deck.id]);

  useEffect(() => {
    if (!loading) {
      preloadAd();
    }
  }, [loading, unlocked]);

  useEffect(() => {
    if (!unlocked && !deck.isDefault && !loading) {
      checkAdReady();
      const interval = setInterval(() => {
        checkAdReady();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [unlocked, loading, deck.isDefault]);

  const checkUnlockStatus = async () => {
    const isUnlocked = await isDeckUnlocked(deck.id);
    setUnlocked(isUnlocked || deck.isDefault || false);
    setLoading(false);
  };

  const checkConnectivity = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected ?? false);
    } catch {
      setIsOnline(false);
    }
  };

  const checkAdReady = async () => {
    if (isRewardedReady()) {
      setAdReady(true);
      setAdLoading(false);
    } else {
      setAdReady(false);
      if (!adLoading) {
        setAdLoading(true);
        try {
          await ensureRewardedLoaded();
          if (isRewardedReady()) {
            setAdReady(true);
          }
        } catch {
          setAdReady(false);
        } finally {
          setAdLoading(false);
        }
      }
    }
  };

  const preloadAd = async () => {
    if (unlocked || deck.isDefault) {
      try {
        await ensureInterstitialLoaded();
      } catch {}
    } else {
      setAdLoading(true);
      try {
        await ensureRewardedLoaded();
        setAdReady(isRewardedReady());
      } catch {
        setAdReady(false);
      } finally {
        setAdLoading(false);
      }
    }
  };

  const handleUnlock = async () => {
    if (unlocking || !isOnline || !adReady) return;

    if (!isRewardedReady()) {
      setAdLoading(true);
      try {
        await ensureRewardedLoaded();
        if (!isRewardedReady()) {
          setAdLoading(false);
          return;
        }
      } catch {
        setAdLoading(false);
        return;
      }
    }

    setUnlocking(true);
    setAdLoading(false);
    try {
      const success = await showRewardedAd(async () => {
        await unlockDeck(deck.id);
        await trackRewardedAdShown();
        setUnlocked(true);
        setTimeout(() => {
          if (onDeckUnlocked) {
            onDeckUnlocked(deck);
          } else {
            onSelectDeck(deck);
          }
        }, 500);
      });

      if (!success) {
        setUnlocking(false);
      }
    } catch {
      setUnlocking(false);
    }
  };

  const handleSelectDeck = async () => {
    if (unlocked || deck.isDefault) {
      try {
        await showGlobalInterstitial();
      } catch {}
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
            {!isOnline && (
              <View style={styles.warningContainer}>
                <MaterialIcons
                  name="wifi-off"
                  size={isTablet ? 32 : 28}
                  color="#FF6B6B"
                />
                <Text style={styles.warningText}>
                  Internet connection required
                </Text>
                <Text style={styles.warningSubtext}>
                  Please turn on your internet to unlock this deck
                </Text>
              </View>
            )}
            {isOnline && !adReady && !adLoading && (
              <View style={styles.warningContainer}>
                <MaterialIcons
                  name="hourglass-empty"
                  size={isTablet ? 32 : 28}
                  color="#FFA500"
                />
                <Text style={styles.warningText}>Ad is loading...</Text>
                <Text style={styles.warningSubtext}>
                  Please wait a moment and try again
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.unlockButton,
                (unlocking || !isOnline || (!adReady && !adLoading)) &&
                  styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlock}
              disabled={unlocking || !isOnline || (!adReady && !adLoading)}
            >
              {unlocking || adLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons
                    name="play-circle-filled"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.unlockButtonText}>
                    {!isOnline
                      ? "Internet Required"
                      : !adReady
                      ? "Loading Ad..."
                      : "Watch Ad to Unlock"}
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

        {canSelect && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectDeck}
          >
            <Text style={styles.selectButtonText}>Select This Deck</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: hexToRgba(COLORS.primary, 0.08),
    borderRadius: isSmallScreen ? 16 : isTablet ? 24 : 20,
    padding: isSmallScreen ? 24 : isTablet ? 40 : 32,
    marginBottom: isSmallScreen ? 20 : isTablet ? 32 : 24,
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.25),
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
  warningContainer: {
    alignItems: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
    paddingVertical: isSmallScreen ? 12 : isTablet ? 16 : 14,
    paddingHorizontal: isSmallScreen ? 16 : isTablet ? 24 : 20,
    backgroundColor: hexToRgba("#FF6B6B", 0.1),
    borderRadius: isSmallScreen ? 12 : isTablet ? 16 : 14,
    borderWidth: 1,
    borderColor: hexToRgba("#FF6B6B", 0.3),
    width: "100%",
  },
  warningText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
    fontWeight: "700",
    color: "#FF6B6B",
    marginTop: isSmallScreen ? 8 : 10,
    textAlign: "center",
  },
  warningSubtext: {
    fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14,
    color: "#ccc",
    marginTop: isSmallScreen ? 4 : 6,
    textAlign: "center",
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
