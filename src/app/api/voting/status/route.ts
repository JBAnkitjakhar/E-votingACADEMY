// src/app/api/voting/status/route.ts

// src/app/api/voting/status/route.ts
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '@/constants';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      provider
    );

    const [remainingSeconds, isActive, votingInfo] = await Promise.all([
      contract.getRemainingTime(),
      contract.isVotingActive(),
      contract.votingInfo()
    ]);

    let remainingTime = '';
    if (Number(remainingSeconds) > 0) {
      const minutes = Math.floor(Number(remainingSeconds) / 60);
      const seconds = Number(remainingSeconds) % 60;
      remainingTime = `${minutes}m ${seconds}s`;
    }

    return NextResponse.json({
      isActive,
      remainingTime,
      startTime: Number(votingInfo.startTime),
      endTime: Number(votingInfo.endTime),
      totalVotes: Number(votingInfo.totalVotes)
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error fetching voting status' 
    }, { status: 500 });
  }
}