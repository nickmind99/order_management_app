import type { Bar } from './BarChart';

const WIDTH = 400;
const HEIGHT = 120;
const LABELS_HEIGHT = 14;
const PADDING = 6;

export function LineChart({ points, lastIndex, color }: { points: Bar[]; lastIndex: number; color: string }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const slot = WIDTH / points.length;
  const bottom = HEIGHT - LABELS_HEIGHT;

  const coords = points.map((point, i) => ({
    ...point,
    x: i * slot + slot / 2,
    y: bottom - (point.value / max) * (bottom - PADDING),
  }));
  const drawn = coords.slice(0, lastIndex + 1);
  const line = drawn.map((c) => `${c.x},${c.y}`).join(' L ');
  const area = `M ${drawn[0].x},${bottom} L ${line} L ${drawn[drawn.length - 1].x},${bottom} Z`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart">
      <path d={area} fill={color} opacity={0.12} />
      <path d={`M ${line}`} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={c.label}>
          {i <= lastIndex && (
            <circle cx={c.x} cy={c.y} r={2.5} fill={color}>
              <title>{`${c.label}: $${c.value}`}</title>
            </circle>
          )}
          <text x={c.x} y={HEIGHT - 2} className="chart-label">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
