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
import SocialHub from '../screens/social-hub';
import ChatScreen from '../screens/messages/chat';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';
import EditProfileScreen from '../screens/settings/edit-profile';
import NotificationsScreen from '../screens/settings/notifications';
import PrivacySecurityScreen from '../screens/settings/privacy-security';
import HelpCenterScreen from '../screens/settings/help-center';
import ContactUsScreen from '../screens/settings/contact-us';
import PlatformPostsScreen from '../screens/platform-posts';
import FacebookPostsScreen from '../screens/facebook-posts';
import InstagramPostsScreen from '../screens/instagram-posts';
import ThreadsPostsScreen from '../screens/threads-posts';
import TwitterPostsScreen from '../screens/twitter-posts';
import YouTubePostsScreen from '../screens/youtube-posts';

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
            <Stack.Screen name="SocialHub" component={SocialHub} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="PlatformPosts" component={PlatformPostsScreen} />
            <Stack.Screen name="FacebookPosts" component={FacebookPostsScreen} />
            <Stack.Screen name="InstagramPosts" component={InstagramPostsScreen} />
            <Stack.Screen name="ThreadsPosts" component={ThreadsPostsScreen} />
            <Stack.Screen name="TwitterPosts" component={TwitterPostsScreen} />
            <Stack.Screen name="YouTubePosts" component={YouTubePostsScreen} />
            {/* Settings sub-screens */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
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
