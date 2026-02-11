import React, { useState, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, NativeModules } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, LDPSColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MapRouteProp = RouteProp<RootStackParamList, "Map">;

const SAMPLE_ADDRESSES = [
  "123 Main Street, Downtown",
  "456 Park Avenue, Midtown",
  "789 Oak Lane, Suburbs",
  "321 Market Square, City Center",
  "555 Business Park, Tech Hub",
];

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const INITIAL_REGION: Region = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

let MapView: any = null;
let PROVIDER_GOOGLE: any = undefined;

// Detect if native module is available (Expo Go often lacks RNMapsAirModule)
const hasNativeMaps = Platform.OS !== "web" && !!(NativeModules as any)?.RNMapsAirModule;

if (hasNativeMaps) {
  // Lazy require only when the native module exists
  const maps = require("react-native-maps");
  MapView = maps.default;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MapRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const { type, currentAddress } = route.params;
  const isPickup = type === "pickup";

  // Removed early fallback return; we'll render a rich placeholder when native maps aren't available
  if (!hasNativeMaps || !MapView) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.backgroundRoot }}>
        <View style={{ padding: Spacing.lg }}>
          <ThemedText style={{ fontSize: 18, marginBottom: Spacing.md }}>
            Map unavailable in this runtime.
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.lg }}>
            To use maps on device, install a development build with expo-dev-client or remove maps usage.
          </ThemedText>
          <Button
            label="Continue"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const [selectedLocation, setSelectedLocation] = useState<Region>(INITIAL_REGION);
  const [address, setAddress] = useState(
    currentAddress ||
      SAMPLE_ADDRESSES[Math.floor(Math.random() * SAMPLE_ADDRESSES.length)],
  );

  const markerScale = useSharedValue(1);

  const handleRegionChange = (region: Region) => {
    setSelectedLocation(region);
    markerScale.value = withSpring(1.2);
    setTimeout(() => {
      markerScale.value = withSpring(1);
    }, 200);
    const randomAddress =
      SAMPLE_ADDRESSES[Math.floor(Math.random() * SAMPLE_ADDRESSES.length)];
    setAddress(randomAddress);
  };

  const handleCurrentLocation = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    mapRef.current?.animateToRegion(INITIAL_REGION, 500);
  };

  const handleZoomIn = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    const newRegion = {
      ...selectedLocation,
      latitudeDelta: selectedLocation.latitudeDelta / 2,
      longitudeDelta: selectedLocation.longitudeDelta / 2,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
    setSelectedLocation(newRegion);
  };

  const handleZoomOut = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    const newRegion = {
      ...selectedLocation,
      latitudeDelta: selectedLocation.latitudeDelta * 2,
      longitudeDelta: selectedLocation.longitudeDelta * 2,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
    setSelectedLocation(newRegion);
  };

  const handleConfirm = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("PickupDrop", {
      pickupAddress: isPickup ? address : route.params.currentAddress || "",
      dropAddress: isPickup ? route.params.currentAddress || "" : address,
      [isPickup ? "pickupAddress" : "dropAddress"]: address,
    });
  };

  const handleSelectAddress = (newAddress: string) => {
    setAddress(newAddress);
  };

  const markerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markerScale.value }],
  }));

  // Render placeholder UI when native maps aren't available (web or Expo Go without dev build)
  if (!hasNativeMaps || !MapView) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.webMapPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.webMapContent}>
            <View
              style={[
                styles.webMapIcon,
                { backgroundColor: `${LDPSColors.primary}15` },
              ]}
            >
              <Feather name="map" size={48} color={LDPSColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.webMapTitle}>
              Select {isPickup ? "Pickup" : "Drop"} Location
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.webMapSubtitle, { color: theme.textSecondary }]}
            >
              Interactive map requires a development build; using UI-only mock here
            </ThemedText>
          </View>

          <View style={styles.addressList}>
            <ThemedText type="h4" style={styles.addressListTitle}>
              Quick select an address:
            </ThemedText>
            {SAMPLE_ADDRESSES.map((addr, index) => (
              <Pressable
                key={index}
                style={[
                  styles.addressOption,
                  {
                    backgroundColor:
                      address === addr
                        ? `${LDPSColors.primary}15`
                        : theme.backgroundDefault,
                    borderColor:
                      address === addr ? LDPSColors.primary : theme.border,
                  },
                ]}
                onPress={() => handleSelectAddress(addr)}
              >
                <Feather
                  name={address === addr ? "check-circle" : "circle"}
                  size={20}
                  color={address === addr ? LDPSColors.primary : theme.textSecondary}
                />
                <ThemedText
                  type="body"
                  style={{
                    flex: 1,
                    color: address === addr ? LDPSColors.primary : theme.text,
                  }}
                >
                  {addr}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* UI-only zoom controls overlay */}
          <View style={[styles.zoomControls, { top: insets.top + 80 }]}>
            <Pressable
              style={[styles.zoomButton, { backgroundColor: theme.backgroundDefault }]}
              onPress={handleZoomIn}
            >
              <Feather name="plus" size={20} color={theme.text} />
            </Pressable>
            <View style={[styles.zoomDivider, { backgroundColor: theme.border }]} />
            <Pressable
              style={[styles.zoomButton, { backgroundColor: theme.backgroundDefault }]}
              onPress={handleZoomOut}
            >
              <Feather name="minus" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* UI-only current location button */}
          <Pressable
            style={[
              styles.currentLocationButton,
              { backgroundColor: theme.backgroundDefault, bottom: insets.bottom + 180 },
            ]}
            onPress={handleCurrentLocation}
          >
            <Feather name="navigation" size={20} color={LDPSColors.primary} />
          </Pressable>
        </View>

        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.bottomCard,
            {
              backgroundColor: theme.backgroundDefault,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.addressSection}>
            <View
              style={[
                styles.addressIcon,
                {
                  backgroundColor: isPickup
                    ? `${LDPSColors.pickupMarker}20`
                    : `${LDPSColors.dropMarker}20`,
                },
              ]}
            >
              <Feather
                name={isPickup ? "circle" : "map-pin"}
                size={16}
                color={isPickup ? LDPSColors.pickupMarker : LDPSColors.dropMarker}
              />
            </View>
            <View style={styles.addressText}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {isPickup ? "Pickup Location" : "Drop Location"}
              </ThemedText>
              <ThemedText type="h4" numberOfLines={2}>
                {address}
              </ThemedText>
            </View>
          </View>

          <Button onPress={handleConfirm} style={styles.confirmButton}>
            Confirm {isPickup ? "Pickup" : "Drop"} Location
          </Button>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {MapView ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onRegionChangeComplete={handleRegionChange}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          showsUserLocation
          showsMyLocationButton={false}
        />
      ) : null}

      <View style={[styles.markerContainer, { pointerEvents: "none" as const }]}>
        <Animated.View style={[styles.marker, markerAnimatedStyle]}>
          <View
            style={[
              styles.markerPin,
              {
                backgroundColor: isPickup
                  ? LDPSColors.pickupMarker
                  : LDPSColors.dropMarker,
              },
            ]}
          >
            <Feather
              name={isPickup ? "circle" : "map-pin"}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View
            style={[
              styles.markerShadow,
              {
                backgroundColor: isPickup
                  ? LDPSColors.pickupMarker
                  : LDPSColors.dropMarker,
              },
            ]}
          />
        </Animated.View>
      </View>

      <View style={[styles.zoomControls, { top: insets.top + 100 }]}>
        <Pressable
          style={[styles.zoomButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={handleZoomIn}
        >
          <Feather name="plus" size={20} color={theme.text} />
        </Pressable>
        <View style={[styles.zoomDivider, { backgroundColor: theme.border }]} />
        <Pressable
          style={[styles.zoomButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={handleZoomOut}
        >
          <Feather name="minus" size={20} color={theme.text} />
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.currentLocationButton,
          {
            backgroundColor: theme.backgroundDefault,
            bottom: insets.bottom + 180,
          },
        ]}
        onPress={handleCurrentLocation}
      >
        <Feather name="navigation" size={20} color={LDPSColors.primary} />
      </Pressable>

      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.bottomCard,
          {
            backgroundColor: theme.backgroundDefault,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.addressSection}>
          <View
            style={[
              styles.addressIcon,
              {
                backgroundColor: isPickup
                  ? `${LDPSColors.pickupMarker}20`
                  : `${LDPSColors.dropMarker}20`,
              },
            ]}
          >
            <Feather
              name={isPickup ? "circle" : "map-pin"}
              size={16}
              color={isPickup ? LDPSColors.pickupMarker : LDPSColors.dropMarker}
            />
          </View>
          <View style={styles.addressText}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {isPickup ? "Pickup Location" : "Drop Location"}
            </ThemedText>
            <ThemedText type="h4" numberOfLines={2}>
              {address}
            </ThemedText>
          </View>
        </View>

        <Button onPress={handleConfirm} style={styles.confirmButton}>
          Confirm {isPickup ? "Pickup" : "Drop"} Location
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    padding: Spacing.xl,
    paddingBottom: 200,
  },
  webMapContent: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  webMapIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  webMapTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  webMapSubtitle: {
    textAlign: "center",
  },
  addressList: {
    gap: 12,
  },
  addressListTitle: {
    marginBottom: 8,
  },
  addressOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  markerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  marker: {
    alignItems: "center",
  },
  markerPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markerShadow: {
    width: 16,
    height: 8,
    borderRadius: 8,
    marginTop: -4,
    opacity: 0.3,
  },
  zoomControls: {
    position: "absolute",
    right: 16,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
  },
  currentLocationButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  handleBar: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  addressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  addressText: {
    flex: 1,
    gap: 2,
  },
  confirmButton: {},
});
