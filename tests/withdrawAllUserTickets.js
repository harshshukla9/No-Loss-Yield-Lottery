const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, signer);
const linkToken = new ethers.Contract(linkTokenAddress, linkTokenAbi, signer);

const main = async () => {
    const withdrawTx = await lotteryContract.withdrawAllOfAUsersTickets();
    await withdrawTx.wait();
    console.log("Withdraw transaction sent");
    console.log(withdrawTx);
    console.log("************************************************************")
    console.log("Getting amount staked")
    const amountStaked = await lotteryContract.getTotalStaked();
    console.log("Amount staked:", ethers.formatEther(amountStaked));
}

main();