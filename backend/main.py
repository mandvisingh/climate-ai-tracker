from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/weather/hourly")
def get_weather_hourly():
    #MSC geomet endpoint for hourly climate observations
    url = "https://api.weather.gc.ca/collections/climate-hourly/items"

    # pull latest 50 from Edmonton Intl 
    params = {
        "f": "json",
        "limit": 50,
        # "CLIMATE_IDENTIFIER": "3012205",
        "sortBy": "-LOCAL_DATE"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data= response.json()
        # Flatten the GeoJson 'properties' into a simple list for react
        features= [f['properties'] for f in data.get('features', [])]
        if features:
            print(f"Latest Temp in Edmonton: {features[0].get('TEMP')}°C")
        return features
    return {"error": "Could not fetch data" }


@app.get("/api/weather/daily")
def get_weather_daily():
    #MSC geomet endpoint for hourly climate observations
    url = "https://api.weather.gc.ca/collections/climate-daily/items"

    # pull latest 50 from Edmonton Intl 
    params = {
        "f": "json",
        "limit": 20,
        # "CLIMATE_IDENTIFIER": "3012205",
        # "sortBy": "-LOCAL_DATE"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data= response.json()
        # Flatten the GeoJson 'properties' into a simple list for react
        features= [f['properties'] for f in data.get('features', [])]
        if features:
            print(f"Latest Temp in Edmonton: {features[0].get('TEMP')}°C")
        return features
    return {"error": "Could not fetch data" }