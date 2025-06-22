"use client";

import { useLottery } from "@/contexts/LotteryContext";
import TimeUntilNextLottery from "./TimeUntilNextLottery";
import { formatUnits } from "viem";

const PoolStats = () => {
  const { totalStaked, ticketCount, totalYieldGenerated } = useLottery();

  const formatTotalStaked = () => {
    if (totalStaked.isLoading) return "Loading...";
    if (totalStaked.error) return "Error";
    if (!totalStaked.data) return "0.00";
    return parseFloat(formatUnits(totalStaked.data, 18)).toFixed(2);
  };

  const formatTicketCount = () => {
    if (ticketCount.isLoading) return "Loading...";
    if (ticketCount.error) return "Error";
    if (!ticketCount.data) return "0";
    return ticketCount.data.toString();
  };

  const formatTotalYieldGenerated = () => {
    if (totalYieldGenerated.isLoading) return "Loading...";
    if (totalYieldGenerated.error) return "Error";
    if (!totalYieldGenerated.data) return "0.00";
    return parseFloat(formatUnits(totalYieldGenerated.data, 18)).toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Pool Statistics
        </h2>
        <TimeUntilNextLottery />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatTotalStaked()} LINK
          </div>
          <div className="text-sm text-slate-600 mt-1">Total Pool Size</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatTicketCount()}
          </div>
          <div className="text-sm text-slate-600 mt-1">Active Tickets</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatTotalYieldGenerated()} LINK
          </div>
          <div className="text-sm text-slate-600 mt-1">Current Yield</div>
        </div>
      </div>
    </div>
  );
};

export default PoolStats;
