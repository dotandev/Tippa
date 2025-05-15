import crypto from 'crypto';

export const getEventDiscriminator = (eventName: string): Buffer => {
  const hash = crypto.createHash('sha256').update(`event:${eventName}`).digest();
  return hash.slice(0, 8);
};
