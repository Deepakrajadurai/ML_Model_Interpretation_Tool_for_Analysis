import React, { useState, useEffect, useMemo } from 'react';
import { SentimentChart } from './visualizations/SentimentChart';
import { WordCloud } from './visualizations/WordCloud';
import { TextMetrics } from './TextMetrics';
import { generateMockSentimentData, generateMockWordCloudData } from '../utils/mockData';

interface TextAnalysisProps {
  file: File;
  containerDimensions: { width: number; height: number };
}

export const TextAnalysis: React.FC<TextAnalysisProps> = ({ 
  file, 
  containerDimensions 
}) => {
  const [textContent, setTextContent] = useState<string>('');
  const [sentimentData, setSentimentData] = useState<Array<{ sentence: string; sentiment: number; confidence: number }>>([]);
  const [wordCloudData, setWordCloudData] = useState<Array<{ text: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextContent(content);
      
      // Generate mock analysis data
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const mockSentiment = generateMockSentimentData(sentences);
      const mockWordCloud = generateMockWordCloudData(content);
      
      setSentimentData(mockSentiment);
      setWordCloudData(mockWordCloud);
      setLoading(false);
    };
    
    reader.readAsText(file);
  }, [file]);

  const textMetrics = useMemo(() => {
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      characters: textContent.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      readingTime: Math.ceil(words.length / 200) // Assuming 200 words per minute
    };
  }, [textContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-2xl font-semibold text-white mb-6">Text Analysis</h3>
        
        <TextMetrics metrics={textMetrics} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <SentimentChart
            data={sentimentData}
            width={Math.min(containerDimensions.width / 2 - 100, 400)}
            height={300}
          />
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <WordCloud
            data={wordCloudData}
            width={Math.min(containerDimensions.width / 2 - 100, 400)}
            height={300}
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4">Text Preview</h4>
        <div className="bg-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
            {textContent.substring(0, 1000)}
            {textContent.length > 1000 && '...'}
          </pre>
        </div>
      </div>
    </div>
  );
};