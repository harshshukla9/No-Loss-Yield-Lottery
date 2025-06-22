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

interface LotteryContextType {
  userAddress: `0x${string}` | undefined;
  isConnected: boolean;
  totalStaked: UseReadContractReturnType;
  ticketCount: UseReadContractReturnType;
  totalYieldGenerated: UseReadContractReturnType;
  ticketPurchaseCost: UseReadContractReturnType;
  userStakes: UseReadContractReturnType;
  currentRound: UseReadContractReturnType;
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
  const [linkPrice, setLinkPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setUserAddress(address);
    } else {
      setUserAddress(undefined);
    }
  }, [isConnected, address]);

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

  const currentRound = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi,
    functionName: "currentRound",
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
    if (userTickets > 0 && ticketCount.data) {
      const totalTickets = Number(ticketCount.data as bigint);
      return totalTickets > 0 ? (userTickets / totalTickets) * 100 : 0;
    }
    return 0;
  }, [userTickets, ticketCount.data]);

  const entryCutoffTime = React.useMemo(() => {
    if (timeUntilNextDraw.data) {
      const cutoffTime: number = 86400;
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
        totalYieldGenerated,
        userTickets,
        userStakes,
        ticketPurchaseCost,
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
