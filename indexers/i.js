const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const bs58 = require('bs58');
const { Buffer } = require('buffer');

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Replace with your program ID
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsaF1yMQoWqQk7iQ5dP5cAWo1G2PvTr2d');

// This is the event discriminator (first 8 bytes) of your event name hash
const getEventDiscriminator = (eventName) => {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(`event:${eventName}`).digest();
    return hash.slice(0, 8);
};

const USER_REGISTERED_DISCRIMINATOR = getEventDiscriminator('UserRegisteredEvent');

const listenForEvents = async () => {
    connection.onLogs(PROGRAM_ID, async (logInfo, ctx) => {
        const { logs } = logInfo;

        for (const log of logs) {
            if (log.startsWith('Program data:')) {
                try {
                    const b64Data = log.split('Program data: ')[1];
                    const buffer = Buffer.from(b64Data, 'base64');

                    // Match the discriminator
                    const discriminator = buffer.slice(0, 8);
                    if (!discriminator.equals(USER_REGISTERED_DISCRIMINATOR)) return;

                    // Deserialize fields (based on order)
                    const usernameLen = buffer.readUInt32LE(8);
                    const username = buffer.slice(12, 12 + usernameLen).toString('utf8');

                    const pubkeyOffset = 12 + usernameLen;
                    const pubkeyBytes = buffer.slice(pubkeyOffset, pubkeyOffset + 32);
                    const solanaAddress = new PublicKey(pubkeyBytes).toBase58();

                    const timestampOffset = pubkeyOffset + 32;
                    const timestamp = buffer.readBigInt64LE(timestampOffset);

                    console.log('🎉 New Tippa User Registered!');
                    console.log({ username, solanaAddress, timestamp: timestamp.toString() });

                    // You can now write this info into MongoDB
                } catch (e) {
                    console.error('Error parsing event log:', e);
                }
            }
        }
    }, 'confirmed');
};

listenForEvents();
