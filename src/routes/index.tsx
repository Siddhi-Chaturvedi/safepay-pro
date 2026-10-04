import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { scanMessage, type ScanResult } from "@/lib/scan.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScamShield AI — Stop scams before you pay" },
      { name: "description", content: "Paste an SMS, WhatsApp message, link or screenshot. ScamShield AI scores the scam risk, explains why, and tells you what to do — in your language." },
      { property: "og:title", content: "ScamShield AI — Financial Safety Copilot for Bharat" },
      { property: "og:description", content: "Detect → Explain → Prevent → Verify → Report → Learn. Multilingual, multimodal scam defense." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LANGS = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi"];

const SAMPLES = [
  { label: "KYC expiry", text: "Dear customer, your SBI KYC has expired. Pay ₹9,999 immediately to avoid account suspension. Update now: http://sbi-kyc-update.in/verify" },
  { label: "Investment", text: "Congratulations! You have been selected for a ₹5 lakh investment opportunity with 40% monthly returns. Pay ₹25,000 processing fee immediately. Your account will be blocked if payment is not completed." },
  { label: "Tanglish", text: "Sir unga KYC expire aagiduchu, immediately ₹5,000 pay pannunga illana account block aagidum. Link: bit.ly/kyc-tn" },
  { label: "Fake SEBI call", text: "Call transcript: 'Hello, I am calling from SEBI head office. Your demat account is under investigation for money laundering. To avoid arrest, transfer your holdings to the safe account we provide and share the OTP you receive.'" },
  { label: "Genuine OTP", text: "123456 is your OTP for login to HDFC Bank NetBanking. Do not share it with anyone. -HDFC Bank" },
];

const STEPS = ["Language & script", "Intent", "Links & domains", "Payment request", "Impersonation", "Behavioural signals"];

function Index() {
  const scan = useServerFn(scanMessage);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [lang, setLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), 700);
    return () => clearInterval(t);
  }, [loading]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > 5_000_000) return setError("Screenshot must be under 5 MB.");
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const run = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = await scan({ data: { text, image, language: lang } });
      setResult(r);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Shield />
          <span className="font-display text-xl font-semibold tracking-tight">ScamShield<span className="text-primary"> AI</span></span>
        </div>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#scan" className="hover:text-foreground">Scan</a>
          <a href="#intel" className="hover:text-foreground">Intelligence</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Financial safety copilot · Made for Bharat</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
          Stop the scam <em className="font-normal text-primary">before</em> you pay.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Paste any SMS, WhatsApp message, link or call transcript — or drop a screenshot. Get a risk score, the Scam DNA behind it, and exactly what to do next, in your language.
        </p>
        <div className="mt-8 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
          {["Detect", "Explain", "Prevent", "Verify", "Report", "Learn"].map((s, i) => (
            <span key={s} className="rounded-full border px-3 py-1">{String(i + 1).padStart(2, "0")} {s}</span>
          ))}
        </div>
      </section>

      <section id="scan" className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-5">
        <div className="panel p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Before You Pay check</h2>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the suspicious message, URL, UPI request or call transcript here…"
            rows={7}
            className="mt-4 w-full resize-none rounded-xl border bg-background/60 p-4 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button key={s.label} onClick={() => setText(s.text)} className="rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground">
                Try: {s.label}
              </button>
            ))}
          </div>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
            className="mt-4 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition hover:border-primary"
          >
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {image ? (
              <img src={image} alt="Uploaded screenshot" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-secondary font-mono text-2xl text-primary">+</div>
            )}
            <div className="flex-1 text-sm">
              <div className="font-semibold">{image ? "Screenshot attached" : "Drop a screenshot"}</div>
              <div className="text-muted-foreground">WhatsApp, SMS, ads, payment pages — we read the text for you.</div>
            </div>
            {image && (
              <button onClick={(e) => { e.preventDefault(); setImage(null); }} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
            )}
          </label>

          <button
            onClick={run}
            disabled={loading || (!text.trim() && !image)}
            className="mt-5 w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground shadow-[var(--glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analysing…" : "Scan for scams"}
          </button>
          {error && <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        </div>

        <div className="panel relative overflow-hidden p-6 lg:col-span-2">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Scan engine</h3>
            {loading ? (
              <div className="relative mt-6 space-y-3">
                <div className="animate-scanline absolute inset-x-0 h-px bg-primary shadow-[0_0_20px_2px] shadow-primary" />
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-3 font-mono text-sm transition ${i < step ? "text-foreground" : "text-muted-foreground/50"}`}>
                    <span className={i < step ? "text-safe" : ""}>{i < step ? "✓" : "○"}</span> {s}
                  </div>
                ))}
              </div>
            ) : result ? (
              <Gauge score={result.risk_score} verdict={result.verdict} />
            ) : (
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <p>Signals we check on every message:</p>
                <ul className="space-y-2 font-mono text-xs">
                  {["Urgency & threats", "Advance fee / UPI collect", "OTP / PIN requests", "Bank · SEBI · RBI impersonation", "Unrealistic returns", "Lookalike & shortened links", "Code-mixed regional language"].map((x) => (
                    <li key={x} className="flex gap-2"><span className="text-primary">▸</span>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {result && <Result r={result} refEl={resultRef} lang={lang} />}

      <Intel />

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-4xl font-semibold">How it protects you</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Multimodal input", "Text, links, transcripts and screenshots are read and understood together — not just URL checks."],
            ["Explainable risk", "Every score comes with the exact signals and quoted evidence, plus a Scam DNA profile."],
            ["Real intervention", "Clear stop/verify/report steps with India’s 1930 helpline and cybercrime.gov.in."],
          ].map(([t, d]) => (
            <div key={t} className="panel p-6">
              <h3 className="font-display text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center font-mono text-xs text-muted-foreground">ScamShield AI gives guidance, not a guarantee. When in doubt, call 1930.</p>
      </section>
    </div>
  );
}

function tone(score: number) {
  return score >= 70 ? "danger" : score >= 40 ? "warn" : "safe";
}

function Gauge({ score, verdict }: { score: number; verdict: string }) {
  const t = tone(score);
  const color = `var(--${t})`;
  const C = 2 * Math.PI * 70;
  return (
    <div className="mt-4 flex flex-col items-center">
      <svg viewBox="0 0 180 180" className="h-56 w-56 -rotate-90">
        <circle cx="90" cy="90" r="70" fill="none" stroke="var(--muted)" strokeWidth="14" />
        <circle cx="90" cy="90" r="70" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div className="-mt-40 mb-20 text-center">
        <div className="font-display text-6xl font-extrabold" style={{ color }}>{score}</div>
        <div className="font-mono text-xs text-muted-foreground">/ 100</div>
      </div>
      <div className="rounded-full px-4 py-1.5 font-mono text-sm font-semibold" style={{ color, background: `color-mix(in oklab, ${color} 15%, transparent)` }}>
        {verdict}
      </div>
    </div>
  );
}

function Result({ r, refEl, lang }: { r: ScanResult; refEl: React.RefObject<HTMLDivElement | null>; lang: string }) {
  const t = tone(r.risk_score);
  const color = `var(--${t})`;
  const [copied, setCopied] = useState(false);
  const report = `ScamShield AI report\nRisk: ${r.risk_score}/100 (${r.verdict})\nPattern: ${r.pattern}\nCategory: ${r.category}\n\nMessage:\n${r.extracted_text}`;
  return (
    <section ref={refEl} className="mx-auto max-w-6xl scroll-mt-6 px-6 pb-16">
      <div className="panel overflow-hidden">
        <div className="p-8" style={{ background: `linear-gradient(120deg, color-mix(in oklab, ${color} 22%, transparent), transparent 70%)` }}>
          <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color }}>{r.category} · {r.risk_score}/100</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">{r.headline}</h2>
          <p className="mt-3 text-muted-foreground">Detected pattern: <span className="text-foreground">{r.pattern}</span></p>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Scam DNA</h3>
            <div className="mt-4 space-y-4">
              {r.dna.map((d) => {
                const c = `var(--${tone(d.score)})`;
                return (
                  <div key={d.trait}>
                    <div className="flex justify-between text-sm"><span>{d.trait}</span><span className="font-mono" style={{ color: c }}>{Math.round(d.score)}%</span></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="animate-grow h-full rounded-full" style={{ width: `${d.score}%`, background: c }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl border p-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">In {lang}</h3>
              <p className="mt-2 text-lg leading-relaxed">{r.explanation_local}</p>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Why — signals found</h3>
            <ul className="mt-4 space-y-3">
              {r.signals.map((s, i) => {
                const c = s.level === "high" ? "var(--danger)" : s.level === "medium" ? "var(--warn)" : "var(--safe)";
                return (
                  <li key={i} className="flex gap-3 rounded-xl border bg-background/40 p-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.detail}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="border-t p-8">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">What to do now</h3>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {r.actions.map((a, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-secondary p-4">
                <span className="font-display text-2xl font-bold text-primary">{i + 1}</span>
                <span className="text-sm">{a}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="tel:1930" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Call 1930 helpline</a>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="rounded-xl border px-5 py-3 text-sm font-semibold hover:border-primary">Report on cybercrime.gov.in</a>
            <a href="https://sancharsaathi.gov.in/sfc/" target="_blank" rel="noreferrer" className="rounded-xl border px-5 py-3 text-sm font-semibold hover:border-primary">Flag on Chakshu</a>
            <button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-xl border px-5 py-3 text-sm font-semibold hover:border-primary">
              {copied ? "Copied ✓" : "Copy report"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intel() {
  const cats = [["UPI Fraud", 31], ["Investment Scam", 24], ["KYC Scam", 18], ["Job Scam", 12], ["Loan Scam", 9], ["Phishing", 6]] as const;
  const sigs = ["Urgency", "Fake authority", "Payment request", "Unrealistic returns", "OTP request"];
  return (
    <section id="intel" className="mx-auto max-w-6xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">India scam intelligence</p>
      <h2 className="mt-2 font-display text-4xl font-semibold">What Bharat is facing</h2>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Top scam categories</h3>
          <div className="mt-5 space-y-4">
            {cats.map(([n, v]) => (
              <div key={n} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm">
                <span>{n}</span>
                <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="animate-grow h-full rounded-full bg-primary" style={{ width: `${v * 3}%` }} /></div>
                <span className="text-right font-mono text-muted-foreground">{v}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Most common signals</h3>
          <ol className="mt-5 space-y-3">
            {sigs.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="font-display text-3xl font-bold text-primary/70">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">Illustrative demo distribution.</p>
    </section>
  );
}

function Shield() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="var(--primary)" />
      <path d="m8.5 12 2.5 2.5 4.5-5" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
