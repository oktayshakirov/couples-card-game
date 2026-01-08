import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";

interface BadgeProps {
  icon?: string | number; // MaterialIcons/Ionicons name or Image source
  iconType?: "material" | "ionicons" | "image";
  text: string;
  iconSize?: number;
  iconColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  icon,
  iconType = "material",
  text,
  iconSize,
  iconColor,
}) => {
  const { width } = useWindowDimensions();
  const stylesMemo = useMemo(() => createStyles(width), [width]);

  const defaultIconSize = width >= 768 ? 14 : 16;
  const size = iconSize || defaultIconSize;
  const color = iconColor || COLORS.primary;

  return (
    <View style={stylesMemo.badge}>
      {icon && iconType === "material" && (
        <MaterialIcons
          name={icon as any}
          size={moderateScale(size)}
          color={color}
        />
      )}
      {icon && iconType === "ionicons" && (
        <Ionicons name={icon as any} size={moderateScale(size)} color={color} />
      )}
      {icon && iconType === "image" && (
        <Image
          source={icon as any}
          style={stylesMemo.badgeIcon}
          resizeMode="contain"
        />
      )}
      <Text style={stylesMemo.badgeText}>{text}</Text>
    </View>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: hexToRgba(COLORS.primary, 0.15),
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(12),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.25),
    },
    badgeText: {
      fontSize: moderateScale(12),
      color: COLORS.text.primary,
      fontWeight: "600",
    },
    badgeIcon: {
      width: moderateScale(16),
      height: moderateScale(16),
    },
  });
