import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (isSignup) {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (err) throw err;
        setNotice("Account created. Check your email to confirm, then log in.");
        setMode("login");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
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
          --line:#DCDFD9; --muted:#6B7B85; --out:#B0413E; --out-soft:#F7E7E4;
          background:var(--paper); color:var(--ink); font-family:'Inter',system-ui,sans-serif;
        }
        .ml-root *{box-sizing:border-box}
        .auth-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:28px;width:100%;max-width:360px}
        .auth-card h1{font-family:'Bricolage Grotesque','Inter',sans-serif;font-weight:800;font-size:24px;margin:0 0 4px;letter-spacing:-.02em}
        .auth-card .sub{font-size:12px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:22px}
        label.f{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 6px}
        .field{margin-bottom:14px}
        input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;font:400 14px 'Inter';color:var(--ink)}
        input:focus{outline:2px solid var(--ink);outline-offset:1px}
        .save{width:100%;border:0;border-radius:9px;padding:13px;font:700 14px 'Inter';color:#fff;cursor:pointer;background:var(--ink);margin-top:6px}
        .save:disabled{opacity:.5;cursor:not-allowed}
        .switch{text-align:center;margin-top:16px;font-size:13px;color:var(--muted)}
        .switch button{border:0;background:transparent;color:var(--ink);font-weight:600;cursor:pointer;padding:0;text-decoration:underline}
        .msg{border-radius:8px;padding:10px 12px;font-size:12.5px;margin-bottom:14px}
        .msg.err{background:var(--out-soft);color:var(--out)}
        .msg.ok{background:#E3F1EC;color:#0E7C66}
      `}</style>
      <div className="auth-card">
        <h1>Money Ledger</h1>
        <div className="sub">{isSignup ? "Create your account" : "Log in"}</div>

        {error && <div className="msg err">{error}</div>}
        {notice && <div className="msg ok">{notice}</div>}

        <form onSubmit={submit}>
          {isSignup && (
            <div className="field">
              <label className="f">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
          )}
          <div className="field">
            <label className="f">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label className="f">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
          </div>
          <button className="save" type="submit" disabled={busy}>
            {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="switch">
          {isSignup ? (
            <>Already have an account? <button onClick={() => { setMode("login"); setError(""); setNotice(""); }}>Log in</button></>
          ) : (
            <>New here? <button onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>Create an account</button></>
          )}
        </div>
      </div>
    </div>
  );
}
