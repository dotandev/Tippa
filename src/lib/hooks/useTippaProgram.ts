import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN, web3 } from '@project-serum/anchor';
import { useCallback, useEffect, useState } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Tipping } from '@/lib/idl';
import tippaIdl from '@/lib/idl.json';
import { IDL } from '@project-serum/anchor/dist/cjs/native/system';

const TIPPA_PROGRAM_ID = new PublicKey('EvheWnLFuVnpQcHfRZHJUPkPUKLcy1oHTYGJSVz4Zj6C');

export function useTippaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { preflightCommitment: 'confirmed' }
      );
      
      const tippingProgram = new Program(tippaIdl, TIPPA_PROGRAM_ID, provider);
      setProgram(tippingProgram);
    } else {
      setProgram(null);
    }
  }, [connection, wallet.connected, wallet.publicKey]);

  const sendSolTip = useCallback(async (
    recipient: string,
    amount: number,
    memo: string,
    contentId?: string,
    userId?: string
  ) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const recipientPubkey = new PublicKey(recipient);
      const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      const contentIdPubkey = contentId ? new PublicKey(contentId) : null;
      const userIdPubkey = userId ? new PublicKey(userId) : null;
      
      await program.methods
        .sendSolTip(
          new BN(amountLamports),
          memo,
          contentIdPubkey,
          userIdPubkey
        )
        .accounts({
          tipper: wallet.publicKey,
          recipient: recipientPubkey,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("SOL tip sent successfully!");
      return true;
    } catch (err: any) {
      console.error("Error sending SOL tip:", err);
      setError(`Failed to send SOL tip: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const sendSplTip = useCallback(async (
    recipient: string,
    tokenMint: string,
    amount: number,
    memo: string,
    contentId?: string,
    userId?: string,
    eventId?: string
  ) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const recipientPubkey = new PublicKey(recipient);
      const tokenMintPubkey = new PublicKey(tokenMint);

      // Find associated token accounts
      const fromTokenAccount = await web3.PublicKey.findProgramAddress(
        [
          wallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintPubkey.toBuffer(),
        ],
        new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      );

      const toTokenAccount = await web3.PublicKey.findProgramAddress(
        [
          recipientPubkey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintPubkey.toBuffer(),
        ],
        new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      );
      
      const contentIdPubkey = contentId ? new PublicKey(contentId) : null;
      const userIdPubkey = userId ? new PublicKey(userId) : null;
      
      await program.methods
        .sendSplTip(
          new BN(amount),
          memo,
          contentIdPubkey,
          userIdPubkey,
          eventId || null
        )
        .accounts({
          tipper: wallet.publicKey,
          recipient: recipientPubkey,
          fromTokenAccount: fromTokenAccount[0],
          toTokenAccount: toTokenAccount[0],
          tokenMint: tokenMintPubkey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("SPL token tip sent successfully!");
      return true;
    } catch (err: any) {
      console.error("Error sending SPL tip:", err);
      setError(`Failed to send SPL tip: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const createCampaign = useCallback(async (
    title: string,
    description: string,
    goal: number,
    eventId: string,
    platform: string,
    endTimeDays: number
  ) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Calculate the end timestamp (convert days to timestamp)
      const endTimestamp = Math.floor(Date.now() / 1000) + (parseInt(endTimeDays.toString()) * 24 * 60 * 60);
      
      // Generate campaign PDA
      const [campaignPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign"),
          wallet.publicKey.toBuffer(),
          Buffer.from(eventId)
        ],
        TIPPA_PROGRAM_ID
      );
      
      // Generate campaign vault PDA
      const [campaignVaultPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign-vault"),
          campaignPDA.toBuffer()
        ],
        TIPPA_PROGRAM_ID
      );
      
      await program.methods
        .createCampaign(
          title,
          description,
          new BN(Math.floor(goal * LAMPORTS_PER_SOL)),
          eventId,
          platform,
          new BN(endTimestamp)
        )
        .accounts({
          creator: wallet.publicKey,
          campaign: campaignPDA,
          campaignVault: campaignVaultPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("Campaign created successfully!");
      return true;
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      setError(`Failed to create campaign: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const sendCampaignTip = useCallback(async (
    campaignPubkey: string,
    amount: number,
    memo: string
  ) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const campaignKey = new PublicKey(campaignPubkey);
      const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // Generate campaign vault PDA
      const [campaignVaultPDA] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign-vault"),
          campaignKey.toBuffer()
        ],
        TIPPA_PROGRAM_ID
      );
      
      await program.methods
        .sendCampaignTip(
          new BN(amountLamports),
          memo
        )
        .accounts({
          tipper: wallet.publicKey,
          campaign: campaignKey,
          campaignVault: campaignVaultPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("Campaign tip sent successfully!");
      return true;
    } catch (err: any) {
      console.error("Error sending campaign tip:", err);
      setError(`Failed to send campaign tip: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const claimCampaignFunds = useCallback(async (campaignPubkey: string) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const campaignKey = new PublicKey(campaignPubkey);
      
      // Generate campaign vault PDA
      const [campaignVaultPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign-vault"),
          campaignKey.toBuffer()
        ],
        TIPPA_PROGRAM_ID
      );
      
      await program.methods
        .claimCampaignFunds()
        .accounts({
          creator: wallet.publicKey,
          campaign: campaignKey,
          campaignVault: campaignVaultPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("Campaign funds claimed successfully!");
      return true;
    } catch (err: any) {
      console.error("Error claiming campaign funds:", err);
      setError(`Failed to claim campaign funds: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const registerUser = useCallback(async (tippaName: string, metadataUri: string) => {
    if (!program || !wallet.publicKey) {
      setError("Program not connected or wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Generate user profile PDA
      const [userProfilePDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("user"),
          Buffer.from(tippaName)
        ],
        TIPPA_PROGRAM_ID
      );
      
      await program.methods
        .registerUser(
          tippaName,
          metadataUri
        )
        .accounts({
          owner: wallet.publicKey,
          userProfile: userProfilePDA,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      setSuccess("User profile registered successfully!");
      return true;
    } catch (err: any) {
      console.error("Error registering user:", err);
      setError(`Failed to register user: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  const fetchCampaigns = useCallback(async () => {
    if (!program) {
      return [];
    }
    
    try {
      setLoading(true);
      // Get all program accounts
      const accounts = await connection.getProgramAccounts(TIPPA_PROGRAM_ID);
      
      // Filter and decode campaign accounts
      const campaignAccounts = await Promise.all(
        accounts
          .filter(({ account }) => account.data.length >= 200) // Rough filter for campaign accounts
          .map(async ({ pubkey, account }) => {
            try {
              const campaign = await program.account.campaign.fetch(pubkey);
              return { 
                pubkey, 
                ...campaign,
                // Convert BN to numbers for easier handling in UI
                goal: campaign.goal.toNumber() / LAMPORTS_PER_SOL,
                currentTotal: campaign.currentTotal.toNumber() / LAMPORTS_PER_SOL,
                startTime: campaign.startTime.toNumber(),
                endTime: campaign.endTime.toNumber()
              };
            } catch (e) {
              return null;
            }
          })
      );
      
      return campaignAccounts.filter(Boolean);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to fetch campaigns");
      return [];
    } finally {
      setLoading(false);
    }
  }, [connection, program]);

  return {
    program,
    loading,
    error,
    success,
    sendSolTip,
    sendSplTip,
    createCampaign,
    sendCampaignTip,
    claimCampaignFunds,
    registerUser,
    fetchCampaigns,
    setError,
    setSuccess
  };
}