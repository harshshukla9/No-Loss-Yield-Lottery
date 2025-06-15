// Script to force the upkeep to false to test the upkeep function

const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, signer);

const main = async () => {
    console.log("Force upkeep to false");
    const forceUpkeep = await lotteryContract.setCheckUpkeepToTrue(false);
    await forceUpkeep.wait();
    console.log("Force upkeep set to false");
    console.log(forceUpkeep);
}

main();