import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlayerInfo } from "../hooks/useGameState";

const SAVED_PLAYERS_KEY = "savedPlayers";

export interface SavedPlayers {
  player1: PlayerInfo;
  player2: PlayerInfo;
}

/** Persists both player profiles so a returning user can resume with them. */
export async function savePlayers(
  player1: PlayerInfo,
  player2: PlayerInfo
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SAVED_PLAYERS_KEY,
      JSON.stringify({ player1, player2 })
    );
  } catch {}
}

export async function loadPlayers(): Promise<SavedPlayers | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_PLAYERS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<SavedPlayers>;
    if (parsed?.player1?.name && parsed?.player2?.name) {
      return parsed as SavedPlayers;
    }
    return null;
  } catch {
    return null;
  }
}

/** True only when two named profiles are stored. */
export async function hasSavedPlayers(): Promise<boolean> {
  const saved = await loadPlayers();
  return Boolean(
    saved &&
      saved.player1.name.trim() !== "" &&
      saved.player2.name.trim() !== ""
  );
}

export async function clearPlayers(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_PLAYERS_KEY);
  } catch {}
}
