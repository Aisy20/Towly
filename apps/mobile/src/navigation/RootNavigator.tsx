import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';
import { useAuthStore } from '../store/authStore';
import { AppNavigator } from './AppNavigator';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';

const Stack = createNativeStackNavigator();

// DEV ONLY — flip to false (or delete this block + its uses below) to restore the
// real auth gate. Lets the web/dev build boot straight into the tab bar + gallery
// without a running backend by seeding a mock signed-in neighbor.
const DEV_BYPASS_AUTH = __DEV__ && true;
const MOCK_USER = {
  id: 'dev-user',
  username: 'dev_neighbor',
  avatarUrl: null,
  credibilityScore: 78,
  totalReports: 12,
  accurateReports: 9,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

export function RootNavigator() {
  const { user, isLoading, restoreAuth } = useAuthStore();

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      useAuthStore.setState({ user: MOCK_USER, isLoading: false });
      return;
    }
    restoreAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
