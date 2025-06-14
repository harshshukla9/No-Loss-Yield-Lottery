// Script to check the user stakes

const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const addressToCheck = "0x1ABc133C222a185fEde2664388F08ca12C208F76"// change to your address

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, provider);



const main = async () => {
    const userStakes = await lotteryContract.getUserStakes(addressToCheck);
    console.log("User stakes:", ethers.formatEther(userStakes));
}

main();