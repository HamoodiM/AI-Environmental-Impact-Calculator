/**
 * Comparison Chart Component
 * 
 * Bar chart for comparing models or regions
 * Phase 4: Advanced Analytics & Reporting
 */

import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

const ComparisonChart = ({ data, title, type = 'models' }) => {
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

  // Generate colors for charts
  const generateColors = (length) => {
    const colors = [
      'rgb(34, 197, 94)',   // green
      'rgb(59, 130, 246)',  // blue
      'rgb(168, 85, 247)',  // purple
      'rgb(239, 68, 68)',   // red
      'rgb(245, 158, 11)',  // yellow
      'rgb(236, 72, 153)',  // pink
      'rgb(14, 165, 233)',  // sky
      'rgb(34, 211, 238)',  // cyan
    ];
    
    return Array.from({ length }, (_, i) => colors[i % colors.length]);
  };

  const colors = generateColors(data.length);

  if (type === 'models') {
    // Model comparison - show CO2 per token
    const chartData = {
      labels: data.map(item => item.model.toUpperCase()),
      datasets: [
        {
          label: 'CO₂ per Token (kg)',
          data: data.map(item => item.avgCo2PerToken),
          backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
          borderColor: colors,
          borderWidth: 1,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'CO₂ per Token (kg)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'AI Model'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
        
        {/* Model efficiency indicators */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="text-gray-700">{item.model}</span>
              <span className="text-gray-500">({item.efficiency})</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (type === 'regions') {
    // Regional comparison - show carbon intensity
    const chartData = {
      labels: data.map(item => item.regionName || item.region),
      datasets: [
        {
          label: 'Carbon Intensity (kg CO₂/kWh)',
          data: data.map(item => item.avgCarbonIntensity),
          backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
          borderColor: colors,
          borderWidth: 1,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Carbon Intensity (kg CO₂/kWh)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Region'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
        
        {/* Regional usage indicators */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="text-gray-700">{item.regionName || item.region}</span>
              <span className="text-gray-500">({item.calculations} uses)</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // Default: show total CO2 emissions
    const chartData = {
      labels: data.map(item => item.model || item.region),
      datasets: [
        {
          label: 'Total CO₂ (kg)',
          data: data.map(item => item.totalCo2),
          backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
          borderColor: colors,
          borderWidth: 1,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total CO₂ (kg)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          title: {
            display: true,
            text: type === 'models' ? 'AI Model' : 'Region'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  }
};

export default ComparisonChart;
