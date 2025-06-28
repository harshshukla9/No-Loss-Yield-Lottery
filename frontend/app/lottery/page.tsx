import React from "react";

import PoolStats from "@/components/PoolStats";
import YourAccount from "@/components/YourAccount";
import RoundInfo from "@/components/RoundInfo";
import PurchaseTickets from "@/components/PurchaseTickets";
import QuickActions from "@/components/QuickActions";
import RecentWinners from "@/components/RecentWinners";

const LotteryDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 mt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Pool Stats & Ticket Purchase */}
          <div className="lg:col-span-2 space-y-6">
            <PoolStats />
            <PurchaseTickets />
            <RecentWinners />
          </div>
          {/* Right Column - Your Account */}
          <div className="space-y-6">
            <YourAccount />
            <RoundInfo />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryDashboard;
