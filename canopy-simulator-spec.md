# Canopy — Urban Tree Impact Simulator: Model Reference

This document is the single source of truth for how the [Canopy simulator](https://claude.ai/artifact/SdqB6E1h5vrjheTuf8bRcH) calculates its numbers. It's written so it can double as a system-level reference: hand it to a person, a report, or an AI assistant and they'll have every assumption, formula, and source the tool relies on, without needing to reverse-engineer the code.

---

## 1. What the simulator does

Given a planting scenario, it estimates four annual benefits a city gets back:

1. **CO₂ absorbed** (carbon sequestration)
2. **Airborne pollutants filtered** (PM, NO₂, SO₂, ozone)
3. **Stormwater intercepted** (canopy + root-zone rainfall capture)
4. **City-wide cooling** (urban heat island reduction)

It does **not** model: species-specific biology, soil chemistry, tree mortality/survival rates, maintenance cost, or micro-climate effects under a single tree's shade (that's a much larger effect than the city-wide average reported here).

---

## 2. Inputs

| Input | Range | Notes |
|---|---|---|
| Trees planted | 0 – 100,000 | Total count in the scenario |
| City area (km²) | 0.5 – 100 | Total land area the trees are distributed across |
| Years since planting | 0 – 30 | Drives the maturity curve (see §4) |
| Tree type | Broadleaf / Conifer | Changes canopy size, growth rate, and pollutant capture (see §5) |

---

## 3. Core formulas

```
maturity(years, type)   = 1 − e^(−years / τ_type)

co2_kg                  = trees × maturity × CO2_PER_MATURE_TREE_KG
pollutants_kg           = trees × maturity × POLLUTANTS_PER_MATURE_TREE_KG × pollutant_mult_type
stormwater_L            = trees × maturity × STORMWATER_PER_MATURE_TREE_L

canopy_fraction         = min(1, (trees × canopy_m2_type × maturity) / (area_km2 × 1,000,000))
temp_reduction_C        = MAX_TEMP_REDUCTION_C × (1 − e^(−3 × canopy_fraction))
```

Derived, relatable figures shown in the UI:
```
cars_removed_equivalent = (co2_kg / 1000) / 4.6          # avg. passenger car ≈ 4.6 t CO2/yr
olympic_pools           = stormwater_L / 2,500,000       # 1 Olympic pool ≈ 2,500,000 L
```

**Why an exponential approach curve, not a straight line?** A newly planted tree has almost no canopy; benefits scale with canopy size, not tree count alone. An exponential approach-to-maturity (`1 − e^(−t/τ)`) captures fast early growth that gradually plateaus, which matches how canopy area actually develops. The same shape is used for the temperature-vs-canopy-fraction relationship, reflecting diminishing returns as a city approaches full canopy coverage — the first 10% of canopy cools more than the next 10%.

---

## 4. Maturity time constant (τ)

| Type | τ (years) | Canopy at 10 yrs | Canopy at 20 yrs |
|---|---|---|---|
| Broadleaf | 6 | ~81% | ~96% |
| Conifer | 10 | ~63% | ~86% |

Broadleaf (deciduous) species were modeled as canopying out faster; conifers slower but evergreen (see pollutant multiplier below).

---

## 5. Per-tree constants and their sources

| Constant | Value used | Basis |
|---|---|---|
| CO₂ absorbed / mature tree / year | 21.8 kg (48 lb) | Widely cited Arbor Day Foundation / USDA Forest Service figure for a mature tree |
| Other pollutants removed / mature tree / year | 1.15 kg (~2.5 lb) | Derived from a Northeastern U.S. urban-forestry study: 100 large public trees remove ~250 lb of pollutants (excl. CO₂) per year |
| Stormwater intercepted / mature tree / year | 5,000 L (~1,300 gal) | Averaged from two field estimates: 10,000 urban trees retaining ~10M gallons/yr, and 100 large trees capturing ~162,400 gal/yr |
| Canopy area, broadleaf | 20 m² | Typical mature broadleaf street-tree canopy footprint |
| Canopy area, conifer | 13 m² | Narrower typical conifer canopy footprint |
| Pollutant multiplier, conifer | ×1.15 | Evergreen needles intercept particulates year-round; broadleaf trees lose this capacity when leafless |
| Max city-wide cooling (asymptote) | 4.0 °C | Set conservatively **below** the ~8–10°F (4.4–5.6°C) urban-heat-island gap cited between built and natural areas, since this models a citywide average, not peak shaded-surface cooling |
| CO₂ per passenger car / year | 4.6 t | Common EPA-cited average annual tailpipe emissions figure |

### Primary research pulled for this model
- Arbor Day Foundation — mature tree CO₂ absorption and oxygen output figures
- USDA Forest Service — U.S. urban tree air-pollution removal totals and associated health-cost savings
- GreenBlue Urban, "How Urban Trees Improve our Quality of Life" — stormwater retention figures (10,000 trees / ~10M gallons), energy-saving and UHI-gap figures
- Northeastern regional urban-forestry data (McPherson, Simpson, Peper & Gardner) — per-100-tree pollutant removal and stormwater capture rates
- *Landscape and Urban Planning* (cited via EarthTalk/Arbor Day Foundation reporting) — canopy-cover-to-temperature relationship, used qualitatively to keep the model's cooling estimates conservative rather than to derive an exact coefficient

**Caveat:** these are commonly cited public averages, not a peer-reviewed meta-analysis performed for this project. They're accurate enough to teach the *shape* of the relationship (more trees → more benefit, with diminishing returns and a maturation lag) but shouldn't be quoted as precise scientific findings without independent verification — see §7.

---

## 6. Output reference

| Output | Formula reference | Unit shown |
|---|---|---|
| CO₂ absorbed | `co2_kg` | metric tons/year, + car-equivalent |
| Pollutants filtered | `pollutants_kg` | kg/year |
| Stormwater intercepted | `stormwater_L` | m³/year, + Olympic-pool equivalent |
| City-wide cooling | `temp_reduction_C` | °C |
| Canopy cover | `canopy_fraction` | % (hero stat + 10×10 grid visualization) |

---

## 7. Known limitations (be upfront about these)

- No tree mortality/attrition modeled — real planting programs lose a meaningful fraction of trees in the first 5 years.
- No species-level variation within "broadleaf" or "conifer" — real species differ substantially (e.g., oak vs. birch).
- Canopy area and pollutant/stormwater constants are single point-estimates from averaged sources, not distributions.
- Temperature model is a simplified exponential fit to a conservative asymptote, not derived from a specific dose-response study for this city.
- Assumes even distribution of trees across the stated city area — no accounting for street-tree vs. park vs. private-yard placement, which materially affects real-world benefit delivery.
- Does not account for planting/maintenance cost, water use, or infrastructure conflicts (sidewalks, utility lines).

## 8. Suggested extensions

- Replace generic constants with a specific city's actual tree inventory + i-Tree Eco/Species output for defensible, citable numbers.
- Add a cost axis (cost per tree planted + maintained vs. dollar value of benefits, using EPA/IPCC social cost of carbon for CO₂).
- Add tree mortality/replacement-rate modeling over the 30-year window.
- Break "broadleaf/conifer" into named species with their own τ, canopy size, and pollutant profiles.
