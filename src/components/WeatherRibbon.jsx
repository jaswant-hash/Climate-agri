import React, { useState, useEffect } from 'react';
import './WeatherRibbon.css';

const WeatherRibbon = ({ pressure, windSpeed, humidity }) => {
  // Add some slight random fluctuations for the "animated instrument" feel
  const [data, setData] = useState({ pressure, windSpeed, humidity });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        pressure: prev.pressure + (Math.random() - 0.5) * 0.2,
        windSpeed: prev.windSpeed + (Math.random() - 0.5) * 0.5,
        humidity: prev.humidity + (Math.random() - 0.5) * 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-ribbon-container">
      <div className="ribbon-header">
        <h2>Live Atmospheric Instruments</h2>
      </div>
      <div className="ribbons">
        
        <div className="ribbon-item">
          <div className="ribbon-label">Pressure</div>
          <div className="ribbon-track">
             <div className="ribbon-fill" style={{ width: `${(data.pressure - 980) / (1050 - 980) * 100}%` }}></div>
             <div className="ribbon-marker" style={{ left: `${(data.pressure - 980) / (1050 - 980) * 100}%` }}></div>
          </div>
          <div className="ribbon-value mono">{data.pressure.toFixed(1)} hPa</div>
        </div>

        <div className="ribbon-item">
          <div className="ribbon-label">Wind</div>
          <div className="ribbon-track">
             <div className="ribbon-fill" style={{ width: `${Math.min(data.windSpeed / 100 * 100, 100)}%` }}></div>
             <div className="ribbon-marker" style={{ left: `${Math.min(data.windSpeed / 100 * 100, 100)}%` }}></div>
          </div>
          <div className="ribbon-value mono">{data.windSpeed.toFixed(1)} km/h</div>
        </div>

        <div className="ribbon-item">
          <div className="ribbon-label">Humidity</div>
          <div className="ribbon-track">
             <div className="ribbon-fill" style={{ width: `${data.humidity}%` }}></div>
             <div className="ribbon-marker" style={{ left: `${data.humidity}%` }}></div>
          </div>
          <div className="ribbon-value mono">{data.humidity.toFixed(0)}%</div>
        </div>

      </div>
    </div>
  );
};

export default WeatherRibbon;
