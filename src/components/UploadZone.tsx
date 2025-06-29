import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Zap, FileType, BookOpen, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File, type: 'tabular' | 'image' | 'text' | 'pdf') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const [uploadError, setUploadError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setUploadError('File is too large. Please upload a file smaller than 100MB.');
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setUploadError('File type not supported. Please upload a CSV, image, text, or PDF file.');
      } else {
        setUploadError('File upload failed. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Additional file validation
    if (file.size === 0) {
      setUploadError('The selected file is empty. Please choose a valid file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setUploadError('File is too large. Please upload a file smaller than 100MB.');
      return;
    }

    try {
      const isImage = file.type.startsWith('image/');
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isText = file.type.startsWith('text/') && !isCSV;
      const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

      if (isImage || isHEIC) {
        onUpload(file, 'image');
      } else if (isCSV) {
        onUpload(file, 'tabular');
      } else if (isPDF) {
        onUpload(file, 'pdf');
      } else if (isText) {
        onUpload(file, 'text');
      } else {
        setUploadError('Unsupported file type. Please upload a CSV, image (PNG/JPG/HEIC), text, or PDF file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadError('An error occurred while processing the file. Please try again.');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'text/*': ['.txt', '.md', '.log'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.heif']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    onError: (error) => {
      console.error('Dropzone error:', error);
      setUploadError('An error occurred during file upload. Please try again.');
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">
          Explore Model Explanations
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload your data to visualize SHAP explanations for tabular data, 
          Grad-CAM heatmaps for images, sentiment analysis for text, or document analysis for PDFs.
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 bg-error-600/20 border border-error-600/30 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0" />
          <p className="text-error-300">{uploadError}</p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer 
                   transition-all duration-300 hover:border-primary-500 hover:bg-slate-800/50
                   ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-slate-600'}
                   ${uploadError ? 'border-error-500/50' : ''}`}
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
        
        <p className="text-slate-400 mb-2">
          Drag and drop a file or click to browse
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Maximum file size: 100MB
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
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

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-accent-600/20 rounded-full">
                <Image className="w-8 h-8 text-accent-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Images</h4>
            <p className="text-slate-400 text-sm mb-4">
              PNG, JPG, HEIC files for Grad-CAM visualization
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Zap className="w-3 h-3 mr-1" />
              Smooth heatmap transitions
            </div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary-600/20 rounded-full">
                <FileType className="w-8 h-8 text-primary-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Text Files</h4>
            <p className="text-slate-400 text-sm mb-4">
              TXT, MD files for sentiment & topic analysis
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Zap className="w-3 h-3 mr-1" />
              Word cloud & sentiment
            </div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-warning-600/20 rounded-full">
                <BookOpen className="w-8 h-8 text-warning-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">PDF Documents</h4>
            <p className="text-slate-400 text-sm mb-4">
              PDF files for document structure analysis
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Zap className="w-3 h-3 mr-1" />
              Text extraction & analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};