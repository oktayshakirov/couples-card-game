let subscriptionAdsDisabled = false;

export function setSubscriptionAdsDisabled(disabled: boolean): void {
  subscriptionAdsDisabled = disabled;
}

export function areSubscriptionAdsDisabled(): boolean {
  return subscriptionAdsDisabled;
}
