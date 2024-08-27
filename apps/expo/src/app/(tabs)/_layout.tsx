import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'discover':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'more':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'alert-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        headerStyle: {
          backgroundColor: "#f472b6",
        },
        contentStyle: {
          backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="create" options={{ title: 'Create' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}