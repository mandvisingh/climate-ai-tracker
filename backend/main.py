import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd

app=FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    "limit": 10000,
    "CLIMATE_IDENTIFIER": "3012216",
    "datetime": "2012-05-01T00:00:00Z/2026-02-28T12:31:12Z",  # No extra & here
    # "sortby": "-LOCAL_DATE"                # Get latest data first
   }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data= response.json()
        with open("weather_data.json", "w") as f:
            json.dump(data, f, indent=4)  # indent=4 makes it human-readable
            print("Data successfully saved to weather_data_2.json")
        # Flatten the GeoJson 'properties' into a simple list for react
        features= [f['properties'] for f in data.get('features', [])]
        if features:
            print(f"Latest Temp in Edmonton: {features[0].get('TEMP')}°C")
        return features
    return {"error": "Could not fetch data" }

