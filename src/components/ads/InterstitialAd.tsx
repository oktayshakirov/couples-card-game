import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { getAdUnitId } from "./adConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

let interstitial: InterstitialAd | null = null;
let isAdLoaded = false;
let isShowingAd = false;
let isLoadingInterstitial = false;
let initializingPromise: Promise<void> | null = null;
let interstitialListeners: Array<() => void> = [];
let adLoadTimestamp: number = 0;
const AD_STALE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const AD_BACKGROUND_STALE_MS = 30 * 60 * 1000;

function detachListeners() {
  interstitialListeners.forEach((unsubscribe) => unsubscribe());
  interstitialListeners = [];
}

function cleanupAdInstance() {
  if (interstitial) {
    try {
      interstitial.removeAllListeners();
    } catch {}
  }
  detachListeners();
  interstitial = null;
  isAdLoaded = false;
  isShowingAd = false;
  isLoadingInterstitial = false;
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
    isLoadingInterstitial &&
    !isAdLoaded &&
    Date.now() - startTime < timeout
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!isAdLoaded) {
    isLoadingInterstitial = false;
    throw new Error("Ad load timeout");
  }
}

async function createInterstitialInstance() {
  cleanupAdInstance();

  const consent = await AsyncStorage.getItem("trackingConsent");
  const requestNonPersonalizedAdsOnly = consent !== "granted";

  const ad = InterstitialAd.createForAdRequest(getAdUnitId("interstitial")!, {
    requestNonPersonalizedAdsOnly,
  });

  ad.removeAllListeners();

  interstitialListeners.push(
    ad.addAdEventListener(AdEventType.LOADED, () => {
      isAdLoaded = true;
      isLoadingInterstitial = false;
      adLoadTimestamp = Date.now();
    })
  );

  interstitialListeners.push(
    ad.addAdEventListener(AdEventType.ERROR, () => {
      isAdLoaded = false;
      isShowingAd = false;
      isLoadingInterstitial = false;
      adLoadTimestamp = 0;
    })
  );

  interstitialListeners.push(
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isShowingAd = false;
      isAdLoaded = false;
      isLoadingInterstitial = false;
      adLoadTimestamp = 0;
      if (ad) {
        try {
          isLoadingInterstitial = true;
          ad.load();
          waitForAdLoad().catch(() => {
            isLoadingInterstitial = false;
          });
        } catch {}
      }
    })
  );

  return ad;
}

export async function initializeInterstitial(
  force = false,
  backgroundTime?: number
) {
  if (isLoadingInterstitial && !force) {
    return initializingPromise || Promise.resolve();
  }

  if (initializingPromise && !force) {
    return initializingPromise;
  }

  isLoadingInterstitial = true;
  initializingPromise = (async () => {
    try {
      interstitial = await createInterstitialInstance();
      interstitial.load();
      await waitForAdLoad();
    } catch (error) {
      isLoadingInterstitial = false;
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

export async function ensureInterstitialLoaded(backgroundTime?: number) {
  if (isLoadingInterstitial && initializingPromise) {
    await initializingPromise;
    return;
  }

  if (!interstitial || isAdStale(backgroundTime)) {
    await initializeInterstitial(true, backgroundTime);
    return;
  }

  if (!isAdLoaded && !isShowingAd && !isLoadingInterstitial) {
    try {
      isLoadingInterstitial = true;
      interstitial.load();
      await waitForAdLoad();
    } catch {
      isLoadingInterstitial = false;
      await initializeInterstitial(true, backgroundTime);
    }
  }
}

export function isInterstitialReady() {
  return isAdLoaded && !isShowingAd && !isLoadingInterstitial;
}

export async function showInterstitial() {
  if (isShowingAd || isLoadingInterstitial) {
    return;
  }

  if (!interstitial || !isAdLoaded) {
    await ensureInterstitialLoaded();
    if (!interstitial || !isAdLoaded || isLoadingInterstitial) {
      try {
        await initializeInterstitial(true);
        if (!interstitial || !isAdLoaded || isLoadingInterstitial) {
          return;
        }
      } catch {
        return;
      }
    }
  }

  if (interstitial && isAdLoaded && !isShowingAd && !isLoadingInterstitial) {
    try {
      isShowingAd = true;
      await interstitial.show();
    } catch {
      isShowingAd = false;
      isAdLoaded = false;
      if (interstitial) {
        try {
          isLoadingInterstitial = true;
          interstitial.load();
          waitForAdLoad().catch(() => {
            isLoadingInterstitial = false;
          });
        } catch {}
      }
    }
  }
}

export default null;
