import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { avalanche, type Chain } from 'viem/chains';

export interface ClientConfig {
  privateKey: string;
  rpcUrl: string;
  chain?: Chain;
}

export interface Clients {
  account: PrivateKeyAccount;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export function createClients(config: ClientConfig): Clients {
  if (!config.privateKey) {
    throw new Error('PRIVATE_KEY is required');
  }

  if (!config.rpcUrl) {
    throw new Error('RPC_URL is required');
  }

  const chain = config.chain || avalanche;
  const privateKey = config.privateKey.startsWith('0x') 
    ? config.privateKey 
    : `0x${config.privateKey}`;
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });

  return {
    account,
    publicClient,
    walletClient,
  };
}
