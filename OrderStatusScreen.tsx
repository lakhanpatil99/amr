import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { AnimatedCard } from "@/components/AnimatedCard";
import { useTheme } from "@/hooks/useTheme";
import { storage, Order } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "OrderStatus">;

type OrderStatus = "searching" | "assigned" | "in_transit" | "delivered";

const STATUSES: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "searching", label: "Searching", icon: "search" },
  { key: "assigned", label: "Assigned", icon: "user-check" },
  { key: "in_transit", label: "In Transit", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "check-circle" },
];

const DRIVER_NAMES = [
  "Raj Kumar",
  "Amit Singh",
  "Vikash Sharma",
  "Priya Patel",
  "Rahul Verma",
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OrderStatusScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const pulseScale = useSharedValue(1);
  const waveProgress = useSharedValue(0);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && order.status !== "delivered") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );

      waveProgress.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );

      const statusProgression = setInterval(async () => {
        setCurrentStatusIndex((prev) => {
          if (prev < STATUSES.length - 1) {
            const newIndex = prev + 1;
            const newStatus = STATUSES[newIndex].key;

            Haptics.notificationAsync(
              newStatus === "delivered"
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Warning,
            );

            if (newStatus === "assigned") {
              const driverName =
                DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
              const driverRating = (Math.random() * 1 + 4).toFixed(1);
              storage.updateOrderStatus(
                orderId,
                newStatus,
                driverName,
                parseFloat(driverRating),
              );
              setOrder((prevOrder) =>
                prevOrder
                  ? {
                      ...prevOrder,
                      status: newStatus,
                      driverName,
                      driverRating: parseFloat(driverRating),
                    }
                  : null,
              );
            } else {
              storage.updateOrderStatus(orderId, newStatus);
              setOrder((prevOrder) =>
                prevOrder ? { ...prevOrder, status: newStatus } : null,
              );
            }

            return newIndex;
          }
          return prev;
        });
      }, 5000);

      return () => clearInterval(statusProgression);
    }
  }, [order?.id]);

  const loadOrder = async () => {
    const orders = await storage.getOrders();
    const foundOrder = orders.find((o) => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
      const statusIndex = STATUSES.findIndex(
        (s) => s.key === foundOrder.status,
      );
      setCurrentStatusIndex(statusIndex >= 0 ? statusIndex : 0);
    }
  };

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!order) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="body">Loading...</ThemedText>
      </View>
    );
  }

  const currentStatus = STATUSES[currentStatusIndex];
  const isDelivered = currentStatus.key === "delivered";

  const getStatusMessage = () => {
    switch (currentStatus.key) {
      case "searching":
        return "Looking for the best delivery partner near you...";
      case "assigned":
        return `${order.driverName} is on the way to pick up your package!`;
      case "in_transit":
        return "Your package is on its way to the destination!";
      case "delivered":
        return "Your package has been delivered successfully!";
      default:
        return "";
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.headerSection}
      >
        <View style={styles.orderIdRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Order ID
          </ThemedText>
          <Pressable
            style={[styles.copyButton, { backgroundColor: theme.backgroundDefault }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <Feather name="copy" size={14} color={theme.textSecondary} />
          </Pressable>
        </View>
        <ThemedText type="h3">{order.id}</ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).duration(400)}
        style={styles.statusSection}
      >
        <LinearGradient
          colors={
            isDelivered
              ? [LDPSColors.success, "#059669"]
              : [LDPSColors.primary, LDPSColors.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <View style={styles.statusCardDecoration} />

          <Animated.View
            style={[styles.statusIconContainer, !isDelivered && pulseAnimatedStyle]}
          >
            <Feather
              name={currentStatus.icon as any}
              size={36}
              color="#FFFFFF"
            />
          </Animated.View>

          <ThemedText type="h3" style={styles.statusTitle}>
            {currentStatus.label}
          </ThemedText>

          <ThemedText type="body" style={styles.statusMessage}>
            {getStatusMessage()}
          </ThemedText>

          {!isDelivered ? (
            <View style={styles.estimatedTime}>
              <Feather name="clock" size={16} color="rgba(255,255,255,0.8)" />
              <ThemedText
                type="small"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Estimated: 15-20 mins
              </ThemedText>
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.section, { paddingHorizontal: Spacing.xl }]}
      >
        <View
          style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }]}
        >
          {STATUSES.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isLast = index === STATUSES.length - 1;

            return (
              <View key={status.key} style={styles.progressStep}>
                <View style={styles.progressIndicator}>
                  <View
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: isCompleted
                          ? LDPSColors.success
                          : theme.backgroundSecondary,
                        borderColor: isCompleted
                          ? LDPSColors.success
                          : theme.border,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  {!isLast ? (
                    <View
                      style={[
                        styles.progressLine,
                        {
                          backgroundColor:
                            index < currentStatusIndex
                              ? LDPSColors.success
                              : theme.border,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.progressContent}>
                  <ThemedText
                    type="body"
                    style={[
                      styles.progressLabel,
                      {
                        fontWeight: isCurrent ? "700" : "400",
                        color: isCompleted ? theme.text : theme.textSecondary,
                      },
                    ]}
                  >
                    {status.label}
                  </ThemedText>
                  {isCurrent && !isDelivered ? (
                    <View style={styles.currentBadge}>
                      <ThemedText
                        type="small"
                        style={{ color: LDPSColors.primary }}
                      >
                        Current
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {order.driverName ? (
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={[styles.section, { paddingHorizontal: Spacing.xl }]}
        >
          <AnimatedCard style={styles.driverCard}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Delivery Partner
            </ThemedText>

            <View style={styles.driverInfo}>
              <View
                style={[styles.driverAvatar, { backgroundColor: LDPSColors.primary }]}
              >
                <ThemedText type="h3" style={{ color: "#FFFFFF" }}>
                  {order.driverName.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.driverDetails}>
                <ThemedText type="h4">{order.driverName}</ThemedText>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={14} color={LDPSColors.warning} />
                  <ThemedText type="small">{order.driverRating}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {" "}
                    (127 trips)
                  </ThemedText>
                </View>
              </View>
              <View style={styles.driverActions}>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: `${LDPSColors.success}15` },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Feather name="phone" size={18} color={LDPSColors.success} />
                </Pressable>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: `${LDPSColors.primary}15` },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Feather
                    name="message-circle"
                    size={18}
                    color={LDPSColors.primary}
                  />
                </Pressable>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={[styles.section, { paddingHorizontal: Spacing.xl }]}
      >
        <AnimatedCard style={styles.detailsCard}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Delivery Details
          </ThemedText>

          <View style={styles.addressSection}>
            <View style={styles.addressRow}>
              <View
                style={[
                  styles.addressIcon,
                  { backgroundColor: `${LDPSColors.pickupMarker}15` },
                ]}
              >
                <Feather
                  name="circle"
                  size={14}
                  color={LDPSColors.pickupMarker}
                />
              </View>
              <View style={styles.addressContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pickup
                </ThemedText>
                <ThemedText type="body">{order.pickupAddress}</ThemedText>
              </View>
            </View>

            <View style={styles.addressConnector}>
              <View
                style={[styles.connectorLine, { backgroundColor: theme.border }]}
              />
            </View>

            <View style={styles.addressRow}>
              <View
                style={[
                  styles.addressIcon,
                  { backgroundColor: `${LDPSColors.dropMarker}15` },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={14}
                  color={LDPSColors.dropMarker}
                />
              </View>
              <View style={styles.addressContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Drop
                </ThemedText>
                <ThemedText type="body">{order.dropAddress}</ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.orderStats}>
            <View style={styles.orderStat}>
              <Feather name="navigation" size={18} color={theme.textSecondary} />
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Distance
                </ThemedText>
                <ThemedText type="h4">{order.distance} km</ThemedText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.orderStat}>
              <Feather name="credit-card" size={18} color={theme.textSecondary} />
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Amount
                </ThemedText>
                <ThemedText type="h4" style={{ color: LDPSColors.primary }}>
                  Rs. {order.price}
                </ThemedText>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </Animated.View>

      {!isDelivered ? (
        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.cancelSection}
        >
          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.goBack();
            }}
          >
            <ThemedText type="body" style={{ color: LDPSColors.error }}>
              Cancel Order
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  statusSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    overflow: "hidden",
  },
  statusCardDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  statusMessage: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  progressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  progressIndicator: {
    alignItems: "center",
    width: 28,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  progressLine: {
    width: 2,
    height: 32,
    marginVertical: 4,
  },
  progressContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 16,
    paddingBottom: 24,
  },
  progressLabel: {},
  currentBadge: {
    backgroundColor: `${LDPSColors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  driverCard: {
    padding: Spacing.xl,
  },
  cardTitle: {
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  driverDetails: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsCard: {
    padding: Spacing.xl,
  },
  addressSection: {},
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  addressContent: {
    flex: 1,
    gap: 2,
  },
  addressConnector: {
    paddingLeft: 15,
    height: 24,
    justifyContent: "center",
  },
  connectorLine: {
    width: 2,
    height: "100%",
  },
  separator: {
    height: 1,
    marginVertical: 20,
  },
  orderStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 16,
  },
  cancelSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: 8,
  },
  cancelButton: {
    alignItems: "center",
    padding: Spacing.lg,
  },
});
