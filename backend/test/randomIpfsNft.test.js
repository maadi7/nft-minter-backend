const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const {assert, expect } = require("chai");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip:
describe("Random IPFS NFT Unit Tests", function(){
    let randomIpfsNft, deployer, vrfCoordinatorV2Mock, mintValue;

    beforeEach( async () =>{
        accounts = await ethers.getSigners();
        deployer = accounts[0];//randomipfs
        await deployments.fixture(["all"]);//RandomIpfsNft
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
        mintValue = await randomIpfsNft.getMintFee()
       // console.log(randomIpfsNft.address);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); 
    });

    describe("constructor", () => {
      it("set intial value correctly", async ()=>{
           const token = await randomIpfsNft.getDogTokenUris(0);
           assert(token.includes("ipfs://"));
      }); 
    });

    describe("requestNft", () => {
      it("revert if not enough eth", async()=>{
        await expect(randomIpfsNft.requestNft()).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
      });
      it("emit event on requestNft", async () =>{
        await expect(randomIpfsNft.requestNft({value: mintValue})).to.emit(randomIpfsNft, "NftRequested");
        //console.log(await randomIpfsNft.requestNft());
      });

    });
    
    describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async function () {
            await new Promise(async (resolve, reject) => {
                randomIpfsNft.once("NftMinted", async () => {
                    try {
                        const tokenUri = await randomIpfsNft.tokenURI("0")
                        const tokenCounter = await randomIpfsNft.getTokenCounter()
                        assert.equal(tokenUri.toString().includes("ipfs://"), true)
                        assert.equal(tokenCounter.toString(), "2")
                        resolve()
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                })
                try {
                    const fee = await randomIpfsNft.getMintFee()
                    const requestNftResponse = await randomIpfsNft.requestNft({
                        value: fee.toString(),
                    })
                    const requestNftReceipt = await requestNftResponse.wait(1)
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        requestNftReceipt.events[1].args.requestId,
                        randomIpfsNft.address
                    )
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            })
        })
    })
    

    
    

})