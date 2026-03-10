import { useState, useCallback } from 'react';

export function useCardHover() {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return { isHovered, onMouseEnter, onMouseLeave };
}
