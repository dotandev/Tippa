import {
    Connection,
    PublicKey,
    clusterApiUrl,
  } from '@solana/web3.js';
  import dotenv from 'dotenv';
  import { Buffer } from 'buffer';
import { getEventDiscriminator } from './util';
  
  
  const connection = new Connection(process.env.RPC_URL || clusterApiUrl('devnet'), 'confirmed');
  const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID!);
  const USER_REGISTERED_DISCRIMINATOR = getEventDiscriminator('UserRegisteredEvent');
  
  interface UserRegisteredEvent {
    username: string;
    solanaAddress: string;
    timestamp: bigint;
  }
  
  const listenForUserRegisteredEvents = async () => {
    console.log(`Listening to Tippa program @ ${PROGRAM_ID.toBase58()}`);
    connection.onLogs(PROGRAM_ID, async (logInfo) => {
      const { logs } = logInfo;
  
      for (const log of logs) {
        if (!log.startsWith('Program data:')) continue;
  
        try {
          const b64 = log.slice('Program data: '.length);
          const buffer = Buffer.from(b64, 'base64');
  
          const discriminator = buffer.slice(0, 8);
          if (!discriminator.equals(USER_REGISTERED_DISCRIMINATOR)) return;
  
          // === Deserialize the buffer ===
          const usernameLen = buffer.readUInt32LE(8);
          const username = buffer.slice(12, 12 + usernameLen).toString('utf-8');
  
          const pubkeyOffset = 12 + usernameLen;
          const pubkeyBytes = buffer.slice(pubkeyOffset, pubkeyOffset + 32);
          const solanaAddress = new PublicKey(pubkeyBytes).toBase58();
  
          const timestampOffset = pubkeyOffset + 32;
          const timestamp = buffer.readBigInt64LE(timestampOffset);
  
          const userEvent: UserRegisteredEvent = {
            username,
            solanaAddress,
            timestamp,
          };
  
          console.log('🟢 New Tippa Registration:', userEvent);
  
          // TODO: store in MongoDB here or emit to another system
  
        } catch (err) {
          console.error('❌ Failed to parse event:', err);
        }
      }
    }, 'confirmed');
  };
  
  listenForUserRegisteredEvents().catch(console.error);
  