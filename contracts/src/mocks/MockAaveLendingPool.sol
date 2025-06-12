// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { MockERC20 } from "./MockERC20.sol";

contract MockAaveLendingPool {
    address public usdc;
    address public aUsdc;
    mapping(address => uint256) public supplied;

    constructor(address _usdc, address _aUsdc) {
        usdc = _usdc;
        aUsdc = _aUsdc;
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        // Simulate Aave supply: just mint aUSDC to the contract
        MockERC20(aUsdc).mint(onBehalfOf, amount);
        supplied[address(this)] += amount;
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        // Simulate Aave withdraw: burn aUSDC and transfer USDC
        require(supplied[address(this)] >= amount, "Not enough supplied");
        supplied[address(this)] -= amount;
        MockERC20(aUsdc).transferFrom(address(this), address(this), amount);
        MockERC20(usdc).mint(to, amount);
        return amount;
    }
}