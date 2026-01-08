import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export type WarningType = "error" | "info";

interface DeckWarningProps {
  type: WarningType;
  icon: string;
  message: string;
}

export const DeckWarning: React.FC<DeckWarningProps> = ({
  type,
  icon,
  message,
}) => {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, type), [width, type]);

  return (
    <View style={styles.container}>
      <MaterialIcons
        name={icon as any}
        size={width >= 768 ? 18 : moderateScale(16)}
        color={type === "error" ? "#FF6B6B" : "#FFA500"}
        style={styles.icon}
      />
      <Text style={styles.message}>
        {message}
      </Text>
    </View>
  );
};

const createStyles = (width: number, type: WarningType) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: verticalScale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: scale(12),
      backgroundColor:
        type === "error"
          ? hexToRgba("#FF6B6B", 0.1)
          : hexToRgba("#FFA500", 0.1),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor:
        type === "error"
          ? hexToRgba("#FF6B6B", 0.3)
          : hexToRgba("#FFA500", 0.3),
      width: "100%",
      gap: scale(8),
    },
    icon: {
      marginTop: 2,
    },
    message: {
      fontSize: moderateScale(12),
      color: "#ccc",
      flex: 1,
      textAlign: "left",
      lineHeight: moderateScale(16),
    },
  });

