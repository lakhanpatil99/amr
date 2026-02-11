import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
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
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AnimatedCard } from "@/components/AnimatedCard";
import { useTheme } from "@/hooks/useTheme";
import { calculateDistance, calculatePrice } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "PickupDrop">;

const SAMPLE_ADDRESSES = [
  "123 Main Street, Downtown",
  "456 Park Avenue, Midtown",
  "789 Oak Lane, Suburbs",
  "321 Market Square, City Center",
  "555 Business Park, Tech Hub",
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PickupDropScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [pickupAddress, setPickupAddress] = useState(
    route.params?.pickupAddress ||
      SAMPLE_ADDRESSES[Math.floor(Math.random() * SAMPLE_ADDRESSES.length)],
  );
  const [dropAddress, setDropAddress] = useState(
    route.params?.dropAddress ||
      SAMPLE_ADDRESSES[Math.floor(Math.random() * SAMPLE_ADDRESSES.length)],
  );
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);

  const arrowY = useSharedValue(0);

  useEffect(() => {
    arrowY.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    if (pickupAddress && dropAddress) {
      const dist = calculateDistance();
      const calculatedPrice = calculatePrice(dist);
      setDistance(dist);
      setPrice(calculatedPrice);
    }
  }, [pickupAddress, dropAddress]);

  const handleEditLocation = (type: "pickup" | "drop") => {
    Haptics.selectionAsync();
    navigation.navigate("Map", {
      type,
      currentAddress: type === "pickup" ? pickupAddress : dropAddress,
    });
  };

  const handleConfirmOrder = () => {
    if (!pickupAddress || !dropAddress) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("OrderSummary", {
      pickupAddress,
      dropAddress,
      distance,
      price,
    });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
  }));

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: Spacing.xl,
        flexGrow: 1,
      }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h3" style={styles.title}>
          Confirm Locations
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Review and edit your delivery locations
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).duration(400)}
        style={styles.locationsContainer}
      >
        <Pressable
          style={[
            styles.locationCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
          onPress={() => handleEditLocation("pickup")}
        >
          <View style={styles.locationTop}>
            <View
              style={[
                styles.locationIcon,
                { backgroundColor: `${LDPSColors.pickupMarker}15` },
              ]}
            >
              <Feather
                name="circle"
                size={18}
                color={LDPSColors.pickupMarker}
              />
            </View>
            <View style={styles.locationBadge}>
              <ThemedText type="small" style={{ color: LDPSColors.pickupMarker }}>
                Pickup
              </ThemedText>
            </View>
          </View>
          <ThemedText type="h4" style={styles.locationAddress} numberOfLines={2}>
            {pickupAddress || "Tap to select pickup location"}
          </ThemedText>
          <View style={styles.editHint}>
            <Feather name="edit-2" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Tap to edit
            </ThemedText>
          </View>
        </Pressable>

        {/* Quick picks for pickup */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {SAMPLE_ADDRESSES.map((addr) => (
            <Pressable
              key={`pickup-${addr}`}
              onPress={() => setPickupAddress(addr)}
              style={[styles.addressChip, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <ThemedText type="small" numberOfLines={1}>{addr}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.connector}>
          <View style={[styles.connectorLine, { backgroundColor: theme.border }]} />
          <Animated.View
            style={[
              styles.connectorArrow,
              { backgroundColor: theme.backgroundDefault },
              arrowStyle,
            ]}
          >
            <Feather name="arrow-down" size={18} color={LDPSColors.primary} />
          </Animated.View>
          <View style={[styles.connectorLine, { backgroundColor: theme.border }]} />
        </View>

        <Pressable
          style={[
            styles.locationCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
          onPress={() => handleEditLocation("drop")}
        >
          <View style={styles.locationTop}>
            <View
              style={[
                styles.locationIcon,
                { backgroundColor: `${LDPSColors.dropMarker}15` },
              ]}
            >
              <Feather name="map-pin" size={18} color={LDPSColors.dropMarker} />
            </View>
            <View style={[styles.locationBadge, { backgroundColor: `${LDPSColors.dropMarker}15` }]}>
              <ThemedText type="small" style={{ color: LDPSColors.dropMarker }}>
                Drop
              </ThemedText>
            </View>
          </View>
          <ThemedText type="h4" style={styles.locationAddress} numberOfLines={2}>
            {dropAddress || "Tap to select drop location"}
          </ThemedText>
          <View style={styles.editHint}>
            <Feather name="edit-2" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Tap to edit
            </ThemedText>
          </View>
        </Pressable>
        {/* Quick picks for drop */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {SAMPLE_ADDRESSES.map((addr) => (
            <Pressable
              key={`drop-${addr}`}
              onPress={() => setDropAddress(addr)}
              style={[styles.addressChip, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <ThemedText type="small" numberOfLines={1}>{addr}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {pickupAddress && dropAddress ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <LinearGradient
            colors={[LDPSColors.primary, LDPSColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={styles.summaryDecoration} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <Feather name="navigation" size={20} color="#FFFFFF" />
                </View>
                <ThemedText type="small" style={styles.summaryLabel}>
                  Distance
                </ThemedText>
                <View style={styles.summaryValueRow}>
                  <ThemedText type="h2" style={{ color: "#FFFFFF" }}>
                    {distance}
                  </ThemedText>
                  <ThemedText type="body" style={styles.summaryUnit}>
                    km
                  </ThemedText>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <Feather name="credit-card" size={20} color="#FFFFFF" />
                </View>
                <ThemedText type="small" style={styles.summaryLabel}>
                  Estimated
                </ThemedText>
                <View style={styles.summaryValueRow}>
                  <ThemedText type="small" style={styles.summaryUnit}>
                    Rs.
                  </ThemedText>
                  <ThemedText type="h2" style={{ color: "#FFFFFF" }}>
                    {price}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <ThemedText type="small" style={styles.priceLabel}>
                  Base Fare
                </ThemedText>
                <ThemedText type="small" style={styles.priceValue}>
                  Rs. 40
                </ThemedText>
              </View>
              <View style={styles.priceRow}>
                <ThemedText type="small" style={styles.priceLabel}>
                  Distance ({distance} km x Rs. 12)
                </ThemedText>
                <ThemedText type="small" style={styles.priceValue}>
                  Rs. {price - 40}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(250).duration(400)}
        style={styles.featuresRow}
      >
        <View style={[styles.feature, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="shield" size={18} color={LDPSColors.success} />
          <ThemedText type="small">Safe</ThemedText>
        </View>
        <View style={[styles.feature, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="clock" size={18} color={LDPSColors.warning} />
          <ThemedText type="small">Fast</ThemedText>
        </View>
        <View style={[styles.feature, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-circle" size={18} color={LDPSColors.primary} />
          <ThemedText type="small">Reliable</ThemedText>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleConfirmOrder}
          disabled={!pickupAddress || !dropAddress}
        >
          Continue to Summary
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
  locationsContainer: {
    marginBottom: 24,
  },
  locationCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  locationTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  locationBadge: {
    backgroundColor: `${LDPSColors.pickupMarker}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  locationAddress: {
    marginBottom: 12,
  },
  editHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  connector: {
    alignItems: "center",
    height: 50,
    marginVertical: -8,
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    flex: 1,
  },
  connectorArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: 24,
    overflow: "hidden",
  },
  summaryDecoration: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  summaryUnit: {
    color: "rgba(255,255,255,0.8)",
  },
  summaryDivider: {
    width: 1,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 20,
  },
  priceBreakdown: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "rgba(255,255,255,0.7)",
  },
  priceValue: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  buttonContainer: {
    marginTop: "auto",
  },
});
