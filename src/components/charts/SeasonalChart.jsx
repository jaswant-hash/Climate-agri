import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Global Chart configurations
ChartJS.defaults.color = '#4b5563';
ChartJS.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ChartJS.defaults.scale.grid.color = '#e5e7eb';
ChartJS.defaults.plugins.tooltip.backgroundColor = '#111827';
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 6;

const SeasonalChart = ({ opacity }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    datasets: []
  });

  useEffect(() => {
    setChartData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          type: 'bar',
          label: 'Precipitation (mm)',
          data: [120, 105, 90, 60, 40, 20, 15, 30, 80, 110, 130, 140],
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.5,
        }
      ]
    });
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Precipitation (mm)'
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="chart-card main-chart-card">
        <div className="card-header">
            <h2>Seasonal Precipitation</h2>
            <button className="icon-btn"><span className="material-symbols-rounded">more_vert</span></button>
        </div>
        <div className="chart-container" style={{ opacity: opacity, transition: 'opacity 0.2s' }}>
            <Chart ref={chartRef} type="bar" data={chartData} options={options} />
        </div>
    </div>
  );
};

export default SeasonalChart;
