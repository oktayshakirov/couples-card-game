import React, { useState, useRef, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameScreen } from "./src/screens/GameScreen";
import { PlayerSetupScreen } from "./src/screens/PlayerSetupScreen";
import { DecksLibraryScreen } from "./src/screens/DecksLibraryScreen";
import { DeckScreen } from "./src/screens/DeckScreen";
import { DeckUnlockedScreen } from "./src/screens/DeckUnlockedScreen";
import { GameProvider, useGame } from "./src/contexts/GameContext";
import {
  OnboardingProvider,
  OnboardingService,
} from "./src/contexts/OnboardingContext";
import { toastConfig } from "./src/components/Toast";
import { Deck } from "./src/types/deck";
import { getDefaultDeck } from "./src/data/decks";
import {
  initializeGlobalAds,
  useGlobalAds,
  cleanupGlobalAds,
} from "./src/components/ads/adsManager";

type Screen =
  | "onboarding"
  | "setup"
  | "decks"
  | "deck"
  | "deckUnlocked"
  | "game";

const AppContent = () => {
  const { gameState, updatePlayerInfo, isSetupComplete } = useGame();
  const [currentScreen, setCurrentScreen] = useState<Screen>("onboarding");
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const hasGameStartedRef = useRef(false);

  const completeOnboarding = useCallback(() => {
    setCurrentScreen("setup");
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isCompleted = await OnboardingService.isOnboardingCompleted();
        if (!isCompleted) {
          setCurrentScreen("onboarding");
        } else {
          setCurrentScreen("setup");
        }
      } catch (error) {
        setCurrentScreen("onboarding");
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  useGlobalAds();

  const handlePlayerSetupComplete = () => {
    if (isSetupComplete()) {
      setCurrentScreen("decks");
    }
  };

  const handleDeckSelected = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentScreen("deck");
  };

  const handleDeckConfirmed = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentScreen("game");
    hasGameStartedRef.current = true;
  };

  const handleDeckUnlocked = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentScreen("deckUnlocked");
  };

  const handleDeckUnlockedContinue = () => {
    if (selectedDeck) {
      setCurrentScreen("game");
      hasGameStartedRef.current = true;
    }
  };

  const handleBackToDecks = () => {
    setCurrentScreen("decks");
    setSelectedDeck(null);
  };

  const handleBackToSetup = () => {
    if (hasGameStartedRef.current) {
      setCurrentScreen("decks");
    } else {
      setCurrentScreen("setup");
      setSelectedDeck(null);
    }
  };

  const handleEditPlayers = () => {
    setCurrentScreen("setup");
  };

  const handleEditPlayersComplete = () => {
    if (hasGameStartedRef.current) {
      setCurrentScreen("game");
    } else {
      setCurrentScreen("decks");
    }
  };

  const handleBackToDeckLibrary = () => {
    setCurrentScreen("decks");
  };

  const handleCloseSetup = () => {
    if (hasGameStartedRef.current && isSetupComplete()) {
      if (selectedDeck) {
        setCurrentScreen("game");
      } else {
        setCurrentScreen("decks");
      }
    }
  };

  const handleCloseDeckLibrary = () => {
    if (hasGameStartedRef.current) {
      setCurrentScreen("game");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAds = async () => {
      if (isMounted) {
        await initializeGlobalAds();
      }
    };

    initAds();

    return () => {
      isMounted = false;
      if (__DEV__) {
        cleanupGlobalAds();
        Toast.hide();
      }
    };
  }, []);

  const renderScreen = () => {
    if (!onboardingChecked) {
      return null;
    }

    switch (currentScreen) {
      case "onboarding":
        return (
          <OnboardingProvider value={{ completeOnboarding }}>
            <OnboardingScreen />
          </OnboardingProvider>
        );
      case "setup":
        return (
          <PlayerSetupScreen
            player1Info={gameState.player1Info}
            player2Info={gameState.player2Info}
            onUpdatePlayer1={(info) => updatePlayerInfo(1, info)}
            onUpdatePlayer2={(info) => updatePlayerInfo(2, info)}
            onStartGame={
              hasGameStartedRef.current
                ? handleEditPlayersComplete
                : handlePlayerSetupComplete
            }
            isEditing={hasGameStartedRef.current && isSetupComplete()}
            onClose={handleCloseSetup}
          />
        );
      case "decks":
        return (
          <DecksLibraryScreen
            onSelectDeck={handleDeckSelected}
            onBack={hasGameStartedRef.current ? handleBackToSetup : undefined}
            onClose={
              hasGameStartedRef.current ? handleCloseDeckLibrary : undefined
            }
            isEditing={hasGameStartedRef.current}
          />
        );
      case "deck":
        return selectedDeck ? (
          <DeckScreen
            deck={selectedDeck}
            onSelectDeck={handleDeckConfirmed}
            onDeckUnlocked={handleDeckUnlocked}
            onBack={handleBackToDeckLibrary}
          />
        ) : null;
      case "deckUnlocked":
        return selectedDeck ? (
          <DeckUnlockedScreen
            deck={selectedDeck}
            onContinue={handleDeckUnlockedContinue}
          />
        ) : null;
      case "game":
        return (
          <GameScreen
            selectedDeck={selectedDeck || getDefaultDeck()}
            onBackToSetup={handleBackToSetup}
            onEditPlayers={handleEditPlayers}
            onBackToDecks={handleBackToDeckLibrary}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
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
