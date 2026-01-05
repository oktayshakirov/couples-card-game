import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Avatar } from "../hooks/useGameState";
import { COLORS } from "../constants/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface CustomToastProps {
  text1?: string;
  text2?: string;
  props?: {
    playerColor?: string;
    playerAvatar?: Avatar;
    nextPlayerName?: string;
    choice?: "truth" | "dare";
    onConfirm?: () => void;
    onCancel?: () => void;
  };
}

const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, props }) => {
  const width = useMemo(() => Dimensions.get("window").width, []);
  const playerColor = props?.playerColor || "#666";
  const playerAvatar = props?.playerAvatar;
  const nextPlayerName = props?.nextPlayerName;
  const choice = props?.choice;
  const onConfirm = props?.onConfirm;
  const onCancel = props?.onCancel;
  const hasButtons = onConfirm && onCancel && nextPlayerName && choice;

  const stylesMemo = useMemo(() => createStyles(width), [width]);

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirm?.();
    Toast.hide();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
    Toast.hide();
  };

  return (
    <View
      style={[
        stylesMemo.container,
        { borderLeftColor: playerColor, backgroundColor: "#1a0a0f" },
      ]}
    >
      <View style={stylesMemo.contentRow}>
        {playerAvatar && (
          <View
            style={[stylesMemo.avatarContainer, { borderColor: playerColor }]}
          >
            <MaterialCommunityIcons
              name={playerAvatar as any}
              size={moderateScale(16)}
              color={playerColor}
            />
          </View>
        )}
        <View style={stylesMemo.textContainer}>
          {text1 && (
            <Text style={[stylesMemo.text1, { color: playerColor }]}>
              {text1}
            </Text>
          )}
          {text2 && <Text style={stylesMemo.text2}>{text2}</Text>}
          {hasButtons && (
            <Text style={stylesMemo.questionText}>
              {nextPlayerName},{" "}
              {choice === "dare"
                ? "was the dare completed?"
                : "was the question answered honestly?"}
            </Text>
          )}
        </View>
        {hasButtons && (
          <View style={stylesMemo.buttonsRow}>
            <TouchableOpacity
              style={stylesMemo.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="check"
                size={moderateScale(18)}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={stylesMemo.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="close"
                size={moderateScale(18)}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export const toastConfig = {
  info: ({ text1, text2, props }: CustomToastProps) => (
    <CustomToast text1={text1} text2={text2} props={props} />
  ),
  success: ({ text1, text2, props }: CustomToastProps) => (
    <CustomToast text1={text1} text2={text2} props={props} />
  ),
  error: ({ text1, text2, props }: CustomToastProps) => (
    <CustomToast text1={text1} text2={text2} props={props} />
  ),
};

const createStyles = (width: number) =>
  StyleSheet.create({
    container: {
      minHeight: verticalScale(90),
      width: "98%",
      borderRadius: scale(12),
      borderLeftWidth: 3,
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(10),
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: scale(10),
    },
    avatarContainer: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(10),
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    textContainer: {
      flex: 1,
      flexDirection: "column",
    },
    text1: {
      fontSize: moderateScale(15),
      fontWeight: "700",
      marginBottom: verticalScale(3),
    },
    text2: {
      fontSize: moderateScale(13),
      color: COLORS.text.primary,
      fontWeight: "400",
    },
    questionText: {
      fontSize: moderateScale(12),
      color: COLORS.text.secondary,
      fontWeight: "500",
      fontStyle: "italic",
      marginTop: verticalScale(6),
    },
    buttonsRow: {
      flexDirection: "row",
      gap: scale(10),
      alignItems: "center",
    },
    confirmButton: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: "#50C878",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    cancelButton: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: "#FF6B6B",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
  });

const styles = createStyles(0);
