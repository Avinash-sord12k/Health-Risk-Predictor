from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# Load trained model
model = joblib.load("health_risk_model.pkl")
X_columns = model.feature_names_in_

from enum import Enum
from pydantic import BaseModel
from typing import Optional

# Enums for validation
class GenderEnum(str, Enum):
    male = "male"
    female = "female"

class SmokingEnum(str, Enum):
    never = "never"
    former = "former"
    current = "current"

class AlcoholEnum(str, Enum):
    none = "none"
    occasional = "occasional"
    regular = "regular"

class ActivityEnum(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"

class ExistingConditionsEnum(str, Enum):
    asthma = "asthma"
    copd = "copd"
    hypertension = "hypertension"
    diabetes = "diabetes"

# Request schema with enums
class HealthInput(BaseModel):
    Age: int
    Gender: GenderEnum
    Height_cm: int
    Weight_kg: int
    BMI: float
    SmokingStatus: SmokingEnum
    AlcoholUse: AlcoholEnum
    ActivityLevel: ActivityEnum
    SleepHours: int
    FruitVegIntake: int
    FamilyHistory_HeartDisease: bool
    FamilyHistory_Diabetes: bool
    ExistingConditions: Optional[ExistingConditionsEnum] = None
    BP_Systolic: int
    BP_Diastolic: int
    FastingGlucose: int
    Cholesterol: int


# Initialize FastAPI
app = FastAPI(title="Health Risk Predictor API")

@app.post("/predict")
def predict_risk(data: HealthInput):
    # Convert input to DataFrame
    df = pd.DataFrame([data.dict()])

    # One-hot encode like training
    df_encoded = pd.get_dummies(df)

    # Align columns with training set
    df_encoded = df_encoded.reindex(columns=X_columns, fill_value=0)

    # Predict
    pred = model.predict(df_encoded)[0]

    # Output mapping
    risk_cols = [
        "Risk_Cardiovascular",
        "Risk_Metabolic_Endocrine",
        "Risk_Respiratory",
        "Risk_Liver",
        "Risk_Nutritional"
    ]
    results = {name: round(value * 100, 1) for name, value in zip(risk_cols, pred)}

    return {
        "input": data.dict(),
        "predicted_risks_percent": results
    }

# Run using: uvicorn main:app --reload
