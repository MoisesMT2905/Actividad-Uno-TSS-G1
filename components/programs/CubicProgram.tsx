'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HelpCircle, Download } from 'lucide-react';

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
            <button className="text-blue-500" title="Ver ayuda">
              <HelpCircle className="w-5 h-5" />
            </button>
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
              <Button variant="outline" onClick={() => setResult(null)}>
                Reiniciar
              </Button>
            </div>
          </div>

          {error && <div className="text-red-600 font-medium">{error}</div>}
        </CardContent>
      </Card>

      {result && (
        <>
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
        </>
      )}
    </div>
  );
}
