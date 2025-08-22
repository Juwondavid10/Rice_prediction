# Import necessary libraries from the Flask framework
from flask import Flask, request, jsonify

# Create a new Flask application instance
app = Flask(__name__)

# This is a placeholder function for the rice yield prediction model.
# In a real-world application, you would load your trained model here
# using libraries like scikit-learn and joblib.
# Example: model = joblib.load('your_rice_yield_model.pkl')
def predict_yield(features):
    """
    Predicts the rice yield in tons per hectare based on a set of features.
    
    This function uses a simple, linear dummy model for demonstration purposes.
    The real machine learning model's prediction logic should replace this.

    Args:
        features (dict): A dictionary containing the input variables.
    
    Returns:
        float: The predicted yield in tons per hectare.
    """
    try:
        # Extract the features from the input dictionary
        n = features.get('n_kg_ha', 0)
        p = features.get('p_kg_ha', 0)
        k = features.get('k_kg_ha', 0)
        irrigation = 1 if features.get('irrigation') == 'Yes' else 0
        
        # Map pest risk strings to numerical values
        pest_risk_map = {'Low': 1, 'Medium': 0.5, 'High': 0}
        pest_risk = pest_risk_map.get(features.get('pest_risk'), 0.5)

        avg_temp = features.get('average_temperature_c', 0)
        total_rainfall = features.get('total_rainfall_mm', 0)
        clay = features.get('clay', 0)
        sand = features.get('sand', 0)
        silt = features.get('silt', 0)

        # This is the dummy prediction formula from the frontend.
        # REPLACE THIS with your actual model's prediction logic.
        predicted_yield = (
            (0.05 * n) + (0.03 * p) + (0.02 * k) + (0.5 * irrigation) - (0.3 * pest_risk) +
            (0.1 * avg_temp) + (0.005 * total_rainfall) + (0.01 * clay) - (0.005 * sand) + (0.008 * silt)
        )

        # Ensure the yield is not a negative value
        return max(0, predicted_yield)

    except Exception as e:
        print(f"Error during prediction: {e}")
        return None

# Define the API endpoint for prediction. It only accepts POST requests.
@app.route('/predict', methods=['POST'])
def handle_predict():
    """
    Handles incoming POST requests to the /predict endpoint.
    It takes JSON data, runs the prediction, and returns a JSON response.
    """
    # Check if the request body is valid JSON
    if not request.json:
        return jsonify({'error': 'Invalid JSON in request body'}), 400

    # Get the features from the JSON data
    features = request.json
    
    # Call the prediction function with the received features
    predicted_value = predict_yield(features)

    # Check if the prediction was successful
    if predicted_value is None:
        return jsonify({'error': 'Prediction failed'}), 500

    # Return the prediction result as a JSON object
    return jsonify({'predicted_yield': predicted_value})

# This block ensures the application runs only when the script is executed directly.
if __name__ == '__main__':
    # Run the Flask app on host 0.0.0.0 to make it accessible externally
    # and on port 5000.
    app.run(host='0.0.0.0', port=5000)
