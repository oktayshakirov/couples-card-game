import { Deck } from "../../types/deck";
import { defaultDeck } from "./default";
import { romanticDeck } from "./romantic";
import { funDeck } from "./fun";
import { deepDeck } from "./deep";

export { defaultDeck } from "./default";
export { romanticDeck } from "./romantic";
export { funDeck } from "./fun";
export { deepDeck } from "./deep";

export const allDecks: Deck[] = [defaultDeck, romanticDeck, funDeck, deepDeck];
