import requests
import pandas as pd
from datetime import datetime
import os

# WAQI API Token
token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572'

# Bounds for Mumbai
south_west = (18.89, 72.75)
north_east = (19.23, 73.0)

# Directory to save the files
save_path = r'C:\Users\savs2\OneDrive\Desktop\mini project sem 5\data' #change this based on your path for the data folder

# File names
excel_file = os.path.join(save_path, 'mumbai_air_quality_data.xlsx')
csv_file = os.path.join(save_path, 'mumbai_air_quality_data.csv')

# URL to fetch stations within the bounds
url = f"https://api.waqi.info/map/bounds/?token={token}&latlng={south_west[0]},{south_west[1]},{north_east[0]},{north_east[1]}"

# Fetch station data
response = requests.get(url)
data = response.json()

# Initialize a list to store the data
stations_data = []

if data['status'] == 'ok':
    for station in data['data']:
        # Fetch detailed station data to get pollutants information
        station_url = f"https://api.waqi.info/feed/@{station['uid']}/?token={token}"
        station_response = requests.get(station_url)
        station_data = station_response.json()

        if station_data['status'] == 'ok':
            pollutants = station_data['data'].get('iaqi', {})  # Individual Air Quality Index
            # Get the time when the data was collected
            collection_time = station_data['data']['time'].get('s', None)  # Time in string format

            if collection_time:
                try:
                    # Convert to a more readable datetime format
                    collection_time = datetime.strptime(collection_time, '%Y-%m-%d %H:%M:%S')
                except ValueError as e:
                    print(f"Time parsing error for station {station['station']['name']}: {e}")
                    collection_time = None  # Handle error or set to None

            station_info = {
                'Station Name': station['station']['name'],
                'AQI': station['aqi'],
                'PM2.5': pollutants.get('pm25', {}).get('v', 'N/A'),
                'PM10': pollutants.get('pm10', {}).get('v', 'N/A'),
                'O3': pollutants.get('o3', {}).get('v', 'N/A'),
                'NO2': pollutants.get('no2', {}).get('v', 'N/A'),
                'SO2': pollutants.get('so2', {}).get('v', 'N/A'),
                'CO': pollutants.get('co', {}).get('v', 'N/A'),
                'Latitude': station['lat'],
                'Longitude': station['lon'],
                'Collection Time': collection_time.strftime('%Y-%m-%d %H:%M:%S') if collection_time else 'N/A'
            }
            stations_data.append(station_info)

# Convert the list to a pandas DataFrame
new_data = pd.DataFrame(stations_data)

# Function to update existing files or create new ones
def update_or_create_file(file_path, new_data):
    if os.path.exists(file_path):
        # If file exists, read the existing data
        existing_data = pd.read_excel(file_path) if file_path.endswith('.xlsx') else pd.read_csv(file_path)
        
        # Combine the new data with existing data
        combined_data = pd.concat([existing_data, new_data[['AQI', 'PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO', 'Collection Time']]], axis=1)
        
        # Save the combined data back to the file
        if file_path.endswith('.xlsx'):
            combined_data.to_excel(file_path, index=False)
        else:
            combined_data.to_csv(file_path, index=False)
        print(f"Data has been updated in '{file_path}'")
    else:
        # If file does not exist, create a new file with the new data
        if file_path.endswith('.xlsx'):
            new_data.to_excel(file_path, index=False)
        else:
            new_data.to_csv(file_path, index=False)
        print(f"Data has been saved to '{file_path}'")

# Update or create the Excel file
update_or_create_file(excel_file, new_data)

# Update or create the CSV file
update_or_create_file(csv_file, new_data)