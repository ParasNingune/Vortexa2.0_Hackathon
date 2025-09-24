import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import { FiFilter, FiRefreshCw, FiMapPin, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const Outbreak = () => {
  const [outbreakData, setOutbreakData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [climateFilter, setClimateFilter] = useState('');

  useEffect(() => {
    // Fetch data from CSV service
    setLoading(true);
    import('../services/csvOutbreakService.js').then(({ fetchOutbreakDataFromCSV }) => {
      fetchOutbreakDataFromCSV().then(data => {
        setOutbreakData(data);
        setFilteredData(data);
        setLoading(false);
      }).catch(error => {
        console.error('Error loading CSV data:', error);
        setLoading(false);
      });
    });
  }, []);

  // Filter data based on selected filters
  useEffect(() => {
    let filtered = outbreakData;

    if (diseaseFilter) {
      filtered = filtered.filter(item => item.Disease === diseaseFilter);
    }

    if (severityFilter) {
      filtered = filtered.filter(item => item.Severity === severityFilter);
    }

    if (cropFilter) {
      filtered = filtered.filter(item => item.Crop === cropFilter);
    }

    if (climateFilter) {
      filtered = filtered.filter(item => 
        item.Climate && item.Climate.conditions === climateFilter
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(item => item.Date >= dateFilter);
    }

    setFilteredData(filtered);
  }, [diseaseFilter, severityFilter, cropFilter, climateFilter, dateFilter, outbreakData]);

  // Get color based on severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#E53E3E';
      case 'Medium': return '#DD6B20';
      case 'Low': return '#38A169';
      default: return '#718096';
    }
  };

  // Get color for spread zones based on risk level
  const getSpreadZoneColor = (risk) => {
    switch (risk) {
      case 'High': return '#FEB2B2'; // Light red
      case 'Medium': return '#FBD38D'; // Light orange
      case 'Low': return '#C6F6D5'; // Light green
      default: return '#E2E8F0'; // Light gray
    }
  };

  // Get badge color classes
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const outbreakLocations = filteredData.filter(item => item.Type !== 'spread_zone');
  const spreadZones = filteredData.filter(item => item.Type === 'spread_zone');
  const highRiskSpreadZones = spreadZones.filter(item => item.EstimatedRisk === 'High').length;
  
  const totalCases = outbreakLocations.reduce((sum, item) => sum + (item.Cases || 0), 0);
  const highSeverityCases = outbreakLocations.filter(item => item.Severity === 'High').length;
  const uniqueDiseases = [...new Set(outbreakLocations.map(item => item.Disease))].length;
  const uniqueDiseasesArray = [...new Set(outbreakData.filter(item => item.Type !== 'spread_zone').map(item => item.Disease))];
  const uniqueCropsArray = [...new Set(outbreakData.filter(item => item.Type !== 'spread_zone').map(item => item.Crop))];
  const uniqueClimateConditions = [...new Set(outbreakData
    .filter(item => item.Climate && item.Climate.conditions && item.Type !== 'spread_zone')
    .map(item => item.Climate.conditions))];
  const severityOptions = ['High', 'Medium', 'Low'];

  const clearFilters = () => {
    setDateFilter('');
    setDiseaseFilter('');
    setSeverityFilter('');
    setCropFilter('');
    setClimateFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Disease Outbreak Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Real-time monitoring of plant disease outbreaks across regions
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Cases</p>
                  <p className="text-3xl font-bold text-blue-500">{totalCases}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="text-green-500 mr-1">↗</span>
                    Active outbreaks
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">High Risk Areas</p>
                  <p className="text-3xl font-bold text-red-500">{highSeverityCases}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FiAlertTriangle className="mr-1" />
                    Critical zones
                  </p>
                </div>
                <FiAlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Disease Types</p>
                  <p className="text-3xl font-bold text-orange-500">{uniqueDiseases}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FiTrendingUp className="mr-1" />
                    Different diseases
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">High Risk Spread</p>
                  <p className="text-3xl font-bold text-purple-500">{highRiskSpreadZones}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FiMapPin className="mr-1" />
                    Spread zones
                  </p>
                </div>
                <FiMapPin className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiFilter className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Filters</h2>
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Clear all filters"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disease Type</label>
                  <select
                    value={diseaseFilter}
                    onChange={(e) => setDiseaseFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All diseases</option>
                    {uniqueDiseasesArray.map((disease) => (
                      <option key={disease} value={disease}>
                        {disease}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                  <select
                    value={cropFilter}
                    onChange={(e) => setCropFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All crops</option>
                    {uniqueCropsArray.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All severities</option>
                    {severityOptions.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Climate Conditions</label>
                  <select
                    value={climateFilter}
                    onChange={(e) => setClimateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All conditions</option>
                    {uniqueClimateConditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-gray-600">Loading outbreak data...</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="max-w-sm mx-auto text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-500 mb-2">
                    <FiAlertTriangle className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">No Data Found!</h3>
                  <p className="text-blue-700">
                    No outbreak data matches your current filters. Try adjusting the filters above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-96 md:h-[600px]">
                <MapContainer
                  center={[20.5937, 78.9629]} // Center of India
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredData.map((location) => {
                    // Render outbreak locations
                    if (location.Type === 'outbreak' || !location.Type) {
                      const radius = Math.sqrt(location.Cases || 1) * 2;
                      const color = getSeverityColor(location.Severity);
                      
                      return (
                        <CircleMarker
                          key={location.id}
                          center={[location.Latitude, location.Longitude]}
                          pathOptions={{ 
                            color: color, 
                            fillColor: color, 
                            fillOpacity: 0.7,
                            weight: 2
                          }}
                          radius={radius}
                        >
                          <Popup>
                            <div className="p-3 min-w-[320px]">
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-700">{location.Location}</h3>
                                <hr />
                                <p className="text-sm text-gray-600">
                                  {location.Description || 'Disease outbreak detected in this area'}
                                </p>
                                
                                {/* Disease and Crop Info */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Disease</p>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                      {location.Disease}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Crop</p>
                                    <p className="text-sm">{location.Crop}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Cases</p>
                                    <p className="text-sm font-bold">{location.Cases}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Severity</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadgeClass(location.Severity)}`}>
                                      {location.Severity}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Date</p>
                                    <p className="text-sm">{location.Date}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Spread Factor</p>
                                    <p className="text-sm font-medium">{location.SpreadFactor?.toFixed(2) || 'N/A'}</p>
                                  </div>
                                </div>

                                {/* Climate Information */}
                                {location.Climate && (
                                  <>
                                    <hr />
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-2">Climate Conditions</p>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-blue-50 p-2 rounded">
                                          <p className="font-medium text-blue-700">Temperature</p>
                                          <p className="text-blue-600">{location.Climate.temperature}°C</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <p className="font-medium text-green-700">Humidity</p>
                                          <p className="text-green-600">{location.Climate.humidity}%</p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                          <p className="font-medium text-purple-700">Rainfall</p>
                                          <p className="text-purple-600">{location.Climate.rainfall}mm</p>
                                        </div>
                                        <div className="bg-orange-50 p-2 rounded">
                                          <p className="font-medium text-orange-700">Conditions</p>
                                          <p className="text-orange-600 text-xs">{location.Climate.conditions}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </Popup>
                          <Tooltip>
                            <strong>{location.Location}</strong><br/>
                            {location.Disease} - {location.Cases} cases<br/>
                            Severity: {location.Severity}<br/>
                            Spread Factor: {location.SpreadFactor?.toFixed(2)}
                          </Tooltip>
                        </CircleMarker>
                      );
                    }
                    
                    // Render spread zones
                    if (location.Type === 'spread_zone') {
                      const radius = location.SpreadFactor * 8; // Larger radius for spread zones
                      const color = getSpreadZoneColor(location.EstimatedRisk);
                      
                      return (
                        <CircleMarker
                          key={location.id}
                          center={[location.Latitude, location.Longitude]}
                          pathOptions={{ 
                            color: color, 
                            fillColor: color, 
                            fillOpacity: 0.3,
                            weight: 1,
                            dashArray: '5, 10' // Dashed border for spread zones
                          }}
                          radius={radius}
                        >
                          <Popup>
                            <div className="p-3 min-w-[280px]">
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-orange-700">Potential Spread Zone</h3>
                                <hr />
                                <p className="text-sm text-gray-600">
                                  {location.Description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Source Disease</p>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                                      {location.Disease}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Risk Level</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadgeClass(location.EstimatedRisk)}`}>
                                      {location.EstimatedRisk}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Source Location</p>
                                    <p className="text-sm">{location.ParentLocation}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Spread Factor</p>
                                    <p className="text-sm font-bold">{location.SpreadFactor?.toFixed(2)}</p>
                                  </div>
                                </div>

                                {/* Climate Information */}
                                {location.Climate && (
                                  <>
                                    <hr />
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-2">Contributing Climate Factors</p>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-blue-50 p-2 rounded">
                                          <p className="font-medium text-blue-700">Temperature</p>
                                          <p className="text-blue-600">{location.Climate.temperature}°C</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <p className="font-medium text-green-700">Humidity</p>
                                          <p className="text-green-600">{location.Climate.humidity}%</p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                          <p className="font-medium text-purple-700">Rainfall</p>
                                          <p className="text-purple-600">{location.Climate.rainfall}mm</p>
                                        </div>
                                        <div className="bg-orange-50 p-2 rounded">
                                          <p className="font-medium text-orange-700">Conditions</p>
                                          <p className="text-orange-600 text-xs">{location.Climate.conditions}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </Popup>
                          <Tooltip>
                            <strong>Spread Zone</strong><br/>
                            Risk: {location.EstimatedRisk}<br/>
                            From: {location.ParentLocation}<br/>
                            Factor: {location.SpreadFactor?.toFixed(2)}
                          </Tooltip>
                        </CircleMarker>
                      );
                    }
                    
                    return null;
                  })}
                </MapContainer>
              </div>
            )}
          </div>

          {/* Recent Outbreaks Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Recent Outbreaks</h2>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-md text-sm font-medium">
                  <div>Location</div>
                  <div>Disease</div>
                  <div>Crop</div>
                  <div>Cases</div>
                  <div>Severity</div>
                  <div>Climate</div>
                  <div>Date</div>
                  <div>Area</div>
                </div>
                <div className="space-y-2 mt-2">
                  {outbreakLocations.slice(0, 5).map((outbreak) => (
                    <div key={outbreak.id} className="grid grid-cols-8 gap-2 p-3 border-b border-gray-200 text-sm">
                      <div className="font-medium">{outbreak.Location}</div>
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          {outbreak.Disease}
                        </span>
                      </div>
                      <div>{outbreak.Crop}</div>
                      <div className="font-bold">{outbreak.Cases}</div>
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadgeClass(outbreak.Severity)}`}>
                          {outbreak.Severity}
                        </span>
                      </div>
                      <div>
                        {outbreak.Climate ? (
                          <span className="text-xs text-gray-600">
                            {outbreak.Climate.temperature}°C, {outbreak.Climate.humidity}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      <div>{outbreak.Date}</div>
                      <div>{outbreak.AffectedArea || 'N/A'}</div>
                    </div>
                  ))}
                </div>
                {outbreakLocations.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Showing 5 of {outbreakLocations.length} active outbreaks
                  </p>
                )}
                {spreadZones.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>{spreadZones.length}</strong> potential spread zones identified based on climate conditions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Map Legend</h2>
              
              {/* Outbreak Severity */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Outbreak Severity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
                    <span className="text-sm">High Severity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-600"></div>
                    <span className="text-sm">Medium Severity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
                    <span className="text-sm">Low Severity</span>
                  </div>
                </div>
              </div>

              <hr className="mb-4" />

              {/* Spread Risk Zones */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Spread Risk Zones (Light Colors)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-200 border border-dashed border-red-400"></div>
                    <span className="text-sm">High Risk Spread</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-200 border border-dashed border-orange-400"></div>
                    <span className="text-sm">Medium Risk Spread</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-200 border border-dashed border-green-400"></div>
                    <span className="text-sm">Low Risk Spread</span>
                  </div>
                </div>
              </div>

              <hr className="mb-3" />
              
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  • <strong>Solid circles:</strong> Active outbreak locations
                </p>
                <p className="text-xs text-gray-500">
                  • <strong>Dashed circles:</strong> Potential spread zones based on climate conditions
                </p>
                <p className="text-xs text-gray-500">
                  • Circle size represents outbreak intensity or spread potential
                </p>
                <p className="text-xs text-gray-500">
                  • Spread factor calculated from temperature, humidity, rainfall, and case count
                </p>
                <p className="text-xs text-gray-500">
                  • Click on any marker for detailed climate and outbreak information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outbreak ;