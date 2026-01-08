import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import {
  showInterstitial,
  initializeInterstitial,
  cleanupInterstitialAd,
} from "./InterstitialAd";
import { showAppOpenAd, loadAppOpenAd, cleanupAppOpenAd } from "./AppOpenAd";
import { cleanupRewardedAd } from "./RewardedAd";
import { OnboardingService } from "../../contexts/OnboardingContext";

let MobileAds: any;
try {
  MobileAds = require("react-native-google-mobile-ads").MobileAds;
} catch (error) {}

export async function initializeGoogleMobileAds() {
  if (MobileAds) {
    try {
      await MobileAds().initialize();
    } catch (error) {}
  }
}

let initializationTimeout: NodeJS.Timeout | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeGlobalAds(force = false) {
  if (isInitialized && !force && initializationPromise) {
    return initializationPromise;
  }

  if (initializationPromise && !force) {
    return initializationPromise;
  }

  if (isInitialized && !force && typeof __DEV__ !== "undefined" && __DEV__) {
    return Promise.resolve();
  }

  initializationPromise = (async () => {
    try {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
        initializationTimeout = null;
      }
      await initializeGoogleMobileAds();
      await Promise.all([initializeInterstitial(), loadAppOpenAd()]);
      isInitialized = true;
    } catch (error) {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      initializationTimeout = setTimeout(() => {
        initializationTimeout = null;
        isInitialized = false;
        initializationPromise = null;
        initializeGlobalAds().catch(() => {});
      }, 5000);
    }
  })();

  return initializationPromise;
}

export function cleanupGlobalAds() {
  if (initializationTimeout) {
    clearTimeout(initializationTimeout);
    initializationTimeout = null;
  }
  initializationPromise = null;
  cleanupInterstitialAd();
  cleanupAppOpenAd();
  cleanupRewardedAd();
  if (globalAdsSubscription) {
    globalAdsSubscription.remove();
    globalAdsSubscription = null;
  }
}

let lastOtherAdShownTime = 0;
const APP_OPEN_AD_COOLDOWN_AFTER_OTHER_ADS_MS = 10000;
const MIN_BACKGROUND_TIME_FOR_APP_OPEN_MS = 3000;

export async function showGlobalInterstitial(): Promise<boolean> {
  try {
    await showInterstitial();
    lastOtherAdShownTime = Date.now();
    return true;
  } catch (error) {
    return false;
  }
}

export async function trackRewardedAdShown(): Promise<void> {
  lastOtherAdShownTime = Date.now();
}

let globalAdsSubscription: any = null;

export function useGlobalAds() {
  const appState = useRef(AppState.currentState);
  const lastAppStateChange = useRef(Date.now());
  const lastAdShownTime = useRef(0);
  const subscriptionRef = useRef<any>(null);
  const isShowingAppOpenAd = useRef(false);

  useEffect(() => {
    if (globalAdsSubscription) {
      globalAdsSubscription.remove();
      globalAdsSubscription = null;
    }

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const now = Date.now();
        const timeSinceLastChange = now - lastAppStateChange.current;
        const timeSinceLastAd = now - lastAdShownTime.current;
        const timeSinceOtherAd = now - lastOtherAdShownTime;

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (isShowingAppOpenAd.current) {
            return;
          }

          if (Platform.OS === "android") {
            if (timeSinceLastChange < 500) {
              return;
            }

            if (timeSinceLastAd < 2000) {
              return;
            }
          }

          const recentlyShownOtherAd =
            timeSinceOtherAd < APP_OPEN_AD_COOLDOWN_AFTER_OTHER_ADS_MS;

          if (recentlyShownOtherAd) {
            return;
          }

          const wasInBackgroundLongEnough =
            timeSinceLastChange >= MIN_BACKGROUND_TIME_FOR_APP_OPEN_MS;
          if (!wasInBackgroundLongEnough) {
            return;
          }

          const isOnboardingCompleted =
            await OnboardingService.isOnboardingCompleted();
          if (isOnboardingCompleted) {
            try {
              isShowingAppOpenAd.current = true;
              await showAppOpenAd();
              lastAdShownTime.current = now;
              setTimeout(() => {
                isShowingAppOpenAd.current = false;
              }, 2000);
            } catch (e) {
              isShowingAppOpenAd.current = false;
            }
          }
        }

        lastAppStateChange.current = now;
        appState.current = nextAppState;
      }
    );

    globalAdsSubscription = subscription;
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (globalAdsSubscription) {
        globalAdsSubscription.remove();
        globalAdsSubscription = null;
      }
    };
  }, []);
}
