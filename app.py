import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS # Import the CORS library

# 1. Load the trained model
try:
    model = joblib.load('rice_yield_model.joblib')
    print("Model loaded successfully.")
except FileNotFoundError:
    print("Error: 'rice_yield_model.joblib' not found. Please ensure the model file is in the same directory.")
    exit()

# 2. Initialize the Flask application
app = Flask(__name__)

# 3. Enable CORS for all routes
# This allows requests from your React frontend (e.g., http://localhost:3000)
CORS(app)

# 4. Define the API endpoint for predictions
@app.route('/predict', methods=['POST'])
def predict():
    # Get the JSON data from the request
    data = request.get_json()

    # Create a pandas DataFrame from the incoming data
    new_data = pd.DataFrame(data, index=[0])

    # Make a prediction using the loaded model
    prediction = model.predict(new_data)

    # Return the prediction as a JSON response
    return jsonify({
        'predicted_yield': prediction[0]
    })

# 5. Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)