import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  anvil,
} from "wagmi/chains";

// Use NEXT_PUBLIC_ prefix for client-side environment variables
const sepoliaRpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org";

const customSepolia = {
  ...sepolia,
  rpcUrls: {
    default: { http: [sepoliaRpcUrl] },
    public: { http: [sepoliaRpcUrl] },
  },
};

export const config = getDefaultConfig({
  appName: "No Loss Lottery",
  projectId: "71cda57ca511883099415cf3026bd537",
  chains: [
    customSepolia,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    anvil,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [customSepolia]
      : []),
  ],
  ssr: true,
});
