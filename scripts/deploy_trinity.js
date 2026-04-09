const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const royaltyWallet = "0x377956c1471d9ce142df6932895839243da23a2c";

  // Deploy CHXToken ($LONDC)
  const CHXToken = await hre.ethers.getContractFactory("CHXToken");
  const chxToken = await CHXToken.deploy(royaltyWallet, royaltyWallet);
  await chxToken.deployed();
  console.log("CHXToken ($LONDC) deployed to:", chxToken.address);

  // Deploy ScrollVerseNFT
  const ScrollVerseNFT = await hre.ethers.getContractFactory("ScrollVerseNFT");
  const scrollVerseNFT = await ScrollVerseNFT.deploy(royaltyWallet, royaltyWallet, royaltyWallet);
  await scrollVerseNFT.deployed();
  console.log("ScrollVerseNFT deployed to:", scrollVerseNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
