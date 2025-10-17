import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Calculator from './components/Calculator';
import Results from './components/Results';
import Footer from './components/Footer';
import { calculateImpact } from './services/api';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calculateImpact(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred while calculating impact');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              AI Environmental Impact
              <span className="text-green-600 block">Calculator</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the environmental footprint of your AI usage. Calculate CO₂ emissions 
              and see real-world equivalences to understand your impact on the planet.
            </p>
          </div>

          {/* Calculator Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="slide-up">
              <Calculator 
                onCalculate={handleCalculate}
                onReset={handleReset}
                loading={loading}
              />
            </div>
            
            <div className="slide-up">
              <Results 
                result={result}
                loading={loading}
                error={error}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Track AI Environmental Impact?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Awareness</h3>
                <p className="text-gray-600">
                  Understanding the environmental cost of AI helps make informed decisions about usage.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  Get clear, research-based calculations of your AI usage's carbon footprint.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  Make conscious choices to reduce environmental impact and promote sustainable AI usage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
