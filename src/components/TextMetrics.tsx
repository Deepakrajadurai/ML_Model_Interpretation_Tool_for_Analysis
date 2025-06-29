import React from 'react';
import { FileText, Clock, BarChart3, Hash, Users, Zap } from 'lucide-react';

interface TextMetricsProps {
  metrics: {
    characters: number;
    words: number;
    sentences: number;
    paragraphs: number;
    avgWordsPerSentence: number;
    avgCharsPerWord: number;
    readingTime: number;
    uniqueWords: number;
    lexicalDiversity: number;
  };
}

export const TextMetrics: React.FC<TextMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Hash className="w-4 h-4 text-primary-400" />
          <span className="text-xs text-slate-400">Characters</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.characters.toLocaleString()}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-4 h-4 text-secondary-400" />
          <span className="text-xs text-slate-400">Words</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.words.toLocaleString()}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-accent-400" />
          <span className="text-xs text-slate-400">Sentences</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.sentences.toLocaleString()}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-4 h-4 text-warning-400" />
          <span className="text-xs text-slate-400">Paragraphs</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.paragraphs.toLocaleString()}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4 text-error-400" />
          <span className="text-xs text-slate-400">Reading Time</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.readingTime} min
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-success-400" />
          <span className="text-xs text-slate-400">Avg Words/Sentence</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.avgWordsPerSentence}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Hash className="w-4 h-4 text-primary-400" />
          <span className="text-xs text-slate-400">Avg Chars/Word</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.avgCharsPerWord}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-4 h-4 text-secondary-400" />
          <span className="text-xs text-slate-400">Unique Words</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {metrics.uniqueWords.toLocaleString()}
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-accent-400" />
          <span className="text-xs text-slate-400">Lexical Diversity</span>
        </div>
        <div className="text-lg font-semibold text-white">
          {(metrics.lexicalDiversity * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};