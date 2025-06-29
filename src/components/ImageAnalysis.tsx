import React, { useState, useEffect, useMemo } from 'react';
import { GradCAMHeatmap } from './visualizations/GradCAMHeatmap';
import { ClassSelector } from './ClassSelector';
import { generateMockGradCAMData } from '../utils/mockData';

interface ImageAnalysisProps {
  file: File;
  containerDimensions: { width: number; height: number };
}

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ 
  file, 
  containerDimensions 
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState('cat');
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);

  const gradCAMData = useMemo(() => {
    return generateMockGradCAMData(32, 32);
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    // Set heatmap data and loading state together to prevent timing issues
    setHeatmapData(gradCAMData);
    setLoading(false);

    return () => URL.revokeObjectURL(url);
  }, [file, gradCAMData]);

  useEffect(() => {
    setHeatmapData(gradCAMData);
  }, [gradCAMData]);

  if (loading || heatmapData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const maxWidth = Math.min(containerDimensions.width - 100, 600);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-2xl font-semibold text-white mb-6">Grad-CAM Visualization</h3>
        
        <ClassSelector
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Original Image</h4>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxWidth: maxWidth / 2 }}
            />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Grad-CAM Heatmap</h4>
          <GradCAMHeatmap
            data={heatmapData}
            width={Math.min(maxWidth / 2, 300)}
            height={Math.min(maxWidth / 2, 300)}
          />
        </div>
      </div>
    </div>
  );
};