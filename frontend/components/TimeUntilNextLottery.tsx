"use client";

import { useFetchTimeUntilNextDraw } from "@/hooks/fetchTimeUntilNextDraw";
import { formatDuration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

const TimeUntilNextLottery = () => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const { seconds, isLoading, error } = useFetchTimeUntilNextDraw();

  useEffect(() => {
    if (seconds !== undefined) {
      setRemainingSeconds(Number(seconds));
    }
  }, [seconds]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSeconds]);

  const formatTime = (totalSeconds: number): string => {
    const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
    return formatDuration(duration, {
      format: ["days", "hours", "minutes", "seconds"],
      delimiter: ", ",
    });
  };

  const formattedTime =
    remainingSeconds !== null
      ? formatTime(remainingSeconds)
      : formatTime(seconds || 0);

  return (
    <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30 mb-6">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        {isLoading ? "Loading..." : error ? "Error" : formattedTime}
      </span>
    </div>
  );
};

export default TimeUntilNextLottery;
