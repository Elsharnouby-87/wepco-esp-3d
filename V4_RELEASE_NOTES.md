# WEPCO BED 1-17 Digital Twin — V4 Visual & Operations Update

## Scope

This revision updates **only the visual 3D equipment scene, energy-flow effects and operator UI**. It preserves the financial feasibility engine and the 8,760-hour weather/dispatch model.

### 3D / product design

- References: supplied Huawei **LUNA2000-161-2S11** (161.3 kWh), Huawei **SUN2000-150K-MG0**, Caterpillar **3406C** generator set and Jinko Tiger Neo 650–670 Wp module datasheets. Equipment shapes are vendor-*inspired*, not exact CAD or approved as-built dimensions.
- More detailed BESS cabinets: door grilles, top status strip, cooling sections and supporting skid structure.
- Inverter front control/ventilation faces, AC gland drop-downs and rear cooling features.
- Generator enclosure/radiator, exhaust and safety markings; improved wellhead/VSD visual definition.
- Conceptual access markings, small protective bollards and nighttime access luminaires.
- Retains dimensionally *illustrative* trays and conduits. Never use the model for cable sizing, certified interlocking studies or construction.

### In-cable flow

- Brighter but constrained **additive luminous core**, translucent conduit and animated current streaks along the actual cable-tray curves; still not loose floating lines.
- PV cyan; BESS charging green; BESS discharging blue; generator amber; final ESP load light teal.
- Flow count, speed and intensity respond to modeled kW; reversed streak motion for BESS charging versus discharging. The wire glow and effects are toggled independently of physical cable meshes.
- The four compact operator readouts reflect the same simulated hourly row as the 3D rendering.

### Playback / generator-off indicators

- Moved **Play / Pause 24-hour cycle** directly below the 3D canvas before the operational side panel.
- Changed simulation clock animation from **2.8 to 1.4 modeled hours per real second** (full 24-hour loop ~17.1 seconds, not accounting for hidden-tab pauses).
- Full-year generator-off average: `annual.offHours / 365` with `annual.offHours` directly counted from 8,760 simulated hourly rows (`!dieselOn`).
- Selected-day generator-off: count `!dieselOn` across the **24 consecutive rows** on selected date, in 1-hour intervals.
- Both values recalculate on changes to 304/456 kWp design, ESP kVA and PF. Day-specific result also updates on date selection.
- Neither replaces the **5.5 h/day financial baseline** without explicitly applying the separate sensitivity action.

## Technical limitations

The photovoltaic weather series is a user-supplied representative PVGIS TMY-derived 8,760-hour file, *not measured or real-time power*; every hourly row is a simulated 1-hour average. Generator fuel and switch transfer are screening assumptions, requiring PCS, grid-forming and site acceptance validation before financial commitment.