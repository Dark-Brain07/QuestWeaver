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

---

## 🚀 GenLayer Points Portal Submission Details

Below are the details ready to be submitted to the GenLayer Points Portal!

### 1. Full DApp Submission

**Category:** Projects & Milestones (20-4000 pts)

**Title:** QuestWeaver: AI-Evaluated Decentralized Lore Engine
**Description:**
QuestWeaver is a decentralized world-building engine on GenLayer. It allows communities to collaboratively build "Realms" by posting Quests with GEN token bounties. Writers submit Lore, and GenLayer's AI Equivalence Principle evaluates the submission against the Realm's Laws and existing Canon. If the LLM consensus approves the lore, it is automatically added to the canon and the bounty is transferred to the writer.

**Evidence & Supporting Information:**

**URL**
https://studio.genlayer.com/contracts?import-contract=0x29c38B2dd99c51A99d4fe85a5c8A7D42F2260578
**Type:** GenLayer Studio Contract

**URL**
https://github.com/Dark-Brain07/QuestWeaver
**Type:** GitHub Repository

*(Note: Add your Vercel Live Demo URL here if you have deployed the frontend!)*

---

### 2. Tools & Infrastructure (Individual Contract)

**Title:** QuestWeaver Lore Engine Oracle
**Description:**
A specialized Python Intelligent Contract utilizing GenLayer's non-deterministic LLM execution. It maintains dynamic state arrays of narrative canon and strictly evaluates new textual submissions against predefined on-chain rules (Realm Laws) using `gl.eq_principle.strict_eq` before executing native GEN value transfers.

- **Contract Address:** `0x29c38B2dd99c51A99d4fe85a5c8A7D42F2260578`
- **Explorer Link:** [View on GenLayer Studio](https://studio.genlayer.com/contracts?import-contract=0x29c38B2dd99c51A99d4fe85a5c8A7D42F2260578)
- **Source Code:** [quest_weaver.py](https://github.com/Dark-Brain07/QuestWeaver/blob/main/contracts/quest_weaver.py)
