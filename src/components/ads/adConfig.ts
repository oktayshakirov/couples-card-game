import { Platform } from "react-native";

export const USE_TEST_ADS = true;

let TestIds: any;
try {
  TestIds = require("react-native-google-mobile-ads").TestIds;
} catch (error) {
  console.warn("react-native-google-mobile-ads not available:", error);
}

export const adUnitIDs = {
  banner: Platform.select({
    ios: "ca-app-pub-5852582960793521/2402225991",
    android: "ca-app-pub-5852582960793521/2617848416",
  }),
  interstitial: Platform.select({
    ios: "ca-app-pub-5852582960793521/5029207574",
    android: "ca-app-pub-5852582960793521/5575361850",
  }),
  appOpen: Platform.select({
    ios: "ca-app-pub-5852582960793521/6672821109",
    android: "ca-app-pub-5852582960793521/2758267453",
  }),
  rewarded: Platform.select({
    ios: "ca-app-pub-5852582960793521/1688087733",
    android: "ca-app-pub-5852582960793521/3716125907",
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
