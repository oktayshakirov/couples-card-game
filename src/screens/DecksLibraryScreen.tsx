import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { allDecks } from "../data/decks";
import { Deck } from "../types/deck";
import { getUnlockedDecks, unlockAllDecks } from "../utils/deckStorage";
import { useRevenueCat } from "../hooks/useRevenueCat";
import { getCustomerInfo, hasLifetimeEntitlement } from "../services/revenueCat";
import { useGame } from "../contexts/GameContext";
import { COLORS } from "../constants/colors";
import { DeckPack } from "../components/DeckPack";
import { ConnectModal } from "../components/ConnectModal";
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
  /** Bumps on every navigation to this screen (see App `decksVisitKey`) so the paywall flow runs each visit. */
  paywallEntryKey: number;
  onSelectDeck: (deck: Deck) => void;
  onBack?: () => void;
  onClose?: () => void;
  isEditing?: boolean;
}

export const DecksLibraryScreen: React.FC<DecksLibraryScreenProps> = ({
  paywallEntryKey,
  onSelectDeck,
  onBack,
  onClose,
  isEditing = false,
}) => {
  const { width } = useWindowDimensions();
  const { gameState } = useGame();
  const {
    syncCustomerInfo,
    showPaywallIfNeeded,
    isAvailable,
    isLifetime,
    customerInfo,
    devProOverride,
    setDevProOverride,
    restore,
    loading: rcLoading,
  } = useRevenueCat();
  const [unlockedDecks, setUnlockedDecks] = useState<string[]>([]);
  const [connectVisible, setConnectVisible] = useState(false);

  const handleManageInStore = useCallback(async () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    await Linking.openURL(url).catch(() => undefined);
  }, []);

  const handleUpgrade = useCallback(async () => {
    await showPaywallIfNeeded();
  }, [showPaywallIfNeeded]);

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

  const loadUnlockedDecks = useCallback(async () => {
    const unlocked = await getUnlockedDecks();
    setUnlockedDecks(unlocked);
  }, []);

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const { success } = await restore();
    if (!success) {
      return false;
    }
    const { customerInfo: info } = await getCustomerInfo();
    const restored = hasLifetimeEntitlement(info);
    if (restored) {
      await unlockAllDecks();
      await loadUnlockedDecks();
      await syncCustomerInfo();
    }
    return restored;
  }, [restore, syncCustomerInfo, loadUnlockedDecks]);

  useEffect(() => {
    loadUnlockedDecks();
  }, [loadUnlockedDecks]);

  useEffect(() => {
    if (!isAvailable || rcLoading) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { customerInfo, error: infoErr } = await getCustomerInfo();
      if (cancelled || infoErr?.code === "NOT_CONFIGURED") {
        return;
      }
      if (hasLifetimeEntitlement(customerInfo)) {
        await unlockAllDecks();
        await loadUnlockedDecks();
        await syncCustomerInfo();
        return;
      }
      await showPaywallIfNeeded();
      if (cancelled) {
        return;
      }
      const after = await getCustomerInfo();
      if (hasLifetimeEntitlement(after.customerInfo)) {
        await unlockAllDecks();
        await loadUnlockedDecks();
        await syncCustomerInfo();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    paywallEntryKey,
    isAvailable,
    rcLoading,
    syncCustomerInfo,
    showPaywallIfNeeded,
    loadUnlockedDecks,
  ]);

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
                  size={moderateScale(width >= 768 ? 12 : 16)}
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
                  size={moderateScale(width >= 768 ? 12 : 16)}
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
        <View style={stylesMemo.headerActions}>
          <TouchableOpacity
            style={stylesMemo.iconButton}
            onPress={() => setConnectVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          {isEditing && onClose && (
            <TouchableOpacity
              style={stylesMemo.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ConnectModal
        visible={connectVisible}
        onClose={() => setConnectVisible(false)}
        isLifetime={isLifetime}
        revenueCatAvailable={isAvailable}
        customerInfo={customerInfo}
        onManageInStore={handleManageInStore}
        onUpgrade={handleUpgrade}
        onRestore={handleRestore}
        devProOverride={devProOverride}
        setDevProOverride={setDevProOverride}
      />

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
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: scale(8),
      minWidth: scale(40),
    },
    iconButton: {
      width: scale(40),
      height: scale(40),
      alignItems: "center",
      justifyContent: "center",
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
      gap: verticalScale(4),
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      flexWrap: "wrap",
    },
    playerNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    avatarContainer: {
      width: width >= 768 ? scale(22) : scale(26),
      height: width >= 768 ? scale(22) : scale(26),
      borderRadius: width >= 768 ? scale(11) : scale(13),
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: moderateScale(18),
      fontWeight: "700",
    },
    ampersand: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      color: COLORS.primary,
    },
    subtitle: {
      fontSize: moderateScale(20),
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
    cardsGrid: {
      width: "100%",
    },
  });
