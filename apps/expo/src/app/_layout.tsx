import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { TRPCProvider } from "~/utils/api";

export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar />
    </TRPCProvider>
  );
}
