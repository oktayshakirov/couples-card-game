import { AppOpenAd, AdEventType } from "react-native-google-mobile-ads";
import { getAdUnitId } from "./adConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

let appOpenAd: AppOpenAd | null = null;
let isAppOpenAdLoaded = false;
let isShowingAd = false;
let isLoadingAppOpenAd = false;
let initializingPromise: Promise<void> | null = null;
let appOpenListeners: Array<() => void> = [];
let adLoadTimestamp: number = 0;
const AD_STALE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const AD_BACKGROUND_STALE_MS = 30 * 60 * 1000;

export function cleanupAppOpenAd() {
  cleanupAdInstance();
  if (initializingPromise) {
    initializingPromise = null;
  }
}

function detachListeners() {
  appOpenListeners.forEach((unsubscribe) => unsubscribe());
  appOpenListeners = [];
}

function cleanupAdInstance() {
  if (appOpenAd) {
    try {
      appOpenAd.removeAllListeners();
    } catch {}
  }
  detachListeners();
  appOpenAd = null;
  isAppOpenAdLoaded = false;
  isShowingAd = false;
  isLoadingAppOpenAd = false;
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
  while (
    isLoadingAppOpenAd &&
    !isAppOpenAdLoaded &&
    Date.now() - startTime < timeout
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!isAppOpenAdLoaded) {
    isLoadingAppOpenAd = false;
    throw new Error("Ad load timeout");
  }
}

async function createAppOpenInstance() {
  cleanupAdInstance();

  const consent = await AsyncStorage.getItem("trackingConsent");
  const requestNonPersonalizedAdsOnly = consent !== "granted";

  const ad = AppOpenAd.createForAdRequest(getAdUnitId("appOpen")!, {
    requestNonPersonalizedAdsOnly,
  });

  ad.removeAllListeners();

  appOpenListeners.push(
    ad.addAdEventListener(AdEventType.LOADED, () => {
      isAppOpenAdLoaded = true;
      isLoadingAppOpenAd = false;
      adLoadTimestamp = Date.now();
    })
  );

  appOpenListeners.push(
    ad.addAdEventListener(AdEventType.ERROR, () => {
      isAppOpenAdLoaded = false;
      isShowingAd = false;
      isLoadingAppOpenAd = false;
      adLoadTimestamp = 0;
    })
  );

  appOpenListeners.push(
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isShowingAd = false;
      isAppOpenAdLoaded = false;
      isLoadingAppOpenAd = false;
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

export async function loadAppOpenAd(force = false, backgroundTime?: number) {
  if (isLoadingAppOpenAd && !force) {
    return initializingPromise || Promise.resolve();
  }

  if (initializingPromise && !force) {
    return initializingPromise;
  }

  isLoadingAppOpenAd = true;
  initializingPromise = (async () => {
    try {
      appOpenAd = await createAppOpenInstance();
      appOpenAd.load();
      await waitForAdLoad();
    } catch (error) {
      isLoadingAppOpenAd = false;
      isAppOpenAdLoaded = false;
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

export async function ensureAppOpenAdLoaded(backgroundTime?: number) {
  if (isLoadingAppOpenAd && initializingPromise) {
    await initializingPromise;
    return;
  }

  if (!appOpenAd || isAdStale(backgroundTime)) {
    await loadAppOpenAd(true, backgroundTime);
    return;
  }

  if (!isAppOpenAdLoaded && !isShowingAd && !isLoadingAppOpenAd) {
    try {
      isLoadingAppOpenAd = true;
      appOpenAd.load();
      await waitForAdLoad();
    } catch {
      isLoadingAppOpenAd = false;
      await loadAppOpenAd(true, backgroundTime);
    }
  }
}

export function isAppOpenAdReady() {
  return isAppOpenAdLoaded && !isShowingAd && !isLoadingAppOpenAd;
}

export async function showAppOpenAd() {
  if (isShowingAd || isLoadingAppOpenAd) {
    return;
  }

  if (!appOpenAd || !isAppOpenAdLoaded) {
    await ensureAppOpenAdLoaded();
    if (!appOpenAd || !isAppOpenAdLoaded || isLoadingAppOpenAd) {
      return;
    }
  }

  if (appOpenAd && isAppOpenAdLoaded && !isShowingAd && !isLoadingAppOpenAd) {
    try {
      isShowingAd = true;
      await appOpenAd.show();
    } catch {
      isShowingAd = false;
      isAppOpenAdLoaded = false;
    }
  }
}

export default null;
