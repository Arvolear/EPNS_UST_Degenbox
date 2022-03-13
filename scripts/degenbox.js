const fs = require("fs");
const Contract = require("@truffle/contract");

async function getDegenboxContract(web3, USTDegenboxAddress) {
  const DegenboxABI = fs.readFileSync("./abis/ust_degenbox.json").toString();
  const DegenboxContract = Contract({ abi: DegenboxABI });

  DegenboxContract.numberFormat = "BigNumber";
  DegenboxContract.setProvider(web3.currentProvider);

  return await DegenboxContract.at(USTDegenboxAddress);
}

module.exports = {
  getDegenboxContract,
};
