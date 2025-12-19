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

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

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
            {!isReady && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIconContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
                <Text style={styles.loadingText}>Preparing your deck...</Text>
              </View>
            )}

            {isReady && (
              <View style={styles.glassCard}>
                <View style={styles.glassTint} />
                <View style={styles.deckInfoContent}>
                  <View style={styles.iconContainer}>
                    <View style={styles.iconInnerGlow} />
                    <MaterialIcons
                      name={deck.icon as any}
                      size={width >= 768 ? 48 : moderateScale(44)}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.deckName}>{deck.name}</Text>
                  <Text style={styles.deckDescription}>{deck.description}</Text>
                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <MaterialIcons
                        name="style"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.statText}>
                        {deck.cards.length} Cards
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
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
            {!isReady ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <>
                <MaterialIcons
                  name="style"
                  size={width >= 768 ? 48 : moderateScale(20)}
                  color={COLORS.background}
                />
                <Text style={styles.actionButtonText}>START PLAYING!</Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: width >= 768 ? 32 : scale(20),
  },
  header: {
    alignItems: "center",
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(32),
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: verticalScale(10),
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    color: "#fff",
    textAlign: "center",
    opacity: 0.85,
    fontWeight: "500",
  },
  deckInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glassCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: scale(24),
    padding: scale(28),
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.4),
    backgroundColor: hexToRgba(COLORS.primary, 0.18),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    width: width >= 768 ? width * 0.65 : width * 0.9,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexToRgba(COLORS.primary, 0.08),
  },
  deckInfoContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: width >= 768 ? 100 : scale(80),
    height: width >= 768 ? 100 : scale(80),
    borderRadius: width >= 768 ? 50 : scale(40),
    backgroundColor: hexToRgba(COLORS.primary, 0.25),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
    position: "relative",
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.3),
  },
  iconInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width >= 768 ? 50 : scale(40),
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
  },
  deckName: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: verticalScale(8),
    letterSpacing: 0.3,
  },
  deckDescription: {
    fontSize: moderateScale(15),
    color: "#ddd",
    textAlign: "center",
    marginBottom: verticalScale(20),
    paddingHorizontal: width >= 768 ? 20 : scale(10),
    lineHeight: moderateScale(22),
  },
  statsContainer: {
    flexDirection: "row",
    gap: width >= 768 ? 24 : scale(16),
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.25),
  },
  statText: {
    fontSize: moderateScale(15),
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIconContainer: {
    width: width >= 768 ? 64 : scale(56),
    height: width >= 768 ? 64 : scale(56),
    borderRadius: width >= 768 ? 32 : scale(28),
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.25),
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: width >= 768 ? 32 : scale(20),
    paddingVertical: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    borderRadius: scale(16),
    gap: scale(10),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enabledButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.background,
    letterSpacing: 0.5,
  },
});
