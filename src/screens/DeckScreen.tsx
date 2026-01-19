import React, { useState, useEffect, useMemo, useRef } from "react";
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
import {
  getDeckIconSource,
  isImageIcon,
  getBadgeIconSource,
} from "../utils/deckIcons";
import { DeckWarning } from "../components/DeckWarning";
import { Badge } from "../components/Badge";

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
  const [adLoadAttempted, setAdLoadAttempted] = useState(false);

  const lastLoadAttemptRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adReadyRef = useRef(false);
  const adLoadingRef = useRef(false);

  useEffect(() => {
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

    checkUnlockStatus();
    checkTestedStatus();
    checkConnectivity();
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => {
      unsubscribe();
    };
  }, [deck.id, deck.isDefault]);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (unlocked || deck.isDefault || loading) {
      return;
    }

    const isAdModuleAvailable = isRewardedAdModuleAvailable();
    if (!isAdModuleAvailable) {
      return;
    }

    const LOAD_RETRY_INTERVAL = 5000;
    const POLL_INTERVAL = 1000;

    const checkAdStatus = (): boolean => {
      const isReady = isRewardedReady();
      
      if (isReady !== adReadyRef.current) {
        adReadyRef.current = isReady;
        setAdReady(isReady);
        if (isReady) {
          adLoadingRef.current = false;
          setAdLoading(false);
        }
      }
      
      return isReady;
    };

    const attemptLoadAd = async () => {
      if (isRewardedReady()) {
        checkAdStatus();
        return;
      }

      if (!isOnline || adLoadingRef.current) {
        return;
      }

      const now = Date.now();
      const timeSinceLastAttempt = now - lastLoadAttemptRef.current;
      
      if (timeSinceLastAttempt < LOAD_RETRY_INTERVAL && adLoadAttempted) {
        return;
      }

      lastLoadAttemptRef.current = now;
      adLoadingRef.current = true;
      setAdLoading(true);
      setAdLoadAttempted(true);

      try {
        await ensureRewardedLoaded();
        checkAdStatus();
      } catch {
        adLoadingRef.current = false;
        setAdLoading(false);
      }
    };

    const isReady = checkAdStatus();
    
    if (!isReady) {
      attemptLoadAd();

      let pollCount = 0;
      pollIntervalRef.current = setInterval(() => {
        const isReadyNow = checkAdStatus();
        
        if (isReadyNow) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          return;
        }

        pollCount++;
        if (pollCount % 5 === 0 && isOnline && !adLoadingRef.current) {
          attemptLoadAd();
        }
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [unlocked, deck.isDefault, loading, isOnline, adLoadAttempted]);

  useEffect(() => {
    if (!loading && (unlocked || deck.isDefault)) {
      ensureInterstitialLoaded().catch(() => {});
    }
  }, [loading, unlocked, deck.isDefault]);

  const handleSelectDeck = async () => {
    if (unlocked || deck.isDefault) {
      try {
        await showGlobalInterstitial();
      } catch {}
      onSelectDeck(deck);
      return;
    }

    const isAdModuleAvailable = isRewardedAdModuleAvailable();
    const isAdActuallyReady = adReady || isRewardedReady();
    const isActuallyLoading = adLoading && !isAdActuallyReady;

    const canTest =
      !isTested &&
      (!isAdModuleAvailable ||
        (!isRewardedReady() && !adLoading && !isOnline));

    if (canTest && (!isAdModuleAvailable || !isOnline)) {
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
      (!isAdActuallyReady && !isActuallyLoading && !canTest && isTested)
    ) {
      return;
    }

    if (isAdModuleAvailable && !isRewardedReady() && isOnline) {
      setAdLoading(true);
      try {
        await ensureRewardedLoaded();
        if (!isRewardedReady()) {
          setAdLoading(false);
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
      } catch {
        setAdLoading(false);
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
  const isAdActuallyReady = adReady || isRewardedReady();
  const isActuallyLoading = adLoading && !isAdActuallyReady;
  const canTest =
    !canSelect &&
    !isTested &&
    (!isAdModuleAvailable ||
      (!isAdActuallyReady && !isActuallyLoading && !isOnline));

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
        <View style={stylesMemo.deckHeader}>
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
            <Badge
              icon="style"
              iconType="material"
              text={`${deck.cards.length} Cards`}
              iconSize={20}
            />
            {deck.nsfw !== undefined && (
              <Badge
                icon={getBadgeIconSource(deck.nsfw)}
                iconType="image"
                text={deck.nsfw ? "Spicy" : "Classic"}
              />
            )}
          </View>
        </View>

        {!canSelect && (
          <>
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
            </View>
            {!isOnline && (
              <DeckWarning
                type="error"
                icon="wifi-off"
                message="Internet connection required to unlock this deck"
              />
            )}
            {canTest && isOnline && (
              <DeckWarning
                type="info"
                icon="info-outline"
                message={
                  isTested
                    ? "To unlock this deck permanently, you'll need to watch a rewarded ad when available"
                    : "You can test this deck now, but to unlock it permanently, you'll need to watch a rewarded ad when available"
                }
              />
            )}
          </>
        )}
      </ScrollView>

      <View style={stylesMemo.buttonContainer}>
        <TouchableOpacity
          style={[
            stylesMemo.selectButton,
            !canSelect &&
              (unlocking ||
                (!isOnline && isTested && !canTest) ||
                (!isAdActuallyReady &&
                  !isActuallyLoading &&
                  isTested &&
                  !canTest)) &&
              stylesMemo.selectButtonDisabled,
          ]}
          onPress={handleSelectDeck}
          disabled={
            !canSelect &&
            (unlocking ||
              (!isOnline && isTested && !canTest) ||
              (!isAdActuallyReady &&
                !isActuallyLoading &&
                isTested &&
                !canTest))
          }
        >
          {unlocking ? (
            <View style={stylesMemo.buttonContent}>
              <ActivityIndicator
                size="small"
                color={COLORS.text.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={stylesMemo.selectButtonText}>Unlocking...</Text>
            </View>
          ) : canSelect ? (
            <View style={stylesMemo.buttonContent}>
              <MaterialIcons
                name="style"
                size={moderateScale(width >= 768 ? 16 : 20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.selectButtonText}>Select This Deck</Text>
            </View>
          ) : isAdActuallyReady && isOnline && isAdModuleAvailable ? (
            <View style={stylesMemo.buttonContent}>
              <MaterialIcons
                name="play-circle-filled"
                size={moderateScale(width >= 768 ? 16 : 20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.selectButtonText}>Watch Ad to Unlock</Text>
            </View>
          ) : isActuallyLoading && isOnline && isAdModuleAvailable ? (
            <View style={stylesMemo.buttonContent}>
              <ActivityIndicator
                size="small"
                color={COLORS.text.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={stylesMemo.selectButtonText}>Loading Ad...</Text>
            </View>
          ) : !isOnline && isTested ? (
            <View style={stylesMemo.buttonContent}>
              <Text style={stylesMemo.selectButtonText}>Internet Required</Text>
            </View>
          ) : canTest ? (
            <View style={stylesMemo.buttonContent}>
              <MaterialIcons
                name="visibility"
                size={moderateScale(width >= 768 ? 16 : 20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.selectButtonText}>Test Deck</Text>
            </View>
          ) : isTested && isOnline && !isAdActuallyReady && !isActuallyLoading ? (
            <View style={stylesMemo.buttonContent}>
              <MaterialIcons
                name="hourglass-empty"
                size={moderateScale(width >= 768 ? 16 : 20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.selectButtonText}>Ad Not Available</Text>
            </View>
          ) : (
            <View style={stylesMemo.buttonContent}>
              <MaterialIcons
                name="hourglass-empty"
                size={moderateScale(width >= 768 ? 16 : 20)}
                color={COLORS.text.primary}
              />
              <Text style={stylesMemo.selectButtonText}>Loading Ad...</Text>
            </View>
          )}
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
      borderRadius: 12,
      padding: width >= 768 ? scale(12) : scale(16),
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
      gap: width >= 768 ? scale(6) : scale(8),
    },
    selectButtonText: {
      fontSize: moderateScale(width >= 768 ? 15 : 17),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
  });
