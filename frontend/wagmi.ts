import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon, sepolia, anvil } from "wagmi/chains";

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (!sepoliaRpcUrl) {
  throw new Error("NEXT_PUBLIC_RPC_URL is not set in your environment variables.");
}
const customSepolia = {
  ...sepolia,
  rpcUrls: {
    default: { http: [sepoliaRpcUrl] },
    public: { http: [sepoliaRpcUrl] },
  },
};

export const config = getDefaultConfig({
  appName: "RainbowKit Demo",
  projectId: "YOUR_PROJECT_ID", // Keep or remove if unnecessary
  chains: [
    customSepolia,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    anvil, // ✅ Add localhost for Hardhat
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [customSepolia] : []),
  ],
  ssr: true,
});