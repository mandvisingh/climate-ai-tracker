import { useState, useEffect, useMemo } from 'react'
import { getDailyWeatherData } from './services/dailyWeatherData';

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
     getDailyWeatherData()
     .then(data => {
      setWeatherData(data)
      setLoading(false)
    })
  }, [])

const formattedData = useMemo(()=> {
    return weatherData.map(item => {

      // Look for MEAN_TEMPERATURE first (daily API), then TEMP (hourly/obs API)
    const rawTemp = item.MEAN_TEMPERATURE ?? item.TEMP ?? 0;
   return {
      ...item,
      TEMP: parseFloat(rawTemp),
      displayDate: item.LOCAL_DATE ? item.LOCAL_DATE.split(' ')[0] : 'N/A'
   }
    });
  }, [weatherData])

if (loading) return <div>Loading Edmonton Weather Data...</div>;

return (
    <div style={{ padding: '20px' }}>
      <h1>Climate AI Tracker</h1>
      {formattedData.length > 0 ? (
        formattedData.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '5px' }}>
            <strong>{item.STATION_NAME}</strong>: {item.TEMP}°C on {item.displayDate}
          </div>
        ))
      ) : (
        <p>No data available.</p>
      )}
    </div>
  )
}

export default App
