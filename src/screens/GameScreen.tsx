import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import { SwipeCard } from "../components/Card";
import { PendingCard } from "../components/PendingCard";
import { GameHeader } from "../components/GameHeader";
import { ActionButtons } from "../components/ActionButtons";
import { EmptyDeck } from "../components/EmptyDeck";
import { useGame } from "../contexts/GameContext";
import { useCardDeck } from "../hooks/useCardDeck";
import BannerAdComponent from "../components/ads/BannerAd";
import {
  showSkipCountdown,
  showTruthToast,
  showDareToast,
} from "../utils/toast";

const MAX_VISIBLE_CARDS = 1;
const SWIPE_COOLDOWN_MS = 1000;

interface GameScreenProps {
  onBackToSetup?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToSetup }) => {
  const {
    gameState,
    updatePlayerStats,
    switchPlayer,
    canPlayerSkip,
    resetGame,
  } = useGame();
  const { cards, getCardRef, removeCard, resetDeck } = useCardDeck();
  const isSkippingRef = useRef<boolean>(false);
  const topCardRef = useRef<any>(null);
  const lastSwipeTimeRef = useRef<number>(0);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    cardId: string;
    player: number;
    choice: "truth" | "dare";
  } | null>(null);

  const getCurrentPlayerInfo = () => {
    const currentPlayer = gameState.currentPlayer;
    return {
      player: currentPlayer,
      name:
        currentPlayer === 1
          ? gameState.player1Info.name
          : gameState.player2Info.name,
      color:
        currentPlayer === 1
          ? gameState.player1Info.color
          : gameState.player2Info.color,
      avatar:
        currentPlayer === 1
          ? gameState.player1Info.avatar
          : gameState.player2Info.avatar,
      stats: currentPlayer === 1 ? gameState.player1 : gameState.player2,
    };
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

    const { player, name, color, avatar, stats } = getCurrentPlayerInfo();
    const nextPlayer = player === 1 ? 2 : 1;
    const nextPlayerName =
      nextPlayer === 1
        ? gameState.player1Info.name
        : gameState.player2Info.name;
    const cardRef = getCardRef(cardId);

    if (direction === "right") {
      recordSwipe();
      setPendingConfirmation({
        cardId,
        player,
        choice: "dare",
      });
      showDareToast({
        playerName: name,
        playerColor: color,
        playerAvatar: avatar,
        nextPlayerName,
        onConfirm: () => {
          updatePlayerStats(player, "dares");
          removeCard(cardId);
          setPendingConfirmation(null);
          switchPlayer();
        },
        onCancel: () => {
          if (cardRef.current?.restoreCard) {
            cardRef.current.restoreCard();
          }
          setPendingConfirmation(null);
        },
      });
    } else if (direction === "left") {
      recordSwipe();
      if (isSkippingRef.current) {
        updatePlayerStats(player, "skipped");
        isSkippingRef.current = false;
        removeCard(cardId);

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
      } else {
        setPendingConfirmation({
          cardId,
          player,
          choice: "truth",
        });
        showTruthToast({
          playerName: name,
          playerColor: color,
          playerAvatar: avatar,
          nextPlayerName,
          onConfirm: () => {
            updatePlayerStats(player, "truths");
            removeCard(cardId);
            setPendingConfirmation(null);
            switchPlayer();
          },
          onCancel: () => {
            if (cardRef.current?.restoreCard) {
              cardRef.current.restoreCard();
            }
            setPendingConfirmation(null);
          },
        });
      }
    }
  };

  const onCardLeftScreen = (_direction: string, cardId: string) => {
    if (!pendingConfirmation || pendingConfirmation.cardId !== cardId) {
      removeCard(cardId);
    }
  };

  const swipeLeft = () => {
    if (!topCardRef.current || !canSwipe()) return;
    topCardRef.current.swipe("left");
  };

  const swipeRight = () => {
    if (!topCardRef.current || !canSwipe()) return;
    topCardRef.current.swipe("right");
  };

  const skip = () => {
    if (
      !topCardRef.current ||
      !canPlayerSkip(gameState.currentPlayer) ||
      !canSwipe()
    )
      return;
    isSkippingRef.current = true;
    topCardRef.current.swipe("left");
  };

  const visibleCards = pendingConfirmation
    ? [
        cards.find((card) => card.id === pendingConfirmation.cardId),

        { id: "placeholder", truth: "", dare: "" },
      ].filter(Boolean)
    : cards.slice(0, MAX_VISIBLE_CARDS);
  const renderedCards = visibleCards.slice().reverse();

  const handlePlayAgain = () => {
    resetGame();
    resetDeck();
  };

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
        onSettingsPress={onBackToSetup}
      />

      <View style={styles.content}>
        {cards.length === 0 ? (
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
                const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1;
                const nextPlayerName =
                  nextPlayer === 1
                    ? gameState.player1Info.name
                    : gameState.player2Info.name;

                return (
                  <View key={card.id} style={styles.cardWrapper}>
                    <PendingCard
                      player1Name={gameState.player1Info.name}
                      player2Name={gameState.player2Info.name}
                      currentPlayerColor={
                        gameState.currentPlayer === 1
                          ? gameState.player1Info.color
                          : gameState.player2Info.color
                      }
                      nextPlayerName={nextPlayerName}
                    />
                  </View>
                );
              }

              return (
                <View key={card.id} style={styles.cardWrapper}>
                  <TinderCard
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
                        gameState.currentPlayer === 1
                          ? gameState.player1Info.color
                          : gameState.player2Info.color
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
    backgroundColor: "#1a0a0f",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
