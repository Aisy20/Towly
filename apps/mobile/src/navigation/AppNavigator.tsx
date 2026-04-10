import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MapScreen } from '../screens/map/MapScreen';
import { ReportDetailScreen } from '../screens/reports/ReportDetailScreen';
import { CreateReportScreen } from '../screens/reports/CreateReportScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { usePushNotifications } from '../hooks/usePushNotifications';

const Tab = createBottomTabNavigator();
const MapStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ headerShown: true, title: 'Report' }}
      />
    </MapStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export function AppNavigator() {
  // Must be called here — inside NavigationContainer, after authentication
  usePushNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { borderTopColor: '#e2e8f0' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            MapTab: 'map-outline',
            Post: 'add-circle-outline',
            Notifications: 'notifications-outline',
            ProfileTab: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ title: 'Map' }} />
      <Tab.Screen
        name="Post"
        component={CreateReportScreen}
        options={{ title: 'Report', headerShown: true }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
