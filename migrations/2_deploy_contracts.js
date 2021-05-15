const MockCoin = artifacts.require('MockCoin')
const DaiCoin = artifacts.require('DaiCoin')
const CoinStake = artifacts.require('CoinStake')

module.exports = async function(deployer, network, accounts) {
  // Deploy Dai Coin
  await deployer.deploy(DaiCoin)
  const dai = await DaiCoin.deployed()

  // Deploy Mock Coin
  await deployer.deploy(MockCoin)
  const mockCoin = await MockCoin.deployed()

  // Deploy CoinStake
  await deployer.deploy(CoinStake, mockCoin.address, dai.address)
  const coinStake = await CoinStake.deployed()

  // Transfer all coins to CoinStake (1 million)
  await mockCoin.transfer(coinStake.address, '1000000000000000000000000')

  // Transfer 100 Dai coins to investor
  await dai.transfer(accounts[1], '100000000000000000000')
}
