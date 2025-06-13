const dotenv = require("dotenv");
dotenv.config();
const { lotteryContractAddress, abi, linkTokenAddress, linkTokenAbi } = require("./config");

const { ethers } = require("ethers");


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const lotteryContract = new ethers.Contract(lotteryContractAddress, abi, signer);
const linkToken = new ethers.Contract(linkTokenAddress, linkTokenAbi, signer);

const main = async () => {
    console.log("Approving link token to this contract")
    const approve = await linkToken.approve(lotteryContractAddress, ethers.parseEther("5"));
    await approve.wait();
    console.log("supplying 5 LINK to the lottery contract")
    const supplyTx = await lotteryContract.stake(ethers.parseEther("5"));
    await supplyTx.wait();
    console.log("Supply transaction sent");
    console.log(supplyTx);
    console.log("************************************************************")
    console.log("Getting amount staked")
    const amountStaked = await lotteryContract.getTotalStaked();
    console.log("Amount staked:", ethers.formatEther(amountStaked));
    const userStakes = await lotteryContract.getUserStakes(signer.address);
    console.log("User stakes:", ethers.formatEther(userStakes));
}

main();