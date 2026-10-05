import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pymongo import MongoClient
from datetime import datetime
import requests
import pandas as pd
import hashlib
import re
from bson.objectid import ObjectId

# ─────────────────────────────────────────────
# LOAD THE TRAINED BRAIN ON STARTUP
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "crop_risk_model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "encoders.pkl"), "rb") as f:
    encoders = pickle.load(f)

with open(os.path.join(BASE_DIR, "target_cols.pkl"), "rb") as f:
    target_cols = pickle.load(f)

# ─────────────────────────────────────────────
# LOAD STATIC DATASETS FOR LIVE CALCULATIONS
# ─────────────────────────────────────────────
try:
    soil_df = pd.read_csv(os.path.join(BASE_DIR, "../dataset/madurai_soil_profile.csv"))
    crop_req_df = pd.read_csv(os.path.join(BASE_DIR, "../dataset/crop_requirements.csv"))
except Exception as e:
    print(f"Warning: Could not load CSV datasets: {e}")
    soil_df, crop_req_df = None, None

print("=" * 50)
print(" Madurai Agri-Intelligence API is Ready!")
print(f" Loaded {len(target_cols)} prediction targets:")
for col in target_cols:
    print(f"   - {col}")
print("=" * 50)

# ─────────────────────────────────────────────
# CREATE THE FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="Madurai Agri-Intelligence API",
    description="9-Aspect Crop Prediction using XGBoost trained on 26 years of NASA climate data",
    version="1.0.0"
)

# Allow React frontend to call this API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # In production, set this to your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# MONGODB SETUP
# ─────────────────────────────────────────────
try:
    mongo_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = mongo_client["weather"]
    history_collection = db["historydb"]
    login_collection   = db["login"]       # ← users stored here
    # Create unique index on email so duplicate signups are rejected
    login_collection.create_index("email", unique=True)
    print(" MongoDB Connected to 'weather' database!")
    print(" Collections: historydb (predictions) | login (users)")
except Exception as e:
    print(f" MongoDB Connection Failed: {e}")
    history_collection = None
    login_collection   = None

# ─────────────────────────────────────────────
# INPUT SCHEMA
# ─────────────────────────────────────────────
class ProfileUpdateInput(BaseModel):
    current_email: str
    new_name: str
    new_email: str

class PredictionInput(BaseModel):
    block: str            # e.g. "Melur"
    crop: str             # e.g. "Rice"
    season: str           # e.g. "Samba"
    soil_type: str        # e.g. "Red Alluvial (Vaigai belt)"
    soil_ph_min: float    # e.g. 6.5
    total_rain_mm: float  # Total rainfall during season (from live API)
    rain_deficit_mm: float  # How much rain is missing vs. crop minimum
    heat_stress_days: int   # Days where temp exceeded crop max tolerance
    accumulated_gdd: float  # Growing Degree Days accumulated so far

# ─────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────
class AuthInput(BaseModel):
    name: str = ""          # only used for signup
    email: str
    password: str

def hash_password(password: str) -> str:
    """SHA-256 hash — simple, no extra lib needed."""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_email(email: str) -> bool:
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email))

# ─────────────────────────────────────────────
# SIGNUP ENDPOINT — saves to 'login' collection
# ─────────────────────────────────────────────
@app.post("/signup")
def signup(data: AuthInput):
    if login_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    if not validate_email(data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        user = {
            "name": data.name.strip(),
            "email": data.email.lower().strip(),
            "password_hash": hash_password(data.password),
            "created_at": datetime.utcnow().isoformat()
        }
        login_collection.insert_one(user)
        return {
            "status": "success",
            "message": "Account created successfully",
            "user": {"name": user["name"], "email": user["email"]}
        }
    except Exception as e:
        if "duplicate key" in str(e).lower() or "E11000" in str(e):
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────
# SIGNIN ENDPOINT — verifies against 'login' collection
# ─────────────────────────────────────────────
@app.post("/signin")
def signin(data: AuthInput):
    if login_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    if not validate_email(data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    try:
        user = login_collection.find_one({"email": data.email.lower().strip()})
        if not user:
            raise HTTPException(status_code=401, detail="No account found with this email")
        if user["password_hash"] != hash_password(data.password):
            raise HTTPException(status_code=401, detail="Incorrect password")
        return {
            "status": "success",
            "message": "Signed in successfully",
            "user": {"name": user.get("name", ""), "email": user["email"]}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────
# UPDATE PROFILE ENDPOINT
# ─────────────────────────────────────────────
@app.put("/profile")
def update_profile(data: ProfileUpdateInput):
    if login_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    current_email = data.current_email.lower().strip()
    new_email = data.new_email.lower().strip()
    
    if not validate_email(new_email):
        raise HTTPException(status_code=400, detail="Invalid new email address")
        
    try:
        # Check if they are changing email and if the new one exists
        if current_email != new_email:
            existing = login_collection.find_one({"email": new_email})
            if existing:
                raise HTTPException(status_code=400, detail="An account with the new email already exists")
                
        result = login_collection.update_one(
            {"email": current_email},
            {"$set": {"name": data.new_name.strip(), "email": new_email}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "status": "success",
            "message": "Profile updated successfully",
            "user": {"name": data.new_name.strip(), "email": new_email}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────
# HEALTH CHECK ENDPOINT
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "online",
        "model": "XGBoost Multi-Output Regressor",
        "predictions": len(target_cols),
        "aspects": target_cols
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

# ─────────────────────────────────────────────
# LIVE API FETCH FUNCTION
# ─────────────────────────────────────────────
BLOCK_COORDS = {
    "Melur": (10.033, 78.333), "Vadipatti": (10.083, 77.966), "Madurai East": (9.939, 78.145),
    "Madurai West": (9.939, 78.100), "Thirumangalam": (9.816, 77.983), "Usilampatti": (9.966, 77.800),
    "Alanganallur": (10.050, 78.083), "Sedapatti": (9.833, 77.733), "Kottampatti": (10.183, 78.266),
    "T. Kallupatti": (9.766, 77.816), "Chellampatti": (9.933, 77.883), "Thiruparankundram": (9.883, 78.066),
    "Kalligudi": (9.733, 77.950)
}

def get_live_agri_data(block: str, crop: str):
    # 1. Get Soil pH
    try:
        soil_row = soil_df[soil_df['Block'].str.contains(block, case=False, na=False)]
        soil_ph_min = float(str(soil_row.iloc[0]['pH_Range']).split('-')[0]) if not soil_row.empty else 6.5
    except:
        soil_ph_min = 6.5
        
    # 2. Get Crop Needs
    try:
        crop_row = crop_req_df[crop_req_df['Crop'].str.contains(crop, case=False, na=False)]
        if not crop_row.empty:
            base_temp = float(crop_row.iloc[0]['Base_Temp_C'])
            max_temp_tol = float(crop_row.iloc[0]['Max_Temp_C'])
            min_rain = float(crop_row.iloc[0]['Min_Rain_mm'])
        else:
            base_temp, max_temp_tol, min_rain = 10.0, 35.0, 500.0
    except:
        base_temp, max_temp_tol, min_rain = 10.0, 35.0, 500.0

    # 3. Live Weather (Last 90 days for seasonal context)
    lat, lon = BLOCK_COORDS.get(block, (9.9252, 78.1198))
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=90&forecast_days=0"
    try:
        res = requests.get(url, timeout=5)
        daily = res.json()['daily']
        tmax, tmin, precip = daily['temperature_2m_max'], daily['temperature_2m_min'], daily['precipitation_sum']
        
        total_rain = sum([p for p in precip if p is not None])
        rain_deficit = max(0, min_rain - total_rain)
        heat_stress_days = sum(1 for t in tmax if t is not None and t > max_temp_tol)
        
        accumulated_gdd = sum([((mx + mn)/2) - base_temp for mx, mn in zip(tmax, tmin) if mx and mn and (((mx + mn)/2) - base_temp) > 0])
    except Exception as e:
        print(f"API Error: {e}")
        total_rain, rain_deficit, heat_stress_days, accumulated_gdd = 450.0, 50.0, 5, 1200.0

    return {
        "soil_ph_min": round(soil_ph_min, 2),
        "total_rain_mm": round(total_rain, 2),
        "rain_deficit_mm": round(rain_deficit, 2),
        "heat_stress_days": heat_stress_days,
        "accumulated_gdd": round(accumulated_gdd, 2)
    }

# ─────────────────────────────────────────────
# MAIN PREDICTION ENDPOINT
# React calls POST /predict with the farm data
# Returns all 9 predictions in one response
# ─────────────────────────────────────────────
@app.post("/predict")
def predict(data: PredictionInput):
    try:
        # OVERRIDE UI INPUTS WITH LIVE DATA
        live_data = get_live_agri_data(data.block, data.crop)
        data.soil_ph_min = live_data["soil_ph_min"]
        data.total_rain_mm = live_data["total_rain_mm"]
        data.rain_deficit_mm = live_data["rain_deficit_mm"]
        data.heat_stress_days = live_data["heat_stress_days"]
        data.accumulated_gdd = live_data["accumulated_gdd"]

        # Step 1: Encode the text fields using the same encoders from training
        def encode(col_name, value):
            le = encoders[col_name]
            if value not in le.classes_:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unknown {col_name}: '{value}'. Valid options: {list(le.classes_)}"
                )
            return int(le.transform([value])[0])

        block_enc   = encode("Block", data.block)
        crop_enc    = encode("Crop", data.crop)
        season_enc  = encode("Season", data.season)
        soil_enc    = encode("Soil_Type", data.soil_type)

        # Step 2: Build the feature vector (same order as training)
        features = np.array([[
            block_enc,
            crop_enc,
            season_enc,
            soil_enc,
            data.soil_ph_min,
            data.total_rain_mm,
            data.rain_deficit_mm,
            data.heat_stress_days,
            data.accumulated_gdd
        ]])

        # Step 3: Run the XGBoost model
        raw_predictions = model.predict(features)[0]

        # Step 4: Build a clean, labeled response
        result = {}
        for i, col in enumerate(target_cols):
            # Create a human-readable key by stripping the "Target_" prefix
            key = col.replace("Target_", "").replace("_", " ")
            value = round(float(raw_predictions[i]), 2)

            # Clamp values to valid range
            if "mm" in col.lower():
                value = max(0, value)  # mm cannot be negative
            else:
                value = max(0, min(100, value))  # percentages 0-100

            result[col] = value

        # Add a summary risk level for easy use in the React UI
        stress = result.get("Target_Stress_Risk_Pct", 0)
        if stress >= 70:
            risk_level = "CRITICAL"
            risk_color = "#ef4444"
        elif stress >= 45:
            risk_level = "HIGH"
            risk_color = "#f97316"
        elif stress >= 20:
            risk_level = "MODERATE"
            risk_color = "#eab308"
        else:
            risk_level = "LOW"
            risk_color = "#22c55e"

        response_data = {
            "status": "success",
            "input": {
                "block": data.block,
                "crop": data.crop,
                "season": data.season,
                "soil_type": data.soil_type,
                "soil_ph_min": data.soil_ph_min,
                "total_rain_mm": data.total_rain_mm,
                "rain_deficit_mm": data.rain_deficit_mm,
                "heat_stress_days": data.heat_stress_days,
                "accumulated_gdd": data.accumulated_gdd
            },
            "risk_level": risk_level,
            "risk_color": risk_color,
            "predictions": result
        }

        # Save to MongoDB
        if history_collection is not None:
            try:
                history_record = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "inputs_provided": response_data["input"],
                    "model_results": {
                        "overall_risk_level": risk_level,
                        "risk_color": risk_color,
                        **result
                    }
                }
                history_collection.insert_one(history_record)
            except Exception as e:
                print(f"Failed to save history to MongoDB: {e}")

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ─────────────────────────────────────────────
# LIVE DASHBOARD KPI ENDPOINT
# Returns real-time weather stats for Madurai
# ─────────────────────────────────────────────
@app.get("/dashboard")
def get_dashboard_kpis():
    """
    Returns live KPI values for the dashboard:
    - temp_anomaly_c: current vs 26-year baseline
    - annual_rain_mm: last 365 days total rainfall
    - heat_stress_days: days > 38°C in last 90 days
    - soil_moisture_index: proxy from rainfall vs optimal
    - risk_level + risk_color: overall alert
    - monthly_temp / monthly_rain: sparkline arrays (last 12 months)
    """
    lat, lon = 9.9252, 78.1198  # Madurai centre

    # ── 1. Last 365 days for annual figures ──
    url_annual = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&past_days=365&forecast_days=0"
    )
    # ── 2. Historical baseline (2000-2010) via archive ──
    url_baseline = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lon}"
        f"&start_date=2000-01-01&end_date=2009-12-31"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
    )

    try:
        r1 = requests.get(url_annual, timeout=8)
        annual = r1.json()["daily"]
        tmax_all = [t for t in annual["temperature_2m_max"] if t is not None]
        tmin_all = [t for t in annual["temperature_2m_min"] if t is not None]
        precip_all = [p if p is not None else 0 for p in annual["precipitation_sum"]]

        # Current year average temp
        current_avg_temp = (sum(tmax_all) + sum(tmin_all)) / (2 * len(tmax_all)) if tmax_all else 30.0
        annual_rain_mm = round(sum(precip_all), 1)
        heat_stress_days = sum(1 for t in tmax_all[-90:] if t > 38)

        # Monthly rollup (last 12 months) — group by 30-day buckets
        monthly_temp, monthly_rain = [], []
        for i in range(12):
            start = max(0, len(tmax_all) - (12 - i) * 30)
            end   = max(0, len(tmax_all) - (11 - i) * 30)
            chunk_max = tmax_all[start:end]
            chunk_min = tmin_all[start:end]
            chunk_rain = precip_all[start:end]
            avg_t = round((sum(chunk_max) + sum(chunk_min)) / (2 * len(chunk_max)), 1) if chunk_max else 0
            monthly_temp.append(avg_t)
            monthly_rain.append(round(sum(chunk_rain), 1))

    except Exception as e:
        print(f"Annual API error: {e}")
        current_avg_temp = 30.0
        annual_rain_mm = 820.0
        heat_stress_days = 8
        monthly_temp = [22,24,28,32,35,33,29,28,28,27,25,23]
        monthly_rain = [10,5,20,45,80,150,210,180,120,60,30,15]

    try:
        r2 = requests.get(url_baseline, timeout=10)
        base = r2.json()["daily"]
        bt_max = [t for t in base["temperature_2m_max"] if t is not None]
        bt_min = [t for t in base["temperature_2m_min"] if t is not None]
        baseline_avg = (sum(bt_max) + sum(bt_min)) / (2 * len(bt_max)) if bt_max else 29.0
    except Exception as e:
        print(f"Baseline API error: {e}")
        baseline_avg = 29.0

    temp_anomaly = round(current_avg_temp - baseline_avg, 2)

    # Soil Moisture Index proxy: actual rain / optimal rain (1100 mm/yr for Madurai)
    OPTIMAL_RAIN = 1100.0
    smi = round(min(1.0, annual_rain_mm / OPTIMAL_RAIN), 2)

    # Overall risk
    if temp_anomaly >= 2.0 or heat_stress_days >= 20 or smi < 0.4:
        risk_level, risk_color = "CRITICAL", "#ef4444"
    elif temp_anomaly >= 1.0 or heat_stress_days >= 10 or smi < 0.6:
        risk_level, risk_color = "HIGH", "#f97316"
    elif temp_anomaly >= 0.5 or heat_stress_days >= 5 or smi < 0.75:
        risk_level, risk_color = "MODERATE", "#eab308"
    else:
        risk_level, risk_color = "LOW", "#22c55e"

    # Readiness score (0-100): inverse of risk
    risk_map = {"CRITICAL": 25, "HIGH": 45, "MODERATE": 65, "LOW": 85}
    readiness_score = risk_map[risk_level]

    return {
        "status": "success",
        "temp_anomaly_c": temp_anomaly,
        "current_avg_temp_c": round(current_avg_temp, 1),
        "annual_rain_mm": annual_rain_mm,
        "heat_stress_days": heat_stress_days,
        "soil_moisture_index": smi,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "readiness_score": readiness_score,
        "monthly_temp": monthly_temp,
        "monthly_rain": monthly_rain,
        "fetched_at": datetime.utcnow().isoformat() + "Z"
    }



# ─────────────────────────────────────────────
# LIVE ADVISORY ENDPOINT
# Returns risk %, crop picks & AI advice from
# 90-day live Open-Meteo weather data
# ─────────────────────────────────────────────
@app.get("/advisory")
def get_advisory():
    lat, lon = 9.9252, 78.1198  # Madurai centre

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&past_days=90&forecast_days=14"
    )

    try:
        r = requests.get(url, timeout=8)
        daily = r.json()["daily"]

        tmax   = [t for t in daily["temperature_2m_max"]  if t is not None]
        tmin   = [t for t in daily["temperature_2m_min"]  if t is not None]
        precip = [p if p is not None else 0 for p in daily["precipitation_sum"]]

        total_rain_90d    = round(sum(precip[:90]), 1)
        forecast_rain_14d = round(sum(precip[90:]), 1)
        avg_max_temp      = round(sum(tmax[:90]) / len(tmax[:90]), 1) if tmax else 32.0
        heat_days_90      = sum(1 for t in tmax[:90] if t > 38)

        OPTIMAL_90D = 275.0   # ~1100 mm/yr ÷ 4
        FLOOD_90D   = 450.0

        drought_pct = max(0, min(100, round((1 - total_rain_90d / OPTIMAL_90D) * 100)))
        flood_raw   = ((total_rain_90d - OPTIMAL_90D) / (FLOOD_90D - OPTIMAL_90D)) * 100
        flood_pct   = max(0, min(100, round(flood_raw if total_rain_90d > OPTIMAL_90D else 0)))
        heat_pct    = max(0, min(100, round((heat_days_90 / 90) * 300)))  # scaled ×3

    except Exception as e:
        print(f"Advisory weather fetch error: {e}")
        total_rain_90d, forecast_rain_14d, avg_max_temp = 210.0, 35.0, 34.5
        heat_days_90  = 8
        drought_pct, flood_pct, heat_pct = 65, 10, 45

    # ── Dynamic crop scoring ──────────────────────────────
    crops_db = [
        {"name": "Drought-Resistant Sorghum", "icon": "grass",      "base": 82, "dr": True,  "hr": True,  "season": "Kharif (Monsoon)"},
        {"name": "Pearl Millet (Bajra)",       "icon": "psychiatry", "base": 78, "dr": True,  "hr": True,  "season": "Summer"},
        {"name": "Chickpea",                   "icon": "eco",        "base": 68, "dr": False, "hr": False, "season": "Rabi (Winter)"},
        {"name": "Rice (Samba)",                "icon": "water_drop", "base": 63, "dr": False, "hr": False, "season": "Samba (Sep–Jan)"},
        {"name": "Groundnut",                   "icon": "spa",        "base": 72, "dr": True,  "hr": False, "season": "Kharif (Monsoon)"},
    ]

    def score(c):
        s = c["base"]
        if c["dr"] and drought_pct > 40: s += min(14, drought_pct // 5)
        if c["hr"] and heat_pct > 30:    s += min(9, heat_pct // 10)
        if not c["dr"] and drought_pct > 55: s -= 14
        if not c["hr"] and heat_pct > 50:    s -= 10
        if c["name"] == "Rice (Samba)" and flood_pct > 30: s += 7
        return max(30, min(99, round(s)))

    top_crops = sorted(
        [{"name": c["name"], "icon": c["icon"], "season": c["season"], "confidence": score(c)} for c in crops_db],
        key=lambda x: x["confidence"], reverse=True
    )[:3]

    # ── Advice text ───────────────────────────────────────
    if drought_pct > 60:
        planting = (
            f"Delay sowing by 10–15 days — only {total_rain_90d} mm received in 90 days "
            f"(optimal: 275 mm). Forecast shows {forecast_rain_14d} mm over next 14 days. "
            f"Sow after next significant rain event."
        )
    elif drought_pct < 25:
        planting = (
            f"Excellent moisture — {total_rain_90d} mm over 90 days. Proceed with primary sowing this week. "
            f"Conditions favour both water-intensive and dryland crops."
        )
    else:
        planting = (
            f"Moderate moisture ({total_rain_90d} mm / 90 days). Prioritise drought-tolerant varieties. "
            f"Forecast rain: {forecast_rain_14d} mm over 14 days — monitor before committing to water-intensive crops."
        )

    if heat_pct > 50:
        irrigation = (
            f"Critical: {heat_days_90} days above 38°C detected. Apply drip irrigation strictly "
            f"pre-dawn (4–6 AM). Avg max temp {avg_max_temp}°C — increase session frequency, reduce volume."
        )
    elif heat_pct > 20:
        irrigation = (
            f"Elevated temperature — avg max {avg_max_temp}°C with {heat_days_90} stress days. "
            f"Use drip/sprinkler during cooler hours. Watch for heat wilting on sensitive crops."
        )
    else:
        irrigation = (
            f"Temperature within normal range ({avg_max_temp}°C avg max). Standard irrigation schedule is sufficient. "
            f"Forecast rain: {forecast_rain_14d} mm in 14 days will supplement field moisture."
        )

    # ── Risk labels ───────────────────────────────────────
    def risk_label(p):
        if p >= 70: return "Critical", "#ef4444"
        if p >= 45: return "High",     "#f97316"
        if p >= 20: return "Moderate", "#eab308"
        return "Low", "#22c55e"

    ds, dc = risk_label(drought_pct)
    fs, fc = risk_label(flood_pct)
    hs, hc = risk_label(heat_pct)

    # ── Action plan ───────────────────────────────────────
    immediate  = []
    short_term = []
    long_term  = []

    immediate.append("Inspect and clean drip irrigation filters." if heat_days_90 > 5
                      else "Check soil moisture levels across all plots.")
    immediate.append("Procure drought-resistant seeds urgently." if drought_pct > 50
                      else "Prepare fields for primary sowing this season.")
    short_term.append("Apply pre-sowing soil moisture retention treatments." if drought_pct > 40
                       else "Apply organic mulch to conserve soil moisture.")
    short_term.append(f"Monitor daily max temperature — current avg: {avg_max_temp}°C.")
    long_term.append("Evaluate crop rotation performance after harvest.")
    long_term.append(f"Prepare rainwater harvesting — forecast: {forecast_rain_14d} mm in next 14 days.")

    return {
        "status": "success",
        "metrics": {
            "total_rain_90d":    total_rain_90d,
            "forecast_rain_14d": forecast_rain_14d,
            "avg_max_temp":      avg_max_temp,
            "heat_days_90":      heat_days_90,
        },
        "risks": [
            {"name": "Drought Risk", "level": drought_pct, "color": dc, "status": ds, "icon": "dry"},
            {"name": "Flood Risk",   "level": flood_pct,   "color": fc, "status": fs, "icon": "flood"},
            {"name": "Heat Stress",  "level": heat_pct,    "color": hc, "status": hs, "icon": "local_fire_department"},
        ],
        "crops": top_crops,
        "advice": {
            "planting":    planting,
            "irrigation":  irrigation,
        },
        "action_plan": {
            "immediate":  immediate,
            "short_term": short_term,
            "long_term":  long_term,
        },
        "fetched_at": datetime.utcnow().isoformat() + "Z"
    }


# ─────────────────────────────────────────────
# GET VALID OPTIONS FOR THE REACT DROPDOWNS
# ─────────────────────────────────────────────
@app.get("/options")
def get_options():
    """Returns all valid dropdown values for the React frontend."""
    return {
        "blocks": list(encoders["Block"].classes_),
        "crops": list(encoders["Crop"].classes_),
        "seasons": list(encoders["Season"].classes_),
        "soil_types": list(encoders["Soil_Type"].classes_)
    }

@app.get("/history")
def get_history():
    if history_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        # Include _id and convert to string for React to use
        records = list(history_collection.find({}).sort("timestamp", -1).limit(50))
        for r in records:
            r["_id"] = str(r["_id"])
        return {"status": "success", "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history")
def clear_history():
    if history_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        history_collection.delete_many({})
        return {"status": "success", "message": "All history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history/{record_id}")
def delete_history_record(record_id: str):
    if history_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        result = history_collection.delete_one({"_id": ObjectId(record_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"status": "success", "message": "Record deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # This allows you to run the server simply by executing: python server.py
    print("Starting server on http://127.0.0.1:8000")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
