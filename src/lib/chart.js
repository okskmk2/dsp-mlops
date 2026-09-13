export const CHART_SERIES = [
  'var(--ds-chart-1)',
  'var(--ds-chart-2)',
  'var(--ds-chart-3)',
  'var(--ds-chart-4)',
  'var(--ds-chart-5)',
  'var(--ds-chart-6)',
  'var(--ds-chart-7)',
]

export function chartColor(index) {
  return CHART_SERIES[index % CHART_SERIES.length]
}
