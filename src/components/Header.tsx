import React from 'react';
import { Brain, Share, Video, RotateCcw, Github } from 'lucide-react';

interface HeaderProps {
  onRecord: () => void;
  isRecording: boolean;
  hasData: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRecord, 
  isRecording, 
  hasData, 
  onReset 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Top trademark bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-500">
              © {currentYear} Explainability Explorer™ - Advanced ML Model Interpretation
            </div>
            <div className="text-slate-500">
              Powered by React & Visx
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Explainability Explorer™
                </h1>
                <p className="text-sm text-slate-400">
                  ML Model Interpretation Tool
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasData && (
                <>
                  <button
                    onClick={onRecord}
                    disabled={isRecording}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 
                             disabled:bg-accent-800 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Video className={`w-4 h-4 ${isRecording ? 'animate-pulse-soft' : ''}`} />
                    <span>{isRecording ? 'Recording...' : 'Record & Share'}</span>
                  </button>

                  <button
                    onClick={onReset}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 
                             rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </>
              )}

              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 
                               rounded-lg transition-colors">
                <Github className="w-4 h-4" />
                <span>Discussions</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};