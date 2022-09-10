const { network, getNamedAccounts, deployments, ethers} = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");
const {verify} = require("../utils/verify");

const imagesLocation = "./images/randomNft/";

const FUND_AMOUNT = "1000000000000000000000"; //10 Link
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            tarit_type: "Cuteness",
            value:100
        }
    ]
}
module.exports = async function ({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId

    let VrfCoordinatorV2Address, subscriptionId;
    let tokenUris = [
        'ipfs://QmTd7n5mVav3R2ZevvbAAvZLVAYwtesGk548kBoDh7Bz9Q',
        'ipfs://Qmb8mzjoszyBw1L4z2fj9yubqtFU7NbLkHGZCN6UTMjQTG',
        'ipfs://QmRQeS4sawEaNNioCNXCQDuZjwFSMZwKocMyCG8eSsCumf'
    ]
    if(process.env.UPLOAD_TO_PINARTA == "true"){
        tokenUris = await handleTokenUris();
    }
    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    }else{
        VrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("------------------------------------------");
    
  
    const args = [
        VrfCoordinatorV2Address, 
        subscriptionId, 
        networkConfig[chainId].gasLane, 
        networkConfig[chainId].mintFee,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        
    ]   

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    log("------------------------------------");

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying..........");
        await verify(randomIpfsNft.address, args);
    }

    log("Random Deployed!")

}

async function handleTokenUris(){
    tokenUris = []//imageUploadResponses
    let imageUploadResponseIndex;
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are:")
   
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]