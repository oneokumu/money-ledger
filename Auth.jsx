import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  const switchTo = (next) => { setMode(next); setError(""); setNotice(""); };

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
      } else if (isForgot) {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setNotice("Check your email for a password reset link.");
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
        .mark{margin-bottom:14px}
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
        .switch{text-align:center;margin-top:16px;font-size:13px;color:var(--muted)}
        .switch button{border:0;background:transparent;color:var(--in);font-weight:600;cursor:pointer;padding:0;text-decoration:underline}
        .link-sm{border:0;background:transparent;color:var(--muted);font-size:11px;cursor:pointer;padding:0;text-decoration:underline}
        .msg{border-radius:8px;padding:10px 12px;font-size:12.5px;margin-bottom:14px}
        .msg.err{background:var(--out-soft);color:var(--out)}
        .msg.ok{background:#E3F1EC;color:#0E7C66}
      `}</style>
      <div className="auth-card">
        <svg className="mark" width="84" height="68" viewBox="0 0 160 130">
          <defs>
            <filter id="markBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <radialGradient id="markGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="var(--fee)" />
              <stop offset="50%" stopColor="var(--in)" />
              <stop offset="100%" stopColor="var(--out)" />
            </radialGradient>
          </defs>

          <ellipse cx="80" cy="60" rx="72" ry="58" fill="url(#markGrad)" opacity="0.4" filter="url(#markBlur)" />
          <ellipse cx="34" cy="24" rx="20" ry="13" fill="var(--fee)" opacity="0.5" filter="url(#markBlur)" transform="rotate(-18 34 24)" />
          <ellipse cx="128" cy="26" rx="20" ry="13" fill="var(--out)" opacity="0.45" filter="url(#markBlur)" transform="rotate(15 128 26)" />

          <path d="M14 118 C36 78 58 76 76 82 L92 88 C100 91 106 88 108 82" fill="none" stroke="var(--ink-2)" strokeWidth="20" strokeLinecap="round" />
          <path d="M146 118 C124 78 102 76 84 82 L68 88 C60 91 54 88 52 82" fill="none" stroke="var(--ink)" strokeWidth="20" strokeLinecap="round" />

          <ellipse cx="80" cy="83" rx="17" ry="12" fill="#E7B896" />
          <path d="M66 80 q14 -10 28 0" fill="none" stroke="#C99873" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h1>Money Ledger</h1>
        <div className="sub">{isSignup ? "Create your account" : isForgot ? "Reset your password" : "Log in"}</div>

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
          {!isForgot && (
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="f" style={{ margin: 0 }}>Password</label>
                {!isSignup && (
                  <button type="button" className="link-sm" onClick={() => switchTo("forgot")}>Forgot password?</button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" style={{ marginTop: 6 }} />
            </div>
          )}
          <button className="save" type="submit" disabled={busy}>
            {busy ? "Please wait…" : isSignup ? "Create account" : isForgot ? "Send reset link" : "Log in"}
          </button>
        </form>

        <div className="switch">
          {isSignup ? (
            <>Already have an account? <button onClick={() => switchTo("login")}>Log in</button></>
          ) : isForgot ? (
            <>Remembered it? <button onClick={() => switchTo("login")}>Log in</button></>
          ) : (
            <>New here? <button onClick={() => switchTo("signup")}>Create an account</button></>
          )}
        </div>
      </div>
    </div>
  );
}
