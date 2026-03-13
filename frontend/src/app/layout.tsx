import React from 'react';
import type { Metadata } from 'next';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Coup – Online Multiplayer',
  description: 'Bluff, deceive, and outmanoeuvre in this classic card game.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#0B1120', color: '#E8EAF0' }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
