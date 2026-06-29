import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CustomerInfo } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import {
  configureRevenueCat,
  getCustomerInfo,
  restorePurchases,
  hasLifetimeEntitlement,
  type RevenueCatError,
} from "../services/revenueCat";
import { ENTITLEMENT_LIFETIME } from "../constants/revenueCat";

export interface UseRevenueCatResult {
  isLifetime: boolean;
  customerInfo: CustomerInfo | null;
  loading: boolean;
  error: RevenueCatError | null;
  refresh: () => Promise<void>;
  /** Updates customer info without toggling `loading` (e.g. after a local unlock). */
  syncCustomerInfo: () => Promise<void>;
  showPaywall: () => Promise<void>;
  showPaywallIfNeeded: () => Promise<boolean>;
  restore: () => Promise<{ success: boolean; error?: RevenueCatError }>;
  isAvailable: boolean;
  /** Developer-only override for the lifetime state (no-op in production builds). */
  devProOverride: boolean | null;
  setDevProOverride: (value: boolean | null) => Promise<void>;
}

const DEV_PRO_OVERRIDE_KEY = "devProOverride";

const RevenueCatContext = createContext<UseRevenueCatResult | null>(null);

function useRevenueCatImpl(): UseRevenueCatResult {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<RevenueCatError | null>(null);
  const [devProOverride, setDevProOverrideState] = useState<boolean | null>(
    null
  );

  const isAvailable = Platform.OS === "ios" || Platform.OS === "android";

  // Load the persisted developer override (dev builds only).
  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    AsyncStorage.getItem(DEV_PRO_OVERRIDE_KEY).then((stored) => {
      if (stored === "true") {
        setDevProOverrideState(true);
      } else if (stored === "false") {
        setDevProOverrideState(false);
      }
    });
  }, []);

  const setDevProOverride = useCallback(async (value: boolean | null) => {
    setDevProOverrideState(value);
    if (value === null) {
      await AsyncStorage.removeItem(DEV_PRO_OVERRIDE_KEY);
    } else {
      await AsyncStorage.setItem(DEV_PRO_OVERRIDE_KEY, value ? "true" : "false");
    }
  }, []);

  const fetchCustomerInfo = useCallback(async () => {
    if (!isAvailable) {
      setLoading(false);
      return;
    }
    const { customerInfo: info, error: err } = await getCustomerInfo();
    setCustomerInfo(info ?? null);
    setError(err ?? null);
  }, [isAvailable]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isAvailable) {
        setLoading(false);
        return;
      }
      const { ok, error: configError } = await configureRevenueCat();
      if (cancelled) {
        return;
      }
      if (!ok && configError) {
        setError(configError);
        setLoading(false);
        return;
      }
      await fetchCustomerInfo();
      if (!cancelled) {
        setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [isAvailable, fetchCustomerInfo]);

  const refresh = useCallback(async () => {
    if (!isAvailable) {
      return;
    }
    setLoading(true);
    await fetchCustomerInfo();
    setLoading(false);
  }, [isAvailable, fetchCustomerInfo]);

  const syncCustomerInfo = useCallback(async () => {
    if (!isAvailable) {
      return;
    }
    const { customerInfo: info, error: err } = await getCustomerInfo();
    setCustomerInfo(info ?? null);
    setError(err ?? null);
  }, [isAvailable]);

  const showPaywall = useCallback(async () => {
    if (!isAvailable) {
      return;
    }
    try {
      await RevenueCatUI.presentPaywall({ displayCloseButton: true });
      await fetchCustomerInfo();
    } catch {
      await fetchCustomerInfo();
    }
  }, [isAvailable, fetchCustomerInfo]);

  const showPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      return false;
    }
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_LIFETIME,
        displayCloseButton: true,
      });
      await fetchCustomerInfo();
      return result !== PAYWALL_RESULT.NOT_PRESENTED;
    } catch {
      await fetchCustomerInfo();
      return false;
    }
  }, [isAvailable, fetchCustomerInfo]);

  const restore = useCallback(async () => {
    if (!isAvailable) {
      return {
        success: false,
        error: {
          code: "UNSUPPORTED",
          message: "Not available on this platform.",
        },
      };
    }
    setLoading(true);
    const { customerInfo: info, error: err } = await restorePurchases();
    setCustomerInfo(info ?? null);
    setError(err ?? null);
    setLoading(false);
    return { success: Boolean(info && !err), error: err ?? undefined };
  }, [isAvailable]);

  const realIsLifetime = hasLifetimeEntitlement(customerInfo);
  const isLifetime =
    __DEV__ && devProOverride !== null ? devProOverride : realIsLifetime;

  return {
    isLifetime,
    customerInfo,
    loading,
    error,
    refresh,
    syncCustomerInfo,
    showPaywall,
    showPaywallIfNeeded,
    restore,
    isAvailable,
    devProOverride,
    setDevProOverride,
  };
}

export function RevenueCatProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const value = useRevenueCatImpl();
  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat(): UseRevenueCatResult {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) {
    throw new Error("useRevenueCat must be used within RevenueCatProvider");
  }
  return ctx;
}
