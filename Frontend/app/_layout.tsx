import React, { createContext, useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

import { useAuth } from '@/hooks/useAuth'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const userDataContext = createContext<{
  userData: { [key: string]: any };
  setUserData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
} | null>(null);
export { userDataContext };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [userData, setUserData] = useState<{ [key: string]: any }>({});

  const { user, loading } = useAuth(); 
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(true); 
useEffect(() => {
    if (!loading) {
      console.log('Auth loading finished. User:', user ? user.uid : 'null');
      if (user) {
        console.log('User found. Redirecting to (tabs)/home...');
        router.replace('/(tabs)/home');
      } else {
        console.log('No user found. Redirecting to (auth)/signup...');
        router.replace('/(auth)/signup');
      }
      setIsAppReady(true);
    } else {
      console.log('Auth still loading...');
    }
  }, [user, loading, router]);
  if (!isAppReady) {
    console.log('App not ready, rendering null.');
    return null;
  }
  console.log('Rendering Root Layout Stack...');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <userDataContext.Provider value={{ userData, setUserData }}>
      <GluestackUIProvider mode="dark">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {}
          <Stack screenOptions={{ headerShown: false }}>
            {}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            {}
            {}
            {}
            {}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </userDataContext.Provider>
    </GestureHandlerRootView>
  );
}
