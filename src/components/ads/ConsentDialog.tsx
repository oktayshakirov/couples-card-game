import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { initializeGlobalAds } from "./adsManager";

let AdsConsent: any;
let AdsConsentStatus: any;
try {
  const mod = require("react-native-google-mobile-ads");
  AdsConsent = mod.AdsConsent;
  AdsConsentStatus = mod.AdsConsentStatus;
} catch {}

let TrackingTransparency: any;
try {
  TrackingTransparency = require("expo-tracking-transparency");
} catch {}

type ConsentDialogProps = {
  onConsentCompleted: () => void;
};

const ConsentDialog = ({ onConsentCompleted }: ConsentDialogProps) => {
  const hasStartedRef = useRef(false);
  const onConsentCompletedRef = useRef(onConsentCompleted);
  onConsentCompletedRef.current = onConsentCompleted;

  useEffect(() => {
    // Run the consent flow exactly once. Guards against re-renders (the parent
    // passes a new inline callback each render) and StrictMode double-invoke,
    // which would otherwise launch concurrent flows and stack the UMP form and
    // the ATT prompt on top of each other.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const run = async () => {
      // Step 1: Google UMP GDPR consent form (EEA/UK/CH only).
      let showedForm = false;
      try {
        if (AdsConsent) {
          const info = await AdsConsent.requestInfoUpdate(
            __DEV__
              ? { debugSettings: { debugGeography: 1 } } // 1 = EEA, remove after testing
              : undefined
          );
          if (
            info?.isConsentFormAvailable &&
            info?.status === AdsConsentStatus?.REQUIRED
          ) {
            await AdsConsent.showForm();
            showedForm = true;
          }
        }
      } catch {}

      // Step 2: Apple ATT prompt — only after the UMP form's dismissal
      // animation has fully settled, otherwise the two modals collide.
      if (Platform.OS === "ios" && TrackingTransparency) {
        try {
          const { status } =
            await TrackingTransparency.getTrackingPermissionsAsync();
          const isUndetermined =
            status === "undetermined" ||
            status === TrackingTransparency.PermissionStatus?.UNDETERMINED ||
            status === 0;
          if (isUndetermined) {
            if (showedForm) {
              await new Promise((resolve) => setTimeout(resolve, 600));
            }
            await TrackingTransparency.requestTrackingPermissionsAsync();
          }
        } catch {}
      }

      await initializeGlobalAds();
      onConsentCompletedRef.current();
    };

    run();
  }, []);

  return null;
};

export default ConsentDialog;
