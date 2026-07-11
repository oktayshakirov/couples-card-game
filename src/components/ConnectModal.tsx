import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as MailComposer from "expo-mail-composer";
import * as StoreReview from "expo-store-review";
import Constants from "expo-constants";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import type { CustomerInfo } from "react-native-purchases";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";

/* ------------------------------------------------------------------ *
 * Config — fill-in values. Most are derived from the project; the
 * social URLs below are built from the `love.swipe` handle. Remove any
 * row whose account does not exist, or edit the URL constant.
 * ------------------------------------------------------------------ */
const APP_NAME = "Love Swipe";
const CONTACT_EMAIL = "love-swipe@oktayshakirov.com";
const APP_STORE_ID = "6757429065";
const ANDROID_PACKAGE = "com.shadev.loveswipe";
const RATED_FLAG_KEY = "loveswipe_hasRequestedReview";

const TIKTOK_URL = "https://www.tiktok.com/@love.swipe";

const APP_VERSION = Constants.expoConfig?.version ?? "—";

/** Opens the public store listing where the user can read or leave a review. */
function openStoreListing() {
  const url =
    Platform.OS === "ios"
      ? `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  Linking.openURL(url).catch(() => undefined);
}

interface MailOption {
  name: string;
  open: () => Promise<void>;
}

/** Opens the user's default mail handler (or, on Android, the system chooser). */
function openMailto(subject: string, body: string): Promise<void> {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  return Linking.openURL(mailto);
}

/** Last resort when no mail app exists: let the user copy our address. */
function showCopyAddressFallback() {
  Alert.alert(
    "No email app found",
    `Copy our address and send your message from any email app:\n\n${CONTACT_EMAIL}`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy address",
        onPress: () => {
          Clipboard.setStringAsync(CONTACT_EMAIL).catch(() => undefined);
        },
      },
    ]
  );
}

async function sendMail(subject: string, body: string) {
  // Android resolves mailto: to its own app chooser (incl. Gmail), so there's
  // nothing to detect — just open it.
  if (Platform.OS !== "ios") {
    try {
      await openMailto(subject, body);
    } catch {
      showCopyAddressFallback();
    }
    return;
  }

  // iOS: detect installed mail apps, with Gmail prioritized first.
  const enc = (s: string) => encodeURIComponent(s);
  const options: MailOption[] = [];

  // Gmail — note the three-slash "/co" compose path required by the app.
  const gmailUrl = `googlegmail:///co?to=${CONTACT_EMAIL}&subject=${enc(
    subject
  )}&body=${enc(body)}`;
  try {
    if (await Linking.canOpenURL(gmailUrl)) {
      options.push({ name: "Gmail", open: () => Linking.openURL(gmailUrl) });
    }
  } catch {
    // Ignore detection failure.
  }

  // Outlook
  const outlookUrl = `ms-outlook://compose?to=${CONTACT_EMAIL}&subject=${enc(
    subject
  )}&body=${enc(body)}`;
  try {
    if (await Linking.canOpenURL(outlookUrl)) {
      options.push({
        name: "Outlook",
        open: () => Linking.openURL(outlookUrl),
      });
    }
  } catch {
    // Ignore detection failure.
  }

  // Apple Mail — only when an account is configured (so Send actually works).
  try {
    if (await MailComposer.isAvailableAsync()) {
      options.push({
        name: "Apple Mail",
        open: async () => {
          await MailComposer.composeAsync({
            recipients: [CONTACT_EMAIL],
            subject,
            body,
          });
        },
      });
    }
  } catch {
    // Ignore detection failure.
  }

  // No mail app detected: try the default handler, then copy-address fallback.
  if (options.length === 0) {
    try {
      await openMailto(subject, body);
    } catch {
      showCopyAddressFallback();
    }
    return;
  }

  // Exactly one app: open it directly, no need to ask.
  if (options.length === 1) {
    await options[0].open();
    return;
  }

  // Several apps: ask the user which one to use (Gmail listed first).
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: "Send feedback with",
      options: [...options.map((o) => o.name), "Cancel"],
      cancelButtonIndex: options.length,
    },
    (index) => {
      if (index < options.length) {
        options[index].open().catch(() => showCopyAddressFallback());
      }
    }
  );
}

function handleBugReport() {
  const deviceModel = Device.modelName ?? "Unknown device";
  const osVersion = `${Device.osName ?? Platform.OS} ${
    Device.osVersion ?? ""
  }`.trim();
  sendMail(
    `[Bug Report] ${APP_NAME}`,
    `Describe the bug:\n\n\nSteps to reproduce:\n1.\n2.\n3.\n\n--- App info ---\nVersion: ${APP_VERSION}\nDevice: ${deviceModel}\nOS: ${osVersion}\n`
  );
}

function handleFeatureRequest() {
  sendMail(
    `[Feature Request] ${APP_NAME}`,
    `What feature would you like to see?\n\n\nWhy would this be useful?\n\n`
  );
}

function handlePartnership() {
  sendMail(
    `[Partnership] ${APP_NAME}`,
    `Hi ${APP_NAME} team,\n\nI'd like to explore a partnership opportunity.\n\nCompany / Name:\nWebsite:\nProposal:\n\n`
  );
}

async function handleRateApp() {
  // The native in-app review prompt is silent and rate-limited by the OS: it
  // resolves successfully even when nothing is shown (e.g. the user already
  // rated or the yearly cap is hit), and there is no API to detect that.
  // So we only use it the first time, then fall back to the store listing,
  // which always works and shows the user their existing review if any.
  let alreadyRequested = false;
  try {
    alreadyRequested = (await AsyncStorage.getItem(RATED_FLAG_KEY)) === "1";
  } catch {
    // Treat storage failure as "not requested yet".
  }

  const canPrompt = !alreadyRequested && (await StoreReview.isAvailableAsync());

  if (canPrompt) {
    try {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(RATED_FLAG_KEY, "1");
    } catch {
      openStoreListing();
    }
    return;
  }

  // Already prompted before (or native prompt unavailable): give clear feedback
  // and a reliable way to reach the listing.
  Alert.alert(
    "Thanks for your support! 💛",
    `If you've already rated ${APP_NAME}, you're awesome. Want to update your review or leave one now?`,
    [
      { text: "Not now", style: "cancel" },
      { text: "Open store", onPress: openStoreListing },
    ]
  );
}

function handleTikTok() {
  Linking.openURL(TIKTOK_URL).catch(() => undefined);
}

/** Lifetime is this app's only paid tier (one-time "Full Unlock"). */
function getPlanLabel(isLifetime: boolean): string {
  return isLifetime ? "Lifetime" : "Free";
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
  /** Trailing glyph — chevron for in-app actions, open-outline for links. */
  trailing?: keyof typeof Ionicons.glyphMap;
}

const Row: React.FC<RowProps> = ({
  icon,
  iconColor,
  label,
  onPress,
  trailing = "chevron-forward",
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <Ionicons name={icon} size={moderateScale(20)} color={iconColor} />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Ionicons
      name={trailing}
      size={moderateScale(16)}
      color={COLORS.text.secondary}
    />
  </TouchableOpacity>
);

type Tab = "connect" | "plan";

interface ConnectModalProps {
  visible: boolean;
  onClose: () => void;
  /**
   * Which section(s) to show. "both" (default) keeps the tabbed layout;
   * "connect" or "plan" render just that section as a single-purpose sheet
   * with no tab bar.
   */
  mode?: Tab | "both";
  isLifetime?: boolean;
  revenueCatAvailable?: boolean;
  customerInfo?: CustomerInfo | null;
  onManageInStore?: () => Promise<void> | void;
  onUpgrade?: () => Promise<void> | void;
  /** Restores prior purchases. Resolves to `true` when an entitlement is active afterwards. */
  onRestore?: () => Promise<boolean>;
  /** Developer-only override for the lifetime state (no-op in production builds). */
  devProOverride?: boolean | null;
  setDevProOverride?: (value: boolean | null) => Promise<void> | void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  visible,
  onClose,
  mode = "both",
  isLifetime = false,
  revenueCatAvailable = false,
  onManageInStore,
  onUpgrade,
  onRestore,
  devProOverride = null,
  setDevProOverride,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("connect");
  const [restoring, setRestoring] = useState(false);
  const singleMode = mode !== "both";

  const handleRestore = async () => {
    if (!onRestore || restoring) {
      return;
    }
    setRestoring(true);
    try {
      const restored = await onRestore();
      Alert.alert(
        restored ? "Purchases restored" : "Nothing to restore",
        restored
          ? "Your Full Unlock has been restored. 🎉"
          : "We couldn't find a previous purchase on this account."
      );
    } finally {
      setRestoring(false);
    }
  };

  // Always start on the Connect tab each time the tabbed modal opens.
  useEffect(() => {
    if (visible && !singleMode) {
      setActiveTab("connect");
    }
  }, [visible, singleMode]);

  const showPlanTab = !singleMode && revenueCatAvailable;
  const effectiveTab: Tab = singleMode
    ? (mode as Tab)
    : activeTab === "plan" && !showPlanTab
    ? "connect"
    : activeTab;
  const planLabel = getPlanLabel(isLifetime);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheet, { paddingBottom: insets.bottom + verticalScale(8) }]}
        >
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {effectiveTab === "connect" ? "Connect" : "Plan"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="close"
                size={moderateScale(24)}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Tab bar — only in the combined (tabbed) layout */}
          {!singleMode && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab("connect")}
              activeOpacity={0.8}
              style={[
                styles.tab,
                effectiveTab === "connect" && styles.tabActive,
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={moderateScale(15)}
                color={
                  effectiveTab === "connect"
                    ? COLORS.text.primary
                    : COLORS.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  effectiveTab === "connect" && styles.tabLabelActive,
                ]}
              >
                Connect
              </Text>
            </TouchableOpacity>
            {showPlanTab && (
              <TouchableOpacity
                onPress={() => setActiveTab("plan")}
                activeOpacity={0.8}
                style={[
                  styles.tab,
                  effectiveTab === "plan" && styles.tabActive,
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={moderateScale(15)}
                  color={
                    effectiveTab === "plan"
                      ? COLORS.text.primary
                      : COLORS.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    effectiveTab === "plan" && styles.tabLabelActive,
                  ]}
                >
                  Plan
                </Text>
              </TouchableOpacity>
            )}
          </View>
          )}

          {/* Connect tab */}
          {effectiveTab === "connect" && (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>Feedback</Text>
              <Row
                icon="bug-outline"
                iconColor={COLORS.accent.red}
                label="Report a Bug"
                onPress={handleBugReport}
              />
              <Row
                icon="bulb-outline"
                iconColor="#FFD166"
                label="Suggest a Feature"
                onPress={handleFeatureRequest}
              />

              <Text style={styles.sectionLabel}>Community</Text>
              <Row
                icon="star-outline"
                iconColor="#FFB37A"
                label={`Rate ${APP_NAME}`}
                onPress={handleRateApp}
              />
              <Row
                icon="logo-tiktok"
                iconColor={COLORS.text.primary}
                label="Follow on TikTok"
                onPress={handleTikTok}
                trailing="open-outline"
              />

              <Text style={styles.sectionLabel}>Business</Text>
              <Row
                icon="rocket-outline"
                iconColor={COLORS.primary}
                label="Work with Us"
                onPress={handlePartnership}
              />
            </ScrollView>
          )}

          {/* Plan tab */}
          {effectiveTab === "plan" && (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.planCard}>
                <Text style={styles.planCaption}>Current plan</Text>
                <Text style={styles.planValue}>{planLabel}</Text>
              </View>

              {isLifetime ? (
                <>
                  <TouchableOpacity
                    style={styles.planAction}
                    activeOpacity={0.8}
                    onPress={async () => {
                      await onManageInStore?.();
                      onClose();
                    }}
                  >
                    <Ionicons
                      name="card-outline"
                      size={moderateScale(22)}
                      color={COLORS.primary}
                    />
                    <View style={styles.planActionBody}>
                      <Text style={styles.planActionTitle}>
                        Manage in{" "}
                        {Platform.OS === "ios" ? "App Store" : "Play Store"}
                      </Text>
                      <Text style={styles.planActionSubtitle}>
                        View your purchase or manage your account
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={moderateScale(20)}
                      color={COLORS.text.secondary}
                    />
                  </TouchableOpacity>

                  <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>
                      Thank you for supporting {APP_NAME} 💛
                    </Text>
                    <Text style={styles.tipBody}>
                      Your Full Unlock gives you every deck forever — plus any
                      new decks and features we add down the line, at no extra
                      cost.
                    </Text>
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.planAction}
                  activeOpacity={0.8}
                  onPress={async () => {
                    await onUpgrade?.();
                    onClose();
                  }}
                >
                  <Ionicons
                    name="rocket-outline"
                    size={moderateScale(22)}
                    color={COLORS.primary}
                  />
                  <View style={styles.planActionBody}>
                    <Text style={styles.planActionTitle}>Unlock everything</Text>
                    <Text style={styles.planActionSubtitle}>
                      One purchase unlocks all decks and removes ads
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(20)}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}

              {onRestore && !isLifetime && (
                <TouchableOpacity
                  style={styles.restoreButton}
                  activeOpacity={0.8}
                  onPress={handleRestore}
                  disabled={restoring}
                >
                  {restoring ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.text.primary}
                    />
                  ) : (
                    <Text style={styles.restoreButtonText}>
                      Restore Purchases
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {__DEV__ && setDevProOverride && (
                <View style={styles.devCard}>
                  <Text style={styles.devLabel}>Pro plan (dev)</Text>
                  <View style={styles.devSegment}>
                    <TouchableOpacity
                      style={[
                        styles.devOption,
                        devProOverride === true && styles.devOptionActive,
                      ]}
                      onPress={() => setDevProOverride(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.devOptionText,
                          devProOverride === true && styles.devOptionTextActive,
                        ]}
                      >
                        On
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.devOption,
                        devProOverride === false && styles.devOptionActive,
                      ]}
                      onPress={() => setDevProOverride(false)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.devOptionText,
                          devProOverride === false && styles.devOptionTextActive,
                        ]}
                      >
                        Off
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    borderTopWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    maxHeight: "85%",
  },
  handle: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: scale(2),
    backgroundColor: hexToRgba(COLORS.text.primary, 0.2),
    alignSelf: "center",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: scale(20),
    marginBottom: verticalScale(16),
    backgroundColor: hexToRgba(COLORS.primary, 0.08),
    borderRadius: scale(14),
    padding: scale(4),
    gap: scale(4),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    paddingVertical: verticalScale(9),
    borderRadius: scale(10),
  },
  tabActive: {
    backgroundColor: hexToRgba(COLORS.primary, 0.18),
  },
  tabLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  tabLabelActive: {
    color: COLORS.text.primary,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: COLORS.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(8),
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  rowLabel: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  planCard: {
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  planCaption: {
    fontSize: moderateScale(14),
    color: COLORS.text.secondary,
  },
  planValue: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: verticalScale(2),
  },
  planAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  planActionBody: {
    flex: 1,
  },
  planActionTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  planActionSubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.text.secondary,
    marginTop: verticalScale(2),
  },
  tipCard: {
    backgroundColor: hexToRgba(COLORS.primary, 0.12),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.3),
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  tipTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: verticalScale(4),
  },
  tipBody: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    color: COLORS.text.secondary,
  },
  restoreButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.25),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(16),
    minHeight: verticalScale(48),
  },
  restoreButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  devCard: {
    backgroundColor: hexToRgba(COLORS.primary, 0.1),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    padding: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  devLabel: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLORS.text.secondary,
    marginBottom: verticalScale(10),
  },
  devSegment: {
    flexDirection: "row",
    backgroundColor: hexToRgba(COLORS.primary, 0.08),
    borderRadius: scale(10),
    padding: scale(4),
    gap: scale(4),
  },
  devOption: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: "center",
    borderRadius: scale(8),
  },
  devOptionActive: {
    backgroundColor: hexToRgba(COLORS.primary, 0.18),
  },
  devOptionText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  devOptionTextActive: {
    color: COLORS.text.primary,
  },
});
