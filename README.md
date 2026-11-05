# BED 1-17 | EPROM / WEPCO 3D Solar Hybrid Dashboard

A professional interactive engineering viewer and investment dashboard for the BED 1-17 ESP hybrid solar project. V4 includes vendor-inspired equipment detailing, luminous in-tray cable power flow, 17-second 24-hour animated playback and full-year / selected-day generator-off statistics derived from a representative 8,760-hour dispatch model. This is a **conceptual engineering visualization**, not a construction-grade digital twin or live SCADA.

## Live website

**Production:** https://wepco-bed-1-17-solar-hybrid-digital-twin-w562jt.v2.appdeploy.ai/

**Source control:** https://github.com/Elsharnouby-87/wepco-esp-3d

## Run locally

The site uses a Three.js ESM import and must be bundled with Vite (opening `index.html` directly or serving raw sources with a simple static server will not resolve the bare `three` import):

```bash
npm install
npm run dev
```

Use the local URL printed by Vite. For a production build, run `npm run build` and `npm run preview`.

## GitHub Pages

A Pages workflow builds this Vite application into `dist/` and uploads the compiled artifact. Enable GitHub Pages with **Settings → Pages → Source: GitHub Actions**, if it is not already enabled, and inspect the workflow result. Only publish approved, non-sensitive project information; a public site exposes the model assumptions and financial summary to visitors. AppDeploy and GitHub Pages are separate deployment targets and may have different publishing statuses.

## Data basis and model caution

**Financial base case:** `WEPCO ESP Offer(2).xlsx` — Dashboard, 25Y Cash Flow, Diesel Scenarios. EPROM offer letter `WEPCO ESP Offer(2).docx` provides the summarized project figures. Inputs: EPC USD 485,000, FX 55 EGP/USD, baseline diesel 740 L/day, generator off-time 5.5 h/day, 365 days/yr, diesel price 73.56 EGP/L, 20%/yr compounded escalation, 1% EPC annual O&M (flat), discount 18%, 25-year horizon, CO2 factor 2.6971966546 kg/L.

**Engineering discrepancy:** The workbook specifies **304 kWp PV, 2 × 150 kW inverters and 3 × 107 kWh BESS (321 kWh)**. EMDAD's separate SLD/PVsyst study uses **456 kWp, 702 × 650 Wp modules, 3 × 150 kW inverters, and 3 × 161.3 kWh BESS (~483.9 kWh)**. The 3D selector changes the **visual engineering configuration only**. Financial KPIs remain the workbook-based feasibility model in both views; they must not be presented as certified supplier-case economics.

**Financial validation (base case):**

| KPI | Expected |
| --- | ---: |
| EPC CAPEX | EGP 26,675,000 |
| Annual avoided diesel | 61,897.9167 L |
| Year 1 gross diesel savings | EGP 4,553,210.75 |
| Year 1 O&M | EGP 266,750 |
| Year 1 net | EGP 4,286,460.75 |
| Cumulative payback | 4.359721 years |
| IRR 25Y | 35.860847% |
| NPV 25Y at 18% | EGP 90,758,417.40 |
| GHG avoided annually | 166.95085 tCO2 |

**Separate screening model:** The current V4 includes hourly PV/BESS/DG dispatch derived from the user-supplied PVGIS-based 8,760-hour representative weather CSV. This model is separate from the financial workbook: the financial base case remains 5.5 h/day unless explicitly overridden as a screening sensitivity. Generation is modeled rather than measured. Genset startup, protection coordination, actual fuel curve, grid-forming capability, battery degradation/replacement, VAT, civil works, land costs, financing and other CAPEX risk items are **not validated**. 3D geometry and operating animation are conceptual and not real SCADA. See `ENGINEERING_MODEL.md` and `V4_RELEASE_NOTES.md` for assumptions, safety limits and test basis.

**Supplied technical references:** EPROM ESP Solar Hybrid SLD; EPROM ESP 456 kWp PVsyst Report; LUNA2000-161-2S11 datasheet; SUN2000-150K-MG0 datasheet; 3406C generator data and site historical material.

## Technology

- Static HTML + responsive CSS (no framework, no cookies, no server-side data).
- Three.js ES modules bundled by Vite for 3D scene, interactive orbit camera, physical component selection and day/night lighting.
- Vanilla JS SVG data visualizations (10- or 25-year cash-flow chart; log-scaled diesel escalation scenarios).
- Strictly on-device financial calculations including NPV, IRR and cumulative payback.

## Development / folder structure

```
index.html
styles.css
assets/eprom-logo.svg
js/finance.js
js/main.js
js/scene.js
```

## Privacy

Model data is visible to everyone who visits a published page and can be inspected in browser source. Keep your GitHub repository private until the figures, corporate logo and disclosure level are approved. GitHub Pages accessibility and eligibility for private repositories depend on GitHub plan and deployment configuration.