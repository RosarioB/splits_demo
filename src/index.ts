import { SplitsClient } from '@0xsplits/splits-sdk'
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import "dotenv/config";

const CHAIN = baseSepolia;

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in .env file");
}
if (!process.env.RPC_URL) {
  throw new Error("RPC_URL is not set in .env file");
}

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

console.log("Account address:", account.address);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account: account,
  chain: CHAIN,
  transport: http(process.env.RPC_URL),
});

const splitsClient = new SplitsClient({
  chainId: CHAIN.id,
  publicClient,
  walletClient,
  includeEnsNames: false,
}).splitV1

const args = {
  recipients: [
    {
      address: '0x01BF49D75f2b73A2FDEFa7664AEF22C86c5Be3df',
      percentAllocation: 50.0,
    },
    {
      address: account.address,
      percentAllocation: 50.0,
    },
  ],
  distributorFeePercent: 1.0,
  controller: account.address,
}

const response = await splitsClient.createSplit(args);
console.log("Response:", response);