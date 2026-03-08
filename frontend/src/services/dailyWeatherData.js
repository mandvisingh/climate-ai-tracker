 export const getDailyWeatherData = async() => {
      try {
        const response = await fetch("http://localhost:8000/api/weather/daily")
        const data = await response.json()

        if(Array.isArray(data)){
            return data
        }

      } catch(err){
        console.error("fetch failed")
        return []
      } 
        
      }
