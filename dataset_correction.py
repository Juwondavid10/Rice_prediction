import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Step 1: Aggregate monthly climate data to yearly data
climate_df = pd.read_csv('kogi_climate.csv')

# Group by 'Year' and aggregate the climate variables
yearly_climate_df = climate_df.groupby('Year').agg(
    Total_Rainfall_mm=('Rainfall_mm', 'sum'),
    Average_Temperature_C=('Temperature_C', 'mean')
).reset_index()

# Step 2: Load the yearly yield data
yield_df = pd.read_csv('Kogi_yield.csv')

# Merge the yearly climate data with the yearly yield data
merged_yearly_df = pd.merge(yearly_climate_df, yield_df, on='Year')

# Step 3: Train the Random Forest Model with the corrected data
# Separate features (X) and target (y)
X = merged_yearly_df.drop(['Year', 'Yield_tons/ha'], axis=1)
y = merged_yearly_df['Yield_tons/ha']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
print("Training the Random Forest model with corrected data...")
model.fit(X_train, y_train)
print("Model training complete.")

# Step 4: Make predictions and evaluate
y_pred = model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\nCorrected Model Performance on Test Data:")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"R-squared (R2) Score: {r2:.4f}")
