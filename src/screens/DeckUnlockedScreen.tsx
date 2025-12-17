import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface DeckUnlockedScreenProps {
  deck: Deck;
  onContinue: () => void;
}

export const DeckUnlockedScreen: React.FC<DeckUnlockedScreenProps> = ({
  deck,
  onContinue,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.absoluteFill}>
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎉 Deck Unlocked!</Text>
            <Text style={styles.headerSubtitle}>
              You've successfully unlocked
            </Text>
          </View>

          <View style={styles.deckInfo}>
            <View style={styles.glassCard}>
              <View style={styles.glassTint} />
              <View style={styles.deckInfoContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={deck.icon as any}
                    size={isTablet ? 80 : 64}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.deckDescription}>{deck.description}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <MaterialIcons
                      name="style"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.statText}>
                      {deck.cards.length} Cards
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statusContainer}>
            {!isReady && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Preparing your deck...</Text>
              </View>
            )}

            {isReady && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✅ Deck Ready!</Text>
                <Text style={styles.successDetails}>
                  Your cards are ready to play
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isReady ? styles.enabledButton : styles.disabledButton,
              ]}
              onPress={onContinue}
              disabled={!isReady}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name="play-arrow"
                  size={isTablet ? 28 : 24}
                  color={isReady ? COLORS.background : "#999"}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: isReady ? COLORS.background : "#999" },
                  ]}
                >
                  {isReady ? "START PLAYING!" : "LOADING..."}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: isTablet ? 32 : 20,
  },
  header: {
    alignItems: "center",
    paddingTop: isSmallScreen ? 40 : isTablet ? 60 : 50,
    paddingBottom: isSmallScreen ? 20 : isTablet ? 30 : 25,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 32 : isTablet ? 48 : 40,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: isSmallScreen ? 8 : 12,
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20,
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
  },
  deckInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glassCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: isSmallScreen ? 18 : isTablet ? 26 : 22,
    padding: isSmallScreen ? 20 : isTablet ? 32 : 24,
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.3),
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    width: isSmallScreen ? width * 0.85 : isTablet ? width * 0.6 : width * 0.75,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexToRgba(COLORS.primary, 0.05),
  },
  deckInfoContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: hexToRgba(COLORS.primary, 0.2),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
  },
  deckName: {
    fontSize: isSmallScreen ? 28 : isTablet ? 40 : 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: isSmallScreen ? 8 : 12,
  },
  deckDescription: {
    fontSize: isSmallScreen ? 15 : isTablet ? 20 : 17,
    color: "#ccc",
    textAlign: "center",
    marginBottom: isSmallScreen ? 16 : isTablet ? 24 : 20,
    paddingHorizontal: isTablet ? 20 : 10,
  },
  statsContainer: {
    flexDirection: "row",
    gap: isTablet ? 24 : 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
    color: "#fff",
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? 20 : isTablet ? 30 : 25,
    minHeight: isSmallScreen ? 100 : isTablet ? 140 : 120,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
    color: "#fff",
    textAlign: "center",
    marginTop: isSmallScreen ? 12 : 16,
  },
  successContainer: {
    alignItems: "center",
  },
  successText: {
    fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20,
    color: COLORS.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  successDetails: {
    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
    color: "#ccc",
    textAlign: "center",
    marginTop: isSmallScreen ? 8 : 12,
  },
  buttonContainer: {
    alignItems: "center",
    paddingBottom: isSmallScreen ? 20 : isTablet ? 30 : 25,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? 15 : isTablet ? 20 : 18,
    paddingHorizontal: isSmallScreen ? 30 : isTablet ? 40 : 35,
    borderRadius: isSmallScreen ? 25 : isTablet ? 32 : 28,
    minWidth: isSmallScreen ? 250 : isTablet ? 320 : 280,
    gap: isSmallScreen ? 8 : 12,
  },
  enabledButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallScreen ? 8 : 12,
  },
  actionButtonText: {
    fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
    fontWeight: "700",
  },
});
