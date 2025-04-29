import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Snovi } from '../target/types/snovi'

describe('snovi', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Snovi as Program<Snovi>

  const snoviKeypair = Keypair.generate()

  it('Initialize Snovi', async () => {
    await program.methods
      .initialize()
      .accounts({
        snovi: snoviKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([snoviKeypair])
      .rpc()

    const currentSnovi = await program.account.snovi.fetch(snoviKeypair.publicKey)

    expect(currentSnovi.count).toEqual(0)
  })

  it('Increment Snovi', async () => {
    await program.methods.increment().accounts({ snovi: snoviKeypair.publicKey }).rpc()

    const currentSnovi = await program.account.snovi.fetch(snoviKeypair.publicKey)

    expect(currentSnovi.count).toEqual(1)
  })

  it('Increment Snovi Again', async () => {
    await program.methods.increment().accounts({ snovi: snoviKeypair.publicKey }).rpc()

    const currentSnovi = await program.account.snovi.fetch(snoviKeypair.publicKey)

    expect(currentSnovi.count).toEqual(2)
  })

  it('Decrement Snovi', async () => {
    await program.methods.decrement().accounts({ snovi: snoviKeypair.publicKey }).rpc()

    const currentSnovi = await program.account.snovi.fetch(snoviKeypair.publicKey)

    expect(currentSnovi.count).toEqual(1)
  })

  it('Set snovi value', async () => {
    await program.methods.set(42).accounts({ snovi: snoviKeypair.publicKey }).rpc()

    const currentSnovi = await program.account.snovi.fetch(snoviKeypair.publicKey)

    expect(currentSnovi.count).toEqual(42)
  })

  it('Set close the snovi account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        snovi: snoviKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.snovi.fetchNullable(snoviKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
