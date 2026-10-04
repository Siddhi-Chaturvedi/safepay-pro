import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  text: z.string().max(8000),
  image: z.string().max(8_000_000).nullable(),
  language: z.string().max(40),
});

export type ScanResult = {
  risk_score: number;
  verdict: "HIGH RISK" | "SUSPICIOUS" | "LIKELY SAFE";
  headline: string;
  pattern: string;
  category: string;
  dna: { trait: string; score: number }[];
  signals: { name: string; level: "high" | "medium" | "low"; detail: string }[];
  actions: string[];
  explanation_local: string;
  extracted_text: string;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["risk_score", "verdict", "headline", "pattern", "category", "dna", "signals", "actions", "explanation_local", "extracted_text"],
  properties: {
    risk_score: { type: "number" },
    verdict: { type: "string", enum: ["HIGH RISK", "SUSPICIOUS", "LIKELY SAFE"] },
    headline: { type: "string" },
    pattern: { type: "string" },
    category: { type: "string" },
    dna: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["trait", "score"],
        properties: { trait: { type: "string" }, score: { type: "number" } },
      },
    },
    signals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "level", "detail"],
        properties: {
          name: { type: "string" },
          level: { type: "string", enum: ["high", "medium", "low"] },
          detail: { type: "string" },
        },
      },
    },
    actions: { type: "array", items: { type: "string" } },
    explanation_local: { type: "string" },
    extracted_text: { type: "string" },
  },
};

const INSTRUCTIONS = `You are ScamShield AI, a financial fraud analyst for Indian users (Bharat).
Analyse the submitted message/screenshot/URL/call transcript (may be English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi or code-mixed like Tanglish/Hinglish).
Detect: urgency, threats, advance-fee/payment requests, UPI collect requests, OTP/PIN requests, KYC/bank/SEBI/RBI/police impersonation, unrealistic returns, fake rewards, job/loan/investment/crypto scams, suspicious URLs (lookalike domains, shorteners, non-official TLDs).
Output:
- risk_score 0-100 (calibrated; genuine bank OTP notices with no ask are low).
- headline: one punchy instruction, e.g. "DO NOT TRANSFER MONEY" or "Looks safe — still verify".
- pattern: e.g. "KYC Impersonation + Urgency + Payment Fraud".
- category: one of UPI Fraud, Investment Scam, KYC Scam, Job Scam, Loan Scam, Phishing, Lottery/Reward Scam, Impersonation, Safe.
- dna: exactly 6 traits with 0-100 scores: Impersonation, Urgency, Financial pressure, Fear manipulation, Fake reward, Link risk.
- signals: 4-7 detected signals with short detail quoting evidence.
- actions: 3-5 concrete steps (mention 1930 cyber helpline / cybercrime.gov.in / Sanchar Saathi Chakshu when risky).
- explanation_local: 2-3 sentence plain explanation written in the user's chosen language (native script).
- extracted_text: the text you read from the screenshot, or the input text trimmed to 400 chars.
Keep all other fields in English.`;

export const scanMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<ScanResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");
    if (!data.text.trim() && !data.image) throw new Error("Paste a message or upload a screenshot first.");

    const content: any[] = [
      { type: "input_text", text: `Explanation language: ${data.language}\n\nSubmitted content:\n${data.text || "(see screenshot)"}` },
    ];
    if (data.image) content.push({ type: "input_image", image_url: data.image });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content }],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
        text: { format: { type: "json_schema", name: "scan_result", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Too many scans right now — please wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits are used up for this workspace. Please add credits.");
      throw new Error(`Analysis failed (${res.status}). ${t.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    let finalText = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") out += ev.delta;
          else if (ev.type === "response.output_text.done") finalText = ev.text;
          else if (ev.type === "response.failed" || ev.type === "error")
            throw new Error(ev.response?.error?.message || ev.message || "Analysis failed.");
        } catch (e) {
          if (e instanceof Error && !(e instanceof SyntaxError)) throw e;
        }
      }
    }
    const txt = finalText || out;
    try {
      const r = JSON.parse(txt) as ScanResult;
      r.risk_score = Math.max(0, Math.min(100, Math.round(r.risk_score)));
      return r;
    } catch {
      throw new Error("The AI returned an unreadable answer. Please try again.");
    }
  });
