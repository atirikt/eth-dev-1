pragma solidity ^0.5.0;

import "./MockCoin.sol";
import "./DaiCoin.sol";

contract CoinStake {
    string public name = "Mock Coin Stake";
    address public owner;
    MockCoin public mockCoin;
    DaiCoin public dai;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(MockCoin _mockCoin, DaiCoin _dai) public {
        mockCoin = _mockCoin;
        dai = _dai;
        owner = msg.sender;
    }

    function stakeCoins(uint _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        // Trasnfer Dai coins to this contract for staking
        dai.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstaking Coins (Withdraw)
    function unstakeCoins() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // Transfer Dai coins to this contract for staking
        dai.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

    // Issuing Coins
    function issueCoins() public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue coins to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                mockCoin.transfer(recipient, balance);
            }
        }
    }
}
