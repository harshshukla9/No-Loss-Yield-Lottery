import { useEffect, useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import config from "../config";
import type { Abi } from "viem";

export function useFetchTicketCount() {
  const [currentRound, setCurrentRound] = useState<bigint | null>(null);
  const [ticketCount, setTicketCount] = useState<bigint | null>(null);
  const [count, setCount] = useState<number | null>(null);

  // Fetch current round
  const { data: roundData } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi as Abi,
    functionName: "currentRound",
  });

  // Fetch ticket count
  const { data: ticketCountData } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi as Abi,
    functionName: "getTicketCount",
  });

  // When both are loaded, batch fetch tickets
  const ticketIndexes =
    ticketCountData && typeof ticketCountData === "bigint"
      ? Array.from({ length: Number(ticketCountData) }, (_, i) => i)
      : [];

  const ticketsRead = useReadContracts({
    contracts: ticketIndexes.map((i) => ({
      address: config.contractAddress as `0x${string}`,
      abi: config.abi as Abi,
      functionName: "tickets",
      args: [i],
    })),
    query: { enabled: !!currentRound && ticketIndexes.length > 0 },
  });

  useEffect(() => {
    if (roundData) setCurrentRound(roundData as bigint);
  }, [roundData]);

  useEffect(() => {
    if (ticketCountData) setTicketCount(ticketCountData as bigint);
  }, [ticketCountData]);

  useEffect(() => {
    if (
      currentRound !== null &&
      ticketsRead.data &&
      Array.isArray(ticketsRead.data)
    ) {
      const filtered = ticketsRead.data.filter((ticket) => {
        if (!ticket?.result) return false;
        const { startRound } = ticket.result as { user: string; amount: bigint; startRound: bigint };
        return startRound === currentRound;
      });
      setCount(filtered.length);
    }
  }, [ticketsRead.data, currentRound]);

  return { count, loading: ticketsRead.isLoading };
}

export function useFetchTotalTicketCount() {
  const { data, isLoading } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi as Abi,
    functionName: "getTicketCount",
  });
  return { total: data ? Number(data) : 0, loading: isLoading };
}
