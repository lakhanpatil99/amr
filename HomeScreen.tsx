import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AnimatedCard } from "@/components/AnimatedCard";
import { GradientCard } from "@/components/GradientCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { storage, Order } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const OFFERS = [
  {
    id: "1",
    title: "First Delivery Free",
    subtitle: "Use code: LDPSFIRST",
    colors: ["#3B82F6", "#1E40AF"],
    icon: "gift",
  },
  {
    id: "2",
    title: "20% Off Weekends",
    subtitle: "Valid Sat & Sun",
    colors: ["#10B981", "#059669"],
    icon: "percent",
  },
  {
    id: "3",
    title: "Refer & Earn",
    subtitle: "Get Rs. 50 credits",
    colors: ["#F59E0B", "#D97706"],
    icon: "users",
  },
];

const QUICK_ACTIONS = [
  { id: "express", icon: "zap", label: "Express", color: "#EF4444" },
  { id: "scheduled", icon: "clock", label: "Schedule", color: "#8B5CF6" },
  { id: "fragile", icon: "package", label: "Fragile", color: "#EC4899" },
  { id: "bulk", icon: "layers", label: "Bulk", color: "#06B6D4" },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentOrders();
    }, []),
  );

  const loadRecentOrders = async () => {
    const orders = await storage.getOrders();
    setRecentOrders(orders.slice(0, 3));
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadRecentOrders();
  };

  const handleBookDelivery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("PickupDrop", {});
  };

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={LDPSColors.primary}
        />
      }
    >
      <Animated.View
        entering={FadeInDown.delay(50).duration(400)}
        style={styles.greetingSection}
      >
        <View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {getGreeting()}
          </ThemedText>
          <ThemedText type="h3">
            {user?.name || "User"}
          </ThemedText>
        </View>
        <Pressable
          style={[styles.notificationButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <Feather name="bell" size={22} color={theme.text} />
          <View style={styles.notificationDot} />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.section}
      >
        <LinearGradient
          colors={[LDPSColors.primary, LDPSColors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bookingCard}
        >
          <View style={styles.bookingCardDecoration} />

          <View style={styles.bookingContent}>
            <View style={styles.bookingLeft}>
              <ThemedText type="h3" style={{ color: "#FFFFFF" }}>
                Where to deliver?
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}
              >
                Book your next delivery now
              </ThemedText>

              <Pressable
                style={styles.bookingInputFake}
                onPress={handleBookDelivery}
              >
                <Feather name="search" size={18} color="rgba(255,255,255,0.6)" />
                <ThemedText
                  type="body"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Enter pickup location
                </ThemedText>
              </Pressable>
            </View>

            <Animated.View style={[styles.bookingIcon, floatStyle]}>
              <Feather name="truck" size={40} color="rgba(255,255,255,0.3)" />
            </Animated.View>
          </View>

          <Pressable style={styles.bookNowButton} onPress={handleBookDelivery}>
            <ThemedText
              type="body"
              style={{ color: LDPSColors.primary, fontWeight: "700" }}
            >
              Book Now
            </ThemedText>
            <Feather name="arrow-right" size={18} color={LDPSColors.primary} />
          </Pressable>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).duration(400)}
        style={styles.section}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action, index) => (
            <Animated.View
              key={action.id}
              entering={FadeInDown.delay(200 + index * 50).duration(400)}
            >
              <Pressable
                style={[
                  styles.quickAction,
                  { backgroundColor: theme.backgroundDefault },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleBookDelivery();
                }}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Feather
                    name={action.icon as any}
                    size={22}
                    color={action.color}
                  />
                </View>
                <ThemedText type="small" style={styles.quickActionLabel}>
                  {action.label}
                </ThemedText>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.section}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Special Offers
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersContainer}
        >
          {OFFERS.map((offer, index) => (
            <Animated.View
              key={offer.id}
              entering={FadeInRight.delay(250 + index * 100).duration(400)}
            >
              <GradientCard
                colors={offer.colors}
                onPress={() => Haptics.selectionAsync()}
                style={styles.offerCard}
              >
                <View style={styles.offerIcon}>
                  <Feather name={offer.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.offerContent}>
                  <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
                    {offer.title}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}
                  >
                    {offer.subtitle}
                  </ThemedText>
                </View>
              </GradientCard>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Orders
          </ThemedText>
          {recentOrders.length > 0 ? (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate("Main" as any, { screen: "OrdersTab" });
              }}
            >
              <ThemedText type="link" style={{ color: LDPSColors.primary }}>
                View All
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order, index) => (
            <Animated.View
              key={order.id}
              entering={FadeInDown.delay(350 + index * 50).duration(400)}
            >
              <OrderCard
                order={order}
                onPress={() =>
                  navigation.navigate("OrderStatus", { orderId: order.id })
                }
              />
            </Animated.View>
          ))
        ) : (
          <View
            style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="package" size={36} color={theme.textSecondary} />
            </View>
            <ThemedText type="h4" style={{ marginBottom: 4 }}>
              No orders yet
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              Book your first delivery and start saving time!
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function OrderCard({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (order.status) {
      case "searching":
        return LDPSColors.warning;
      case "assigned":
      case "in_transit":
        return LDPSColors.primary;
      case "delivered":
        return LDPSColors.success;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case "searching":
        return "Searching";
      case "assigned":
        return "Assigned";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return order.status;
    }
  };

  return (
    <AnimatedCard onPress={onPress} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <View
            style={[
              styles.orderIdIcon,
              { backgroundColor: `${LDPSColors.primary}15` },
            ]}
          >
            <Feather name="package" size={16} color={LDPSColors.primary} />
          </View>
          <ThemedText type="h4">{order.id}</ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor()}15` },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
          <ThemedText
            type="small"
            style={{ color: getStatusColor(), fontWeight: "600" }}
          >
            {getStatusText()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.orderAddresses}>
        <View style={styles.orderAddress}>
          <View
            style={[
              styles.addressDot,
              { backgroundColor: LDPSColors.pickupMarker },
            ]}
          />
          <ThemedText type="body" numberOfLines={1} style={{ flex: 1 }}>
            {order.pickupAddress}
          </ThemedText>
        </View>
        <View style={styles.addressConnector}>
          <View
            style={[styles.connectorLine, { backgroundColor: theme.border }]}
          />
        </View>
        <View style={styles.orderAddress}>
          <View
            style={[
              styles.addressDot,
              { backgroundColor: LDPSColors.dropMarker },
            ]}
          />
          <ThemedText type="body" numberOfLines={1} style={{ flex: 1 }}>
            {order.dropAddress}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
        <View style={styles.orderStat}>
          <Feather name="navigation" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {order.distance} km
          </ThemedText>
        </View>
        <ThemedText type="h4" style={{ color: LDPSColors.primary }}>
          Rs. {order.price}
        </ThemedText>
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LDPSColors.error,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  bookingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  bookingCardDecoration: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bookingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bookingLeft: {
    flex: 1,
  },
  bookingIcon: {
    justifyContent: "center",
    paddingLeft: 16,
  },
  bookingInputFake: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  bookNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    marginTop: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    width: (SCREEN_WIDTH - 48 - 36) / 4,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontWeight: "500",
  },
  offersContainer: {
    paddingRight: Spacing.xl,
    gap: 12,
  },
  offerCard: {
    width: SCREEN_WIDTH * 0.55,
    height: 140,
    marginRight: 0,
  },
  offerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  offerContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  orderCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderIdIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderAddresses: {
    gap: 4,
    marginBottom: Spacing.md,
  },
  orderAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressConnector: {
    paddingLeft: 4,
    height: 14,
    justifyContent: "center",
  },
  connectorLine: {
    width: 2,
    height: "100%",
    marginLeft: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  orderStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
