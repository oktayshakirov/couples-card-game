import AsyncStorage from "@react-native-async-storage/async-storage";

const UNLOCKED_DECKS_KEY = "unlockedDecks";

export async function getUnlockedDecks(): Promise<string[]> {
  try {
    const unlocked = await AsyncStorage.getItem(UNLOCKED_DECKS_KEY);
    if (unlocked) {
      return JSON.parse(unlocked);
    }
    return ["default"];
  } catch {
    return ["default"];
  }
}

export async function unlockDeck(deckId: string): Promise<void> {
  try {
    const unlocked = await getUnlockedDecks();
    if (!unlocked.includes(deckId)) {
      unlocked.push(deckId);
      await AsyncStorage.setItem(UNLOCKED_DECKS_KEY, JSON.stringify(unlocked));
    }
  } catch {}
}

export async function isDeckUnlocked(deckId: string): Promise<boolean> {
  const unlocked = await getUnlockedDecks();
  return unlocked.includes(deckId);
}
