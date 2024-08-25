import requests
import pandas as pd

# Replace with your actual token
token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572'

# Define the bounds of the area (southwest and northeast corners)
southwest_lat, southwest_lng = 18.89, 72.75  # Southwest corner
northeast_lat, northeast_lng = 19.23, 73.0   # Northeast corner

# Construct the API URL
url = f'https://api.waqi.info/map/bounds/?token={token}&latlng={southwest_lat},{southwest_lng},{northeast_lat},{northeast_lng}'

# Fetch the data
response = requests.get(url)
data = response.json()

# Check if the data is valid
if data['status'] == 'ok':
    # Extract relevant data
    records = []
    for station in data['data']:
        record = {
            'Station Name': station['station']['name'],
            'Latitude': station['lat'],
            'Longitude': station['lon'],
            'AQI': station['aqi']
        }
        records.append(record)

    # Convert the records into a DataFrame
    df = pd.DataFrame(records)

    # Save to Excel
    df.to_excel('air_quality_data.xlsx', index=False)

    # Save to CSV (optional)
    df.to_csv('air_quality_data.csv', index=False)

    print("Data saved successfully.")
else:
    print("Error fetching data:", data)