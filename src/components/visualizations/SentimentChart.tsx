import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useSpring, animated } from 'react-spring';
import { SentimentResult } from '../../utils/sentimentAnalysis';

interface SentimentChartProps {
  data: SentimentResult[];
  width: number;
  height: number;
}

interface SentimentAnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  delay: number;
}

const SentimentAnimatedBar: React.FC<SentimentAnimatedBarProps> = ({ 
  x, y, width, height, fill, opacity, delay 
}) => {
  const AnimatedRect = animated('rect');
  
  const springProps = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height, opacity },
    delay,
  });

  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      fill={fill}
      rx={3}
      style={springProps}
    />
  );
};

const margin = { top: 20, right: 30, bottom: 60, left: 60 };

export const SentimentChart: React.FC<SentimentChartProps> = ({ data, width, height }) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Take first 15 sentences for visualization
  const displayData = data.slice(0, 15);

  const xScale = scaleBand({
    domain: displayData.map((_, i) => `S${i + 1}`),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear({
    domain: [-1, 1],
    range: [yMax, 0],
  });

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Sentiment by Sentence</h4>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {displayData.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barHeight = Math.abs(yScale(d.sentiment) - yScale(0));
            const barX = xScale(`S${i + 1}`) || 0;
            const barY = d.sentiment >= 0 ? yScale(d.sentiment) : yScale(0);
            const isPositive = d.sentiment >= 0;

            return (
              <g key={i}>
                <SentimentAnimatedBar
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={isPositive ? '#22c55e' : '#ef4444'}
                  opacity={0.7 + (d.confidence * 0.3)}
                  delay={i * 50}
                />
                {/* Confidence indicator */}
                <rect
                  x={barX + barWidth - 3}
                  y={barY}
                  width={3}
                  height={barHeight}
                  fill={isPositive ? '#16a34a' : '#dc2626'}
                  opacity={d.confidence}
                />
              </g>
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
            numTicks={5}
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
          Sentences (First 15)
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
        <div className="flex items-center space-x-2">
          <div className="w-2 h-4 bg-slate-600 rounded"></div>
          <span className="text-sm text-slate-400">Confidence</span>
        </div>
      </div>
    </div>
  );
};