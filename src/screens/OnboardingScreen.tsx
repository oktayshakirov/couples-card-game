import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useOnboarding,
  OnboardingService,
} from "../contexts/OnboardingContext";
import { COLORS } from "../constants/colors";
import { hexToRgba } from "../utils/colorUtils";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: "favorite",
    title: "Welcome",
    description: "Here's what you need to know to get started.",
  },
  {
    icon: "person",
    title: "Set Up Your Profiles",
    description:
      "Choose a name, pick an avatar and pick your favorite color. Make it yours.",
  },
  {
    icon: "favorite",
    title: "Choose a Deck",
    description:
      "Pick a deck that matches your vibe. Each one has different questions and dares.",
  },
  {
    icon: "swap-horiz",
    title: "Swipe to Pick",
    description:
      "Swipe left for Truth, swipe right for Dare. One choice - one card.",
  },
  {
    icon: "block",
    title: "You Get 3 Skips",
    description:
      "Each player can skip 3 cards total. Save them for when you really need them.",
  },
  {
    icon: "check-circle",
    title: "Your Partner Approves",
    description:
      "After you finish, your partner decides if it counts. Be honest or no points.",
  },
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const steps = ONBOARDING_STEPS;

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  const handleGetStarted = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await OnboardingService.markOnboardingCompleted();
      completeOnboarding();
    } catch (error) {
      if (__DEV__) {
        console.error("Error completing onboarding:", error);
      }
    }
  }, [completeOnboarding]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      animationRef.current = Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, fadeAnim, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      animationRef.current = Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, fadeAnim]);

  const isLastStep = useMemo(
    () => currentStep === steps.length - 1,
    [currentStep, steps.length]
  );
  const isFirstStep = useMemo(() => currentStep === 0, [currentStep]);
  const currentStepData = useMemo(
    () => steps[currentStep],
    [currentStep, steps]
  );
  const progress = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep, steps.length]
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              {
                width: width >= 768 ? scale(80) : scale(70),
                height: width >= 768 ? scale(80) : scale(70),
                borderRadius: (width >= 768 ? scale(80) : scale(70)) / 2,
              },
            ]}
          >
            <Image
              source={require("../../assets/images/icon-simple.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text
            style={[
              styles.appTitle,
              { fontSize: moderateScale(width >= 768 ? 22 : 20) },
            ]}
          >
            Love Swipe
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>

        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.stepCard}>
            <View
              style={[
                styles.iconWrapper,
                {
                  width: width >= 768 ? scale(100) : scale(90),
                  height: width >= 768 ? scale(100) : scale(90),
                  borderRadius: (width >= 768 ? scale(100) : scale(90)) / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    width: width >= 768 ? scale(90) : scale(80),
                    height: width >= 768 ? scale(90) : scale(80),
                    borderRadius: (width >= 768 ? scale(90) : scale(80)) / 2,
                  },
                ]}
              >
                <MaterialIcons
                  name={currentStepData.icon as any}
                  size={moderateScale(width >= 768 ? 48 : 42)}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Text
              style={[
                styles.stepTitle,
                { fontSize: moderateScale(width >= 768 ? 28 : 24) },
              ]}
            >
              {currentStepData.title}
            </Text>

            <Text
              style={[
                styles.stepDescription,
                { fontSize: moderateScale(width >= 768 ? 17 : 16) },
              ]}
            >
              {currentStepData.description}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={isFirstStep}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="chevron-left"
              size={moderateScale(28)}
              color={isFirstStep ? "#444" : COLORS.text.primary}
            />
          </TouchableOpacity>

          {isLastStep ? (
            <TouchableOpacity
              style={[
                styles.getStartedButton,
                {
                  paddingVertical: verticalScale(16),
                  paddingHorizontal: scale(40),
                  borderRadius: scale(30),
                },
              ]}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.getStartedButtonText,
                  { fontSize: moderateScale(width >= 768 ? 18 : 16) },
                ]}
              >
                Get Started
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={moderateScale(20)}
                color={COLORS.text.primary}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="chevron-right"
                size={moderateScale(28)}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.indicatorsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.indicatorActive,
                index < currentStep && styles.indicatorCompleted,
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  logoContainer: {
    backgroundColor: hexToRgba(COLORS.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.25),
    marginBottom: verticalScale(8),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  appTitle: {
    color: COLORS.text.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(16),
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: scale(4),
    backgroundColor: hexToRgba(COLORS.primary, 0.15),
    borderRadius: scale(2),
    overflow: "hidden",
    marginBottom: verticalScale(8),
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: scale(2),
  },
  progressText: {
    color: COLORS.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(32),
  },
  stepCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRgba(COLORS.primary, 0.06),
    borderRadius: scale(32),
    padding: scale(32),
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.primary, 0.12),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    backgroundColor: hexToRgba(COLORS.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.primary, 0.2),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  stepTitle: {
    color: COLORS.text.primary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(16),
    letterSpacing: 0.3,
  },
  stepDescription: {
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: scale(8),
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(16),
    paddingTop: verticalScale(8),
  },
  navButton: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: hexToRgba(COLORS.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: hexToRgba(COLORS.primary, 0.25),
  },
  navButtonDisabled: {
    opacity: 0.4,
    borderColor: "#444",
    backgroundColor: hexToRgba("#666", 0.1),
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    minWidth: scale(160),
  },
  getStartedButtonText: {
    color: COLORS.text.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: scale(6),
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: verticalScale(20),
    gap: scale(6),
  },
  indicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: hexToRgba(COLORS.primary, 0.25),
  },
  indicatorActive: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
  },
  indicatorCompleted: {
    backgroundColor: COLORS.primary,
  },
});
