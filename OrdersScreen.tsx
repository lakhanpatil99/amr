import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { storage, Order } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await storage.getOrders();
      setOrders(savedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadOrders();
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
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

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "searching":
        return "Searching";
      case "assigned":
        return "Assigned";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderItem = ({
    item,
    index,
  }: {
    item: Order;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }]}
        onPress={() => {
          Haptics.selectionAsync();
          navigation.navigate("OrderStatus", { orderId: item.id });
        }}
      >
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="h4">{item.id}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <ThemedText
              type="small"
              style={{
                color: getStatusColor(item.status),
                fontWeight: "500",
              }}
            >
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.orderAddresses}>
          <View style={styles.addressRow}>
            <View
              style={[
                styles.addressDot,
                { backgroundColor: LDPSColors.pickupMarker },
              ]}
            />
            <ThemedText type="body" numberOfLines={1} style={{ flex: 1 }}>
              {item.pickupAddress}
            </ThemedText>
          </View>
          <View style={styles.addressConnector}>
            <View
              style={[styles.connectorLine, { backgroundColor: theme.border }]}
            />
          </View>
          <View style={styles.addressRow}>
            <View
              style={[
                styles.addressDot,
                { backgroundColor: LDPSColors.dropMarker },
              ]}
            />
            <ThemedText type="body" numberOfLines={1} style={{ flex: 1 }}>
              {item.dropAddress}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={styles.orderFooter}>
          <View style={styles.footerItem}>
            <Feather name="navigation" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.distance} km
            </ThemedText>
          </View>
          <ThemedText type="h4" style={{ color: LDPSColors.primary }}>
            Rs. {item.price}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
      <View
        style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}
      >
        <Feather name="package" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Orders Yet
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        Your order history will appear here once you book your first delivery.
      </ThemedText>
      <Pressable
        style={[styles.bookButton, { backgroundColor: LDPSColors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate("Main" as any);
        }}
      >
        <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          Book Your First Delivery
        </ThemedText>
      </Pressable>
    </Animated.View>
  );

  if (isLoading) {
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

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: orders.length === 0 ? 1 : undefined,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderItem}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={LDPSColors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    />
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
  orderCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderAddresses: {
    marginBottom: Spacing.md,
  },
  addressRow: {
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
    height: 16,
    justifyContent: "center",
  },
  connectorLine: {
    width: 2,
    height: "100%",
    marginLeft: 4,
  },
  separator: {
    height: 1,
    marginBottom: Spacing.md,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 24,
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
  },
});
