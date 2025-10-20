import React, { useState } from 'react';
import { 
  Car, 
  Plane, 
  Beef, 
  Smartphone, 
  Home, 
  TreePine, 
  Laptop, 
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Leaf,
  DollarSign
} from 'lucide-react';
import OffsetSuggestions from './offsets/OffsetSuggestions';

const Results = ({ result, loading, error }) => {
  const [showOffsetSuggestions, setShowOffsetSuggestions] = useState(false);
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating environmental impact...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculation Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Calculate</h3>
            <p className="text-gray-600">Enter your AI usage details to see the environmental impact</p>
          </div>
        </div>
      </div>
    );
  }

  const equivalences = result.equivalences;
  const co2Total = result.co2.total;
  const energyTotal = result.energy.total;

  const equivalenceItems = [
    {
      icon: Car,
      label: 'Car Miles',
      value: equivalences.carMiles,
      unit: 'miles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Plane,
      label: 'Flight Miles',
      value: equivalences.flightMiles,
      unit: 'miles',
      color: 'text-sky-600',
      bgColor: 'bg-sky-100'
    },
    {
      icon: Beef,
      label: 'Beef Burgers',
      value: equivalences.beefBurgers,
      unit: 'burgers',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Smartphone,
      label: 'Phone Charges',
      value: equivalences.smartphoneCharges,
      unit: 'charges',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Home,
      label: 'Household Electricity',
      value: equivalences.householdElectricityDays,
      unit: 'days',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: TreePine,
      label: 'Tree Years',
      value: equivalences.treeYears,
      unit: 'years',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Laptop,
      label: 'Laptop Hours',
      value: equivalences.laptopHours,
      unit: 'hours',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Lightbulb,
      label: 'Lightbulb Hours',
      value: equivalences.lightbulbHours,
      unit: 'hours',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <>
    <div className="bg-white rounded-2xl shadow-lg p-8 card-hover">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
          <Leaf className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Impact</h2>
          <p className="text-gray-600">Your AI usage results</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">CO₂ Emissions</p>
              <p className="text-xl font-bold text-red-700">
                {co2Total.toFixed(4)} kg
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Energy Used</p>
              <p className="text-xl font-bold text-blue-700">
                {energyTotal.toFixed(6)} kWh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model and Region Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Model:</span>
            <span className="font-medium text-gray-900 ml-2">{result.model}</span>
          </div>
          <div>
            <span className="text-gray-600">Region:</span>
            <span className="font-medium text-gray-900 ml-2">{result.region}</span>
          </div>
          <div>
            <span className="text-gray-600">Tokens:</span>
            <span className="font-medium text-gray-900 ml-2">{result.tokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Environmental Equivalences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Real-World Equivalences
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {equivalenceItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`${item.bgColor} rounded-lg p-3 transition-all duration-200 hover:scale-105`}
              >
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 ${item.color} mr-2`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>
                      {item.value.toLocaleString()} {item.unit}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="text-sm font-semibold text-green-800 mb-2">💡 Insight</h4>
        <p className="text-sm text-green-700">
          {co2Total > 0.1 
            ? `Your AI usage generated ${co2Total.toFixed(4)} kg of CO₂, equivalent to driving ${equivalences.carMiles.toFixed(2)} miles in a car. Consider optimizing your prompts to reduce token usage.`
            : `Your AI usage has a minimal environmental impact (${co2Total.toFixed(6)} kg CO₂). Great job on efficient usage!`
          }
        </p>
      </div>

      {/* Offset Suggestions */}
      {co2Total > 0.01 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Offset Your Impact
              </h4>
              <p className="text-sm text-blue-700">
                Neutralize your {co2Total.toFixed(4)} kg CO₂ emissions with verified offset projects
              </p>
            </div>
            <button
              onClick={() => setShowOffsetSuggestions(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Leaf className="w-4 h-4" />
              <span>View Options</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Offset Suggestions Modal */}
    {showOffsetSuggestions && (
      <OffsetSuggestions
        co2Kg={co2Total}
        onClose={() => setShowOffsetSuggestions(false)}
      />
    )}
    </>
  );
};

export default Results;
