/**
 * Analytics Dashboard
 * 
 * Advanced analytics and reporting interface
 * Phase 4: Advanced Analytics & Reporting
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar,
  Zap,
  Globe,
  Brain,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import toast from 'react-hot-toast';
import TrendChart from './TrendChart';
import ComparisonChart from './ComparisonChart';
import PredictionCard from './PredictionCard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const { userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics summary
      const response = await fetch(`/api/analytics/summary?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format = 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingUp className="w-5 h-5 text-green-500 rotate-180" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Start making calculations to see your analytics.</p>
        </div>
      </div>
    );
  }

  const { trends, modelComparison, regionalComparison, predictions } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-gray-600">Advanced insights into your environmental impact</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              {/* Export Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Calculations</p>
                <p className="text-2xl font-semibold text-gray-900">{trends.summary.totalCalculations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">{trends.summary.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total CO₂</p>
                <p className="text-2xl font-semibold text-gray-900">{trends.summary.totalCo2} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getTrendIcon(trends.summary.trendDirection)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trend</p>
                <p className={`text-2xl font-semibold capitalize ${getTrendColor(trends.summary.trendDirection)}`}>
                  {trends.summary.trendDirection}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'trends', name: 'Trends', icon: TrendingUp },
                { id: 'models', name: 'Models', icon: Brain },
                { id: 'regions', name: 'Regions', icon: Globe },
                { id: 'predictions', name: 'Predictions', icon: PieChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrendChart data={trends.trends.daily} title="Daily CO₂ Emissions" />
                  <ComparisonChart 
                    data={modelComparison.models} 
                    title="Model Comparison" 
                    type="models"
                  />
                </div>
                
                {predictions.predictions && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PredictionCard 
                      title="7-Day Forecast"
                      value={predictions.predictions.weekly}
                      unit="kg CO₂"
                      trend={predictions.insights.trend}
                    />
                    <PredictionCard 
                      title="Monthly Projection"
                      value={predictions.predictions.monthly}
                      unit="kg CO₂"
                      trend={predictions.insights.trend}
                    />
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Insight</h3>
                      <p className="text-gray-600">{predictions.insights.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <TrendChart data={trends.trends.daily} title="Daily Trends" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrendChart data={trends.trends.weekly} title="Weekly Trends" />
                  <TrendChart data={trends.trends.monthly} title="Monthly Trends" />
                </div>
              </div>
            )}

            {/* Models Tab */}
            {activeTab === 'models' && (
              <div className="space-y-6">
                <ComparisonChart 
                  data={modelComparison.models} 
                  title="Model Efficiency Comparison" 
                  type="models"
                />
                {modelComparison.insights && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Most Efficient</h3>
                      <p className="text-green-700">{modelComparison.insights.mostEfficient?.model}</p>
                      <p className="text-sm text-green-600">
                        {modelComparison.insights.mostEfficient?.avgCo2PerToken} kg CO₂/token
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Least Efficient</h3>
                      <p className="text-red-700">{modelComparison.insights.leastEfficient?.model}</p>
                      <p className="text-sm text-red-600">
                        {modelComparison.insights.leastEfficient?.avgCo2PerToken} kg CO₂/token
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regions Tab */}
            {activeTab === 'regions' && (
              <div className="space-y-6">
                <ComparisonChart 
                  data={regionalComparison.regions} 
                  title="Regional Carbon Intensity" 
                  type="regions"
                />
                {regionalComparison.insights && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Lowest Intensity</h3>
                      <p className="text-green-700">{regionalComparison.insights.lowestIntensity?.regionName}</p>
                      <p className="text-sm text-green-600">
                        {regionalComparison.insights.lowestIntensity?.avgCarbonIntensity} kg CO₂/kWh
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Highest Intensity</h3>
                      <p className="text-red-700">{regionalComparison.insights.highestIntensity?.regionName}</p>
                      <p className="text-sm text-red-600">
                        {regionalComparison.insights.highestIntensity?.avgCarbonIntensity} kg CO₂/kWh
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div className="space-y-6">
                {predictions.predictions ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <PredictionCard 
                        title="7-Day Forecast"
                        value={predictions.predictions.weekly}
                        unit="kg CO₂"
                        trend={predictions.insights.trend}
                      />
                      <PredictionCard 
                        title="Monthly Projection"
                        value={predictions.predictions.monthly}
                        unit="kg CO₂"
                        trend={predictions.insights.trend}
                      />
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Confidence</h3>
                        <p className="text-blue-700">
                          {Math.round(predictions.insights.confidence * 100)}%
                        </p>
                        <p className="text-sm text-blue-600">Based on {predictions.insights.dataPoints} data points</p>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Predictions</h3>
                      <div className="space-y-2">
                        {predictions.predictions.daily.map((prediction, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-700">{prediction.date}</span>
                            <span className="font-medium text-gray-900">{prediction.predictedCo2} kg CO₂</span>
                            <span className="text-sm text-gray-500">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Insufficient Data</h3>
                    <p className="text-gray-600">{predictions.insights.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
