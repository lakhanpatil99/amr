import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isLoading, isLoggedIn } = useAuth();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const pulseScale = useSharedValue(1);

  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.8);
  const ring3Opacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1.15, { duration: 500, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
    );
    logoRotate.value = withSequence(
      withTiming(-5, { duration: 150 }),
      withTiming(5, { duration: 150 }),
      withTiming(0, { duration: 150 }),
    );

    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
    );

    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    subtitleTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
    );

    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );

    ring1Opacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0, { duration: 1000 }),
        ),
        -1,
        false,
      ),
    );
    ring1Scale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(0.8, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );

    ring2Opacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: 1000 }),
          withTiming(0, { duration: 1000 }),
        ),
        -1,
        false,
      ),
    );
    ring2Scale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(0.8, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );

    ring3Opacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.2, { duration: 1000 }),
          withTiming(0, { duration: 1000 }),
        ),
        -1,
        false,
      ),
    );
    ring3Scale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(2.1, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(0.8, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoggedIn, navigation]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  return (
    <LinearGradient
      colors={[LDPSColors.primaryDark, LDPSColors.primary, "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.ring, ring3Style]} />
          <Animated.View style={[styles.ring, ring2Style]} />
          <Animated.View style={[styles.ring, ring1Style]} />

          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoInner}>
              <Feather name="truck" size={48} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        <Animated.View style={textAnimatedStyle}>
          <ThemedText type="h1" style={styles.title}>
            LDPS
          </ThemedText>
        </Animated.View>

        <Animated.View style={subtitleAnimatedStyle}>
          <ThemedText type="body" style={styles.subtitle}>
            Local Delivery Partner Service
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.loadingBar}>
          <LoadingBar />
        </View>
        <ThemedText type="small" style={styles.footerText}>
          Fast & Reliable Delivery
        </ThemedText>
      </View>
    </LinearGradient>
  );
}

function LoadingBar() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.loadingBarContainer}>
      <Animated.View style={[styles.loadingBarProgress, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.5,
    right: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    borderRadius: SCREEN_WIDTH / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -SCREEN_WIDTH * 0.4,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  content: {
    alignItems: "center",
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: 8,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
    gap: 16,
  },
  loadingBar: {
    width: 120,
  },
  loadingBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingBarProgress: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
});
