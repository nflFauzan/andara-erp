import React, { useState } from 'react';
import { MonthlyTrend } from '@/types/dashboard';

interface TrendFinancialChartProps {
  data?: MonthlyTrend[];
  formatCurrency: (val: number) => string;
}

// Helper to generate smooth cubic Bezier curve path
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return path;
}

export const TrendFinancialChart: React.FC<TrendFinancialChartProps> = ({
  data = [],
  formatCurrency,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Data tren finansial belum tersedia.
      </div>
    );
  }

  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  // Find max value across both invoice and payment
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.invoiceAmount || 0, d.paymentAmount || 0)),
    1000000 // default minimum threshold to prevent divide by zero
  );

  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const invoicePoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const val = d.invoiceAmount || 0;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  const paymentPoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const val = d.paymentAmount || 0;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  const invoiceLinePath = createSmoothPath(invoicePoints);
  const paymentLinePath = createSmoothPath(paymentPoints);

  const invoiceAreaPath =
    invoicePoints.length > 0
      ? `${invoiceLinePath} L ${invoicePoints[invoicePoints.length - 1].x},${
          height - paddingBottom
        } L ${invoicePoints[0].x},${height - paddingBottom} Z`
      : '';

  const paymentAreaPath =
    paymentPoints.length > 0
      ? `${paymentLinePath} L ${paymentPoints[paymentPoints.length - 1].x},${
          height - paddingBottom
        } L ${paymentPoints[0].x},${height - paddingBottom} Z`
      : '';

  const activeData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Interactive Tooltip Card */}
      {activeData && hoveredIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 top-16"
          style={{
            left: `${((invoicePoints[hoveredIndex].x / width) * 100).toFixed(1)}%`,
          }}
        >
          <div className="bg-slate-900/90 dark:bg-slate-950/95 text-white px-3.5 py-2 rounded-xl shadow-xl text-xs backdrop-blur-md border border-white/20 whitespace-nowrap">
            <p className="font-bold text-[11px] text-slate-300 pb-1 border-b border-white/10 mb-1">
              {activeData.monthLabel}
            </p>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Omset: {formatCurrency(activeData.invoiceAmount)}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Kas: {formatCurrency(activeData.paymentAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas with Fluid Responsiveness */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient for Omset (Blue) */}
          <linearGradient id="gradientOmset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>

          {/* Gradient for Kas (Emerald) */}
          <linearGradient id="gradientKas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>

          {/* Filter glow for lines */}
          <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.25" />
          </filter>
          <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Soft Grid Horizontal Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * ratio;
          return (
            <line
              key={ratio}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              className="stroke-slate-200/60 dark:stroke-slate-800/60"
              strokeDasharray={ratio === 1 ? '' : '3 4'}
              strokeWidth="1"
            />
          );
        })}

        {/* Area Fills */}
        <path d={invoiceAreaPath} fill="url(#gradientOmset)" />
        <path d={paymentAreaPath} fill="url(#gradientKas)" />

        {/* Smooth Curved Trend Lines */}
        <path
          d={invoiceLinePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowBlue)"
        />
        <path
          d={paymentLinePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowGreen)"
        />

        {/* Data Points & Interactive Hit Area */}
        {data.map((item, idx) => {
          const invPt = invoicePoints[idx];
          const payPt = paymentPoints[idx];
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.month}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible wide column for easy mouse hover */}
              <rect
                x={invPt.x - stepX / 2}
                y={paddingTop}
                width={stepX}
                height={chartHeight + 20}
                fill="transparent"
              />

              {/* Vertical Guide Line on Hover */}
              {isHovered && (
                <line
                  x1={invPt.x}
                  y1={paddingTop}
                  x2={invPt.x}
                  y2={height - paddingBottom}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="opacity-70 dark:opacity-40"
                />
              )}

              {/* Omset Dot */}
              <circle
                cx={invPt.x}
                cy={invPt.y}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* Kas Dot */}
              <circle
                cx={payPt.x}
                cy={payPt.y}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* Month Label below */}
              <text
                x={invPt.x}
                y={height - 12}
                textAnchor="middle"
                className={`text-[11px] font-bold select-none transition-colors duration-150 ${
                  isHovered
                    ? 'fill-blue-600 dark:fill-blue-400 font-extrabold'
                    : 'fill-slate-500 dark:fill-slate-400'
                }`}
              >
                {item.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TrendFinancialChart;
