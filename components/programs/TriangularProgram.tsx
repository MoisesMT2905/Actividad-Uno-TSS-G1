'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HelpCircle, Download } from 'lucide-react';
import { exportTriangularToCSV } from '@/lib/utils/excel-export';

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
            <button className="text-blue-500" title="Ver ayuda">
              <HelpCircle className="w-5 h-5" />
            </button>
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
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  exportTriangularToCSV(
                    result.values,
                    result.statistics,
                    result.theoreticalMean,
                    result.parameters
                  );
                }}
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </Button>
            )}
          </div>

          {error && <div className="text-red-600 font-medium">{error}</div>}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Media Muestral</p>
                  <p className="text-lg font-bold">{result.statistics.mean.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Media Teórica</p>
                  <p className="text-lg font-bold">{result.theoreticalMean.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Desv. Est.</p>
                  <p className="text-lg font-bold">{result.statistics.stdDev.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mín</p>
                  <p className="text-lg font-bold">{result.statistics.min.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Máx</p>
                  <p className="text-lg font-bold">{result.statistics.max.toFixed(4)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </>
      )}
    </div>
  );
}
