import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

# Load the merged data
merged_df = pd.read_csv('merged_kogi_data.csv')

# Handle missing yield values using forward-fill within each year
merged_df['Yield_tons/ha'] = merged_df.groupby('Year')['Yield_tons/ha'].ffill()

# Separate features (X) and target (y)
X = merged_df.drop('Yield_tons/ha', axis=1)
y = merged_df['Yield_tons/ha']

# Identify categorical features to encode
categorical_features = ['Month']

# Apply one-hot encoding
one_hot_encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
encoded_features = one_hot_encoder.fit_transform(X[categorical_features])
encoded_feature_names = one_hot_encoder.get_feature_names_out(categorical_features)
encoded_df = pd.DataFrame(encoded_features, columns=encoded_feature_names)

# Combine the numerical features with the encoded categorical features
X_numeric = X.drop(columns=categorical_features)
X_processed = pd.concat([X_numeric.reset_index(drop=True), encoded_df], axis=1)

# Display the first few rows of the processed features
print("Processed Features (X_processed):")
print(X_processed.head())

# Split the data into training and testing sets
# This is a critical step to evaluate your model's performance on unseen data
X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)

print(f"\nTraining set size: {X_train.shape[0]} samples")
print(f"Testing set size: {X_test.shape[0]} samples")
