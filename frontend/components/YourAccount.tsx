"use client";

import { useLottery } from "@/contexts/LotteryContext";
import { formatUnits } from "viem";

const YourAccount = () => {
  const { isConnected, userAddress, userTickets, userStakes, userWinRate } =
    useLottery();

  if (!isConnected || !userAddress) {
    return null;
  }

  const formattedStaked = userStakes.data
    ? formatUnits(userStakes.data as bigint, 18)
    : "0";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Your Account
      </h2>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {userTickets}
            </div>
            <div className="text-sm text-slate-600 mt-1">Your Tickets</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Staked:</span>
            <span className="font-medium">
              {parseFloat(formattedStaked).toFixed(2)} LINK
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Win Chance:</span>
            <span className="font-medium text-blue-600">
              {userWinRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourAccount;
