import pandas as pd
from sklearn.model_selection import LeaveOneOut
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import joblib

# Step 1: Data Preparation and Aggregation
# This is the corrected approach to avoid data leakage

# Load the monthly climate data
climate_df = pd.read_csv('kogi_climate.csv')

# Aggregate the monthly data to yearly data
yearly_climate_df = climate_df.groupby('Year').agg(
    Total_Rainfall_mm=('Rainfall_mm', 'sum'),
    Average_Temperature_C=('Temperature_C', 'mean')
).reset_index()

# Load the yearly yield data
yield_df = pd.read_csv('Kogi_yield.csv')

# Merge the yearly climate data with the yearly yield data
merged_yearly_df = pd.merge(yearly_climate_df, yield_df, on='Year')

# Separate features (X) and target (y)
X = merged_yearly_df.drop(['Year', 'Yield_tons/ha'], axis=1)
y = merged_yearly_df['Yield_tons/ha']

# Step 2: Model Evaluation using Leave-One-Out Cross-Validation (LOOCV)
# This is the most reliable way to evaluate the model on this small dataset

# Initialize Leave-One-Out cross-validator
loocv = LeaveOneOut()
mse_scores = []
r2_scores = []

print("Evaluating model performance using Leave-One-Out Cross-Validation...")

for train_index, test_index in loocv.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]

    # Initialize and train the model for the current fold
    model_eval = RandomForestRegressor(n_estimators=100, random_state=42)
    model_eval.fit(X_train, y_train)

    # Make prediction and calculate metrics
    y_pred = model_eval.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    mse_scores.append(mse)
    r2_scores.append(r2)

print(f"\nAverage Mean Squared Error (MSE): {np.mean(mse_scores):.4f}")
print(f"Average R-squared (R2) Score: {np.mean(r2_scores):.4f}")

# Step 3: Train the Final Model on the entire dataset
# This model will be used for future predictions as it has been trained on all available data
print("\nTraining final model on the entire dataset for deployment...")
final_model = RandomForestRegressor(n_estimators=100, random_state=42)
final_model.fit(X, y)
print("Final model training complete.")

# Step 4: Save the final trained model
model_filename = 'rice_yield_model.joblib'
joblib.dump(final_model, model_filename)

print(f"\nFinal model has been saved to '{model_filename}'")
