import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSkip: () => void;
  canSkip: boolean;
}

const ActionButtonsComponent: React.FC<ActionButtonsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSkip,
  canSkip,
}) => {
  const width = useMemo(() => Dimensions.get("window").width, []);
  const stylesMemo = useMemo(() => createStyles(width), [width]);

  const handleSkip = () => {
    if (canSkip) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSkip();
    }
  };

  const handleSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipeLeft();
  };

  const handleSwipeRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipeRight();
  };

  return (
    <View style={stylesMemo.buttonsContainer}>
      <TouchableOpacity
        style={[stylesMemo.button, stylesMemo.leftButton]}
        onPress={handleSwipeLeft}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="arrow-back"
          size={moderateScale(width >= 768 ? 20 : 24)}
          color={COLORS.accent.blue}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          stylesMemo.button,
          stylesMemo.skipButton,
          !canSkip && stylesMemo.disabledButton,
        ]}
        onPress={handleSkip}
        disabled={!canSkip}
        activeOpacity={canSkip ? 0.7 : 1}
      >
        <Ionicons
          name="close"
          size={moderateScale(width >= 768 ? 20 : 24)}
          color={!canSkip ? "#666" : COLORS.text.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[stylesMemo.button, stylesMemo.rightButton]}
        onPress={handleSwipeRight}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="arrow-forward"
          size={moderateScale(width >= 768 ? 20 : 24)}
          color={COLORS.accent.red}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: width >= 768 ? scale(20) : scale(30),
    },
    button: {
      width: width >= 768 ? scale(44) : scale(52),
      height: width >= 768 ? scale(44) : scale(52),
      borderRadius: width >= 768 ? scale(22) : scale(26),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    leftButton: {
      backgroundColor: COLORS.background,
      borderColor: COLORS.accent.blue,
    },
    skipButton: {
      backgroundColor: COLORS.background,
      borderColor: "#666",
    },
    rightButton: {
      backgroundColor: COLORS.background,
      borderColor: COLORS.accent.red,
    },
    disabledButton: {
      backgroundColor: COLORS.background,
      borderColor: "#333",
      opacity: 0.5,
    },
  });

export const ActionButtons = React.memo(ActionButtonsComponent);

const styles = createStyles(0);
