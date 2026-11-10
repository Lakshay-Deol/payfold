// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayFoldEscrow
 * @dev Autonomous Hackathon Prize Escrow & Distribution Contract powered by NEAR Protocol
 * @author Lakshay Deol <lakshayld26@gmail.com>
 */
contract PayFoldEscrow {
    struct Winner {
        string email;
        uint256 amount;
        bool claimed;
        address recipient;
    }

    struct Hackathon {
        uint256 id;
        address organizer;
        uint256 totalFunds;
        uint256 distributedFunds;
        uint256 winnerCount;
        mapping(uint256 => Winner) winners;
    }

    address public owner;
    address public agentSigner; // NEAR Shade Agent MPC Signer address

    mapping(uint256 => Hackathon) public hackathons;

    event WinnerAnnounced(
        uint256 indexed hackathonId,
        uint256 indexed winnerId,
        string email,
        uint256 amount,
        address indexed organizer
    );

    event PrizeDistributed(
        uint256 indexed hackathonId,
        uint256 indexed winnerId,
        address indexed recipient,
        uint256 amount
    );

    event AgentSignerUpdated(address indexed previousSigner, address indexed newSigner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == agentSigner,
            "Caller is not authorized agent or owner"
        );
        _;
    }

    constructor(address _agentSigner) {
        owner = msg.sender;
        agentSigner = _agentSigner != address(0) ? _agentSigner : msg.sender;
    }

    function setAgentSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "Invalid agent address");
        emit AgentSignerUpdated(agentSigner, _newSigner);
        agentSigner = _newSigner;
    }

    /**
     * @notice Announce a winner and deposit the prize amount into escrow
     * @param hackathonId Unique ID of the hackathon
     * @param email Winner's email address
     * @param amount Prize amount in wei (must match msg.value)
     */
    function announceWinner(
        uint256 hackathonId,
        string calldata email,
        uint256 amount
    ) external payable {
        require(msg.value == amount, "Sent value must equal prize amount");
        require(amount > 0, "Prize amount must be greater than zero");

        Hackathon storage hackathon = hackathons[hackathonId];
        if (hackathon.organizer == address(0)) {
            hackathon.id = hackathonId;
            hackathon.organizer = msg.sender;
        }

        uint256 winnerId = hackathon.winnerCount;
        Winner storage winner = hackathon.winners[winnerId];
        winner.email = email;
        winner.amount = amount;
        winner.claimed = false;

        hackathon.winnerCount++;
        hackathon.totalFunds += amount;

        emit WinnerAnnounced(hackathonId, winnerId, email, amount, msg.sender);
    }

    /**
     * @notice Distribute funds to verified winner, called autonomously by NEAR Shade Agent MPC
     * @param hackathonId Hackathon ID
     * @param winnerId Winner index
     * @param recipient Winner's verified payout wallet
     */
    function distributeFund(
        uint256 hackathonId,
        uint256 winnerId,
        address payable recipient
    ) external onlyAuthorized {
        require(recipient != address(0), "Invalid recipient address");

        Hackathon storage hackathon = hackathons[hackathonId];
        require(winnerId < hackathon.winnerCount, "Winner does not exist");

        Winner storage winner = hackathon.winners[winnerId];
        require(!winner.claimed, "Prize already claimed");
        require(address(this).balance >= winner.amount, "Insufficient escrow balance");

        winner.claimed = true;
        winner.recipient = recipient;
        hackathon.distributedFunds += winner.amount;

        (bool success, ) = recipient.call{value: winner.amount}("");
        require(success, "Transfer to recipient failed");

        emit PrizeDistributed(hackathonId, winnerId, recipient, winner.amount);
    }

    function getWinner(uint256 hackathonId, uint256 winnerId)
        external
        view
        returns (
            string memory email,
            uint256 amount,
            bool claimed,
            address recipient
        )
    {
        Winner storage winner = hackathons[hackathonId].winners[winnerId];
        return (winner.email, winner.amount, winner.claimed, winner.recipient);
    }

    function getEscrowBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
