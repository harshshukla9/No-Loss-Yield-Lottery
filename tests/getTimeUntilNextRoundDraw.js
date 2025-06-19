// Script to get the time until the next round draw

const dotenv = require("dotenv");
dotenv.config();
const { v2lotteryContractAddress, v2Abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const lotteryContract = new ethers.Contract(v2lotteryContractAddress, v2Abi, provider);

const main = async () => {
    console.log("Getting time until next draw");
    const timeUntilNextDraw = await lotteryContract.getTimeUntilNextDraw();
    // Convert BigNumber to number (if needed)
    const totalSeconds = timeUntilNextDraw.toString ? Number(timeUntilNextDraw.toString()) : Number(timeUntilNextDraw);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    console.log(`Time until next draw: ${days}d ${hours}h ${minutes}m ${seconds}s`);
}

main();