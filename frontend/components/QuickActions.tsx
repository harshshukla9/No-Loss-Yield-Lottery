"use client";

import { useLottery } from "@/contexts/LotteryContext";
import config from "@/lib/config";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import NotConnectedModal from "./NotConnectedModal";
import AreYouSure from "./AreYouSure";
import { revalidateLotteryData } from "@/lib/actions";
import { useRouter } from "next/navigation";

const QuickActions = () => {
  const [error, setError] = useState<string>("");
  const [isNotConnectedModalOpen, setIsNotConnectedModalOpen] = useState(false);
  const [isAreYouSureOpen, setIsAreYouSureOpen] = useState(false);
  const { userAddress } = useLottery();

  const router = useRouter();

  const {
    writeContract: withdraw,
    data: withdrawTx,
    isPending: withdrawingSubmission,
    reset: resetWithdraw,
    isError: withdrawError,
  } = useWriteContract();
  const { isSuccess: withdrawn, isLoading: isWithdrawingTxPending } =
    useWaitForTransactionReceipt({
      hash: withdrawTx,
    });

  const isWithdrawing = withdrawingSubmission || isWithdrawingTxPending;

  useEffect(() => {
    if (withdrawError) {
      setError("Withdrawal failed");
    }
    if (withdrawn) {
      resetWithdraw();
      revalidateLotteryData();
      router.refresh();
    }
  }, [withdrawn, resetWithdraw, withdrawError]);

  const handleWithdraw = async () => {
    setIsAreYouSureOpen(false);
    if (!userAddress) {
      setIsNotConnectedModalOpen(true);
      return;
    }
    try {
      setError("");
      withdraw({
        address: config.contractAddress as `0x${string}`,
        abi: config.abi,
        functionName: "withdrawAllOfAUsersTickets",
      });
    } catch (err) {
      setError("Withdrawal failed");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
            View Transaction History
          </button>
          <button
            className={`w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
              isWithdrawing
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : withdrawn
                ? "bg-green-600 text-white cursor-default"
                : "bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
            }`}
            onClick={() => {
              if (!userAddress) {
                setIsNotConnectedModalOpen(true);
              } else {
                setIsAreYouSureOpen(true);
              }
            }}
          >
            {isWithdrawing
              ? "Withdrawing..."
              : withdrawn
              ? "✓ Withdrawn"
              : "Withdraw All Tickets"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
      <NotConnectedModal
        isOpen={isNotConnectedModalOpen}
        onClose={() => setIsNotConnectedModalOpen(false)}
      />
      <AreYouSure
        isOpen={isAreYouSureOpen}
        onClose={() => setIsAreYouSureOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
};

export default QuickActions;
