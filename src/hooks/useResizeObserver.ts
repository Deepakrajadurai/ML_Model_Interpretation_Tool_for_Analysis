import { useState, useEffect, useRef, useCallback } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export const useResizeObserver = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const updateDimensions = useCallback((entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    // Clean up previous observer if it exists
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    try {
      resizeObserverRef.current = new ResizeObserver(updateDimensions);
      resizeObserverRef.current.observe(ref.current);
    } catch (error) {
      console.error('Error creating ResizeObserver:', error);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [updateDimensions]);

  return { ref, dimensions };
};