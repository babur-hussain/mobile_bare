import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
  Plus,
  MessageCircle,
} from 'lucide-react-native';
import { Platform } from 'react-native';

import HomeScreen from '../screens/home';
import CreatePostScreen from '../screens/create-post';
import AccountsScreen from '../screens/accounts';
import SettingsScreen from '../screens/settings';
import MessagesScreen from '../screens/messages';

const Tab = createBottomTabNavigator();

const APP_COLORS = {
  primary: '#5341cd',
  surface: '#fcf9f8',
  onSurfaceVariant: '#474554',
  outlineVariant: '#c8c4d7',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarInactiveTintColor: 'rgba(71, 69, 84, 0.6)', // onSurfaceVariant/60
        tabBarStyle: {
          backgroundColor: 'rgba(252, 249, 248, 0.9)', // Simulated glass-nav
          borderTopColor: 'rgba(200, 196, 215, 0.2)', // outlineVariant/10
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          position: 'absolute', // To let the scroll view go under
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'Post',
          tabBarIcon: ({ color, size }) => <Plus size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          tabBarLabel: 'Accounts',
          tabBarIcon: ({ color, size }) => <Users size={24} color={color} />,
        }}
      />
      {/* <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={24} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
