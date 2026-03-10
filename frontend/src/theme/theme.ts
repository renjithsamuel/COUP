import { createTheme, MantineColorsTuple } from '@mantine/core';

const coupNavy: MantineColorsTuple = [
  '#e8eaf0',
  '#c5cad6',
  '#9fa7ba',
  '#78839e',
  '#5a6889',
  '#45567b',
  '#3d4e75',
  '#2f3f64',
  '#26375a',
  '#162033',
];

const coupGold: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffca28',
  '#ffc107',
  '#ffb300',
  '#ffa000',
  '#ff8f00',
  '#ff6f00',
];

export const theme = createTheme({
  primaryColor: 'coupNavy',
  colors: {
    coupNavy,
    coupGold,
  },
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  other: {
    boardBg: 'radial-gradient(ellipse at 50% 40%, #162033 0%, #111B2E 40%, #0B1120 100%)',
  },
});
