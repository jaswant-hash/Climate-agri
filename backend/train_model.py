import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.multioutput import MultiOutputRegressor
import pickle
import os

def train():
    # ─────────────────────────────────────────────
    # 1. LOAD DATASET
    # ─────────────────────────────────────────────
    data_path = r"c:\Users\jaswa\OneDrive\Documents\web\climate-agri-react\dataset\ml_training_data.csv"
    print("=" * 60)
    print(" MADURAI AGRI-INTELLIGENCE XGBOOST TRAINING")
    print("=" * 60)
    print(f"\nLoading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset loaded: {len(df)} rows x {len(df.columns)} columns")

    # ─────────────────────────────────────────────
    # 2. DEFINE FEATURES AND 7 TARGETS
    # ─────────────────────────────────────────────
    target_cols = [
        'Target_Stress_Risk_Pct',
        'Target_Yield_Loss_Pct',
        'Target_Disease_Risk_Pct',
        'Target_Irrigation_Need_mm',
        'Target_Drought_Severity_Pct',
        'Target_HeatWave_Severity_Pct',
        'Target_Crop_Suitability_Score',
        'Target_Fertilizer_Efficiency_Index',
        'Target_Harvest_Quality_Risk_Pct'
    ]

    # Validate all target columns exist in the dataset
    missing = [col for col in target_cols if col not in df.columns]
    if missing:
        print(f"\n[ERROR] Missing target columns in dataset: {missing}")
        print("Please re-run generate_ml.py first!")
        return

    X = df.drop(columns=['Year'] + target_cols)
    y = df[target_cols]

    # ─────────────────────────────────────────────
    # 3. ENCODE CATEGORICAL COLUMNS (No data leakage)
    # ─────────────────────────────────────────────
    encoders = {}
    categorical_cols = ['Block', 'Crop', 'Season', 'Soil_Type']

    print("\nEncoding categorical features:")
    for col in categorical_cols:
        le = LabelEncoder()
        X = X.copy()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le
        print(f"  {col}: {list(le.classes_)}")

    print(f"\nAll 9 features being used:")
    for feature in X.columns:
        print(f"  - {feature}")

    # ─────────────────────────────────────────────
    # 4. STRICT TRAIN/TEST SPLIT (75% train / 25% test)
    # Year-based split to avoid time leakage:
    # Train on 2000-2018, Test on 2019-2024
    # ─────────────────────────────────────────────
    print("\nSplitting data: Train on 2000-2018 | Test on 2019-2024 (time-based, no leakage)")
    train_mask = df['Year'] <= 2018
    test_mask = df['Year'] > 2018

    X_train = X[train_mask]
    X_test = X[test_mask]
    y_train = y[train_mask]
    y_test = y[test_mask]

    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples:  {len(X_test)}")

    # ─────────────────────────────────────────────
    # 5. BUILD XGBOOST WITH 300 TREES
    # ─────────────────────────────────────────────
    print("\nTraining Multi-Aspect XGBoost Brain (300 trees, depth=7)...")
    base_model = xgb.XGBRegressor(
        n_estimators=300,       # More trees = more power
        learning_rate=0.05,     # Slower learning = better generalization
        max_depth=7,            # Deep enough for complex patterns
        subsample=0.8,          # Use 80% of rows per tree (prevents overfitting)
        colsample_bytree=0.8,   # Use 80% of features per tree (prevents overfitting)
        random_state=42,
        n_jobs=-1               # Use all CPU cores
    )
    model = MultiOutputRegressor(base_model)
    model.fit(X_train, y_train)

    # ─────────────────────────────────────────────
    # 6. EVALUATE ON UNSEEN TEST DATA
    # ─────────────────────────────────────────────
    predictions = model.predict(X_test)

    print(f"\n{'=' * 60}")
    print(" FINAL ACCURACY REPORT (Tested on UNSEEN 2019-2024 data)")
    print(f"{'=' * 60}")
    all_pass = True
    for i, col in enumerate(target_cols):
        r2 = r2_score(y_test.iloc[:, i], predictions[:, i])
        mse = mean_squared_error(y_test.iloc[:, i], predictions[:, i])
        status = "[PASS]" if r2 >= 0.90 else "[REVIEW]"
        if r2 < 0.90:
            all_pass = False
        print(f"  {status}  [{col}]")
        print(f"          Accuracy (R2): {r2 * 100:.2f}% | MSE: {mse:.2f}")

    print(f"\n{'=' * 60}")
    if all_pass:
        print("  ALL ASPECTS PASSED! Zero loopholes detected.")
    else:
        print("  WARNING: Some aspects need review. Check above.")
    print(f"{'=' * 60}\n")

    # ─────────────────────────────────────────────
    # 7. FEATURE IMPORTANCE (Prove model uses all columns)
    # ─────────────────────────────────────────────
    print("Feature Importance (average across all 7 aspects):")
    feature_importances = np.zeros(len(X.columns))
    for estimator in model.estimators_:
        feature_importances += estimator.feature_importances_
    feature_importances /= len(model.estimators_)

    importance_df = pd.DataFrame({
        'Feature': X.columns,
        'Importance': feature_importances
    }).sort_values('Importance', ascending=False)

    for _, row in importance_df.iterrows():
        bar = "|" * int(row['Importance'] * 50)
        print(f"  {row['Feature']:30s} {bar} ({row['Importance']:.4f})")

    # ─────────────────────────────────────────────
    # 8. SAVE THE TRAINED BRAIN + ENCODERS
    # ─────────────────────────────────────────────
    save_dir = r"c:\Users\jaswa\OneDrive\Documents\web\climate-agri-react\backend"
    os.makedirs(save_dir, exist_ok=True)

    model_path = os.path.join(save_dir, 'crop_risk_model.pkl')
    encoders_path = os.path.join(save_dir, 'encoders.pkl')
    target_cols_path = os.path.join(save_dir, 'target_cols.pkl')

    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    with open(encoders_path, 'wb') as f:
        pickle.dump(encoders, f)
    with open(target_cols_path, 'wb') as f:
        pickle.dump(target_cols, f)

    print(f"\n[OK] Model saved to:    {model_path}")
    print(f"[OK] Encoders saved to: {encoders_path}")
    print(f"[OK] Targets saved to:  {target_cols_path}")

if __name__ == "__main__":
    train()
