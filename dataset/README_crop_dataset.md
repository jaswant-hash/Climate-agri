
# Crop Requirements Dataset — Data Dictionary & Sources

## Files
| File | Rows | Columns | Purpose |
|------|------|---------|---------|
| `crop_requirements.csv` | 44 crops | 27 columns | Primary dataset: all crop environmental & agronomic attributes |
| `crop_growth_stages.csv` | 124 stages | 9 columns | Stage-by-stage breakdown for each crop |
| `madurai_crop_calendar.csv` | 71 entries | 19 columns | Madurai-specific sowing/harvest seasons, varities, and sources |
| `crop_kc_values.csv` | 43 crops | 14 columns | FAO Paper 56 crop coefficients for each growth stage |
| `madurai_soil_profile.csv` | 13 blocks | 12 columns | Soil types, NPK, OC%, pH, and block-wise suitability in Madurai |

---

## crop_requirements.csv — Column Definitions

| Column | Unit | Description | Example |
|--------|------|-------------|---------|
| `Crop` | — | Common name | Rice |
| `Scientific_Name` | — | Latin binomial | *Oryza sativa* |
| `Category` | — | Crop group | Cereal / Pulse / Oilseed / Commercial / Vegetable / Fruit |
| `Season` | — | Growing season | Kharif / Rabi / Zaid / Perennial |
| `Duration_days` | days | Days from sowing to harvest (baseline estimate) | 120 |
| `Base_Temp_C` | °C | Temperature below which crop stops growing | 10 |
| `Required_GDD` | heat units | Growing Degree Days (thermal time) required for maturity | 2100 |
| `Min_Temp_C` | °C | Absolute minimum temperature for survival | 16 |
| `Opt_Temp_C` | °C | Optimum mean temperature for best yield | 28 |
| `Max_Temp_C` | °C | Absolute maximum temperature before damage | 38 |
| `Min_Rain_mm` | mm/season | Minimum seasonal rainfall (or irrigation equivalent) | 1000 |
| `Opt_Rain_mm` | mm/season | Optimal seasonal rainfall | 1500 |
| `Max_Rain_mm` | mm/season | Maximum tolerable rainfall before waterlogging/disease | 2500 |
| `Min_Humidity_pct` | % RH | Minimum relative humidity for healthy growth | 70 |
| `Max_Humidity_pct` | % RH | Maximum relative humidity (above = disease risk) | 90 |
| `Min_pH` | pH units | Minimum soil pH | 5.5 |
| `Max_pH` | pH units | Maximum soil pH | 7.0 |
| `Soil_Type` | — | Preferred soil texture/type | Clay Loam |
| `Sunlight_hrs_day` | hrs/day | Minimum daily sunshine hours for optimal yield | 8 |
| `Water_Requirement` | — | Qualitative scale (Very Low / Low / Moderate / High / Very High) | Very High |
| `N_kg_ha` | kg/ha | Recommended Nitrogen dose | 120 |
| `P_kg_ha` | kg/ha | Recommended Phosphorus (P₂O₅) dose | 60 |
| `K_kg_ha` | kg/ha | Recommended Potassium (K₂O) dose | 60 |
| `Heat_Tolerance` | — | Qualitative (Low / Moderate / High / Very High) | Moderate |
| `Drought_Tolerance` | — | Qualitative (Low / Moderate / High / Very High) | Low |
| `Flood_Tolerance` | — | Qualitative (Low / Moderate / High / Very High) | High |
| `Wind_Tolerance` | — | Qualitative (Low / Moderate / High / Very High) | Moderate |
| `Salinity_Tolerance` | — | Qualitative (Low / Moderate / High) | Low |
| `Growth_Stages` | — | Pipe-delimited list: StageName(start-end) | Germination(0-10)\|Seedling(10-25)… |
| `Sources` | — | Reference institutions | FAO; TNAU; ICAR |

---

## crop_growth_stages.csv — Column Definitions

| Column | Description |
|--------|-------------|
| `Crop` | Crop common name (join key with main file) |
| `Stage_Index` | Numeric order of stage (1 = first) |
| `Stage_Name` | Name of growth stage |
| `Stage_Emoji` | UI display emoji for simulator |
| `Start_Day` | Day number (from sowing) when stage begins |
| `End_Day` | Day number (from sowing) when stage ends |
| `Critical_Factor` | Most important agronomic factor during this stage |
| `Notes` | Additional agronomic guidance |

---

## Data Sources & References

All values are sourced from peer-reviewed and government agricultural references. No values were invented.

| Source | Description | URL |
|--------|-------------|-----|
| **FAO ECOCROP** | FAO database of crop environmental requirements (temp, rainfall, pH, soil) | https://gaez.fao.org/ |
| **FAO Irrigation & Drainage Paper 24/56** | Crop water requirements; Penman-Monteith Kc values | https://www.fao.org/3/S2022E/s2022e00.htm |
| **TNAU Agritech Portal** | Tamil Nadu Agricultural University crop production guides (India) | https://agritech.tnau.ac.in/ |
| **ICAR** | Indian Council of Agricultural Research — crop-specific monographs | https://www.icar.org.in/ |
| **ICAR-IIHR** | Indian Institute of Horticultural Research (vegetables & fruits) | https://www.iihr.res.in/ |
| **ICAR-ICRISAT** | ICRISAT data for dryland crops (pearl millet, sorghum, groundnut) | https://www.icrisat.org/ |
| **NHB (National Horticulture Board)** | India: horticultural crop profiles, fruit and vegetable data | https://nhb.gov.in/ |
| **ICAR-CISH** | Central Institute for Sub-tropical Horticulture (mango, guava, banana) | https://www.cish.res.in/ |
| **ICAR-IIGR** | Indian Institute of Groundnut Research | https://www.icar-iigr.org.in/ |
| **UPASI-TRF** | Tea Research Foundation (Valparai) — tea crop data | https://www.upasitrf.org/ |
| **ICAR-CCRI** | Central Coffee Research Institute — coffee data | https://www.ccri.res.in/ |
| **RRII** | Rubber Research Institute of India — rubber crop data | https://www.rubberboard.org.in/ |
| **ICAR-CPRI** | Central Potato Research Institute | https://www.cpri.res.in/ |
| **ICAR-CTRI** | Central Tobacco Research Institute | https://www.ctri.icar.gov.in/ |
| **ICAR-IISR** | Indian Institute of Spices Research (ginger, turmeric) | https://www.spices.res.in/ |
| **Vikaspedia.in** | Government of India agriculture information portal | https://vikaspedia.in/ |

---

## Tolerance Scale Definitions

| Rating | Meaning |
|--------|---------|
| Very Low | Crop fails at minimal stress exposure |
| Low | Crop suffers significant yield loss at stress |
| Moderate | Crop can handle moderate stress with 20-40% yield reduction |
| High | Crop adapted to stress; < 20% yield reduction |
| Very High | Crop specifically bred/adapted for this stress; minimal loss |

---

## How to Use This Dataset in the Simulator

### 1. Matching Current Climate to Crop Suitability
```
suitability_score = 0
if min_temp <= current_temp <= max_temp:  +25 pts
if current_temp near opt_temp:           +25 pts  (Gaussian around opt)
if min_rain <= season_rain <= max_rain:  +25 pts
if soil_pH in [min_pH, max_pH]:          +25 pts
```

### 2. Rendering Growth Stage Progress Bar (Advanced GDD Model)
Instead of just counting days, the simulator can use **Growing Degree Days (GDD)** to calculate real-time plant maturity based on NASA POWER temperature data.

```python
# Daily GDD Calculation
T_mean = (T_max + T_min) / 2
Daily_GDD = max(0, T_mean - Base_Temp_C)

# Maturity Tracking
Current_GDD_Sum = sum(Daily_GDD for each day since sowing)
Maturity_Pct = (Current_GDD_Sum / Required_GDD) * 100
```
*If NASA POWER is unavailable, fall back to simple day counting:*
```python
progress_pct = (current_day_since_sowing / Duration_days) * 100
```

### 3. Combining with NASA POWER Data
- Use `Opt_Temp_C` vs POWER `T2M` (2m temperature)
- Use `Opt_Rain_mm` vs POWER `PRECTOTCORR` (accumulated over season)
- Use `Sunlight_hrs_day` vs POWER `ALLSKY_SFC_SW_DWN` → convert to hours

### 4. Stress Flag Generation
| Condition | Flag |
|-----------|------|
| `current_temp > max_temp` | 🔥 Heat Stress |
| `current_temp < min_temp` | 🥶 Cold Stress |
| `season_rain < min_rain` | 💧 Drought Risk |
| `season_rain > max_rain` | 🌊 Waterlogging Risk |
| `soil_pH < min_pH` | ⚠️ Soil Too Acidic |
| `soil_pH > max_pH` | ⚠️ Soil Too Alkaline |
