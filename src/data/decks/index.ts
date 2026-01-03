import { Deck } from "../../types/deck";
import { cupidDeck } from "./cupid-gw";
import { heartsDeck } from "./stolen-hearts";
import { fateDeck } from "./fated-souls";
import { lustDeck } from "./lust-potion";
import { passionDeck } from "./passion-elixir";
import { timelessDeck } from "./timeless-love";

export { cupidDeck } from "./cupid-gw";
export { heartsDeck } from "./stolen-hearts";
export { fateDeck } from "./fated-souls";
export { lustDeck } from "./lust-potion";
export { passionDeck } from "./passion-elixir";
export { timelessDeck } from "./timeless-love";

export const allDecks: Deck[] = [
  heartsDeck,
  fateDeck,
  timelessDeck,
  cupidDeck,
  lustDeck,
  passionDeck,
];

export const getDefaultDeck = (): Deck => {
  const defaultDeck = allDecks.find((deck) => deck.isDefault);
  if (!defaultDeck) {
    return allDecks[0];
  }
  return defaultDeck;
};
