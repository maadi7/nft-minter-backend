const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const {assert,} = require("chai");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip:
describe("", function(){
    let basicNft;
    beforeEach(async function (){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        basicNft = await ethers.getContract("BasicNFT", deployer);
    });
    it("Allows users to mint", async ()=>{
        const txResponse = await basicNft.mintNft();
        await txResponse.wait(1);
        const tokenURI = await basicNft.tokenURI(0);
        const tokenCounter = await basicNft.getTokenCounter();

        assert.equal(tokenCounter.toString(), "1");
        assert.equal(tokenURI, await basicNft.TOKEN_URI());
    }) 
})