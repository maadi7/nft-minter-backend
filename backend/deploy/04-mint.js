const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
try {
    const basicNft = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)
} catch (error) {
    console.log(error);
}
try {
        // Dynamic SVG  NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

   
} catch (error) {
    console.log(error);
}



try {
       // Random IPFS NFT
       const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
       const mintFee = await randomIpfsNft.getMintFee()
       const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
       const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
       // Need to listen for response
       await new Promise(async (resolve, reject) => {
           setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
           // setup listener for our event
           randomIpfsNft.once("NftMinted", async () => {
               resolve()//NftMinted
           })
           if (chainId == 31337) {
               const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
               const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
               await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
           }
       })
       console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
   // 0xb24E743dAeD44FB532F9a94658305F0BF7E29941
} catch (error) {
    console.log(error);
}
    


 
}
module.exports.tags = ["all", "mint"]