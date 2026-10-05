import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CropRadarChart = () => {
  const data = {
    labels: ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Sorghum', 'Barley'],
    datasets: [
      {
        label: 'Current Viability',
        data: [85, 90, 75, 60, 50, 70],
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#94A3B8',
        pointBackgroundColor: '#94A3B8',
        borderWidth: 2
      },
      {
        label: 'Predicted (2030)',
        data: [65, 75, 85, 45, 90, 55],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
        pointBackgroundColor: '#10B981',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'var(--glass-border)' },
        grid: { color: '#f1f5f9' },
        pointLabels: {
          color: '#F8FAFC',
          font: { size: 12, family: "'Outfit', sans-serif" }
        },
        ticks: {
          display: false,
          max: 100,
          min: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true }
      }
    }
  };

  return (
    <div className="chart-card secondary-chart-card">
        <div className="card-header">
            <h2>Crop Viability Shift</h2>
        </div>
        <div className="chart-container radar-container">
            <Radar data={data} options={options} />
        </div>
    </div>
  );
};

export default CropRadarChart;
