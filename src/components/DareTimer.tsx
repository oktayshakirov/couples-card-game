import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

/**
 * Extracts the first duration mentioned in a dare ("30 seconds", "for 1 minute",
 * "2 mins"...) and returns it in seconds, or null when the dare has no timed part.
 */
export const parseDareDurationSeconds = (text: string): number | null => {
  const match = text.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?)\b/i);
  if (!match) {
    return null;
  }
  const amount = parseInt(match[1], 10);
  if (!amount || amount <= 0) {
    return null;
  }
  const isMinutes = /^m/i.test(match[2]);
  const seconds = isMinutes ? amount * 60 : amount;
  // Ignore degenerate ("1 second") and absurd ("300 minutes") matches.
  if (seconds < 5 || seconds > 60 * 30) {
    return null;
  }
  return seconds;
};

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

type TimerPhase = "idle" | "running" | "done";

interface DareTimerProps {
  seconds: number;
  accentColor: string;
}

export const DareTimer: React.FC<DareTimerProps> = ({
  seconds,
  accentColor,
}) => {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (phase !== "running") {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setPhase("done");
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          ).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (phase === "idle") {
      setRemaining(seconds);
      setPhase("running");
    } else {
      // Tap while running or done resets the timer.
      setPhase("idle");
      setRemaining(seconds);
    }
  };

  const stylesMemo = useMemo(() => createStyles(accentColor), [accentColor]);

  return (
    <TouchableOpacity
      style={[
        stylesMemo.container,
        phase === "running" && stylesMemo.containerActive,
        phase === "done" && stylesMemo.containerDone,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={phase === "done" ? "check-circle" : "timer"}
        size={moderateScale(16)}
        color={accentColor}
      />
      <Text style={stylesMemo.timeText}>
        {phase === "done" ? "Time's up!" : formatTime(remaining)}
      </Text>
      {phase === "idle" && (
        <View style={stylesMemo.hintDivider}>
          <Text style={stylesMemo.hintText}>start</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (accentColor: string) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: scale(6),
      marginTop: verticalScale(12),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(7),
      borderRadius: scale(20),
      borderWidth: 1.5,
      borderColor: hexToRgba(accentColor, 0.45),
      backgroundColor: hexToRgba(accentColor, 0.1),
    },
    containerActive: {
      borderColor: accentColor,
      backgroundColor: hexToRgba(accentColor, 0.2),
    },
    containerDone: {
      borderColor: hexToRgba(accentColor, 0.7),
      backgroundColor: hexToRgba(accentColor, 0.25),
    },
    timeText: {
      fontSize: moderateScale(14),
      fontWeight: "700",
      color: COLORS.text.primary,
      fontVariant: ["tabular-nums"],
    },
    hintDivider: {
      borderLeftWidth: 1,
      borderLeftColor: hexToRgba(accentColor, 0.4),
      paddingLeft: scale(6),
    },
    hintText: {
      fontSize: moderateScale(10),
      fontWeight: "600",
      color: hexToRgba(accentColor, 0.9),
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });
