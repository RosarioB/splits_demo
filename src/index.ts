import { SplitsClient } from '@0xsplits/splits-sdk'
import { createPublicClient, createWalletClient, formatEther, http, zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import "dotenv/config";

const requiredEnvVars = ['PRIVATE_KEY', 'RPC_URL', 'SPLITS_API_KEY'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
      throw new Error(`${envVar} is not set`);
  }
});

const CHAIN = baseSepolia;
const SPLIT_ADDRESS = '0xF2Abb62eE4A2A658a5b01217fa39E61E889a5a47';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
console.log("My account is:", account.address);

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
  apiConfig: {
    apiKey: process.env.SPLITS_API_KEY,
  },
}).splitV1

async function createSplitContract() {
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
  return response;
}

async function getSplitBalance() {
  const args = {
    splitAddress: SPLIT_ADDRESS,
    token: zeroAddress, //ETH
  }

  const response = await splitsClient.getSplitBalance(args);
  const balance = response.balance;
  const formattedBalance = formatEther(balance);
  console.log(`The balance of the address ${SPLIT_ADDRESS} is ${formattedBalance} Ether`);
}

// Must be called before withdrawFunds
async function distributeToken(receiver: string) {
  const args = {
    splitAddress: SPLIT_ADDRESS,
    token: zeroAddress, //ETH
    distributorAddress: receiver,
  }

  const response = await splitsClient.distributeToken(args)
  console.log("Response:", response);
}

// Must be called after distributeToken
async function withdrawFunds(receiver: string) {
  const args = {
    address: receiver,
    tokens: [
      zeroAddress, //ETH
    ],
  }
   
  const response = await splitsClient.withdrawFunds(args)
  console.log("Response:", response);
}


async function distributeAndWithdrawForAll() {
  const args = {
    splitAddress: SPLIT_ADDRESS,
    tokens: [
      zeroAddress, //ETH
    ],
    distributorAddress: account.address,
  }
  const response = await splitsClient.batchDistributeAndWithdrawForAll(args)
  console.log("Response:", response);
  return response;
}

async function getAccountBalance(address: string) {
  const balance = await publicClient.getBalance({ 
    address: address as `0x${string}`,
  });
  const formattedBalance = formatEther(balance);
  console.log(`The balance of the account ${address} is ${formattedBalance} Ether`);
}

async function main() {
  //await createSplitContract();
  await getSplitBalance();
  //await getAccountBalance('0x01BF49D75f2b73A2FDEFa7664AEF22C86c5Be3df');
  //await distributeToken('0x01BF49D75f2b73A2FDEFa7664AEF22C86c5Be3df');
  //await withdrawFunds('0x01BF49D75f2b73A2FDEFa7664AEF22C86c5Be3df');
  //await distributeAndWithdrawForAll();
  //await getAccountBalance(account.address);
  await getAccountBalance('0x01BF49D75f2b73A2FDEFa7664AEF22C86c5Be3df');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});