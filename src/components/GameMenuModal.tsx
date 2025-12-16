import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallScreen = height < 700;

interface GameMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onEditPlayers: () => void;
  onChangeDeck: () => void;
}

export const GameMenuModal: React.FC<GameMenuModalProps> = ({
  visible,
  onClose,
  onEditPlayers,
  onChangeDeck,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.menuContainer,
              {
                paddingTop: Math.max(
                  insets.top,
                  isSmallScreen ? 16 : isTablet ? 24 : 20
                ),
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onEditPlayers();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons
                    name="people"
                    size={isSmallScreen ? 24 : isTablet ? 32 : 28}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Edit Players</Text>
                  <Text style={styles.optionDescription}>
                    Change player names, avatars, or colors
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onChangeDeck();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons
                    name="style"
                    size={isSmallScreen ? 24 : isTablet ? 32 : 28}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Change Deck</Text>
                  <Text style={styles.optionDescription}>
                    Select a different card deck
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: isSmallScreen ? 20 : isTablet ? 28 : 24,
    borderBottomRightRadius: isSmallScreen ? 20 : isTablet ? 28 : 24,
    paddingBottom: isSmallScreen ? 20 : isTablet ? 32 : 24,
    paddingHorizontal: isSmallScreen ? 16 : isTablet ? 24 : 20,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.primary, 0.2),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 20 : isTablet ? 28 : 24,
  },
  title: {
    fontSize: isSmallScreen ? 24 : isTablet ? 32 : 28,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    width: isSmallScreen ? 36 : isTablet ? 44 : 40,
    height: isSmallScreen ? 36 : isTablet ? 44 : 40,
    borderRadius: isSmallScreen ? 18 : isTablet ? 22 : 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    gap: isSmallScreen ? 12 : isTablet ? 20 : 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: isSmallScreen ? 16 : isTablet ? 20 : 18,
    padding: isSmallScreen ? 16 : isTablet ? 24 : 20,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
  },
  optionIconContainer: {
    width: isSmallScreen ? 48 : isTablet ? 64 : 56,
    height: isSmallScreen ? 48 : isTablet ? 64 : 56,
    borderRadius: isSmallScreen ? 24 : isTablet ? 32 : 28,
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    alignItems: "center",
    justifyContent: "center",
    marginRight: isSmallScreen ? 16 : isTablet ? 20 : 18,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: isSmallScreen ? 16 : isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14,
    color: "#999",
  },
});
