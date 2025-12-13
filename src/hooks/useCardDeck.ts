import { useRef, useState } from "react";
import React from "react";
import { Card } from "../types/card";
import { initialCards } from "../data/cards";

interface UseCardDeckReturn {
  cards: Card[];
  currentCard: Card | null;
  getCardRef: (cardId: string) => React.RefObject<any>;
  removeCard: (cardId: string) => void;
  resetDeck: () => void;
}

export const useCardDeck = (): UseCardDeckReturn => {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const childRefs = useRef<Map<string, React.RefObject<any>>>(new Map());

  const getCardRef = (cardId: string): React.RefObject<any> => {
    if (!childRefs.current.has(cardId)) {
      childRefs.current.set(cardId, React.createRef<any>());
    }
    return childRefs.current.get(cardId)!;
  };

  const removeCard = (cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
    childRefs.current.delete(cardId);
  };

  const resetDeck = () => {
    setCards(initialCards);
    childRefs.current.clear();
  };

  const currentCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return {
    cards,
    currentCard,
    getCardRef,
    removeCard,
    resetDeck,
  };
};
