import Toast from "react-native-toast-message";
import { Avatar } from "../hooks/useGameState";

const DEFAULT_TOAST_CONFIG = {
  position: "top" as const,
  topOffset: 130,
  visibilityTime: 2500,
};

export interface ShowSkipCountdownParams {
  playerName: string;
  remainingSkips: number;
  playerColor?: string;
  playerAvatar?: Avatar;
}

export interface ShowChoiceParams {
  playerName: string;
  playerColor?: string;
  playerAvatar?: Avatar;
}

export interface ToastConfig {
  text1?: string;
  text2?: string;
  type?: "success" | "error" | "info";
  position?: "top" | "bottom";
  visibilityTime?: number;
  topOffset?: number;
  bottomOffset?: number;
  props?: Record<string, any>;
}

/**
 * Shows a toast notification for skip countdown
 * @param params - Player name and remaining skips
 */
export const showSkipCountdown = ({
  playerName,
  remainingSkips,
  playerColor,
  playerAvatar,
}: ShowSkipCountdownParams): void => {
  const skipsText = remainingSkips === 1 ? "skip" : "skips";

  Toast.show({
    type: "info",
    text1: playerName,
    text2: `has ${remainingSkips} ${skipsText} left`,
    ...DEFAULT_TOAST_CONFIG,
    visibilityTime: 3000, // Override for skip countdown
    props: {
      playerColor,
      playerAvatar,
    },
  });
};

/**
 * Shows a toast notification when a player picks Truth or Dare
 * @param params - Player name, color, avatar, and choice type
 */
export const showChoiceToast = ({
  playerName,
  playerColor,
  playerAvatar,
  choice,
}: ShowChoiceParams & { choice: "truth" | "dare" }): void => {
  Toast.show({
    type: choice === "dare" ? "success" : "info",
    text1: playerName,
    text2: `Picked ${choice === "dare" ? "Dare" : "Truth"}`,
    ...DEFAULT_TOAST_CONFIG,
    props: {
      playerColor,
      playerAvatar,
    },
  });
};

/**
 * Shows a toast notification when a player picks Truth
 * @param params - Player name and color
 */
export const showTruthToast = (params: ShowChoiceParams): void => {
  showChoiceToast({ ...params, choice: "truth" });
};

/**
 * Shows a toast notification when a player picks Dare
 * @param params - Player name and color
 */
export const showDareToast = (params: ShowChoiceParams): void => {
  showChoiceToast({ ...params, choice: "dare" });
};

/**
 * Generic toast utility function
 * @param config - Toast configuration
 */
export const showToast = (config: ToastConfig): void => {
  Toast.show({
    type: config.type || "info",
    text1: config.text1,
    text2: config.text2,
    position: config.position || "top",
    visibilityTime: config.visibilityTime || 3000,
    topOffset: config.topOffset,
    bottomOffset: config.bottomOffset,
    props: config.props,
  });
};

/**
 * Show success toast
 */
export const showSuccessToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "success", text1, text2 });
};

/**
 * Show error toast
 */
export const showErrorToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "error", text1, text2 });
};

/**
 * Show info toast
 */
export const showInfoToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "info", text1, text2 });
};
