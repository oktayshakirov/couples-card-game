import { Deck } from "../../types/deck";
import { cupidDeck } from "./cupid";
import { heartsDeck } from "./hearts";

export { cupidDeck } from "./cupid";
export { heartsDeck } from "./hearts";

export const allDecks: Deck[] = [heartsDeck, cupidDeck];

export const getDefaultDeck = (): Deck => {
  const defaultDeck = allDecks.find((deck) => deck.isDefault);
  if (!defaultDeck) {
    return allDecks[0];
  }
  return defaultDeck;
};
