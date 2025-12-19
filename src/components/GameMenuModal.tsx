import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { hexToRgba } from "../utils/colorUtils";
import { COLORS } from "../constants/colors";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const stylesMemo = useMemo(() => createStyles(width), [width]);

  const handleEditPlayers = () => {
    onEditPlayers();
    onClose();
  };

  const handleChangeDeck = () => {
    onChangeDeck();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={stylesMemo.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={stylesMemo.container}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[
              stylesMemo.menuContainer,
              {
                paddingTop: Math.max(insets.top, verticalScale(20)),
              },
            ]}
          >
            <View style={stylesMemo.header}>
              <Text style={stylesMemo.title}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={stylesMemo.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={stylesMemo.optionsContainer}>
              <TouchableOpacity
                style={stylesMemo.option}
                onPress={handleEditPlayers}
                activeOpacity={0.7}
              >
                <View style={stylesMemo.optionIconContainer}>
                  <MaterialIcons
                    name="people"
                    size={moderateScale(28)}
                    color={COLORS.primary}
                  />
                </View>
                <View style={stylesMemo.optionContent}>
                  <Text style={stylesMemo.optionTitle}>Edit Players</Text>
                  <Text style={stylesMemo.optionDescription}>
                    Change player names, avatars, or colors
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={stylesMemo.option}
                onPress={handleChangeDeck}
                activeOpacity={0.7}
              >
                <View style={stylesMemo.optionIconContainer}>
                  <MaterialIcons
                    name="style"
                    size={moderateScale(28)}
                    color={COLORS.primary}
                  />
                </View>
                <View style={stylesMemo.optionContent}>
                  <Text style={stylesMemo.optionTitle}>Change Deck</Text>
                  <Text style={stylesMemo.optionDescription}>
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

const createStyles = (width: number) => StyleSheet.create({
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
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
    paddingBottom: verticalScale(24),
    paddingHorizontal: width >= 768 ? 24 : scale(20),
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.primary, 0.2),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    gap: verticalScale(16),
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(18),
    padding: scale(20),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
  },
  optionIconContainer: {
    width: scale(56),
    height: verticalScale(56),
    borderRadius: scale(28),
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(18),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: moderateScale(14),
    color: "#999",
  },
});

const styles = createStyles(0); // Will be recalculated in component
