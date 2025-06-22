"use client";

import { useLottery } from "@/contexts/LotteryContext";
import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import config from "@/lib/config";
import { redirect } from "next/navigation";
import { revalidateLotteryData } from "@/lib/actions";

const PurchaseTickets = () => {
  const { ticketPurchaseCost } = useLottery();
  const [ticketAmount, setTicketAmount] = useState("");
  const [error, setError] = useState("");

  // Approval
  const {
    writeContract: approve,
    data: approveTx,
    isPending: approving,
    reset: resetApprove,
  } = useWriteContract();
  const { isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approveTx,
  });

  // Staking
  const {
    writeContract: stake,
    data: stakeTx,
    isPending: staking,
    reset: resetStake,
  } = useWriteContract();
  const { isSuccess: staked } = useWaitForTransactionReceipt({ hash: stakeTx });

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError("");

    // Only allow positive integers
    if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
      setError("Enter a whole number");
      return;
    }
    setTicketAmount(value);
  };

  const handleApprove = async () => {
    if (!ticketAmount || !ticketPurchaseCost.data) return;

    setError("");
    const amount = BigInt(ticketAmount) * (ticketPurchaseCost.data as bigint);

    try {
      approve({
        address: config.linkTokenAddress as `0x${string}`,
        abi: config.linkTokenAbi,
        functionName: "approve",
        args: [config.contractAddress, amount],
      });
    } catch (err) {
      setError("Approval failed");
    }
  };

  const handleStake = async () => {
    if (!ticketAmount || !ticketPurchaseCost.data) return;

    setError("");
    const amount = BigInt(ticketAmount) * (ticketPurchaseCost.data as bigint);

    try {
      stake({
        address: config.contractAddress as `0x${string}`,
        abi: config.abi,
        functionName: "stake",
        args: [amount],
      });
    } catch (err) {
      setError("Staking failed");
    }
  };

  // Reset state and revalidate after successful stake
  useEffect(() => {
    if (staked) {
      setTicketAmount("");
      setError("");

      // Reset transaction states
      resetApprove();
      resetStake();

      revalidateLotteryData();
      //   redirect("/lottery");
    }
  }, [staked, resetApprove, resetStake]);

  const ticketCost = ticketPurchaseCost.data
    ? formatUnits(ticketPurchaseCost.data as bigint, 18)
    : "...";

  const totalCost =
    ticketAmount && ticketPurchaseCost.data
      ? (
          Number(formatUnits(ticketPurchaseCost.data as bigint, 18)) *
          Number(ticketAmount)
        ).toFixed(4)
      : "0";

  const isInputDisabled = approving || staking;
  let isApproveDisabled =
    !ticketAmount || !!error || approving || !ticketPurchaseCost.data;
  let isStakeDisabled =
    !ticketAmount ||
    !!error ||
    staking ||
    !approved ||
    !ticketPurchaseCost.data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Purchase Tickets
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of Tickets
          </label>
          <input
            type="number"
            placeholder="0"
            value={ticketAmount}
            onChange={handleTicketChange}
            min="1"
            step="1"
            disabled={isInputDisabled}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Cost:</span>
            <span className="font-medium">{totalCost} LINK</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Per Ticket:</span>
            <span className="font-medium">{ticketCost} LINK</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div
            className={`flex items-center space-x-2 ${
              approved ? "text-green-600" : ""
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                approved ? "bg-green-600 border-green-600" : "border-slate-300"
              }`}
            ></div>
            <span>Approve LINK</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-3"></div>
          <div
            className={`flex items-center space-x-2 ${
              staked
                ? "text-green-600"
                : approved
                ? "text-slate-900"
                : "text-slate-400"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                staked
                  ? "bg-green-600 border-green-600"
                  : approved
                  ? "border-slate-300"
                  : "border-slate-200"
              }`}
            ></div>
            <span>Stake LINK</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={isApproveDisabled}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm ${
              approved
                ? "bg-green-600 text-white cursor-default"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {approving
              ? "Approving..."
              : approved
              ? "✓ Approved"
              : "1. Approve LINK"}
          </button>

          <button
            onClick={handleStake}
            disabled={isStakeDisabled}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm ${
              staked
                ? "bg-green-600 text-white cursor-default"
                : approved
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {staking ? "Staking..." : staked ? "✓ Staked" : "2. Stake LINK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTickets;
