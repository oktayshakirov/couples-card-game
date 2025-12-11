import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { GameScreen } from "./src/screens/GameScreen";
import { PlayerSetupScreen } from "./src/screens/PlayerSetupScreen";
import { GameProvider, useGame } from "./src/contexts/GameContext";

const AppContent = () => {
  const { gameState, updatePlayerInfo, isSetupComplete } = useGame();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (isSetupComplete()) {
      setGameStarted(true);
    }
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  return (
    <>
      <StatusBar style="light" />
      {!gameStarted ? (
        <PlayerSetupScreen
          player1Info={gameState.player1Info}
          player2Info={gameState.player2Info}
          onUpdatePlayer1={(info) => updatePlayerInfo(1, info)}
          onUpdatePlayer2={(info) => updatePlayerInfo(2, info)}
          onStartGame={handleStartGame}
          isEditing={
            gameState.player1.dares > 0 ||
            gameState.player1.truths > 0 ||
            gameState.player1.skipped > 0
          }
        />
      ) : (
        <GameScreen onBackToSetup={handleBackToSetup} />
      )}
    </>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
