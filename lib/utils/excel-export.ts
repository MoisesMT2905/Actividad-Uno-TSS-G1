/**
 * Utilidad para exportar datos a Excel
 * Genera archivos XLSX usando la librería xlsx
 */

/**
 * Convierte un array de objetos a CSV
 */
export function generateCSV(data: any[], filename: string = 'export.csv'): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta datos de simulación triangular
 */
export function exportTriangularToCSV(
  values: number[],
  statistics: any,
  theoreticalMean: number,
  parameters: any
): void {
  const data = [
    { Campo: 'Parámetro a (mínimo)', Valor: parameters.a },
    { Campo: 'Parámetro b (moda)', Valor: parameters.b },
    { Campo: 'Parámetro c (máximo)', Valor: parameters.c },
    { Campo: 'Número de muestras', Valor: values.length },
    { Campo: '', Valor: '' },
    { Campo: 'ESTADÍSTICAS', Valor: '' },
    { Campo: 'Media Muestral', Valor: statistics.mean.toFixed(6) },
    { Campo: 'Media Teórica', Valor: theoreticalMean.toFixed(6) },
    { Campo: 'Desviación Estándar', Valor: statistics.stdDev.toFixed(6) },
    { Campo: 'Varianza', Valor: statistics.variance.toFixed(6) },
    { Campo: 'Mínimo', Valor: statistics.min.toFixed(6) },
    { Campo: 'Máximo', Valor: statistics.max.toFixed(6) },
    { Campo: 'Mediana', Valor: statistics.median.toFixed(6) },
    { Campo: '', Valor: '' },
    { Campo: 'VALORES GENERADOS', Valor: '' },
    ...values.slice(0, 100).map((v, i) => ({ Índice: i + 1, Valor: v.toFixed(6) })),
  ];

  generateCSV(data, `triangular_simulacion_${Date.now()}.csv`);
}

/**
 * Exporta datos de simulación cúbica
 */
export function exportCubicToCSV(
  values: number[],
  statistics: any,
  theoreticalMean: number
): void {
  const data = [
    { Campo: 'Distribución Cúbica', Valor: 'f(x) = (x-3)²/18, 0 ≤ x ≤ 6' },
    { Campo: 'Número de muestras', Valor: values.length },
    { Campo: '', Valor: '' },
    { Campo: 'ESTADÍSTICAS', Valor: '' },
    { Campo: 'Media Muestral', Valor: statistics.mean.toFixed(6) },
    { Campo: 'Media Teórica', Valor: theoreticalMean.toFixed(6) },
    { Campo: 'Desviación Estándar', Valor: statistics.stdDev.toFixed(6) },
    { Campo: 'Varianza', Valor: statistics.variance.toFixed(6) },
    { Campo: 'Mínimo', Valor: statistics.min.toFixed(6) },
    { Campo: 'Máximo', Valor: statistics.max.toFixed(6) },
    { Campo: 'Mediana', Valor: statistics.median.toFixed(6) },
    { Campo: '', Valor: '' },
    { Campo: 'VALORES GENERADOS', Valor: '' },
    ...values.slice(0, 100).map((v, i) => ({ Índice: i + 1, Valor: v.toFixed(6) })),
  ];

  generateCSV(data, `cubica_simulacion_${Date.now()}.csv`);
}

/**
 * Exporta datos de máquinas
 */
export function exportMachinesToCSV(
  events: any[],
  statistics: any,
  parameters: any
): void {
  const data = [
    { Campo: 'Número de Máquinas', Valor: parameters.numMachines },
    { Campo: 'Tiempo de Simulación (horas)', Valor: parameters.simulationHours },
    { Campo: '', Valor: '' },
    { Campo: 'RESULTADOS', Valor: '' },
    { Campo: 'Máquinas Descompuestas Promedio', Valor: statistics.avgMachinesDown.toFixed(4) },
    { Campo: 'Costo por Hora', Valor: `$${statistics.totalCostPerHour.toFixed(2)}` },
    { Campo: 'Total de Fallas', Valor: statistics.totalFailures },
    { Campo: 'Tiempo Promedio de Reparación (h)', Valor: statistics.avgRepairTime.toFixed(4) },
    { Campo: '', Valor: '' },
    { Campo: 'EVENTOS', Valor: '' },
    ...events.slice(0, 50).map(e => ({
      'Evento #': e.eventNumber,
      'Tiempo (h)': e.time.toFixed(2),
      'Tipo': e.eventType === 'FAILURE' ? 'Falla' : 'Reparación',
      'Máquina': `M${e.machineId}`,
      'Máq. Descompuestas': e.machinesDown,
      'Área Acumulada': e.area.toFixed(2),
    })),
  ];

  generateCSV(data, `maquinas_simulacion_${Date.now()}.csv`);
}

/**
 * Exporta datos de almacén
 */
export function exportWarehouseToCSV(
  events: any[],
  statistics: any,
  parameters: any
): void {
  const data = [
    { Campo: 'Número de Trabajadores', Valor: parameters.equipment },
    { Campo: 'Duración Simulación (minutos)', Valor: parameters.durationMinutes },
    { Campo: '', Valor: '' },
    { Campo: 'RESULTADOS', Valor: '' },
    { Campo: 'Camiones Atendidos', Valor: statistics.trucksServed },
    { Campo: 'Tiempo Total de Espera (min)', Valor: statistics.totalWaitTime.toFixed(2) },
    { Campo: 'Tiempo Promedio de Espera (min)', Valor: statistics.avgWaitTime.toFixed(2) },
    { Campo: 'Costo de Salarios', Valor: `$${statistics.equipmentCost.toFixed(2)}` },
    { Campo: 'Costo de Espera', Valor: `$${statistics.waitCost.toFixed(2)}` },
    { Campo: 'COSTO TOTAL', Valor: `$${statistics.totalCost.toFixed(2)}` },
    { Campo: 'Tasa de Utilización', Valor: `${statistics.utilizationRate.toFixed(1)}%` },
    { Campo: '', Valor: '' },
    { Campo: 'EVENTOS (primeros 30)', Valor: '' },
    ...events.slice(0, 30).map(e => ({
      'Camión': `C${e.truckId}`,
      'Tipo Evento': e.eventType === 'ARRIVAL' ? 'Llegada' : 'Fin Descarga',
      'Tiempo (min)': e.arrivalTime.toFixed(2),
      'Espera (min)': e.waitTime.toFixed(2),
      'Duración (min)': (e.unloadEnd - e.unloadStart).toFixed(2),
      'Cola': e.queueLength,
    })),
  ];

  generateCSV(data, `almacen_simulacion_${Date.now()}.csv`);
}
