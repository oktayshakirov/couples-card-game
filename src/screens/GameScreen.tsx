import React, { useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import TinderCard from "react-tinder-card";
import { SwipeCard } from "../components/Card";
import { GameHeader } from "../components/GameHeader";
import { ActionButtons } from "../components/ActionButtons";
import { EmptyDeck } from "../components/EmptyDeck";
import { useGameState } from "../hooks/useGameState";
import { useCardDeck } from "../hooks/useCardDeck";
import BannerAdComponent from "../components/ads/BannerAd";

const MAX_VISIBLE_CARDS = 3;

export const GameScreen: React.FC = () => {
  const { gameState, updatePlayerStats, switchPlayer } = useGameState();
  const { cards, getCardRef, removeCard } = useCardDeck();
  const [isSkipping, setIsSkipping] = useState(false);
  const topCardRef = useRef<any>(null);

  const onSwipe = (direction: string) => {
    if (direction === "right") {
      updatePlayerStats(gameState.currentPlayer, "dares");
      switchPlayer();
    } else if (direction === "left") {
      if (isSkipping) {
        updatePlayerStats(gameState.currentPlayer, "skipped");
        setIsSkipping(false);
      } else {
        updatePlayerStats(gameState.currentPlayer, "truths");
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
    if (!topCardRef.current) return;
    setIsSkipping(true);
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
        player1Name={gameState.player1Name}
        player2Name={gameState.player2Name}
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
                    player1Name={gameState.player1Name}
                    player2Name={gameState.player2Name}
                    currentPlayer={gameState.currentPlayer}
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
