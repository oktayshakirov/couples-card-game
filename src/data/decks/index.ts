import { Deck } from "../../types/deck";
import { cupidDeck } from "./cupid-gw";
import { heartsDeck } from "./stolen-hearts";
import { fateDeck } from "./fated-souls";
import { lustDeck } from "./lust-potion";
import { passionDeck } from "./passion-elixir";
import { timelessDeck } from "./timeless-love";
import { honeymoonDeck } from "./honeymoon-fever";
import { crimeDeck } from "./partners-in-crime";
import { twinFlamesDeck } from "./twin-flames";
import { sugarDeck } from "./sugar-and-spice";
import { nestDeck } from "./love-nest";
import { everAfterDeck } from "./ever-after";
import { forbiddenDeck } from "./forbidden-fruit";
import { velvetDeck } from "./velvet-nights";
import { masqueradeDeck } from "./midnight-masquerade";
import { wickedDeck } from "./wicked-games";
import { longDistanceDeck } from "./long-distance";

export { cupidDeck } from "./cupid-gw";
export { heartsDeck } from "./stolen-hearts";
export { fateDeck } from "./fated-souls";
export { lustDeck } from "./lust-potion";
export { passionDeck } from "./passion-elixir";
export { timelessDeck } from "./timeless-love";
export { honeymoonDeck } from "./honeymoon-fever";
export { crimeDeck } from "./partners-in-crime";
export { twinFlamesDeck } from "./twin-flames";
export { sugarDeck } from "./sugar-and-spice";
export { nestDeck } from "./love-nest";
export { everAfterDeck } from "./ever-after";
export { forbiddenDeck } from "./forbidden-fruit";
export { velvetDeck } from "./velvet-nights";
export { masqueradeDeck } from "./midnight-masquerade";
export { wickedDeck } from "./wicked-games";
export { longDistanceDeck } from "./long-distance";

export const allDecks: Deck[] = [
  heartsDeck,
  fateDeck,
  timelessDeck,
  honeymoonDeck,
  crimeDeck,
  twinFlamesDeck,
  sugarDeck,
  nestDeck,
  everAfterDeck,
  longDistanceDeck,
  cupidDeck,
  lustDeck,
  passionDeck,
  forbiddenDeck,
  velvetDeck,
  masqueradeDeck,
  wickedDeck,
];

export const getDefaultDeck = (): Deck => {
  const defaultDeck = allDecks.find((deck) => deck.isDefault);
  if (!defaultDeck) {
    return allDecks[0];
  }
  return defaultDeck;
};
