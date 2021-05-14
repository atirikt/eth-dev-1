const CoinFarm = artifacts.require('CoinFarm')

module.exports = async function(callback) {
  let coinFarm = await CoinFarm.deployed()
  await coinFarm.issueCoins()
  // Code goes here...
  console.log("Coins issued!")
  callback()
}
