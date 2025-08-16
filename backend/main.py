from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import os

# ------------------------
# Load trained models
# ------------------------
model_files = {
    "cardiovascular": "trained_models/xgb_Risk_Cardiovascular.joblib",
    "metabolic": "trained_models/xgb_Risk_Metabolic_Endocrine.joblib",
    "respiratory": "trained_models/xgb_Risk_Respiratory.joblib",
    "liver": "trained_models/xgb_Risk_Liver.joblib",
    "nutritional": "trained_models/xgb_Risk_Nutritional.joblib",
}

trained_models = {k: joblib.load(v) for k, v in model_files.items()}

# ------------------------
# Load encoders and scaler
# ------------------------
encoders = joblib.load("trained_models/encoders.joblib")
scaler = joblib.load("trained_models/scaler.joblib")

categorical_cols = ["Gender", "SmokingStatus", "AlcoholUse", "ActivityLevel", "ExistingConditions"]


# ------------------------
# Enums for validation
# ------------------------
class GenderEnum(str, Enum):
    male = "male"
    female = "female"


class SmokingEnum(str, Enum):
    never = "never"
    former = "former"
    occasional = "occasional"
    passive = "passive"
    current = "current"
    current_light = "current_light"
    current_heavy = "current_heavy"


class AlcoholEnum(str, Enum):
    none = "none"
    occasional = "occasional"
    regular = "regular"
    heavy = "heavy"


class ActivityEnum(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"


class ExistingConditionsEnum(str, Enum):
    asthma = "asthma"
    copd = "copd"
    hypertension = "hypertension"
    diabetes = "diabetes"
    chronic_kidney_disease = "chronic_kidney_disease"
    none = "none"
    hepatitis = "hepatitis"
    hepatitis_b = "hepatitis_b"
    hepatitis_c = "hepatitis_c"


# ------------------------
# Request schema
# ------------------------
class HealthInput(BaseModel):
    Age: int
    Gender: GenderEnum = Field(...)
    Height_cm: int
    Weight_kg: int
    BMI: float
    SmokingStatus: SmokingEnum  = Field(...)
    AlcoholUse: AlcoholEnum = Field(...)
    ActivityLevel: ActivityEnum = Field(...)
    SleepHours: int
    FruitVegIntake: int
    ExistingConditions: Optional[ExistingConditionsEnum] = Field(...)
    FamilyHistory_HeartDisease: bool
    FamilyHistory_Diabetes: bool
    BP_Systolic: int
    BP_Diastolic: int
    FastingGlucose: int
    Cholesterol: int
    
    class Config:
        use_enum_values = True  # Critical fix here


# ------------------------
# Initialize FastAPI
# ------------------------
app = FastAPI(title="Health Risk Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # update as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# Prediction function
# ------------------------
@app.post("/predict")
def predict_risk(input_data: HealthInput) -> dict:


    try:
        print(input_data.model_dump())
        df = pd.DataFrame([input_data.model_dump()])

        # Ensure all categorical columns exist
        for col in categorical_cols:
            if col not in df.columns:
                df[col] = "none"

        # Encode categorical features
        for col in categorical_cols:
            if col in encoders:
                le = encoders[col]
                df[col] = df[col].map(
                    lambda x: x if x in le.classes_ else le.classes_[0]
                )
                df[col] = le.transform(df[col])

        # Ensure all numeric columns from training exist
        numeric_cols = [
            "BP_Systolic",
            "BP_Diastolic",
            "Cholesterol",
            "FastingGlucose",
            "FamilyHistory_Diabetes",
        ]
        for col in numeric_cols:
            if col not in df.columns:
                df[col] = 0  # default value
                
        # Drop any risk columns if present
        X_input = df.drop(
            columns=[c for c in df.columns if c.startswith("Risk_")], errors="ignore"
        )

        # Reorder columns exactly like training
        training_cols = joblib.load(
            "trained_models/training_columns.joblib"
        )  # save this during training
        X_input = X_input[training_cols]

        # Standardize features
        X_scaled = scaler.transform(X_input)

        # Predict each target and convert to percentage
        predictions = {}
        for key, model in trained_models.items():
            pred = model.predict(X_scaled)[0]  # single row
            # predictions[key] = round(float(np.clip(pred, 0, 1)) * 100, 2)
            predictions[key] = round(float(np.clip(pred, 0, 1)) * 100, 2)

        return {"predicted_risks_percent": predictions}

    except Exception as e:
        print(e)
        return {"error": str(e)}
