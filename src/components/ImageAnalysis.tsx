import React, { useState, useEffect, useMemo } from 'react';
import { GradCAMHeatmap } from './visualizations/GradCAMHeatmap';
import { ClassSelector } from './ClassSelector';
import { generateMockGradCAMData } from '../utils/mockData';
import heic2any from 'heic2any';

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
  const [error, setError] = useState<string>('');

  const gradCAMData = useMemo(() => {
    return generateMockGradCAMData(32, 32);
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    const processImage = async () => {
      try {
        // Check file size (limit to 50MB)
        if (file.size > 50 * 1024 * 1024) {
          setError('Image file is too large. Please upload an image smaller than 50MB.');
          setLoading(false);
          return;
        }

        let processedFile = file;
        
        // Check if it's a HEIC file and convert it
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            });
            
            // heic2any can return an array or single blob
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            processedFile = new File([blob], file.name.replace(/\.heic?$/i, '.jpg'), { type: 'image/jpeg' });
          } catch (heicError) {
            console.error('HEIC conversion failed:', heicError);
            setError('Failed to convert HEIC image. Please try converting it to JPG first.');
            setLoading(false);
            return;
          }
        }
        
        objectUrl = URL.createObjectURL(processedFile);
        setImageUrl(objectUrl);
        
        // Set heatmap data and loading state together to prevent timing issues
        setHeatmapData(gradCAMData);
        setLoading(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process the image. Please ensure it\'s a valid image file.');
        setLoading(false);
      }
    };

    processImage();

    // Cleanup function to revoke object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, gradCAMData]);

  useEffect(() => {
    if (gradCAMData.length > 0) {
      setHeatmapData(gradCAMData);
    }
  }, [gradCAMData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-slate-400">
          {file.name.toLowerCase().includes('.heic') ? 'Converting HEIC image...' : 'Loading image...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <div className="text-error-500 text-lg font-semibold mb-2">Image Processing Error</div>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (heatmapData.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <div className="text-error-500 text-lg font-semibold mb-2">Analysis Error</div>
          <p className="text-slate-400">Unable to generate heatmap data for this image.</p>
        </div>
      </div>
    );
  }

  const maxWidth = Math.min(containerDimensions.width - 100, 600);
  const imageWidth = Math.min(maxWidth / 2, 300);

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
              style={{ maxWidth: imageWidth }}
              onError={() => setError('Failed to display the image.')}
            />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <GradCAMHeatmap
            data={heatmapData}
            width={imageWidth}
            height={imageWidth}
          />
        </div>
      </div>
    </div>
  );
};