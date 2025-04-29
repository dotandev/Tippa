// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SnoviIDL from '../target/idl/snovi.json'
import type { Snovi } from '../target/types/snovi'

// Re-export the generated IDL and type
export { Snovi, SnoviIDL }

// The programId is imported from the program IDL.
export const SNOVI_PROGRAM_ID = new PublicKey(SnoviIDL.address)

// This is a helper function to get the Snovi Anchor program.
export function getSnoviProgram(provider: AnchorProvider, address?: PublicKey): Program<Snovi> {
  return new Program({ ...SnoviIDL, address: address ? address.toBase58() : SnoviIDL.address } as Snovi, provider)
}

// This is a helper function to get the program ID for the Snovi program depending on the cluster.
export function getSnoviProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Snovi program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return SNOVI_PROGRAM_ID
  }
}
