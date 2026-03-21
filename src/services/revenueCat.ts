import { Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import { ENTITLEMENT_LIFETIME } from "../constants/revenueCat";
import { getRevenueCatApiKey } from "../utils/revenueCatEnv";

let isConfigured = false;

export type RevenueCatError = {
  code: string;
  message: string;
  userCancelled?: boolean;
};

export async function configureRevenueCat(): Promise<{
  ok: boolean;
  error?: RevenueCatError;
}> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED",
        message: "RevenueCat is not supported on this platform.",
      },
    };
  }

  if (isConfigured) {
    return { ok: true };
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey?.trim()) {
    return {
      ok: false,
      error: { code: "NO_API_KEY", message: "RevenueCat API key is not set." },
    };
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    isConfigured = true;
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    return {
      ok: false,
      error: {
        code: err?.code ?? "CONFIGURE_FAILED",
        message: err?.message ?? String(e),
      },
    };
  }
}

export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}

export function hasLifetimeEntitlement(
  customerInfo: CustomerInfo | null
): boolean {
  if (!customerInfo?.entitlements?.active) {
    return false;
  }
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_LIFETIME]);
}

export async function getCustomerInfo(): Promise<{
  customerInfo: CustomerInfo | null;
  error?: RevenueCatError;
}> {
  if (!isConfigured) {
    return {
      customerInfo: null,
      error: {
        code: "NOT_CONFIGURED",
        message: "RevenueCat has not been configured.",
      },
    };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return { customerInfo };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; userCancelled?: boolean };
    return {
      customerInfo: null,
      error: {
        code: err?.code ?? "GET_CUSTOMER_INFO_FAILED",
        message: err?.message ?? String(e),
        userCancelled: err?.userCancelled,
      },
    };
  }
}

export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo | null;
  error?: RevenueCatError;
}> {
  if (!isConfigured) {
    return {
      customerInfo: null,
      error: {
        code: "NOT_CONFIGURED",
        message: "RevenueCat has not been configured.",
      },
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return { customerInfo };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; userCancelled?: boolean };
    return {
      customerInfo: null,
      error: {
        code: err?.code ?? "RESTORE_FAILED",
        message: err?.message ?? String(e),
        userCancelled: err?.userCancelled,
      },
    };
  }
}
