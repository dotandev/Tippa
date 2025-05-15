import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Tipping } from "../target/types/tipping";
import { assert } from "chai";

describe("tipping", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Tipping as Program<Tipping>;

  const tipper = provider.wallet;
  const recipient = anchor.web3.Keypair.generate();

  it("sends a SOL tip", async () => {
    const tx = await program.methods
      .sendSolTip(
        new anchor.BN(1_000_000), // 0.001 SOL
        "Here's a tip!",
        null,
        null
      )
      .accounts({
        tipper: tipper.publicKey,
        recipient: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("SOL Tip transaction signature", tx);
  });

  it("registers a user", async () => {
    const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), tipper.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerUser("tippa_god", "https://example.com/meta.json")
      .accounts({
        owner: tipper.publicKey,
        userProfile: profilePda,
      })
      .rpc();

    const profile = await program.account.userProfile.fetch(profilePda);
    assert.equal(profile.tippaName, "tippa_god");
  });
});
