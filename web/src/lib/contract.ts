import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT: string = "0x29c38B2dd99c51A99d4fe85a5c8A7D42F2260578";
export const CHAIN_ID = 4221;
export const RPC = "https://rpc-bradbury.genlayer.com";
export const EXPLORER = "https://explorer-bradbury.genlayer.com";

export type Realm = {
  id: string;
  name: string;
  laws: string;
  creator: string;
};

export type Quest = {
  id: string;
  realm_id: string;
  title: string;
  description: string;
  bounty: string;
  creator: string;
  status: string; // OPEN | FULFILLED
  winner_sub: string;
};

export type Submission = {
  id: string;
  quest_id: string;
  realm_id: string;
  content: string;
  author: string;
  status: string; // PENDING | EVALUATED | REJECTED
  verdict: string; // APPROVED | REJECTED
  reasoning: string;
};

const reader = createClient({ chain: testnetBradbury, account: createAccount() });
const read = (functionName: string, args: any[] = []) =>
  reader.readContract({ address: CONTRACT, functionName, args });

export const getStats = async () => JSON.parse(await read("get_stats") as string);
export const getRealm = async (id: string) => JSON.parse(await read("get_realm", [id]) as string);
export const getQuest = async (id: string) => JSON.parse(await read("get_quest", [id]) as string);
export const getSubmission = async (id: string) => JSON.parse(await read("get_submission", [id]) as string);
export const getCanon = async (realmId: string) => JSON.parse(await read("get_canon", [realmId]) as string);

import { createClient as _cc } from "genlayer-js";

export async function writeWith(provider: any, account: string, functionName: string, args: any[], value: bigint = 0n): Promise<string> {
  const client = _cc({ chain: testnetBradbury, account: account as any, provider } as any);
  const hash = await client.writeContract({ address: CONTRACT, functionName, args, value });
  
  try {
    await client.waitForTransactionReceipt({ hash, status: "ACCEPTED", interval: 5000, retries: 60 } as any);
  } catch { /* wait timeout */ }
  return hash as string;
}
