const sdk = require("@epnsproject/backend-sdk").default;
const fs = require("fs");

const epnsCommAddress = "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa";
const epnsABI = fs.readFileSync("./abis/epns.json").toString();

function getEPNS() {
  const network = {
    etherscan: null,
    infura: process.env.INFURA_KEY,
    alchemy: null,
  };

  const epnsSettings = {
    network: 1,
    contractAddress: epnsCommAddress,
    contractABI: epnsABI,
  };

  return new sdk("Mainnet", process.env.PRIVATE_KEY, process.env.PUBLIC_KEY, network, epnsSettings, epnsSettings);
}

async function notifyAll(epns, title, body, link) {
  const allSubscribers = await epns.getSubscribedUsers();
  // console.log(allSubscribers);

  const response = await epns.sendNotification(
    "0xEd498E75d471C3b874461a87Bb7146453CC8175A",
    title,
    body,
    title,
    body,
    1, // 1 - broadcast
    link,
    undefined,
    false,
    { offChain: true }
  );

  console.log(response);
}

module.exports = {
  getEPNS,
  notifyAll,
};
