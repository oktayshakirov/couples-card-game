import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "../types/card";
import { Deck } from "../types/deck";

const FAVORITE_CARDS_KEY = "favoriteCards";

export const FAVORITES_DECK_ID = "favorites";
export const FAVORITES_DECK_ICON = "favorite";

// Deck shuffling reassigns card ids each game (see useCardDeck), so favorites
// are keyed by card content instead of id.
export const getFavoriteKey = (truth: string, dare: string): string =>
  `${truth}|||${dare}`;

type StoredFavorite = Pick<Card, "truth" | "dare">;

export async function getFavoriteCards(): Promise<StoredFavorite[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITE_CARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function addFavoriteCard(card: StoredFavorite): Promise<void> {
  const favorites = await getFavoriteCards();
  const key = getFavoriteKey(card.truth, card.dare);
  if (!favorites.some((fav) => getFavoriteKey(fav.truth, fav.dare) === key)) {
    favorites.push({ truth: card.truth, dare: card.dare });
    await AsyncStorage.setItem(FAVORITE_CARDS_KEY, JSON.stringify(favorites));
  }
}

export async function removeFavoriteCard(card: StoredFavorite): Promise<void> {
  const favorites = await getFavoriteCards();
  const key = getFavoriteKey(card.truth, card.dare);
  const remaining = favorites.filter(
    (fav) => getFavoriteKey(fav.truth, fav.dare) !== key
  );
  await AsyncStorage.setItem(FAVORITE_CARDS_KEY, JSON.stringify(remaining));
}

export function buildFavoritesDeck(favorites: StoredFavorite[]): Deck {
  return {
    id: FAVORITES_DECK_ID,
    name: "Our Favorites",
    description:
      "The cards you two loved the most. Tap the heart on any card during a game to add it here.",
    icon: FAVORITES_DECK_ICON,
    isCustom: true,
    isDefault: false,
    cards: favorites.map((card, index) => ({
      id: `fav-${index + 1}`,
      truth: card.truth,
      dare: card.dare,
    })),
  };
}
