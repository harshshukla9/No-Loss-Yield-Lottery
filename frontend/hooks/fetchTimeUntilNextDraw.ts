import { useReadContract } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import config from '../config';

export interface TimeUntilNextDraw {
  seconds: number;
  formatted: string;
  isLoading: boolean;
  error?: Error;
}

export function useFetchTimeUntilNextDraw(): TimeUntilNextDraw {
  const { data, isLoading, error } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: 'getTimeUntilNextDraw'
  });

  const [seconds, setSeconds] = useState(0);

  // Sync with contract value when it changes
  useEffect(() => {
    if (data !== undefined) {
      setSeconds(Number(data));
    }
  }, [data]);

  // Local countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const formatted = `${days}d ${hours}h ${minutes}m ${secs}s`;

  return { seconds, formatted, isLoading, error: error as Error | undefined };
}
