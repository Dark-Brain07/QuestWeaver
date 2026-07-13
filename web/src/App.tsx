import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONTRACT, CHAIN_ID, getStats, getRealm, getQuest, getSubmission, writeWith, type Realm, type Quest, type Submission } from "./lib/contract";
import { Sparkles, ScrollText, Sword, CheckCircle, XCircle } from "lucide-react";

const L = "font-display text-[12px] uppercase tracking-widest text-doodle-dark";
const short = (a: string) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");

export default function App() {
  const { authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const acct = wallet?.address || "";
  
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ realms: 0, quests: 0, submissions: 0 });
  const [realms, setRealms] = useState<Realm[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [realmForm, setRealmForm] = useState({ name: "", laws: "" });
  const [questForm, setQuestForm] = useState({ realm_id: "", title: "", description: "", bounty: "" });
  const [loreForm, setLoreForm] = useState({ quest_id: "", content: "" });

  const refresh = async () => {
    try {
      if (CONTRACT === "0x0") return;
      const s = await getStats();
      setStats({ realms: Number(s.realms), quests: Number(s.quests), submissions: Number(s.submissions) });
      
      const rs = [];
      for (let i = 1; i <= Number(s.realms); i++) {
        const r = await getRealm(`R${i}`);
        if (r && r.id) rs.push(r);
      }
      setRealms(rs);
      
      const qs = [];
      for (let i = 1; i <= Number(s.quests); i++) {
        const q = await getQuest(`Q${i}`);
        if (q && q.id) qs.push(q);
      }
      setQuests(qs);
      
      const subs = [];
      for (let i = 1; i <= Number(s.submissions); i++) {
        const sub = await getSubmission(`S${i}`);
        if (sub && sub.id) subs.push(sub);
      }
      setSubmissions(subs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { refresh(); setInterval(refresh, 15000); }, []);

  async function tx(fn: string, args: any[], value: bigint = 0n) {
    if (!wallet) { await login(); return; }
    setBusy(true);
    try {
      await wallet.switchChain(CHAIN_ID);
      const provider = await wallet.getEthereumProvider();
      await writeWith(provider, wallet.address, fn, args, value);
      await refresh();
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  const createRealm = () => tx("create_realm", [realmForm.name, realmForm.laws]);
  const postQuest = () => tx("post_quest", [questForm.realm_id, questForm.title, questForm.description], BigInt(Number(questForm.bounty) * 1e18));
  const submitLore = () => tx("submit_lore", [loreForm.quest_id, loreForm.content]);
  const evaluate = (id: string) => tx("evaluate_submission", [id]);

  return (
    <div className="min-h-screen text-doodle-dark font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-doodle-bg/80 backdrop-blur-xl border-b-4 border-doodle-dark">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-doodle-pink border-4 border-doodle-dark rounded-xl flex items-center justify-center shadow-brutal -rotate-3">
              <Sparkles className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="font-display text-3xl font-black text-doodle-dark uppercase tracking-tight">QuestWeaver</span>
          </div>
          <div>
            {authenticated ? (
              <button onClick={() => logout()} className="px-6 py-3 rounded-2xl font-display text-sm uppercase tracking-widest bg-white text-doodle-dark brutal-button">
                {short(acct)} (Logout)
              </button>
            ) : (
              <button onClick={login} className="px-6 py-3 rounded-2xl font-display text-sm uppercase tracking-widest bg-doodle-blue text-doodle-dark brutal-button">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {CONTRACT === "0x0" && (
        <div className="bg-doodle-pink border-b-4 border-doodle-dark text-doodle-dark font-bold p-4 text-center font-display text-sm">
          ⚠️ Smart contract not yet deployed. Update CONTRACT in src/lib/contract.ts
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-24">
        
        {/* Hero */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="font-display text-6xl md:text-8xl font-black mb-8 leading-[1.1] text-doodle-dark">
            Weave the <br/>
            <span className="inline-block bg-doodle-yellow px-4 border-4 border-doodle-dark rounded-3xl shadow-brutal rotate-2 mt-4 text-doodle-dark">Mythos</span>
          </h1>
          <p className="font-sans text-xl font-bold leading-relaxed mb-12 max-w-2xl mx-auto">
            A playful, bounty-driven lore engine. Create Realms, post Quests with GEN bounties, and let the GenLayer AI Quest Master automatically evaluate submissions!
          </p>
          <div className="flex justify-center gap-6">
            <div className="brutal-card bg-doodle-pink px-8 py-6"><div className="font-display text-xs uppercase tracking-widest mb-2 font-bold">Realms</div><div className="font-display text-4xl">{stats.realms}</div></div>
            <div className="brutal-card bg-doodle-blue px-8 py-6"><div className="font-display text-xs uppercase tracking-widest mb-2 font-bold">Quests</div><div className="font-display text-4xl">{stats.quests}</div></div>
            <div className="brutal-card bg-doodle-mint px-8 py-6"><div className="font-display text-xs uppercase tracking-widest mb-2 font-bold">Submissions</div><div className="font-display text-4xl">{stats.submissions}</div></div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Action: Create Realm */}
          <div className="brutal-card bg-doodle-purple p-8">
            <div className={`${L} mb-6 flex items-center gap-3 font-black bg-white inline-flex px-4 py-2 border-4 border-doodle-dark rounded-xl shadow-[2px_2px_0px_rgba(26,26,26,1)] -rotate-2`}><ScrollText className="w-5 h-5"/> Forge Realm</div>
            <input value={realmForm.name} onChange={e=>setRealmForm({...realmForm, name: e.target.value})} placeholder="Realm Name..." className="brutal-input mb-4" />
            <textarea value={realmForm.laws} onChange={e=>setRealmForm({...realmForm, laws: e.target.value})} placeholder="Fundamental Laws..." className="brutal-input mb-4 h-32 resize-none" />
            <button onClick={createRealm} disabled={busy} className="w-full py-4 bg-white text-doodle-dark brutal-button disabled:opacity-50">Create</button>
          </div>

          {/* Action: Post Quest */}
          <div className="brutal-card bg-doodle-yellow p-8">
            <div className={`${L} mb-6 flex items-center gap-3 font-black bg-white inline-flex px-4 py-2 border-4 border-doodle-dark rounded-xl shadow-[2px_2px_0px_rgba(26,26,26,1)] rotate-2`}><Sword className="w-5 h-5"/> Post Quest</div>
            <select value={questForm.realm_id} onChange={e=>setQuestForm({...questForm, realm_id: e.target.value})} className="brutal-input mb-4">
              <option value="">Select Realm...</option>
              {realms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
            </select>
            <input value={questForm.title} onChange={e=>setQuestForm({...questForm, title: e.target.value})} placeholder="Quest Title" className="brutal-input mb-4" />
            <textarea value={questForm.description} onChange={e=>setQuestForm({...questForm, description: e.target.value})} placeholder="Describe what lore you need..." className="brutal-input mb-4 h-20 resize-none" />
            <input type="number" value={questForm.bounty} onChange={e=>setQuestForm({...questForm, bounty: e.target.value})} placeholder="Bounty (GEN)" className="brutal-input mb-4" />
            <button onClick={postQuest} disabled={busy} className="w-full py-4 bg-white text-doodle-dark brutal-button disabled:opacity-50">Post Quest</button>
          </div>

          {/* Action: Submit Lore */}
          <div className="brutal-card bg-doodle-mint p-8">
            <div className={`${L} mb-6 flex items-center gap-3 font-black bg-white inline-flex px-4 py-2 border-4 border-doodle-dark rounded-xl shadow-[2px_2px_0px_rgba(26,26,26,1)] -rotate-1`}><Sparkles className="w-5 h-5"/> Submit Lore</div>
            <select value={loreForm.quest_id} onChange={e=>setLoreForm({...loreForm, quest_id: e.target.value})} className="brutal-input mb-4">
              <option value="">Select Open Quest...</option>
              {quests.filter(q => q.status === "OPEN").map(q => <option key={q.id} value={q.id}>{q.title} ({q.bounty} GEN)</option>)}
            </select>
            <textarea value={loreForm.content} onChange={e=>setLoreForm({...loreForm, content: e.target.value})} placeholder="Write your lore here..." className="brutal-input mb-4 h-44 resize-none" />
            <button onClick={submitLore} disabled={busy} className="w-full py-4 bg-white text-doodle-dark brutal-button disabled:opacity-50">Submit</button>
          </div>
        </div>

        {/* Boards */}
        <section className="space-y-16">
          <div>
            <h2 className="font-display text-4xl mb-8 font-black bg-doodle-yellow inline-block px-4 py-2 border-4 border-doodle-dark shadow-brutal -rotate-1 rounded-2xl">Active Quests</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              {quests.length === 0 && <div className="font-bold text-lg">No quests posted yet.</div>}
              {quests.map(q => {
                const realm = realms.find(r => r.id === q.realm_id);
                return (
                  <div key={q.id} className="brutal-card bg-white p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-display text-[10px] text-doodle-dark/60 uppercase tracking-widest mb-2 font-black">{q.id} · {realm?.name}</div>
                        <div className="font-display text-2xl font-black">{q.title}</div>
                      </div>
                      <div className="bg-doodle-yellow border-2 border-doodle-dark px-4 py-2 rounded-xl font-display font-black text-sm shadow-[2px_2px_0px_rgba(26,26,26,1)] rotate-3">{Number(q.bounty)/1e18} GEN</div>
                    </div>
                    <p className="font-bold text-doodle-dark/80 mb-6">{q.description}</p>
                    <div className="flex justify-between items-center text-xs font-display font-black uppercase">
                      <span>By {short(q.creator)}</span>
                      <span className={`px-3 py-1 border-2 border-doodle-dark rounded-lg shadow-[2px_2px_0px_rgba(26,26,26,1)] ${q.status === "OPEN" ? "bg-doodle-mint" : "bg-white"}`}>{q.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-display text-4xl mb-8 font-black bg-doodle-pink inline-block px-4 py-2 border-4 border-doodle-dark shadow-brutal rotate-1 rounded-2xl text-white">Submissions</h2>
            <div className="space-y-6 mt-6">
              {submissions.length === 0 && <div className="font-bold text-lg">No submissions yet.</div>}
              {submissions.map(s => {
                const quest = quests.find(q => q.id === s.quest_id);
                return (
                  <div key={s.id} className="brutal-card bg-white p-6 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="font-display text-[10px] text-doodle-dark/60 uppercase tracking-widest mb-3 font-black">{s.id} · For {quest?.title || s.quest_id}</div>
                      <p className="font-bold text-lg leading-relaxed mb-4">"{s.content}"</p>
                      {s.reasoning && (
                        <div className="bg-doodle-blue/20 border-2 border-doodle-dark p-4 rounded-xl text-sm font-bold">
                          <span className="font-display uppercase tracking-widest text-xs opacity-70 block mb-1">Quest Master: </span>
                          {s.reasoning}
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-56 shrink-0 flex flex-col gap-4">
                      {s.status === "PENDING" ? (
                        <>
                          <div className="font-display text-sm tracking-widest uppercase flex items-center gap-2 font-black bg-doodle-yellow/30 px-3 py-2 rounded-xl border-2 border-doodle-dark">
                            <div className="w-3 h-3 bg-doodle-yellow border-2 border-doodle-dark rounded-full animate-pulse"/> PENDING
                          </div>
                          <button onClick={() => evaluate(s.id)} disabled={busy} className="w-full py-4 bg-doodle-pink text-white brutal-button disabled:opacity-50">Adjudicate</button>
                        </>
                      ) : (
                        <div className={`font-display text-sm tracking-widest uppercase flex items-center gap-2 font-black px-4 py-3 rounded-xl border-2 border-doodle-dark shadow-[2px_2px_0px_rgba(26,26,26,1)] ${s.verdict === 'APPROVED' ? 'bg-doodle-mint' : 'bg-red-400 text-white'}`}>
                          {s.verdict === 'APPROVED' ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                          {s.verdict}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
