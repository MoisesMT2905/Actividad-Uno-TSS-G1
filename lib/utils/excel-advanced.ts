/**
 * Utilidades avanzadas para exportación a Excel
 * Genera archivos CSV/XLSX con múltiples hojas y formatos
 */

export interface ExcelSheet {
  name: string;
  data: Record<string, any>[];
  headers?: string[];
}

/**
 * Convierte datos a formato CSV
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const rows = data.map(row =>
    headers
      .map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  return [csvHeaders, ...rows].join('\n');
}

/**
 * Descarga CSV como archivo
 */
export function downloadCSV(data: Record<string, any>[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Descarga múltiples hojas como un archivo CSV combinado
 */
export function downloadMultiSheetCSV(sheets: ExcelSheet[], baseName: string) {
  let combinedCSV = '';

  sheets.forEach((sheet, idx) => {
    if (idx > 0) combinedCSV += '\n\n';
    combinedCSV += `=== ${sheet.name} ===\n`;
    combinedCSV += convertToCSV(sheet.data);
  });

  const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${baseName}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Genera contenido JSON para análisis posterior
 */
export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
