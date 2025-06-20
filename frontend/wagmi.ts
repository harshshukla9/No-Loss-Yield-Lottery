import { createConfig, http } from "wagmi";
import {sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
  transports: {
    [sepolia.id]: http("https://1rpc.io/sepolia"),
    // Add other chains as needed
  },
});