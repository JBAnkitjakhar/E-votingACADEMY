// src/app/api/voting/cast-vote/route.ts

import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '@/constants';
import { Log, LogDescription, Result } from 'ethers';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const ADMIN_PRIVATE_KEY = process.env.PRIVATE_KEY;

// Define a custom interface for the event args
interface VoteCastedEventArgs extends Result {
  voter: string;
  candidateId: bigint;
  uniqueNumber: bigint;
}

// Updated interface for the parsed event
interface VoteCastedEvent extends Omit<LogDescription, 'args'> {
  args: VoteCastedEventArgs;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Cast vote endpoint hit');

    const headersList = await headers();
    const contentType = headersList.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const body = await request.json();
    console.log('Request body:', { ...body, candidateId: body.candidateId?.toString() });

    const { email, candidateId } = body;

    if (!email || !candidateId) {
      return NextResponse.json(
        { error: 'Email and candidateId are required' },
        { status: 400 }
      );
    }

    if (!ADMIN_PRIVATE_KEY || !process.env.NEXT_PUBLIC_RPC_URL) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VOTING_CONTRACT_ABI,
      wallet
    );

    const isActive = await contract.isVotingActive();
    if (!isActive) {
      return NextResponse.json(
        { error: 'Voting is not active' },
        { status: 400 }
      );
    }

    const hasVoted = await contract.hasVoted(email);
    if (hasVoted) {
      return NextResponse.json(
        { error: 'This email has already voted' },
        { status: 400 }
      );
    }

    console.log('Casting vote...');
    const tx = await contract.castVote(email, BigInt(candidateId));
    console.log('Transaction hash:', tx.hash);

    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), 30000)
      ),
    ]);

    console.log('Transaction receipt:', receipt);

    const voteCastedEvent = receipt.logs
      .map((log: Log) => {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === 'VoteCasted') {
            // Create a properly typed event object
            const voteCastedEvent: VoteCastedEvent = {
              ...parsedLog,
              args: parsedLog.args as unknown as VoteCastedEventArgs
            };
            return voteCastedEvent;
          }
          return null;
        } catch (error) {
          console.error('Error parsing log:', error);
          return null;
        }
      })
      .find((event: VoteCastedEvent | null): event is VoteCastedEvent => 
        event !== null && event.name === 'VoteCasted'
      );

    if (!voteCastedEvent || !voteCastedEvent.args) {
      throw new Error('Vote was cast but no valid event was emitted');
    }

    const uniqueNumber = voteCastedEvent.args.uniqueNumber.toString();
    console.log('Unique number:', uniqueNumber);

    return NextResponse.json(
      { success: true, uniqueNumber },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Detailed error in cast-vote:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to cast vote',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}