import { Card } from "./card";

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon: string;
  cards: Card[];
  isDefault?: boolean;
  nsfw?: boolean;
}
