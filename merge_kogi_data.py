import pandas as pd

# Load the CSV files into pandas DataFrames
Climate_df = pd.read_csv('kogi_climate.csv')
Yield_df = pd.read_csv('Kogi_yield.csv')
Soil_df = pd.read_csv('kogi_soil.csv')

# Step 1: Merge the climate and yield data
# We’ll perform a left merge on the ‘Year’ column.
# This ensures we keep all monthly climate data and add the corresponding yearly yield.
# Note: Since the yield data is yearly, the yield value for a given year will be repeated for each month of that year.
Merged_df = pd.merge(Climate_df, Yield_df, on='Year', how='left')

# Step 2: Merge the combined data with the soil data
# The soil data is constant for the Kogi region, so we will merge it
# based on a shared value. We can create a ‘Region’ column in the
# merged DataFrame to match the ‘Region’ column in the soil DataFrame.
Merged_df['Region'] = 'Kogi'
Final_df = pd.merge(Merged_df, Soil_df, on='Region', how='left')

# Optional: Drop the now redundant ‘Region’ and ‘Soil_Type’ columns from the final DataFrame
# If you don’t need these specific columns, you can drop them.
Final_df = Final_df.drop(columns=['Region', 'Soil_Type'])
Final_df = Final_df.drop_duplicates()

# Display the first few rows of the final merged DataFrame
print('Final Merged DataFrame:')
print(Final_df.head())

# Save the final merged DataFrame to a new CSV file
Final_df.to_csv('merged_kogi_data.csv', index=False)
print('\nMerged data has been saved to ‘merged_kogi_data.csv/n')