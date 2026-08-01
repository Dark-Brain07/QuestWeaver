import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const CONTRACT = "0x368afD1D00AcA38C9429D91C6552550FAE99FF67";

async function main() {
    const account = createAccount();
    console.log("Using account:", account.address);
    const client = createClient({ chain: testnetBradbury, account });
    
    try {
        console.log("Creating Realm...");
        // @ts-ignore
        const hash1 = await client.writeContract({
            address: CONTRACT as any,
            functionName: "create_realm",
            args: ["Test Realm Node", "Be extremely cool"],
            value: 0n
        });
        console.log("Realm TX:", hash1);
        
        console.log("Waiting for receipt...");
        // @ts-ignore
        await client.waitForTransactionReceipt({ hash: hash1, status: "ACCEPTED", interval: 2000, retries: 10 });
        console.log("Realm created!");
    } catch (e) {
        console.error("Failed:", e);
    }
}
main();
