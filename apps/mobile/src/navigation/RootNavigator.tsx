import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { AppNavigator } from './AppNavigator';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, isLoading, restoreAuth } = useAuthStore();

  useEffect(() => { restoreAuth(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
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
