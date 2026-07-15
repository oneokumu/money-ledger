import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      onDone();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ml-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap');
        .ml-root{
          --ink:#11212E; --ink-2:#1D3446; --paper:#F4F5F2; --card:#FFFFFF;
          --line:#DCDFD9; --muted:#6B7B85;
          --in:#0E7C66; --out:#B0413E; --out-soft:#F7E7E4; --fee:#B07C1E;
          color:var(--ink); font-family:'Inter',system-ui,sans-serif;
          background:
            radial-gradient(1100px 900px at 8% 0%, #d9f0e4 0%, rgba(217,240,228,.45) 40%, transparent 80%),
            radial-gradient(1100px 900px at 100% 15%, #fbe6cd 0%, rgba(251,230,205,.45) 40%, transparent 80%),
            radial-gradient(1100px 900px at 88% 100%, #f6d9d2 0%, rgba(246,217,210,.45) 40%, transparent 80%),
            radial-gradient(1100px 900px at 0% 100%, #d7e8f2 0%, rgba(215,232,242,.45) 40%, transparent 80%),
            var(--paper);
        }
        .ml-root *{box-sizing:border-box}
        .auth-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:28px;width:100%;max-width:360px;box-shadow:0 20px 50px -25px rgba(17,33,46,.35);position:relative;overflow:hidden}
        .auth-card:before{content:"";position:absolute;left:0;top:0;right:0;height:5px;background:linear-gradient(90deg,var(--in),var(--fee),var(--out))}
        .auth-card h1{
          font-family:'Bricolage Grotesque','Inter',sans-serif;font-weight:800;font-size:26px;margin:0 0 4px;letter-spacing:-.02em;
          background:linear-gradient(90deg,var(--ink) 30%,var(--in) 65%,var(--fee) 100%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
        }
        .auth-card .sub{font-size:12px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:22px}
        label.f{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 6px}
        .field{margin-bottom:14px}
        input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;font:400 14px 'Inter';color:var(--ink)}
        input:focus{outline:2px solid var(--in);outline-offset:1px}
        .save{width:100%;border:0;border-radius:9px;padding:13px;font:700 14px 'Inter';color:#fff;cursor:pointer;margin-top:6px;background:linear-gradient(90deg,var(--ink),var(--ink-2) 60%,var(--in));box-shadow:0 8px 18px -8px rgba(14,124,102,.55)}
        .save:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
        .msg{border-radius:8px;padding:10px 12px;font-size:12.5px;margin-bottom:14px}
        .msg.err{background:var(--out-soft);color:var(--out)}
      `}</style>
      <div className="auth-card">
        <h1>Money Ledger</h1>
        <div className="sub">Set a new password</div>

        {error && <div className="msg err">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="f">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" autoFocus />
          </div>
          <button className="save" type="submit" disabled={busy}>
            {busy ? "Please wait…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
