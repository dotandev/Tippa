import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Tipping } from '@/lib/idl';
import tippaIdl from '@/lib/idl.json';

const TIPPA_PROGRAM_ID = new PublicKey('EvheWnLFuVnpQcHfRZHJUPkPUKLcy1oHTYGJSVz4Zj6C');

export interface UserProfile {
  pubkey: PublicKey;
  owner: PublicKey;
  tippaName: string;
  metadataUri: string;
  creationTime: number;
}

export function useUserProfile() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { preflightCommitment: 'confirmed' }
      );
      
      const tippingProgram = new Program(tippaIdl, TIPPA_PROGRAM_ID, provider);
      setProgram(tippingProgram);
      fetchUserProfile();
    } else {
      setProgram(null);
      setUserProfile(null);
    }
  }, [connection, wallet.connected, wallet.publicKey]);

  const fetchUserProfile = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    
    try {
      setLoading(true);
      // Get all program accounts
      const accounts = await connection.getProgramAccounts(TIPPA_PROGRAM_ID);
      
      // Filter and decode user profile accounts owned by the current wallet
      const userAccounts = await Promise.all(
        accounts
          .filter(({ account }) => account.data.length >= 50 && account.data.length < 300) // Rough filter for user accounts
          .map(async ({ pubkey, account }) => {
            try {
              const userAccount = await program.account.userProfile.fetch(pubkey);
              if (userAccount.owner.toString() === wallet.publicKey?.toString()) {
                return {
                  pubkey,
                  owner: userAccount.owner,
                  tippaName: userAccount.tippaName,
                  metadataUri: userAccount.metadataUri,
                  creationTime: userAccount.creationTime.toNumber()
                };
              }
              return null;
            } catch (e) {
              return null;
            }
          })
      );
      
      const filteredUsers = userAccounts.filter(Boolean);
      if (filteredUsers.length > 0) {
        setUserProfile(filteredUsers[0] as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [connection, program, wallet.publicKey]);

  // Find user profile by Tippa name
  const findUserByName = useCallback(async (tippaName: string) => {
    if (!program) return null;
    
    try {

      const [userProfilePDA] = await PublicKey.findProgramAddressSync
      (
        [
          Buffer.from("user"),
          Buffer.from(tippaName)
        ],
        TIPPA_PROGRAM_ID
      );
      
      try {
        const userAccount = await program.account.userProfile.fetch(userProfilePDA);
        return {
          pubkey: userProfilePDA,
          owner: userAccount.owner,
          tippaName: userAccount.tippaName,
          metadataUri: userAccount.metadataUri,
          creationTime: userAccount.creationTime.toNumber()
        };
      } catch (e) {
        // User not found
        return null;
      }
    } catch (err) {
      console.error("Error finding user by name:", err);
      return null;
    }
  }, [program]);

  return {
    userProfile,
    loading,
    fetchUserProfile,
    findUserByName
  };
}