import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import { getDeckIconSource, isImageIcon } from "../utils/deckIcons";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface DeckUnlockedScreenProps {
  deck: Deck;
  onContinue: () => void;
}

export const DeckUnlockedScreen: React.FC<DeckUnlockedScreenProps> = ({
  deck,
  onContinue,
}) => {
  const { width } = useWindowDimensions();
  const [isReady, setIsReady] = useState(false);
  const stylesMemo = useMemo(() => createStyles(width), [width]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={stylesMemo.absoluteFill}>
      <View style={stylesMemo.backgroundOverlay} />
      <SafeAreaView style={stylesMemo.safeArea} edges={["top", "bottom"]}>
        <View style={stylesMemo.container}>
          <View style={stylesMemo.header}>
            <Text style={stylesMemo.headerTitle}>🎉 Deck Unlocked!</Text>
            <Text style={stylesMemo.headerSubtitle}>
              You've successfully unlocked
            </Text>
          </View>

          <View style={stylesMemo.deckInfo}>
            {!isReady && (
              <View style={stylesMemo.loadingContainer}>
                <View style={stylesMemo.loadingIconContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
                <Text style={stylesMemo.loadingText}>
                  Preparing your deck...
                </Text>
              </View>
            )}

            {isReady && (
              <View style={stylesMemo.glassCard}>
                <View style={stylesMemo.glassTint} />
                <View style={stylesMemo.deckInfoContent}>
                  <View style={stylesMemo.iconContainer}>
                    <View style={stylesMemo.iconInnerGlow} />
                    {isImageIcon(deck.icon) ? (
                      <Image
                        source={getDeckIconSource(deck.icon)}
                        style={{
                          width: width >= 768 ? 80 : moderateScale(64),
                          height: width >= 768 ? 80 : moderateScale(64),
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <MaterialIcons
                        name={deck.icon as any}
                        size={width >= 768 ? 48 : moderateScale(44)}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <Text style={stylesMemo.deckName}>{deck.name}</Text>
                  <Text style={stylesMemo.deckDescription}>
                    {deck.description}
                  </Text>
                  <View style={stylesMemo.statsContainer}>
                    <View style={stylesMemo.stat}>
                      <MaterialIcons
                        name="style"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={stylesMemo.statText}>
                        {deck.cards.length} Cards
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={stylesMemo.buttonContainer}>
          <TouchableOpacity
            style={[
              stylesMemo.actionButton,
              isReady ? stylesMemo.enabledButton : stylesMemo.disabledButton,
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
                <Text style={stylesMemo.actionButtonText}>START PLAYING!</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
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

const styles = createStyles(0); // Will be recalculated in component
