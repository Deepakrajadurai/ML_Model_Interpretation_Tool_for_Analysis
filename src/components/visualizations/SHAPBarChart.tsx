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

// Increased margins to accommodate larger values and labels
const margin = { top: 20, right: 60, bottom: 80, left: 140 };

export const SHAPBarChart: React.FC<SHAPBarChartProps> = ({ data, width, height }) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const sortedData = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // Calculate domain with padding to ensure all values fit
  const maxAbsValue = Math.max(...sortedData.map(d => Math.abs(d.value)));
  const minValue = Math.min(0, Math.min(...sortedData.map(d => d.value)));
  const maxValue = Math.max(...sortedData.map(d => d.value));
  
  // Add 10% padding to the domain to ensure bars don't get cut off
  const domainPadding = maxAbsValue * 0.1;
  const domainMin = minValue - domainPadding;
  const domainMax = maxValue + domainPadding;

  const xScale = scaleLinear({
    domain: [domainMin, domainMax],
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
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="min-w-full">
          <Group left={margin.left} top={margin.top}>
            {sortedData.map((d, i) => {
              const barHeight = yScale.bandwidth();
              const barY = yScale(d.feature) || 0;
              const barWidth = Math.abs(xScale(d.value) - xScale(0));
              const barX = d.value >= 0 ? xScale(0) : xScale(d.value);
              const isPositive = d.value >= 0;

              return (
                <g key={d.feature}>
                  <SHAPAnimatedBar
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isPositive ? '#22c55e' : '#ef4444'}
                    delay={i * 100}
                  />
                  {/* Value labels at the end of bars */}
                  <text
                    x={isPositive ? barX + barWidth + 5 : barX - 5}
                    y={barY + barHeight / 2}
                    dy="0.33em"
                    fill="#e2e8f0"
                    fontSize={11}
                    fontWeight="500"
                    textAnchor={isPositive ? 'start' : 'end'}
                  >
                    {d.value.toFixed(3)}
                  </text>
                </g>
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
                fontSize: 11,
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
                fontSize: 10,
                textAnchor: 'middle',
              }}
              numTicks={8}
            />
          </Group>
          
          <text
            x={width / 2}
            y={height - 20}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={12}
          >
            SHAP Value (Impact on Model Output)
          </text>
          
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={12}
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Features
          </text>
        </svg>
      </div>
      
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