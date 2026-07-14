import { Card } from "./card";

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon: string;
  cards: Card[];
  isDefault?: boolean;
  nsfw?: boolean;
  /** User-created deck (deck builder) or the auto-generated favorites deck. Always unlocked. */
  isCustom?: boolean;
}
