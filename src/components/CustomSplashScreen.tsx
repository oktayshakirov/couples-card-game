import React, { useEffect, useRef, useCallback } from "react";
import { View, Image, StyleSheet, Dimensions, Animated } from "react-native";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const LOADER_COLOR = "#fe6cbe";

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
  isVisible: boolean;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({
  onAnimationComplete,
  isVisible,
}) => {
  const logoRef = useRef<any>(null);
  const waveRef = useRef<any>(null);
  const waveValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const handleFadeOut = useCallback(() => {
    if (logoRef.current) {
      logoRef.current.fadeOut(1000);
    }
    if (waveRef.current) {
      waveRef.current.fadeOut(1000).then(() => {
        onAnimationComplete();
      });
    }
  }, [onAnimationComplete]);

  useEffect(() => {
    if (isVisible) {
      if (logoRef.current) {
        logoRef.current.fadeIn(1200);
      }

      setTimeout(() => {
        if (waveRef.current) {
          waveRef.current.fadeIn(800);
        }

        waveValues.forEach((value, index) => {
          const delay = index * 200;
          Animated.loop(
            Animated.timing(value, {
              toValue: 1,
              duration: 1500,
              delay: delay,
              useNativeDriver: true,
            })
          ).start();
        });
      }, 600);

      const totalDisplayTime = 1200 + 600 + 800 + 1500;
      setTimeout(() => {
        handleFadeOut();
      }, totalDisplayTime);
    }
  }, [isVisible, waveValues, handleFadeOut]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo Section */}
        <Animatable.View ref={logoRef} style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animatable.View>

        {/* Wave Animation Section */}
        <Animatable.View ref={waveRef} style={styles.waveContainer}>
          {waveValues.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  backgroundColor: LOADER_COLOR,
                  transform: [
                    {
                      scaleY: value.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ],
                  opacity: value.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          ))}
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: "#000000",
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: width * 0.85,
    height: height * 0.6,
    maxWidth: 600,
    maxHeight: 800,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  waveBar: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default CustomSplashScreen;
