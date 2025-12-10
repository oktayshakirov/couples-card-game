import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import * as TrackingTransparency from "expo-tracking-transparency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

type ConsentDialogProps = {
  onConsentCompleted: () => void;
};

const ConsentDialog = ({ onConsentCompleted }: ConsentDialogProps) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("trackingConsent").then((storedConsent) => {
      if (storedConsent === null) {
        setModalVisible(true);
      } else {
        onConsentCompleted();
      }
    });
  }, []);

  const handleAllow = async () => {
    await AsyncStorage.setItem("trackingConsent", "granted");
    setModalVisible(false);
    if (Platform.OS === "ios") {
      const { status } =
        await TrackingTransparency.requestTrackingPermissionsAsync();
    }
    onConsentCompleted();
  };

  const handleDontAllow = async () => {
    await AsyncStorage.setItem("trackingConsent", "denied");
    setModalVisible(false);
    onConsentCompleted();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Your Privacy & Experience</Text>
          <Text style={styles.message}>
            To keep TheCrypto.wiki free and enjoyable, we ask for your consent
            to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              {"\u2022"} Show you personalized ads that help support our app.
            </Text>
            <Text style={styles.bulletItem}>
              {"\u2022"} Send you push notifications so you never miss new
              posts.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>How we use your data:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              {"\u2022"} We and our partners use your data to show ads that
              match your interests.
            </Text>
            <Text style={styles.bulletItem}>
              {"\u2022"} Your privacy is important to us. All data is handled
              securely.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>You're in control:</Text>
          <Text style={styles.message}>
            You can choose to allow or deny these features at any time.
          </Text>
          <View style={styles.buttonContainer}>
            {Platform.OS === "android" ? (
              <>
                <TouchableOpacity
                  onPress={handleDontAllow}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Don't Allow</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAllow} style={styles.button}>
                  <Text style={[styles.buttonText, styles.agreeButton]}>
                    Allow
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleAllow} style={styles.button}>
                <Text style={[styles.buttonText, styles.continueButton]}>
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 30,
    color: Colors.text,
    textAlign: "center",
  },
  message: {
    marginBottom: 10,
    fontSize: 16,
    color: Colors.text,
    textAlign: "left",
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.highlight,
  },
  continueButton: {
    fontWeight: "bold",
  },
  agreeButton: {
    fontWeight: "bold",
  },
});

export default ConsentDialog;

