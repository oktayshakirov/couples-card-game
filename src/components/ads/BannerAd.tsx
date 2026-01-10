import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, AppState, Text } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { MaterialIcons } from "@expo/vector-icons";
import { getAdUnitId } from "./adConfig";
import { useAdConsent } from "../../hooks/useAdConsent";
import { COLORS } from "../../constants/colors";

let BannerAd: any;
let BannerAdSize: any;
let MobileAds: any;

try {
  const adsModule = require("react-native-google-mobile-ads");
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  MobileAds = adsModule.MobileAds;
} catch (error) {}

const BannerAdComponent = () => {
  const { requestNonPersonalizedAdsOnly } = useAdConsent();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [adFailed, setAdFailed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [adKey, setAdKey] = useState(0);
  const appState = useRef(AppState.currentState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAds = async () => {
      if (!isMounted) return;

      if (MobileAds && !isInitialized) {
        try {
          await MobileAds().initialize();
          if (isMounted) {
            setIsInitialized(true);
          }
        } catch {
          if (isMounted) {
            setIsInitialized(true);
          }
        }
      } else if (!MobileAds) {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAds();

    return () => {
      isMounted = false;
    };
  }, [isInitialized]);

  const handleAdLoaded = () => {
    if (!isMountedRef.current) return;
    setIsAdLoaded(true);
    setAdFailed(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAdFailedToLoad = () => {
    if (!isMountedRef.current) return;
    setIsAdLoaded(false);
    setAdFailed(true);
  };

  useEffect(() => {
    isMountedRef.current = true;

    const checkConnectivity = async () => {
      try {
        const state = await NetInfo.fetch();
        if (isMountedRef.current) {
          setIsOnline(state.isConnected ?? false);
        }
      } catch {
        if (isMountedRef.current) {
          setIsOnline(false);
        }
      }
    };

    checkConnectivity();
    const unsubscribeNetInfo = NetInfo.addEventListener(
      (state: NetInfoState) => {
        if (isMountedRef.current) {
          setIsOnline(state.isConnected ?? false);
        }
      }
    );

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (!isMountedRef.current) return;

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setIsAdLoaded(false);
        setAdFailed(false);
        setAdKey((prev) => prev + 1);
        checkConnectivity();
      }
      appState.current = nextAppState;
    });

    return () => {
      isMountedRef.current = false;
      subscription.remove();
      unsubscribeNetInfo();
      fadeAnim.stopAnimation();
      setIsAdLoaded(false);
      setAdFailed(false);
    };
  }, [fadeAnim]);

  const renderPlaceholder = (showWarning: boolean = false) => (
    <View style={styles.placeholderContainer}>
      {showWarning && (
        <View style={styles.offlineContainer}>
          <MaterialIcons name="wifi-off" size={20} color={COLORS.primary} />
          <Text style={styles.placeholderText}>
            Please turn on your internet to have the best experience
          </Text>
        </View>
      )}
    </View>
  );

  const canShowAd = BannerAd && BannerAdSize && isInitialized;
  const adUnitId = getAdUnitId("banner");
  const showPlaceholder = !canShowAd || !adUnitId;

  if (showPlaceholder) {
    return null;
  }

  if (!isOnline) {
    return renderPlaceholder(true);
  }

  if (adFailed) {
    return null;
  }

  if (!isAdLoaded) {
    return (
      <>
        {renderPlaceholder(false)}
        <View style={{ height: 0, overflow: "hidden" }}>
          <BannerAd
            key={adKey}
            unitId={adUnitId!}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly,
            }}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
          />
        </View>
      </>
    );
  }

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <BannerAd
        key={adKey}
        unitId={adUnitId!}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    alignItems: "center",
  },
  placeholderContainer: {
    width: "100%",
    height: 65,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(177, 156, 217, 0.15)",
  },
  offlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default BannerAdComponent;
