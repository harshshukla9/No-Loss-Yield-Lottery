"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import config from "../lib/config";

export function usePurchaseTickets() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // For approval
  const {
    writeContract: approveWrite,
    data: approveTx,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();
  const { isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveTx,
  });

  const approveLink = (amount: bigint) => {
    approveWrite({
      address: config.linkTokenAddress as `0x${string}`,
      abi: config.linkTokenAbi,
      functionName: "approve",
      args: [config.contractAddress, amount],
    });
  };

  // Call this function to purchase tickets
  const purchase = (amount: bigint) => {
    writeContract({
      address: config.contractAddress as `0x${string}`,
      abi: config.abi,
      functionName: "stake",
      args: [amount],
    });
  };

  return {
    approveLink,
    isApproving,
    isApproved,
    approveError,
    purchase,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || confirmError,
    reset,
  };
}
