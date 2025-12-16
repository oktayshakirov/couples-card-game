import { Platform } from "react-native";

export const USE_TEST_ADS = true;

// Lazy import to avoid loading native module when using test ads
let TestIds: any;
if (!USE_TEST_ADS) {
  try {
    TestIds = require("react-native-google-mobile-ads").TestIds;
  } catch (error) {
    console.warn("react-native-google-mobile-ads not available:", error);
  }
}

//Todo: Create new app in admob
export const adUnitIDs = {
  banner: Platform.select({
    ios: "ca-app-pub-5852582960793521/3679843833",
    android: "ca-app-pub-5852582960793521/8692497364",
  }),
  interstitial: Platform.select({
    ios: "ca-app-pub-5852582960793521/7564116438",
    android: "ca-app-pub-5852582960793521/2816569678",
  }),
  appOpen: Platform.select({
    ios: "ca-app-pub-5852582960793521/6510055062",
    android: "ca-app-pub-5852582960793521/4746381400",
  }),
  rewarded: Platform.select({
    ios: "ca-app-pub-5852582960793521/1234567890",
    android: "ca-app-pub-5852582960793521/0987654321",
  }),
};

export const testAdUnitIDs = {
  banner: TestIds?.BANNER || "test-banner",
  interstitial: TestIds?.INTERSTITIAL || "test-interstitial",
  appOpen: TestIds?.APP_OPEN || "test-app-open",
  rewarded: TestIds?.REWARDED || "test-rewarded",
};

type AdType = "banner" | "interstitial" | "appOpen" | "rewarded";

export function getAdUnitId(type: AdType): string | undefined {
  return USE_TEST_ADS ? testAdUnitIDs[type] : adUnitIDs[type];
}
