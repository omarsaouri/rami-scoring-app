import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { initDB, getActiveGame, getRounds } from '@/lib/db';
import { syncPending } from '@/lib/sync';
import '@/lib/i18n';
import { useGameStore } from '@/store/gameStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { setActiveGame, setRounds } = useGameStore();

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const game = await getActiveGame();
        if (game) {
          setActiveGame(game);
          const rounds = await getRounds(game.id);
          setRounds(rounds);
        }
        syncPending();
      } catch (e) {
        console.error('Init error', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game/new"
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#10B981',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#10B981',
          }}
        />
        <Stack.Screen
          name="game/round"
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#10B981',
            presentation: 'modal',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
