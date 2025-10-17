import React from 'react';
import { Github, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Calculator</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              This calculator helps you understand the environmental impact of AI usage by converting 
              token consumption into real-world equivalences. All calculations are based on 
              peer-reviewed research and industry data.
            </p>
          </div>

          {/* Methodology */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>• Energy consumption per token estimates</li>
              <li>• Regional CO₂ emission factors</li>
              <li>• Real-world equivalence calculations</li>
              <li>• Conservative estimates for accuracy</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <div className="space-y-2">
              <a
                href="https://github.com/MoeTheToe/AI-Environmental-Impact-Calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors text-sm"
              >
                <Github className="w-4 h-4 mr-2" />
                View Source Code
              </a>
              <a
                href="https://github.com/MoeTheToe/AI-Environmental-Impact-Calculator#calculation-methodology"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Research Sources
              </a>
              <a
                href="https://github.com/MoeTheToe/AI-Environmental-Impact-Calculator#api-endpoints"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                API Documentation
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-600 text-sm mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              <span>for environmental awareness</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>© 2024 AI Environmental Impact Calculator</span>
              <span>•</span>
              <span>Open Source</span>
              <span>•</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Disclaimer:</strong> These calculations are estimates based on current research data. 
            Actual environmental impact may vary based on specific model implementations, 
            data center efficiency, and regional energy sources. This tool is for educational 
            and awareness purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
