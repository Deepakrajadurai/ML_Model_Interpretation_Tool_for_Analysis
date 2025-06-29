import React from 'react';
import { useSpring, animated } from 'react-spring';
import { WordFrequency } from '../../utils/textAnalysis';

interface WordCloudProps {
  data: WordFrequency[];
  width: number;
  height: number;
}

export const WordCloud: React.FC<WordCloudProps> = ({ data, width, height }) => {
  const animationProps = useSpring({
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Sort by frequency and take top words
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 25);
  const maxValue = Math.max(...sortedData.map(d => d.value));

  // Simple word positioning algorithm
  const positionedWords = sortedData.map((word, index) => {
    const fontSize = Math.max(10, Math.min(28, (word.value / maxValue) * 24 + 8));
    
    // Create a spiral pattern for better distribution
    const angle = index * 0.5;
    const radius = Math.sqrt(index) * 15;
    const x = width / 2 + Math.cos(angle) * radius - fontSize * word.text.length / 4;
    const y = height / 2 + Math.sin(angle) * radius;
    
    return {
      ...word,
      x: Math.max(10, Math.min(x, width - fontSize * word.text.length / 2)),
      y: Math.max(fontSize, Math.min(y, height - 10)),
      fontSize
    };
  });

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Most Frequent Words</h4>
      <animated.div style={animationProps}>
        <svg width={width} height={height} className="bg-slate-700 rounded-lg">
          {positionedWords.map((word, index) => (
            <g key={word.text}>
              <text
                x={word.x}
                y={word.y}
                fontSize={word.fontSize}
                fill={`hsl(${(index * 137.5) % 360}, 70%, 65%)`}
                fontWeight="600"
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {word.text}
              </text>
              {/* Frequency indicator */}
              <text
                x={word.x}
                y={word.y + word.fontSize + 8}
                fontSize={Math.max(8, word.fontSize * 0.3)}
                fill="#64748b"
                textAnchor="middle"
                className="opacity-70"
              >
                {word.value}
              </text>
            </g>
          ))}
        </svg>
      </animated.div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400 mb-2">Top 5 Words:</p>
          <div className="space-y-1">
            {sortedData.slice(0, 5).map((word, index) => (
              <div key={word.text} className="flex justify-between text-xs">
                <span className="text-slate-300">{word.text}</span>
                <span className="text-slate-500">{word.value} ({word.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400 text-center">
            Word size represents frequency
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Numbers show occurrence count
          </p>
        </div>
      </div>
    </div>
  );
};