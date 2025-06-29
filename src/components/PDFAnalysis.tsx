import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { TextAnalysis } from './TextAnalysis';

// Set up PDF.js worker using direct import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
        // Check file size (limit to 100MB)
        if (file.size > 100 * 1024 * 1024) {
          setError('PDF file is too large. Please upload a file smaller than 100MB.');
          setLoading(false);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        
        if (arrayBuffer.byteLength === 0) {
          setError('The PDF file appears to be empty or corrupted.');
          setLoading(false);
          return;
        }

        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          // Add error handling options
          verbosity: 0, // Reduce console output
          maxImageSize: 1024 * 1024, // Limit image size to 1MB
          disableFontFace: true, // Disable font loading for better performance
        }).promise;
        
        setPageCount(pdf.numPages);
        
        if (pdf.numPages === 0) {
          setError('The PDF file contains no pages.');
          setLoading(false);
          return;
        }
        
        let fullText = '';
        
        // Extract text from all pages (limit to first 50 pages for performance)
        const maxPages = Math.min(pdf.numPages, 50);
        
        for (let i = 1; i <= maxPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => {
                // Handle different types of text items
                if (typeof item.str === 'string') {
                  return item.str;
                }
                return '';
              })
              .join(' ');
            
            if (pageText.trim()) {
              fullText += pageText + '\n\n';
            }
          } catch (pageError) {
            console.warn(`Error extracting text from page ${i}:`, pageError);
            // Continue with other pages even if one fails
          }
        }
        
        if (fullText.trim().length === 0) {
          setError('No readable text found in the PDF. The document might contain only images or be password-protected.');
          setLoading(false);
          return;
        }
        
        if (pdf.numPages > 50) {
          fullText += `\n\n[Note: Only the first 50 pages of ${pdf.numPages} total pages were processed for performance reasons.]`;
        }
        
        setExtractedText(fullText);
        setLoading(false);
      } catch (err) {
        console.error('Error extracting PDF text:', err);
        
        // Provide more specific error messages
        if (err instanceof Error) {
          if (err.message.includes('Invalid PDF')) {
            setError('The file is not a valid PDF document.');
          } else if (err.message.includes('password')) {
            setError('The PDF is password-protected. Please provide an unlocked version.');
          } else if (err.message.includes('corrupt')) {
            setError('The PDF file appears to be corrupted.');
          } else {
            setError(`Failed to process PDF: ${err.message}`);
          }
        } else {
          setError('Failed to extract text from PDF. The file might be corrupted, password-protected, or contain only images.');
        }
        
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
            <div className="text-sm font-semibold text-white truncate" title={file.name}>
              {file.name}
            </div>
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