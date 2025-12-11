import { useState } from "react";

export interface PlayerStats {
  dares: number;
  truths: number;
  skipped: number;
}

export type Avatar =
  | "person"
  | "auto-awesome"
  | "mood"
  | "favorite"
  | "local-florist"
  | "bedtime"
  | "pets"
  | "local-fire-department";

export type PlayerColor =
  | "#FF6B6B"
  | "#4A90E2"
  | "#50C878"
  | "#808080"
  | "#FF69B4"
  | "#9B59B6"
  | "#FF8C00"
  | "#00CED1";

export interface PlayerInfo {
  name: string;
  avatar: Avatar;
  color: PlayerColor;
}

export interface GameState {
  player1: PlayerStats;
  player2: PlayerStats;
  currentPlayer: 1 | 2;
  player1Info: PlayerInfo;
  player2Info: PlayerInfo;
}

interface UseGameStateReturn {
  gameState: GameState;
  updatePlayerStats: (
    player: 1 | 2,
    statType: "dares" | "truths" | "skipped"
  ) => void;
  switchPlayer: () => void;
  resetGame: () => void;
  updatePlayerInfo: (player: 1 | 2, info: Partial<PlayerInfo>) => void;
  isSetupComplete: () => boolean;
}

const initialGameState: GameState = {
  player1: {
    dares: 0,
    truths: 0,
    skipped: 0,
  },
  player2: {
    dares: 0,
    truths: 0,
    skipped: 0,
  },
  currentPlayer: 1,
  player1Info: {
    name: "",
    avatar: "person",
    color: "#FF6B6B",
  },
  player2Info: {
    name: "",
    avatar: "auto-awesome",
    color: "#4A90E2",
  },
};

export const useGameState = (): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const updatePlayerStats = (
    player: 1 | 2,
    statType: "dares" | "truths" | "skipped"
  ) => {
    setGameState((prev) => ({
      ...prev,
      [player === 1 ? "player1" : "player2"]: {
        ...prev[player === 1 ? "player1" : "player2"],
        [statType]: prev[player === 1 ? "player1" : "player2"][statType] + 1,
      },
    }));
  };

  const switchPlayer = () => {
    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  const updatePlayerInfo = (player: 1 | 2, info: Partial<PlayerInfo>) => {
    setGameState((prev) => ({
      ...prev,
      [player === 1 ? "player1Info" : "player2Info"]: {
        ...prev[player === 1 ? "player1Info" : "player2Info"],
        ...info,
      },
    }));
  };

  const isSetupComplete = () => {
    return (
      gameState.player1Info.name.trim() !== "" &&
      gameState.player2Info.name.trim() !== ""
    );
  };

  return {
    gameState,
    updatePlayerStats,
    switchPlayer,
    resetGame,
    updatePlayerInfo,
    isSetupComplete,
  };
};
