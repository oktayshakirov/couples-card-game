import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_SURPRISES_KEY = "recentSurprises";

/**
 * How many past Surprise Me picks to remember. The picker only avoids as many
 * of these as it can while still leaving itself something to choose from, so a
 * player with a handful of decks is never locked out.
 */
export const RECENT_SURPRISES_LIMIT = 5;

/** Most recent pick first. */
export async function getRecentSurprises(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SURPRISES_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/** Pure helper so the screen and storage stay in sync on the ordering/cap. */
export function addRecentSurprise(recent: string[], deckId: string): string[] {
  return [deckId, ...recent.filter((id) => id !== deckId)].slice(
    0,
    RECENT_SURPRISES_LIMIT
  );
}

export async function recordSurprise(deckId: string): Promise<void> {
  try {
    const next = addRecentSurprise(await getRecentSurprises(), deckId);
    await AsyncStorage.setItem(RECENT_SURPRISES_KEY, JSON.stringify(next));
  } catch {}
}
