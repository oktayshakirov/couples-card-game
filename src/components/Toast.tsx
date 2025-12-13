import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Avatar } from "../hooks/useGameState";

interface CustomToastProps {
  text1?: string;
  text2?: string;
  props?: {
    playerColor?: string;
    playerAvatar?: Avatar;
  };
}

const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, props }) => {
  const playerColor = props?.playerColor || "#666";
  const playerAvatar = props?.playerAvatar;

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: playerColor, backgroundColor: "#1a0a0f" },
      ]}
    >
      <View style={styles.contentRow}>
        {playerAvatar && (
          <View style={[styles.avatarContainer, { borderColor: playerColor }]}>
            <MaterialIcons
              name={playerAvatar as any}
              size={20}
              color={playerColor}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          {text1 && (
            <Text style={[styles.text1, { color: playerColor }]}>{text1}</Text>
          )}
          {text2 && <Text style={styles.text2}>{text2}</Text>}
        </View>
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

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    width: "90%",
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  text1: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "400",
  },
});
