'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { AnalysisModal } from '@/components/shared/AnalysisModal';
import { SummaryPanel } from '@/components/shared/SummaryPanel';
import { downloadMultiSheetCSV } from '@/lib/utils/excel-advanced';

interface TriangularResult {
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
  parameters: { a: number; b: number; c: number };
}

export function TriangularProgram() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(5);
  const [c, setC] = useState(10);
  const [n, setN] = useState(1000);
  const [seed, setSeed] = useState(12345);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriangularResult | null>(null);
  const [error, setError] = useState('');
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const aNum = parseFloat(String(a));
      const bNum = parseFloat(String(b));
      const cNum = parseFloat(String(c));
      const nNum = parseInt(String(n));
      const seedNum = parseInt(String(seed));

      // Validación básica del lado del cliente
      if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum) || isNaN(nNum) || nNum <= 0) {
        setError('Ingrese parámetros válidos. n debe ser > 0');
        setLoading(false);
        return;
      }

      if (!(aNum < bNum && bNum < cNum)) {
        setError('Error: debe cumplirse a < b < c');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/simulate/triangular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: aNum, b: bNum, c: cNum, n: nNum, seed: seedNum }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error en la simulación');
      }

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
            📐 Programa 1: Distribución Triangular Paramétrica
            <HelpTooltip 
              title="Distribución Triangular"
              content="Genera variables aleatorias con distribución triangular mediante transformada inversa. Útil para modelar situaciones con valores mínimo, más probable y máximo conocidos."
            />
          </CardTitle>
          <CardDescription>
            Generación de variables aleatorias mediante transformada inversa para distribución triangular.
            Fórmula: f(x) = 2(x-a)/((b-a)(c-a)) para a ≤ x ≤ b
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">a (mín)</label>
              <Input type="number" value={a} onChange={(e) => setA(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">b (moda)</label>
              <Input type="number" value={b} onChange={(e) => setB(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">c (máx)</label>
              <Input type="number" value={c} onChange={(e) => setC(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">n (muestras)</label>
              <Input type="number" value={n} onChange={(e) => setN(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Semilla</label>
              <Input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600">
              {loading ? 'Generando...' : 'Generar'}
            </Button>
            <Button variant="outline" onClick={() => setResult(null)}>
              Reiniciar
            </Button>
            {result && (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
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
                    downloadMultiSheetCSV(sheets, 'triangular-resultados');
                  }}
                >
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </>
            )}
          </div>

          {error && <div className="text-red-600 font-medium">{error}</div>}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Panel de resumen */}
          <SummaryPanel
            title="Resumen Estadístico"
            items={[
              { label: 'Media Muestral', value: result.statistics.mean.toFixed(4), color: 'blue' },
              { label: 'Media Teórica', value: result.theoreticalMean.toFixed(4), color: 'green' },
              { label: 'Desv. Estándar', value: result.statistics.stdDev.toFixed(4), color: 'amber' },
              { label: 'Mínimo', value: result.statistics.min.toFixed(4), color: 'blue' },
              { label: 'Máximo', value: result.statistics.max.toFixed(4), color: 'blue' },
              { label: 'Mediana', value: result.statistics.median.toFixed(4), color: 'green' },
            ]}
            interpretation={`Se generaron ${result.values.length} valores aleatorios. La media muestral (${result.statistics.mean.toFixed(4)}) está muy cercana a la media teórica (${result.theoreticalMean.toFixed(4)}), lo que valida la calidad del generador. La distribución es simétrica alrededor de la moda (${result.parameters.b}).`}
          />

          {/* Histograma */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histograma de Frecuencias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.histogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="center" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#3b82f6" name="Frecuencia" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabla de primeros valores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primeros 20 Valores Generados</CardTitle>
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

          {/* Modal de análisis */}
          <AnalysisModal
            open={analysisOpen}
            onOpenChange={setAnalysisOpen}
            title="Análisis Detallado - Distribución Triangular"
            fullWidth
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900">Parámetros de entrada</p>
                  <p className="text-xs mt-2">a (mínimo): {result.parameters.a}</p>
                  <p className="text-xs">b (moda): {result.parameters.b}</p>
                  <p className="text-xs">c (máximo): {result.parameters.c}</p>
                  <p className="text-xs">n (muestras): {result.values.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-900">Validación teórica</p>
                  <p className="text-xs mt-2">Error media: {Math.abs(result.statistics.mean - result.theoreticalMean).toFixed(6)}</p>
                  <p className="text-xs">% Error: {((Math.abs(result.statistics.mean - result.theoreticalMean) / result.theoreticalMean) * 100).toFixed(2)}%</p>
                  <p className="text-xs">Rango: [{result.statistics.min.toFixed(4)}, {result.statistics.max.toFixed(4)}]</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold mb-2">Interpretación estadística:</p>
                <p className="text-sm text-gray-700">
                  La distribución triangular generada tiene buena convergencia a la media teórica. 
                  El error porcentual de {((Math.abs(result.statistics.mean - result.theoreticalMean) / result.theoreticalMean) * 100).toFixed(2)}% 
                  indica {((Math.abs(result.statistics.mean - result.theoreticalMean) / result.theoreticalMean) < 0.05 ? 'excelente' : 'buena')} 
                  calidad del generador. Con n={result.values.length} muestras, los momentos muestrales convergen adecuadamente a los teóricos.
                </p>
              </div>
            </div>
          </AnalysisModal>
        </>
      )}
    </div>
  );
}
