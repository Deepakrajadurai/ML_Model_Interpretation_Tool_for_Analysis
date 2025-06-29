import React from 'react';
import { HeatmapRect } from '@visx/heatmap';
import { scaleLinear } from '@visx/scale';
import { useSpring, animated } from 'react-spring';

interface GradCAMHeatmapProps {
  data: number[][];
  width: number;
  height: number;
}

export const GradCAMHeatmap: React.FC<GradCAMHeatmapProps> = ({ data, width, height }) => {
  const animationProps = useSpring({
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Add safety check for data
  if (!data || !Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    return (
      <div className="w-full">
        <h4 className="text-lg font-semibold text-white mb-4">Attention Heatmap</h4>
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400">No heatmap data available</p>
        </div>
      </div>
    );
  }

  // Transform data for visx heatmap - correct structure for HeatmapRect
  const heatmapData = data.map((row, rowIndex) => ({
    bin: rowIndex,
    bins: row.map((value, colIndex) => ({
      bin: colIndex,
      count: value
    }))
  }));

  const colorScale = scaleLinear({
    domain: [0, 1],
    range: ['#1e293b', '#f97316'],
  });

  const xScale = scaleLinear({
    domain: [0, data[0].length - 1],
    range: [0, width],
  });

  const yScale = scaleLinear({
    domain: [0, data.length - 1],
    range: [0, height],
  });

  const binWidth = width / data[0].length;
  const binHeight = height / data.length;

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-white mb-4">Attention Heatmap</h4>
      <animated.div style={animationProps}>
        <svg width={width} height={height} className="rounded-lg overflow-hidden">
          <HeatmapRect
            data={heatmapData}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            binWidth={binWidth}
            binHeight={binHeight}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="transition-all duration-200 hover:stroke-2 hover:stroke-white"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                  />
                ))
              )
            }
          </HeatmapRect>
        </svg>
      </animated.div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Less Important</span>
        <div className="flex-1 mx-4 h-3 bg-gradient-to-r from-slate-700 to-accent-500 rounded-full"></div>
        <span className="text-sm text-slate-400">More Important</span>
      </div>
    </div>
  );
};