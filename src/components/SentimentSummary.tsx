import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface SentimentSummaryProps {
  overallSentiment: {
    overall: number;
    confidence: number;
    distribution: { positive: number; neutral: number; negative: number };
  };
  totalSentences: number;
}

export const SentimentSummary: React.FC<SentimentSummaryProps> = ({
  overallSentiment,
  totalSentences
}) => {
  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score > -0.1) return 'Neutral';
    if (score > -0.3) return 'Negative';
    return 'Very Negative';
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-success-400';
    if (score < -0.1) return 'text-error-400';
    return 'text-slate-400';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="w-5 h-5" />;
    if (score < -0.1) return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-600/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Sentiment Analysis Summary</h4>
          <p className="text-sm text-slate-400">
            Overall sentiment analysis of {totalSentences} sentences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className={getSentimentColor(overallSentiment.overall)}>
              {getSentimentIcon(overallSentiment.overall)}
            </div>
            <span className="text-xs text-slate-400">Overall Sentiment</span>
          </div>
          <div className={`text-lg font-semibold ${getSentimentColor(overallSentiment.overall)}`}>
            {getSentimentLabel(overallSentiment.overall)}
          </div>
          <div className="text-sm text-slate-500">
            Score: {overallSentiment.overall.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success-400" />
            <span className="text-xs text-slate-400">Positive</span>
          </div>
          <div className="text-lg font-semibold text-success-400">
            {(overallSentiment.distribution.positive * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500">
            {Math.round(overallSentiment.distribution.positive * totalSentences)} sentences
          </div>
        </div>

        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Minus className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Neutral</span>
          </div>
          <div className="text-lg font-semibold text-slate-400">
            {(overallSentiment.distribution.neutral * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500">
            {Math.round(overallSentiment.distribution.neutral * totalSentences)} sentences
          </div>
        </div>

        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-4 h-4 text-error-400" />
            <span className="text-xs text-slate-400">Negative</span>
          </div>
          <div className="text-lg font-semibold text-error-400">
            {(overallSentiment.distribution.negative * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500">
            {Math.round(overallSentiment.distribution.negative * totalSentences)} sentences
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Sentiment Distribution</span>
          <span className="text-xs text-slate-400">
            Confidence: {(overallSentiment.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex h-4 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="bg-success-500 transition-all duration-500"
            style={{ width: `${overallSentiment.distribution.positive * 100}%` }}
          />
          <div
            className="bg-slate-400 transition-all duration-500"
            style={{ width: `${overallSentiment.distribution.neutral * 100}%` }}
          />
          <div
            className="bg-error-500 transition-all duration-500"
            style={{ width: `${overallSentiment.distribution.negative * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};