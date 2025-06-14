// Script to get the time until the next round draw

const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, provider);

const main = async () => {
    console.log("Getting time until next draw");
    const timeUntilNextDraw = await lotteryContract.getTimeUntilNextDraw();
    console.log("Time until next draw:", timeUntilNextDraw);
}

main();