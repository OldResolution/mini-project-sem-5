import pandas as pd
from geopy.geocoders import Nominatim

# Initialize the geolocator
geolocator = Nominatim(user_agent="mumbai-geo-locator")

# List of areas in Mumbai
areas = [
    "Colaba", "Sandhurst Road", "Marine Lines", "Grant Road", "Byculla",
    "Parel", "Matunga", "Elphinstone", "Dadar", "Khar", "Santacruz",
    "Bandra", "Andheri East", "Andheri West", "Kurla", "Chembur East",
    "Chembur West", "Ghatkopar", "Goregaon", "Malad", "Kandivali",
    "Borivali West", "Dahiser", "Bhandup", "Mulund"
]

# Function to get latitude and longitude for a given area
def get_coordinates(area):
    try:
        location = geolocator.geocode(f"{area}, Mumbai")
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except Exception as e:
        print(f"Error fetching coordinates for {area}: {e}")
        return None, None

# Create a list to hold the data
data = []

# Fetch coordinates for each area
for area in areas:
    lat, lon = get_coordinates(area)
    data.append([area, lat, lon])

# Convert data to a DataFrame
df = pd.DataFrame(data, columns=["Area", "Latitude", "Longitude"])

# Save the DataFrame to an Excel file
output_file = "Mumbai_Area_Coordinates.xlsx"
df.to_excel(output_file, index=False)

print(f"Coordinates saved to {output_file}")
