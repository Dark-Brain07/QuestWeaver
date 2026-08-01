import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT = "0xEeDb0B417B3134bAEAb50374c0E582E85a5ef693";

async function main() {
    const account = createAccount();
    console.log("Using account:", account.address);
    const client = createClient({ chain: studionet, account });
    
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
