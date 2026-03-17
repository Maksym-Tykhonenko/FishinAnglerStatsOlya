import React from 'react';
import { Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';

import MainMenuScreen from '../screens/MenuScreen';
import BaitsScreen from '../screens/BaitlesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const IC_BOOK = require('../assets/tab_book.png');
const IC_HOME = require('../assets/tab_home.png');
const IC_SETTINGS = require('../assets/tab_settings.png');

function TabIcon({ source, focused, size }: { source: any; focused: boolean; size: number }) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        tintColor: focused ? '#8EF0FF' : 'rgba(255,255,255,0.45)',
      }}
      resizeMode="contain"
    />
  );
}

export default function MainTabs() {
  const { width, height } = useWindowDimensions();
  
  const isSmallH = height < 720;
  const isSmallW = width < 360;
  const isSmall = isSmallH || isSmallW;
  const side = Math.max(12, Math.min(22, Math.round(width * 0.05)));

  const bottom = isSmall ? 34 : 40;
  
  const barHeight = isSmall ? 58 : 64;
  const iconSize = isSmall ? 24 : 28;
  const paddingHorizontal = isSmall ? 18 : 22;
  const paddingTop = isSmall ? 9 : 10;

  const paddingBottom = Platform.OS === 'ios' 
    ? (isSmall ? 10 : 12) 
    : (isSmall ? 9 : 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: side,
          right: side,
          bottom: bottom,
          height: barHeight,
          borderRadius: 40,
          backgroundColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          paddingHorizontal: paddingHorizontal,
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
          shadowColor: '#000000',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
      }}
    >
      <Tab.Screen
        name="Baits"
        component={BaitsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={IC_BOOK} focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={IC_HOME} focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={IC_SETTINGS} focused={focused} size={iconSize} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}