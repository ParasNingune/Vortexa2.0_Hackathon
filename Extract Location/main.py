import folium
import pandas as pd

# Load your data
df = pd.read_csv("")

# Create map centered at average location
map_plant = folium.Map(location=[df['latitude'].mean(), df['longitude'].mean()], zoom_start=12)

# Add markers
for _, row in df.iterrows():
    folium.Marker(
        [row['latitude'], row['longitude']],
        popup=f"{row['image_name']} - {row['disease_label']}"
    ).add_to(map_plant)