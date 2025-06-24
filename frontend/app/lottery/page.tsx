import React from "react";

import PoolStats from "@/components/PoolStats";
import YourAccount from "@/components/YourAccount";
import RoundInfo from "@/components/RoundInfo";
import PurchaseTickets from "@/components/PurchaseTickets";
import QuickActions from "@/components/QuickActions";

const LotteryDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 mt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Pool Stats & Ticket Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pool Statistics */}
            <PoolStats />

            {/* Purchase Tickets */}
            <PurchaseTickets />

            {/* Recent Winners */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Recent Winners
              </h2>
              <div className="space-y-3">
                {[
                  { round: 23, winner: "0x1234...5678", amount: "$2,145" },
                  { round: 22, winner: "0x8765...4321", amount: "$1,876" },
                  { round: 21, winner: "0x9876...1234", amount: "$2,345" },
                ].map((item, i) => (
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
                        <div className="font-medium text-slate-900">
                          {item.winner}
                        </div>
                        <div className="text-sm text-slate-500">
                          Round {item.round}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {item.amount}
                      </div>
                      <div className="text-sm text-slate-500">Won</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Your Account */}
          <div className="space-y-6">
            {/* Your Account */}
            <YourAccount />

            {/* Current Round Info */}
            <RoundInfo />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryDashboard;
