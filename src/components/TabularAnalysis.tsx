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
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check file size (limit to 50MB for CSV)
    if (file.size > 50 * 1024 * 1024) {
      setError('CSV file is too large. Please upload a file smaller than 50MB.');
      setLoading(false);
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        try {
          if (result.errors && result.errors.length > 0) {
            console.warn('CSV parsing warnings:', result.errors);
          }

          const csvData = result.data as string[][];
          
          if (!csvData || csvData.length === 0) {
            setError('The CSV file appears to be empty.');
            setLoading(false);
            return;
          }

          const headers = csvData[0];
          if (!headers || headers.length === 0) {
            setError('The CSV file has no headers.');
            setLoading(false);
            return;
          }

          const rows = csvData.slice(1).filter(row => 
            row && row.length === headers.length && row.some(cell => cell && cell.trim())
          );
          
          if (rows.length === 0) {
            setError('The CSV file contains no valid data rows.');
            setLoading(false);
            return;
          }

          setFeatures(headers);
          setData(rows);
          setLoading(false);
        } catch (err) {
          console.error('Error processing CSV:', err);
          setError('Failed to process the CSV file. Please ensure it\'s properly formatted.');
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse the CSV file. Please ensure it\'s a valid CSV format.');
        setLoading(false);
      },
      header: false,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });
  }, [file]);

  const currentRowData = useMemo(() => {
    if (!data[selectedRowIndex]) return {};
    return features.reduce((acc, feature, index) => {
      acc[feature] = data[selectedRowIndex][index] || '';
      return acc;
    }, {} as Record<string, string>);
  }, [data, selectedRowIndex, features]);

  useEffect(() => {
    if (features.length > 0) {
      try {
        const mockValues = generateMockSHAPValues(features);
        setSHAPValues(mockValues);
      } catch (err) {
        console.error('Error generating SHAP values:', err);
        setError('Failed to generate analysis data.');
      }
    }
  }, [features, selectedRowIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-slate-400">Processing CSV file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <div className="text-error-500 text-lg font-semibold mb-2">CSV Processing Error</div>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate optimal chart dimensions with more generous width
  const chartWidth = Math.min(containerDimensions.width - 50, 1000);
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