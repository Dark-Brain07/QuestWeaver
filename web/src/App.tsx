import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONTRACT, EXPLORER, CHAIN_ID, getStats, getRealm, getQuest, getSubmission, getCanon, writeWith, Realm, Quest, Submission } from "./lib/contract";
import { Sparkles, ScrollText, Sword, CheckCircle, XCircle } from "lucide-react";

const L = "font-mono text-[10px] uppercase tracking-[0.2em]";
const short = (a: string) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");

export default function App() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const acct = wallet?.address || "";
  
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ realms: 0, quests: 0, submissions: 0 });
  const [realms, setRealms] = useState<Realm[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Forms
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
    <div className="min-h-screen text-quest-primary font-sans relative overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-quest-accent/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-quest-gold/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-quest-dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-quest-accent" />
            <span className={`${L} font-bold text-white tracking-[0.3em]`}>QuestWeaver</span>
          </div>
          <div>
            {authenticated ? (
              <button onClick={() => logout()} className="px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-colors">
                {short(acct)} (Logout)
              </button>
            ) : (
              <button onClick={login} className="px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest bg-quest-accent text-white hover:bg-quest-accent/80 transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {CONTRACT === "0x0" && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 text-center font-mono text-sm">
          ⚠️ Smart contract not yet deployed. Update CONTRACT in src/lib/contract.ts
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-24">
        
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-light mb-6">
            Weave the <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-accent to-quest-gold italic">Mythos</span>.
          </h1>
          <p className="text-quest-secondary text-lg font-light leading-relaxed mb-10">
            A decentralized bounty-driven lore engine. Create Realms, post Quests with GEN token bounties, and let the AI Quest Master automatically evaluate submissions and settle payouts based on strict canon adherence.
          </p>
          <div className="flex justify-center gap-6 font-mono">
            <div className="glass-panel px-6 py-4 rounded-2xl"><div className="text-[10px] text-quest-secondary mb-1 uppercase tracking-widest">Realms</div><div className="text-2xl text-white">{stats.realms}</div></div>
            <div className="glass-panel px-6 py-4 rounded-2xl"><div className="text-[10px] text-quest-secondary mb-1 uppercase tracking-widest">Quests</div><div className="text-2xl text-white">{stats.quests}</div></div>
            <div className="glass-panel px-6 py-4 rounded-2xl"><div className="text-[10px] text-quest-secondary mb-1 uppercase tracking-widest">Submissions</div><div className="text-2xl text-quest-accent">{stats.submissions}</div></div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Action: Create Realm */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className={`${L} text-quest-accent mb-6 flex items-center gap-2`}><ScrollText className="w-4 h-4"/> Create Realm</div>
            <input value={realmForm.name} onChange={e=>setRealmForm({...realmForm, name: e.target.value})} placeholder="Realm Name (e.g. Aethelgard)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-quest-accent/50" />
            <textarea value={realmForm.laws} onChange={e=>setRealmForm({...realmForm, laws: e.target.value})} placeholder="Fundamental Laws (e.g. Magic is fueled by soul shards. No space travel.)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-quest-accent/50 h-32 resize-none" />
            <button onClick={createRealm} disabled={busy} className="w-full py-3 bg-white text-black font-mono text-[10px] uppercase tracking-widest rounded-xl hover:bg-quest-accent hover:text-white transition-all disabled:opacity-50">Forge Realm</button>
          </div>

          {/* Action: Post Quest */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className={`${L} text-quest-gold mb-6 flex items-center gap-2`}><Sword className="w-4 h-4"/> Post Quest</div>
            <select value={questForm.realm_id} onChange={e=>setQuestForm({...questForm, realm_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none">
              <option value="">Select Realm...</option>
              {realms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
            </select>
            <input value={questForm.title} onChange={e=>setQuestForm({...questForm, title: e.target.value})} placeholder="Quest Title" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-quest-gold/50" />
            <textarea value={questForm.description} onChange={e=>setQuestForm({...questForm, description: e.target.value})} placeholder="Description of the lore needed..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-quest-gold/50 h-20 resize-none" />
            <input type="number" value={questForm.bounty} onChange={e=>setQuestForm({...questForm, bounty: e.target.value})} placeholder="Bounty (GEN)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-quest-gold/50" />
            <button onClick={postQuest} disabled={busy} className="w-full py-3 bg-quest-gold/10 text-quest-gold border border-quest-gold/30 font-mono text-[10px] uppercase tracking-widest rounded-xl hover:bg-quest-gold hover:text-black transition-all disabled:opacity-50">Post Quest</button>
          </div>

          {/* Action: Submit Lore */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className={`${L} text-white mb-6 flex items-center gap-2`}><Sparkles className="w-4 h-4"/> Submit Lore</div>
            <select value={loreForm.quest_id} onChange={e=>setLoreForm({...loreForm, quest_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none">
              <option value="">Select Open Quest...</option>
              {quests.filter(q => q.status === "OPEN").map(q => <option key={q.id} value={q.id}>{q.title} ({q.bounty} GEN)</option>)}
            </select>
            <textarea value={loreForm.content} onChange={e=>setLoreForm({...loreForm, content: e.target.value})} placeholder="Write your submission here. Adhere strictly to the Realm Laws..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-white/50 h-44 resize-none" />
            <button onClick={submitLore} disabled={busy} className="w-full py-3 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all disabled:opacity-50">Submit Lore</button>
          </div>
        </div>

        {/* Boards */}
        <section className="space-y-16">
          <div>
            <h2 className="font-serif text-3xl mb-8">Active Quests</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quests.length === 0 && <div className="text-quest-secondary font-mono text-sm">No quests posted yet.</div>}
              {quests.map(q => {
                const realm = realms.find(r => r.id === q.realm_id);
                return (
                  <div key={q.id} className="glass-panel p-6 rounded-2xl border-l-4 border-l-quest-gold">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-mono text-[10px] text-quest-gold uppercase tracking-widest mb-1">{q.id} · {realm?.name}</div>
                        <div className="text-xl font-medium">{q.title}</div>
                      </div>
                      <div className="bg-quest-gold/20 text-quest-gold px-3 py-1 rounded-full font-mono text-[10px]">{Number(q.bounty)/1e18} GEN</div>
                    </div>
                    <p className="text-quest-secondary text-sm mb-4">{q.description}</p>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white/40">By {short(q.creator)}</span>
                      <span className={q.status === "OPEN" ? "text-green-400" : "text-white/50"}>{q.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl mb-8">Submissions & Verdicts</h2>
            <div className="space-y-4">
              {submissions.length === 0 && <div className="text-quest-secondary font-mono text-sm">No submissions yet.</div>}
              {submissions.map(s => {
                const quest = quests.find(q => q.id === s.quest_id);
                return (
                  <div key={s.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <div className="font-mono text-[10px] text-quest-accent uppercase tracking-widest mb-2">{s.id} · For {quest?.title || s.quest_id}</div>
                      <p className="text-sm text-quest-primary/90 italic mb-4">"{s.content}"</p>
                      {s.reasoning && (
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs text-quest-secondary">
                          <span className="text-white/60 font-mono">Quest Master: </span>
                          {s.reasoning}
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-3">
                      {s.status === "PENDING" ? (
                        <>
                          <div className="text-quest-gold font-mono text-[10px] tracking-widest uppercase flex items-center gap-1"><div className="w-2 h-2 bg-quest-gold rounded-full animate-pulse"/> PENDING</div>
                          <button onClick={() => evaluate(s.id)} disabled={busy} className="px-4 py-2 bg-quest-accent/20 text-quest-accent border border-quest-accent/30 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-quest-accent hover:text-white transition-all disabled:opacity-50">Adjudicate</button>
                        </>
                      ) : (
                        <div className={`font-mono text-[11px] tracking-widest uppercase flex items-center gap-2 ${s.verdict === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                          {s.verdict === 'APPROVED' ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
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
