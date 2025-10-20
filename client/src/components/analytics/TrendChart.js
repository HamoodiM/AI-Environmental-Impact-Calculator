/**
 * Trend Chart Component
 * 
 * Line chart for displaying historical trends
 * Phase 4: Advanced Analytics & Reporting
 */

import React from 'react';
import { Line } from 'react-chartjs-2';

const TrendChart = ({ data, title, type = 'co2' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      // Format date based on data type
      if (item.date) {
        return new Date(item.date).toLocaleDateString();
      } else if (item.week) {
        return `Week ${item.week.split('-W')[1]}`;
      } else if (item.month) {
        return new Date(item.month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      }
      return item.date || item.week || item.month;
    }),
    datasets: [
      {
        label: 'CO₂ Emissions (kg)',
        data: data.map(item => item.co2),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Energy (kWh)',
        data: data.map(item => item.energy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'CO₂ Emissions (kg)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Energy (kWh)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;
