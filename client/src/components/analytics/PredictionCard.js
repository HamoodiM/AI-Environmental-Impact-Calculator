/**
 * Prediction Card Component
 * 
 * Display predictive insights and forecasts
 * Phase 4: Advanced Analytics & Reporting
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PredictionCard = ({ title, value, unit, trend, confidence, description }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
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

  const getTrendBgColor = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'bg-red-50 border-red-200';
      case 'decreasing':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getTrendBgColor(trend)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {getTrendIcon(trend)}
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-lg text-gray-600 ml-2">{unit}</span>
      </div>
      
      {confidence && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">Confidence: </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
      
      <div className="flex items-center">
        <span className={`text-sm font-medium capitalize ${getTrendColor(trend)}`}>
          {trend} trend
        </span>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
};

export default PredictionCard;
