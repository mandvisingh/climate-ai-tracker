import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const EdmontonWeatherAI = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [inputs, setInputs] = useState({ temp: 0, precip: 0, change: 0 });

  // Constants from your Kaggle Scaling
  const myMeans = [2.32995694, -0.01105634, 0.00303847, 1.23426474, 0.0156242];
  const myScales = [12.11151232, 0.70319057, 0.71090896, 3.78844823, 3.46997412];

  useEffect(() => {
const initModel = async () => {
  try {
    // Standard loading - this expects model.json and .bin in the same folder
    const model = await tf.loadLayersModel('/models/weather/model.json');
    
    // Warm up the model with a dummy tensor (5 features)
    const dummyInput = tf.zeros([1, 5]);
    model.predict(dummyInput);

    setModel(model);
    setLoading(false);
    console.log("Model loaded successfully!");
  } catch (err) {
    console.error("Model load failed:", err);
  }
};
    initModel();
  }, []);

  const runAIPrediction = () => {
    // 1. Get current month logic
    const month = new Date().getMonth() + 1;
    const mSin = Math.sin(2 * Math.PI * month / 12);
    const mCos = Math.cos(2 * Math.PI * month / 12);

    // 2. Scale features (Order: temp_lag_1, month_sin, month_cos, precip_lag_1, temp_change_1d)
    const raw = [inputs.temp, mSin, mCos, inputs.precip, inputs.change];
    const scaled = raw.map((val, i) => (val - myMeans[i]) / myScales[i]);

    // 3. Predict
    const tensor = tf.tensor2d([scaled]);
    const output = model.predict(tensor);
    setPrediction(output.dataSync()[0].toFixed(1));
  };

  if (loading) return <div>Training the brain... please wait.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '400px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Edmonton AI Predictor</h2>
      <hr />
      
      <div style={{ marginBottom: '15px' }}>
        <label>Yesterday's Temp (°C): </label>
        <input type="number" value={inputs.temp} 
               onChange={(e) => setInputs({...inputs, temp: parseFloat(e.target.value)})} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Yesterday's Rain/Snow (mm): </label>
        <input type="number" value={inputs.precip} 
               onChange={(e) => setInputs({...inputs, precip: parseFloat(e.target.value)})} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>24hr Temp Change: </label>
        <input type="number" value={inputs.change} 
               onChange={(e) => setInputs({...inputs, change: parseFloat(e.target.value)})} />
      </div>

      <button onClick={runAIPrediction} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
        Predict Today's Mean
      </button>

      {prediction && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#e9ecef' }}>
          <strong>AI Forecast: {prediction}°C</strong>
        </div>
      )}
    </div>
  );
};

export default EdmontonWeatherAI;