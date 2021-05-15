const DaiCoin = artifacts.require('DaiCoin')
const MockCoin = artifacts.require('MockCoin')
const CoinStake = artifacts.require('CoinStake')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function coins(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('CoinStake', ([owner, investor]) => {
  let dai, mockCoin, coinStake

  before(async () => {
    // Load Contracts
    dai = await DaiCoin.new()
    mockCoin = await MockCoin.new()
    coinStake = await CoinStake.new(mockCoin.address, dai.address)

    // Transfer all Mock Coins to stake (1 million)
    await mockCoin.transfer(coinStake.address, coins('1000000'))

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

  describe('Coin Stake deployment', async () => {
    it('has a name', async () => {
      const name = await coinStake.name()
      assert.equal(name, 'Mock Coin Stake')
    })

    it('contract has coins', async () => {
      let balance = await mockCoin.balanceOf(coinStake.address)
      assert.equal(balance.toString(), coins('1000000'))
    })
  })

  describe('Stakeing coins', async () => {

    it('rewards investors for staking mDai coins', async () => {
      let result

      // Check investor balance before staking
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Dai wallet balance correct before staking')

      // Stake Dai Coins
      await dai.approve(coinStake.address, coins('100'), { from: investor })
      await coinStake.stakeCoins(coins('100'), { from: investor })

      // Check staking result
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('0'), 'investor Dai wallet balance correct after staking')

      result = await dai.balanceOf(coinStake.address)
      assert.equal(result.toString(), coins('100'), 'Coin Stake Dai balance correct after staking')

      result = await coinStake.stakingBalance(investor)
      assert.equal(result.toString(), coins('100'), 'investor staking balance correct after staking')

      result = await coinStake.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Coins
      await coinStake.issueCoins({ from: owner })

      // Check balances after issuance
      result = await mockCoin.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Mock Coin wallet balance correct affter issuance')

      // Ensure that only onwer can issue coins
      await coinStake.issueCoins({ from: investor }).should.be.rejected;

      // Unstake coins
      await coinStake.unstakeCoins({ from: investor })

      // Check results after unstaking
      result = await dai.balanceOf(investor)
      assert.equal(result.toString(), coins('100'), 'investor Dai wallet balance correct after staking')

      result = await dai.balanceOf(coinStake.address)
      assert.equal(result.toString(), coins('0'), 'Coin Stake Dai balance correct after staking')

      result = await coinStake.stakingBalance(investor)
      assert.equal(result.toString(), coins('0'), 'investor staking balance correct after staking')

      result = await coinStake.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})
