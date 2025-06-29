import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { TabularAnalysis } from './components/TabularAnalysis';
import { ImageAnalysis } from './components/ImageAnalysis';
import { TextAnalysis } from './components/TextAnalysis';
import { PDFAnalysis } from './components/PDFAnalysis';
import { ShareModal } from './components/ShareModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useResizeObserver } from './hooks/useResizeObserver';

export interface DataFile {
  file: File;
  type: 'tabular' | 'image' | 'text' | 'pdf';
  data?: any;
  preview?: string;
}

function App() {
  const [dataFile, setDataFile] = useState<DataFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { ref: containerRef, dimensions } = useResizeObserver();

  const handleFileUpload = useCallback((file: File, type: 'tabular' | 'image' | 'text' | 'pdf') => {
    setDataFile({ file, type });
  }, []);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    // Canvas capture stream logic would go here
    setTimeout(() => {
      setIsRecording(false);
      setShowShareModal(true);
    }, 3000);
  }, []);

  const resetAnalysis = useCallback(() => {
    setDataFile(null);
  }, []);

  const renderAnalysis = () => {
    if (!dataFile) return null;

    switch (dataFile.type) {
      case 'tabular':
        return (
          <ErrorBoundary>
            <TabularAnalysis 
              file={dataFile.file} 
              containerDimensions={dimensions}
            />
          </ErrorBoundary>
        );
      case 'image':
        return (
          <ErrorBoundary>
            <ImageAnalysis 
              file={dataFile.file}
              containerDimensions={dimensions}
            />
          </ErrorBoundary>
        );
      case 'text':
        return (
          <ErrorBoundary>
            <TextAnalysis 
              file={dataFile.file}
              containerDimensions={dimensions}
            />
          </ErrorBoundary>
        );
      case 'pdf':
        return (
          <ErrorBoundary>
            <PDFAnalysis 
              file={dataFile.file}
              containerDimensions={dimensions}
            />
          </ErrorBoundary>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div ref={containerRef} className="min-h-screen bg-slate-900 text-white flex flex-col">
        <Header 
          onRecord={handleStartRecording}
          isRecording={isRecording}
          hasData={!!dataFile}
          onReset={resetAnalysis}
        />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          {!dataFile ? (
            <UploadZone onUpload={handleFileUpload} />
          ) : (
            <div className="animate-fade-in">
              {renderAnalysis()}
            </div>
          )}
        </main>

        <Footer />

        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;