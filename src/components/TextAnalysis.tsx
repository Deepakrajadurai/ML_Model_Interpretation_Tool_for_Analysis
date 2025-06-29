import React, { useState, useEffect, useMemo } from 'react';
import { SentimentChart } from './visualizations/SentimentChart';
import { WordCloud } from './visualizations/WordCloud';
import { TextMetrics } from './TextMetrics';
import { SentimentSummary } from './SentimentSummary';
import { analyzeSentiment, getOverallSentiment, SentimentResult } from '../utils/sentimentAnalysis';
import { analyzeWordFrequency, calculateTextStatistics, extractKeyPhrases } from '../utils/textAnalysis';

interface TextAnalysisProps {
  file: File;
  containerDimensions: { width: number; height: number };
}

export const TextAnalysis: React.FC<TextAnalysisProps> = ({ 
  file, 
  containerDimensions 
}) => {
  const [textContent, setTextContent] = useState<string>('');
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextContent(content);
      
      // Perform real sentiment analysis
      const results = analyzeSentiment(content);
      setSentimentResults(results);
      setLoading(false);
    };
    
    reader.readAsText(file);
  }, [file]);

  const textStatistics = useMemo(() => {
    if (!textContent) return null;
    return calculateTextStatistics(textContent);
  }, [textContent]);

  const wordFrequencies = useMemo(() => {
    if (!textContent) return [];
    return analyzeWordFrequency(textContent).slice(0, 50);
  }, [textContent]);

  const overallSentiment = useMemo(() => {
    return getOverallSentiment(sentimentResults);
  }, [sentimentResults]);

  const keyPhrases = useMemo(() => {
    if (!textContent) return [];
    return extractKeyPhrases(textContent, 8);
  }, [textContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-slate-400">Analyzing text content...</p>
      </div>
    );
  }

  if (!textStatistics) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <div className="text-error-500 text-lg font-semibold mb-2">Analysis Error</div>
          <p className="text-slate-400">Unable to analyze the text content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-2xl font-semibold text-white mb-6">Text Analysis Dashboard</h3>
        <TextMetrics metrics={textStatistics} />
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <SentimentSummary 
          overallSentiment={overallSentiment}
          totalSentences={sentimentResults.length}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <SentimentChart
            data={sentimentResults}
            width={Math.min(containerDimensions.width / 2 - 100, 400)}
            height={300}
          />
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <WordCloud
            data={wordFrequencies}
            width={Math.min(containerDimensions.width / 2 - 100, 400)}
            height={300}
          />
        </div>
      </div>

      {keyPhrases.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Key Phrases</h4>
          <div className="flex flex-wrap gap-2">
            {keyPhrases.map((phrase, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-sm border border-primary-600/30"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4">Text Preview</h4>
        <div className="bg-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
            {textContent.substring(0, 1000)}
            {textContent.length > 1000 && '...'}
          </pre>
        </div>
      </div>

      {sentimentResults.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Sentence-by-Sentence Analysis</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sentimentResults.slice(0, 20).map((result, index) => (
              <div key={index} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Sentence {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.sentiment > 0.1 
                        ? 'bg-success-600/20 text-success-300' 
                        : result.sentiment < -0.1 
                        ? 'bg-error-600/20 text-error-300'
                        : 'bg-slate-600/20 text-slate-300'
                    }`}>
                      {result.sentiment > 0.1 ? 'Positive' : result.sentiment < -0.1 ? 'Negative' : 'Neutral'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2">{result.sentence}</p>
                {(result.positiveWords.length > 0 || result.negativeWords.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {result.positiveWords.map((word, i) => (
                      <span key={`pos-${i}`} className="text-xs px-1 py-0.5 bg-success-600/20 text-success-300 rounded">
                        +{word}
                      </span>
                    ))}
                    {result.negativeWords.map((word, i) => (
                      <span key={`neg-${i}`} className="text-xs px-1 py-0.5 bg-error-600/20 text-error-300 rounded">
                        -{word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};