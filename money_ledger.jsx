import React, { useState, useEffect, useMemo, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Money Ledger — daily logging of money sent, received, and fees      */
/* ------------------------------------------------------------------ */

const STORE_KEY = "moneyledger:v1";

const OUT_PURPOSES = [
  "Rent", "Food & shopping", "Transport", "Airtime & data", "Utility bills",
  "School fees", "Family support", "Business stock", "Loan repayment",
  "Savings", "Medical", "Other",
];

const IN_SOURCES = [
  "Salary", "Business sales", "Client payment", "Family", "Loan received",
  "Refund", "Savings withdrawal", "Gift", "Other",
];

const CURRENCIES = ["KES", "UGX", "TZS", "NGN", "USD", "EUR", "GBP", "ZAR"];

/* ---------------------------- date helpers ------------------------- */
const todayISO = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function startOfWeek(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function inPeriod(iso, period, ref = new Date()) {
  if (period === "all") return true;
  const d = parseISO(iso);
  if (period === "week") {
    const s = startOfWeek(ref);
    const e = new Date(s);
    e.setDate(e.getDate() + 7);
    return d >= s && d < e;
  }
  if (period === "month")
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  if (period === "year") return d.getFullYear() === ref.getFullYear();
  return true;
}
const daysBetween = (a, b) => Math.round((b - a) / 86400000);

function refCode() {
  return "TX" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ------------------------------ app -------------------------------- */
export default function MoneyLedger() {
  const [loaded, setLoaded] = useState(false);
  const [txs, setTxs] = useState([]);
  const [settings, setSettings] = useState({ currency: "KES", reminderTime: "20:00" });
  const [tab, setTab] = useState("log");
  const [toast, setToast] = useState("");
  const firstSave = useRef(true);

  /* load */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data) {
        setTxs(data.txs || []);
        setSettings((s) => ({ ...s, ...(data.settings || {}) }));
      }
    } catch (e) {
      /* first run — nothing stored yet */
    }
    setLoaded(true);
  }, []);

  /* save */
  useEffect(() => {
    if (!loaded) return;
    if (firstSave.current) { firstSave.current = false; return; }
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ txs, settings }));
    } catch (e) {
      setToast("Couldn't save. Try again.");
    }
  }, [txs, settings, loaded]);

  const cur = settings.currency;
  const fmt = (n) =>
    cur + " " + new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n || 0);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const addTx = (t) => { setTxs((p) => [{ ...t, id: Date.now(), ref: refCode() }, ...p]); flash(t.type === "in" ? "Money in — logged." : "Money out — logged."); };
  const delTx = (id) => setTxs((p) => p.filter((t) => t.id !== id));

  const loggedToday = txs.some((t) => t.date === todayISO());
  const lastDate = txs.length ? txs.map((t) => t.date).sort().slice(-1)[0] : null;
  const gapDays = lastDate ? daysBetween(parseISO(lastDate), parseISO(todayISO())) : null;

  /* optional browser reminder while the app is open */
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      if (hhmm === settings.reminderTime && !loggedToday) {
        try {
          if (window.Notification && Notification.permission === "granted")
            new Notification("Log today's money", { body: "Sent, received, and fees — takes 20 seconds." });
        } catch (e) { /* notifications unavailable in this frame */ }
      }
    }, 60000);
    return () => clearInterval(id);
  }, [settings.reminderTime, loggedToday]);

  return (
    <div className="ml-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap');

        .ml-root{
          --ink:#11212E; --ink-2:#1D3446; --paper:#F4F5F2; --card:#FFFFFF;
          --line:#DCDFD9; --muted:#6B7B85;
          --in:#0E7C66; --in-soft:#E3F1EC;
          --out:#B0413E; --out-soft:#F7E7E4;
          --fee:#B07C1E; --fee-soft:#FAF0DC;
          background:var(--paper); color:var(--ink);
          font-family:'Inter',system-ui,sans-serif;
          min-height:100vh; padding:0 0 40px;
        }
        .ml-root *{box-sizing:border-box}
        .wrap{max-width:820px;margin:0 auto;padding:0 16px}
        .num{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
        .disp{font-family:'Bricolage Grotesque','Inter',sans-serif;font-weight:800;letter-spacing:-.02em}

        header.top{background:var(--ink);color:#EAF0F2;padding:22px 0 26px;margin-bottom:-14px}
        .brand{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
        .brand h1{font-size:26px;margin:0;line-height:1}
        .brand .sub{font-size:12px;color:#8FA6B2;letter-spacing:.14em;text-transform:uppercase;margin-top:6px}
        .cursel{background:transparent;color:#EAF0F2;border:1px solid #33505F;border-radius:6px;padding:6px 8px;font-size:12px;font-family:'JetBrains Mono',monospace}

        .tabs{display:flex;gap:6px;margin:22px 0 16px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:4px}
        .tabs button{flex:1;border:0;background:transparent;padding:10px 8px;border-radius:7px;font:600 13px 'Inter';color:var(--muted);cursor:pointer}
        .tabs button[data-on="1"]{background:var(--ink);color:#fff}

        .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:14px}
        .card h2{font-size:15px;margin:0 0 14px;letter-spacing:-.01em}
        .eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;font-weight:600}

        .nudge{border:1px dashed var(--ink);background:#fff;border-radius:12px;padding:16px 18px;margin-bottom:14px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}
        .nudge.done{border-style:solid;border-color:var(--in);background:var(--in-soft)}
        .nudge p{margin:0;font-size:13px;color:var(--ink-2)}
        .nudge strong{display:block;font-size:15px;margin-bottom:3px;color:var(--ink)}

        .seg{display:flex;gap:0;border:1px solid var(--line);border-radius:9px;overflow:hidden;margin-bottom:16px}
        .seg button{flex:1;border:0;padding:12px;background:#fff;font:600 13px 'Inter';color:var(--muted);cursor:pointer}
        .seg button[data-on="1"]{color:#fff}
        .seg button.in[data-on="1"]{background:var(--in)}
        .seg button.out[data-on="1"]{background:var(--out)}

        label.f{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 6px}
        input,select,textarea{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;font:400 14px 'Inter';color:var(--ink)}
        input.money{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:17px}
        input:focus,select:focus,textarea:focus{outline:2px solid var(--ink);outline-offset:1px}
        .row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px}
        .col{flex:1;min-width:140px}
        .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .chips button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 11px;font:500 12px 'Inter';color:var(--ink-2);cursor:pointer}
        .chips button[data-on="1"]{background:var(--ink);color:#fff;border-color:var(--ink)}

        .save{width:100%;border:0;border-radius:9px;padding:14px;font:700 14px 'Inter';color:#fff;cursor:pointer;background:var(--ink)}
        .save:disabled{opacity:.4;cursor:not-allowed}

        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
        .stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
        .stat .k{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
        .stat .v{font-size:20px;margin-top:6px;font-weight:700}
        .stat.in .v{color:var(--in)} .stat.out .v{color:var(--out)} .stat.fee .v{color:var(--fee)}
        .stat .s{font-size:11px;color:var(--muted);margin-top:4px}

        .bar{margin-bottom:11px}
        .bar .lab{display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px}
        .bar .lab span:last-child{font-family:'JetBrains Mono',monospace;font-weight:600}
        .track{height:8px;background:#EDEEEA;border-radius:99px;overflow:hidden}
        .fill{height:100%;border-radius:99px}

        .months{display:flex;align-items:flex-end;gap:5px;height:120px;padding-top:8px}
        .mcol{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end}
        .mbars{display:flex;gap:2px;align-items:flex-end;height:100%;width:100%;justify-content:center}
        .mbars i{width:6px;border-radius:2px 2px 0 0;display:block;min-height:2px}
        .mlab{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace}

        .slip{background:#fff;border:1px solid var(--line);border-radius:10px;padding:13px 15px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;position:relative}
        .slip:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0}
        .slip.in:before{background:var(--in)} .slip.out:before{background:var(--out)}
        .slip .body{flex:1;min-width:0}
        .slip .who{font-weight:600;font-size:14px;margin-bottom:2px}
        .slip .meta{font-size:11.5px;color:var(--muted);font-family:'JetBrains Mono',monospace}
        .slip .amt{text-align:right;white-space:nowrap}
        .slip .amt b{font-family:'JetBrains Mono',monospace;font-size:14.5px}
        .slip.in .amt b{color:var(--in)} .slip.out .amt b{color:var(--out)}
        .slip .fee{font-size:11px;color:var(--fee);font-family:'JetBrains Mono',monospace;margin-top:2px}
        .del{border:0;background:transparent;color:#B9C0C4;cursor:pointer;font-size:16px;line-height:1;padding:2px 0 0 4px}
        .del:hover{color:var(--out)}

        .empty{text-align:center;padding:34px 16px;color:var(--muted);font-size:13.5px}
        .empty b{display:block;color:var(--ink);font-size:15px;margin-bottom:5px}
        .ghost{border:1px solid var(--line);background:#fff;border-radius:8px;padding:9px 14px;font:600 12.5px 'Inter';cursor:pointer;color:var(--ink)}
        .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:20px;background:var(--ink);color:#fff;padding:11px 18px;border-radius:99px;font-size:13px;font-weight:500;z-index:50}
        @media (prefers-reduced-motion:no-preference){.toast{animation:pop .2s ease-out}}
        @keyframes pop{from{opacity:0;transform:translate(-50%,8px)}}
      `}</style>

      <header className="top">
        <div className="wrap brand">
          <div>
            <h1 className="disp">Money Ledger</h1>
            <div className="sub">Sent · Received · Fees</div>
          </div>
          <select
            className="cursel"
            value={settings.currency}
            onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
          >
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </header>

      <div className="wrap">
        <div className="tabs">
          {[["log", "Log"], ["insights", "Insights"], ["history", "History"]].map(([k, l]) => (
            <button key={k} data-on={tab === k ? "1" : "0"} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "log" && (
          <>
            <Nudge
              loggedToday={loggedToday}
              gapDays={gapDays}
              count={txs.filter((t) => t.date === todayISO()).length}
              time={settings.reminderTime}
              onTime={(v) => setSettings((s) => ({ ...s, reminderTime: v }))}
            />
            <EntryForm onAdd={addTx} cur={cur} />
            <DayStrip txs={txs} fmt={fmt} />
          </>
        )}

        {tab === "insights" && <Insights txs={txs} fmt={fmt} />}

        {tab === "history" && <History txs={txs} fmt={fmt} onDelete={delTx} cur={cur} />}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* --------------------------- daily nudge --------------------------- */
function Nudge({ loggedToday, gapDays, count, time, onTime }) {
  const ask = async () => {
    try { if (window.Notification) await Notification.requestPermission(); } catch (e) {}
  };
  return (
    <div className={"nudge" + (loggedToday ? " done" : "")}>
      <p>
        <strong>
          {loggedToday
            ? `Today is logged — ${count} ${count === 1 ? "entry" : "entries"}.`
            : "Nothing logged today yet."}
        </strong>
        {loggedToday
          ? "Add more any time the money moves."
          : gapDays == null
          ? "Start with the first amount you sent or received."
          : `Last entry was ${gapDays} ${gapDays === 1 ? "day" : "days"} ago.`}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label className="f" style={{ margin: 0 }}>Remind at</label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTime(e.target.value)}
          onFocus={ask}
          style={{ width: 110, padding: "7px 9px", fontFamily: "'JetBrains Mono',monospace" }}
        />
      </div>
    </div>
  );
}

/* --------------------------- entry form ---------------------------- */
function EntryForm({ onAdd, cur }) {
  const [type, setType] = useState("out");
  const [amount, setAmount] = useState("");
  const [cost, setCost] = useState("");
  const [party, setParty] = useState("");
  const [tag, setTag] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const isOut = type === "out";
  const tags = isOut ? OUT_PURPOSES : IN_SOURCES;
  const valid = Number(amount) > 0 && party.trim() && tag;

  const submit = () => {
    if (!valid) return;
    onAdd({
      type,
      amount: Number(amount),
      cost: isOut ? Number(cost || 0) : 0,
      party: party.trim(),
      tag,
      date,
      note: note.trim(),
    });
    setAmount(""); setCost(""); setParty(""); setTag(""); setNote(""); setDate(todayISO());
  };

  return (
    <div className="card">
      <div className="seg">
        <button className="out" data-on={isOut ? "1" : "0"} onClick={() => { setType("out"); setTag(""); }}>
          Money out
        </button>
        <button className="in" data-on={!isOut ? "1" : "0"} onClick={() => { setType("in"); setTag(""); }}>
          Money in
        </button>
      </div>

      <div className="row">
        <div className="col">
          <label className="f">Amount ({cur})</label>
          <input
            className="money num" type="number" inputMode="decimal" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {isOut && (
          <div className="col">
            <label className="f">Transaction cost ({cur})</label>
            <input
              className="money num" type="number" inputMode="decimal" placeholder="0.00"
              value={cost} onChange={(e) => setCost(e.target.value)}
            />
          </div>
        )}
        <div className="col">
          <label className="f">Date</label>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="col">
          <label className="f">{isOut ? "Sent to" : "Received from"}</label>
          <input
            placeholder={isOut ? "Name, business, or till" : "Name, employer, or client"}
            value={party} onChange={(e) => setParty(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="f">{isOut ? "Purpose" : "Source type"}</label>
        <div className="chips">
          {tags.map((t) => (
            <button key={t} data-on={tag === t ? "1" : "0"} onClick={() => setTag(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="f">Note (optional)</label>
        <input placeholder="Anything you'll want to remember later" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button className="save" disabled={!valid} onClick={submit}>
        {valid ? `Save ${isOut ? "money out" : "money in"}` : "Add amount, party, and purpose"}
      </button>
    </div>
  );
}

/* --------------------------- today strip --------------------------- */
function DayStrip({ txs, fmt }) {
  const today = txs.filter((t) => t.date === todayISO());
  if (!today.length) return null;
  const sent = today.filter((t) => t.type === "out").reduce((a, t) => a + t.amount, 0);
  const got = today.filter((t) => t.type === "in").reduce((a, t) => a + t.amount, 0);
  const fee = today.reduce((a, t) => a + (t.cost || 0), 0);
  return (
    <div className="card">
      <div className="eyebrow">Today</div>
      <div className="stats" style={{ marginBottom: 0 }}>
        <div className="stat in"><div className="k">Received</div><div className="v num">{fmt(got)}</div></div>
        <div className="stat out"><div className="k">Sent</div><div className="v num">{fmt(sent)}</div></div>
        <div className="stat fee"><div className="k">Fees</div><div className="v num">{fmt(fee)}</div></div>
      </div>
    </div>
  );
}

/* ---------------------------- insights ----------------------------- */
function Insights({ txs, fmt }) {
  const [period, setPeriod] = useState("month");
  const rows = useMemo(() => txs.filter((t) => inPeriod(t.date, period)), [txs, period]);

  const got = rows.filter((t) => t.type === "in").reduce((a, t) => a + t.amount, 0);
  const sent = rows.filter((t) => t.type === "out").reduce((a, t) => a + t.amount, 0);
  const fees = rows.reduce((a, t) => a + (t.cost || 0), 0);
  const net = got - sent - fees;

  const group = (list, key) => {
    const m = {};
    list.forEach((t) => { m[t[key]] = (m[t[key]] || 0) + t.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const byPurpose = group(rows.filter((t) => t.type === "out"), "tag");
  const bySource = group(rows.filter((t) => t.type === "in"), "tag");
  const byPerson = group(rows.filter((t) => t.type === "out"), "party").slice(0, 5);

  /* 12-month bars for the current year */
  const yr = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const set = txs.filter((t) => {
      const d = parseISO(t.date);
      return d.getFullYear() === yr && d.getMonth() === i;
    });
    return {
      i,
      in: set.filter((t) => t.type === "in").reduce((a, t) => a + t.amount, 0),
      out: set.filter((t) => t.type === "out").reduce((a, t) => a + t.amount + (t.cost || 0), 0),
    };
  });
  const peak = Math.max(1, ...months.map((m) => Math.max(m.in, m.out)));
  const MN = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  if (!txs.length)
    return (
      <div className="card empty">
        <b>No numbers to read yet.</b>
        Log a few entries and the weekly, monthly, and yearly totals appear here.
      </div>
    );

  const feeShare = sent > 0 ? (fees / sent) * 100 : 0;

  return (
    <>
      <div className="tabs" style={{ marginTop: 0 }}>
        {[["week", "This week"], ["month", "This month"], ["year", "This year"], ["all", "All time"]].map(([k, l]) => (
          <button key={k} data-on={period === k ? "1" : "0"} onClick={() => setPeriod(k)}>{l}</button>
        ))}
      </div>

      <div className="stats">
        <div className="stat in">
          <div className="k">Received</div>
          <div className="v num">{fmt(got)}</div>
          <div className="s">{rows.filter((t) => t.type === "in").length} entries</div>
        </div>
        <div className="stat out">
          <div className="k">Sent</div>
          <div className="v num">{fmt(sent)}</div>
          <div className="s">{rows.filter((t) => t.type === "out").length} entries</div>
        </div>
        <div className="stat fee">
          <div className="k">Transaction cost</div>
          <div className="v num">{fmt(fees)}</div>
          <div className="s">{feeShare.toFixed(1)}% of what you sent</div>
        </div>
        <div className="stat">
          <div className="k">Net position</div>
          <div className="v num" style={{ color: net >= 0 ? "var(--in)" : "var(--out)" }}>{fmt(net)}</div>
          <div className="s">received − sent − fees</div>
        </div>
      </div>

      <div className="card">
        <h2 className="disp">Where the money went</h2>
        {byPurpose.length ? (
          byPurpose.map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={byPurpose[0][1]} color="var(--out)" fmt={fmt} />
          ))
        ) : (
          <div className="empty" style={{ padding: 12 }}>Nothing sent in this period.</div>
        )}
      </div>

      <div className="card">
        <h2 className="disp">Where the money came from</h2>
        {bySource.length ? (
          bySource.map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={bySource[0][1]} color="var(--in)" fmt={fmt} />
          ))
        ) : (
          <div className="empty" style={{ padding: 12 }}>Nothing received in this period.</div>
        )}
      </div>

      {byPerson.length > 0 && (
        <div className="card">
          <h2 className="disp">You send the most to</h2>
          {byPerson.map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={byPerson[0][1]} color="var(--ink-2)" fmt={fmt} />
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="disp">{yr} month by month</h2>
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--in)" }}>■</span> in &nbsp;
          <span style={{ color: "var(--out)" }}>■</span> out + fees
        </div>
        <div className="months">
          {months.map((m) => (
            <div className="mcol" key={m.i}>
              <div className="mbars">
                <i style={{ height: `${(m.in / peak) * 100}%`, background: "var(--in)" }} />
                <i style={{ height: `${(m.out / peak) * 100}%`, background: "var(--out)" }} />
              </div>
              <div className="mlab">{MN[m.i]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Bar({ label, value, max, color, fmt }) {
  return (
    <div className="bar">
      <div className="lab"><span>{label}</span><span>{fmt(value)}</span></div>
      <div className="track">
        <div className="fill" style={{ width: `${Math.max(3, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

/* ----------------------------- history ----------------------------- */
function History({ txs, fmt, onDelete, cur }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const list = txs
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .filter((t) => {
      const s = (t.party + " " + t.tag + " " + (t.note || "")).toLowerCase();
      return s.includes(q.toLowerCase());
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));

  const exportCSV = () => {
    const head = ["Date", "Type", "Party", "Purpose/Source", `Amount (${cur})`, `Transaction cost (${cur})`, "Note", "Ref"];
    const body = list.map((t) => [
      t.date, t.type === "in" ? "Received" : "Sent", t.party, t.tag,
      t.amount, t.cost || 0, t.note || "", t.ref,
    ]);
    const csv = [head, ...body]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "money-ledger.csv";
    a.click();
  };

  return (
    <>
      <div className="row" style={{ alignItems: "center" }}>
        <div className="col" style={{ minWidth: 200 }}>
          <input placeholder="Search a name, purpose, or note" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select style={{ width: 130 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Everything</option>
          <option value="in">Money in</option>
          <option value="out">Money out</option>
        </select>
        <button className="ghost" onClick={exportCSV} disabled={!list.length}>Export CSV</button>
      </div>

      {list.length === 0 ? (
        <div className="card empty">
          <b>No entries here.</b>
          {txs.length ? "Try a different search." : "Head to Log and record your first transaction."}
        </div>
      ) : (
        list.map((t) => (
          <div className={"slip " + t.type} key={t.id}>
            <div className="body">
              <div className="who">
                {t.type === "in" ? "From " : "To "}{t.party}
              </div>
              <div className="meta">
                {t.date} · {t.tag} · {t.ref}
              </div>
              {t.note && <div className="meta" style={{ marginTop: 3, fontFamily: "Inter" }}>{t.note}</div>}
            </div>
            <div className="amt">
              <b>{t.type === "in" ? "+" : "−"}{fmt(t.amount)}</b>
              {t.cost > 0 && <div className="fee">fee {fmt(t.cost)}</div>}
            </div>
            <button className="del" title="Delete entry" onClick={() => onDelete(t.id)}>×</button>
          </div>
        ))
      )}
    </>
  );
}
