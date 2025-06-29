import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useSpring, animated } from 'react-spring';

interface SHAPData {
  feature: string;
  value: number;
}

interface SHAPBarChartProps {
  data: SHAPData[];
  width: number;
  height: number;
}

interface SHAPAnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  delay: number;
}

const SHAPAnimatedBar: React.FC<SHAPAnimatedBarProps> = ({ x, y, width, height, fill, delay }) => {
  const AnimatedRect = animated('rect');
  
  const springProps = useSpring({
    from: { width: 0, opacity: 0 },
    to: { width, opacity: 0.8 },
    delay,
  });

  return (
    <AnimatedRect
      x={x}
      y={y}
      height={height}
      fill={fill}
      rx={3}
      style={springProps}
    />
  );
};

const margin = { top: 20, right: 30, bottom: 60, left: 120 };

export const SHAPBarChart: React.FC<SHAPBarChartProps> = ({ data, width, height }) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const sortedData = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const xScale = scaleLinear({
    domain: [Math.min(0, Math.min(...sortedData.map(d => d.value))), Math.max(...sortedData.map(d => d.value))],
    range: [0, xMax],
  });

  const yScale = scaleBand({
    domain: sortedData.map(d => d.feature),
    range: [0, yMax],
    padding: 0.2,
  });

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Feature Impact on Prediction</h4>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {sortedData.map((d, i) => {
            const barHeight = yScale.bandwidth();
            const barY = yScale(d.feature) || 0;
            const barWidth = Math.abs(xScale(d.value) - xScale(0));
            const barX = d.value >= 0 ? xScale(0) : xScale(d.value);
            const isPositive = d.value >= 0;

            return (
              <SHAPAnimatedBar
                key={d.feature}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={isPositive ? '#22c55e' : '#ef4444'}
                delay={i * 100}
              />
            );
          })}
          
          {/* Zero line */}
          <line
            x1={xScale(0)}
            x2={xScale(0)}
            y1={0}
            y2={yMax}
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
          SHAP Value (Impact on Model Output)
        </text>
      </svg>
      
      <div className="mt-4 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-success-500 rounded"></div>
          <span className="text-sm text-slate-400">Positive Impact</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-error-500 rounded"></div>
          <span className="text-sm text-slate-400">Negative Impact</span>
        </div>
      </div>
    </div>
  );
};