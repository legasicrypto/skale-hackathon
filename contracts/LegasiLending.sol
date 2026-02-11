// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LegasiCore} from "./LegasiCore.sol";
import {ReputationRegistry} from "./ReputationRegistry.sol";

contract LegasiLending {
    struct CollateralDeposit {
        address token;
        uint256 amount;
    }

    struct BorrowedAmount {
        address token;
        uint256 amount;
    }

    struct Position {
        address owner;
        CollateralDeposit[] collaterals;
        BorrowedAmount[] borrows;
        uint256 lastUpdate;
    }

    struct AgentConfig {
        uint256 dailyBorrowLimitUsd6;
        uint256 dailyBorrowedUsd6;
        uint256 periodStart;
        bool autoRepayEnabled;
        bool x402Enabled;
    }

    LegasiCore public core;
    ReputationRegistry public reputation;

    mapping(address => Position) public positions;
    mapping(address => AgentConfig) public agentConfigs;

    event PositionCreated(address indexed owner);
    event Deposited(address indexed owner, address token, uint256 amount);
    event Borrowed(address indexed owner, address token, uint256 amount);
    event Repaid(address indexed owner, address token, uint256 amount);

    constructor(address _core, address _reputation) {
        core = LegasiCore(_core);
        reputation = ReputationRegistry(_reputation);
    }

    function initializePosition() external {
        Position storage p = positions[msg.sender];
        require(p.owner == address(0), "exists");
        p.owner = msg.sender;
        p.lastUpdate = block.timestamp;
        emit PositionCreated(msg.sender);
    }

    function configureAgent(uint256 dailyLimitUsd6, bool autoRepay, bool x402) external {
        AgentConfig storage cfg = agentConfigs[msg.sender];
        cfg.dailyBorrowLimitUsd6 = dailyLimitUsd6;
        cfg.autoRepayEnabled = autoRepay;
        cfg.x402Enabled = x402;
        cfg.periodStart = block.timestamp;
        cfg.dailyBorrowedUsd6 = 0;
    }

    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        positions[msg.sender].collaterals.push(CollateralDeposit(token, amount));
        emit Deposited(msg.sender, token, amount);
    }

    function borrow(address token, uint256 amount) external {
        // naive: no LTV checks (demo only)
        positions[msg.sender].borrows.push(BorrowedAmount(token, amount));
        IERC20(token).transfer(msg.sender, amount);
        emit Borrowed(msg.sender, token, amount);
    }

    function repay(address token, uint256 amount, uint256 amountUsd6) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        reputation.updateOnRepay(msg.sender, amountUsd6);
        emit Repaid(msg.sender, token, amount);
    }
}
