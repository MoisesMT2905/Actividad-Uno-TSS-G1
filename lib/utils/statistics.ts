/**
 * Utilidades estadísticas para análisis de simulaciones
 */

export interface Statistics {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
  variance: number;
}

export function calculateStatistics(values: number[]): Statistics {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, min: 0, max: 0, median: 0, variance: 0 };
  }

  // Media
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  // Varianza y desviación estándar
  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Mín y máx
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Mediana
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return { mean, stdDev, min, max, median, variance };
}

/**
 * Crea un histograma con intervalos automáticos
 */
export interface HistogramBin {
  min: number;
  max: number;
  center: number;
  frequency: number;
  density: number;
}

export function createHistogram(
  values: number[],
  numBins?: number
): HistogramBin[] {
  if (values.length === 0) return [];

  const n = values.length;
  const bins = numBins || Math.ceil(Math.sqrt(n)); // Regla de Sturges

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const binWidth = range / bins;

  const histogram: HistogramBin[] = [];

  for (let i = 0; i < bins; i++) {
    const binMin = min + i * binWidth;
    const binMax = binMin + binWidth;
    const center = (binMin + binMax) / 2;

    const frequency = values.filter(v => v >= binMin && v < binMax).length;
    const density = frequency / (n * binWidth);

    histogram.push({ min: binMin, max: binMax, center, frequency, density });
  }

  return histogram;
}

/**
 * Calcula percentiles
 */
export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

/**
 * Chi-cuadrado: comparación con densidad teórica
 */
export function calculateChiSquared(
  observed: number[],
  expected: number[]
): number {
  let chiSquared = 0;
  for (let i = 0; i < observed.length && i < expected.length; i++) {
    if (expected[i] > 0) {
      chiSquared += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }
  }
  return chiSquared;
}
