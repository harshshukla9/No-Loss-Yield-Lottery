// Script to force the upkeep to true to test the upkeep function

const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, provider);

const main = async () => {
    console.log("Force upkeep to true");
    const forceUpkeep = await lotteryContract.setCheckUpkeepToTrue(true);
    await forceUpkeep.wait();
    console.log("Force upkeep set to true");
    console.log(forceUpkeep);
}

main();