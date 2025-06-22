"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import config from "../lib/config";
import { parseUnits } from "viem";

export function useLotteryTransactions() {
  // Purchase tickets transaction
  const {
    writeContract: purchaseWrite,
    data: purchaseTxHash,
    isPending: isPurchasePending,
    error: purchaseError,
    reset: resetPurchase,
  } = useWriteContract();

  const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } =
    useWaitForTransactionReceipt({
      hash: purchaseTxHash,
    });

  // Withdraw tickets transaction
  const {
    writeContract: withdrawWrite,
    data: withdrawTxHash,
    isPending: isWithdrawPending,
    error: withdrawError,
    reset: resetWithdraw,
  } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawTxHash,
    });

  const purchaseTickets = (amount: string) => {
    const amountInWei = parseUnits(amount, 18);
    purchaseWrite({
      address: config.contractAddress as `0x${string}`,
      abi: config.abi,
      functionName: "stake",
      args: [amountInWei],
    });
  };

  const withdrawAllTickets = () => {
    withdrawWrite({
      address: config.contractAddress as `0x${string}`,
      abi: config.abi,
      functionName: "withdrawAllOfAUsersTickets",
    });
  };

  return {
    // Purchase tickets
    purchaseTickets,
    purchaseState: {
      isLoading: isPurchasePending || isPurchaseConfirming,
      isSuccess: isPurchaseSuccess,
      error: purchaseError?.message || null,
      txHash: purchaseTxHash || null,
    },
    resetPurchaseState: resetPurchase,

    // Withdraw tickets
    withdrawAllTickets,
    withdrawState: {
      isLoading: isWithdrawPending || isWithdrawConfirming,
      isSuccess: isWithdrawSuccess,
      error: withdrawError?.message || null,
      txHash: withdrawTxHash || null,
    },
    resetWithdrawState: resetWithdraw,
  };
}
