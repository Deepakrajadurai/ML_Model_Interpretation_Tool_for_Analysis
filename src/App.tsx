import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { TabularAnalysis } from './components/TabularAnalysis';
import { ImageAnalysis } from './components/ImageAnalysis';
import { ShareModal } from './components/ShareModal';
import { useResizeObserver } from './hooks/useResizeObserver';

export interface DataFile {
  file: File;
  type: 'tabular' | 'image';
  data?: any;
  preview?: string;
}

function App() {
  const [dataFile, setDataFile] = useState<DataFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { ref: containerRef, dimensions } = useResizeObserver();

  const handleFileUpload = useCallback((file: File, type: 'tabular' | 'image') => {
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

  return (
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
            {dataFile.type === 'tabular' ? (
              <TabularAnalysis 
                file={dataFile.file} 
                containerDimensions={dimensions}
              />
            ) : (
              <ImageAnalysis 
                file={dataFile.file}
                containerDimensions={dimensions}
              />
            )}
          </div>
        )}
      </main>

      <Footer />

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

export default App;