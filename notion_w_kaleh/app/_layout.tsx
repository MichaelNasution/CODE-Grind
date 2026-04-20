import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { Home, TrendingUp, CheckSquare, Zap } from 'lucide-react-native';
import { initDatabase } from '../lib/database';
import { useNKStore } from '../store/useNKStore';
import { Colors } from '../constants/theme';

function TabBarBackground() {
  return (
    <BlurView
      tint="dark"
      intensity={85}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function RootLayout() {
  const loadAll = useNKStore((s) => s.loadAll);

  useEffect(() => {
    // Initialize DB then load all data
    initDatabase().then(() => {
      setTimeout(() => {
        loadAll();
      }, 0);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.gold,
            tabBarInactiveTintColor: Colors.textSecondary,
            tabBarStyle: {
              position: 'absolute',
              borderTopWidth: 0,
              backgroundColor: 'transparent',
              elevation: 0,
            },
            tabBarBackground: () => <TabBarBackground />,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.3,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Home size={size} color={color} strokeWidth={1.8} />
              ),
            }}
          />
          <Tabs.Screen
            name="finance"
            options={{
              title: 'Finance',
              tabBarIcon: ({ color, size }) => (
                <TrendingUp size={size} color={color} strokeWidth={1.8} />
              ),
            }}
          />
          <Tabs.Screen
            name="habits"
            options={{
              title: 'Habits',
              tabBarIcon: ({ color, size }) => (
                <Zap size={size} color={color} strokeWidth={1.8} />
              ),
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              title: 'Tasks',
              tabBarIcon: ({ color, size }) => (
                <CheckSquare size={size} color={color} strokeWidth={1.8} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
