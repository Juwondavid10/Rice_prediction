import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

function App() {
  const [rainfall, setRainfall] = useState('');
  const [temperature, setTemperature] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    const dataToSend = {
      Total_Rainfall_mm: parseFloat(rainfall),
      Average_Temperature_C: parseFloat(temperature),
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result.predicted_yield);
    } catch (e) {
      setError('Failed to fetch prediction. Please ensure the backend server is running.');
      console.error("Prediction fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rice Yield Prediction
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Enter the yearly climate data to get a rice yield prediction.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Total Annual Rainfall (mm)"
            type="number"
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Average Annual Temperature (°C)"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Get Prediction'}
          </Button>
        </Box>

        {prediction !== null && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">
              Predicted Rice Yield: **{prediction.toFixed(4)}** tons/ha
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Box>
    </Container>

  );
}

export default App;
