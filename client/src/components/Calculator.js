import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, Zap, Globe, Brain } from 'lucide-react';
import { getModels, getRegions } from '../services/api';

const Calculator = ({ onCalculate, onReset, loading }) => {
  const [formData, setFormData] = useState({
    tokens: '',
    model: 'default',
    region: 'global-average'
  });
  
  const [models, setModels] = useState({});
  const [regions, setRegions] = useState({});
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsResponse, regionsResponse] = await Promise.all([
          getModels(),
          getRegions()
        ]);
        
        setModels(modelsResponse.modelInfo);
        setRegions(regionsResponse.regionInfo);
      } catch (error) {
        console.error('Error fetching models and regions:', error);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tokens || formData.tokens <= 0) {
      alert('Please enter a valid number of tokens');
      return;
    }
    
    onCalculate({
      tokens: parseInt(formData.tokens),
      model: formData.model,
      region: formData.region
    });
  };

  const handleReset = () => {
    setFormData({
      tokens: '',
      model: 'default',
      region: 'global-average'
    });
    onReset();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 card-hover">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
          <CalculatorIcon className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calculate Impact</h2>
          <p className="text-gray-600">Enter your AI usage details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Input */}
        <div>
          <label htmlFor="tokens" className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline mr-2" />
            Number of Tokens
          </label>
          <input
            type="number"
            id="tokens"
            name="tokens"
            value={formData.tokens}
            onChange={handleInputChange}
            placeholder="e.g., 1000, 50000, 100000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            required
            min="1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the total number of tokens used in your AI interactions
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4 inline mr-2" />
            AI Model
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            disabled={modelsLoading}
          >
            {modelsLoading ? (
              <option>Loading models...</option>
            ) : (
              Object.entries(models).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))
            )}
          </select>
        </div>

        {/* Region Selection */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Geographic Region
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            disabled={modelsLoading}
          >
            {modelsLoading ? (
              <option>Loading regions...</option>
            ) : (
              Object.entries(regions).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))
            )}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Select your region for accurate CO₂ emission calculations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading || modelsLoading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Calculating...
              </div>
            ) : (
              'Calculate Impact'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Quick Examples */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Examples:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, tokens: '1000' }))}
            className="text-left p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="font-medium">1,000 tokens</span>
            <br />
            <span className="text-gray-500">Short conversation</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, tokens: '10000' }))}
            className="text-left p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="font-medium">10,000 tokens</span>
            <br />
            <span className="text-gray-500">Long document analysis</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, tokens: '100000' }))}
            className="text-left p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="font-medium">100,000 tokens</span>
            <br />
            <span className="text-gray-500">Heavy usage session</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, tokens: '1000000' }))}
            className="text-left p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="font-medium">1M tokens</span>
            <br />
            <span className="text-gray-500">Monthly usage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
