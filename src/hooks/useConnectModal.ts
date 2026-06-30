import { useCallback } from "react";
import { Platform, Linking } from "react-native";
import { useRevenueCat } from "./useRevenueCat";
import { getCustomerInfo, hasLifetimeEntitlement } from "../services/revenueCat";
import { unlockAllDecks } from "../utils/deckStorage";

/**
 * Bundles the RevenueCat-backed actions and state that `ConnectModal` needs for
 * its Plan tab, so any screen can render the modal without duplicating logic.
 *
 * @param onUnlocked Optional callback invoked after a restore unlocks the decks
 *   (e.g. to refresh a screen's local list of unlocked decks).
 */
export function useConnectModal(onUnlocked?: () => void | Promise<void>) {
  const {
    isLifetime,
    isAvailable,
    customerInfo,
    devProOverride,
    setDevProOverride,
    showPaywallIfNeeded,
    restore,
    syncCustomerInfo,
  } = useRevenueCat();

  const handleManageInStore = useCallback(async () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    await Linking.openURL(url).catch(() => undefined);
  }, []);

  const handleUpgrade = useCallback(async () => {
    await showPaywallIfNeeded();
  }, [showPaywallIfNeeded]);

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const { success } = await restore();
    if (!success) {
      return false;
    }
    const { customerInfo: info } = await getCustomerInfo();
    const restored = hasLifetimeEntitlement(info);
    if (restored) {
      await unlockAllDecks();
      await syncCustomerInfo();
      await onUnlocked?.();
    }
    return restored;
  }, [restore, syncCustomerInfo, onUnlocked]);

  return {
    isLifetime,
    revenueCatAvailable: isAvailable,
    customerInfo,
    onManageInStore: handleManageInStore,
    onUpgrade: handleUpgrade,
    onRestore: handleRestore,
    devProOverride,
    setDevProOverride,
  };
}
