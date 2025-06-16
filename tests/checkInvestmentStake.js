// this checks the lottery contract for the latest investment balance
// it returns the ammount of aEthLink in the contract

const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, signer);


const main = async () => {
    console.log("Getting amount staked")

    const investmentStakeCheck = await lotteryContract.getAaveInvestmentBalance();
    console.log("Total amount in the contract:", ethers.formatEther(investmentStakeCheck));
    const amountStaked = await lotteryContract.getTotalStaked();
    console.log("Amount staked:", ethers.formatEther(amountStaked));
    console.log("interest Accrued:", ethers.formatEther( investmentStakeCheck - amountStaked ));
}

main();