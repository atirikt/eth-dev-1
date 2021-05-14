import React, { Component } from 'react'
import Web3 from 'web3'
import DaiCoin from '../abis/DaiCoin.json'
import MockCoin from '../abis/MockCoin.json'
import CoinFarm from '../abis/CoinFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load DaiCoin
    const daiData = DaiCoin.networks[networkId]
    if(daiData) {
      const dai = new web3.eth.Contract(DaiCoin.abi, daiData.address)
      this.setState({ dai })
      let daiBalance = await dai.methods.balanceOf(this.state.account).call()
      this.setState({ daiBalance: daiBalance.toString() })
    } else {
      window.alert('DaiCoin contract not deployed to detected network.')
    }

    // Load MockCoin
    const mockCoinData = MockCoin.networks[networkId]
    if(mockCoinData) {
      const mockCoin = new web3.eth.Contract(MockCoin.abi, mockCoinData.address)
      this.setState({ mockCoin })
      let mockCoinBalance = await mockCoin.methods.balanceOf(this.state.account).call()
      this.setState({ mockCoinBalance: mockCoinBalance.toString() })
    } else {
      window.alert('MockCoin contract not deployed to detected network.')
    }

    // Load CoinFarm
    const coinFarmData = CoinFarm.networks[networkId]
    if(coinFarmData) {
      const coinFarm = new web3.eth.Contract(CoinFarm.abi, coinFarmData.address)
      this.setState({ coinFarm })
      let stakingBalance = await coinFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('CoinFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeCoins = (amount) => {
    this.setState({ loading: true })
    this.state.dai.methods.approve(this.state.coinFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.coinFarm.methods.stakeCoins(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeCoins = (amount) => {
    this.setState({ loading: true })
    this.state.coinFarm.methods.unstakeCoins().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      dai: {},
      mockCoin: {},
      coinFarm: {},
      daiBalance: '0',
      mockCoinBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiBalance={this.state.daiBalance}
        mockCoinBalance={this.state.mockCoinBalance}
        stakingBalance={this.state.stakingBalance}
        stakeCoins={this.stakeCoins}
        unstakeCoins={this.unstakeCoins}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
