const { network, getNamedAccounts, deployments, ethers} = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config");
const {verify} = require("../utils/verify");

module.exports = async function ({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts();

    log("-----------------------------------");
    const args = [];
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log:true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying..........");
        await verify(basicNFT.address, args);
    }

    log("-----------------------------------");
}

module.exports.tags = ["basic", "all", "main"];