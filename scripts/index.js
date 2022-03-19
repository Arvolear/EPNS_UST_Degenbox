const dotenv = require("dotenv");
const Web3 = require("web3");
const { getEPNS, notifyAll } = require("./epns");
const { readStored, storeValue } = require("./pseudodb");
const { getDegenboxContract } = require("./degenbox");

dotenv.config();

const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`);

const MIMAddress = "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
const USTCauldronAddress = "0x59E9082E068Ddb27FC5eF1690F9a9f22B32e573f";
const USTDegenboxAddress = "0xd96f48665a1410c0cd669a88898eca36b9fc2cce";

const decimals = "1000000000000000000"; // 10**18
const notificationTresholdUp = 1.5; // 1.5x raise in liquidity
const notificationThresholdDown = 2; // 2x drop in liquidity
const epsilon = 1;

const checkTime = 10000; // 10 sec

/**
 * This function sends notifications in these 3 cases:
 *
 *   - if the external balance is more than E MIM tokens and
 *     the difference between the external value and the stored value is more than X times (external > stored)
 *
 *   - if the external value is more than E MIM tokens and
 *     the difference between the stored value and the external value is more than Y times (stored > external)
 *
 *   - if the external value is less than E MIM tokens and the stored value is more than E MIM tokens
 */
async function checkAndNotify(epns, degenboxContract) {
  let valueStored = readStored();
  let currentBalance = (await degenboxContract.balanceOf(MIMAddress, USTCauldronAddress)).div(decimals).toNumber();

  if (currentBalance >= epsilon && currentBalance > valueStored * notificationTresholdUp) {
    await notifyAll(
      epns,
      "Added liquidity",
      `There are currently ${currentBalance} MIM tokens available for borrowing.`,
      "https://abracadabra.money/stand"
    );
    storeValue(currentBalance);
  } else if (currentBalance >= epsilon && valueStored > currentBalance * notificationThresholdDown) {
    await notifyAll(
      epns,
      "Dropped liquidity",
      `There are currently ${currentBalance} MIM tokens left for borrowing.`,
      "https://abracadabra.money/stand"
    );
    storeValue(currentBalance);
  } else if (currentBalance < epsilon && valueStored >= epsilon) {
    await notifyAll(
      epns,
      "Drained liquidity",
      "No more MIM tokens available for borrowing.",
      "https://abracadabra.money/stand"
    );
    storeValue(currentBalance);
  }

  console.log("checked " + new Date());
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const degenboxContract = await getDegenboxContract(web3, USTDegenboxAddress);
  const epns = getEPNS(degenboxContract);

  while (true) {
    await checkAndNotify(epns, degenboxContract);
    await delay(checkTime);
  }
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.log(e);
  });
