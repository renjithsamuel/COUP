'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { coinBounceVariants } from '@/animations';
import { coinStackStyles } from './CoinStack.styles';

export interface CoinStackProps {
  count: number;
  maxVisible?: number;
  animate?: boolean;
}

export function CoinStack({ count, maxVisible = 5, animate = true }: CoinStackProps) {
  const visible = Math.min(count, maxVisible);

  return (
    <div style={coinStackStyles.wrapper} aria-label={`${count} coins`}>
      {Array.from({ length: visible }).map((_, i) => (
        <motion.div
          key={i}
          variants={animate ? coinBounceVariants : undefined}
          initial={animate ? 'hidden' : undefined}
          animate={animate ? 'visible' : undefined}
          style={coinStackStyles.coin}
        >
          ¢
        </motion.div>
      ))}
      <span style={coinStackStyles.count}>{count}</span>
    </div>
  );
}
