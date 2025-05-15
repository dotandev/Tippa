import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import { EventListener } from './event';

dotenv.config();

const connection = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
const programId = new PublicKey(process.env.PROGRAM_ID!);

const eventListener = new EventListener(connection, programId);

// === Example 1: UserRegisteredEvent ===
eventListener.registerEvent({
  name: 'UserRegisteredEvent',
  handler: (data, raw) => {
    console.log('👤 User Registered:', data);
  },
  deserialize: (buf) => {
    const usernameLen = buf.readUInt32LE(0);
    const username = buf.slice(4, 4 + usernameLen).toString('utf-8');

    const pubkeyOffset = 4 + usernameLen;
    const pubkey = buf.slice(pubkeyOffset, pubkeyOffset + 32).toString('hex');

    const timestamp = buf.readBigInt64LE(pubkeyOffset + 32);

    return {
      username,
      solanaAddress: pubkey,
      timestamp,
    };
  },
});

// === Example 2: GroupTippedEvent ===
eventListener.registerEvent({
  name: 'GroupTippedEvent',
  handler: (data) => {
    console.log('💸 Group Tip:', data);
  },
  deserialize: (buf) => {
    const count = buf.readUInt8(0);
    const amount = buf.readBigUInt64LE(1);
    return { count, amount };
  },
});

// 🚀 Start listener
eventListener.start();
