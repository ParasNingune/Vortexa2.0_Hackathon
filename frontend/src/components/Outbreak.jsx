import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Essential Leaflet CSS

const Outbreak= () => {
  const [outbreakData, setOutbreakData] = useState([]);

  useEffect(() => {
    // Fetch data from the Node.js backend
    fetch('http://localhost:8000/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setOutbreakData(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <h1>Outbreak Locations</h1>
        <MapContainer
          center={[20, 77]}
          zoom={4}
          style={{ height: '80vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {outbreakData.map((location, index) => {
            const radius = Math.sqrt(location.Cases) * 3;
            return (
              <CircleMarker
                key={index}
                center={[location.Latitude, location.Longitude]}
                pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }}
                radius={radius}
              >
                <Tooltip>Cases: {location.Cases}</Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default Outbreak ;