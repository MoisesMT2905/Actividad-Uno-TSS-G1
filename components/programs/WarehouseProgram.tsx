'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { HelpCircle, Download } from 'lucide-react';

interface WarehouseEvent {
  eventNumber: number;
  time: number;
  eventType: 'ARRIVAL' | 'UNLOAD_END';
  truckId: number;
  arrivalTime: number;
  unloadStart: number;
  unloadEnd: number;
  waitTime: number;
  queueLength: number;
}

interface WarehouseResult {
  events: WarehouseEvent[];
  statistics: {
    totalWaitTime: number;
    trucksServed: number;
    avgWaitTime: number;
    equipmentCost: number;
    waitCost: number;
    totalCost: number;
    utilizationRate: number;
  };
  parameters: { equipment: number; durationMinutes: number };
}

export function WarehouseProgram() {
  const [equipment, setEquipment] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(480);
  const [seed, setSeed] = useState(12345);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarehouseResult | null>(null);
  const [error, setError] = useState('');

  const handleSimulate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simulate/warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment: parseInt(String(equipment)),
          durationMinutes: parseInt(String(durationMinutes)),
          seed: parseInt(String(seed)),
        }),
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

  const equipmentDescriptions: { [key: number]: string } = {
    3: '20-30 min',
    4: '15-25 min',
    5: '10-20 min',
    6: '5-15 min',
  };

  // Datos para gráfico
  const queueData = result?.events.map(e => ({
    time: e.arrivalTime.toFixed(1),
    queue: e.queueLength,
  })) || [];

  const costBreakdown = result ? [
    { name: 'Salarios', value: result.statistics.equipmentCost },
    { name: 'Costo Espera', value: result.statistics.waitCost },
  ] : [];

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚚 Programa 4: Almacén y Camiones
            <button className="text-blue-500" title="Ver ayuda">
              <HelpCircle className="w-5 h-5" />
            </button>
          </CardTitle>
          <CardDescription>
            Sistema de colas M/U/1. Llegadas Poisson (λ=2 camiones/hora) y tiempos de descarga uniformes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Trabajadores</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="3">3 trabajadores</option>
                <option value="4">4 trabajadores</option>
                <option value="5">5 trabajadores</option>
                <option value="6">6 trabajadores</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{equipmentDescriptions[equipment]}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Minutos de Simulación</label>
              <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Semilla</label>
              <Input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSimulate} disabled={loading} className="bg-blue-600">
                {loading ? 'Simulando...' : 'Simular'}
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
              <CardTitle className="text-lg">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Camiones Atendidos</p>
                  <p className="text-lg font-bold">{result.statistics.trucksServed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Espera Promedio</p>
                  <p className="text-lg font-bold">{result.statistics.avgWaitTime.toFixed(2)} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo Salarios</p>
                  <p className="text-lg font-bold">${result.statistics.equipmentCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo Espera</p>
                  <p className="text-lg font-bold">${result.statistics.waitCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600">COSTO TOTAL</p>
                <p className="text-2xl font-bold text-green-600">${result.statistics.totalCost.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-2">Utilización del Equipo: {result.statistics.utilizationRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desglose de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolución de Cola</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="queue" stroke="#f97316" name="Camiones en Cola" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tabla de Eventos (primeros 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Camión</th>
                      <th className="text-left p-2">Llegada (min)</th>
                      <th className="text-left p-2">Espera (min)</th>
                      <th className="text-left p-2">Duración (min)</th>
                      <th className="text-left p-2">Cola</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.slice(0, 10).map(event => (
                      <tr key={event.truckId} className="border-b hover:bg-gray-50">
                        <td className="p-2">C{event.truckId}</td>
                        <td className="p-2">{event.arrivalTime.toFixed(2)}</td>
                        <td className="p-2">{event.waitTime.toFixed(2)}</td>
                        <td className="p-2">{(event.unloadEnd - event.unloadStart).toFixed(2)}</td>
                        <td className="p-2">{event.queueLength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
