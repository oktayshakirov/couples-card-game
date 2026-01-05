import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export type WarningType = "error" | "info";

interface DeckWarningProps {
  type: WarningType;
  icon: string;
  title: string;
  message: string;
}

export const DeckWarning: React.FC<DeckWarningProps> = ({
  type,
  icon,
  title,
  message,
}) => {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, type), [width, type]);

  return (
    <View style={styles.container}>
      <MaterialIcons
        name={icon as any}
        size={width >= 768 ? 28 : moderateScale(24)}
        color={type === "error" ? "#FF6B6B" : "#FFA500"}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const createStyles = (width: number, type: WarningType) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginBottom: verticalScale(10),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(20),
      backgroundColor:
        type === "error"
          ? hexToRgba("#FF6B6B", 0.1)
          : hexToRgba("#FFA500", 0.1),
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor:
        type === "error"
          ? hexToRgba("#FF6B6B", 0.3)
          : hexToRgba("#FFA500", 0.3),
      width: "100%",
    },
    title: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: type === "error" ? "#FF6B6B" : "#FFA500",
      marginTop: verticalScale(5),
      textAlign: "center",
    },
    message: {
      fontSize: moderateScale(13),
      color: "#ccc",
      marginTop: verticalScale(3),
      textAlign: "center",
    },
  });

