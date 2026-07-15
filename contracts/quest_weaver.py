# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

"""
QuestWeaver: A bounty-driven decentralized lore engine.

World builders (Realm Lords) create Realms, define Laws, and post Quests with a GEN bounty.
Writers (Weavers) submit Lore to fulfill Quests.
The GenLayer AI Quest Master evaluates the Lore against the Realm's Laws and existing Canon.
If the Lore is highly original, fits the Laws, and fulfills the Quest, it is APPROVED.
The Lore enters the Canon and the smart contract automatically releases the GEN bounty to the writer!
"""

class QuestWeaver(gl.Contract):
    realms: TreeMap[str, str]       # realm_id -> JSON string
    quests: TreeMap[str, str]       # quest_id -> JSON string
    submissions: TreeMap[str, str]  # sub_id -> JSON string
    canon: TreeMap[str, str]        # realm_id -> list of accepted lore IDs
    
    realm_count: u256
    quest_count: u256
    sub_count: u256

    def __init__(self):
        self.realm_count = u256(0)
        self.quest_count = u256(0)
        self.sub_count = u256(0)

    @gl.public.write
    def create_realm(self, name: str, laws: str) -> str:
        self.realm_count += u256(1)
        r_id = f"R{self.realm_count}"
        
        realm = {
            "id": r_id,
            "name": name.strip(),
            "laws": laws.strip(),
            "creator": gl.message.sender_address.as_hex
        }
        self.realms[r_id] = json.dumps(realm)
        self.canon[r_id] = json.dumps([])
        return r_id

    @gl.public.write.payable
    def post_quest(self, realm_id: str, title: str, description: str) -> str:
        if realm_id not in self.realms:
            raise gl.vm.UserError("Realm not found")
            
        bounty = int(gl.message.value)
        if bounty <= 0:
            raise gl.vm.UserError("Must escrow GEN for the quest bounty")
            
        self.quest_count += u256(1)
        q_id = f"Q{self.quest_count}"
        
        quest = {
            "id": q_id,
            "realm_id": realm_id,
            "title": title.strip(),
            "description": description.strip(),
            "bounty": str(bounty),
            "creator": gl.message.sender_address.as_hex,
            "status": "OPEN",
            "winner_sub": ""
        }
        self.quests[q_id] = json.dumps(quest)
        return q_id

    @gl.public.write
    def submit_lore(self, quest_id: str, content: str) -> str:
        if quest_id not in self.quests:
            raise gl.vm.UserError("Quest not found")
            
        quest = json.loads(self.quests[quest_id])
        if quest["status"] != "OPEN":
            raise gl.vm.UserError("Quest is not open")
            
        self.sub_count += u256(1)
        s_id = f"S{self.sub_count}"
        
        sub = {
            "id": s_id,
            "quest_id": quest_id,
            "realm_id": quest["realm_id"],
            "content": content.strip(),
            "author": gl.message.sender_address.as_hex,
            "status": "PENDING",
            "verdict": "",
            "reasoning": ""
        }
        self.submissions[s_id] = json.dumps(sub)
        return s_id

    @gl.public.write
    def evaluate_submission(self, sub_id: str) -> str:
        if sub_id not in self.submissions:
            raise gl.vm.UserError("Submission not found")
            
        sub = json.loads(self.submissions[sub_id])
        if sub["status"] != "PENDING":
            raise gl.vm.UserError("Submission already evaluated")
            
        quest = json.loads(self.quests[sub["quest_id"]])
        if quest["status"] != "OPEN":
            sub["status"] = "REJECTED"
            sub["reasoning"] = "Quest was fulfilled by another submission."
            self.submissions[sub_id] = json.dumps(sub)
            return "REJECTED"

        realm = json.loads(self.realms[sub["realm_id"]])
        canon_ids = json.loads(self.canon[sub["realm_id"]])
        
        # Build Canon context
        canon_texts = []
        for c_id in canon_ids:
            c_sub = json.loads(self.submissions[c_id])
            canon_texts.append(c_sub["content"])
            
        canon_str = "\n---\n".join(canon_texts) if canon_texts else "(No existing canon)"

        prompt = f"""
        You are the AI Quest Master for a collaborative world-building engine.
        Your task is to evaluate a Writer's LORE SUBMISSION to see if it perfectly fulfills a QUEST, obeys the REALM LAWS, and fits consistently with the EXISTING CANON.
        
        REALM LAWS:
        {realm['laws']}
        
        EXISTING CANON:
        {canon_str}
        
        QUEST DESCRIPTION:
        {quest['title']} - {quest['description']}
        
        LORE SUBMISSION:
        {sub['content']}
        
        Evaluate strictly:
        1. Does it fulfill the Quest?
        2. Does it violate any Realm Laws?
        3. Does it contradict the Existing Canon?
        4. Is it a high-quality, creative contribution?
        
        If yes to all, output exactly: APPROVED
        Otherwise, output exactly: REJECTED
        """

        def leader_fn() -> dict:
            raw = gl.nondet.exec_prompt(prompt)
            clean = raw.strip().upper()
            if "APPROVED" in clean:
                return {"verdict": "APPROVED"}
            return {"verdict": "REJECTED"}

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            my_result = leader_fn()
            return my_result["verdict"] == leader_result.calldata["verdict"]

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        verdict = result["verdict"]
        
        sub["status"] = "EVALUATED"
        sub["verdict"] = verdict
        
        if verdict == "APPROVED":
            sub["reasoning"] = "Quest Master consensus reached: Submission perfectly fulfills the quest and obeys realm laws."
            # Update Quest
            quest["status"] = "FULFILLED"
            quest["winner_sub"] = sub_id
            self.quests[quest["id"]] = json.dumps(quest)
            
            # Update Canon
            canon_ids.append(sub_id)
            self.canon[sub["realm_id"]] = json.dumps(canon_ids)
            
            # Transfer Bounty to Author
            bounty = int(quest["bounty"])
            if bounty > 0:
                gl.get_contract_at(Address(sub["author"])).transfer(value=u256(bounty))
                
        else:
            sub["reasoning"] = "Quest Master consensus reached: Submission was rejected for violating laws, contradicting canon, or failing the quest."

        self.submissions[sub_id] = json.dumps(sub)
        return verdict

    @gl.public.view
    def get_realm(self, realm_id: str) -> str:
        return self.realms.get(realm_id, "")
        
    @gl.public.view
    def get_quest(self, quest_id: str) -> str:
        return self.quests.get(quest_id, "")
        
    @gl.public.view
    def get_submission(self, sub_id: str) -> str:
        return self.submissions.get(sub_id, "")

    @gl.public.view
    def get_canon(self, realm_id: str) -> str:
        return self.canon.get(realm_id, "")

    @gl.public.view
    def get_stats(self) -> str:
        return json.dumps({
            "realms": str(self.realm_count),
            "quests": str(self.quest_count),
            "submissions": str(self.sub_count)
        })
