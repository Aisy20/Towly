import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import OnboardingScreen from './screens/OnboardingScreen';
import VerifyPhoneScreen from './screens/VerifyPhoneScreen';
import VerifyIDScreen from './screens/VerifyIDScreen';
import ZipCodeScreen from './screens/ZipCodeScreen';
import MapScreen from './screens/MapScreen';
import PostReportScreen from './screens/PostReportScreen';
import SuccessScreen from './screens/SuccessScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Onboarding');

  const navigate = (screen) => setCurrentScreen(screen);

  const screens = {
    Onboarding:   <OnboardingScreen navigate={navigate} />,
    VerifyPhone:  <VerifyPhoneScreen navigate={navigate} />,
    VerifyID:     <VerifyIDScreen navigate={navigate} />,
    ZipCode:      <ZipCodeScreen navigate={navigate} />,
    Map:          <MapScreen navigate={navigate} />,
    PostReport:   <PostReportScreen navigate={navigate} />,
    Success:      <SuccessScreen navigate={navigate} />,
    Profile:      <ProfileScreen navigate={navigate} />,
    Leaderboard:  <LeaderboardScreen navigate={navigate} />,
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      {screens[currentScreen]}
    </View>
  );
}
