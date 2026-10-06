import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';
import type { LifeTimeline } from '@tamabuddy/tamabuddy-engine/testing';

import { deriveStateSeries, formatOffset } from './lifeLabModel.js';

interface ChartDefinition {
  readonly label: string;
  readonly maximum: number | ((states: readonly TamabuddyState[]) => number);
  readonly series: readonly {
    readonly label: string;
    readonly color: string;
    readonly value: (state: TamabuddyState) => number;
  }[];
}

const stageValues = {
  egg: 0,
  baby: 1,
  child: 2,
  teen: 3,
  adult: 4,
  elder: 5,
} as const;

const charts: readonly ChartDefinition[] = [
  {
    label: 'Needs',
    maximum: 4,
    series: [
      { label: 'Hunger', color: '#ef8354', value: (state) => state.hunger },
      {
        label: 'Happiness',
        color: '#70c1b3',
        value: (state) => state.happiness,
      },
    ],
  },
  {
    label: 'Health',
    maximum: 4,
    series: [
      { label: 'Health', color: '#ef476f', value: (state) => state.health },
    ],
  },
  {
    label: 'Weight',
    maximum: (states) => Math.max(1, ...states.map((state) => state.weight)),
    series: [
      { label: 'Weight', color: '#7b61ff', value: (state) => state.weight },
    ],
  },
  {
    label: 'Poop',
    maximum: 3,
    series: [
      { label: 'Poop', color: '#9c6644', value: (state) => state.poopCount },
    ],
  },
  {
    label: 'Illness',
    maximum: 1,
    series: [
      {
        label: 'Ill',
        color: '#f4a261',
        value: (state) => (state.illness ? 1 : 0),
      },
    ],
  },
  {
    label: 'Sleep',
    maximum: 1,
    series: [
      {
        label: 'Sleeping',
        color: '#4361ee',
        value: (state) => (state.behavior === 'sleeping' ? 1 : 0),
      },
    ],
  },
  {
    label: 'Evolution',
    maximum: 5,
    series: [
      {
        label: 'Stage',
        color: '#2a9d8f',
        value: (state) => stageValues[state.stage],
      },
    ],
  },
];

export function StateSeriesCharts({
  timeline,
}: {
  readonly timeline: LifeTimeline;
}) {
  const points = deriveStateSeries(timeline);
  const states = points.map((point) => point.state);
  const maximumOffset = Math.max(1, ...points.map((point) => point.offset));

  return (
    <section
      className="life-lab__charts"
      aria-labelledby="life-lab-charts-title"
    >
      <div className="life-lab__section-heading">
        <div>
          <p className="life-lab__eyebrow">State series</p>
          <h3 id="life-lab-charts-title">Life signals</h3>
        </div>
        <span>{formatOffset(maximumOffset)}</span>
      </div>
      <div className="life-lab__chart-grid">
        {charts.map((chart) => {
          const maximum =
            typeof chart.maximum === 'function'
              ? chart.maximum(states)
              : chart.maximum;
          return (
            <figure className="life-chart" key={chart.label}>
              <figcaption>{chart.label}</figcaption>
              <svg
                viewBox="0 0 300 92"
                role="img"
                aria-label={`${chart.label} over simulated time`}
              >
                <path
                  className="life-chart__grid"
                  d="M8 12H292M8 46H292M8 80H292"
                />
                {chart.series.map((series) => (
                  <polyline
                    key={series.label}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={points
                      .map((point) => {
                        const x = 8 + (point.offset / maximumOffset) * 284;
                        const y =
                          80 - (series.value(point.state) / maximum) * 68;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                ))}
              </svg>
              <div className="life-chart__legend">
                {chart.series.map((series) => (
                  <span key={series.label}>
                    <i style={{ background: series.color }} />
                    {series.label}
                  </span>
                ))}
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
