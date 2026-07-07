import { useEffect, useState } from "react";

let AdsConsent: any;
let AdsConsentStatus: any;
try {
  const mod = require("react-native-google-mobile-ads");
  AdsConsent = mod.AdsConsent;
  AdsConsentStatus = mod.AdsConsentStatus;
} catch {}

export async function getRequestNonPersonalizedAdsOnly(): Promise<boolean> {
  if (!AdsConsent || !AdsConsentStatus) return false;
  try {
    const info = await AdsConsent.getConsentInfo();
    const isPersonalized =
      info?.status === AdsConsentStatus.NOT_REQUIRED ||
      info?.status === AdsConsentStatus.OBTAINED;
    return !isPersonalized;
  } catch {
    return false;
  }
}

export function useAdConsent() {
  const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
    useState(false);

  useEffect(() => {
    getRequestNonPersonalizedAdsOnly().then(setRequestNonPersonalizedAdsOnly);
  }, []);

  return { requestNonPersonalizedAdsOnly };
}
