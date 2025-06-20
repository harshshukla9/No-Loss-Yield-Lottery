import { useReadContract } from "wagmi";
import config from "../config";
import type { Abi } from "viem";

export function useFetchYieldAccrued() {
  const { data: investmentBalance, isLoading: loadingInvestment, error: errorInvestment } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi as Abi,
    functionName: "getAaveInvestmentBalance",
  });

  const { data: totalStaked, isLoading: loadingStaked, error: errorStaked } = useReadContract({
    address: config.contractAddress as `0x${string}`,
    abi: config.abi as Abi,
    functionName: "getTotalStaked",
  });

  let interestAccrued: bigint | null = null;
  if (typeof investmentBalance === "bigint" && typeof totalStaked === "bigint") {
    interestAccrued = investmentBalance - totalStaked;
  }

  return {
    interestAccrued,
    loading: loadingInvestment || loadingStaked,
    error: errorInvestment || errorStaked,
  };
}
