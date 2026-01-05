import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import {
  isDeckUnlocked,
  unlockDeck,
  isDeckTested,
  markDeckAsTested,
} from "../utils/deckStorage";
import {
  showRewardedAd,
  ensureRewardedLoaded,
  isRewardedReady,
  isRewardedAdModuleAvailable,
} from "../components/ads/RewardedAd";
import {
  showGlobalInterstitial,
  trackRewardedAdShown,
} from "../components/ads/adsManager";
import { ensureInterstitialLoaded } from "../components/ads/InterstitialAd";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { getDeckIconSource, isImageIcon } from "../utils/deckIcons";
import { DeckWarning } from "../components/DeckWarning";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
  const { width } = useWindowDimensions();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [adReady, setAdReady] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [isTested, setIsTested] = useState(false);
  const [adLoadFailed, setAdLoadFailed] = useState(false);

  useEffect(() => {
    checkUnlockStatus();
    checkTestedStatus();
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

      let pollInterval: NodeJS.Timeout | null = null;
      let isCleanedUp = false;

      const startPolling = () => {
        if (isCleanedUp) return;

        pollInterval = setInterval(() => {
          if (isCleanedUp) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            return;
          }

          if (isRewardedReady()) {
            setAdReady(true);
            setAdLoading(false);
            setAdLoadFailed(false);
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
        }, 500);
      };

      startPolling();

      const timeout = setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        if (isRewardedReady()) {
          setAdReady(true);
          setAdLoading(false);
          setAdLoadFailed(false);
        } else {
          setAdLoadFailed(true);
          setAdLoading(false);
        }
      }, 30000);

      return () => {
        isCleanedUp = true;
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        clearTimeout(timeout);
      };
    }
  }, [unlocked, loading, deck.isDefault]);

  const checkUnlockStatus = async () => {
    const isUnlocked = await isDeckUnlocked(deck.id);
    setUnlocked(Boolean(isUnlocked || deck.isDefault));
    setLoading(false);
  };

  const checkTestedStatus = async () => {
    if (deck.isDefault) {
      setIsTested(false);
      return;
    }
    const tested = await isDeckTested(deck.id);
    setIsTested(tested);
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
      setAdLoadFailed(false);
    } else {
      setAdReady(false);
      if (!adLoading) {
        setAdLoading(true);
        setAdLoadFailed(false);
        try {
          await ensureRewardedLoaded();
          if (isRewardedReady()) {
            setAdReady(true);
            setAdLoadFailed(false);
          } else {
            setAdLoadFailed(true);
          }
        } catch {
          setAdReady(false);
          setAdLoadFailed(true);
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
      if (isRewardedReady()) {
        setAdReady(true);
        setAdLoading(false);
        setAdLoadFailed(false);
        return;
      }

      setAdLoading(true);
      setAdReady(false);
      setAdLoadFailed(false);

      try {
        await ensureRewardedLoaded();

        if (isRewardedReady()) {
          setAdReady(true);
          setAdLoading(false);
          setAdLoadFailed(false);
        } else {
          setAdLoadFailed(true);
          setAdLoading(false);
        }
      } catch {
        setAdReady(false);
        setAdLoading(false);
        setAdLoadFailed(true);
      }
    }
  };

  const handleSelectDeck = async () => {
    if (unlocked || deck.isDefault) {
      try {
        await showGlobalInterstitial();
      } catch {}
      onSelectDeck(deck);
    } else {
      const isAdModuleAvailable = isRewardedAdModuleAvailable();
      const isAdReady = adReady || isRewardedReady();

      const canTest =
        !isTested &&
        (!isAdModuleAvailable ||
          (!isRewardedReady() && !adLoading && (!isOnline || adLoadFailed)));

      if (canTest && !isAdModuleAvailable) {
        await markDeckAsTested(deck.id);
        setIsTested(true);
        try {
          await showGlobalInterstitial();
        } catch {}
        onSelectDeck(deck);
        return;
      }

      if (canTest && (!isOnline || adLoadFailed)) {
        await markDeckAsTested(deck.id);
        setIsTested(true);
        try {
          await showGlobalInterstitial();
        } catch {}
        onSelectDeck(deck);
        return;
      }

      if (
        unlocking ||
        (!isOnline && !canTest && isTested) ||
        (!isAdReady && !adLoading && !canTest && isTested)
      )
        return;

      if (isAdModuleAvailable && !isRewardedReady()) {
        setAdLoading(true);
        setAdLoadFailed(false);
        try {
          await ensureRewardedLoaded();
          if (!isRewardedReady()) {
            setAdLoading(false);
            setAdLoadFailed(true);

            if (!isTested) {
              await markDeckAsTested(deck.id);
              setIsTested(true);
              try {
                await showGlobalInterstitial();
              } catch {}
              onSelectDeck(deck);
            }
            return;
          }
          setAdReady(true);
          setAdLoading(false);
          setAdLoadFailed(false);
        } catch {
          setAdLoading(false);
          setAdLoadFailed(true);

          if (!isTested) {
            await markDeckAsTested(deck.id);
            setIsTested(true);
            try {
              await showGlobalInterstitial();
            } catch {}
            onSelectDeck(deck);
          }
          return;
        }
      }

      if (!isAdModuleAvailable) {
        return;
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
    }
  };

  const stylesMemo = useMemo(() => createStyles(width), [width]);

  if (loading) {
    return (
      <SafeAreaView style={stylesMemo.container} edges={["top", "bottom"]}>
        <View style={stylesMemo.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const canSelect = unlocked || deck.isDefault;
  const isAdModuleAvailable = isRewardedAdModuleAvailable();
  const canTest =
    !canSelect &&
    !isTested &&
    (!isAdModuleAvailable ||
      (!isRewardedReady() && !adLoading && (!isOnline || adLoadFailed)));

  return (
    <SafeAreaView style={stylesMemo.container} edges={["top", "bottom"]}>
      <View style={stylesMemo.header}>
        <TouchableOpacity onPress={onBack} style={stylesMemo.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={stylesMemo.title}>{deck.name}</Text>
        <View style={stylesMemo.placeholder} />
      </View>

      <ScrollView
        style={stylesMemo.scrollView}
        contentContainerStyle={[
          stylesMemo.scrollContent,
          canSelect && stylesMemo.scrollContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deckHeader}>
          <View style={stylesMemo.iconContainer}>
            {isImageIcon(deck.icon) ? (
              <Image
                source={getDeckIconSource(deck.icon)}
                style={{
                  width: width >= 768 ? 80 : moderateScale(64),
                  height: width >= 768 ? 80 : moderateScale(64),
                }}
                resizeMode="contain"
              />
            ) : (
              <MaterialIcons
                name={deck.icon as any}
                size={width >= 768 ? 48 : moderateScale(44)}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={stylesMemo.deckName}>{deck.name}</Text>
          <Text style={stylesMemo.deckDescription}>{deck.description}</Text>
          <View style={stylesMemo.statsContainer}>
            <View style={stylesMemo.stat}>
              <MaterialIcons name="style" size={20} color={COLORS.primary} />
              <Text style={stylesMemo.statText}>{deck.cards.length} Cards</Text>
            </View>
          </View>
        </View>

        {!canSelect && (
          <View style={stylesMemo.lockedContainer}>
            <MaterialIcons
              name="lock"
              size={width >= 768 ? 40 : moderateScale(36)}
              color="#666"
            />
            <Text style={stylesMemo.lockedTitle}>Deck Locked</Text>
            <Text style={stylesMemo.lockedDescription}>
              Watch a short ad to unlock this deck
            </Text>
            {!isOnline && (
              <DeckWarning
                type="error"
                icon="wifi-off"
                title="Internet connection required"
                message="Please turn on your internet to unlock this deck"
              />
            )}
            {(canTest || adLoadFailed) && isOnline && (
              <DeckWarning
                type="info"
                icon="info-outline"
                title={isTested ? "Ad Not Available" : "Test Mode Available"}
                message={
                  isTested
                    ? "To unlock this deck permanently, you'll need to watch a rewarded ad when available"
                    : "You can test this deck now, but to unlock it permanently, you'll need to watch a rewarded ad when available"
                }
              />
            )}
          </View>
        )}
      </ScrollView>

      <View style={stylesMemo.buttonContainer}>
        <TouchableOpacity
          style={[
            stylesMemo.selectButton,
            !canSelect &&
              (unlocking ||
                (!isOnline && isTested && !canTest) ||
                (!adReady &&
                  !adLoading &&
                  !isRewardedReady() &&
                  isTested &&
                  !canTest)) &&
              stylesMemo.selectButtonDisabled,
          ]}
          onPress={handleSelectDeck}
          disabled={
            !canSelect &&
            (unlocking ||
              (!isOnline && isTested && !canTest) ||
              (!adReady &&
                !adLoading &&
                !isRewardedReady() &&
                isTested &&
                !canTest &&
                !adLoadFailed))
          }
        >
          {(() => {
            const isAdActuallyReady = adReady || isRewardedReady();
            const isActuallyLoading = adLoading && !isAdActuallyReady;

            if (
              unlocking ||
              (isActuallyLoading && !canSelect && !canTest && !adLoadFailed)
            ) {
              return (
                <View style={stylesMemo.buttonContent}>
                  <MaterialIcons
                    name="hourglass-empty"
                    size={moderateScale(20)}
                    color={COLORS.text.primary}
                  />
                  <Text style={stylesMemo.selectButtonText}>Loading Ad...</Text>
                </View>
              );
            }

            return (
              <View style={stylesMemo.buttonContent}>
                {canSelect && (
                  <MaterialIcons
                    name="style"
                    size={moderateScale(20)}
                    color={COLORS.text.primary}
                  />
                )}
                {!canSelect && isAdActuallyReady && isOnline && (
                  <MaterialIcons
                    name="play-circle-filled"
                    size={moderateScale(20)}
                    color={COLORS.text.primary}
                  />
                )}
                {!canSelect &&
                  !isAdActuallyReady &&
                  isOnline &&
                  !canTest &&
                  !adLoadFailed && (
                    <MaterialIcons
                      name="hourglass-empty"
                      size={moderateScale(20)}
                      color={COLORS.text.primary}
                    />
                  )}
                {!canSelect && (canTest || (adLoadFailed && !isTested)) && (
                  <MaterialIcons
                    name="visibility"
                    size={moderateScale(20)}
                    color={COLORS.text.primary}
                  />
                )}
                <Text style={stylesMemo.selectButtonText}>
                  {canSelect
                    ? "Select This Deck"
                    : !isOnline && isTested
                    ? "Internet Required"
                    : !isOnline && !isTested
                    ? "Test Deck"
                    : !isAdModuleAvailable && !isTested
                    ? "Test Deck"
                    : !isAdActuallyReady && canTest
                    ? "Test Deck"
                    : !isAdActuallyReady &&
                      !canTest &&
                      adLoadFailed &&
                      !isTested
                    ? "Test Deck"
                    : !isAdActuallyReady && !canTest && !adLoadFailed
                    ? "Loading Ad..."
                    : !isAdActuallyReady && !canTest && adLoadFailed && isTested
                    ? "Ad Not Available"
                    : "Watch Ad to Unlock"}
                </Text>
              </View>
            );
          })()}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
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
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingVertical: verticalScale(14),
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: moderateScale(26),
      fontWeight: "700",
      color: COLORS.text.primary,
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
    scrollContentCentered: {
      flexGrow: 1,
      justifyContent: "center",
    },
    buttonContainer: {
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingVertical: verticalScale(16),
      paddingBottom: verticalScale(20),
      backgroundColor: COLORS.background,
      borderTopWidth: 1,
      borderTopColor: hexToRgba(COLORS.primary, 0.1),
    },
    deckHeader: {
      alignItems: "center",
      marginBottom: verticalScale(28),
    },
    iconContainer: {
      width: width >= 768 ? 100 : scale(80),
      height: width >= 768 ? 100 : scale(80),
      borderRadius: width >= 768 ? 50 : scale(40),
      backgroundColor: hexToRgba("#FF6B9D", 0.2),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(18),
    },
    deckName: {
      fontSize: moderateScale(32),
      fontWeight: "700",
      color: COLORS.text.primary,
      marginBottom: verticalScale(10),
    },
    deckDescription: {
      fontSize: moderateScale(17),
      color: "#ccc",
      textAlign: "center",
      marginBottom: verticalScale(18),
      paddingHorizontal: width >= 768 ? 40 : scale(20),
    },
    statsContainer: {
      flexDirection: "row",
      gap: width >= 768 ? 24 : scale(16),
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statText: {
      fontSize: moderateScale(16),
      color: COLORS.text.primary,
      fontWeight: "600",
    },
    lockedContainer: {
      alignItems: "center",
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(20),
      padding: scale(20),
      marginBottom: verticalScale(16),
      borderWidth: 2,
      borderColor: hexToRgba(COLORS.primary, 0.25),
    },
    lockedTitle: {
      fontSize: moderateScale(20),
      fontWeight: "700",
      color: COLORS.text.primary,
      marginTop: verticalScale(10),
      marginBottom: verticalScale(6),
    },
    lockedDescription: {
      fontSize: moderateScale(14),
      color: "#ccc",
      textAlign: "center",
      marginBottom: verticalScale(12),
    },
    selectButton: {
      backgroundColor: COLORS.primary,
      borderRadius: scale(14),
      paddingVertical: verticalScale(14),
      alignItems: "center",
      justifyContent: "center",
    },
    selectButtonDisabled: {
      backgroundColor: "#666",
      opacity: 0.5,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
    },
    selectButtonText: {
      fontSize: moderateScale(20),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
  });

const styles = createStyles(0);
