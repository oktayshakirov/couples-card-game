import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameScreen } from "./src/screens/GameScreen";
import { PlayerSetupScreen } from "./src/screens/PlayerSetupScreen";
import { GameProvider, useGame } from "./src/contexts/GameContext";
import { toastConfig } from "./src/components/Toast";

const AppContent = () => {
  const { gameState, updatePlayerInfo, isSetupComplete } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const hasGameStartedRef = useRef(false);

  const handleStartGame = () => {
    if (isSetupComplete()) {
      setGameStarted(true);
      hasGameStartedRef.current = true;
    }
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  const handleCloseSetup = () => {
    setGameStarted(true);
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
          isEditing={hasGameStartedRef.current && isSetupComplete()}
          onClose={handleCloseSetup}
        />
      ) : (
        <GameScreen onBackToSetup={handleBackToSetup} />
      )}
      <Toast config={toastConfig} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SafeAreaProvider>
  );
}
