import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useSpring, animated } from 'react-spring';

interface SentimentData {
  sentence: string;
  sentiment: number;
  confidence: number;
}

interface SentimentChartProps {
  data: SentimentData[];
  width: number;
  height: number;
}

const margin = { top: 20, right: 30, bottom: 60, left: 60 };

export const SentimentChart: React.FC<SentimentChartProps> = ({ data, width, height }) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Take first 10 sentences for visualization
  const displayData = data.slice(0, 10);

  const xScale = scaleBand({
    domain: displayData.map((_, i) => `S${i + 1}`),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear({
    domain: [-1, 1],
    range: [yMax, 0],
  });

  const AnimatedRect = animated('rect');

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h4>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {displayData.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barHeight = Math.abs(yScale(d.sentiment) - yScale(0));
            const barX = xScale(`S${i + 1}`) || 0;
            const barY = d.sentiment >= 0 ? yScale(d.sentiment) : yScale(0);
            const isPositive = d.sentiment >= 0;

            return (
              <AnimatedRect
                key={i}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={isPositive ? '#22c55e' : '#ef4444'}
                opacity={0.8}
                rx={3}
                style={{
                  ...useSpring({
                    from: { height: 0, opacity: 0 },
                    to: { height: barHeight, opacity: 0.8 },
                    delay: i * 100,
                  })
                }}
              />
            );
          })}
          
          {/* Zero line */}
          <line
            x1={0}
            x2={xMax}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="4,4"
          />

          <AxisLeft
            scale={yScale}
            stroke="#64748b"
            tickStroke="#64748b"
            tickLabelProps={{
              fill: '#e2e8f0',
              fontSize: 12,
              textAnchor: 'end',
              dy: '0.33em',
            }}
          />
          
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="#64748b"
            tickStroke="#64748b"
            tickLabelProps={{
              fill: '#e2e8f0',
              fontSize: 12,
              textAnchor: 'middle',
            }}
          />
        </Group>
        
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={12}
        >
          Sentences
        </text>
        
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={12}
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          Sentiment Score
        </text>
      </svg>
      
      <div className="mt-4 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-success-500 rounded"></div>
          <span className="text-sm text-slate-400">Positive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-error-500 rounded"></div>
          <span className="text-sm text-slate-400">Negative</span>
        </div>
      </div>
    </div>
  );
};