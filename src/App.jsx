import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jnfxaefoaquzghohslyb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZnhhZWZvYXF1emdob2hzbHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjUwMDQsImV4cCI6MjA5MjIwMTAwNH0.UPWielalikZij_-i3d58Hq0T1BDytxNCsUsc2djJl-A";
const CLAUDE_PROXY = `${SUPABASE_URL}/functions/v1/claude-proxy`;

const supabase = async (path, opts = {}) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: opts.prefer || "return=representation", ...opts.headers },
    ...opts,
  });
  if (!r.ok) throw new Error(await r.text());
  const text = await r.text();
  return text ? JSON.parse(text) : [];
};

const callClaude = async (messages, system = "") => {
  const r = await fetch(CLAUDE_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify({ system, messages }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.content?.[0]?.text || "";
};

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f7f6f3;--surface:#ffffff;--surface2:#f0efe9;--border:#e5e2d9;--border2:#ccc9bc;
    --accent:#1a5e38;--accent-light:#eaf4ee;--accent2:#2a8a52;
    --red:#b83232;--red-light:#fdf0ee;--green:#1a5e38;--green-light:#eaf4ee;
    --blue:#1a3d8a;--blue-light:#eaeffc;--amber:#a05c10;--amber-light:#fef4e4;
    --text:#181612;--text2:#46423a;--text3:#948f88;
    --r:8px;--sans:'DM Sans',sans-serif;--serif:'Fraunces',serif;
    --sh:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
    --sh2:0 4px 14px rgba(0,0,0,.09),0 2px 4px rgba(0,0,0,.04);
  }
  body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;min-height:100vh}
  .header{background:var(--surface);border-bottom:1px solid var(--border);padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:62px;position:sticky;top:0;z-index:100;box-shadow:var(--sh)}
  .hbrand{display:flex;align-items:center;gap:12px}
  .hlogo{width:38px;height:38px;background:var(--accent);color:#fff;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:16px;font-weight:900;letter-spacing:-.5px}
  .hname{font-family:var(--serif);font-size:17px;font-weight:700}
  .hsub{font-size:11px;color:var(--text3);margin-top:1px}
  .hstatus{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text3);background:var(--surface2);padding:7px 14px;border-radius:20px;border:1px solid var(--border)}
  .dot{width:7px;height:7px;border-radius:50%;background:var(--accent2)}
  .tabs{background:var(--surface);border-bottom:1px solid var(--border);padding:0 32px;display:flex;gap:2px}
  .tab{padding:16px 18px;font-size:13px;font-weight:500;color:var(--text3);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;transition:all .15s;font-family:var(--sans);display:flex;align-items:center;gap:6px}
  .tab:hover{color:var(--text2)}.tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}
  .tbadge{background:var(--accent);color:#fff;border-radius:10px;font-size:10px;font-weight:700;padding:1px 7px;min-width:18px;text-align:center}
  .main{padding:28px 32px;max-width:1120px}
  .sh{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}
  .stitle{font-family:var(--serif);font-size:24px;font-weight:700}
  .smeta{font-size:12px;color:var(--text3);margin-top:3px}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--r);font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s}
  .btn-p{background:var(--accent);color:#fff}.btn-p:hover{background:var(--accent2)}
  .btn-g{background:#fff;color:var(--text2);border-color:var(--border2);box-shadow:var(--sh)}.btn-g:hover{border-color:var(--accent);color:var(--accent)}
  .btn-d{background:#fff;color:var(--red);border-color:var(--border2)}.btn-d:hover{background:var(--red-light);border-color:var(--red)}
  .btn-s{background:var(--accent);color:#fff}.btn-s:hover{background:var(--accent2)}
  .btn:disabled{opacity:.42;cursor:not-allowed}
  .bsm{padding:6px 12px;font-size:12px}
  .filters{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;margin-bottom:20px;box-shadow:var(--sh);display:flex;flex-direction:column;gap:14px}
  .frow{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .flabel{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;min-width:74px}
  .sw{display:flex;align-items:center;gap:10px;flex:1;min-width:180px}
  .slider{flex:1;-webkit-appearance:none;height:3px;background:var(--border2);border-radius:2px;outline:none}
  .slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.2)}
  .sv{font-size:12px;font-weight:600;color:var(--accent);min-width:52px}
  .chips{display:flex;gap:6px;flex-wrap:wrap}
  .chip{padding:5px 13px;border-radius:20px;border:1px solid var(--border2);font-size:12px;cursor:pointer;color:var(--text2);background:#fff;transition:all .15s;font-family:var(--sans)}
  .chip.on{border-color:var(--accent);color:var(--accent);background:var(--accent-light);font-weight:500}
  .chip:hover:not(.on){border-color:var(--text3)}
  .jgrid{display:flex;flex-direction:column;gap:10px}
  .jcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:20px;display:grid;grid-template-columns:1fr auto;gap:16px;transition:all .15s;box-shadow:var(--sh)}
  .jcard:hover{border-color:var(--accent);box-shadow:var(--sh2);transform:translateY(-1px)}
  .jtitle{font-family:var(--serif);font-size:16px;font-weight:700;margin-bottom:3px}
  .jco{font-size:13px;font-weight:600;color:var(--accent);margin-bottom:10px}
  .jmeta{display:flex;gap:16px;flex-wrap:wrap}
  .jmi{font-size:12px;color:var(--text3);display:flex;align-items:center;gap:4px}
  .jtags{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}
  .tag{padding:3px 9px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text2);font-weight:500}
  .jacts{display:flex;flex-direction:column;gap:6px;align-items:flex-end;justify-content:center;min-width:130px}
  .mbadge{padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;width:100%;text-align:center}
  .mh{background:var(--green-light);color:var(--green)}.mm{background:var(--amber-light);color:var(--amber)}.ml{background:var(--surface2);color:var(--text3)}
  .elog{display:flex;flex-direction:column;gap:10px}
  .ecard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;box-shadow:var(--sh)}
  .ech{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
  .esubj{font-family:var(--serif);font-size:15px;font-weight:700;margin-bottom:3px}
  .eto{font-size:12px;color:var(--text3)}
  .eprev{font-size:12px;color:var(--text2);line-height:1.7}
  .spill{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
  .sp-draft{background:var(--blue-light);color:var(--blue)}.sp-sent{background:var(--green-light);color:var(--green)}
  .cw{display:grid;grid-template-columns:1fr 300px;gap:20px}
  .cgrid{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;box-shadow:var(--sh)}
  .ch{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
  .cmonth{font-family:var(--serif);font-size:17px;font-weight:700}
  .cdh{display:grid;grid-template-columns:repeat(7,1fr);background:var(--surface2);border-bottom:1px solid var(--border)}
  .cdn{padding:8px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3)}
  .ccs{display:grid;grid-template-columns:repeat(7,1fr)}
  .cc{min-height:80px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);padding:8px;cursor:pointer;transition:background .1s}
  .cc:nth-child(7n){border-right:none}.cc:hover{background:var(--surface2)}.cc.today{background:var(--accent-light)}
  .cc.om .cdate{color:var(--border2)}.cdate{font-size:12px;font-weight:500;color:var(--text2);margin-bottom:4px}
  .tnum{width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
  .ced{font-size:10px;padding:2px 5px;border-radius:3px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
  .ed-deadline{background:var(--red-light);color:var(--red)}.ed-interview{background:var(--blue-light);color:var(--blue)}
  .ed-follow_up{background:var(--amber-light);color:var(--amber)}.ed-networking{background:var(--green-light);color:var(--green)}
  .ed-reminder{background:var(--surface2);color:var(--text3)}
  .esb{display:flex;flex-direction:column;gap:8px}
  .evc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
  .evc:hover{border-color:var(--accent)}.evc.sel{border-color:var(--accent);background:var(--accent-light)}
  .evdl{font-size:11px;color:var(--text3);margin-bottom:3px;font-weight:500}
  .evt{font-family:var(--serif);font-size:13px;font-weight:700;margin-bottom:3px}
  .evc-co{font-size:11px;color:var(--accent);font-weight:600;margin-bottom:4px}
  .evc-em{font-size:11px;color:var(--text3)}
  .brief{background:#fff;border:1px solid var(--border);border-radius:6px;padding:12px;margin-top:10px}
  .briefl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);margin-bottom:6px}
  .brieft{font-size:12px;color:var(--text2);line-height:1.7}
  .moverlay{position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:600px;max-height:88vh;overflow-y:auto;padding:28px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.14)}
  .mtitle{font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:20px;padding-right:32px}
  .mclose{position:absolute;top:18px;right:18px;background:var(--surface2);border:none;color:var(--text2);width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .mclose:hover{background:var(--border2)}
  .fg{margin-bottom:16px}
  .fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);margin-bottom:6px;display:block}
  .fi,.fta{width:100%;background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none;transition:border-color .15s;resize:vertical}
  .fi:focus,.fta:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light)}
  .fta{min-height:130px;line-height:1.6}
  .macts{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px}
  .sc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;box-shadow:var(--sh)}
  .sl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);margin-bottom:6px}
  .sn{font-family:var(--serif);font-size:28px;font-weight:700}
  .sa{color:var(--blue)}.si{color:var(--amber)}.so{color:var(--green)}.sr{color:var(--red)}
  .loading{display:flex;align-items:center;gap:10px;color:var(--text3);font-size:13px;padding:48px 0;justify-content:center}
  .spin{width:18px;height:18px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .empty{text-align:center;padding:60px 20px;color:var(--text3)}
  .ei{font-size:40px;margin-bottom:12px}.et{font-family:var(--serif);font-size:18px;color:var(--text2);margin-bottom:6px}.es{font-size:13px}
  .twrap{position:fixed;bottom:24px;right:24px;z-index:9000;display:flex;flex-direction:column;gap:8px}
  .toast{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:12px 18px;font-size:13px;max-width:320px;box-shadow:var(--sh2);animation:su .25s ease}
  @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .toast.success{border-left:3px solid var(--green)}.toast.error{border-left:3px solid var(--red)}.toast.info{border-left:3px solid var(--accent)}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
`;

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  return { toasts, add };
}

const JOB_PROMPT = `Generate 8 realistic Canadian job listings for Cole Gluckstein.
Profile: Babson College MSEL grad May 2025, B.A. Western University, Toronto-based.
Target: GTM, Strategy, Operations, BD, Partnerships, Growth, VC Analyst, Product roles at Canadian startups & scale-ups.
Good companies: Shopify, Wealthsimple, TouchBistro, theScore, League, Cohere, Clearco, Neo Financial, Nuvei, Benevity, ApplyBoard, Float, Klue, Voiceflow, Tulip, Properly, Nudge, Coconut Software.
NOT big banks or traditional finance firms.
Salary: $75K-$95K CAD range.
Return ONLY a valid JSON array with fields: title, company, location, salary_min (integer, e.g. 78000), salary_max (integer, e.g. 92000), work_type (Remote/Hybrid/On-site), company_stage (Startup/Scale-up), hiring_manager_email, description (2 compelling sentences), tags (array of 3 strings like "GTM","SaaS","Series B"), match_score (integer 75-96), benefits (array from: Health,Dental,Equity,Remote Stipend,Unlimited PTO).`;

function JobQueueTab({ toast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [salMin, setSalMin] = useState(70);
  const [salMax, setSalMax] = useState(130);
  const [wt, setWt] = useState([]);
  const [st, setSt] = useState([]);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    try { setJobs(await supabase("job_queue?order=created_at.desc&limit=60")); }
    catch { toast.add("Failed to load jobs", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setSearching(true);
    toast.add("Finding startup & GTM roles in Canada…", "info");
    try {
      const raw = await callClaude([{ role: "user", content: JOB_PROMPT }], "Return only a valid JSON array. No markdown, no explanation.");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      for (const job of parsed) {
        await supabase("job_queue", { method: "POST", body: JSON.stringify({ ...job, status: "pending", category: "GTM / Strategy" }), prefer: "return=minimal" });
      }
      toast.add(`Added ${parsed.length} new roles!`, "success");
      load();
    } catch (e) { toast.add("Refresh failed: " + e.message, "error"); }
    finally { setSearching(false); }
  };

  const skip = async (id) => {
    await supabase(`job_queue?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "skipped" }), prefer: "return=minimal" });
    setJobs(j => j.map(x => x.id === id ? { ...x, status: "skipped" } : x));
  };

  const tog = (arr, set, val) => set(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val]);

  const filtered = jobs.filter(j => {
    if (j.status === "skipped") return false;
    const minOk = !j.salary_min || j.salary_min / 1000 >= salMin - 5;
    const maxOk = !j.salary_max || j.salary_max / 1000 <= salMax + 5;
    const wtOk = wt.length === 0 || wt.includes(j.work_type);
    const stOk = st.length === 0 || st.some(s => j.company_stage?.includes(s));
    return minOk && maxOk && wtOk && stOk;
  });

  return (
    <div>
      <div className="sh">
        <div><div className="stitle">Morning Queue</div><div className="smeta">{filtered.length} roles matching your filters</div></div>
        <button className="btn btn-p" onClick={refresh} disabled={searching}>{searching ? "⟳ Searching…" : "⟳ Refresh Jobs"}</button>
      </div>

      <div className="filters">
        <div className="frow">
          <span className="flabel">Salary</span>
          <div className="sw"><span style={{fontSize:11,color:"var(--text3)",minWidth:26}}>Min</span><input type="range" className="slider" min={50} max={150} value={salMin} onChange={e=>setSalMin(+e.target.value)}/><span className="sv">${salMin}K</span></div>
          <div className="sw"><span style={{fontSize:11,color:"var(--text3)",minWidth:26}}>Max</span><input type="range" className="slider" min={50} max={200} value={salMax} onChange={e=>setSalMax(+e.target.value)}/><span className="sv">${salMax}K</span></div>
        </div>
        <div className="frow">
          <span className="flabel">Work Type</span>
          <div className="chips">{["Remote","Hybrid","On-site"].map(w=><span key={w} className={`chip ${wt.includes(w)?"on":""}`} onClick={()=>tog(wt,setWt,w)}>{w}</span>)}</div>
        </div>
        <div className="frow">
          <span className="flabel">Stage</span>
          <div className="chips">{["Startup","Scale-up","Enterprise"].map(s=><span key={s} className={`chip ${st.includes(s)?"on":""}`} onClick={()=>tog(st,setSt,s)}>{s}</span>)}</div>
        </div>
      </div>

      {loading ? <div className="loading"><div className="spin"/>Loading queue…</div>
        : filtered.length === 0 ? <div className="empty"><div className="ei">📋</div><div className="et">Queue is empty</div><div className="es">Hit Refresh Jobs to pull fresh startup roles</div></div>
        : <div className="jgrid">{filtered.map(j=><JobCard key={j.id} job={j} onSkip={skip} onDraft={setDraft}/>)}</div>}

      {draft && <EmailModal job={draft} onClose={()=>setDraft(null)} toast={toast} onSent={()=>{setDraft(null);load();}}/>}
    </div>
  );
}

function JobCard({ job, onSkip, onDraft }) {
  const s = job.match_score||78;
  const cls = s>=88?"mh":s>=78?"mm":"ml";
  const sal = job.salary_min&&job.salary_max ? `$${Math.round(job.salary_min/1000)}K–$${Math.round(job.salary_max/1000)}K CAD` : job.salary||"Competitive";
  return (
    <div className="jcard">
      <div>
        <div className="jtitle">{job.title}</div>
        <div className="jco">{job.company}</div>
        <div className="jmeta">
          <span className="jmi">📍 {job.location||"Toronto, ON"}</span>
          <span className="jmi">💰 {sal}</span>
          {job.work_type&&<span className="jmi">🏢 {job.work_type}</span>}
          {job.company_stage&&<span className="jmi">📈 {job.company_stage}</span>}
          {job.hiring_manager_email&&<span className="jmi">✉ {job.hiring_manager_email}</span>}
        </div>
        {job.description&&<div style={{fontSize:12,color:"var(--text2)",marginTop:10,lineHeight:1.7}}>{job.description}</div>}
        <div className="jtags">
          {job.benefits?.map(b=><span key={b} className="tag" style={{color:"var(--green)",borderColor:"#c2e0cd",background:"var(--green-light)"}}>✓ {b}</span>)}
          {job.tags?.map(t=><span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      <div className="jacts">
        <span className={`mbadge ${cls}`}>{s}% match</span>
        <button className="btn btn-p bsm" style={{width:"100%"}} onClick={()=>onDraft(job)}>✉ Draft Email</button>
        {job.job_url&&<a href={job.job_url} target="_blank" rel="noreferrer" className="btn btn-g bsm" style={{width:"100%",textDecoration:"none",textAlign:"center"}}>↗ View</a>}
        <button className="btn btn-d bsm" style={{width:"100%"}} onClick={()=>onSkip(job.id)}>✕ Skip</button>
      </div>
    </div>
  );
}

function EmailModal({ job, onClose, toast, onSent }) {
  const [to, setTo] = useState(job.hiring_manager_email||"");
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("application");
  const [gen, setGen] = useState(false);
  const [send, setSend] = useState(false);

  const generate = async () => {
    setGen(true); setSubj(""); setBody("");
    try {
      const p = `Write a ${type} email from Cole Gluckstein to ${to||"the hiring team"} at ${job.company} for the ${job.title} role.
Cole: Babson MSEL grad May 2025, Western University B.A., Toronto-based, targeting GTM/Strategy/BD/Ops at Canadian startups. Salary target $75K-$95K CAD. References: VIQ Solutions CEO, law firm manager, Western professor.
Write concisely and compellingly — sharp recent grad energy, not stiff corporate.
Return ONLY valid JSON: {"subject":"...","body":"..."}`;
      const raw = await callClaude([{role:"user",content:p}],"Return only valid JSON. No markdown.");
      const p2 = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setSubj(p2.subject); setBody(p2.body);
    } catch(e) { toast.add("Generation failed: "+e.message,"error"); }
    finally { setGen(false); }
  };
  useEffect(()=>{generate();},[]);

  const handleSend = async () => {
    if(!to||!subj||!body){toast.add("Fill in all fields","error");return;}
    setSend(true);
    try {
      await supabase("emails",{method:"POST",body:JSON.stringify({job_id:job.id,to_email:to,company:job.company,subject:subj,body,email_type:type,status:"sent",sent_at:new Date().toISOString()})});
      const fu=new Date(); fu.setDate(fu.getDate()+7);
      await supabase("calendar_events",{method:"POST",body:JSON.stringify({title:`Follow up — ${job.company}`,event_type:"follow_up",event_date:fu.toISOString(),company:job.company,contact_email:to,briefing:`Follow up on your ${type} for the ${job.title} role. Reference your initial email and ask about next steps.`}),prefer:"return=minimal"});
      toast.add("Saved + follow-up in 7 days scheduled!","success");
      onSent();
    } catch(e){toast.add("Failed: "+e.message,"error");}
    finally{setSend(false);}
  };

  return (
    <div className="moverlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}>✕</button>
        <div className="mtitle">Draft Email — {job.company}</div>
        <div className="fg"><label className="fl">Email Type</label><div className="chips">{["application","cold_outreach","follow_up","networking"].map(t=><span key={t} className={`chip ${type===t?"on":""}`} onClick={()=>setType(t)}>{t.replace("_"," ")}</span>)}</div></div>
        <div className="fg"><label className="fl">To</label><input className="fi" value={to} onChange={e=>setTo(e.target.value)} placeholder="hiring@company.com"/></div>
        <div className="fg"><label className="fl">Subject</label><input className="fi" value={subj} onChange={e=>setSubj(e.target.value)} placeholder={gen?"Generating…":"Subject line"}/></div>
        <div className="fg"><label className="fl">Body</label>
          {gen?<div className="loading" style={{padding:"22px 0"}}><div className="spin"/>Drafting your email…</div>
            :<textarea className="fta" value={body} onChange={e=>setBody(e.target.value)} style={{minHeight:210}}/>}
        </div>
        <div className="macts">
          <button className="btn btn-g" onClick={generate} disabled={gen}>↺ Regenerate</button>
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-s" onClick={handleSend} disabled={send||gen}>{send?"Saving…":"✓ Save & Schedule Follow-up"}</button>
        </div>
      </div>
    </div>
  );
}

function OutreachTab({ toast }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{supabase("emails?order=created_at.desc").then(setEmails).catch(()=>toast.add("Failed","error")).finally(()=>setLoading(false));},[]);
  const c={draft:0,sent:0}; emails.forEach(e=>{if(c[e.status]!==undefined)c[e.status]++;});
  return (
    <div>
      <div className="sh"><div><div className="stitle">Outreach Log</div><div className="smeta">{c.sent} sent · {c.draft} drafts</div></div></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(2,1fr)",maxWidth:300,marginBottom:20}}>
        <div className="sc"><div className="sl">Drafts</div><div className="sn sa">{c.draft}</div></div>
        <div className="sc"><div className="sl">Sent</div><div className="sn so">{c.sent}</div></div>
      </div>
      {loading?<div className="loading"><div className="spin"/>Loading…</div>
        :emails.length===0?<div className="empty"><div className="ei">✉️</div><div className="et">No emails yet</div><div className="es">Draft from the Job Queue tab</div></div>
        :<div className="elog">{emails.map(e=>(
          <div key={e.id} className="ecard">
            <div className="ech">
              <div><div className="esubj">{e.subject}</div><div className="eto">To: {e.to_email} · {e.company}</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                <span className={`spill sp-${e.status}`}>{e.status}</span>
                <span style={{fontSize:11,color:"var(--text3)"}}>{new Date(e.created_at).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</span>
              </div>
            </div>
            <div className="eprev">{e.body?.slice(0,220)}…</div>
          </div>
        ))}</div>}
    </div>
  );
}

function CalendarTab({ toast }) {
  const [events, setEvents] = useState([]);
  const today = new Date();
  const [vd, setVd] = useState(new Date());
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);
  const load = async()=>{try{setEvents(await supabase("calendar_events?order=event_date.asc"));}catch{toast.add("Failed","error");}};
  useEffect(()=>{load();},[]);
  const y=vd.getFullYear(),m=vd.getMonth();
  const fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),pd=new Date(y,m,0).getDate();
  const cells=[];
  for(let i=fd-1;i>=0;i--)cells.push({day:pd-i,cur:false});
  for(let d=1;d<=dim;d++)cells.push({day:d,cur:true});
  while(cells.length%7!==0)cells.push({day:cells.length-fd-dim+1,cur:false});
  const evOn=(day,cur)=>!cur?[]:events.filter(e=>{const d=new Date(e.event_date);return d.getFullYear()===y&&d.getMonth()===m&&d.getDate()===day;});
  const upcoming=events.filter(e=>new Date(e.event_date)>=today&&!e.completed).slice(0,8);
  const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div>
      <div className="sh"><div><div className="stitle">Calendar</div><div className="smeta">{upcoming.length} upcoming</div></div><button className="btn btn-p" onClick={()=>setAdd(true)}>+ Add Event</button></div>
      <div className="cw">
        <div className="cgrid">
          <div className="ch">
            <button className="btn btn-g bsm" onClick={()=>setVd(new Date(y,m-1))}>‹ Prev</button>
            <span className="cmonth">{MN[m]} {y}</span>
            <button className="btn btn-g bsm" onClick={()=>setVd(new Date(y,m+1))}>Next ›</button>
          </div>
          <div className="cdh">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="cdn">{d}</div>)}</div>
          <div className="ccs">{cells.map((cell,i)=>{
            const de=evOn(cell.day,cell.cur);
            const iT=cell.cur&&cell.day===today.getDate()&&m===today.getMonth()&&y===today.getFullYear();
            return(<div key={i} className={`cc ${iT?"today":""} ${!cell.cur?"om":""}`}>
              <div className={`cdate ${iT?"tnum":""}`}>{cell.day}</div>
              {de.slice(0,3).map(ev=><div key={ev.id} className={`ced ed-${ev.event_type}`} onClick={()=>setSel(ev)} title={ev.title}>{ev.title}</div>)}
            </div>);
          })}</div>
        </div>
        <div className="esb">
          <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:"var(--text3)",marginBottom:4}}>Upcoming</div>
          {upcoming.length===0?<div style={{fontSize:12,color:"var(--text3)",paddingTop:16}}>No upcoming events</div>
            :upcoming.map(ev=>(
              <div key={ev.id} className={`evc ${sel?.id===ev.id?"sel":""}`} onClick={()=>setSel(sel?.id===ev.id?null:ev)}>
                <div className="evdl">{new Date(ev.event_date).toLocaleDateString("en-CA",{weekday:"short",month:"short",day:"numeric"})}</div>
                <div className="evt">{ev.title}</div>
                {ev.company&&<div className="evc-co">{ev.company}</div>}
                {ev.contact_email&&<div className="evc-em">✉ {ev.contact_email}</div>}
                <div style={{marginTop:6}}><span className={`ced ed-${ev.event_type}`} style={{display:"inline-block"}}>{ev.event_type.replace("_"," ")}</span></div>
                {sel?.id===ev.id&&ev.briefing&&<div className="brief"><div className="briefl">📋 Briefing</div><div className="brieft">{ev.briefing}</div></div>}
              </div>
            ))}
        </div>
      </div>
      {add&&<AddEventModal onClose={()=>setAdd(false)} toast={toast} onAdded={load}/>}
    </div>
  );
}

function AddEventModal({ onClose, toast, onAdded }) {
  const [f, setF] = useState({title:"",event_type:"interview",event_date:"",company:"",contact_name:"",contact_email:"",briefing:"",notes:""});
  const [gen, setGen] = useState(false);
  const [sav, setSav] = useState(false);
  const s=(k,v)=>setF(x=>({...x,[k]:v}));

  const genBrief = async()=>{
    if(!f.company){toast.add("Add company first","error");return;}
    setGen(true);
    try{const raw=await callClaude([{role:"user",content:`3-sentence tactical briefing for Cole Gluckstein (Babson MSEL, GTM/Strategy/BD at Canadian startups) for a ${f.event_type} with ${f.company}${f.contact_name?`, contact: ${f.contact_name}`:""}: 1) what they do & stage, 2) what Cole should lead with, 3) one smart question.`}]);s("briefing",raw);}
    catch{toast.add("Generation failed","error");}
    finally{setGen(false);}
  };

  const save = async()=>{
    if(!f.title||!f.event_date){toast.add("Title and date required","error");return;}
    setSav(true);
    try{await supabase("calendar_events",{method:"POST",body:JSON.stringify(f),prefer:"return=minimal"});toast.add("Event added!","success");onAdded();onClose();}
    catch{toast.add("Failed to save","error");}
    finally{setSav(false);}
  };

  return (
    <div className="moverlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}>✕</button>
        <div className="mtitle">Add Calendar Event</div>
        <div className="fg"><label className="fl">Type</label><div className="chips">{["interview","deadline","follow_up","networking","reminder"].map(t=><span key={t} className={`chip ${f.event_type===t?"on":""}`} onClick={()=>s("event_type",t)}>{t.replace("_"," ")}</span>)}</div></div>
        <div className="fg"><label className="fl">Title</label><input className="fi" value={f.title} onChange={e=>s("title",e.target.value)} placeholder="e.g. Interview — Shopify GTM Role"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="fg"><label className="fl">Date & Time</label><input type="datetime-local" className="fi" value={f.event_date} onChange={e=>s("event_date",e.target.value)}/></div>
          <div className="fg"><label className="fl">Company</label><input className="fi" value={f.company} onChange={e=>s("company",e.target.value)} placeholder="Shopify"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="fg"><label className="fl">Contact Name</label><input className="fi" value={f.contact_name} onChange={e=>s("contact_name",e.target.value)} placeholder="Jane Smith"/></div>
          <div className="fg"><label className="fl">Contact Email</label><input className="fi" value={f.contact_email} onChange={e=>s("contact_email",e.target.value)} placeholder="jane@company.com"/></div>
        </div>
        <div className="fg">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <label className="fl" style={{margin:0}}>Briefing</label>
            <button className="btn btn-g bsm" onClick={genBrief} disabled={gen}>{gen?"⟳ Generating…":"✦ AI Briefing"}</button>
          </div>
          <textarea className="fta" value={f.briefing} onChange={e=>s("briefing",e.target.value)} placeholder="What to know, say, and ask…"/>
        </div>
        <div className="macts">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={save} disabled={sav}>{sav?"Saving…":"Save Event"}</button>
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ toast }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{supabase("applications?order=applied_at.desc").then(setApps).catch(()=>toast.add("Failed","error")).finally(()=>setLoading(false));},[]);
  const by=s=>apps.filter(a=>a.status===s);
  return (
    <div>
      <div className="sh"><div><div className="stitle">Applications</div><div className="smeta">{apps.length} total tracked</div></div></div>
      <div className="stats">{[["applied","Applied","sa"],["interviewing","Interviewing","si"],["offer","Offers","so"],["rejected","Rejected","sr"]].map(([s,l,c])=>(
        <div key={s} className="sc"><div className="sl">{l}</div><div className={`sn ${c}`}>{by(s).length}</div></div>
      ))}</div>
      {loading?<div className="loading"><div className="spin"/>Loading…</div>
        :apps.length===0?<div className="empty"><div className="ei">📊</div><div className="et">No applications yet</div><div className="es">Send emails from the Queue tab to start tracking</div></div>
        :<div className="jgrid">{apps.map(a=>(
          <div key={a.id} className="jcard">
            <div><div className="jtitle">{a.role}</div><div className="jco">{a.company}</div>
              <div className="jmeta">
                <span className="jmi">📍 {a.location}</span>
                {a.salary&&<span className="jmi">💰 {a.salary}</span>}
                {a.applied_at&&<span className="jmi">📅 {new Date(a.applied_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="jacts"><span className={`spill sp-${a.status}`}>{a.status}</span></div>
          </div>
        ))}</div>}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("queue");
  const toast = useToast();
  const [qc, setQc] = useState(0);
  useEffect(()=>{supabase("job_queue?status=eq.pending&select=id").then(d=>setQc(d.length)).catch(()=>{});},[tab]);

  return (
    <div>
      <style>{style}</style>
      <header className="header">
        <div className="hbrand">
          <div className="hlogo">CG</div>
          <div><div className="hname">Cole Gluckstein</div><div className="hsub">Job Search Agent</div></div>
        </div>
        <div className="hstatus"><div className="dot"/>Active · Toronto · {new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"})}</div>
      </header>
      <nav className="tabs">
        {[{id:"queue",label:"Job Queue",badge:qc>0?qc:null},{id:"outreach",label:"Outreach"},{id:"calendar",label:"Calendar"},{id:"applications",label:"Applications"}].map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            {t.label}{t.badge&&<span className="tbadge">{t.badge}</span>}
          </button>
        ))}
      </nav>
      <main className="main">
        {tab==="queue"&&<JobQueueTab toast={toast}/>}
        {tab==="outreach"&&<OutreachTab toast={toast}/>}
        {tab==="calendar"&&<CalendarTab toast={toast}/>}
        {tab==="applications"&&<ApplicationsTab toast={toast}/>}
      </main>
      <div className="twrap">{toast.toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </div>
  );
}
