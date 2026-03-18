import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../store';
import { checkAuthStatus } from '../store/actions/auth.actions';

import LoginScreen from '../screens/login';
import RegisterScreen from '../screens/register';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/splash';
import PostDetails from '../screens/post-details';
import PostSuccessScreen from '../screens/post-success';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  // Custom state to ensure splash screen shows for at least 3 seconds
  const [isSplashDone, setIsSplashDone] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    // 1. Kick off auth check
    dispatch(checkAuthStatus());

    // 2. Start splash screen minimum timer
    const timer = setTimeout(() => {
      setIsSplashDone(true);
    }, 3000); // 3 seconds minimum delay

    return () => clearTimeout(timer);
  }, [dispatch]);

  // The app is "ready" to show auth or private screens only when:
  // - The auth loading has finished
  // - AND the 3-second splash timer has finished
  const isAppReady = !isLoading && isSplashDone;

  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="AppTabs" component={TabNavigator} />
            <Stack.Screen name="PostDetails" component={PostDetails} />
            <Stack.Screen name="PostSuccess" component={PostSuccessScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingFlow} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
