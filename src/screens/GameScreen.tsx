import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import * as Haptics from "expo-haptics";
import { SwipeCard } from "../components/Card";
import { PendingCard } from "../components/PendingCard";
import { GameHeader } from "../components/GameHeader";
import { GameMenuModal } from "../components/GameMenuModal";
import { ActionButtons } from "../components/ActionButtons";
import { EmptyDeck } from "../components/EmptyDeck";
import { useGame } from "../contexts/GameContext";
import { useCardDeck } from "../hooks/useCardDeck";
import BannerAdComponent from "../components/ads/BannerAd";
import {
  showInterstitial,
  ensureInterstitialLoaded,
} from "../components/ads/InterstitialAd";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import {
  showSkipCountdown,
  showTruthToast,
  showDareToast,
} from "../utils/toast";

const MAX_VISIBLE_CARDS = 1;
const SWIPE_COOLDOWN_MS = 1000;

import { Deck } from "../types/deck";

interface GameScreenProps {
  selectedDeck?: Deck;
  onBackToSetup?: () => void;
  onEditPlayers?: () => void;
  onBackToDecks?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  selectedDeck,
  onBackToSetup,
  onEditPlayers,
  onBackToDecks,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    gameState,
    updatePlayerStats,
    switchPlayer,
    canPlayerSkip,
    resetGame,
  } = useGame();
  const { cards, getCardRef, removeCard, resetDeck } = useCardDeck(
    selectedDeck?.cards
  );
  const totalCards = useMemo(
    () => selectedDeck?.cards.length || 0,
    [selectedDeck?.cards.length]
  );
  const remainingCards = cards.length;
  const completedCards = totalCards - remainingCards;
  const progress = totalCards > 0 ? completedCards / totalCards : 0;
  const isSkippingRef = useRef<boolean>(false);
  const topCardRef = useRef<any>(null);
  const lastSwipeTimeRef = useRef<number>(0);
  const swipeCountRef = useRef<number>(0);
  const pendingConfirmationRef = useRef<{
    cardId: string;
    player: number;
    choice: "truth" | "dare";
  } | null>(null);
  const restoredCardIdRef = useRef<string | null>(null);
  const cardRemountKeysRef = useRef<Map<string, number>>(new Map());
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    cardId: string;
    player: number;
    choice: "truth" | "dare";
  } | null>(null);
  const [restoredCardId, setRestoredCardId] = useState<string | null>(null);

  const currentPlayerInfo = useMemo(() => {
    const currentPlayer = gameState.currentPlayer;
    const playerInfo =
      currentPlayer === 1 ? gameState.player1Info : gameState.player2Info;
    const playerStats =
      currentPlayer === 1 ? gameState.player1 : gameState.player2;
    return {
      player: currentPlayer,
      name: playerInfo.name,
      color: playerInfo.color,
      avatar: playerInfo.avatar,
      stats: playerStats,
    };
  }, [
    gameState.currentPlayer,
    gameState.player1Info.name,
    gameState.player1Info.color,
    gameState.player1Info.avatar,
    gameState.player2Info.name,
    gameState.player2Info.color,
    gameState.player2Info.avatar,
    gameState.player1.dares,
    gameState.player1.truths,
    gameState.player1.skipped,
    gameState.player2.dares,
    gameState.player2.truths,
    gameState.player2.skipped,
  ]);

  const nextPlayerInfo = useMemo(() => {
    const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    return {
      player: nextPlayer,
      name:
        nextPlayer === 1
          ? gameState.player1Info.name
          : gameState.player2Info.name,
    };
  }, [
    gameState.currentPlayer,
    gameState.player1Info.name,
    gameState.player2Info.name,
  ]);

  const getCurrentPlayerInfo = useCallback(
    () => currentPlayerInfo,
    [currentPlayerInfo]
  );
  const getNextPlayerInfo = useCallback(() => nextPlayerInfo, [nextPlayerInfo]);

  useEffect(() => {
    ensureInterstitialLoaded().catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      topCardRef.current = null;
      cardRemountKeysRef.current.clear();
    };
  }, []);

  const clearConfirmationState = () => {
    pendingConfirmationRef.current = null;
    restoredCardIdRef.current = null;
    setPendingConfirmation(null);
    setRestoredCardId(null);
  };

  const incrementSwipeCount = () => {
    swipeCountRef.current += 1;
    if (swipeCountRef.current % 5 === 0) {
      showInterstitial();
    }
  };

  const handleConfirm = (
    player: 1 | 2,
    statType: "dares" | "truths",
    cardId: string
  ) => {
    updatePlayerStats(player, statType);
    removeCard(cardId);
    cardRemountKeysRef.current.delete(cardId);
    clearConfirmationState();
    switchPlayer();
    incrementSwipeCount();
  };

  const handleCancel = (cardId: string) => {
    restoredCardIdRef.current = cardId;
    pendingConfirmationRef.current = null;
    const currentKey = cardRemountKeysRef.current.get(cardId) || 0;
    cardRemountKeysRef.current.set(cardId, currentKey + 1);
    setRestoredCardId(cardId);
    setPendingConfirmation(null);
  };

  const canSwipe = (): boolean => {
    const now = Date.now();
    const timeSinceLastSwipe = now - lastSwipeTimeRef.current;
    return timeSinceLastSwipe >= SWIPE_COOLDOWN_MS;
  };

  const recordSwipe = (): void => {
    lastSwipeTimeRef.current = Date.now();
  };

  const onSwipe = (direction: string, cardId: string) => {
    if (!canSwipe()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    restoredCardIdRef.current = null;
    setRestoredCardId(null);

    const { player, name, color, avatar, stats } = currentPlayerInfo;
    const { name: nextPlayerName } = nextPlayerInfo;

    if (direction === "right") {
      recordSwipe();
      const pendingData = {
        cardId,
        player,
        choice: "dare" as const,
      };
      pendingConfirmationRef.current = pendingData;
      setPendingConfirmation(pendingData);
      showDareToast({
        playerName: name,
        playerColor: color,
        playerAvatar: avatar,
        nextPlayerName,
        onConfirm: () => handleConfirm(player, "dares", cardId),
        onCancel: () => handleCancel(cardId),
      });
    } else if (direction === "left") {
      recordSwipe();
      if (isSkippingRef.current) {
        updatePlayerStats(player, "skipped");
        isSkippingRef.current = false;
        removeCard(cardId);
        cardRemountKeysRef.current.delete(cardId);

        const remainingSkips = Math.max(0, 3 - (stats.skipped + 1));
        if (remainingSkips > 0) {
          showSkipCountdown({
            playerName: name,
            remainingSkips,
            playerColor: color,
            playerAvatar: avatar,
          });
        }
        switchPlayer();
        incrementSwipeCount();
      } else {
        const pendingData = {
          cardId,
          player,
          choice: "truth" as const,
        };
        pendingConfirmationRef.current = pendingData;
        setPendingConfirmation(pendingData);
        showTruthToast({
          playerName: name,
          playerColor: color,
          playerAvatar: avatar,
          nextPlayerName,
          onConfirm: () => handleConfirm(player, "truths", cardId),
          onCancel: () => handleCancel(cardId),
        });
      }
    }
  };

  const onCardLeftScreen = (_direction: string, cardId: string) => {
    const isPending = pendingConfirmationRef.current?.cardId === cardId;
    const isRestored = restoredCardIdRef.current === cardId;

    if (isPending || isRestored) {
      return;
    }

    removeCard(cardId);
    cardRemountKeysRef.current.delete(cardId);
  };

  const swipeLeft = useCallback(() => {
    if (!topCardRef.current || !canSwipe()) return;
    topCardRef.current.swipe("left");
  }, []);

  const swipeRight = useCallback(() => {
    if (!topCardRef.current || !canSwipe()) return;
    topCardRef.current.swipe("right");
  }, []);

  const skip = useCallback(() => {
    if (
      !topCardRef.current ||
      !canPlayerSkip(gameState.currentPlayer) ||
      !canSwipe()
    )
      return;
    isSkippingRef.current = true;
    topCardRef.current.swipe("left");
  }, [gameState.currentPlayer, canPlayerSkip]);

  const visibleCards = useMemo(() => {
    if (pendingConfirmation) {
      const pendingCard = cards.find(
        (card) => card.id === pendingConfirmation.cardId
      );
      return [pendingCard, { id: "placeholder", truth: "", dare: "" }].filter(
        Boolean
      );
    }

    if (restoredCardId) {
      const restoredCard = cards.find((card) => card.id === restoredCardId);
      return restoredCard ? [restoredCard] : cards.slice(0, MAX_VISIBLE_CARDS);
    }

    return cards.slice(0, MAX_VISIBLE_CARDS);
  }, [cards, pendingConfirmation?.cardId, restoredCardId]);

  const renderedCards = visibleCards.slice().reverse();

  const handlePlayAgain = useCallback(() => {
    resetGame();
    resetDeck();
  }, [resetGame, resetDeck]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <BannerAdComponent />
      <GameHeader
        currentPlayer={gameState.currentPlayer}
        player1Dares={gameState.player1.dares}
        player1Truths={gameState.player1.truths}
        player1Skipped={gameState.player1.skipped}
        player2Dares={gameState.player2.dares}
        player2Truths={gameState.player2.truths}
        player2Skipped={gameState.player2.skipped}
        player1Name={gameState.player1Info.name}
        player2Name={gameState.player2Info.name}
        player1Avatar={gameState.player1Info.avatar}
        player2Avatar={gameState.player2Info.avatar}
        player1Color={gameState.player1Info.color}
        player2Color={gameState.player2Info.color}
        onMenuPress={() => setMenuVisible(true)}
      />

      <GameMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEditPlayers={() => {
          if (onEditPlayers) {
            onEditPlayers();
          }
        }}
        onChangeDeck={() => {
          if (onBackToDecks) {
            onBackToDecks();
          }
        }}
      />

      {totalCards > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {visibleCards.length === 0 ? (
          <EmptyDeck
            player1Name={gameState.player1Info.name}
            player2Name={gameState.player2Info.name}
            player1Color={gameState.player1Info.color}
            player2Color={gameState.player2Info.color}
            player1Truths={gameState.player1.truths}
            player1Dares={gameState.player1.dares}
            player1Skipped={gameState.player1.skipped}
            player2Truths={gameState.player2.truths}
            player2Dares={gameState.player2.dares}
            player2Skipped={gameState.player2.skipped}
            onPlayAgain={handlePlayAgain}
            onChangeDeck={onBackToDecks}
          />
        ) : (
          renderedCards
            .filter((card): card is NonNullable<typeof card> => card != null)
            .map((card, index) => {
              const cardRef = getCardRef(card.id);
              const isTopCard = index === renderedCards.length - 1;

              const topCardRefCallback = (node: any) => {
                if (node) {
                  topCardRef.current = node;
                }
              };

              const isPending = pendingConfirmation?.cardId === card.id;
              const isPlaceholder = card.id === "placeholder";

              if (isPlaceholder) {
                const { name: nextPlayerName } = nextPlayerInfo;
                const currentPlayerInfoData =
                  gameState.currentPlayer === 1
                    ? gameState.player1Info
                    : gameState.player2Info;

                return (
                  <View key={card.id} style={styles.cardWrapper}>
                    <PendingCard
                      player1Name={gameState.player1Info.name}
                      player2Name={gameState.player2Info.name}
                      currentPlayerColor={currentPlayerInfoData.color}
                      nextPlayerName={nextPlayerName}
                    />
                  </View>
                );
              }

              const remountKey = cardRemountKeysRef.current.get(card.id) || 0;
              const cardKey = `${card.id}-${remountKey}`;

              return (
                <View key={cardKey} style={styles.cardWrapper}>
                  <TinderCard
                    key={cardKey}
                    ref={isTopCard ? topCardRefCallback : cardRef}
                    onSwipe={(direction) => onSwipe(direction, card.id)}
                    onCardLeftScreen={(direction) =>
                      onCardLeftScreen(direction, card.id)
                    }
                    swipeRequirementType="position"
                    swipeThreshold={100}
                    preventSwipe={["up", "down"]}
                  >
                    <SwipeCard
                      truth={card.truth}
                      dare={card.dare}
                      player1Name={gameState.player1Info.name}
                      player2Name={gameState.player2Info.name}
                      currentPlayer={gameState.currentPlayer}
                      currentPlayerColor={
                        (gameState.currentPlayer === 1
                          ? gameState.player1Info
                          : gameState.player2Info
                        ).color
                      }
                      blurred={false}
                    />
                  </TinderCard>
                </View>
              );
            })
        )}
      </View>

      {cards.length > 0 && (
        <ActionButtons
          onSwipeLeft={swipeLeft}
          onSwipeRight={swipeRight}
          onSkip={skip}
          canSkip={canPlayerSkip(gameState.currentPlayer)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  progressContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    width: "100%",
    height: scale(4),
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    borderRadius: scale(2),
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: scale(2),
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
