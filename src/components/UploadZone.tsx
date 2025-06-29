import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Zap } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File, type: 'tabular' | 'image') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');

    if (isImage) {
      onUpload(file, 'image');
    } else if (isCSV) {
      onUpload(file, 'tabular');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">
          Explore Model Explanations
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload your data to visualize SHAP explanations for tabular data or 
          Grad-CAM heatmaps for images with smooth, interactive visualizations.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer 
                   transition-all duration-300 hover:border-primary-500 hover:bg-slate-800/50
                   ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-slate-600'}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-600/20 rounded-full">
            <Upload className="w-12 h-12 text-primary-400" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-white mb-4">
          {isDragActive ? 'Drop your file here' : 'Upload your data'}
        </h3>
        
        <p className="text-slate-400 mb-8">
          Drag and drop a file or click to browse
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-secondary-600/20 rounded-full">
                <FileText className="w-8 h-8 text-secondary-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Tabular Data</h4>
            <p className="text-slate-400 text-sm mb-4">
              CSV files for SHAP feature importance analysis
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Zap className="w-3 h-3 mr-1" />
              Interactive bar charts
            </div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-accent-600/20 rounded-full">
                <Image className="w-8 h-8 text-accent-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Images</h4>
            <p className="text-slate-400 text-sm mb-4">
              PNG, JPG files for Grad-CAM heatmap visualization
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Zap className="w-3 h-3 mr-1" />
              Smooth heatmap transitions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};