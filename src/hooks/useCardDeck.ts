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

const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const shuffleAndAssignIds = (cards: Card[]): Card[] => {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((card) => ({
    ...card,
    id: generateUniqueId(),
  }));
};

export const useCardDeck = (): UseCardDeckReturn => {
  const [cards, setCards] = useState<Card[]>(() =>
    shuffleAndAssignIds(initialCards)
  );
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
    const newCards = shuffleAndAssignIds(initialCards);
    setCards(newCards);
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
