import geopandas as gpd
import requests
import pandas as pd

# Define the file path to the GeoJSON
geojson_path = r'C:\Users\savs2\OneDrive\Desktop\mini project sem 5\data\WardMap.geojson'

# Read the GeoJSON file
try:
    wards_gdf = gpd.read_file(geojson_path)
except FileNotFoundError:
    print(f"Error: The file {geojson_path} does not exist.")

# Define API token and bounds
token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572'  # Replace with your actual API token
southwest = (18.89, 72.75)
northeast = (19.27, 73.00)

# Create the API URL
api_url = f'https://api.waqi.info/map/bounds/?token={token}&latlng={southwest[0]},{southwest[1]},{northeast[0]},{northeast[1]}'

# Fetch pollution data
response = requests.get(api_url)
pollution_data = response.json()
# Check if the request was successful
if response.status_code == 200:
    pollution_data = response.json()['data']
else:
    print(f"Error fetching data: {response.status_code}")
    pollution_data = []

# Convert the pollution data into a DataFrame
pollution_df = pd.DataFrame(pollution_data)

# Load the GeoJSON file (make sure to provide the correct path)
geojson_path = r'C:\Users\savs2\OneDrive\Desktop\mini project sem 5\data\WardMap.geojson'  # Adjust the path to your GeoJSON file
wards_gdf = gpd.read_file(geojson_path)

# Perform a spatial join or merge (depends on your data structure)
# Assuming 'ward_id' is the common key in your GeoDataFrame and pollution DataFrame
# Modify according to your actual data structure
merged_gdf = wards_gdf.merge(pollution_df, left_on='ward_id', right_on='id', how='left')

# Save the merged GeoDataFrame to a new GeoJSON file (optional)
merged_gdf.to_file('merged_pollution_data.geojson', driver='GeoJSON')

# Display the merged data
print(merged_gdf)