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

  const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user"), tipper.publicKey.toBuffer()],
    program.programId
  );

  it("registers a user ✅", async () => {
    const username = "tippa_god";
    const metadataUri = "https://example.com/meta.json";

    const tx = await program.methods
      .registerUser(username, metadataUri)
      .accounts({
        owner: tipper.publicKey,
        userProfile: profilePda,
      })
      .rpc();

    const profile = await program.account.userProfile.fetch(profilePda);
    assert.equal(profile.tippaName, username);
    assert.equal(profile.owner.toBase58(), tipper.publicKey.toBase58());

    console.log("✅ User registered with tx:", tx);
    console.log("Profile:", profile);
  });

  it("sends a SOL tip ✅", async () => {
    const tipAmount = new anchor.BN(1_000_000); // 0.001 SOL
    const memo = "Here's a tip!";

    const recipientBefore = await provider.connection.getBalance(recipient.publicKey);

    const tx = await program.methods
      .sendSolTip(tipAmount, memo, null, null)
      .accounts({
        tipper: tipper.publicKey,
        recipient: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([]) // no signers since tipper is the wallet
      .rpc();

    const recipientAfter = await provider.connection.getBalance(recipient.publicKey);

    console.log("✅ SOL Tip sent with tx:", tx);
    console.log("Recipient balance before:", recipientBefore);
    console.log("Recipient balance after:", recipientAfter);

    assert.isAbove(recipientAfter, recipientBefore, "Recipient should receive SOL tip");
  });
});
