# WEPCO Digital Twin V9 — Natural Desert 3D
**Release:** 2026-11-06  
**Checkpoint:** `checkpoint-v8-1-before-desert-3d-v9-2026-11-06`

## Visual corrections
- Deleted the unused `groundTop` 112 × 83 rectangular ground layer responsible for the large pale block under the PV array.
- Created a single naturally undulating ground plane across the entire site without artificial rectangular borders.
- Applied one unified wind-rippled sandstone material to the ground, replacing different colors between indoor/outdoor sections.
- Replaced old dark green scatter rocks and three decorative trenches with mobile-friendly instanced sandstone pebbles outside the equipment layout.
- Removed the scene grid overlay and reduced artificial low-lying fog.
- Improved renderer exposure and shadow bias to make cabinets, glazing and cable trays cleaner.
- Replaced the oversized 11-unit pale service lane and painted yellow markings with faint tire tracks directly on sand.

## Invariants
**The change is visual only.** Neither `js/dispatch.js`, `js/finance.js`, `js/weather.js`, `js/topology.js` nor `js/main.js` was edited.

- 304 kWp / 468 × 650 Wp (visual feasibility) and 456 kWp / 702 × 650 Wp (supplier visual) stay unchanged.
- BESS dispatch and current-direction flow logic remain unchanged.
- The 8,760-hour weather model, economic assumptions and annual generator-off estimates are not recalculated.
- Cinematic tour and all existing control elements remain.

## Presentation note
Visual design is illustrative and inspired by supplied Jinko, Huawei and CAT references. It is not an as-built survey.