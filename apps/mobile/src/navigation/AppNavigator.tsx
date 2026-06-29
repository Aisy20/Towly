import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, fontFamily, radii, shadows, hitSlop } from '@/theme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import type { RootStackParamList, TabsParamList } from './types';
import { PulseShell, AlertsShell, YouShell } from '../screens/signal/TabShells';
import { MapScreen } from '../screens/map/MapScreen';
import {
  ReportDetailShell,
  CreateReportShell,
  DuplicateDetectionShell,
  EvidenceShell,
  HelpThreadShell,
  SettingsShell,
  VerificationShell,
  SearchListShell,
} from '../screens/signal/SecondaryShells';
import { ComponentGalleryScreen } from '../screens/dev/ComponentGalleryScreen';

const Tabs = createBottomTabNavigator<TabsParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

/** Center raised Create button — 46×46 Slate rounded square with a white plus. */
function RaisedCreateButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.raisedSlot} pointerEvents="box-none">
      <Pressable
        onPress={() => navigation.navigate('CreateReport')}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Create a report"
        style={({ pressed }) => [styles.raised, pressed && styles.raisedPressed]}
      >
        <Ionicons name="add" size={24} color={palette.white} />
      </Pressable>
    </View>
  );
}

/** Never focused — the raised button intercepts the press and pushes a modal. */
function CreateTabPlaceholder() {
  return null;
}

const TAB_ICONS: Record<keyof TabsParamList, keyof typeof Ionicons.glyphMap> = {
  Map: 'location-outline',
  Pulse: 'pulse-outline',
  CreateTab: 'add',
  Alerts: 'notifications-outline',
  You: 'person-outline',
};

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fontFamily.bold, fontSize: 10 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof TabsParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tabs.Screen name="Pulse" component={PulseShell} options={{ tabBarLabel: 'Pulse' }} />
      <Tabs.Screen
        name="CreateTab"
        component={CreateTabPlaceholder}
        options={{ tabBarButton: () => <RaisedCreateButton />, tabBarLabel: () => null }}
      />
      <Tabs.Screen name="Alerts" component={AlertsShell} options={{ tabBarLabel: 'Alerts' }} />
      <Tabs.Screen name="You" component={YouShell} options={{ tabBarLabel: 'You' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  // Must run here — inside NavigationContainer, after authentication.
  usePushNotifications();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={TabsNavigator} />
      <RootStack.Screen name="ReportDetail" component={ReportDetailShell} />
      <RootStack.Screen name="CreateReport" component={CreateReportShell} options={{ presentation: 'modal' }} />
      <RootStack.Screen name="DuplicateDetection" component={DuplicateDetectionShell} options={{ presentation: 'modal' }} />
      <RootStack.Screen name="Evidence" component={EvidenceShell} />
      <RootStack.Screen name="HelpThread" component={HelpThreadShell} />
      <RootStack.Screen name="Settings" component={SettingsShell} />
      <RootStack.Screen name="Verification" component={VerificationShell} />
      <RootStack.Screen name="SearchList" component={SearchListShell} />
      {__DEV__ ? <RootStack.Screen name="ComponentGallery" component={ComponentGalleryScreen} /> : null}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  raisedSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  raised: {
    width: 46,
    height: 46,
    borderRadius: radii.controlLarge,
    backgroundColor: palette.slate,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -8 }],
    ...shadows.md,
  },
  raisedPressed: { opacity: 0.85 },
});
