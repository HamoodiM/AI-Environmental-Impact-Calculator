/**
 * Offset Suggestions Component
 * 
 * Displays carbon offset recommendations and project suggestions
 * Phase 4: Carbon Offset Suggestions
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Info,
  Calculator,
  BookOpen,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const OffsetSuggestions = ({ co2Kg, onClose }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [equivalences, setEquivalences] = useState(null);
  const [education, setEducation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    if (co2Kg && co2Kg > 0) {
      fetchOffsetData();
    }
  }, [co2Kg]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOffsetData = async () => {
    try {
      setLoading(true);
      
      // Fetch suggestions, equivalences, education, and providers in parallel
      const [suggestionsRes, equivalencesRes, educationRes, providersRes] = await Promise.all([
        fetch('/api/offsets/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
          },
          body: JSON.stringify({ co2Kg })
        }),
        fetch('/api/offsets/equivalences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
          },
          body: JSON.stringify({ co2Kg })
        }),
        fetch('/api/offsets/education', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
          }
        }),
        fetch('/api/offsets/providers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
          }
        })
      ]);

      if (!suggestionsRes.ok || !equivalencesRes.ok || !educationRes.ok || !providersRes.ok) {
        throw new Error('Failed to fetch offset data');
      }

      const [suggestionsData, equivalencesData, educationData, providersData] = await Promise.all([
        suggestionsRes.json(),
        equivalencesRes.json(),
        educationRes.json(),
        providersRes.json()
      ]);

      setSuggestions(suggestionsData.data);
      setEquivalences(equivalencesData.data);
      setEducation(educationData.data);
      setProviders(providersData.data);
    } catch (error) {
      console.error('Error fetching offset data:', error);
      toast.error('Failed to load offset suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Best Value':
        return 'bg-green-100 text-green-800';
      case 'Most Effective':
        return 'bg-blue-100 text-blue-800';
      case 'Quick Impact':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading offset suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions || !equivalences) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600">No offset data available</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Leaf className="w-6 h-6 mr-2" />
                Offset Your Impact
              </h2>
              <p className="text-green-100 mt-1">
                {co2Kg} kg CO₂ • {equivalences.co2Tons} tons
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'suggestions', name: 'Suggestions', icon: TrendingUp },
              { id: 'equivalences', name: 'Impact', icon: Calculator },
              { id: 'education', name: 'Learn More', icon: BookOpen },
              { id: 'providers', name: 'Providers', icon: Globe }
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Recommended Offset Projects
                </h3>
                <p className="text-gray-600">
                  Choose from verified carbon offset projects to neutralize your emissions
                </p>
              </div>

              <div className="grid gap-6">
                {suggestions.suggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {suggestion.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(suggestion.badge)}`}>
                            {suggestion.badge}
                          </span>
                        </div>
                        <p className="text-gray-600">{suggestion.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${suggestion.cost}
                        </div>
                        <div className="text-sm text-gray-500">USD</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ${suggestion.costPerTon}/ton CO₂
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {Math.round(suggestion.effectiveness * 100)}% effective
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {suggestion.duration}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Co-benefits:</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.coBenefits.map((benefit, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 italic">
                        {suggestion.recommendation}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Verified by: {suggestion.providers.slice(0, 2).join(', ')}
                      </div>
                      <a
                        href={suggestion.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cost Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Range:</span>
                    <span className="font-medium ml-2">
                      ${suggestions.summary.costRange.min} - ${suggestions.summary.costRange.max}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium ml-2">${suggestions.summary.averageCost}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium ml-2">{suggestions.summary.totalProjects}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equivalences Tab */}
          {activeTab === 'equivalences' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Impact Equivalences
                </h3>
                <p className="text-gray-600">
                  See what offsetting {co2Kg} kg of CO₂ means in real-world terms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(equivalences.equivalences).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3">Environmental Benefits</h4>
                <ul className="space-y-2">
                  {equivalences.impact.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && education && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Learn About Carbon Offsets
                </h3>
                <p className="text-gray-600">
                  Understanding how carbon offsets work and their impact
                </p>
              </div>

              {Object.entries(education).map(([key, section]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h4>
                  <p className="text-gray-600 mb-4">{section.content}</p>
                  
                  {section.keyPoints && (
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.steps && (
                    <ol className="space-y-2">
                      {section.steps.map((step, index) => (
                        <li key={index} className="flex items-start text-gray-600">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.categories && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {section.categories.map((category, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{category.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          {category.benefits && (
                            <div className="flex flex-wrap gap-1">
                              {category.benefits.map((benefit, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          )}
                          {category.costRange && (
                            <div className="text-sm text-gray-500 mt-2">
                              {category.costRange}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.criteria && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {section.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-start text-gray-600">
                          <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                          {criterion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && providers && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Free Offset Providers & Resources
                </h3>
                <p className="text-gray-600">
                  Explore free carbon offset calculators and verified project providers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {provider.description}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          provider.type === 'calculator' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {provider.type === 'calculator' ? 'Calculator' : 'Provider'}
                        </span>
                      </div>
                    </div>
                    
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Visit Website
                      <Globe className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">About Free Resources</h4>
                <p className="text-blue-700 text-sm mb-3">
                  These resources are provided free of charge to help you understand and calculate your carbon footprint. 
                  While some may offer paid offset services, the calculators and educational content are available at no cost.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Use calculators to understand your impact</li>
                  <li>• Research verified offset projects</li>
                  <li>• Learn about carbon offset standards</li>
                  <li>• Compare different offset options</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>All offset projects are verified by third-party standards</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setActiveTab('providers')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Providers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffsetSuggestions;
