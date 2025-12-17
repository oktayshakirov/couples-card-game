import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showInterstitial, initializeInterstitial } from "./InterstitialAd";
import { showAppOpenAd, loadAppOpenAd } from "./AppOpenAd";

const AD_INTERVAL_MS = 60000;
const APP_OPEN_AFTER_AD_COOLDOWN_MS = 30000;

const AD_TYPES = {
  INTERSTITIAL: "interstitial",
  APP_OPEN: "appOpen",
  REWARDED: "rewarded",
};

let MobileAds: any;
try {
  MobileAds = require("react-native-google-mobile-ads").MobileAds;
} catch (error) {
  // Native module not available
}

export async function initializeGoogleMobileAds() {
  if (MobileAds) {
    try {
      await MobileAds().initialize();
    } catch (error) {
      // Ignore initialization errors
    }
  }
}

export async function initializeGlobalAds() {
  try {
    await initializeGoogleMobileAds();
    await Promise.all([initializeInterstitial(), loadAppOpenAd()]);
  } catch (error) {
    setTimeout(() => {
      initializeGlobalAds().catch(() => {
        // Ignore retry errors
      });
    }, 5000);
  }
}

async function canShowAd(adType: string): Promise<boolean> {
  if (adType === AD_TYPES.APP_OPEN) {
    const lastInterstitialString = await AsyncStorage.getItem(
      `lastAdShownTime_${AD_TYPES.INTERSTITIAL}`
    );
    const lastRewardedString = await AsyncStorage.getItem(
      `lastAdShownTime_${AD_TYPES.REWARDED}`
    );

    const now = Date.now();
    let canShow = true;

    if (lastInterstitialString) {
      const lastInterstitialTime = parseInt(lastInterstitialString, 10);
      const timeSinceInterstitial = now - lastInterstitialTime;
      if (timeSinceInterstitial < APP_OPEN_AFTER_AD_COOLDOWN_MS) {
        canShow = false;
      }
    }

    if (lastRewardedString) {
      const lastRewardedTime = parseInt(lastRewardedString, 10);
      const timeSinceRewarded = now - lastRewardedTime;
      if (timeSinceRewarded < APP_OPEN_AFTER_AD_COOLDOWN_MS) {
        canShow = false;
      }
    }

    return canShow;
  }

  const lastAdShownString = await AsyncStorage.getItem(
    `lastAdShownTime_${adType}`
  );

  if (!lastAdShownString) {
    return true;
  }

  const lastAdShownTime = parseInt(lastAdShownString, 10);
  const now = Date.now();
  const timeSinceLastAd = now - lastAdShownTime;

  const canShow = timeSinceLastAd > AD_INTERVAL_MS;
  return canShow;
}

async function updateLastAdShownTime(adType: string) {
  const now = Date.now();
  await AsyncStorage.setItem(`lastAdShownTime_${adType}`, now.toString());
}

export async function showGlobalInterstitial(): Promise<boolean> {
  if (await canShowAd(AD_TYPES.INTERSTITIAL)) {
    try {
      await showInterstitial();
      await updateLastAdShownTime(AD_TYPES.INTERSTITIAL);
      return true;
    } catch (error) {
      // Ignore errors
    }
  }
  return false;
}

export async function trackRewardedAdShown(): Promise<void> {
  await updateLastAdShownTime(AD_TYPES.REWARDED);
}

export function useGlobalAds() {
  const appState = useRef(AppState.currentState);
  const lastAppStateChange = useRef(Date.now());
  const lastAdShownTime = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const now = Date.now();
        const timeSinceLastChange = now - lastAppStateChange.current;
        const timeSinceLastAd = now - lastAdShownTime.current;

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (Platform.OS === "android") {
            if (timeSinceLastChange < 500) {
              return;
            }

            if (timeSinceLastAd < 2000) {
              return;
            }
          }

          if (await canShowAd(AD_TYPES.APP_OPEN)) {
            try {
              await showAppOpenAd();
              await updateLastAdShownTime(AD_TYPES.APP_OPEN);
              lastAdShownTime.current = now;
            } catch (e) {
              // Ignore errors
            }
          }
        }

        lastAppStateChange.current = now;
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
