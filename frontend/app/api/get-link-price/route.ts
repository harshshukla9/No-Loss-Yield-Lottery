import { NextRequest, NextResponse } from "next/server";

let cachedData: any = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  const now = Date.now();

  if (cachedData && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=chainlink&vs_currencies=usd`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("link price: ", data);

    cachedData = data;
    lastFetch = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching LINK price:", error);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: "Failed to fetch LINK price" },
      { status: 500 }
    );
  }
}
