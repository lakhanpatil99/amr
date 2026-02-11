import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        setError("Login failed. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError("An error occurred");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={[LDPSColors.primary, LDPSColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.headerContent}
        >
          <View style={styles.logoContainer}>
            <Feather name="truck" size={36} color="#FFFFFF" />
          </View>
          <ThemedText type="h2" style={styles.welcomeText}>
            Welcome Back
          </ThemedText>
          <ThemedText type="body" style={styles.welcomeSubtext}>
            Sign in to continue with LDPS
          </ThemedText>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={[styles.formCard, { backgroundColor: theme.backgroundDefault }]}
          >
            {error ? (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: `${LDPSColors.error}10` },
                ]}
              >
                <Feather
                  name="alert-circle"
                  size={18}
                  color={LDPSColors.error}
                />
                <ThemedText
                  type="small"
                  style={{ color: LDPSColors.error, flex: 1 }}
                >
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <Input
              label="Email or Phone"
              icon="mail"
              placeholder="Enter your email or phone"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              icon="lock"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Pressable style={styles.forgotPassword}>
              <ThemedText
                type="small"
                style={{ color: LDPSColors.primary, fontWeight: "600" }}
              >
                Forgot Password?
              </ThemedText>
            </Pressable>

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, paddingHorizontal: 16 }}
              >
                or continue with
              </ThemedText>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Feather name="smartphone" size={20} color={theme.text} />
              </Pressable>
              <Pressable
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Feather name="mail" size={20} color={theme.text} />
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.footer}
          >
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Don't have an account?{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <ThemedText
                type="body"
                style={{ color: LDPSColors.primary, fontWeight: "700" }}
              >
                Sign Up
              </ThemedText>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 280,
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    overflow: "hidden",
  },
  headerDecoration1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerDecoration2: {
    position: "absolute",
    bottom: 20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtext: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: BorderRadius.md,
    gap: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  loginButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
});
