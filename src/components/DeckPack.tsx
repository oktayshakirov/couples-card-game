import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Deck } from "../types/deck";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";
import {
  getDeckIconSource,
  isImageIcon,
  getBadgeIconSource,
} from "../utils/deckIcons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface DeckPackProps {
  deck: Deck;
  isUnlocked: boolean;
  onPress: (deck: Deck) => void;
  cardDimensions: {
    width: number;
    height: number;
    gap: number;
    lockIconSize: number;
    lockIconBorderRadius: number;
    lockIconBorderWidth: number;
    lockIconIconSize: number;
  };
}

export const DeckPack: React.FC<DeckPackProps> = ({
  deck,
  isUnlocked,
  onPress,
  cardDimensions,
}) => {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);

  return (
    <TouchableOpacity
      style={[
        styles.deckCard,
        {
          width: cardDimensions.width,
          height: cardDimensions.height,
          marginBottom: cardDimensions.gap,
        },
        !isUnlocked && styles.deckCardLocked,
      ]}
      onPress={() => onPress(deck)}
      activeOpacity={0.85}
    >
      <View style={styles.gradientOverlay} />

      {deck.nsfw !== undefined && (
        <View style={styles.badgeContainer}>
          <Image
            source={getBadgeIconSource(deck.nsfw)}
            style={styles.badgeIcon}
            resizeMode="contain"
          />
          <Text
            style={[styles.badgeText, !isUnlocked && styles.badgeTextLocked]}
          >
            {deck.nsfw ? "Spicy" : "Classic"}
          </Text>
        </View>
      )}

      <View style={styles.cardCountBadge}>
        <MaterialIcons
          name="style"
          size={moderateScale(12)}
          color={isUnlocked ? COLORS.primary : "#aaa"}
        />
        <Text
          style={[
            styles.cardCountText,
            !isUnlocked && styles.cardCountTextLocked,
          ]}
        >
          {deck.cards.length}
        </Text>
      </View>

      {!isUnlocked && (
        <View style={styles.lockBadge}>
          <MaterialIcons name="lock" size={moderateScale(16)} color="#aaa" />
        </View>
      )}

      <View style={styles.cardContent}>
        <View
          style={[
            styles.deckIconContainer,
            {
              width: width >= 768 ? scale(72) : scale(64),
              height: width >= 768 ? scale(72) : scale(64),
              borderRadius: width >= 768 ? scale(36) : scale(32),
            },
            isUnlocked && styles.deckIconContainerUnlocked,
          ]}
        >
          {isImageIcon(deck.icon) ? (
            <Image
              source={getDeckIconSource(deck.icon)}
              style={{
                width: width >= 768 ? scale(56) : scale(50),
                height: width >= 768 ? scale(56) : scale(50),
                opacity: isUnlocked ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ) : (
            <MaterialIcons
              name={deck.icon as any}
              size={width >= 768 ? scale(36) : scale(32)}
              color={isUnlocked ? COLORS.primary : COLORS.text.secondary}
            />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.deckName, !isUnlocked && styles.deckNameLocked]}
            numberOfLines={1}
          >
            {deck.name}
          </Text>

          {deck.description && (
            <Text
              style={[
                styles.deckDescription,
                !isUnlocked && styles.deckDescriptionLocked,
              ]}
              numberOfLines={3}
            >
              {deck.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    deckCard: {
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(24),
      padding: width >= 768 ? scale(20) : scale(18),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.2),
      overflow: "hidden",
      position: "relative",
    },
    gradientOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: hexToRgba(COLORS.primary, 0.03),
      borderRadius: scale(24),
    },
    cardContent: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "space-between",
    },
    badgeContainer: {
      position: "absolute",
      top: width >= 768 ? scale(14) : scale(12),
      left: width >= 768 ? scale(14) : scale(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(5),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(5),
      backgroundColor: hexToRgba(COLORS.primary, 0.2),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.35),
      zIndex: 10,
    },
    badgeIcon: {
      width: moderateScale(16),
      height: moderateScale(16),
    },
    badgeText: {
      fontSize: moderateScale(10),
      fontWeight: "700",
      color: COLORS.primary,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    badgeTextLocked: {
      color: "#aaa",
    },
    deckCardLocked: {
      backgroundColor: hexToRgba("#2a1a2a", 0.5),
      borderColor: hexToRgba("#555", 0.3),
      opacity: 0.7,
    },
    lockBadge: {
      position: "absolute",
      top: width >= 768 ? scale(14) : scale(12),
      right: width >= 768 ? scale(14) : scale(12),
      width: width >= 768 ? scale(36) : scale(32),
      height: width >= 768 ? scale(36) : scale(32),
      borderRadius: width >= 768 ? scale(18) : scale(16),
      backgroundColor: hexToRgba(COLORS.primary, 0.2),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.35),
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    deckIconContainer: {
      backgroundColor: hexToRgba(COLORS.primary, 0.12),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: hexToRgba(COLORS.primary, 0.25),
    },
    deckIconContainerUnlocked: {
      borderColor: hexToRgba(COLORS.primary, 0.5),
      backgroundColor: hexToRgba(COLORS.primary, 0.18),
    },
    textContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingTop: verticalScale(16),
      gap: verticalScale(10),
    },
    deckName: {
      fontSize: width >= 768 ? moderateScale(22) : moderateScale(20),
      fontWeight: "700",
      color: COLORS.text.primary,
      textAlign: "center",
      width: "100%",
      lineHeight: width >= 768 ? moderateScale(28) : moderateScale(26),
      letterSpacing: 0.5,
      paddingHorizontal: scale(8),
    },
    deckNameLocked: {
      color: "#aaa",
      opacity: 0.8,
    },
    deckDescription: {
      fontSize: moderateScale(13),
      color: "#d0d0d0",
      textAlign: "center",
      width: "100%",
      lineHeight: moderateScale(18),
      letterSpacing: 0.2,
      paddingHorizontal: scale(8),
      fontWeight: "400",
    },
    deckDescriptionLocked: {
      color: "#888",
      opacity: 0.75,
    },
    cardCountBadge: {
      position: "absolute",
      top: width >= 768 ? scale(58) : scale(52),
      left: width >= 768 ? scale(14) : scale(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(5),
      backgroundColor: hexToRgba(COLORS.primary, 0.2),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.35),
      zIndex: 10,
    },
    cardCountText: {
      fontSize: moderateScale(10),
      color: COLORS.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    cardCountTextLocked: {
      color: "#aaa",
    },
  });
