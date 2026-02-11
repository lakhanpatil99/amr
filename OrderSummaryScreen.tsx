import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { storage, generateOrderId, Order } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";
import { Input } from "@/components/Input";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "OrderSummary">;

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash on Delivery", icon: "dollar-sign" as const },
  { id: "upi", name: "UPI Payment", icon: "smartphone" as const },
  { id: "card", name: "Credit/Debit Card", icon: "credit-card" as const },
];

// Vehicle options (UI-only)
const VEHICLES = [
  { id: "bike", name: "Bike", capacity: "30 kg", dims: "40×40×40 cm", multiplier: 1.0, icon: "zap" as const },
  { id: "mini", name: "Mini Truck", capacity: "500 kg", dims: "6×4 ft", multiplier: 1.5, icon: "truck" as const },
  { id: "truck", name: "Truck", capacity: "1000 kg", dims: "8×5 ft", multiplier: 2.0, icon: "truck" as const },
];

export default function OrderSummaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { pickupAddress, dropAddress, distance, price } = route.params;
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(VEHICLES[0].id);
  const [helpersCount, setHelpersCount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string | undefined>(undefined);
  const [discount, setDiscount] = useState<number>(0);

  const baseFare = 40;
  const distanceCharge = price - baseFare;
  const vehicleMultiplier = VEHICLES.find(v => v.id === selectedVehicle)?.multiplier ?? 1;
  const helperFee = helpersCount * 50; // flat UI-only fee
  const total = Math.max(0, Math.round(((baseFare + distanceCharge) * vehicleMultiplier) + helperFee - discount));

  const handleApplyPromo = () => {
    setPromoError(undefined);
    // UI-only promo validation
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code");
      setDiscount(0);
      return;
    }
    if (code === "SAVE20") {
      setDiscount(20);
      setPromoError(undefined);
    } else if (code === "FIRST50") {
      setDiscount(50);
      setPromoError(undefined);
    } else {
      setPromoError("Invalid or expired code");
      setDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const order: Order = {
        id: generateOrderId(),
        pickupAddress,
        dropAddress,
        distance,
        price: total, // use computed UI total
        status: "searching",
        createdAt: new Date().toISOString(),
      };

      await storage.saveOrder(order);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      navigation.reset({
        index: 1,
        routes: [
          { name: "Main" },
          { name: "OrderStatus", params: { orderId: order.id } },
        ],
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h3" style={styles.title}>
          Order Summary
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Review your order before placing
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[
          styles.orderCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <View
              style={[
                styles.addressIcon,
                { backgroundColor: `${LDPSColors.pickupMarker}20` },
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
              <ThemedText type="body">{pickupAddress}</ThemedText>
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
                { backgroundColor: `${LDPSColors.dropMarker}20` },
              ]}
            >
              <Feather name="map-pin" size={14} color={LDPSColors.dropMarker} />
            </View>
            <View style={styles.addressContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Drop
              </ThemedText>
              <ThemedText type="body">{dropAddress}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Vehicle selection */}
        <View style={{ gap: 12 }}>
          <ThemedText type="h4">Choose Vehicle</ThemedText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {VEHICLES.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => setSelectedVehicle(v.id)}
                style={[
                  styles.vehicleOption,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  selectedVehicle === v.id && { borderColor: LDPSColors.primary, backgroundColor: `${LDPSColors.primary}15` },
                ]}
              >
                <Feather
                  name={v.icon}
                  size={18}
                  color={selectedVehicle === v.id ? LDPSColors.primary : theme.textSecondary}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>{v.name}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{v.capacity} • {v.dims}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Helpers add-on */}
        <View style={{ marginTop: 16, gap: 8 }}>
          <ThemedText type="h4">Add Helpers</ThemedText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0,1,2].map((count) => (
              <Pressable
                key={count}
                onPress={() => setHelpersCount(count)}
                style={[
                  styles.helperChip,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  helpersCount === count && { borderColor: LDPSColors.primary, backgroundColor: `${LDPSColors.primary}15` },
                ]}
              >
                <ThemedText type="small">{count} helper{count === 1 ? "" : "s"}</ThemedText>
              </Pressable>
            ))}
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Rs. 50 per helper added (UI only)
          </ThemedText>
        </View>

        {/* Promo code */}
        <View style={{ marginTop: 16, gap: 8 }}>
          <ThemedText type="h4">Promo Code</ThemedText>
          <Input
            placeholder="SAVE20 or FIRST50"
            icon="tag"
            value={promoCode}
            onChangeText={setPromoCode}
            rightIcon="check"
            onRightIconPress={handleApplyPromo}
            error={promoError}
          />
          {discount > 0 ? (
            <ThemedText type="small" style={{ color: LDPSColors.success }}>
              Discount applied: Rs. {discount}
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={styles.totalSection}>
          <ThemedText type="h4">Total Amount</ThemedText>
          <ThemedText type="h2" style={{ color: LDPSColors.primary }}>
            Rs. {total}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.paymentSection}
      >
        <ThemedText type="h4" style={styles.paymentTitle}>
          Payment Method
        </ThemedText>

        {PAYMENT_METHODS.map((method) => (
          <Pressable
            key={method.id}
            style={[
              styles.paymentOption,
              { backgroundColor: theme.backgroundDefault },
              selectedPayment === method.id && {
                borderColor: LDPSColors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPayment(method.id);
            }}
          >
            <View
              style={[
                styles.paymentIcon,
                {
                  backgroundColor:
                    selectedPayment === method.id
                      ? `${LDPSColors.primary}20`
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name={method.icon}
                size={20}
                color={
                  selectedPayment === method.id
                    ? LDPSColors.primary
                    : theme.textSecondary
                }
              />
            </View>
            <ThemedText type="body" style={{ flex: 1 }}>
              {method.name}
            </ThemedText>
            <View
              style={[
                styles.radio,
                {
                  borderColor:
                    selectedPayment === method.id
                      ? LDPSColors.primary
                      : theme.border,
                },
              ]}
            >
              {selectedPayment === method.id ? (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: LDPSColors.primary },
                  ]}
                />
              ) : null}
            </View>
          </Pressable>
        ))}
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button onPress={handlePlaceOrder} loading={isLoading}>
          Place Order
        </Button>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  orderCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: 24,
  },
  addressSection: {
    marginBottom: 4,
  },
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
    height: 20,
    justifyContent: "center",
  },
  connectorLine: {
    width: 2,
    height: "100%",
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
  detailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentSection: {
    gap: 12,
    marginBottom: 24,
  },
  paymentTitle: {
    marginBottom: 4,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: "auto",
  },
});
