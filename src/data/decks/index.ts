import { Deck } from "../../types/deck";
import { defaultDeck } from "./default";
import { romanticDeck } from "./romantic";
import { funDeck } from "./fun";

export { defaultDeck } from "./default";
export { romanticDeck } from "./romantic";
export { funDeck } from "./fun";

export const allDecks: Deck[] = [defaultDeck, romanticDeck, funDeck];
