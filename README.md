# 📜 QuestWeaver

QuestWeaver is a **bounty-driven decentralized lore engine** built on the GenLayer Bradbury Testnet. It empowers communities to collaboratively build narrative universes (Realms) where every addition to the canon is strictly evaluated by an AI Quest Master (GenLayer LLM). 

If a writer submits Lore that fits the Realm's Laws, perfectly aligns with the Existing Canon, and fulfills a Quest, the GenLayer consensus automatically approves it and releases a GEN bounty directly to the author!

---

## 🌟 How it Works

1. **Create a Realm:** World builders ("Realm Lords") create a new universe and define strict narrative Laws (e.g., "Magic relies on crystals," "No spaceships").
2. **Post Quests:** Realm Lords post narrative Quests (e.g., "Write the origin of the Crystal King") and attach a bounty in GEN tokens using `@gl.public.write.payable`.
3. **Submit Lore:** Writers ("Weavers") submit their stories to fulfill the Quests.
4. **AI Consensus:** The GenLayer AI Quest Master evaluates the submission using `gl.eq_principle.strict_eq`. It reads the Laws, reads the Canon, and judges the submission. If it perfectly aligns, the Lore is added to the Canon and the GEN bounty is transferred.

## 🏗️ Architecture

- **Intelligent Contract (`contracts/quest_weaver.py`):** Uses GenLayer SDK `v0.1.0`. Features cross-referencing of on-chain state (Laws + Canon) via non-deterministic LLM prompts. Handles value transfers dynamically.
- **Frontend App (`web/`):** React/Vite dashboard using `genlayer-js` to seamlessly read realms and submit transactions using injected wallets.

