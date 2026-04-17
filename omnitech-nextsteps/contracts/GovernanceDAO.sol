// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollVerse Governance DAO
 * @dev Decentralized governance for ScrollVerse Trinity ecosystem
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceDAO is Ownable {
    
    IERC20 public londcToken;
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        FAILED,
        EXECUTED
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        bool executed;
    }
    
    struct Vote {
        address voter;
        uint256 proposalId;
        bool support;
        uint256 weight;
        uint256 timestamp;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote[]) public votes;
    mapping(address => uint256) public votingPower;
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public minimumProposalThreshold = 100000 ether; // 100K LONDC
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalPassed(uint256 indexed proposalId);
    event ProposalFailed(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(address _londcAddress) {
        londcToken = IERC20(_londcAddress);
    }
    
    /**
     * @dev Create a new governance proposal
     */
    function createProposal(
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(
            londcToken.balanceOf(msg.sender) >= minimumProposalThreshold,
            "Insufficient LONDC to propose"
        );
        
        uint256 proposalId = proposalCount++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            status: ProposalStatus.ACTIVE,
            executed: false
        });
        
        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        
        uint256 balance = londcToken.balanceOf(msg.sender);
        require(balance > 0, "No voting power");
        
        votes[proposalId].push(Vote({
            voter: msg.sender,
            proposalId: proposalId,
            support: support,
            weight: balance,
            timestamp: block.timestamp
        }));
        
        if (support) {
            proposal.votesFor += balance;
        } else {
            proposal.votesAgainst += balance;
        }
        
        emit VoteCast(proposalId, msg.sender, support, balance);
    }
    
    /**
     * @dev Finalize voting on a proposal
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Not active");
        require(block.timestamp > proposal.endTime, "Voting still active");
        
        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.PASSED;
            emit ProposalPassed(proposalId);
        } else {
            proposal.status = ProposalStatus.FAILED;
            emit ProposalFailed(proposalId);
        }
    }
    
    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PASSED, "Proposal not passed");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get all votes on a proposal
     */
    function getVotes(uint256 proposalId) external view returns (Vote[] memory) {
        return votes[proposalId];
    }
    
    /**
     * @dev Get voting results for a proposal
     */
    function getVotingResults(uint256 proposalId) external view returns (uint256, uint256) {
        Proposal memory proposal = proposals[proposalId];
        return (proposal.votesFor, proposal.votesAgainst);
    }
    
    /**
     * @dev Update voting period (only owner)
     */
    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        votingPeriod = newPeriod;
    }
    
    /**
     * @dev Update minimum proposal threshold (only owner)
     */
    function setMinimumProposalThreshold(uint256 newThreshold) external onlyOwner {
        minimumProposalThreshold = newThreshold;
    }
}
