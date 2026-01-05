import AsyncStorage from "@react-native-async-storage/async-storage";

const UNLOCKED_DECKS_KEY = "unlockedDecks";
const TESTED_DECKS_KEY = "testedDecks";

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

export async function getTestedDecks(): Promise<string[]> {
  try {
    const tested = await AsyncStorage.getItem(TESTED_DECKS_KEY);
    if (tested) {
      return JSON.parse(tested);
    }
    return [];
  } catch {
    return [];
  }
}

export async function markDeckAsTested(deckId: string): Promise<void> {
  try {
    const tested = await getTestedDecks();
    if (!tested.includes(deckId)) {
      tested.push(deckId);
      await AsyncStorage.setItem(TESTED_DECKS_KEY, JSON.stringify(tested));
    }
  } catch {}
}

export async function isDeckTested(deckId: string): Promise<boolean> {
  const tested = await getTestedDecks();
  return tested.includes(deckId);
}
