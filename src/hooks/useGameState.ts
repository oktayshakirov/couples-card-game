import { useState } from "react";

export interface PlayerStats {
  dares: number;
  truths: number;
  skipped: number;
}

export interface GameState {
  player1: PlayerStats;
  player2: PlayerStats;
  currentPlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
}

interface UseGameStateReturn {
  gameState: GameState;
  updatePlayerStats: (
    player: 1 | 2,
    statType: "dares" | "truths" | "skipped"
  ) => void;
  switchPlayer: () => void;
  resetGame: () => void;
  updatePlayerName: (player: 1 | 2, name: string) => void;
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
  player1Name: "Player 1",
  player2Name: "Player 2",
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

  const updatePlayerName = (player: 1 | 2, name: string) => {
    setGameState((prev) => ({
      ...prev,
      [player === 1 ? "player1Name" : "player2Name"]: name,
    }));
  };

  return {
    gameState,
    updatePlayerStats,
    switchPlayer,
    resetGame,
    updatePlayerName,
  };
};
