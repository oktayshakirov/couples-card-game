import { useState } from "react";

export interface PlayerStats {
  dares: number;
  truths: number;
  skipped: number;
}

export type Avatar =
  | "face-man"
  | "face-woman"
  | "cat"
  | "dog"
  | "alien"
  | "account-cowboy-hat"
  | "skull"
  | "flower"
  | "paw"
  | "heart";

export type PlayerColor =
  | "#B19CD9"
  | "#7FCDCD"
  | "#8DB4D4"
  | "#8FBC8F"
  | "#D4A5A5"
  | "#A0A0A0"
  | "#E6A8D3"
  | "#F4A460"
  | "#B8E6B8"
  | "#FFD4A3";

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
  canPlayerSkip: (player: 1 | 2) => boolean;
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
    avatar: "face-man",
    color: "#B19CD9",
  },
  player2Info: {
    name: "",
    avatar: "face-woman",
    color: "#8DB4D4",
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
    setGameState((prev) => ({
      ...prev,
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
    }));
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

  const canPlayerSkip = (player: 1 | 2): boolean => {
    const playerStats = player === 1 ? gameState.player1 : gameState.player2;
    return playerStats.skipped < 3;
  };

  return {
    gameState,
    updatePlayerStats,
    switchPlayer,
    resetGame,
    updatePlayerInfo,
    isSetupComplete,
    canPlayerSkip,
  };
};
