'use client';

import { useEffect, useCallback, useRef } from 'react';

export function CursorRipple() {
  const lastClickRef = useRef(0);

  const createRipple = useCallback((e: MouseEvent) => {
    const now = Date.now();
    // Throttle ripples
    if (now - lastClickRef.current < 200) return;
    lastClickRef.current = now;

    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = `${e.clientX - 20}px`;
    ripple.style.top = `${e.clientY - 20}px`;
    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 800);
  }, []);

  useEffect(() => {
    document.addEventListener('click', createRipple);
    return () => document.removeEventListener('click', createRipple);
  }, [createRipple]);

  return null;
}
