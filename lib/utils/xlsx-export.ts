import XLSX from 'xlsx';

export interface SheetData {
  name: string;
  data: any[];
  columns?: string[];
}

/**
 * Exporta datos a un archivo Excel XLSX con múltiples hojas
 * @param sheets Array de hojas con nombre y datos
 * @param fileName Nombre del archivo (sin extensión)
 */
export function downloadXLSX(sheets: SheetData[], fileName: string) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    // Si hay columnas especificadas, reordenar los datos
    let sheetData = sheet.data;
    if (sheet.columns && sheet.columns.length > 0) {
      sheetData = sheet.data.map(row => {
        const orderedRow: any = {};
        sheet.columns!.forEach(col => {
          orderedRow[col] = row[col] || row[col.toLowerCase()] || row[col.replace(/\s+/g, '_').toLowerCase()] || '';
        });
        return orderedRow;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    
    // Ajustar ancho de columnas automáticamente
    const colWidths: any[] = [];
    if (sheetData.length > 0) {
      const firstRow = sheetData[0];
      Object.keys(firstRow).forEach(key => {
        const maxLength = Math.max(
          key.length,
          ...sheetData.map(row => String(row[key] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      worksheet['!cols'] = colWidths;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Exporta datos triangulares a XLSX
 */
export function exportTriangularToXLSX(
  values: number[],
  statistics: any,
  theoreticalMean: number,
  parameters: any,
  histogram: any
) {
  const sheets: SheetData[] = [
    {
      name: 'Datos',
      columns: ['Índice', 'Valor generado'],
      data: values.map((v, i) => ({
        'Índice': i + 1,
        'Valor generado': v.toFixed(6)
      }))
    },
    {
      name: 'Estadísticas',
      data: [
        { 'Métrica': 'Media muestral', 'Valor': statistics.mean.toFixed(6) },
        { 'Métrica': 'Media teórica', 'Valor': theoreticalMean.toFixed(6) },
        { 'Métrica': 'Desviación estándar', 'Valor': statistics.stdDev.toFixed(6) },
        { 'Métrica': 'Mínimo', 'Valor': statistics.min.toFixed(6) },
        { 'Métrica': 'Máximo', 'Valor': statistics.max.toFixed(6) },
        { 'Métrica': 'Mediana', 'Valor': statistics.median.toFixed(6) },
        { 'Métrica': 'Parámetro a (mín)', 'Valor': parameters.a },
        { 'Métrica': 'Parámetro b (moda)', 'Valor': parameters.b },
        { 'Métrica': 'Parámetro c (máx)', 'Valor': parameters.c },
        { 'Métrica': 'Número de muestras', 'Valor': values.length },
      ]
    },
    {
      name: 'Histograma',
      data: histogram.map((bin: any) => ({
        'Intervalo': `[${bin.x0.toFixed(2)}, ${bin.x1.toFixed(2)})`,
        'Frecuencia': bin.frequency,
        'Frecuencia relativa': (bin.frequency / values.length).toFixed(4)
      }))
    }
  ];

  downloadXLSX(sheets, 'distribucion-triangular');
}

/**
 * Exporta datos cúbicos a XLSX
 */
export function exportCubicToXLSX(
  values: number[],
  statistics: any,
  theoreticalMean: number,
  histogram: any
) {
  const sheets: SheetData[] = [
    {
      name: 'Datos',
      columns: ['Índice', 'Valor generado'],
      data: values.map((v, i) => ({
        'Índice': i + 1,
        'Valor generado': v.toFixed(6)
      }))
    },
    {
      name: 'Estadísticas',
      data: [
        { 'Métrica': 'Media muestral', 'Valor': statistics.mean.toFixed(6) },
        { 'Métrica': 'Media teórica', 'Valor': theoreticalMean.toFixed(6) },
        { 'Métrica': 'Desviación estándar', 'Valor': statistics.stdDev.toFixed(6) },
        { 'Métrica': 'Mínimo', 'Valor': statistics.min.toFixed(6) },
        { 'Métrica': 'Máximo', 'Valor': statistics.max.toFixed(6) },
        { 'Métrica': 'Mediana', 'Valor': statistics.median.toFixed(6) },
        { 'Métrica': 'Rango', 'Valor': '[0, 6]' },
        { 'Métrica': 'Número de muestras', 'Valor': values.length },
      ]
    },
    {
      name: 'Histograma',
      data: histogram.map((bin: any) => ({
        'Intervalo': `[${bin.x0.toFixed(2)}, ${bin.x1.toFixed(2)})`,
        'Frecuencia': bin.frequency,
        'Frecuencia relativa': (bin.frequency / values.length).toFixed(4)
      }))
    }
  ];

  downloadXLSX(sheets, 'distribucion-cubica');
}

/**
 * Exporta eventos de máquinas a XLSX
 */
export function exportMachinesToXLSX(
  events: any[],
  statistics: any,
  parameters: any
) {
  const sheets: SheetData[] = [
    {
      name: 'Eventos',
      columns: ['Evento', 'Tiempo (h)', 'Tipo', 'Máquina', 'Detalles', 'Estado operativo', 'Máquinas descompuestas', 'Cola'],
      data: events.map(event => ({
        'Evento': event.eventNumber,
        'Tiempo (h)': event.time.toFixed(4),
        'Tipo': event.eventType === 'FAILURE' ? 'FALLA' : 'FIN_REPARACIÓN',
        'Máquina': `M${event.machineId}`,
        'Detalles': event.eventType === 'FAILURE' 
          ? `Máquina M${event.machineId} falló en t=${event.time.toFixed(4)}h`
          : `Máquina M${event.machineId} completó reparación`,
        'Estado operativo': `Op:${parameters.numMachines - event.machinesDown}, Des:${event.machinesDown}`,
        'Máquinas descompuestas': event.machinesDown,
        'Cola': event.queueLength
      }))
    },
    {
      name: 'Resumen',
      data: [
        { 'Métrica': 'Número de máquinas', 'Valor': parameters.numMachines },
        { 'Métrica': 'Total de eventos', 'Valor': events.length },
        { 'Métrica': 'Tiempo total simulado (h)', 'Valor': statistics.totalTime.toFixed(4) },
        { 'Métrica': 'Total de fallas', 'Valor': statistics.totalFailures },
        { 'Métrica': 'Máquinas descompuestas (promedio)', 'Valor': statistics.avgMachinesDown.toFixed(4) },
        { 'Métrica': 'Tiempo promedio de reparación (h)', 'Valor': statistics.avgRepairTime.toFixed(4) },
        { 'Métrica': 'Costo por hora', 'Valor': `$${statistics.totalCostPerHour.toFixed(2)}` },
        { 'Métrica': 'Costo total', 'Valor': `$${(statistics.totalCostPerHour * statistics.totalTime).toFixed(2)}` },
      ]
    }
  ];

  downloadXLSX(sheets, 'maquinas-mecanico');
}

/**
 * Exporta eventos de almacén a XLSX
 */
export function exportWarehouseToXLSX(
  events: any[],
  statistics: any,
  parameters: any
) {
  const sheets: SheetData[] = [
    {
      name: 'Eventos',
      columns: ['Evento', 'Tiempo (min)', 'Tipo', 'Camión', 'Detalles', 'Estado', 'Cola', 'Espera (min)'],
      data: events.map(event => ({
        'Evento': event.truckId,
        'Tiempo (min)': event.eventType === 'ARRIVAL' 
          ? event.arrivalTime.toFixed(2)
          : event.unloadEnd.toFixed(2),
        'Tipo': event.eventType === 'ARRIVAL' ? 'LLEGADA' : 'FIN_DESCARGA',
        'Camión': `C${event.truckId}`,
        'Detalles': event.eventType === 'ARRIVAL'
          ? `Camión C${event.truckId} llegó en t=${event.arrivalTime.toFixed(2)} min`
          : `Camión C${event.truckId} completó descarga`,
        'Estado': event.eventType === 'ARRIVAL'
          ? `Cola: ${event.queueLength}, Equipo: ${event.queueLength > 0 ? 'Ocupado' : 'Disponible'}`
          : `Cola: ${event.queueLength}`,
        'Cola': event.queueLength,
        'Espera (min)': event.waitTime ? event.waitTime.toFixed(2) : '0.00'
      }))
    },
    {
      name: 'Resumen',
      data: [
        { 'Métrica': 'Trabajadores', 'Valor': parameters.equipment },
        { 'Métrica': 'Tiempo de simulación (min)', 'Valor': parameters.durationMinutes },
        { 'Métrica': 'Camiones atendidos', 'Valor': statistics.trucksServed },
        { 'Métrica': 'Total de eventos', 'Valor': events.length },
        { 'Métrica': 'Tiempo de espera promedio (min)', 'Valor': statistics.avgWaitTime.toFixed(2) },
        { 'Métrica': 'Costo de salarios', 'Valor': `$${statistics.equipmentCost.toFixed(2)}` },
        { 'Métrica': 'Costo de espera', 'Valor': `$${statistics.waitCost.toFixed(2)}` },
        { 'Métrica': 'Costo total', 'Valor': `$${statistics.totalCost.toFixed(2)}` },
        { 'Métrica': 'Utilización del equipo', 'Valor': `${statistics.utilizationRate.toFixed(1)}%` },
      ]
    }
  ];

  downloadXLSX(sheets, 'almacen-camiones');
}
