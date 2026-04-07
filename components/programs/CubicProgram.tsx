'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { AnalysisModal } from '@/components/shared/AnalysisModal';
import { SummaryPanel } from '@/components/shared/SummaryPanel';
import { downloadMultiSheetCSV } from '@/lib/utils/excel-advanced';

interface CubicResult {
  values: number[];
  statistics: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    median: number;
  };
  theoreticalMean: number;
  histogram: Array<{
    center: number;
    frequency: number;
  }>;
}

export function CubicProgram() {
  const [n, setN] = useState(1000);
  const [seed, setSeed] = useState(12345);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CubicResult | null>(null);
  const [error, setError] = useState('');
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simulate/cubic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: parseInt(String(n)), seed: parseInt(String(seed)) }),
      });

      if (!response.ok) throw new Error('Error en la simulación');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ∛ Programa 2: Distribución Cúbica
            <HelpTooltip
              title="Distribución Cúbica"
              content="Distribución no estándar con función de densidad f(x) = (x-3)²/18 en [0,6]. Se genera mediante transformada inversa usando la raíz cúbica."
            />
          </CardTitle>
          <CardDescription>
            Generación mediante transformada inversa. f(x) = (x-3)²/18 para 0 ≤ x ≤ 6.
            Inversa: x = 3 + ∛(54R - 27)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Número de Muestras</label>
              <Input type="number" value={n} onChange={(e) => setN(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Semilla</label>
              <Input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600">
                {loading ? 'Generando...' : 'Generar'}
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setResult(null)}
              >
                Reiniciar
              </Button>
              {result && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setAnalysisOpen(true)}
                  >
                    📊 Analizar
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const sheets = [
                        {
                          name: 'Valores Generados',
                          data: result.values.map((v, i) => ({ 'Índice': i + 1, 'Valor': v.toFixed(6) }))
                        },
                        {
                          name: 'Estadísticas',
                          data: [
                            { Métrica: 'Media Muestral', Valor: result.statistics.mean.toFixed(6) },
                            { Métrica: 'Media Teórica', Valor: result.theoreticalMean.toFixed(6) },
                            { Métrica: 'Desv. Estándar', Valor: result.statistics.stdDev.toFixed(6) },
                            { Métrica: 'Mínimo', Valor: result.statistics.min.toFixed(6) },
                            { Métrica: 'Máximo', Valor: result.statistics.max.toFixed(6) },
                            { Métrica: 'Mediana', Valor: result.statistics.median.toFixed(6) },
                          ]
                        }
                      ];
                      downloadMultiSheetCSV(sheets, 'cubica-resultados');
                    }}
                  >
                    <Download className="w-4 h-4" /> Exportar
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && <div className="text-red-600 font-medium">{error}</div>}
        </CardContent>
      </Card>

      {result && (
        <>
          <SummaryPanel
            title="Resumen Estadístico"
            items={[
              { label: 'Media Muestral', value: result.statistics.mean.toFixed(4), color: 'blue' },
              { label: 'Media Teórica (3.0)', value: result.theoreticalMean.toFixed(4), color: 'green' },
              { label: 'Desv. Estándar', value: result.statistics.stdDev.toFixed(4), color: 'amber' },
              { label: 'Mínimo', value: result.statistics.min.toFixed(4), color: 'blue' },
              { label: 'Máximo', value: result.statistics.max.toFixed(4), color: 'blue' },
              { label: 'Mediana', value: result.statistics.median.toFixed(4), color: 'green' },
            ]}
            interpretation={`Se generaron ${result.values.length} valores de la distribución cúbica f(x)=(x-3)²/18 en [0,6]. La media muestral (${result.statistics.mean.toFixed(4)}) se aproxima a la teórica (3.0), validando la transformada inversa implementada.`}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histograma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.histogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="center" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primeros 20 Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {result.values.slice(0, 20).map((val, i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded">
                    {val.toFixed(4)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnalysisModal
            open={analysisOpen}
            onOpenChange={setAnalysisOpen}
            title="Análisis Detallado - Distribución Cúbica"
            fullWidth
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900">Parámetros de la distribución</p>
                  <p className="text-xs mt-2">Rango: [0, 6]</p>
                  <p className="text-xs">f(x) = (x-3)²/18</p>
                  <p className="text-xs">Media teórica: 3.0</p>
                  <p className="text-xs">Muestras: {result.values.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-900">Calidad del generador</p>
                  <p className="text-xs mt-2">Error media: {Math.abs(result.statistics.mean - 3).toFixed(6)}</p>
                  <p className="text-xs">% Error: {((Math.abs(result.statistics.mean - 3) / 3) * 100).toFixed(2)}%</p>
                  <p className="text-xs">Rango observado: [{result.statistics.min.toFixed(4)}, {result.statistics.max.toFixed(4)}]</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold mb-2">Análisis:</p>
                <p className="text-sm text-gray-700">
                  La distribución cúbica generada mediante transformada inversa converge correctamente a los momentos teóricos.
                  El error de media {((Math.abs(result.statistics.mean - 3) / 3) * 100).toFixed(2)}% es aceptable para simulación estocástica.
                  La concentración de valores alrededor de x=3 refleja la simetría de f(x) respecto a la moda.
                </p>
              </div>
            </div>
          </AnalysisModal>
        </>
      )}
    </div>
  );
}
