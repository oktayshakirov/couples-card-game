import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import TinderCard from "react-tinder-card";
import { SwipeCard } from "../components/Card";
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

const MAX_VISIBLE_CARDS = 3;

interface GameScreenProps {
  onBackToSetup?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToSetup }) => {
  const { gameState, updatePlayerStats, switchPlayer, canPlayerSkip } =
    useGame();
  const { cards, getCardRef, removeCard } = useCardDeck();
  const isSkippingRef = useRef<boolean>(false);
  const topCardRef = useRef<any>(null);

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

  const onSwipe = (direction: string) => {
    const { player, name, color, avatar, stats } = getCurrentPlayerInfo();

    if (direction === "right") {
      updatePlayerStats(player, "dares");
      showDareToast({
        playerName: name,
        playerColor: color,
        playerAvatar: avatar,
      });
      switchPlayer();
    } else if (direction === "left") {
      if (isSkippingRef.current) {
        updatePlayerStats(player, "skipped");
        isSkippingRef.current = false;

        const remainingSkips = Math.max(0, 3 - (stats.skipped + 1));
        if (remainingSkips > 0) {
          showSkipCountdown({
            playerName: name,
            remainingSkips,
            playerColor: color,
            playerAvatar: avatar,
          });
        }
      } else {
        updatePlayerStats(player, "truths");
        showTruthToast({
          playerName: name,
          playerColor: color,
          playerAvatar: avatar,
        });
      }
      switchPlayer();
    }
  };

  const onCardLeftScreen = (_direction: string, cardId: string) => {
    removeCard(cardId);
  };

  const swipeLeft = () => {
    if (!topCardRef.current) return;
    topCardRef.current.swipe("left");
  };

  const swipeRight = () => {
    if (!topCardRef.current) return;
    topCardRef.current.swipe("right");
  };

  const skip = () => {
    if (!topCardRef.current || !canPlayerSkip(gameState.currentPlayer)) return;
    isSkippingRef.current = true;
    topCardRef.current.swipe("left");
  };

  const visibleCards = cards.slice(0, MAX_VISIBLE_CARDS);
  const renderedCards = visibleCards.slice().reverse();

  return (
    <View style={styles.container}>
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
          <EmptyDeck />
        ) : (
          renderedCards.map((card, index) => {
            const cardRef = getCardRef(card.id);
            const isTopCard = index === renderedCards.length - 1;

            const topCardRefCallback = (node: any) => {
              if (node) {
                topCardRef.current = node;
              }
            };

            return (
              <View key={card.id} style={styles.cardWrapper}>
                <TinderCard
                  ref={isTopCard ? topCardRefCallback : cardRef}
                  onSwipe={onSwipe}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
    overflow: "hidden",
    paddingTop: 50,
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
