# WEPCO BED 1-17 | Solar Hybrid Engineering Digital Twin

A professional interactive engineering viewer and investment dashboard for the BED 1-17 ESP hybrid solar project. Recent visual upgrades add a continuous desert floor and enhanced 3D equipment presentation; V6 corrected the bifacial PV module mesh, separates PV DC and PV-inverter AC cables into physically distinct routes, and visualizes BESS charge/discharge, generator supply and LV-to-ESP connections with source-correct direction. It also includes vendor-inspired equipment detailing, a roughly 34-second 24-hour animated playback, and full-year / selected-day generator-off statistics derived from a representative 8,760-hour dispatch model. This is a **conceptual engineering visualization**, not a construction-grade digital twin or live SCADA.

## GitHub Pages — primary hosting

**Permanent GitHub Pages address (pending one-time activation):** https://elsharnouby-87.github.io/wepco-esp-3d/

**GitHub source code:** https://github.com/Elsharnouby-87/wepco-esp-3d

**GitHub-only deployment:** `.github/workflows/pages.yml` runs on every push to `main`, installs dependencies, builds the complete Three.js/Vite site into `dist/`, and deploys it to GitHub Pages. **AppDeploy is not required** for this build, deployment, or future updates.

**Current setup status (6 November 2026):** the latest GitHub Actions run **successfully compiled the app**, but failed in `actions/configure-pages@v5` because the repository's GitHub Pages site has not been enabled yet. The repository administrator must complete **Settings → Pages → Build and deployment → Source: GitHub Actions** once, then rerun the workflow via **Actions → Publish WEPCO Digital Twin → Run workflow → Run workflow**. Do not share the Pages URL as live until the deployment job succeeds. Full instructions are in [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md).

**Temporary legacy fallback (not the production target):** https://wepco-bed-1-17-solar-hybrid-digital-twin-w562jt.v2.appdeploy.ai/

## Run locally

The site uses a Three.js ESM import and must be bundled with Vite (opening `index.html` directly or serving raw sources with a simple static server will not resolve the bare `three` import):

```bash
npm install
npm run dev
```

Use the local URL printed by Vite. For a production build, run `npm run build` and `npm run preview`.

## GitHub Pages

GitHub Pages is the intended **independent, free, automatic deployment host** for this public repository. The workflow is installed and verified to complete `npm install` and `npm run build` successfully. The only outstanding action is the one-time **Settings → Pages → Source: GitHub Actions** activation. Read [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md). Public GitHub Pages makes the site's model assumptions and financial figures visible, so confirm the permitted disclosure scope before sharing it externally.

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

**Separate screening model:** The current model includes hourly PV/BESS/DG dispatch derived from the user-supplied PVGIS-based 8,760-hour representative weather CSV. This model is separate from the financial workbook: the financial base case remains 5.5 h/day unless explicitly overridden as a screening sensitivity. Generation is modeled rather than measured. Genset startup, protection coordination, actual fuel curve, grid-forming capability, battery degradation/replacement, VAT, civil works, land costs, financing and other CAPEX risk items are **not validated**. 3D geometry and operating animation are conceptual and not real SCADA. See `ENGINEERING_MODEL.md`, `V6_ENGINEERING_REVIEW.md` and `V4_RELEASE_NOTES.md` for source basis, topology, model assumptions and limits.

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
js/finance.js
js/main.js
js/scene.js
js/topology.js
V6_ENGINEERING_REVIEW.md
tests_topology.mjs
```

## Privacy

Model data is visible to everyone who visits a published page and can be inspected in browser source. Keep your GitHub repository private until the figures, corporate logo and disclosure level are approved. GitHub Pages accessibility and eligibility for private repositories depend on GitHub plan and deployment configuration.

## V6 electrical topology and PV geometry (6 November 2026)

- The Jinko Tiger Neo 650 Wp bifacial module is one flat dual-glass panel. The V6 solar cell plane and aluminum frame are now coplanar, with the face geometry rotated into the frame XZ plane before the rack tilt. Module length/width proportions follow the 2382 × 1134 × 30 mm Jinko datasheet at illustrative visual scale. Rack tilt is illustrative (~25°), not surveyed site data.
- The supplier SLD establishes separate **PV DC → solar inverter → AC LV distribution panel**, **BESS PCS ↔ LV**, **diesel generator → LV**, and **LV → ESP/VSD** connections. The corresponding 3D cable routes now follow that hierarchy with distinct colored trays and directional animation. The BESS path alone reverses for charging; solar export power never animates backwards toward an inverter during PV production.
- A pure JavaScript module (`js/topology.js`) maps hourly dispatch power to 5 physical routes, allowing regression tests of route direction, source separation and power balance. PV DC-route display power is an AC-equivalent model proxy, not direct DC measurement.
- All 8,760-hour dispatch calculations and financial assumptions are unchanged. See `V6_ENGINEERING_REVIEW.md` for the precise changes, assumptions and residual engineering validations.
