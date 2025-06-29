import React from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

interface FeatureSelectorProps {
  totalRows: number;
  selectedRow: number;
  onRowChange: (row: number) => void;
  currentRowData: Record<string, string>;
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  totalRows,
  selectedRow,
  onRowChange,
  currentRowData
}) => {
  const handlePrevious = () => {
    onRowChange(Math.max(0, selectedRow - 1));
  };

  const handleNext = () => {
    onRowChange(Math.min(totalRows - 1, selectedRow + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary-600/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-secondary-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Row Selection</h4>
            <p className="text-sm text-slate-400">
              Analyzing row {selectedRow + 1} of {totalRows}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={selectedRow === 0}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 
                     disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-4 py-2 bg-slate-700 rounded-lg text-sm font-mono">
            {selectedRow + 1} / {totalRows}
          </span>
          
          <button
            onClick={handleNext}
            disabled={selectedRow === totalRows - 1}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 
                     disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(currentRowData).map(([feature, value]) => (
          <div key={feature} className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1 truncate">{feature}</div>
            <div className="text-sm font-semibold text-white truncate">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};