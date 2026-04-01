'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HelpCircle, Download, ChevronDown } from 'lucide-react';

interface MachineEvent {
  eventNumber: number;
  time: number;
  eventType: 'FAILURE' | 'REPAIR_END';
  machineId: number;
  queueLength: number;
  machinesDown: number;
  area: number;
}

interface MachinesResult {
  events: MachineEvent[];
  statistics: {
    avgMachinesDown: number;
    totalCostPerHour: number;
    totalFailures: number;
    totalTime: number;
    avgRepairTime: number;
  };
  parameters: { numMachines: number; simulationHours: number };
}

export function MachinesProgram() {
  const [numMachines, setNumMachines] = useState(5);
  const [simulationHours, setSimulationHours] = useState(480);
  const [seed, setSeed] = useState(12345);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MachinesResult | null>(null);
  const [error, setError] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simulate/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numMachines: parseInt(String(numMachines)),
          simulationHours: parseInt(String(simulationHours)),
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

  // Preparar datos para gráfico
  const chartData = result?.events.map(e => ({
    time: e.time.toFixed(2),
    machinesDown: e.machinesDown,
  })) || [];

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Programa 3: Máquinas y Mecánico
            <button className="text-blue-500" title="Ver ayuda">
              <HelpCircle className="w-5 h-5" />
            </button>
          </CardTitle>
          <CardDescription>
            Sistema de colas con fuente finita de máquinas. Tiempos de falla y reparación con distribuciones empíricas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Número de Máquinas</label>
              <Input type="number" value={numMachines} onChange={(e) => setNumMachines(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Horas de Simulación</label>
              <Input type="number" value={simulationHours} onChange={(e) => setSimulationHours(e.target.value)} />
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
              <CardTitle className="text-lg">Resumen Estadístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Máq. Descompuestas (Promedio)</p>
                  <p className="text-lg font-bold">{result.statistics.avgMachinesDown.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo por Hora</p>
                  <p className="text-lg font-bold">${result.statistics.totalCostPerHour.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Fallas</p>
                  <p className="text-lg font-bold">{result.statistics.totalFailures}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiempo de Reparación Promedio</p>
                  <p className="text-lg font-bold">{result.statistics.avgRepairTime.toFixed(2)} h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolución de Máquinas Descompuestas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="machinesDown" stroke="#ef4444" name="Máquinas Descompuestas" />
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
                      <th className="text-left p-2">Evento</th>
                      <th className="text-left p-2">Tiempo (h)</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Máquina</th>
                      <th className="text-left p-2">Descompuestas</th>
                      <th className="text-left p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.slice(0, 10).map(event => (
                      <tr key={event.eventNumber} className="border-b hover:bg-gray-50">
                        <td className="p-2">{event.eventNumber}</td>
                        <td className="p-2">{event.time.toFixed(2)}</td>
                        <td className="p-2">{event.eventType === 'FAILURE' ? '⚠️ Falla' : '✓ Reparación'}</td>
                        <td className="p-2">M{event.machineId}</td>
                        <td className="p-2">{event.machinesDown}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedEvent(expandedEvent === event.eventNumber ? null : event.eventNumber)}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </td>
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
