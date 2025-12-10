import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showInterstitial, ensureInterstitialLoaded } from "./InterstitialAd";
import { showAppOpenAd, ensureAppOpenAdLoaded } from "./AppOpenAd";

const AD_INTERVAL_MS = 60000;

export function initializeGlobalAds() {}

export function useGlobalAds() {
  const appState = useRef(AppState.currentState);
  const lastBackgroundTimeRef = useRef<number>(0);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const currentState = appState.current;

        if (
          currentState === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          lastBackgroundTimeRef.current = Date.now();
        }

        if (
          currentState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          const now = Date.now();
          const backgroundTime =
            lastBackgroundTimeRef.current > 0
              ? now - lastBackgroundTimeRef.current
              : 0;

          try {
            await Promise.all([
              ensureInterstitialLoaded(backgroundTime),
              ensureAppOpenAdLoaded(backgroundTime),
            ]);
          } catch {
            // Ignore ensure errors, will retry next time
          }

          const lastAdShownString = await AsyncStorage.getItem(
            "lastAdShownTime"
          );
          const lastAdShownTime = lastAdShownString
            ? parseInt(lastAdShownString, 10)
            : 0;

          if (now - lastAdShownTime > AD_INTERVAL_MS) {
            try {
              await showAppOpenAd();
              await AsyncStorage.setItem("lastAdShownTime", now.toString());
            } catch {
              // Ignore show errors
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleGlobalPress = async () => {
    const lastAdShownString = await AsyncStorage.getItem("lastAdShownTime");
    const lastAdShownTime = lastAdShownString
      ? parseInt(lastAdShownString, 10)
      : 0;
    const now = Date.now();

    if (now - lastAdShownTime > AD_INTERVAL_MS) {
      try {
        await ensureInterstitialLoaded();
        await showInterstitial();
        await AsyncStorage.setItem("lastAdShownTime", now.toString());
      } catch {}
    }
  };

  return { handleGlobalPress };
}

