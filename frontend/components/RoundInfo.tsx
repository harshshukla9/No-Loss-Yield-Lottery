"use client";

import { useLottery } from "@/contexts/LotteryContext";

const RoundInfo = () => {
  const {
    currentRound,
    totalStakedUSD,
    totalTicketsInCurrentRound,
    isLoadingPrice,
    entryCutoffTime,
  } = useLottery();

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formattedTime =
    entryCutoffTime > 0 ? formatTimeRemaining(entryCutoffTime) : "Entry Closed";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Current Round
      </h2>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900">
            Round #{currentRound.data?.toString()}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Current lottery round
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Staked:</span>
            <span className="font-medium">
              {isLoadingPrice ? "Loading..." : `$${totalStakedUSD}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">
              Total Tickets In Current Round :
            </span>
            <span className="font-medium">
              {totalTicketsInCurrentRound.data?.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Entry Cutoff:</span>
            <span className="font-medium text-orange-600">{formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              After the entry cutoff time, your tickets will be used for the
              next round.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundInfo;
