import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GrassOutlinedIcon from '@mui/icons-material/GrassOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

// A simple utility to format numbers for display
const formatNumber = (num) => num.toFixed(2);

// Mock function for making a prediction. In a real app,
// this would be an API call to a backend server.
const predictYield = (features) => {
  // A simple dummy model to show functionality.
  // In a real application, you would send 'features' to your backend
  // which would use your trained model to make a prediction.
  const n = features.n_kg_ha;
  const p = features.p_kg_ha;
  const k = features.k_kg_ha;
  const irrigation = features.irrigation === 'Yes' ? 1 : 0;
  const pestRisk = features.pest_risk === 'Low' ? 1 : (features.pest_risk === 'Medium' ? 0.5 : 0);
  const avgTemp = features.average_temperature_c;
  const totalRainfall = features.total_rainfall_mm;
  const clay = features.clay;
  const sand = features.sand;
  const silt = features.silt;

  // This formula is a placeholder. Replace it with your model's actual prediction logic.
  // For a full app, you would use a backend server to load and run your Python model.
  const predictedYield =
    (0.05 * n) + (0.03 * p) + (0.02 * k) + (0.5 * irrigation) - (0.3 * pestRisk) +
    (0.1 * avgTemp) + (0.005 * totalRainfall) + (0.01 * clay) - (0.005 * sand) + (0.008 * silt);

  return Math.max(0, predictedYield); // Ensure yield is not negative
};

const App = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [inputs, setInputs] = useState(() => {
    const initialState = {
      n_kg_ha: '', p_kg_ha: '', k_kg_ha: '',
      irrigation: 'No', pest_risk: 'Medium',
      clay: '', sand: '', silt: '',
      total_rainfall_mm: '', average_temperature_c: '',
      monthly_rainfall: Array(12).fill(''),
      monthly_temperature: Array(12).fill(''),
    };
    return initialState;
  });

  const [prediction, setPrediction] = useState(null);
  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // New state variables for the Gemini API feature
  const [advice, setAdvice] = useState('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Animation for the result card
  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: prediction !== null ? 1 : 0, transform: 'translateY(0px)' },
    config: { tension: 180, friction: 12 },
    reset: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleMonthlyChange = (e, index, type) => {
    const newValues = [...inputs[type]];
    newValues[index] = e.target.value;
    setInputs({ ...inputs, [type]: newValues });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setPrediction(null);
    setRemark('');
    setAdvice(''); // Clear previous advice

    let features;
    if (isMonthly) {
      // Validate all monthly inputs are filled
      const allMonthlyInputsFilled = inputs.monthly_rainfall.every(val => val !== '') && inputs.monthly_temperature.every(val => val !== '');
      if (!allMonthlyInputsFilled) {
        setMessage('Please fill in all monthly climate data fields.');
        setIsLoading(false);
        return;
      }

      // Aggregate monthly data for the model
      const totalRainfall = inputs.monthly_rainfall.reduce((sum, val) => sum + parseFloat(val || 0), 0);
      const averageTemperature = inputs.monthly_temperature.reduce((sum, val) => sum + parseFloat(val || 0), 0) / 12;

      features = {
        total_rainfall_mm: totalRainfall,
        average_temperature_c: averageTemperature,
        n_kg_ha: parseFloat(inputs.n_kg_ha),
        p_kg_ha: parseFloat(inputs.p_kg_ha),
        k_kg_ha: parseFloat(inputs.k_kg_ha),
        irrigation: inputs.irrigation,
        pest_risk: inputs.pest_risk,
        clay: parseFloat(inputs.clay),
        sand: parseFloat(inputs.sand),
        silt: parseFloat(inputs.silt),
      };
    } else {
      // Validate yearly inputs
      if (inputs.total_rainfall_mm === '' || inputs.average_temperature_c === '') {
        setMessage('Please fill in both yearly climate fields.');
        setIsLoading(false);
        return;
      }

      features = {
        total_rainfall_mm: parseFloat(inputs.total_rainfall_mm),
        average_temperature_c: parseFloat(inputs.average_temperature_c),
        n_kg_ha: parseFloat(inputs.n_kg_ha),
        p_kg_ha: parseFloat(inputs.p_kg_ha),
        k_kg_ha: parseFloat(inputs.k_kg_ha),
        irrigation: inputs.irrigation,
        pest_risk: inputs.pest_risk,
        clay: parseFloat(inputs.clay),
        sand: parseFloat(inputs.sand),
        silt: parseFloat(inputs.silt),
      };
    }

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get a simulated prediction
    const yieldValue = predictYield(features);
    setPrediction(yieldValue);

    // Determine the remark based on the yield value
    if (yieldValue < 3) {
      setRemark('Low Yield');
    } else if (yieldValue >= 3 && yieldValue <= 6) {
      setRemark('Moderate Yield');
    } else {
      setRemark('High Yield');
    }

    setIsLoading(false);
  };

  // Function to call the Gemini API for personalized advice
  const handleGetAdvice = async () => {
    setIsAdviceLoading(true);
    setAdvice('');

    const prompt = `Act as an experienced agricultural consultant. Based on the following farming
    data, provide personalized, encouraging, and actionable advice to a rice
    farmer. Focus on how the input variables might have contributed to the
    predicted yield and suggest specific improvements. Keep the advice concise and
    easy to understand for someone with practical farming knowledge, not a
    scientist.

    Input Data:
    - NPK (N/P/K): ${inputs.n_kg_ha}/${inputs.p_kg_ha}/${inputs.k_kg_ha} kg/ha
    - Irrigation: ${inputs.irrigation}
    - Pest Risk: ${inputs.pest_risk}
    - Soil (Clay/Sand/Silt): ${inputs.clay}/${inputs.sand}/${inputs.silt} %
    - Total Rainfall: ${isMonthly ? inputs.monthly_rainfall.reduce((sum, val) => sum + parseFloat(val || 0), 0) : inputs.total_rainfall_mm} mm
    - Average Temperature: ${isMonthly ? inputs.monthly_temperature.reduce((sum, val) => sum + parseFloat(val || 0), 0) / 12 : inputs.average_temperature_c} °C

    Predicted Yield: ${formatNumber(prediction)} tons/ha`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let retryCount = 0;
    const maxRetries = 3;
    let responseText = "Failed to get advice. Please try again.";

    const fetchWithRetry = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts
          && result.candidates[0].content.parts.length > 0) {
          responseText = result.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(res => setTimeout(res, delay));
          await fetchWithRetry(); // Recursive call
        } else {
          console.error("Failed to fetch advice after multiple retries:", error);
        }
      }
    };

    await fetchWithRetry();
    setAdvice(responseText);
    setIsAdviceLoading(false);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'),
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h3" component="h1" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          Rice Yield Predictor
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Enter your agricultural and climate data to predict your rice yield.
        </Typography>
        
        {/* Toggle and External Link */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={isMonthly} onChange={() => setIsMonthly(!isMonthly)} />}
            label={isMonthly ? 'Monthly Input' : 'Yearly Input'}
            sx={{ m: 0 }}
          />
          <Button
            href="https://nimet.gov.ng/daily-weather-prediction"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="secondary"
            startIcon={<WbCloudyOutlinedIcon />}
          >
            Get Climate Data
          </Button>
        </Box>

        <form onSubmit={handlePredict}>
          <Grid container spacing={4}>
            {/* Climate Inputs Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <WbCloudyOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                Climate Data
              </Typography>
              {isMonthly ? (
                <Grid container spacing={2}>
                  {months.map((month, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>{month}</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        name={`monthly_rainfall_${index}`}
                        label="Rainfall (mm)"
                        value={inputs.monthly_rainfall[index]}
                        onChange={(e) => handleMonthlyChange(e, index, 'monthly_rainfall')}
                        inputProps={{ step: "any" }}
                        required
                        size="small"
                      />
                      <Box mt={1}>
                        <TextField
                          fullWidth
                          type="number"
                          name={`monthly_temperature_${index}`}
                          label="Temp (°C)"
                          value={inputs.monthly_temperature[index]}
                          onChange={(e) => handleMonthlyChange(e, index, 'monthly_temperature')}
                          inputProps={{ step: "any" }}
                          required
                          size="small"
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    name="total_rainfall_mm"
                    label="Total Rainfall (mm)"
                    value={inputs.total_rainfall_mm}
                    onChange={handleInputChange}
                    inputProps={{ step: "any" }}
                    required
                  />
                  <TextField
                    fullWidth
                    type="number"
                    name="average_temperature_c"
                    label="Average Temperature (°C)"
                    value={inputs.average_temperature_c}
                    onChange={handleInputChange}
                    inputProps={{ step: "any" }}
                    required
                  />
                </Box>
              )}
            </Grid>
            
            {/* Agricultural and Soil Inputs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <AgricultureOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                Agricultural Data
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="n_kg_ha"
                      label="NPK (N kg/ha)"
                      value={inputs.n_kg_ha}
                      onChange={handleInputChange}
                      inputProps={{ step: "any" }}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="p_kg_ha"
                      label="NPK (P kg/ha)"
                      value={inputs.p_kg_ha}
                      onChange={handleInputChange}
                      inputProps={{ step: "any" }}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="k_kg_ha"
                      label="NPK (K kg/ha)"
                      value={inputs.k_kg_ha}
                      onChange={handleInputChange}
                      inputProps={{ step: "any" }}
                      required
                      size="small"
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth>
                  <InputLabel id="irrigation-label">Irrigation</InputLabel>
                  <Select
                    labelId="irrigation-label"
                    name="irrigation"
                    value={inputs.irrigation}
                    label="Irrigation"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="pest-select-label">Pest Risk</InputLabel>
                  <Select
                    labelId="pest-select-label"
                    name="pest_risk"
                    value={inputs.pest_risk}
                    label="Pest Risk"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="h5" sx={{ mb: 2, mt: 4, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <WaterDropOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                Soil Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="clay"
                    label="Clay (%)"
                    value={inputs.clay}
                    onChange={handleInputChange}
                    inputProps={{ step: "any" }}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="sand"
                    label="Sand (%)"
                    value={inputs.sand}
                    onChange={handleInputChange}
                    inputProps={{ step: "any" }}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="silt"
                    label="Silt (%)"
                    value={inputs.silt}
                    onChange={handleInputChange}
                    inputProps={{ step: "any" }}
                    required
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4, py: 2, fontWeight: 'bold', fontSize: '1.1rem' }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Predict Yield'}
          </Button>
        </form>

        {/* Prediction Output */}
        {message && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {message}
          </Alert>
        )}

        {prediction !== null && (
          <animated.div style={springProps}>
            <Paper elevation={2} sx={{ mt: 4, p: 4, bgcolor: 'success.light' }}>
              <Typography variant="h4" align="center" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                Predicted Yield
              </Typography>
              <Typography variant="h2" align="center" sx={{ color: 'success.dark', fontWeight: 'extrabold', letterSpacing: -1 }}>
                {formatNumber(prediction)} <Typography component="span" variant="h5">tons/ha</Typography>
              </Typography>
              <Typography variant="h6" align="center" sx={{ mt: 1, color: (theme) => {
                if (remark === 'High Yield') return theme.palette.success.main;
                if (remark === 'Moderate Yield') return theme.palette.warning.main;
                return theme.palette.error.main;
              }}}>
                ({remark})
              </Typography>
              <Box align="center" mt={2}>
                <Button
                  onClick={handleGetAdvice}
                  variant="contained"
                  sx={{ bgcolor: 'purple.700', '&:hover': { bgcolor: 'purple.800' } }}
                  disabled={isAdviceLoading}
                >
                  {isAdviceLoading ? <CircularProgress size={24} color="inherit" /> : '✨ Get Farming Advice'}
                </Button>
              </Box>
            </Paper>
          </animated.div>
        )}
        
        {/* Gemini API Advice Output */}
        {advice && (
          <animated.div style={springProps}>
            <Paper elevation={2} sx={{ mt: 4, p: 4, bgcolor: 'background.paper' }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Your Personalized Advice
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {advice}
              </Typography>
            </Paper>
          </animated.div>
        )}
      </Paper>
    </Container>
  );
};

export default App;
