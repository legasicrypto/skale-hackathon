import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  let usdc = (process.env.USDC_ADDRESS || "").trim();
  let wbtc = (process.env.WBTC_ADDRESS || "").trim();
  if (usdc.startsWith("0x") && usdc.length > 42) usdc = usdc.slice(0, 42);
  if (wbtc.startsWith("0x") && wbtc.length > 42) wbtc = wbtc.slice(0, 42);
  try {
    usdc = ethers.getAddress(usdc);
    wbtc = ethers.getAddress(wbtc);
  } catch (e) {
    throw new Error(`Missing or invalid token addresses. USDC=${usdc} WBTC=${wbtc}`);
  }

  const Core = await ethers.getContractFactory("LegasiCore");
  const core = await Core.deploy(deployer.address);
  await core.waitForDeployment();
  console.log("Core:", await core.getAddress());

  const Rep = await ethers.getContractFactory("ReputationRegistry");
  const rep = await Rep.deploy();
  await rep.waitForDeployment();
  console.log("ReputationRegistry:", await rep.getAddress());

  const Lending = await ethers.getContractFactory("LegasiLending");
  const lending = await Lending.deploy(await core.getAddress(), await rep.getAddress());
  await lending.waitForDeployment();
  console.log("Lending:", await lending.getAddress());

  const LP = await ethers.getContractFactory("LegasiLP");
  const lp = await LP.deploy(usdc, "bUSDC", "bUSDC");
  await lp.waitForDeployment();
  console.log("LP:", await lp.getAddress());

  const GAD = await ethers.getContractFactory("LegasiGAD");
  const gad = await GAD.deploy();
  await gad.waitForDeployment();
  console.log("GAD:", await gad.getAddress());

  const X402 = await ethers.getContractFactory("X402Receipt");
  const x402 = await X402.deploy();
  await x402.waitForDeployment();
  console.log("X402Receipt:", await x402.getAddress());

  // register collateral + borrowable
  await (await core.registerCollateral(ethers.ZeroAddress, 7500, 8000, 500, 18)).wait(); // ETH
  await (await core.registerCollateral(wbtc, 7000, 7500, 500, 8)).wait(); // WBTC
  await (await core.registerBorrowable(usdc, 500, 6)).wait(); // USDC

  console.log("Initialized collateral + borrowable");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
