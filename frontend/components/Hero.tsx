"use client";
import React from "react";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import TimeUntilNextLottery from "./TimeUntilNextLottery";
import Image from "next/image";
import heroBg from "@/public/hero-image-1.png";
import { useLottery } from "@/contexts/LotteryContext";
import { formatUnits } from "viem";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

const ChainlinkSvg = () => (
  <svg
    viewBox="0 0 247 284"
    fill="#0847F7"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-auto"
    aria-label="Chainlink"
  >
    <path d="M123.5 0L0 70.9726V212.918L123.5 283.89L247 212.918V70.9726L123.5 0ZM194.679 182.837L123.523 223.728L52.3663 182.837V101.054L123.523 60.1621L194.679 101.054V182.837Z" />
  </svg>
);

const Hero = () => {
  const { totalStaked, totalTicketsInCurrentRound, ticketPurchaseCost } =
    useLottery();

  const formatTotalStaked = () => {
    if (totalStaked.isLoading) return "Loading...";
    if (totalStaked.error) return "Error";
    if (!totalStaked.data || typeof totalStaked.data !== "bigint")
      return "0.00";
    return parseFloat(formatUnits(totalStaked.data, 18)).toFixed(2);
  };

  const formatTotalTicketsInCurrentRound = () => {
    if (totalTicketsInCurrentRound.isLoading) return "Loading...";
    if (totalTicketsInCurrentRound.error) return "Error";
    if (!totalTicketsInCurrentRound.data) return "0";
    return totalTicketsInCurrentRound.data.toString();
  };

  const formatTicketPurchaseCost = () => {
    if (ticketPurchaseCost.isLoading) return "Loading...";
    if (ticketPurchaseCost.error) return "Error";
    if (!ticketPurchaseCost.data || typeof ticketPurchaseCost.data !== "bigint")
      return "0.00";
    return parseFloat(formatUnits(ticketPurchaseCost.data, 18)).toFixed(2);
  };

  const stats = [
    {
      name: "Prize Pool",
      value: `${formatTotalStaked()} LINK`,
      color: "text-slate-900",
    },
    {
      name: "Tickets Sold",
      value: `${formatTotalTicketsInCurrentRound()}`,
      color: "text-slate-900",
    },
    {
      name: "Ticket Price",
      value: `${formatTicketPurchaseCost()} LINK`,
      color: "text-slate-900",
    },
  ];

  return (
    <section className="relative h-screen overflow-hidden bg-white text-black">
      <Image
        src={heroBg}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center justify-center gap-y-3 mb-6">
            <div className="flex items-center gap-x-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-black shadow-lg backdrop-blur-sm ring-1 ring-slate-900/10">
              <ChainlinkSvg />
              <span>Powered by Chainlink</span>
            </div>
            <TimeUntilNextLottery />
          </div>
          <h1
            className={`text-[7rem] font-bold text-black sm:text-8xl drop-shadow-[5px_5px_5px_rgba(0,0,0,0.5)] ${instrumentSerif.className}`}
          >
            Don't YOLO. <span>Just NoLo</span>
          </h1>

          <p className="mt-6 text-xl font-medium leading-8 text-black drop-shadow-[5px_5px_5px_rgba(0,0,0,0.5)]">
            The world's first no-loss lottery. Deposit LINK, win prizes, keep
            your principal forever.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/lottery"
              className="rounded-lg bg-black px-8 py-3 text-base font-semibold text-white shadow-lg focus-visible:outline-offset-2 focus-visible:outline-black transition-colors duration-200 hover:bg-black/80 drop-shadow-[5px_5px_5px_rgba(0,0,0,0.5)]"
            >
              Enter Lottery
            </Link>
            <a
              href="https://github.com/eik-1/No-Loss-Yield-Lottery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold leading-7 text-black group hover:text-black/80 drop-shadow-[5px_5px_5px_rgba(0,0,0,0.5)]"
            >
              View Contract{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
              >
                →
              </span>
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-px bg-slate-900/5 sm:grid-cols-3 rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-900/5">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white/70 backdrop-blur-md px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
                >
                  <p className="text-sm font-medium leading-6 text-slate-500">
                    {stat.name}
                  </p>
                  <p className="mt-2 flex items-baseline gap-x-2">
                    <span
                      className={`text-4xl font-bold tracking-tight ${stat.color}`}
                    >
                      {stat.value}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
