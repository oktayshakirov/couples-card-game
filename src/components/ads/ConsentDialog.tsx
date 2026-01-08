import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants/colors";
import { initializeGlobalAds } from "./adsManager";

let TrackingTransparency: any;
try {
  TrackingTransparency = require("expo-tracking-transparency");
} catch (error) {}

type ConsentDialogProps = {
  onConsentCompleted: () => void;
};

const ConsentDialog = ({ onConsentCompleted }: ConsentDialogProps) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const checkConsent = useCallback(async () => {
    try {
      const storedConsent = await AsyncStorage.getItem("trackingConsent");
      if (storedConsent === null) {
        setModalVisible(true);
      } else {
        await initializeGlobalAds();
        onConsentCompleted();
      }
    } catch (error) {
      setModalVisible(true);
    }
  }, [onConsentCompleted]);

  useEffect(() => {
    checkConsent();
  }, [checkConsent]);

  const handleConsent = async (consent: "granted" | "denied") => {
    try {
      await AsyncStorage.setItem("trackingConsent", consent);
      setModalVisible(false);

      if (
        consent === "granted" &&
        Platform.OS === "ios" &&
        TrackingTransparency
      ) {
        try {
          const { status } =
            await TrackingTransparency.getTrackingPermissionsAsync();
          const isUndetermined =
            status === TrackingTransparency.PermissionStatus?.UNDETERMINED ||
            status === "undetermined" ||
            status === 0;
          if (isUndetermined) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await TrackingTransparency.requestTrackingPermissionsAsync();
          }
        } catch (error) {}
      }

      await initializeGlobalAds();
      onConsentCompleted();
    } catch (error) {
      setModalVisible(false);
      onConsentCompleted();
    }
  };

  const handleAllow = () => handleConsent("granted");
  const handleDontAllow = () => handleConsent("denied");

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Settings</Text>
            <Text style={styles.subtitle}>Help us improve your experience</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              {Platform.OS === "ios"
                ? "We value your privacy and aim to keep Love Swipe free through personalized ads. You'll see a system dialog next to confirm your choice."
                : "We use data to provide you with a better experience and keep Love Swipe free through personalized ads. Your data is handled securely, and we prioritize your privacy at all times."}
            </Text>

            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>
                • Personalized content and ads
              </Text>
              <Text style={styles.bulletPoint}>• Better app experience</Text>
              <Text style={styles.bulletPoint}>• Support app development</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {Platform.OS === "android" ? (
              <>
                <TouchableOpacity
                  onPress={handleDontAllow}
                  style={[styles.button, styles.declineButton]}
                >
                  <Text style={[styles.buttonText, styles.declineButtonText]}>
                    Don't Allow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAllow}
                  style={[styles.button, styles.allowButton]}
                >
                  <Text style={[styles.buttonText, styles.allowButtonText]}>
                    Allow
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleAllow}
                style={[styles.button, styles.allowButton, styles.singleButton]}
              >
                <Text style={[styles.buttonText, styles.allowButtonText]}>
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
    paddingLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  singleButton: {
    minWidth: 150,
  },
  declineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#404040",
  },
  allowButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  declineButtonText: {
    color: COLORS.text.secondary,
  },
  allowButtonText: {
    color: COLORS.text.primary,
  },
});

export default ConsentDialog;
