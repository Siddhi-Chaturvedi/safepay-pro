🛡️ ScamShield AI

An AI Financial Safety Copilot that stops people from making the wrong financial decision before they lose money.

Built for Track A: Digital Fraud & Scam Resilience.

Detect → Explain → Prevent → Verify → Report → Learn

The Problem

Modern scams don't look suspicious. A victim gets a WhatsApp message about an investment, then a call from a fake SEBI or bank officer, then a payment link, and loses ₹50,000. Most tools only say "this is a scam", often after the money is gone.

The Solution

ScamShield AI analyzes the whole context of a message (text, links, amounts, language) and gives:

A Scam Risk Score (0 to 100)
A clear explanation of why it is risky
A "Before You Pay" intervention with safe next steps
Report and learn options, feeding an anonymized scam-intelligence dashboard
Features
Feature	What it does
Risk Score	Combines 7 scam signals plus link risk into a 0 to 100 score (LOW / MEDIUM / HIGH)
Explainable results	Shows which words and signals triggered the score
Scam DNA	Bar chart of scam traits (urgency, threat, payment pressure, etc.) and a named pattern such as KYC Scam + Payment request + Urgency
Before You Pay	For HIGH risk, shows a Payment Block Recommended alert, safe steps, and Verify / Report / Learn Why buttons
Multilingual (Bharat)	Detects scam wording in English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and code-mixed text (e.g. Tamil + English)
Localized advice	Advice shown in English, Hindi, Tamil and Telugu
URL intelligence	Flags shorteners, raw IPs, risky domain endings, lookalike bank/brand domains, missing HTTPS, long or hyphenated domains
Screenshot OCR	Upload a screenshot; text is extracted and analyzed (needs Tesseract)
LLM explanation (optional)	Plain-language explanation in the chosen language using the Claude API
Scam Intelligence dashboard	Anonymized category split, top signals, scans and reports count
Scam signals detected

Urgency, Threat / Fear, Payment request, Unrealistic returns, Authority impersonation, Credential theft (OTP / PIN / remote-access apps), Secrecy / Social lure, and Suspicious link.

Tech Stack
Backend: Python 3.9+, Flask
Detection engine: Weighted multilingual pattern analysis plus URL heuristics (no model download needed, runs offline)
OCR: Pillow + pytesseract (optional)
LLM (optional): Claude API via HTTPS
Database: SQLite (auto-created)
Frontend: Single-page HTML, CSS and vanilla JavaScript
Project Structure
scamshield-ai/
├── app.py              # Flask server, detection engine, API, database
├── requirements.txt    # Python dependencies
├── README.md
└── static/
    └── index.html      # Web interface

scamshield.db is created automatically on first run.

Quick Start
1. Prerequisites
Python 3.9 or newer (on Windows, tick Add Python to PATH during install)
VS Code (optional) with the Python extension
2. Open a terminal in the project folder

The folder must directly contain app.py and static/.

3. Create and activate a virtual environment

Windows (PowerShell)

python -m venv venv
venv\Scripts\activate

If scripts are blocked, run once: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Mac / Linux

python3 -m venv venv
source venv/bin/activate
4. Install dependencies
pip install -r requirements.txt
5. Run
python app.py
6. Open the app

Type this in your browser's address bar:

http://127.0.0.1:5000

To stop the server, press Ctrl + C.

Port already in use?

Windows: $env:PORT=5001; python app.py
Mac / Linux: PORT=5001 python app.py

Then open http://127.0.0.1:5001.

How to Use
Paste an SMS / WhatsApp / email / call transcript / URL, or upload a screenshot.
Choose the advice language.
Click Analyze.
Review the score, Scam DNA, reasons, and safe next steps.
Click Report to add it to the anonymized dashboard, Verify for safe verification tips, or Learn Why for a short explanation.

Use the sample buttons (KYC scam, Tamil mix, Investment, Safe msg) to try it quickly.

Optional Setup
Claude-powered explanations

Set your API key in the same terminal before running the app.

Windows (PowerShell): $env:ANTHROPIC_API_KEY="your_key"
Mac / Linux: export ANTHROPIC_API_KEY=your_key

Optional: ANTHROPIC_MODEL to choose a model. Without a key, the app works fully using the built-in engine.

Screenshot OCR (Tesseract)
Windows: install from https://github.com/UB-Mannheim/tesseract, add it to PATH, and include Hindi and Tamil language data
Mac: brew install tesseract tesseract-lang
Linux: sudo apt install tesseract-ocr tesseract-ocr-hin tesseract-ocr-tam

Without Tesseract, pasting text still works.

API Reference
Method	Endpoint	Description
GET	/	Web interface
POST	/api/analyze	Analyze text (JSON) or a screenshot (multipart)
POST	/api/report	Mark a scan as reported
GET	/api/stats	Anonymized scam-intelligence statistics

Analyze example

POST /api/analyze
{"text": "Your KYC has expired. Pay ₹9,999 immediately.", "lang": "en"}

Response (abridged)

{
  "score": 90,
  "level": "HIGH",
  "category": "KYC Scam",
  "pattern": "KYC Scam + Payment request + Threat / Fear",
  "block_payment": true,
  "dna": [...], "signals": [...], "urls": [...], "steps": [...]
}
Privacy
Message text is never stored. Only the category, score, level, and signal names are saved.
The dashboard is built from these anonymized records only.
If you enable the Claude API, the message text is sent to that API to generate the explanation.
Troubleshooting
Problem	Fix
No such file: requirements.txt	You are in the wrong folder. Use cd into the inner folder that contains app.py
python not recognized	Reinstall Python with Add to PATH, or use py on Windows
No module named flask	Activate the venv, then run pip install -r requirements.txt
Browser shows Not Found	Check that static/index.html exists (dir static). Re-create it if missing
Page doesn't load at all	Type the URL in the address bar, not the search box. Try another port
Upload shows an OCR error	Install Tesseract (see above) or paste the text instead
Limitations
Detection is rule-based, so brand-new scam wording may be missed. The optional LLM explanation helps on unfamiliar messages.
Scam signals and the demo dashboard data are illustrative. The dashboard is seeded with demo data on first run and is not real national statistics.
This is a decision-support tool, not a guarantee. Always verify through official channels.
Roadmap
Trained multilingual classifier alongside the rules
Live domain-age and reputation lookups
Browser extension and WhatsApp share-sheet integration
Voice-call transcript analysis
More regional-language advice and voice output
Disclaimer

ScamShield AI is a hackathon prototype for awareness and prevention. It does not replace official fraud-reporting channels or professional advice.
