export interface Bar {
  label: string;
  value: number;
}

const WIDTH = 400;
const HEIGHT = 120;
const LABELS_HEIGHT = 14;

export function BarChart({ bars, color }: { bars: Bar[]; color: string }) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  const slot = WIDTH / bars.length;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart">
      {bars.map((bar, i) => {
        const height = (bar.value / max) * (HEIGHT - LABELS_HEIGHT - 4);
        return (
          <g key={bar.label}>
            <rect
              x={i * slot + slot * 0.15}
              y={HEIGHT - LABELS_HEIGHT - height}
              width={slot * 0.7}
              height={height}
              rx={2}
              fill={color}
            >
              <title>{`${bar.label}: ${bar.value}`}</title>
            </rect>
            <text x={i * slot + slot / 2} y={HEIGHT - 2} className="chart-label">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
