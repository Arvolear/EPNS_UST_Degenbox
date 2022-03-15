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
const notificationTreshold = 1; // 1 MIM token
const epsilon = 0.01;

async function checkAndNotify(epns, degenboxContract) {
  let valueStored = readStored();
  let currentBalance = (await degenboxContract.balanceOf(MIMAddress, USTCauldronAddress)).div(decimals).toNumber();

  if (currentBalance - valueStored >= notificationTreshold) {
    await notifyAll(
      epns,
      "Available Degenbox UST liquidity",
      `There are currently ${currentBalance} MIM tokens available for borrowing.`,
      "https://abracadabra.money/stand"
    );
  } else if (valueStored > epsilon && currentBalance <= epsilon) {
    await notifyAll(
      epns,
      "Drained Degenbox UST liquidity",
      "No more MIM tokens available for borrowing.",
      "https://abracadabra.money/stand"
    );
  }

  if (currentBalance != valueStored) {
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
    await delay(15000); // 15 sec
  }
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.log(e);
  });
