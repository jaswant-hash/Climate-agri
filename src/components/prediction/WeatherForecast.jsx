import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherForecast = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('week'); // 'day', 'week', 'season'

  const labelsDay = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
  const labelsWeek = language === 'ta' ? ['திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி', 'ஞாயி'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const labelsSeason = language === 'ta' ? ['ஜூன்', 'ஜூலை', 'ஆக', 'செப்'] : ['Jun', 'Jul', 'Aug', 'Sep'];

  const getLabels = () => {
    if (activeTab === 'day') return labelsDay;
    if (activeTab === 'week') return labelsWeek;
    return labelsSeason;
  };

  const getTempData = () => {
    if (activeTab === 'day') return [28, 26, 30, 35, 33, 29];
    if (activeTab === 'week') return [32, 33, 35, 34, 30, 29, 31];
    return [34, 32, 29, 28];
  };

  const getRainData = () => {
    if (activeTab === 'day') return [10, 5, 0, 0, 20, 60];
    if (activeTab === 'week') return [0, 10, 5, 20, 80, 90, 40];
    return [60, 120, 150, 90];
  };

  const data = {
    labels: getLabels(),
    datasets: [
      {
        label: t('aiPrediction.metrics.temp') + ' (°C)',
        data: getTempData(),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: t('aiPrediction.metrics.rain') + ' (%)',
        data: getRainData(),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        borderDash: [5, 5],
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#64748b', font: { family: "'Inter', sans-serif" } }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawOnChartArea: false },
        ticks: { color: '#64748b' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', drawBorder: false },
        ticks: { color: '#f43f5e' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#38bdf8' }
      }
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('aiPrediction.forecastTitle')}</h3>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '8px', padding: '4px', border: '1px solid var(--glass-border)' }}>
          {['day', 'week', 'season'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {t(`aiPrediction.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>

    </div>
  );
};

export default WeatherForecast;
