import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextAnalysis } from './TextAnalysis';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFAnalysisProps {
  file: File;
  containerDimensions: { width: number; height: number };
}

export const PDFAnalysis: React.FC<PDFAnalysisProps> = ({ 
  file, 
  containerDimensions 
}) => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const extractTextFromPDF = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPageCount(pdf.numPages);
        
        let fullText = '';
        
        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }
        
        setExtractedText(fullText);
        setLoading(false);
      } catch (err) {
        console.error('Error extracting PDF text:', err);
        setError('Failed to extract text from PDF. The file might be corrupted or password-protected.');
        setLoading(false);
      }
    };

    extractTextFromPDF();
  }, [file]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-slate-400">Extracting text from PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <div className="text-error-500 text-lg font-semibold mb-2">PDF Processing Error</div>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Create a virtual text file for the TextAnalysis component
  const textFile = new File([extractedText], `${file.name}.txt`, { type: 'text/plain' });

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-2xl font-semibold text-white mb-4">PDF Document Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">File Name</div>
            <div className="text-sm font-semibold text-white truncate">{file.name}</div>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Pages</div>
            <div className="text-sm font-semibold text-white">{pageCount}</div>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">File Size</div>
            <div className="text-sm font-semibold text-white">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Extracted Text</div>
            <div className="text-sm font-semibold text-white">
              {extractedText.length.toLocaleString()} chars
            </div>
          </div>
        </div>
      </div>

      {/* Use TextAnalysis component for the extracted text */}
      <TextAnalysis 
        file={textFile}
        containerDimensions={containerDimensions}
      />
    </div>
  );
};