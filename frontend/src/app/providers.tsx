'use client';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme/theme';
import { LobbyProvider } from '@/context/LobbyContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5000, retry: 2 },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <LobbyProvider>{children}</LobbyProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
