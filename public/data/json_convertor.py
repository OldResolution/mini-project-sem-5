import pandas as pd
import json
import os

# Load the Excel file
file_path = r'data\mumbai_air_quality_data.xlsx'  # Update with your file path
df = pd.read_excel(file_path)

# Convert the DataFrame to a dictionary
data_dict = df.to_dict(orient='records')

# Define the save directory and output file path
save_path = r'C:\Users\savs2\OneDrive\Desktop\mini project sem 5\data'  # Change this based on your path
output_file_name = 'mumbai_air_quality_data.json'
output_file_path = os.path.join(save_path, output_file_name)

# Save the dictionary as a JSON file
with open(output_file_path, 'w') as json_file:
    json.dump(data_dict, json_file, indent=4)

print(f"Data has been successfully converted to {output_file_path}")
