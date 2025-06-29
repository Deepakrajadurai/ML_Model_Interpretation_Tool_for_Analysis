import React, { useState, useEffect } from 'react';
import { Brain, Share, Video, RotateCcw, Github } from 'lucide-react';

interface HeaderProps {
  onRecord: () => void;
  isRecording: boolean;
  hasData: boolean;
  onReset: () => void;
}

const QUOTES = [
  "The goal is to turn data into information, and information into insight. - Carly Fiorina",
  "In God we trust. All others must bring data. - W. Edwards Deming",
  "Data is the new oil. It's valuable, but if unrefined it cannot really be used. - Clive Humby",
  "Without big data analytics, companies are blind and deaf, wandering out onto the web like deer on a freeway. - Geoffrey Moore",
  "The best thing about being a statistician is that you get to play in everyone's backyard. - John Tukey",
  "Data will talk to you if you're willing to listen. - Jim Bergeson",
  "Torture the data, and it will confess to anything. - Ronald Coase",
  "What we have is a data glut, but what we need is data literacy. - Jordan Morrow",
  "The ability to take data—to be able to understand it, to process it, to extract value from it, to visualize it, to communicate it—that's going to be a hugely important skill. - Hal Varian",
  "Data is not information, information is not knowledge, knowledge is not understanding, understanding is not wisdom. - Clifford Stoll"
];

export const Header: React.FC<HeaderProps> = ({ 
  onRecord, 
  isRecording, 
  hasData, 
  onReset 
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Explainability Explorer
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
        
        {/* Dynamic Quote Section */}
        <div className="pb-4">
          <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
            <p className="text-sm text-slate-300 italic text-center transition-all duration-500 ease-in-out">
              "{QUOTES[currentQuoteIndex]}"
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};