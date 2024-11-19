// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EVoting is Ownable {
    using Strings for uint256;

    struct Candidate {
        uint256 id;
        string name;
        string position;
        string department;
        string year;
    }

    struct VotingInfo {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
    }

    VotingInfo public votingInfo;
    mapping(string => bool) public hasVoted;
    mapping(uint256 => uint256[]) private candidateVotes;
    string[] public voterEmails;
    Candidate[] public candidates;
    mapping(uint256 => bool) public validCandidateIds;

    event VoteCasted(uint256 uniqueNumber);
    event VotingStarted(uint256 startTime, uint256 endTime);
    event VotingEnded();
    event CandidateAdded(uint256 id, string name);

    constructor(
        uint256 durationInMinutes,
        uint256[] memory candidateIds,
        string[] memory names,
        string[] memory positions,
        string[] memory departments,
        string[] memory academicYears
    ) Ownable(msg.sender) {
        require(
            candidateIds.length == names.length &&
            names.length == positions.length &&
            positions.length == departments.length &&
            departments.length == academicYears.length,
            "Arrays length mismatch"
        );

        votingInfo.startTime = block.timestamp;
        votingInfo.endTime = block.timestamp + (durationInMinutes * 1 minutes);
        votingInfo.isActive = true;
        votingInfo.totalVotes = 0;

        for (uint i = 0; i < candidateIds.length; i++) {
            candidates.push(Candidate({
                id: candidateIds[i],
                name: names[i],
                position: positions[i],
                department: departments[i],
                year: academicYears[i]
            }));
            validCandidateIds[candidateIds[i]] = true;
            emit CandidateAdded(candidateIds[i], names[i]);
        }

        emit VotingStarted(votingInfo.startTime, votingInfo.endTime);
}

    function castVote(string calldata email, uint256 candidateId) external {
        require(votingInfo.isActive, "Voting is not active");
        require(block.timestamp <= votingInfo.endTime, "Voting period has ended");
        require(!hasVoted[email], "This email has already voted");
        require(validCandidateIds[candidateId], "Invalid candidate ID");
        
        uint256 uniqueNumber = generateUniqueNumber();
        hasVoted[email] = true;
        voterEmails.push(email);
        candidateVotes[candidateId].push(uniqueNumber);
        votingInfo.totalVotes++;
        
        emit VoteCasted(uniqueNumber);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function endVoting() external onlyOwner {
        require(votingInfo.isActive, "Voting is not active");
        votingInfo.isActive = false;
        emit VotingEnded();
    }

    function getCandidateVotes(uint256 candidateId) external view returns (uint256) {
        require(!votingInfo.isActive || block.timestamp > votingInfo.endTime, "Voting is still active");
        require(validCandidateIds[candidateId], "Invalid candidate ID");
        return candidateVotes[candidateId].length;
    }

    function getCandidateUniqueNumbers(uint256 candidateId) external view returns (uint256[] memory) {
        require(!votingInfo.isActive || block.timestamp > votingInfo.endTime, "Voting is still active");
        require(validCandidateIds[candidateId], "Invalid candidate ID");
        return candidateVotes[candidateId];
    }

    function getAllVoterEmails() external view returns (string[] memory) {
        return voterEmails;
    }

    function generateUniqueNumber() private view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            votingInfo.totalVotes
        ))) % 90000 + 10000;
        return randomNum;
    }

    function getRemainingTime() external view returns (uint256) {
        if (!votingInfo.isActive || block.timestamp >= votingInfo.endTime) {
            return 0;
        }
        return votingInfo.endTime - block.timestamp;
    }

    function isVotingActive() external view returns (bool) {
        return votingInfo.isActive && block.timestamp <= votingInfo.endTime;
    }
}