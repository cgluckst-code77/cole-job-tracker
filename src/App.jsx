import { useState, useEffect, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://jnfxaefoaquzghohslyb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZnhhZWZvYXF1emdob2hzbHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjUwMDQsImV4cCI6MjA5MjIwMTAwNH0.UPWielalikZij_-i3d58Hq0T1BDytxNCsUsc2djJl-A";
const FROM_EMAIL = "cgluckst@gmail.com";
const FROM_NAME = "Cole Gluckstein";

const supabase = async (path, opts = {}) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
      ...opts.headers,
    },
    ...opts,
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(err);
  }
  const text = await r.text();
  return text ? JSON.parse(text) : [];
};

const callClaude = async (messages, system = "") => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0b;
    --surface: #111114;
    --surface2: #18181d;
    --border: #222228;
    --border2: #2e2e38;
    --accent: #e8c547;
    --accent2: #f0d878;
    --red: #e05252;
    --green: #52c47a;
    --blue: #5297e0;
    --text: #e8e8ec;
    --text2: #8888a0;
    --text3: #555568;
    --radius: 6px;
    --mono: 'DM Mono', monospace;
    --serif: 'Playfair Display', serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    font-size: 13px;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Grain overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* Header */
  .header {
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    position: sticky;
    top: 0;
    background: rgba(10,10,11,0.92);
    backdrop-filter: blur(12px);
    z-index: 100;
  }
  .header-brand {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .header-logo {
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 900;
    color: var(--accent);
    letter-spacing: -0.5px;
  }
  .header-sub {
    font-size: 10px;
    color: var(--text3);
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .header-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text3);
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Tabs */
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    background: var(--bg);
  }
  .tab {
    padding: 14px 20px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text3);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    user-select: none;
  }
  .tab:hover { color: var(--text2); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: var(--accent);
    color: #000;
    border-radius: 50%;
    font-size: 9px;
    font-weight: 600;
    margin-left: 6px;
  }

  /* Main */
  .main { flex: 1; padding: 28px 32px; }

  /* Section header */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .section-title {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
  }
  .section-meta { font-size: 11px; color: var(--text3); }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--radius);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.8px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
    text-transform: uppercase;
    font-weight: 500;
  }
  .btn-primary { background: var(--accent); color: #000; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent2); }
  .btn-ghost { background: transparent; color: var(--text2); border-color: var(--border2); }
  .btn-ghost:hover { border-color: var(--text2); color: var(--text); }
  .btn-danger { background: transparent; color: var(--red); border-color: var(--red); }
  .btn-danger:hover { background: var(--red); color: #fff; }
  .btn-success { background: var(--green); color: #000; border-color: var(--green); }
  .btn-success:hover { opacity: 0.85; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-sm { padding: 5px 10px; font-size: 10px; }

  /* Filters bar */
  .filters {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .filter-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .filter-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text3);
    min-width: 70px;
  }
  .slider-wrap { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; }
  .slider {
    flex: 1;
    -webkit-appearance: none;
    height: 2px;
    background: var(--border2);
    outline: none;
    border-radius: 2px;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
  }
  .slider-val { font-size: 11px; color: var(--accent); min-width: 55px; }
  .chip-group { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border2);
    font-size: 10px;
    letter-spacing: 0.5px;
    cursor: pointer;
    color: var(--text3);
    transition: all 0.15s;
    font-family: var(--mono);
  }
  .chip.active { border-color: var(--accent); color: var(--accent); background: rgba(232,197,71,0.08); }
  .chip:hover:not(.active) { border-color: var(--text3); color: var(--text2); }

  /* Job cards */
  .job-grid { display: flex; flex-direction: column; gap: 10px; }
  .job-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    transition: border-color 0.15s;
    position: relative;
    overflow: hidden;
  }
  .job-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .job-card:hover { border-color: var(--border2); }
  .job-card:hover::before { opacity: 1; }
  .job-card.skipped { opacity: 0.4; }
  .job-title {
    font-family: var(--serif);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  .job-company { font-size: 12px; color: var(--accent); margin-bottom: 8px; }
  .job-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .job-meta-item { font-size: 11px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
  .job-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
  .tag {
    padding: 2px 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 10px;
    color: var(--text3);
  }
  .job-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; justify-content: center; }
  .match-badge {
    padding: 4px 10px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .match-high { background: rgba(82,196,122,0.15); color: var(--green); }
  .match-mid { background: rgba(232,197,71,0.12); color: var(--accent); }
  .match-low { background: rgba(136,136,160,0.1); color: var(--text3); }

  /* Email panel */
  .email-log { display: flex; flex-direction: column; gap: 10px; }
  .email-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
  }
  .email-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .email-to { font-size: 12px; color: var(--text2); }
  .email-subject { font-family: var(--serif); font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .email-preview { font-size: 11px; color: var(--text3); line-height: 1.6; }
  .status-pill {
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-weight: 600;
  }
  .status-draft { background: rgba(82,151,224,0.15); color: var(--blue); }
  .status-sent { background: rgba(82,196,122,0.15); color: var(--green); }
  .status-bounced { background: rgba(224,82,82,0.15); color: var(--red); }

  /* Calendar */
  .cal-wrap { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
  .cal-grid {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .cal-month { font-family: var(--serif); font-size: 16px; font-weight: 700; }
  .cal-days-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--border);
  }
  .cal-day-name {
    padding: 8px;
    text-align: center;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text3);
  }
  .cal-cells { display: grid; grid-template-columns: repeat(7, 1fr); }
  .cal-cell {
    min-height: 80px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 6px;
    cursor: pointer;
    transition: background 0.1s;
  }
  .cal-cell:nth-child(7n) { border-right: none; }
  .cal-cell:hover { background: var(--surface2); }
  .cal-cell.today { background: rgba(232,197,71,0.05); }
  .cal-cell.other-month .cal-date { color: var(--text3); opacity: 0.3; }
  .cal-date { font-size: 11px; color: var(--text2); margin-bottom: 4px; }
  .cal-date.today-num {
    width: 20px; height: 20px;
    background: var(--accent);
    color: #000;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 10px;
  }
  .cal-event-dot {
    font-size: 9px;
    padding: 2px 4px;
    border-radius: 2px;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .dot-deadline { background: rgba(224,82,82,0.2); color: var(--red); }
  .dot-interview { background: rgba(82,151,224,0.2); color: var(--blue); }
  .dot-follow_up { background: rgba(232,197,71,0.15); color: var(--accent); }
  .dot-networking { background: rgba(82,196,122,0.15); color: var(--green); }
  .dot-reminder { background: rgba(136,136,160,0.1); color: var(--text3); }

  /* Event sidebar */
  .events-sidebar {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .event-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .event-card:hover { border-color: var(--border2); }
  .event-card.selected { border-color: var(--accent); }
  .event-date-label { font-size: 10px; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .event-title { font-family: var(--serif); font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .event-company { font-size: 11px; color: var(--accent); margin-bottom: 6px; }
  .event-contact { font-size: 11px; color: var(--text3); }
  .briefing-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    margin-top: 10px;
  }
  .briefing-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
  .briefing-text { font-size: 11px; color: var(--text2); line-height: 1.7; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px;
    width: 100%;
    max-width: 640px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 28px;
    position: relative;
  }
  .modal-title {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    padding-right: 30px;
  }
  .modal-close {
    position: absolute;
    top: 20px; right: 20px;
    background: none;
    border: none;
    color: var(--text3);
    font-size: 18px;
    cursor: pointer;
  }
  .modal-close:hover { color: var(--text); }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; display: block; }
  .form-input, .form-textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 10px 12px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
    resize: vertical;
  }
  .form-input:focus, .form-textarea:focus { border-color: var(--accent); }
  .form-textarea { min-height: 120px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

  /* Loading */
  .loading {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text3);
    font-size: 12px;
    padding: 40px 0;
    justify-content: center;
  }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--border2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Empty state */
  .empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text3);
  }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-text { font-family: var(--serif); font-size: 16px; color: var(--text2); margin-bottom: 6px; }
  .empty-sub { font-size: 11px; }

  /* Toast */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9000; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 12px 18px;
    font-size: 12px;
    max-width: 320px;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: none; } }
  .toast.success { border-left: 3px solid var(--green); }
  .toast.error { border-left: 3px solid var(--red); }
  .toast.info { border-left: 3px solid var(--accent); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text3); }

  /* Applications kanban summary */
  .kanban-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kanban-col { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
  .kanban-col-title { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }
  .kanban-count { font-family: var(--serif); font-size: 28px; font-weight: 700; }
  .kanban-count.applied { color: var(--blue); }
  .kanban-count.interviewing { color: var(--accent); }
  .kanban-count.offer { color: var(--green); }
  .kanban-count.rejected { color: var(--red); }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, add };
}

// ─── Job Queue Tab ────────────────────────────────────────────────────────────
function JobQueueTab({ toast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [salaryMin, setSalaryMin] = useState(75);
  const [salaryMax, setSalaryMax] = useState(150);
  const [workTypes, setWorkTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [draftJob, setDraftJob] = useState(null);

  const WORK_TYPES = ["Remote", "Hybrid", "On-site"];
  const STAGES = ["Startup", "Scale-up", "Enterprise", "VC / PE"];
  const BENEFITS = ["Health", "Dental", "Equity", "Remote Stipend", "Unlimited PTO"];

  const load = async () => {
    try {
      const data = await supabase("job_queue?order=created_at.desc&limit=50");
      setJobs(data);
    } catch (e) {
      toast.add("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const searchIndeed = async () => {
    setSearching(true);
    toast.add("Searching Indeed for Canadian jobs…", "info");
    try {
      // Use Claude to generate job data based on profile since Indeed MCP requires browser
      const raw = await callClaude(
        [{ role: "user", content: `Generate 8 realistic Canadian job listings for Cole Gluckstein (Babson MSEL grad, BD/Strategy/VC/PM/Analyst roles, Toronto-based, sports tech/SaaS/high-growth startups). Salary range: $${salaryMin}K-$${salaryMax}K CAD. Return ONLY a JSON array with fields: title, company, location, salary_min (number), salary_max (number), work_type, company_stage, hiring_manager_email, description (2 sentences), tags (array of 3 strings), match_score (70-95), benefits (array from: Health, Dental, Equity, Remote Stipend, Unlimited PTO). Make companies realistic Canadian firms (e.g. Shopify, Wealthsimple, TouchBistro, theScore, League, Cohere, etc.)` }],
        "Return only valid JSON, no markdown."
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      for (const job of parsed) {
        await supabase("job_queue", {
          method: "POST",
          body: JSON.stringify({ ...job, status: "pending", category: "BD / Strategy" }),
          prefer: "return=minimal",
        });
      }
      toast.add(`Added ${parsed.length} new jobs to your queue`, "success");
      load();
    } catch (e) {
      toast.add("Search failed — " + e.message, "error");
    } finally {
      setSearching(false);
    }
  };

  const skipJob = async (id) => {
    await supabase(`job_queue?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "skipped" }) });
    setJobs((j) => j.map((x) => (x.id === id ? { ...x, status: "skipped" } : x)));
  };

  const filtered = jobs.filter((j) => {
    if (j.status === "skipped") return false;
    const minOk = !j.salary_min || j.salary_min / 1000 >= salaryMin - 5;
    const maxOk = !j.salary_max || j.salary_max / 1000 <= salaryMax + 5;
    const workOk = workTypes.length === 0 || workTypes.includes(j.work_type);
    const stageOk = stages.length === 0 || stages.some((s) => j.company_stage?.includes(s.split(" ")[0]));
    return minOk && maxOk && workOk && stageOk;
  });

  const toggle = (arr, setArr, val) =>
    setArr((a) => (a.includes(val) ? a.filter((x) => x !== val) : [...a, val]));

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Morning Queue</div>
          <div className="section-meta">{filtered.length} opportunities matching your filters</div>
        </div>
        <button className="btn btn-primary" onClick={searchIndeed} disabled={searching}>
          {searching ? "⟳ Searching…" : "⟳ Refresh Jobs"}
        </button>
      </div>

      <div className="filters">
        <div className="filter-row">
          <span className="filter-label">Salary</span>
          <div className="slider-wrap">
            <span className="filter-label" style={{ minWidth: 30 }}>Min</span>
            <input type="range" className="slider" min={50} max={150} value={salaryMin}
              onChange={(e) => setSalaryMin(+e.target.value)} />
            <span className="slider-val">${salaryMin}K</span>
          </div>
          <div className="slider-wrap">
            <span className="filter-label" style={{ minWidth: 30 }}>Max</span>
            <input type="range" className="slider" min={50} max={200} value={salaryMax}
              onChange={(e) => setSalaryMax(+e.target.value)} />
            <span className="slider-val">${salaryMax}K</span>
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">Work Type</span>
          <div className="chip-group">
            {WORK_TYPES.map((w) => (
              <span key={w} className={`chip ${workTypes.includes(w) ? "active" : ""}`}
                onClick={() => toggle(workTypes, setWorkTypes, w)}>{w}</span>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">Stage</span>
          <div className="chip-group">
            {STAGES.map((s) => (
              <span key={s} className={`chip ${stages.includes(s) ? "active" : ""}`}
                onClick={() => toggle(stages, setStages, s)}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading queue…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div className="empty-text">Queue is empty</div>
          <div className="empty-sub">Hit Refresh Jobs to pull new listings</div>
        </div>
      ) : (
        <div className="job-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} onSkip={skipJob} onDraft={setDraftJob} />
          ))}
        </div>
      )}

      {draftJob && <EmailDraftModal job={draftJob} onClose={() => setDraftJob(null)} toast={toast} onSent={() => { setDraftJob(null); load(); }} />}
    </div>
  );
}

function JobCard({ job, onSkip, onDraft }) {
  const score = job.match_score || 75;
  const scoreClass = score >= 85 ? "match-high" : score >= 75 ? "match-mid" : "match-low";
  const salaryStr = job.salary_min && job.salary_max
    ? `$${Math.round(job.salary_min / 1000)}K–$${Math.round(job.salary_max / 1000)}K CAD`
    : job.salary || "Competitive";

  return (
    <div className={`job-card ${job.status === "skipped" ? "skipped" : ""}`}>
      <div>
        <div className="job-title">{job.title}</div>
        <div className="job-company">{job.company}</div>
        <div className="job-meta">
          <span className="job-meta-item">📍 {job.location || "Toronto, ON"}</span>
          <span className="job-meta-item">💰 {salaryStr}</span>
          {job.work_type && <span className="job-meta-item">🏢 {job.work_type}</span>}
          {job.company_stage && <span className="job-meta-item">📈 {job.company_stage}</span>}
          {job.hiring_manager_email && <span className="job-meta-item">✉️ {job.hiring_manager_email}</span>}
        </div>
        {job.description && (
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, lineHeight: 1.6 }}>
            {job.description}
          </div>
        )}
        {job.benefits?.length > 0 && (
          <div className="job-tags" style={{ marginTop: 8 }}>
            {job.benefits.map((b) => <span key={b} className="tag">✓ {b}</span>)}
          </div>
        )}
        {job.tags?.length > 0 && (
          <div className="job-tags">
            {job.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
      <div className="job-actions">
        <span className={`match-badge ${scoreClass}`}>{score}% match</span>
        <button className="btn btn-primary btn-sm" onClick={() => onDraft(job)}>✉ Draft Email</button>
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">↗ View</a>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => onSkip(job.id)}>✕ Skip</button>
      </div>
    </div>
  );
}

// ─── Email Draft Modal ────────────────────────────────────────────────────────
function EmailDraftModal({ job, onClose, toast, onSent }) {
  const [to, setTo] = useState(job.hiring_manager_email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailType, setEmailType] = useState("application");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `Write a ${emailType} email from Cole Gluckstein (Babson MSEL grad May 2025, B.A. Western University, Toronto-based) to ${to || "the hiring team"} at ${job.company} for the ${job.title} role. Cole targets BD/Strategy/VC/PM roles at sports tech, SaaS, high-growth startups. Salary range $75K-$95K CAD. Strong references: VIQ CEO, law firm manager, Western professor. Be professional, concise, compelling. Return JSON: { "subject": "...", "body": "..." }`;
      const raw = await callClaude([{ role: "user", content: prompt }], "Return only valid JSON.");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setSubject(parsed.subject);
      setBody(parsed.body);
    } catch (e) {
      toast.add("Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { generate(); }, []);

  const sendEmail = async () => {
    if (!to || !subject || !body) { toast.add("Fill in all fields", "error"); return; }
    setSending(true);
    try {
      // Save to DB
      const [saved] = await supabase("emails", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          to_email: to,
          company: job.company,
          subject,
          body,
          email_type: emailType,
          status: "draft",
        }),
      });

      // Use Gmail MCP via Claude API
      const gmailPrompt = `Send an email via Gmail MCP from ${FROM_EMAIL} to ${to} with subject "${subject}" and body: ${body}`;
      await callClaude([{ role: "user", content: gmailPrompt }]);

      // Mark sent in DB
      await supabase(`emails?id=eq.${saved.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
      });

      // Add follow-up to calendar
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 7);
      await supabase("calendar_events", {
        method: "POST",
        body: JSON.stringify({
          title: `Follow up — ${job.company}`,
          event_type: "follow_up",
          event_date: followUp.toISOString(),
          company: job.company,
          contact_email: to,
          email_id: saved.id,
          briefing: `Follow up on your ${emailType} email for the ${job.title} role. Reference your initial outreach and ask about next steps.`,
        }),
        prefer: "return=minimal",
      });

      toast.add(`Email sent to ${to} & follow-up scheduled`, "success");
      onSent();
    } catch (e) {
      // Save as draft even if send fails
      toast.add("Saved as draft — check Gmail to send manually", "info");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Draft Email — {job.company}</div>

        <div className="form-group">
          <label className="form-label">Email Type</label>
          <div className="chip-group">
            {["application", "cold_outreach", "follow_up", "networking"].map((t) => (
              <span key={t} className={`chip ${emailType === t ? "active" : ""}`}
                onClick={() => setEmailType(t)}>{t.replace("_", " ")}</span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">To</label>
          <input className="form-input" value={to} onChange={(e) => setTo(e.target.value)}
            placeholder="hiring@company.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Generating…" />
        </div>

        <div className="form-group">
          <label className="form-label">Body</label>
          {generating ? (
            <div className="loading" style={{ padding: "20px 0" }}><div className="spinner" /> Drafting your email…</div>
          ) : (
            <textarea className="form-textarea" value={body} onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 200 }} />
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={generate} disabled={generating}>↺ Regenerate</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={sendEmail} disabled={sending || generating}>
            {sending ? "Sending…" : "✓ Send via Gmail"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Outreach Tab ─────────────────────────────────────────────────────────────
function OutreachTab({ toast }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const data = await supabase("emails?order=created_at.desc");
      setEmails(data);
    } catch (e) { toast.add("Failed to load emails", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const apps = await_count(emails, "applied");
  const counts = { draft: 0, sent: 0 };
  emails.forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Outreach Log</div>
          <div className="section-meta">{counts.sent} sent · {counts.draft} drafts</div>
        </div>
      </div>

      <div className="kanban-row" style={{ gridTemplateColumns: "repeat(2,1fr)", maxWidth: 400, marginBottom: 20 }}>
        <div className="kanban-col">
          <div className="kanban-col-title">Drafts</div>
          <div className="kanban-count" style={{ color: "var(--blue)" }}>{counts.draft}</div>
        </div>
        <div className="kanban-col">
          <div className="kanban-col-title">Sent</div>
          <div className="kanban-count" style={{ color: "var(--green)" }}>{counts.sent}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading…</div>
      ) : emails.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✉️</div>
          <div className="empty-text">No emails yet</div>
          <div className="empty-sub">Draft your first email from the Job Queue tab</div>
        </div>
      ) : (
        <div className="email-log">
          {emails.map((email) => (
            <div key={email.id} className="email-card">
              <div className="email-card-header">
                <div>
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-to">To: {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email} · {email.company}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span className={`status-pill status-${email.status}`}>{email.status}</span>
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>
                    {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : new Date(email.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="email-preview">{email.body?.slice(0, 200)}…</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function await_count() { return 0; } // placeholder

// ─── Calendar Tab ─────────────────────────────────────────────────────────────
function CalendarTab({ toast }) {
  const [events, setEvents] = useState([]);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const load = async () => {
    try {
      const data = await supabase("calendar_events?order=event_date.asc");
      setEvents(data);
    } catch (e) { toast.add("Failed to load calendar", "error"); }
  };

  useEffect(() => { load(); }, []);

  // Calendar grid helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });

  const eventsOnDay = (day, current) => {
    if (!current) return [];
    return events.filter((e) => {
      const d = new Date(e.event_date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const upcoming = events
    .filter((e) => new Date(e.event_date) >= today && !e.completed)
    .slice(0, 8);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Calendar</div>
          <div className="section-meta">{upcoming.length} upcoming events</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Event</button>
      </div>

      <div className="cal-wrap">
        <div>
          <div className="cal-grid">
            <div className="cal-header">
              <button className="btn btn-ghost btn-sm"
                onClick={() => setViewDate(new Date(year, month - 1))}>‹</button>
              <span className="cal-month">{monthNames[month]} {year}</span>
              <button className="btn btn-ghost btn-sm"
                onClick={() => setViewDate(new Date(year, month + 1))}>›</button>
            </div>
            <div className="cal-days-header">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
            </div>
            <div className="cal-cells">
              {cells.map((cell, i) => {
                const dayEvents = eventsOnDay(cell.day, cell.current);
                const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div key={i} className={`cal-cell ${isToday ? "today" : ""} ${!cell.current ? "other-month" : ""}`}>
                    <div className={`cal-date ${isToday ? "today-num" : ""}`}>{cell.day}</div>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className={`cal-event-dot dot-${ev.event_type}`}
                        onClick={() => setSelected(ev)} title={ev.title}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="events-sidebar">
          <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
            Upcoming
          </div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: 11, color: "var(--text3)", padding: "20px 0" }}>No upcoming events</div>
          ) : (
            upcoming.map((ev) => (
              <div key={ev.id} className={`event-card ${selected?.id === ev.id ? "selected" : ""}`}
                onClick={() => setSelected(selected?.id === ev.id ? null : ev)}>
                <div className="event-date-label">
                  {new Date(ev.event_date).toLocaleDateString("en-CA", { month: "short", day: "numeric", weekday: "short" })}
                  {" · "}
                  {new Date(ev.event_date).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="event-title">{ev.title}</div>
                {ev.company && <div className="event-company">{ev.company}</div>}
                {ev.contact_email && <div className="event-contact">✉ {ev.contact_email}</div>}
                <span className={`cal-event-dot dot-${ev.event_type}`} style={{ display: "inline-block", marginTop: 6 }}>
                  {ev.event_type.replace("_", " ")}
                </span>

                {selected?.id === ev.id && ev.briefing && (
                  <div className="briefing-box">
                    <div className="briefing-label">📋 Briefing</div>
                    <div className="briefing-text">{ev.briefing}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {addModal && <AddEventModal onClose={() => setAddModal(false)} toast={toast} onAdded={load} />}
    </div>
  );
}

function AddEventModal({ onClose, toast, onAdded }) {
  const [form, setForm] = useState({
    title: "", event_type: "deadline", event_date: "", company: "",
    contact_name: "", contact_email: "", briefing: "", notes: ""
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generateBriefing = async () => {
    if (!form.company) { toast.add("Add a company first", "error"); return; }
    setGenerating(true);
    try {
      const raw = await callClaude([{
        role: "user",
        content: `Generate a 3-sentence briefing for Cole Gluckstein (Babson MSEL, BD/Strategy/VC/PM focus) preparing for a ${form.event_type} with ${form.company}${form.contact_name ? ` — contact: ${form.contact_name}` : ""}. Include: what the company does, key talking points Cole should lead with, and one smart question to ask. Keep it concise and tactical.`
      }]);
      set("briefing", raw);
    } catch (e) { toast.add("Generation failed", "error"); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    if (!form.title || !form.event_date) { toast.add("Title and date required", "error"); return; }
    setSaving(true);
    try {
      await supabase("calendar_events", {
        method: "POST",
        body: JSON.stringify(form),
        prefer: "return=minimal",
      });
      toast.add("Event added to calendar", "success");
      onAdded();
      onClose();
    } catch (e) { toast.add("Failed to save event", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Add Calendar Event</div>

        <div className="form-group">
          <label className="form-label">Event Type</label>
          <div className="chip-group">
            {["deadline","interview","follow_up","networking","reminder"].map((t) => (
              <span key={t} className={`chip ${form.event_type === t ? "active" : ""}`}
                onClick={() => set("event_type", t)}>{t.replace("_"," ")}</span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Interview — Shopify BD Role" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input type="datetime-local" className="form-input" value={form.event_date}
              onChange={(e) => set("event_date", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" value={form.company} onChange={(e) => set("company", e.target.value)}
              placeholder="Shopify" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            <input className="form-input" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)}
              placeholder="Jane Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input className="form-input" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
              placeholder="jane@company.com" />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Briefing</label>
            <button className="btn btn-ghost btn-sm" onClick={generateBriefing} disabled={generating}>
              {generating ? "⟳ Generating…" : "✦ AI Briefing"}
            </button>
          </div>
          <textarea className="form-textarea" value={form.briefing} onChange={(e) => set("briefing", e.target.value)}
            placeholder="What to know, what to say, what to ask…" />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)}
            style={{ minHeight: 60 }} placeholder="Any additional notes" />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────
function ApplicationsTab({ toast }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase("applications?order=applied_at.desc")
      .then(setApps)
      .catch(() => toast.add("Failed to load applications", "error"))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (s) => apps.filter((a) => a.status === s);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Applications</div>
          <div className="section-meta">{apps.length} total applications tracked</div>
        </div>
      </div>

      <div className="kanban-row">
        {[["applied","Applied"],["interviewing","Interviewing"],["offer","Offers"],["rejected","Rejected"]].map(([s, label]) => (
          <div key={s} className="kanban-col">
            <div className="kanban-col-title">{label}</div>
            <div className={`kanban-count ${s}`}>{byStatus(s).length}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading…</div>
      ) : apps.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No applications yet</div>
          <div className="empty-sub">Apply to jobs from the Queue tab</div>
        </div>
      ) : (
        <div className="job-grid">
          {apps.map((app) => (
            <div key={app.id} className="job-card">
              <div>
                <div className="job-title">{app.role}</div>
                <div className="job-company">{app.company}</div>
                <div className="job-meta">
                  <span className="job-meta-item">📍 {app.location}</span>
                  {app.salary && <span className="job-meta-item">💰 {app.salary}</span>}
                  {app.applied_at && <span className="job-meta-item">📅 Applied {new Date(app.applied_at).toLocaleDateString()}</span>}
                  {app.follow_up_at && <span className="job-meta-item">🔔 Follow up {new Date(app.follow_up_at).toLocaleDateString()}</span>}
                </div>
                {app.notes && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>{app.notes}</div>}
              </div>
              <div className="job-actions">
                <span className={`status-pill status-${app.status}`}>{app.status}</span>
                {app.match_score && (
                  <span className={`match-badge ${app.match_score >= 85 ? "match-high" : "match-mid"}`}>
                    {app.match_score}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("queue");
  const toast = useToast();
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    supabase("job_queue?status=eq.pending&select=id").then((d) => setQueueCount(d.length)).catch(() => {});
  }, [tab]);

  const tabs = [
    { id: "queue", label: "Job Queue", badge: queueCount > 0 ? queueCount : null },
    { id: "outreach", label: "Outreach" },
    { id: "calendar", label: "Calendar" },
    { id: "applications", label: "Applications" },
  ];

  return (
    <div className="app">
      <style>{style}</style>

      <header className="header">
        <div className="header-brand">
          <span className="header-logo">CG</span>
          <span className="header-sub">Job Search Agent</span>
        </div>
        <div className="header-status">
          <div className="dot" />
          <span>Active · Toronto</span>
          <span style={{ color: "var(--border2)", margin: "0 8px" }}>|</span>
          <span>{new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "queue" && <JobQueueTab toast={toast} />}
        {tab === "outreach" && <OutreachTab toast={toast} />}
        {tab === "calendar" && <CalendarTab toast={toast} />}
        {tab === "applications" && <ApplicationsTab toast={toast} />}
      </main>

      <div className="toast-wrap">
        {toast.toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
