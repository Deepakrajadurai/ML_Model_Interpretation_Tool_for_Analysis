import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { SHAPBarChart } from './visualizations/SHAPBarChart';
import { FeatureSelector } from './FeatureSelector';
import { generateMockSHAPValues } from '../utils/mockData';

interface TabularAnalysisProps {
  file: File;
  containerDimensions: { width: number; height: number };
}

export const TabularAnalysis: React.FC<TabularAnalysisProps> = ({ 
  file, 
  containerDimensions 
}) => {
  const [data, setData] = useState<any[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [shapValues, setSHAPValues] = useState<Array<{ feature: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(file, {
      complete: (result) => {
        const csvData = result.data as string[][];
        const headers = csvData[0];
        const rows = csvData.slice(1).filter(row => row.length === headers.length);
        
        setFeatures(headers);
        setData(rows);
        setLoading(false);
      },
      header: false
    });
  }, [file]);

  const currentRowData = useMemo(() => {
    if (!data[selectedRowIndex]) return {};
    return features.reduce((acc, feature, index) => {
      acc[feature] = data[selectedRowIndex][index];
      return acc;
    }, {} as Record<string, string>);
  }, [data, selectedRowIndex, features]);

  useEffect(() => {
    if (features.length > 0) {
      const mockValues = generateMockSHAPValues(features);
      setSHAPValues(mockValues);
    }
  }, [features, selectedRowIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Calculate optimal chart dimensions
  const chartWidth = Math.min(containerDimensions.width - 100, 900);
  const chartHeight = Math.max(400, Math.min(600, features.length * 40 + 160));

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-2xl font-semibold text-white mb-6">SHAP Feature Importance</h3>
        
        <FeatureSelector
          totalRows={data.length}
          selectedRow={selectedRowIndex}
          onRowChange={setSelectedRowIndex}
          currentRowData={currentRowData}
        />
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <SHAPBarChart
          data={shapValues}
          width={chartWidth}
          height={chartHeight}
        />
      </div>
    </div>
  );
};