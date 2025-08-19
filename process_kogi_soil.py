import rasterio
import pandas as pd
import numpy as np

# Load GeoTIFFs
with rasterio.open('soilgrids_clay_kogi.tif') as clay_src:
    clay = clay_src.read(1)
with rasterio.open('soilgrids_sand_kogi.tif') as sand_src:
    sand = sand_src.read(1)
with rasterio.open('soilgrids_slit_kogi.tif') as silt_src:  # Adjust if filename differs
    silt = silt_src.read(1)

# Compute dominant soil type (averaged over Kogi)
mean_clay, mean_sand, mean_silt = np.mean(clay), np.mean(sand), np.mean(silt)
soil_type = 'loamy' if mean_clay > mean_sand and mean_clay > mean_silt else 'sandy' if mean_sand > mean_silt else 'silty'

# Create DataFrame (48 rows for climate compatibility)
df_soil = pd.DataFrame({
    'Region': ['Kogi']*48,
    'Soil_Type': [soil_type]*48,
    'Clay': [mean_clay]*48,  # g/kg
    'Sand': [mean_sand]*48,
    'Silt': [mean_silt]*48
})

# Save
df_soil.to_csv('kogi_soil.csv', index=False)
print("Saved to kogi_soil.csv")
