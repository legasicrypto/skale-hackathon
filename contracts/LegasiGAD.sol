// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LegasiGAD {
    struct GadConfig {
        uint16 startThresholdBps; // e.g. 8000
        uint16 stepBps; // e.g. 200 (2%)
        uint256 minInterval; // seconds
        uint256 lastCrank;
        bool enabled;
    }

    mapping(address => GadConfig) public gadConfigs;

    event GadConfigured(address indexed user, uint16 startThresholdBps, uint16 stepBps, uint256 minInterval, bool enabled);
    event GadCranked(address indexed user, uint256 timestamp);

    function configureGad(uint16 startThresholdBps, uint16 stepBps, uint256 minInterval, bool enabled) external {
        gadConfigs[msg.sender] = GadConfig(startThresholdBps, stepBps, minInterval, 0, enabled);
        emit GadConfigured(msg.sender, startThresholdBps, stepBps, minInterval, enabled);
    }

    function crank() external {
        GadConfig storage cfg = gadConfigs[msg.sender];
        require(cfg.enabled, "disabled");
        require(block.timestamp >= cfg.lastCrank + cfg.minInterval, "cooldown");
        cfg.lastCrank = block.timestamp;
        emit GadCranked(msg.sender, block.timestamp);
    }
}
