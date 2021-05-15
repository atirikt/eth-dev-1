const CoinStake = artifacts.require('CoinStake')

module.exports = async function(callback) {
  let coinStake = await CoinStake.deployed()
  await coinStake.issueCoins()
  // Code goes here...
  console.log("Coins issued!")
  callback()
}
