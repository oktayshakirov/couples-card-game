import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Deck } from "../types/deck";
import { saveCustomDeck, deleteCustomDeck } from "../utils/customDeckStorage";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface EditableCard {
  truth: string;
  dare: string;
}

interface DeckEditorScreenProps {
  /** Deck to edit; omit to create a new one. */
  deck?: Deck;
  onDone: () => void;
  onBack: () => void;
}

const EMPTY_CARD: EditableCard = { truth: "", dare: "" };

// Users write the friendlier @player1 / @player2 in the editor; the game (and
// storage) use the canonical {player1} / {player2} placeholders.
const toEditorFormat = (text: string): string =>
  text.replace(/\{player1\}/gi, "@player1").replace(/\{player2\}/gi, "@player2");

const toStorageFormat = (text: string): string =>
  text.replace(/@player1/gi, "{player1}").replace(/@player2/gi, "{player2}");

export const DeckEditorScreen: React.FC<DeckEditorScreenProps> = ({
  deck,
  onDone,
  onBack,
}) => {
  const { width } = useWindowDimensions();
  const isEditing = !!deck;
  const [name, setName] = useState(deck?.name ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [nsfw, setNsfw] = useState(deck?.nsfw ?? false);
  const [cards, setCards] = useState<EditableCard[]>(
    deck?.cards.map((card) => ({
      truth: toEditorFormat(card.truth),
      dare: toEditorFormat(card.dare),
    })) ?? [{ ...EMPTY_CARD }],
  );
  const [saving, setSaving] = useState(false);

  const stylesMemo = useMemo(() => createStyles(width), [width]);

  const updateCard = (
    index: number,
    field: keyof EditableCard,
    value: string,
  ) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card)),
    );
  };

  const addCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCards((prev) => [...prev, { ...EMPTY_CARD }]);
  };

  const removeCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (saving) return;

    if (!name.trim()) {
      Alert.alert("Deck name missing", "Give your deck a name before saving.");
      return;
    }

    const halfFilledIndex = cards.findIndex(
      (card) => (card.truth.trim() === "") !== (card.dare.trim() === ""),
    );
    if (halfFilledIndex >= 0) {
      Alert.alert(
        "Incomplete card",
        `Card ${halfFilledIndex + 1} needs both a truth and a dare.`,
      );
      return;
    }

    const completeCards = cards.filter(
      (card) => card.truth.trim() && card.dare.trim(),
    );
    if (completeCards.length === 0) {
      Alert.alert(
        "No cards yet",
        "Add at least one card with a truth and a dare.",
      );
      return;
    }

    setSaving(true);
    try {
      await saveCustomDeck({
        id: deck?.id,
        name,
        description,
        nsfw,
        cards: completeCards.map((card) => ({
          truth: toStorageFormat(card.truth),
          dare: toStorageFormat(card.dare),
        })),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      onDone();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deck) return;
    Alert.alert(
      "Delete deck?",
      `"${deck.name}" and all its cards will be gone for good.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCustomDeck(deck.id);
            onDone();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={stylesMemo.container} edges={["top", "bottom"]}>
      <View style={stylesMemo.header}>
        <TouchableOpacity onPress={onBack} style={stylesMemo.headerButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={stylesMemo.title}>
          {isEditing ? "Edit Deck" : "New Deck"}
        </Text>
        {isEditing ? (
          <TouchableOpacity
            onPress={handleDelete}
            style={stylesMemo.headerButton}
          >
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={COLORS.accent.red}
            />
          </TouchableOpacity>
        ) : (
          <View style={stylesMemo.headerButton} />
        )}
      </View>

      <KeyboardAvoidingView
        style={stylesMemo.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={stylesMemo.flex}
          contentContainerStyle={stylesMemo.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={stylesMemo.label}>Deck name</Text>
          <TextInput
            style={stylesMemo.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Our Inside Jokes"
            placeholderTextColor={COLORS.text.secondary}
            maxLength={30}
          />

          <Text style={stylesMemo.label}>Description (optional)</Text>
          <TextInput
            style={stylesMemo.input}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this deck about?"
            placeholderTextColor={COLORS.text.secondary}
            maxLength={90}
          />

          <View style={stylesMemo.switchRow}>
            <View style={stylesMemo.switchTextContainer}>
              <Text style={stylesMemo.switchLabel}>Spicy deck</Text>
              <Text style={stylesMemo.switchHint}>
                Marks the deck as 18+ content
              </Text>
            </View>
            <Switch
              value={nsfw}
              onValueChange={setNsfw}
              trackColor={{
                false: hexToRgba(COLORS.primary, 0.2),
                true: COLORS.primary,
              }}
              thumbColor={COLORS.text.primary}
            />
          </View>

          <View style={stylesMemo.tipContainer}>
            <Ionicons
              name="bulb-outline"
              size={moderateScale(16)}
              color={COLORS.primary}
            />
            <Text style={stylesMemo.tipText}>
              Write @player1 for the player whose turn it is and @player2 for
              their partner - names are filled in automatically during the
              game.
            </Text>
          </View>

          <Text style={stylesMemo.sectionTitle}>Cards ({cards.length})</Text>

          {cards.map((card, index) => (
            <View key={index} style={stylesMemo.cardEditor}>
              <View style={stylesMemo.cardEditorHeader}>
                <Text style={stylesMemo.cardNumber}>Card {index + 1}</Text>
                {cards.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeCard(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons
                      name="close"
                      size={moderateScale(18)}
                      color={COLORS.text.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={stylesMemo.cardFieldRow}>
                <Ionicons
                  name="help-circle"
                  size={moderateScale(18)}
                  color={COLORS.accent.blue}
                />
                <TextInput
                  style={stylesMemo.cardInput}
                  value={card.truth}
                  onChangeText={(text) => updateCard(index, "truth", text)}
                  placeholder="Truth question…"
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                />
              </View>
              <View style={stylesMemo.cardFieldRow}>
                <Ionicons
                  name="flame"
                  size={moderateScale(18)}
                  color={COLORS.accent.red}
                />
                <TextInput
                  style={stylesMemo.cardInput}
                  value={card.dare}
                  onChangeText={(text) => updateCard(index, "dare", text)}
                  placeholder="Dare challenge…"
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={stylesMemo.addCardButton} onPress={addCard}>
            <MaterialIcons
              name="add"
              size={moderateScale(20)}
              color={COLORS.primary}
            />
            <Text style={stylesMemo.addCardText}>Add Card</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={stylesMemo.buttonContainer}>
          <TouchableOpacity
            style={[
              stylesMemo.saveButton,
              saving && stylesMemo.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <MaterialIcons
              name="check"
              size={moderateScale(20)}
              color={COLORS.text.primary}
            />
            <Text style={stylesMemo.saveButtonText}>
              {isEditing ? "Save Changes" : "Create Deck"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (width: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingVertical: verticalScale(14),
    },
    headerButton: {
      width: scale(40),
      height: scale(40),
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: moderateScale(22),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
    scrollContent: {
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(13),
      fontWeight: "600",
      color: COLORS.text.secondary,
      marginBottom: verticalScale(6),
      marginTop: verticalScale(10),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.25),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      color: COLORS.text.primary,
      fontSize: moderateScale(15),
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: verticalScale(16),
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.25),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(10),
    },
    switchTextContainer: {
      flex: 1,
      marginRight: scale(12),
    },
    switchLabel: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      color: COLORS.text.primary,
    },
    switchHint: {
      fontSize: moderateScale(12),
      color: COLORS.text.secondary,
      marginTop: verticalScale(2),
    },
    tipContainer: {
      flexDirection: "row",
      gap: scale(8),
      alignItems: "flex-start",
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(12),
      padding: scale(12),
      marginTop: verticalScale(14),
    },
    tipText: {
      flex: 1,
      fontSize: moderateScale(12),
      color: COLORS.text.secondary,
      lineHeight: moderateScale(17),
    },
    sectionTitle: {
      fontSize: moderateScale(17),
      fontWeight: "700",
      color: COLORS.text.primary,
      marginTop: verticalScale(20),
      marginBottom: verticalScale(10),
    },
    cardEditor: {
      backgroundColor: hexToRgba(COLORS.primary, 0.08),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: hexToRgba(COLORS.primary, 0.2),
      padding: scale(14),
      marginBottom: verticalScale(12),
      gap: verticalScale(10),
    },
    cardEditorHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardNumber: {
      fontSize: moderateScale(12),
      fontWeight: "700",
      color: COLORS.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardFieldRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: scale(8),
    },
    cardInput: {
      flex: 1,
      color: COLORS.text.primary,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(19),
      paddingTop: 0,
      paddingBottom: 0,
    },
    addCardButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      paddingVertical: verticalScale(14),
      borderRadius: scale(16),
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: hexToRgba(COLORS.primary, 0.5),
      marginTop: verticalScale(4),
    },
    addCardText: {
      fontSize: moderateScale(15),
      fontWeight: "700",
      color: COLORS.primary,
    },
    buttonContainer: {
      paddingHorizontal: width >= 768 ? 32 : scale(16),
      paddingVertical: verticalScale(14),
      borderTopWidth: 1,
      borderTopColor: hexToRgba(COLORS.primary, 0.1),
      backgroundColor: COLORS.background,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      backgroundColor: COLORS.primary,
      borderRadius: scale(12),
      paddingVertical: verticalScale(14),
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: moderateScale(17),
      fontWeight: "700",
      color: COLORS.text.primary,
    },
  });
