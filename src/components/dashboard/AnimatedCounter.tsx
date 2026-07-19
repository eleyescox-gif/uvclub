"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
}

export default function AnimatedCounter({ value, prefix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second counter animation duration

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quadratic function for smooth slowing down at the end
      const easeProgress = progress * (2 - progress);
      
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{prefix}{count.toLocaleString('en-IN')}</span>;
}
