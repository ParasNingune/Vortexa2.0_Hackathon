import Papa from 'papaparse';

// Function to read and parse CSV file
export const parseCSVData = async (csvFilePath) => {
  try {
    const response = await fetch(csvFilePath);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Convert numeric fields to numbers
          if (['Latitude', 'Longitude', 'Cases', 'humidity', 'rainfall', 'temperature'].includes(field)) {
            return parseFloat(value) || 0;
          }
          return value;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
};

// Calculate spread factor based on climate conditions
const calculateSpreadFactor = (climate, cases) => {
  let spreadFactor = 1.0; // Base spread factor
  
  // Temperature impact
  if (climate.temperature > 25 && climate.temperature < 35) {
    spreadFactor *= 1.3; // Optimal temperature for most diseases
  } else if (climate.temperature > 35) {
    spreadFactor *= 0.8; // Too hot, reduces spread
  } else if (climate.temperature < 15) {
    spreadFactor *= 0.6; // Too cold, reduces spread
  }
  
  // Humidity impact
  if (climate.humidity > 80) {
    spreadFactor *= 1.4; // High humidity increases spread
  } else if (climate.humidity > 60) {
    spreadFactor *= 1.1; // Moderate humidity slightly increases spread
  } else {
    spreadFactor *= 0.8; // Low humidity reduces spread
  }
  
  // Rainfall impact
  if (climate.rainfall > 20) {
    spreadFactor *= 1.3; // Heavy rainfall increases spread
  } else if (climate.rainfall > 10) {
    spreadFactor *= 1.1; // Moderate rainfall slightly increases spread
  }
  
  // Cases impact (more cases = higher spread potential)
  if (cases > 15) {
    spreadFactor *= 1.2;
  } else if (cases > 10) {
    spreadFactor *= 1.1;
  }
  
  // Cap the spread factor
  return Math.min(spreadFactor, 2.5);
};

// Generate spread zones around outbreak locations
const generateSpreadZones = (outbreakData) => {
  const spreadZones = [];
  
  outbreakData.forEach((outbreak) => {
    const spreadFactor = calculateSpreadFactor(outbreak.Climate, outbreak.Cases);
    
    // Only generate spread zones for significant outbreaks
    if (spreadFactor > 1.2 && outbreak.Cases > 5) {
      // Generate multiple spread zones around the outbreak
      const numZones = Math.min(Math.floor(spreadFactor * 2), 6);
      const baseRadius = spreadFactor * 0.05; // Base radius in degrees
      
      for (let i = 0; i < numZones; i++) {
        const angle = (360 / numZones) * i;
        const distance = baseRadius * (0.5 + Math.random() * 0.5); // Randomize distance
        
        const spreadLat = outbreak.Latitude + distance * Math.cos(angle * Math.PI / 180);
        const spreadLng = outbreak.Longitude + distance * Math.sin(angle * Math.PI / 180);
        
        spreadZones.push({
          id: `spread_${outbreak.id}_${i}`,
          parentId: outbreak.id,
          Latitude: spreadLat,
          Longitude: spreadLng,
          SpreadFactor: spreadFactor,
          Disease: outbreak.Disease,
          Crop: outbreak.Crop,
          ParentLocation: outbreak.Location,
          EstimatedRisk: spreadFactor > 2.0 ? 'High' : spreadFactor > 1.5 ? 'Medium' : 'Low',
          Climate: outbreak.Climate,
          Description: `Potential spread zone from ${outbreak.Location}`,
          Type: 'spread_zone'
        });
      }
    }
  });
  
  return spreadZones;
};

// Transform CSV data to outbreak format with enhanced information
export const transformToOutbreakData = (csvData) => {
  const outbreakData = csvData.map((row, index) => {
    // Determine severity based on cases and climate conditions
    let severity = 'Low';
    if (row.Cases > 15) {
      severity = 'High';
    } else if (row.Cases > 8) {
      severity = 'Medium';
    }

    // Determine disease type based on climate conditions
    let disease = 'Unknown Disease';
    let crop = 'Mixed Crops';
    let description = 'Disease outbreak detected in this area';

    if (row.warm_or_wet_conditions === 'Warm and Wet') {
      if (row.humidity > 85) {
        disease = 'Powdery Mildew';
        crop = 'Grape';
        description = 'High humidity and warm conditions favor powdery mildew development';
      } else if (row.rainfall > 20) {
        disease = 'Late Blight';
        crop = 'Tomato';
        description = 'Heavy rainfall and warm temperatures create ideal conditions for late blight';
      } else {
        disease = 'Bacterial Spot';
        crop = 'Pepper';
        description = 'Warm and wet conditions promote bacterial spot infection';
      }
    } else if (row.warm_or_wet_conditions === 'Warm and Dry') {
      disease = 'Early Blight';
      crop = 'Potato';
      description = 'Warm and dry conditions can stress plants, making them susceptible to early blight';
    } else if (row.warm_or_wet_conditions === 'Cool and Dry') {
      disease = 'Common Rust';
      crop = 'Corn';
      description = 'Cool and dry conditions may lead to common rust in corn fields';
    }

    // Generate location name based on coordinates (simplified)
    const locationName = generateLocationName(row.Latitude, row.Longitude);

    const climate = {
      humidity: row.humidity,
      rainfall: row.rainfall,
      temperature: row.temperature,
      conditions: row.warm_or_wet_conditions
    };

    return {
      id: index + 1,
      Latitude: row.Latitude,
      Longitude: row.Longitude,
      Cases: Math.round(row.Cases),
      Disease: disease,
      Crop: crop,
      Severity: severity,
      Date: formatDate(row.Date),
      Location: locationName,
      Description: description,
      AffectedArea: `${Math.round(row.Cases * 5)} hectares`,
      Climate: climate,
      SpreadFactor: calculateSpreadFactor(climate, Math.round(row.Cases)),
      Type: 'outbreak'
    };
  });

  // Generate spread zones
  const spreadZones = generateSpreadZones(outbreakData);
  
  // Combine outbreak data with spread zones
  return [...outbreakData, ...spreadZones];
};

// Helper function to generate location names based on coordinates
const generateLocationName = (lat, lng) => {
  // Simplified location mapping for Indian coordinates
  const locations = [
    { name: 'Delhi', lat: 28.6, lng: 77.2 },
    { name: 'Mumbai', lat: 19.0, lng: 72.8 },
    { name: 'Chennai', lat: 13.0, lng: 80.2 },
    { name: 'Kolkata', lat: 22.5, lng: 88.3 },
    { name: 'Bangalore', lat: 12.9, lng: 77.5 },
    { name: 'Hyderabad', lat: 17.3, lng: 78.4 },
    { name: 'Ahmedabad', lat: 23.0, lng: 72.5 },
    { name: 'Pune', lat: 18.5, lng: 73.8 },
    { name: 'Jaipur', lat: 26.9, lng: 75.7 },
    { name: 'Lucknow', lat: 26.8, lng: 80.9 }
  ];

  // Find closest location
  let closestLocation = 'Unknown Location, India';
  let minDistance = Infinity;

  locations.forEach(location => {
    const distance = Math.sqrt(
      Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = `${location.name}, India`;
    }
  });

  return closestLocation;
};

// Helper function to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return dateString;
  }
};

// Main function to fetch and process outbreak data from CSV
export const fetchOutbreakDataFromCSV = async () => {
  try {
    const csvData = await parseCSVData('./climate_info.csv');
    const transformedData = transformToOutbreakData(csvData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching outbreak data from CSV:', error);
    // Return empty array or throw error based on your preference
    return [];
  }
};

// Calculate statistics from CSV data
export const calculateStatsFromCSV = (data) => {
  const totalCases = data.reduce((sum, item) => sum + item.Cases, 0);
  const highSeverityCases = data.filter(item => item.Severity === 'High').length;
  const uniqueDiseases = [...new Set(data.map(item => item.Disease))].length;
  const uniqueLocations = data.length;
  
  return {
    totalCases,
    highSeverityCases,
    uniqueDiseases,
    uniqueLocations
  };
};

// Get unique diseases from CSV data
export const getUniqueDiseasesFromCSV = (data) => {
  return [...new Set(data.map(item => item.Disease))];
};

// Get unique crops from CSV data
export const getUniqueCropsFromCSV = (data) => {
  return [...new Set(data.map(item => item.Crop))];
};
