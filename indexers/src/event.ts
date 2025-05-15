import { Connection, PublicKey, LogsCallback } from '@solana/web3.js';
import { Buffer } from 'buffer';
import crypto from 'crypto';

type EventHandler<T> = (data: T, rawLog: string) => void;

interface EventDefinition<T> {
  name: string;
  handler: EventHandler<T>;
  deserialize: (buffer: Buffer) => T;
}

export class EventListener {
  private connection: Connection;
  private programId: PublicKey;
  private events: Map<string, EventDefinition<any>> = new Map();

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  private getDiscriminator(eventName: string): string {
    const hash = crypto.createHash('sha256').update(`event:${eventName}`).digest();
    return hash.slice(0, 8).toString('hex');
  }

  public registerEvent<T>(event: EventDefinition<T>) {
    const key = this.getDiscriminator(event.name);
    this.events.set(key, event);
  }

  public async start() {
    console.log(`🔍 Listening for events from ${this.programId.toBase58()}...`);
    this.connection.onLogs(this.programId, this.handleLogs.bind(this), 'confirmed');
  }

  private handleLogs(logInfo: Parameters<LogsCallback>[0]) {
    const { logs } = logInfo;

    for (const log of logs) {
      if (!log.startsWith('Program data:')) continue;

      try {
        const b64 = log.slice('Program data: '.length);
        const buffer = Buffer.from(b64, 'base64');
        const discriminator = buffer.slice(0, 8).toString('hex');

        const event = this.events.get(discriminator);
        if (!event) return;

        const parsedData = event.deserialize(buffer.slice(8));
        event.handler(parsedData, log);
      } catch (err) {
        console.error('❌ Error parsing event log:', err);
      }
    }
  }
}
