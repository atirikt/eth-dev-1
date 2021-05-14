const DaiCoin = artifacts.require('DaiCoin')
const MockCoin = artifacts.require('MockCoin')
const CoinFarm = artifacts.require('CoinFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function coins(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('CoinFarm', ([owner, investor]) => {
  let dai, mockCoin, coinFarm

  before(async () => {
    // Load Contracts
    dai = await DaiCoin.new()
    mockCoin = await MockCoin.new()
    coinFarm = await CoinFarm.new(mockCoin.address, dai.address)

    // Transfer all Mock Coins to farm (1 million)
    await mockCoin.transfer(coinFarm.address, coins('1000000'))

    // Send coins to investor
    await dai.transfer(investor, coins('100'), { from: owner })
  })

  describe('Dai deployment', async () => {
    it('has a name', async () => {
      const name = await dai.name()
      assert.equal(name, 'Dai Coin')
    })
  })

  describe('Mock Coin deployment', async () => {
    it('has a name', async () => {
      const name = await mockCoin.name()
      assert.equal(name, 'Mock Coin')
    })
  })

  describe('Coin Farm deployment', async () => {
    it('has a name', async () => {
      const name = await coinFarm.name()
      assert.equal(name, 'Mock Coin Farm')
    })

    it('contract has coins', async () => {
      let balance = await mockCoin.balanceOf(coinFarm.address)
      assert.equal(balance.toString(), coins('1000000'))
    })
  })

  describe('Farming coins', async () => {

    it('rewards investors for staking mDai coins', async () => {
      let result

      // Check investor balance before staking
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Dai wallet balance correct before staking')

      // Stake Dai Coins
      await dai.approve(coinFarm.address, coins('100'), { from: investor })
      await coinFarm.stakeCoins(coins('100'), { from: investor })

      // Check staking result
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('0'), 'investor Dai wallet balance correct after staking')

      result = await dai.balanceOf(coinFarm.address)
      assert.equal(result.toString(), coins('100'), 'Coin Farm Dai balance correct after staking')

      result = await coinFarm.stakingBalance(investor)
      assert.equal(result.toString(), coins('100'), 'investor staking balance correct after staking')

      result = await coinFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Coins
      await coinFarm.issueCoins({ from: owner })

      // Check balances after issuance
      result = await mockCoin.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Mock Coin wallet balance correct affter issuance')

      // Ensure that only onwer can issue coins
      await coinFarm.issueCoins({ from: investor }).should.be.rejected;

      // Unstake coins
      await coinFarm.unstakeCoins({ from: investor })

      // Check results after unstaking
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Dai wallet balance correct after staking')

      result = await dai.balanceOf(coinFarm.address)
      assert.equal(result.toString(), coins('0'), 'Coin Farm Dai balance correct after staking')

      result = await coinFarm.stakingBalance(investor)
      assert.equal(result.toString(), coins('0'), 'investor staking balance correct after staking')

      result = await coinFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})
