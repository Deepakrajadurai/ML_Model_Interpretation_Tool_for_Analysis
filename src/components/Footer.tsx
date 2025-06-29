import React from 'react';
import { Brain } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Explainability Explorer
              </h3>
              <p className="text-sm text-slate-400">
                ML Model Interpretation Tool
              </p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-slate-400">
              © {currentYear} Explainability Explorer. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Built with React, TypeScript, and Visx
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Features</h4>
              <ul className="space-y-1 text-slate-400">
                <li>SHAP Analysis</li>
                <li>Grad-CAM Visualization</li>
                <li>Interactive Charts</li>
                <li>Export & Share</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Supported Formats</h4>
              <ul className="space-y-1 text-slate-400">
                <li>CSV Files</li>
                <li>PNG Images</li>
                <li>JPG Images</li>
                <li>JPEG Images</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Resources</h4>
              <ul className="space-y-1 text-slate-400">
                <li>Documentation</li>
                <li>GitHub Repository</li>
                <li>Community Discussions</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};