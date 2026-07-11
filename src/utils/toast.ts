import Toast from "react-native-toast-message";
import { Avatar } from "../hooks/useGameState";

/** Default top offset, tuned for the layout that includes the banner ad. */
const DEFAULT_TOP_OFFSET = 130;

export interface ShowSkipCountdownParams {
  playerName: string;
  remainingSkips: number;
  playerColor?: string;
  playerAvatar?: Avatar;
  /** Distance from the top of the screen; defaults to the banner-present layout. */
  topOffset?: number;
}

export interface ShowChoiceParams {
  playerName: string;
  playerColor?: string;
  playerAvatar?: Avatar;
  nextPlayerName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Distance from the top of the screen; defaults to the banner-present layout. */
  topOffset?: number;
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

export const showSkipCountdown = ({
  playerName,
  remainingSkips,
  playerColor,
  playerAvatar,
  topOffset = DEFAULT_TOP_OFFSET,
}: ShowSkipCountdownParams): void => {
  const skipsText = remainingSkips === 1 ? "skip" : "skips";

  Toast.show({
    type: "info",
    text1: playerName,
    text2: `has ${remainingSkips} ${skipsText} left`,
    position: "top",
    topOffset,
    visibilityTime: 2500,
    props: {
      playerColor,
      playerAvatar,
    },
  });
};

export const showChoiceToast = ({
  playerName,
  playerColor,
  playerAvatar,
  choice,
  nextPlayerName,
  onConfirm,
  onCancel,
  topOffset = DEFAULT_TOP_OFFSET,
}: ShowChoiceParams & { choice: "truth" | "dare" }): void => {
  Toast.show({
    type: choice === "dare" ? "success" : "info",
    text1: playerName,
    text2: `Picked ${choice === "dare" ? "Dare" : "Truth"}`,
    position: "top",
    topOffset,
    visibilityTime: 999999,
    props: {
      playerColor,
      playerAvatar,
      nextPlayerName,
      choice,
      onConfirm,
      onCancel,
    },
  });
};

export const showTruthToast = (params: ShowChoiceParams): void => {
  showChoiceToast({ ...params, choice: "truth" });
};

export const showDareToast = (params: ShowChoiceParams): void => {
  showChoiceToast({ ...params, choice: "dare" });
};

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

export const showSuccessToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "success", text1, text2 });
};

export const showErrorToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "error", text1, text2 });
};

export const showInfoToast = (
  text1: string,
  text2?: string,
  options?: Omit<ToastConfig, "type" | "text1" | "text2">
): void => {
  showToast({ ...options, type: "info", text1, text2 });
};
