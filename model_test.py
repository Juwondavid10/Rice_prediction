import pandas as pd
import joblib

# Load the saved model from the file
loaded_model = joblib.load('rice_yield_model.joblib')

# Create a DataFrame for your new, unseen data
# You'll need to replace these values with actual climate data for the year
# you want to predict (e.g., 2024).
new_data = pd.DataFrame({
    'Total_Rainfall_mm': [1250.4],
    'Average_Temperature_C': [29.9]
})

# Make the prediction using the loaded model
predicted_yield = loaded_model.predict(new_data)

# Print the predicted result
print(f"The predicted rice yield for the new data is: {predicted_yield[0]:.4f} tons/ha")
