"use client";

import { useLottery } from "@/contexts/LotteryContext";
import { useEffect } from "react";

const RecentWinners = () => {
  const { recentWinners } = useLottery();

  useEffect(() => {
    console.log(recentWinners);
  }, [recentWinners]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Recent Winners
      </h2>
      <div className="space-y-3">
        {recentWinners.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  #{item.round}
                </span>
              </div>
              <div>
                <div className="font-medium text-slate-900">{item.winner}</div>
                <div className="text-sm text-slate-500">Round {item.round}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">${item.amount}</div>
              <div className="text-sm text-slate-500">Won</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWinners;
