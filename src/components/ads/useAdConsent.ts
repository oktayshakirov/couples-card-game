import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAdConsent() {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("trackingConsent").then((stored) => {
      setConsent(stored as "granted" | "denied" | null);
    });
  }, []);

  return {
    consent,
    requestNonPersonalizedAdsOnly: consent !== "granted",
  };
}
