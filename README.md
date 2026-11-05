# BED 1-17 | EPROM / WEPCO 3D Solar Hybrid Dashboard

A GitHub Pages-ready, static HTML/CSS/JavaScript website with an interactive Three.js conceptual 3D microgrid, a 24-hour visual operating timeline, and a client-side financial sensitivity model grounded in the supplied EPROM feasibility workbook.

## Run locally

Because the site uses ES modules, **do not** open `index.html` with a `file://` URL. Start a local static server:

```bash
python -m http.server 8080
```

Then browse to `http://localhost:8080`.

No build pipeline is required. The Three.js 3D component loads from jsDelivr on the first visit; the financial dashboard works even when the 3D library cannot load. Modern browsers with WebGL are required for 3D.

## Publish through GitHub Pages

1. Create a **new GitHub repository** for this project. Review all data first; GitHub Pages normally produces a publicly accessible website.
2. Upload the **contents** of this folder, with `index.html` at repository root.
3. In repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**, then save.
4. After deployment, open the Pages address shown by GitHub. It usually has a URL like `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`.

Do not upload the original source PDF/DOCX/XLSX documents, confidential tenders, vendor offers, sensitive site photos, or correspondence to a public repo without the respective owner's permission. The delivered site references high-level project parameters only and does not include the source files.

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

**Not part of the model:** Dispatch feasibility, hourly PV/BESS/ESP performance, battery degradation, cell replacement, VAT, civil works, land costs, replacement CAPEX, financing, residual value, major maintenance and uncertainty ranges. Slider changes are **financial sensitivities**, not validated engineering configurations. Site 3D geometry, component placement and the 09:30–15:00 illustrative diesel-off window are not as-built or operational schedule records. The 24-hour playback is illustrative, not a real SCADA feed.

**Supplied technical references:** EPROM ESP Solar Hybrid SLD; EPROM ESP 456 kWp PVsyst Report; LUNA2000-161-2S11 datasheet; SUN2000-150K-MG0 datasheet; 3406C generator data and site historical material.

## Technology

- Static HTML + responsive CSS (no framework, no cookies, no server-side data).
- Three.js ES modules via CDN for 3D scene, interactive orbit camera, physical component selection and day/night lighting.
- Vanilla JS SVG data visualizations (10- or 25-year cash-flow chart; log-scaled diesel escalation scenarios).
- Strictly on-device financial calculations including NPV, IRR and cumulative payback.

## Development / folder structure

```
index.html
styles.css
assets/eprom-logo.png
js/finance.js
js/main.js
js/scene.js
```

## Privacy

Model data is visible to everyone who visits a published page and can be inspected in browser source. Keep your GitHub repository private until the figures, corporate logo and disclosure level are approved. GitHub Pages accessibility and eligibility for private repositories depend on GitHub plan and deployment configuration.