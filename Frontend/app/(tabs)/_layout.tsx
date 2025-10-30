import React from 'react';
import { Tabs } from 'expo-router';
import { MapIcon, PlusSquareIcon, Radio, UserIcon } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
       
        tabBarButton: HapticTab,
      
      }}>
      <Tabs.Screen
     
        name="home"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapIcon size={size} color={color} />,
        }}
      />

          <Tabs.Screen
      
        name="explore"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
        }}
      />
   
  
    </Tabs>
  );
}