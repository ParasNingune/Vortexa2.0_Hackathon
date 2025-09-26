import React, { useState, useEffect } from 'react';
import { checkAPIHealth, API_ENDPOINTS } from '../config/api.js';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkAPIHealth();
        setHealthStatus(health);
      } catch (error) {
        setHealthStatus({ success: false, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span>Checking API status...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div 
        className={`w-2 h-2 rounded-full ${
          healthStatus?.success ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <span className={healthStatus?.success ? 'text-green-600' : 'text-red-600'}>
        {healthStatus?.success ? 'API Online' : 'API Offline'}
      </span>
      {healthStatus?.model_loaded && (
        <span className="text-xs text-gray-500">
          ({healthStatus.num_classes} classes loaded)
        </span>
      )}
    </div>
  );
};

export default HealthCheck;
