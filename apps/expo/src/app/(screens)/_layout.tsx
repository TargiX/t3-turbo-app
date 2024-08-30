import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
            backgroundColor: '#f472b6',
          },
      }}
    >
      <Stack.Screen name="session-playback" options={{ headerShown: false }} />
    </Stack>
  );
}