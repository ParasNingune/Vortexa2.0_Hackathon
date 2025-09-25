import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import { FiFilter, FiRefreshCw, FiMapPin, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const Outbreak = () => {
  const [outbreakData, setOutbreakData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCase, setHoveredCase] = useState(null);
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
        console.log("Data Loaded")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center">
              <div className="animate-shimmer h-16 bg-gray-200 rounded-lg mb-4 mx-auto w-96"></div>
              <div className="animate-shimmer h-6 bg-gray-200 rounded-lg mb-4 mx-auto w-80"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="animate-shimmer h-4 bg-gray-200 rounded mb-4 w-20"></div>
                  <div className="animate-shimmer h-8 bg-gray-200 rounded mb-2 w-16"></div>
                  <div className="animate-shimmer h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
            
            {/* Map Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="animate-shimmer h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-32 h-32 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="relative text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Disease Outbreak
              </span>
              <span className="block bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real-time monitoring and predictive analysis of plant disease outbreaks with 
              <span className="font-semibold text-green-600"> AI-powered insights</span>
            </p>
            
            {/* Status Indicator */}
            <div className="mt-6 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Data • Updated 2 min ago</span>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg hover:shadow-2xl border border-green-200 p-6 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Total Cases</p>
                  <p className="text-4xl font-bold text-green-700 mb-2">{totalCases.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Active outbreaks
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-lg hover:shadow-2xl border border-red-200 p-6 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">High Risk Areas</p>
                  <p className="text-4xl font-bold text-red-700 mb-2">{highSeverityCases}</p>
                  <p className="text-sm text-red-600 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    Critical zones
                  </p>
                </div>
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiAlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl shadow-lg hover:shadow-2xl border border-teal-200 p-6 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">Disease Types</p>
                  <p className="text-4xl font-bold text-teal-700 mb-2">{uniqueDiseases}</p>
                  <p className="text-sm text-teal-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Different diseases
                  </p>
                </div>
                <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-lg hover:shadow-2xl border border-emerald-200 p-6 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">High Risk Spread</p>
                  <p className="text-4xl font-bold text-emerald-700 mb-2">{highRiskSpreadZones}</p>
                  <p className="text-sm text-emerald-600 flex items-center">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    Spread zones
                  </p>
                </div>
                <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiMapPin className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between">              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FiFilter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Smart Filters</h2>
                  <p className="text-sm text-gray-600">Refine your outbreak analysis</p>
                </div>
              </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  title="Clear all filters"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  <span className="font-medium">Clear All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disease Type</label>
                  <select
                    value={diseaseFilter}
                    onChange={(e) => setDiseaseFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                <div className="max-w-sm mx-auto text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-500 mb-2">
                    <FiAlertTriangle className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-green-900 mb-2">No Data Found!</h3>
                  <p className="text-green-700">
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
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
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
                                        <div className="bg-emerald-50 p-2 rounded">
                                          <p className="font-medium text-emerald-700">Temperature</p>
                                          <p className="text-emerald-600">{location.Climate.temperature}°C</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <p className="font-medium text-green-700">Humidity</p>
                                          <p className="text-green-600">{location.Climate.humidity}%</p>
                                        </div>
                                        <div className="bg-teal-50 p-2 rounded">
                                          <p className="font-medium text-teal-700">Rainfall</p>
                                          <p className="text-teal-600">{location.Climate.rainfall}mm</p>
                                        </div>
                                        <div className="bg-green-100 p-2 rounded">
                                          <p className="font-medium text-green-700">Conditions</p>
                                          <p className="text-green-600 text-xs">{location.Climate.conditions}</p>
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
                                <h3 className="text-lg font-semibold text-emerald-700">Potential Spread Zone</h3>
                                <hr />
                                <p className="text-sm text-gray-600">
                                  {location.Description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Source Disease</p>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
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
                                        <div className="bg-emerald-50 p-2 rounded">
                                          <p className="font-medium text-emerald-700">Temperature</p>
                                          <p className="text-emerald-600">{location.Climate.temperature}°C</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <p className="font-medium text-green-700">Humidity</p>
                                          <p className="text-green-600">{location.Climate.humidity}%</p>
                                        </div>
                                        <div className="bg-teal-50 p-2 rounded">
                                          <p className="font-medium text-teal-700">Rainfall</p>
                                          <p className="text-teal-600">{location.Climate.rainfall}mm</p>
                                        </div>
                                        <div className="bg-green-100 p-2 rounded">
                                          <p className="font-medium text-green-700">Conditions</p>
                                          <p className="text-green-600 text-xs">{location.Climate.conditions}</p>
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
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
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
                  <div className="mt-3 p-3 bg-emerald-50 rounded-md border border-emerald-200">
                    <p className="text-sm text-emerald-800">
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