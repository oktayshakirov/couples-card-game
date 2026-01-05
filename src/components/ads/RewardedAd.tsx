import { getAdUnitId } from "./adConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

let RewardedAd: any;
let RewardedAdEventType: any;
let AdEventType: any;

try {
  const adsModule = require("react-native-google-mobile-ads");
  RewardedAd = adsModule.RewardedAd;
  RewardedAdEventType = adsModule.RewardedAdEventType;
  AdEventType = adsModule.AdEventType;
} catch (error) {
  console.warn("react-native-google-mobile-ads not available:", error);
}

let rewardedAd: any = null;
let isAdLoaded = false;
let isShowingAd = false;
let isLoadingRewarded = false;
let initializingPromise: Promise<void> | null = null;
let rewardedAdListeners: Array<() => void> = [];
let adLoadTimestamp: number = 0;
const AD_STALE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const AD_BACKGROUND_STALE_MS = 30 * 60 * 1000;

export function cleanupRewardedAd() {
  cleanupAdInstance();
  if (initializingPromise) {
    initializingPromise = null;
  }
}

function detachListeners() {
  rewardedAdListeners.forEach((unsubscribe) => unsubscribe());
  rewardedAdListeners = [];
}

function cleanupAdInstance() {
  if (rewardedAd) {
    try {
      rewardedAd.removeAllListeners();
    } catch {}
  }
  detachListeners();
  rewardedAd = null;
  isAdLoaded = false;
  isShowingAd = false;
  isLoadingRewarded = false;
  adLoadTimestamp = 0;
}

function isAdStale(backgroundTime?: number): boolean {
  if (!adLoadTimestamp) return true;
  const timeSinceLoad = Date.now() - adLoadTimestamp;
  if (backgroundTime !== undefined && backgroundTime > AD_BACKGROUND_STALE_MS) {
    return true;
  }
  return timeSinceLoad > AD_STALE_TIMEOUT_MS;
}

async function waitForAdLoad(timeout = 10000): Promise<void> {
  const startTime = Date.now();
  while (isLoadingRewarded && !isAdLoaded && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!isAdLoaded) {
    isLoadingRewarded = false;
    throw new Error("Ad load timeout");
  }
}

async function createRewardedInstance() {
  cleanupAdInstance();

  if (!RewardedAd) {
    throw new Error("RewardedAd module not available");
  }

  const consent = await AsyncStorage.getItem("trackingConsent");
  const requestNonPersonalizedAdsOnly = consent !== "granted";

  const ad = RewardedAd.createForAdRequest(getAdUnitId("rewarded")!, {
    requestNonPersonalizedAdsOnly,
  });

  ad.removeAllListeners();

  rewardedAdListeners.push(
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isAdLoaded = true;
      isLoadingRewarded = false;
      adLoadTimestamp = Date.now();
    })
  );

  rewardedAdListeners.push(
    ad.addAdEventListener(AdEventType.ERROR, () => {
      isAdLoaded = false;
      isShowingAd = false;
      isLoadingRewarded = false;
      adLoadTimestamp = 0;
    })
  );

  rewardedAdListeners.push(
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isShowingAd = false;
      isAdLoaded = false;
      isLoadingRewarded = false;
      adLoadTimestamp = 0;
      if (ad) {
        try {
          ad.load();
        } catch {}
      }
    })
  );

  return ad;
}

export async function initializeRewarded(
  force = false,
  backgroundTime?: number
) {
  if (!RewardedAd) {
    return Promise.resolve();
  }

  if (isLoadingRewarded && !force) {
    return initializingPromise || Promise.resolve();
  }

  if (initializingPromise && !force) {
    return initializingPromise;
  }

  isLoadingRewarded = true;
  initializingPromise = (async () => {
    try {
      rewardedAd = await createRewardedInstance();
      rewardedAd.load();
      await waitForAdLoad();
    } catch (error) {
      isLoadingRewarded = false;
      isAdLoaded = false;
      adLoadTimestamp = 0;
      initializingPromise = null;
      throw error;
    }
  })();

  try {
    await initializingPromise;
  } finally {
    initializingPromise = null;
  }
}

export async function ensureRewardedLoaded(backgroundTime?: number) {
  if (!RewardedAd) {
    return;
  }

  if (isLoadingRewarded && initializingPromise) {
    await initializingPromise;
    return;
  }

  if (!rewardedAd || isAdStale(backgroundTime)) {
    await initializeRewarded(true, backgroundTime);
    return;
  }

  if (!isAdLoaded && !isShowingAd && !isLoadingRewarded) {
    try {
      isLoadingRewarded = true;
      rewardedAd.load();
      await waitForAdLoad();
    } catch {
      isLoadingRewarded = false;
      await initializeRewarded(true, backgroundTime);
    }
  }
}

export function isRewardedAdModuleAvailable(): boolean {
  return !!RewardedAd;
}

export function isRewardedReady() {
  if (!RewardedAd) {
    return false;
  }
  return isAdLoaded && !isShowingAd && !isLoadingRewarded;
}

export async function showRewardedAd(
  onRewarded?: (reward: { type: string; amount: number }) => void
): Promise<boolean> {
  if (!RewardedAd) {
    if (onRewarded) {
      setTimeout(() => {
        onRewarded({ type: "test", amount: 1 });
      }, 100);
    }
    return true;
  }

  if (isShowingAd || isLoadingRewarded) {
    return false;
  }

  if (!rewardedAd || !isAdLoaded) {
    await ensureRewardedLoaded();
    if (!rewardedAd || !isAdLoaded || isLoadingRewarded) {
      return false;
    }
  }

  if (rewardedAd && isAdLoaded && !isShowingAd && !isLoadingRewarded) {
    try {
      isShowingAd = true;

      const rewardListener = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: { type: string; amount: number }) => {
          if (onRewarded) {
            onRewarded(reward);
          }
        }
      );

      await rewardedAd.show();

      return new Promise((resolve) => {
        const closedListener = rewardedAd!.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            rewardListener();
            closedListener();
            resolve(true);
          }
        );
      });
    } catch {
      isShowingAd = false;
      isAdLoaded = false;
      return false;
    }
  }

  return false;
}

export default null;
