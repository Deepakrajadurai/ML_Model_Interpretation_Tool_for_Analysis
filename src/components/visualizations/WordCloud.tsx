import React from 'react';
import { useSpring, animated } from 'react-spring';

interface WordCloudData {
  text: string;
  value: number;
}

interface WordCloudProps {
  data: WordCloudData[];
  width: number;
  height: number;
}

export const WordCloud: React.FC<WordCloudProps> = ({ data, width, height }) => {
  const animationProps = useSpring({
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Sort by value and take top words
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 20);
  const maxValue = Math.max(...sortedData.map(d => d.value));

  // Simple word positioning (in a real implementation, you'd use a proper word cloud algorithm)
  const positionedWords = sortedData.map((word, index) => {
    const fontSize = Math.max(12, (word.value / maxValue) * 32);
    const x = (index % 4) * (width / 4) + Math.random() * 50;
    const y = Math.floor(index / 4) * 40 + 30 + Math.random() * 20;
    
    return {
      ...word,
      x: Math.min(x, width - 100),
      y: Math.min(y, height - 20),
      fontSize
    };
  });

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Word Frequency</h4>
      <animated.div style={animationProps}>
        <svg width={width} height={height} className="bg-slate-700 rounded-lg">
          {positionedWords.map((word, index) => (
            <text
              key={word.text}
              x={word.x}
              y={word.y}
              fontSize={word.fontSize}
              fill={`hsl(${(index * 137.5) % 360}, 70%, 60%)`}
              fontWeight="bold"
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
            >
              {word.text}
            </text>
          ))}
        </svg>
      </animated.div>
      
      <div className="mt-4">
        <p className="text-sm text-slate-400 text-center">
          Word size represents frequency in the text
        </p>
      </div>
    </div>
  );
};