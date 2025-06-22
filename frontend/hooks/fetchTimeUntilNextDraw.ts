import { useReadContract } from "wagmi";

import config from "../lib/config";

export interface TimeUntilNextDraw {
  seconds: number;
  isLoading: boolean;
  error?: Error;
}

export function useFetchTimeUntilNextDraw(): TimeUntilNextDraw {
  const { data, isLoading, error } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTimeUntilNextDraw",
  });

  return {
    seconds: Number(data),
    isLoading,
    error: error as Error | undefined,
  };
}
