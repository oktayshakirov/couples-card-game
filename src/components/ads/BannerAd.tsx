import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, AppState, Text } from "react-native";
import { getAdUnitId } from "./adConfig";
import { useAdConsent } from "./useAdConsent";

let BannerAd: any;
let BannerAdSize: any;

try {
  const adsModule = require("react-native-google-mobile-ads");
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
} catch (error) {
  console.warn("react-native-google-mobile-ads not available:", error);
}

const BannerAdComponent = () => {
  const { requestNonPersonalizedAdsOnly } = useAdConsent();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [adKey, setAdKey] = useState(0);
  const appState = useRef(AppState.currentState);

  const handleAdLoaded = () => {
    setIsAdLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAdFailedToLoad = () => {
    setIsAdLoaded(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setIsAdLoaded(false);
        setAdKey((prev) => prev + 1);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const showPlaceholder = !isAdLoaded || !BannerAd || !BannerAdSize;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          opacity: showPlaceholder ? 1 : fadeAnim,
          height: showPlaceholder ? 70 : isAdLoaded ? "auto" : 0,
          overflow: "hidden",
        },
      ]}
    >
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Ad Placeholder</Text>
        </View>
      ) : (
        <BannerAd
          key={adKey}
          unitId={getAdUnitId("banner")!}
          size={BannerAdSize.ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    alignItems: "center",
  },
  placeholder: {
    width: "100%",
    height: 70,
    backgroundColor: "#2a1a2f",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#3a2a3f",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default BannerAdComponent;
