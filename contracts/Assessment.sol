// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Transfer(address to, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit() public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += msg.value;

        // assert transaction completed successfully
        assert(balance == _previousBalance + msg.value);

        // emit the event
        emit Deposit(msg.value);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // custom error for transfer
    error TransferFailed(address to, uint256 amount);

    function transfer(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _amount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _amount
            });
        }

        // transfer the given amount
        balance -= _amount;

        // perform the transfer
        (bool success, ) = _to.call{value: _amount}("");
        if (!success) {
            revert TransferFailed({
                to: _to,
                amount: _amount
            });
        }

        // assert the balance is correct
        assert(balance == (_previousBalance - _amount));

        // emit the event
        emit Transfer(_to, _amount);
    }
}
