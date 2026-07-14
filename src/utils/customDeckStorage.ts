import AsyncStorage from "@react-native-async-storage/async-storage";
import { Deck } from "../types/deck";
import { Card } from "../types/card";

const CUSTOM_DECKS_KEY = "customDecks";

export const CUSTOM_DECK_ICON = "edit";

export async function getCustomDecks(): Promise<Deck[]> {
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_DECKS_KEY);
    if (!stored) {
      return [];
    }
    const decks: Deck[] = JSON.parse(stored);
    // Re-stamp derived fields so older saves stay consistent with the app.
    return decks.map((deck) => ({
      ...deck,
      icon: CUSTOM_DECK_ICON,
      isCustom: true,
      isDefault: false,
    }));
  } catch {
    return [];
  }
}

export async function getCustomDeck(deckId: string): Promise<Deck | null> {
  const decks = await getCustomDecks();
  return decks.find((deck) => deck.id === deckId) ?? null;
}

export interface CustomDeckInput {
  id?: string;
  name: string;
  description: string;
  nsfw: boolean;
  cards: Pick<Card, "truth" | "dare">[];
}

/** Creates the deck when `input.id` is missing, otherwise updates it in place. */
export async function saveCustomDeck(input: CustomDeckInput): Promise<Deck> {
  const decks = await getCustomDecks();
  const id = input.id ?? `custom-${Date.now()}`;
  const deck: Deck = {
    id,
    name: input.name.trim(),
    description: input.description.trim() || "Your own truths and dares.",
    icon: CUSTOM_DECK_ICON,
    isCustom: true,
    isDefault: false,
    nsfw: input.nsfw,
    cards: input.cards.map((card, index) => ({
      id: `${id}-${index + 1}`,
      truth: card.truth.trim(),
      dare: card.dare.trim(),
    })),
  };

  const existingIndex = decks.findIndex((d) => d.id === id);
  if (existingIndex >= 0) {
    decks[existingIndex] = deck;
  } else {
    decks.push(deck);
  }
  await AsyncStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(decks));
  return deck;
}

export async function deleteCustomDeck(deckId: string): Promise<void> {
  const decks = await getCustomDecks();
  const remaining = decks.filter((deck) => deck.id !== deckId);
  await AsyncStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(remaining));
}
