import React, { useState } from "react";

type HealthFormData = {
  Age: number;
  Gender: string;
  Height_cm: number;
  Weight_kg: number;
  BMI: number;
  SmokingStatus: string;
  AlcoholUse: string;
  ActivityLevel: string;
  SleepHours: number;
  FruitVegIntake: number;
  FamilyHistory_HeartDisease: boolean;
  FamilyHistory_Diabetes: boolean;
  ExistingConditions: string;
  BP_Systolic: number;
  BP_Diastolic: number;
  FastingGlucose: number;
  Cholesterol: number;
};

export default function HealthRiskForm() {
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [formData, setFormData] = useState<HealthFormData>({
    Age: 30,
    Gender: "male",
    Height_cm: 175,
    Weight_kg: 75,
    BMI: 24.5,
    SmokingStatus: "never",
    AlcoholUse: "none",
    ActivityLevel: "moderate",
    SleepHours: 7,
    FruitVegIntake: 3,
    FamilyHistory_HeartDisease: false,
    FamilyHistory_Diabetes: false,
    ExistingConditions: "",
    BP_Systolic: 120,
    BP_Diastolic: 80,
    FastingGlucose: 90,
    Cholesterol: 100,
  });

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.Age || formData.Age < 1) {
      errors.Age = "Age must be at least 1";
    }
    if (!formData.Gender) {
      errors.Gender = "Please select a gender";
    }
    if (!formData.Height_cm || formData.Height_cm < 1) {
      errors.Height_cm = "Height must be at least 1 cm";
    }
    if (!formData.Weight_kg || formData.Weight_kg < 1) {
      errors.Weight_kg = "Weight must be at least 1 kg";
    }
    if (!formData.BMI || formData.BMI < 1) {
      errors.BMI = "BMI must be at least 1";
    }
    if (!formData.SmokingStatus) {
      errors.SmokingStatus = "Please select smoking status";
    }
    if (!formData.AlcoholUse) {
      errors.AlcoholUse = "Please select alcohol use";
    }
    if (!formData.ActivityLevel) {
      errors.ActivityLevel = "Please select activity level";
    }
    if (formData.SleepHours < 1 || formData.SleepHours > 24) {
      errors.SleepHours = "Sleep hours must be between 1 and 24";
    }
    if (formData.FruitVegIntake < 0) {
      errors.FruitVegIntake = "Fruit/vegetable intake cannot be negative";
    }
    if (formData.BP_Systolic < 70 || formData.BP_Systolic > 250) {
      errors.BP_Systolic = "Systolic BP must be between 70 and 250";
    }
    if (formData.BP_Diastolic < 40 || formData.BP_Diastolic > 150) {
      errors.BP_Diastolic = "Diastolic BP must be between 40 and 150";
    }
    if (formData.FastingGlucose < 50 || formData.FastingGlucose > 400) {
      errors.FastingGlucose = "Fasting glucose must be between 50 and 400";
    }
    if (formData.Cholesterol < 100 || formData.Cholesterol > 500) {
      errors.Cholesterol = "Cholesterol must be between 100 and 500";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof HealthFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        ExistingConditions: formData.ExistingConditions || null,
      };

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      setResult(json.predicted_risks_percent);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏥 Health Risk Assessment
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized health risk predictions based on your profile
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              👤 Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={formData.Age}
                  onChange={(e) =>
                    handleInputChange("Age", parseInt(e.target.value) || 0)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your age"
                />
                {validationErrors.Age && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.Age}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.Gender}
                  onChange={(e) => handleInputChange("Gender", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {validationErrors.Gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.Gender}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.Height_cm}
                  onChange={(e) =>
                    handleInputChange(
                      "Height_cm",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter height in cm"
                />
                {validationErrors.Height_cm && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.Height_cm}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.Weight_kg}
                  onChange={(e) =>
                    handleInputChange(
                      "Weight_kg",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter weight in kg"
                />
                {validationErrors.Weight_kg && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.Weight_kg}
                  </p>
                )}
              </div>

              {/* BMI */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMI (Body Mass Index)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.BMI}
                  onChange={(e) =>
                    handleInputChange("BMI", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your BMI"
                />
                {validationErrors.BMI && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.BMI}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lifestyle Information Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              🏃 Lifestyle Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Smoking Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Status
                </label>
                <select
                  value={formData.SmokingStatus}
                  onChange={(e) =>
                    handleInputChange("SmokingStatus", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select smoking status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
                {validationErrors.SmokingStatus && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.SmokingStatus}
                  </p>
                )}
              </div>

              {/* Alcohol Use */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcohol Consumption
                </label>
                <select
                  value={formData.AlcoholUse}
                  onChange={(e) =>
                    handleInputChange("AlcoholUse", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select alcohol consumption</option>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="regular">Regular</option>
                </select>
                {validationErrors.AlcoholUse && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.AlcoholUse}
                  </p>
                )}
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Activity Level
                </label>
                <select
                  value={formData.ActivityLevel}
                  onChange={(e) =>
                    handleInputChange("ActivityLevel", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select activity level</option>
                  <option value="low">Low (sedentary)</option>
                  <option value="moderate">Moderate (some exercise)</option>
                  <option value="high">High (very active)</option>
                </select>
                {validationErrors.ActivityLevel && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.ActivityLevel}
                  </p>
                )}
              </div>

              {/* Sleep Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours (per night)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.SleepHours}
                  onChange={(e) =>
                    handleInputChange(
                      "SleepHours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Hours of sleep per night"
                />
                {validationErrors.SleepHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.SleepHours}
                  </p>
                )}
              </div>

              {/* FruitVegIntake */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fruit & Vegetable Servings (per day)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.FruitVegIntake}
                  onChange={(e) =>
                    handleInputChange(
                      "FruitVegIntake",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Number of fruit/vegetable servings daily"
                />
                {validationErrors.FruitVegIntake && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.FruitVegIntake}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              🧬 Medical History
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Family History Heart Disease */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family History of Heart Disease
                </label>
                <select
                  value={formData.FamilyHistory_HeartDisease.toString()}
                  onChange={(e) =>
                    handleInputChange(
                      "FamilyHistory_HeartDisease",
                      e.target.value === "true",
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Family History Diabetes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family History of Diabetes
                </label>
                <select
                  value={formData.FamilyHistory_Diabetes.toString()}
                  onChange={(e) =>
                    handleInputChange(
                      "FamilyHistory_Diabetes",
                      e.target.value === "true",
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Existing Conditions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Medical Conditions (if any)
                </label>
                <select
                  value={formData.ExistingConditions}
                  onChange={(e) =>
                    handleInputChange("ExistingConditions", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">None</option>
                  <option value="asthma">Asthma</option>
                  <option value="copd">COPD</option>
                  <option value="hypertension">Hypertension</option>
                  <option value="diabetes">Diabetes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vital Signs Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              📊 Vital Signs & Lab Results
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Blood Pressure Systolic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure - Systolic (mmHg)
                </label>
                <input
                  type="number"
                  min="70"
                  max="250"
                  value={formData.BP_Systolic}
                  onChange={(e) =>
                    handleInputChange(
                      "BP_Systolic",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Systolic blood pressure"
                />
                {validationErrors.BP_Systolic && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.BP_Systolic}
                  </p>
                )}
              </div>

              {/* Blood Pressure Diastolic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure - Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={formData.BP_Diastolic}
                  onChange={(e) =>
                    handleInputChange(
                      "BP_Diastolic",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Diastolic blood pressure"
                />
                {validationErrors.BP_Diastolic && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.BP_Diastolic}
                  </p>
                )}
              </div>

              {/* Fasting Glucose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="50"
                  max="400"
                  value={formData.FastingGlucose}
                  onChange={(e) =>
                    handleInputChange(
                      "FastingGlucose",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Fasting glucose level"
                />
                {validationErrors.FastingGlucose && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.FastingGlucose}
                  </p>
                )}
              </div>

              {/* Cholesterol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  value={formData.Cholesterol}
                  onChange={(e) =>
                    handleInputChange(
                      "Cholesterol",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Total cholesterol level"
                />
                {validationErrors.Cholesterol && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.Cholesterol}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "🔄 Analyzing..." : "🔍 Get Health Risk Prediction"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">❌ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-l-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              📈 Prediction Results
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">{value}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
