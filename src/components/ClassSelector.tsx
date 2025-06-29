import React from 'react';
import { Target } from 'lucide-react';

interface ClassSelectorProps {
  selectedClass: string;
  onClassChange: (className: string) => void;
}

const MOCK_CLASSES = [
  { id: 'cat', name: 'Cat', confidence: 0.87 },
  { id: 'dog', name: 'Dog', confidence: 0.12 },
  { id: 'bird', name: 'Bird', confidence: 0.01 }
];

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClass,
  onClassChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-accent-600/20 rounded-lg">
          <Target className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Class Predictions</h4>
          <p className="text-sm text-slate-400">
            Select a class to view its Grad-CAM explanation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_CLASSES.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onClassChange(cls.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedClass === cls.id
                ? 'border-accent-500 bg-accent-500/20'
                : 'border-slate-600 bg-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-left">
              <div className="text-white font-semibold">{cls.name}</div>
              <div className="text-sm text-slate-400">
                {(cls.confidence * 100).toFixed(1)}% confidence
              </div>
              <div className="mt-2 bg-slate-600 rounded-full h-2">
                <div
                  className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cls.confidence * 100}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};