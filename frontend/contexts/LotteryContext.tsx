"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import config from "../lib/config";
import { useReadContract, useAccount } from "wagmi";
import { UseReadContractReturnType } from "wagmi";
import { formatUnits } from "viem";

type Winner = {
  winner: `0x${string}`;
  amount: number;
  round: number;
  timestamp: number;
};

interface LotteryContextType {
  userAddress: `0x${string}` | undefined;
  isConnected: boolean;
  totalStaked: UseReadContractReturnType;
  ticketCount: UseReadContractReturnType;
  totalTicketsInCurrentRound: UseReadContractReturnType;
  totalYieldGenerated: UseReadContractReturnType;
  ticketPurchaseCost: UseReadContractReturnType;
  userStakes: UseReadContractReturnType;
  currentRound: UseReadContractReturnType;
  recentWinners: Winner[];
  userTickets: number;
  userWinRate: number;
  totalStakedUSD: string | number;
  linkPrice: number;
  isLoadingPrice: boolean;
  entryCutoffTime: number;
}

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

export function LotteryProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [currentRoundState, setCurrentRoundState] = useState<number>(0);
  const [linkPrice, setLinkPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const { address, isConnected } = useAccount();

  const currentRound = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "currentRound",
  });

  const getRecentWinners = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getWinnersByRoundRange",
    args: [currentRoundState - 5, currentRoundState],
    query: {
      enabled: !!currentRoundState,
    },
  });

  useEffect(() => {
    if (isConnected) {
      setUserAddress(address);
    } else {
      setUserAddress(undefined);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (currentRound.data) {
      setCurrentRoundState(Number(currentRound.data));
    }
  }, [currentRound.data]);

  useEffect(() => {
    if (getRecentWinners.data) {
      const processedWinners = (getRecentWinners.data as any[]).map(
        (winner) => {
          const winningAmount = formatUnits(winner.amount, 18);
          const winningAmountUSD = (Number(winningAmount) * linkPrice).toFixed(
            5
          );
          return {
            ...winner,
            amount: Number(winningAmountUSD),
          };
        }
      );
      setRecentWinners(processedWinners as Winner[]);
    }
  }, [getRecentWinners.data, currentRoundState, linkPrice]);

  useEffect(() => {
    const fetchLinkPrice = async () => {
      setIsLoadingPrice(true);
      try {
        const response = await fetch("/api/get-link-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setLinkPrice(data.chainlink?.usd || 0);
      } catch (error) {
        console.error("Error fetching LINK price:", error);
        setLinkPrice(0);
      } finally {
        setIsLoadingPrice(false);
      }
    };
    fetchLinkPrice();
    const interval = setInterval(fetchLinkPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalStaked = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTotalStaked",
  });

  const totalTicketsInCurrentRound = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTotalTicketsInCurrentRound",
  });

  const totalUserTicketsInCurrentRound = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getUsersTicketsInCurrentRound",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!userAddress,
    },
  });

  const timeUntilNextDraw = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTimeUntilNextDraw",
  });

  const ticketCount = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTicketCount",
  });

  const totalYieldGenerated = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getTotalYieldGenerated",
  });

  const ticketPurchaseCost = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "ticketPurchaseCost",
  });

  const userStakes = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "getUserStakes",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!userAddress,
    },
  });

  const userTickets = React.useMemo(() => {
    if (userStakes.data && ticketPurchaseCost.data) {
      const stakedAmount = userStakes.data as bigint;
      const ticketCost = ticketPurchaseCost.data as bigint;
      return ticketCost > 0 ? Number(stakedAmount / ticketCost) : 0;
    }
    return 0;
  }, [userStakes.data, ticketPurchaseCost.data]);

  const userWinRate = React.useMemo(() => {
    if (
      totalUserTicketsInCurrentRound.data &&
      totalTicketsInCurrentRound.data
    ) {
      const totalTickets = Number(totalTicketsInCurrentRound.data as bigint);
      const userTickets = Number(totalUserTicketsInCurrentRound.data as bigint);
      return totalTickets > 0 ? (userTickets / totalTickets) * 100 : 0;
    }
    return 0;
  }, [totalUserTicketsInCurrentRound.data, totalTicketsInCurrentRound.data]);

  const entryCutoffTime = React.useMemo(() => {
    if (timeUntilNextDraw.data) {
      const cutoffTime: number = 3600;
      const timeLeft = Number(timeUntilNextDraw.data as bigint);

      if (cutoffTime > timeLeft) {
        return 0;
      } else {
        const timeDiff = timeLeft - cutoffTime;
        return timeDiff;
      }
    }
    return 0;
  }, [timeUntilNextDraw.data]);

  const totalStakedUSD = React.useMemo(() => {
    if (totalStaked.data && linkPrice > 0) {
      const totalStakedLINK = Number(
        formatUnits(totalStaked.data as bigint, 18)
      );
      return (totalStakedLINK * linkPrice).toFixed(2);
    }
    return 0;
  }, [totalStaked.data, linkPrice]);

  return (
    <LotteryContext.Provider
      value={{
        userAddress,
        isConnected,
        totalStaked,
        ticketCount,
        totalTicketsInCurrentRound,
        totalYieldGenerated,
        userTickets,
        userStakes,
        ticketPurchaseCost,
        recentWinners,
        userWinRate,
        currentRound,
        totalStakedUSD,
        linkPrice,
        isLoadingPrice,
        entryCutoffTime,
      }}
    >
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery() {
  const context = useContext(LotteryContext);
  if (context === undefined) {
    throw new Error("useLottery must be used within a LotteryProvider");
  }
  return context;
}
