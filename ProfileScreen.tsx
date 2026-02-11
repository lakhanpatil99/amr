import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { AnimatedCard } from "@/components/AnimatedCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MENU_ITEMS = [
  { id: "addresses", icon: "map-pin", label: "Saved Addresses", color: "#3B82F6" },
  { id: "payment", icon: "credit-card", label: "Payment Methods", color: "#10B981" },
  { id: "notifications", icon: "bell", label: "Notifications", color: "#F59E0B" },
  { id: "help", icon: "help-circle", label: "Help & Support", color: "#8B5CF6" },
  { id: "about", icon: "info", label: "About LDPS", color: "#EC4899" },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadOrderStats();
    }, []),
  );

  const loadOrderStats = async () => {
    const orders = await storage.getOrders();
    setTotalOrders(orders.length);
    setCompletedOrders(orders.filter((o) => o.status === "delivered").length);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleMenuPress = (id: string) => {
    Haptics.selectionAsync();
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <LinearGradient
        colors={[LDPSColors.primary, LDPSColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}
      >
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />

        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText type="h1" style={{ color: LDPSColors.primary }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </ThemedText>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => Haptics.selectionAsync()}
            >
              <Feather name="edit-2" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
          <ThemedText type="h3" style={styles.userName}>
            {user?.name || "User"}
          </ThemedText>
          <ThemedText type="body" style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </ThemedText>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${LDPSColors.primary}15` },
              ]}
            >
              <Feather name="package" size={22} color={LDPSColors.primary} />
            </View>
            <ThemedText type="h2">{totalOrders}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Orders
            </ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${LDPSColors.success}15` },
              ]}
            >
              <Feather name="check-circle" size={22} color={LDPSColors.success} />
            </View>
            <ThemedText type="h2">{completedOrders}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Completed
            </ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${LDPSColors.warning}15` },
              ]}
            >
              <Feather name="star" size={22} color={LDPSColors.warning} />
            </View>
            <ThemedText type="h2">4.8</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Rating
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <AnimatedCard style={styles.infoCard}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Account Details
            </ThemedText>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: `${LDPSColors.primary}15` }]}>
                <Feather name="user" size={16} color={LDPSColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Full Name
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "500" }}>
                  {user?.name || "Not set"}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: `${LDPSColors.success}15` }]}>
                <Feather name="phone" size={16} color={LDPSColors.success} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Phone Number
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "500" }}>
                  {user?.phone || "Not set"}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: `${LDPSColors.warning}15` }]}>
                <Feather name="mail" size={16} color={LDPSColors.warning} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Email Address
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "500" }}>
                  {user?.email || "Not set"}
                </ThemedText>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <AnimatedCard style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <ThemedText type="body" style={{ flex: 1 }}>
                    {item.label}
                  </ThemedText>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
                {index < MENU_ITEMS.length - 1 ? (
                  <View
                    style={[styles.separator, { backgroundColor: theme.border }]}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </AnimatedCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Pressable
            style={[
              styles.logoutButton,
              { borderColor: LDPSColors.error },
            ]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={LDPSColors.error} />
            <ThemedText
              type="body"
              style={{ color: LDPSColors.error, fontWeight: "600" }}
            >
              Logout
            </ThemedText>
          </Pressable>
        </Animated.View>

        <ThemedText
          type="small"
          style={[styles.version, { color: theme.textSecondary }]}
        >
          LDPS v1.0.0
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 60,
    overflow: "hidden",
  },
  headerDecoration1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerDecoration2: {
    position: "absolute",
    bottom: 20,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LDPSColors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    marginTop: -40,
    paddingHorizontal: Spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    marginBottom: 16,
    padding: Spacing.xl,
  },
  cardTitle: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
  menuCard: {
    marginBottom: 24,
    padding: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  version: {
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
  },
});
