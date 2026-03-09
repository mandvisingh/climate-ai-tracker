import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const EdmontonWeatherAI = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [actualToday, setActualToday] = useState(null);
  const [inputs, setInputs] = useState({ temp: '', precip: '', change: '' });

  // Scaling constants from your Kaggle training (MAE 2.69 version)
  const means = [2.32995694, -0.01105634, 0.00303847, 1.23426474, 0.0156242];
  const scales = [12.11151232, 0.70319057, 0.71090896, 3.78844823, 3.46997412];

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Load the fixed Model
        const loadedModel = await tf.loadLayersModel('/models/weather/model.json');
        
        // Warm up
        const dummy = tf.zeros([1, 5]);
        loadedModel.predict(dummy);
        setModel(loadedModel);

        // 2. Fetch Live Weather Data for Validation
        const stationId = '3012205'; // Edmonton Intl A
        const url = `https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER=${stationId}&limit=2&sortby=-LOCAL_DATE&f=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length >= 2) {
          const todayData = data.features[0].properties;
          const yesterdayData = data.features[1].properties;

          setActualToday(todayData.MEAN_TEMPERATURE);
          
          // Auto-fill inputs with real yesterday data
          setInputs({
            temp: yesterdayData.MEAN_TEMPERATURE,
            precip: yesterdayData.TOTAL_PRECIPITATION || 0,
            change: yesterdayData.MEAN_TEMPERATURE - (data.features[2]?.properties.MEAN_TEMPERATURE || 0)
          });
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const handlePredict = () => {
    if (!model) return;

    // Feature Engineering: Month Sin/Cos
    const month = new Date().getMonth() + 1;
    const sinMonth = Math.sin(2 * Math.PI * month / 12);
    const cosMonth = Math.cos(2 * Math.PI * month / 12);

    const rawFeatures = [
      parseFloat(inputs.temp),
      sinMonth,
      cosMonth,
      parseFloat(inputs.precip),
      parseFloat(inputs.change)
    ];

    // Scale and Predict
    const scaledFeatures = rawFeatures.map((val, i) => (val - means[i]) / scales[i]);
    const tensor = tf.tensor2d([scaledFeatures]);
    const prediction = model.predict(tensor);
    
    setForecast(prediction.dataSync()[0].toFixed(1));
  };

  if (loading) return <div className="p-10 text-center">Synchronizing with Edmonton Weather Stations...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Edmonton AI Predictor</h1>
      <p className="text-sm text-gray-500 mb-6">Neural Network trained on 67 years of climate data.</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase">Yesterday's Mean Temp (°C)</label>
          <input 
            type="number" 
            className="w-full p-2 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition"
            value={inputs.temp}
            onChange={(e) => setInputs({...inputs, temp: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase">Yesterday's Precip (mm)</label>
          <input 
            type="number" 
            className="w-full p-2 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition"
            value={inputs.precip}
            onChange={(e) => setInputs({...inputs, precip: e.target.value})}
          />
        </div>
      </div>

      <button 
        onClick={handlePredict}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform active:scale-95"
      >
        Calculate AI Forecast
      </button>

      {forecast && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase">AI Forecast</p>
              <p className="text-4xl font-black text-gray-900">{forecast}°C</p>
            </div>
            {actualToday !== null && (
              <div className="text-right">
                <p className="text-xs font-bold text-green-600 uppercase">Actual (Live)</p>
                <p className="text-2xl font-bold text-gray-600">{actualToday}°C</p>
              </div>
            )}
          </div>
          
          {actualToday !== null && (
            <div className="mt-4 p-2 bg-gray-50 rounded text-center text-xs text-gray-500">
              Current Model Variance: <span className="font-bold text-gray-800">{Math.abs(forecast - actualToday).toFixed(1)}°C</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EdmontonWeatherAI;