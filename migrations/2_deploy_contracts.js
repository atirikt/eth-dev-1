const MockCoin = artifacts.require('MockCoin')
const DaiCoin = artifacts.require('DaiCoin')
const CoinFarm = artifacts.require('CoinFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy Dai Coin
  await deployer.deploy(DaiCoin)
  const dai = await DaiCoin.deployed()

  // Deploy Mock Coin
  await deployer.deploy(MockCoin)
  const mockCoin = await MockCoin.deployed()

  // Deploy CoinFarm
  await deployer.deploy(CoinFarm, mockCoin.address, dai.address)
  const coinFarm = await CoinFarm.deployed()

  // Transfer all coins to CoinFarm (1 million)
  await mockCoin.transfer(coinFarm.address, '1000000000000000000000000')

  // Transfer 100 Dai coins to investor
  await dai.transfer(accounts[1], '100000000000000000000')
}
