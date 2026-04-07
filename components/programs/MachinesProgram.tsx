'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, ChevronDown } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { AnalysisModal } from '@/components/shared/AnalysisModal';
import { SummaryPanel } from '@/components/shared/SummaryPanel';
import { exportMachinesToXLSX } from '@/lib/utils/xlsx-export';

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
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MachineEvent | null>(null);

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
            <HelpTooltip
              title="Sistema de Colas Finitas"
              content="Sistema M/M/1 con fuente finita. n máquinas, 1 mecánico. Tiempos de falla y reparación basados en distribuciones empíricas."
            />
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
                      exportMachinesToXLSX(
                        result.events,
                        result.statistics,
                        result.parameters
                      );
                    }}
                  >
                    <Download className="w-4 h-4" /> Exportar a Excel
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
              { label: 'Máq. Descompuestas (Prom)', value: result.statistics.avgMachinesDown.toFixed(2), color: 'red' },
              { label: 'Costo/Hora', value: `$${result.statistics.totalCostPerHour.toFixed(2)}`, color: 'amber' },
              { label: 'Total de Fallas', value: result.statistics.totalFailures, color: 'blue' },
              { label: 'T. Reparación Prom', value: `${result.statistics.avgRepairTime.toFixed(2)} h`, color: 'green' },
            ]}
            interpretation={`En ${result.statistics.totalTime.toFixed(2)} horas de simulación con ${result.parameters.numMachines} máquinas y 1 mecánico, ocurrieron ${result.statistics.totalFailures} fallas. El costo promedio es $${result.statistics.totalCostPerHour.toFixed(2)}/hora.`}
          />

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
              <CardTitle className="text-lg">Tabla de eventos - todos los registros ({result.events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto overflow-y-auto border rounded" style={{ maxHeight: '400px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-2">Evento</th>
                      <th className="text-left p-2">Tiempo (h)</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Máquina</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Descompuestas</th>
                      <th className="text-left p-2">Cola</th>
                      <th className="text-left p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.map(event => (
                      <tr key={event.eventNumber} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{event.eventNumber}</td>
                        <td className="p-2">{event.time.toFixed(2)}</td>
                        <td className="p-2">{event.eventType === 'FAILURE' ? '⚠️ Falla' : '✓ Reparación'}</td>
                        <td className="p-2 font-medium">M{event.machineId}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            event.eventType === 'FAILURE' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.eventType === 'FAILURE' ? 'Falla' : 'Reparado'}
                          </span>
                        </td>
                        <td className="p-2">{event.machinesDown}</td>
                        <td className="p-2">{event.queueLength}</td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvent(event)}
                            className="gap-1"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <p className="font-medium">Nota: Mostrando los primeros 10 eventos de {result.events.length} totales.</p>
                <p className="mt-1">Máquinas descompuestas = máquinas esperando o siendo reparadas</p>
                <p className="mt-1">Cola = máquinas esperando mientras el mecánico repara otra</p>
              </div>
            </CardContent>
          </Card>

          {/* Modal de análisis general */}
          <AnalysisModal
            open={analysisOpen}
            onOpenChange={setAnalysisOpen}
            title="Análisis Detallado - Sistema de Máquinas"
            fullWidth
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900">Configuración</p>
                  <p className="text-xs mt-2">Número de máquinas: {result.parameters.numMachines}</p>
                  <p className="text-xs">Tiempo de simulación: {result.statistics.totalTime.toFixed(2)} horas</p>
                  <p className="text-xs">Total de eventos: {result.events.length}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded">
                  <p className="text-sm font-medium text-amber-900">Métricas de desempeño</p>
                  <p className="text-xs mt-2">Máquinas descompuestas (prom): {result.statistics.avgMachinesDown.toFixed(2)}</p>
                  <p className="text-xs">Tasa de fallas: {(result.statistics.totalFailures / result.statistics.totalTime).toFixed(2)} fallas/hora</p>
                  <p className="text-xs">Costo operacional: ${(result.statistics.totalCostPerHour * result.statistics.totalTime).toFixed(2)}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold mb-2">Interpretación operacional:</p>
                <p className="text-sm text-gray-700">
                  Con {result.parameters.numMachines} máquinas y 1 mecánico, el sistema experimenta un promedio de {result.statistics.avgMachinesDown.toFixed(2)} máquinas descompuestas.
                  La tasa de fallas es {(result.statistics.totalFailures / result.statistics.totalTime).toFixed(2)} por hora, generando un costo total de ${(result.statistics.totalCostPerHour * result.statistics.totalTime).toFixed(2)}.
                  El tiempo promedio de reparación es {result.statistics.avgRepairTime.toFixed(2)} horas.
                </p>
              </div>
            </div>
          </AnalysisModal>

          {/* Modal de evento seleccionado */}
          {selectedEvent && (
            <AnalysisModal
              open={!!selectedEvent}
              onOpenChange={() => setSelectedEvent(null)}
              title={`Detalle del Evento #${selectedEvent.eventNumber}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-blue-900">Información del evento</p>
                    <p className="text-xs mt-2">Número: {selectedEvent.eventNumber}</p>
                    <p className="text-xs">Tiempo: {selectedEvent.time.toFixed(4)} horas</p>
                    <p className="text-xs">Tipo: {selectedEvent.eventType === 'FAILURE' ? 'Falla de máquina' : 'Fin de reparación'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm font-medium text-green-900">Estado del sistema</p>
                    <p className="text-xs mt-2">Máquina afectada: M{selectedEvent.machineId}</p>
                    <p className="text-xs">Máquinas descompuestas: {selectedEvent.machinesDown}</p>
                    <p className="text-xs">Máquinas en cola: {selectedEvent.queueLength}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-semibold mb-2">Análisis del evento:</p>
                  <p className="text-sm text-gray-700">
                    {selectedEvent.eventType === 'FAILURE'
                      ? `La máquina M${selectedEvent.machineId} falló en el tiempo ${selectedEvent.time.toFixed(4)} h. Había ${selectedEvent.machinesDown - 1} máquinas previamente descompuestas, ahora hay ${selectedEvent.machinesDown}. ${selectedEvent.queueLength > 0 ? `${selectedEvent.queueLength} máquina(s) esperando reparación.` : 'El mecánico está disponible.'}`
                      : `La máquina M${selectedEvent.machineId} completó su reparación. Máquinas descompuestas: ${selectedEvent.machinesDown}. ${selectedEvent.queueLength > 0 ? `Hay ${selectedEvent.queueLength} máquina(s) esperando.` : 'Todas las máquinas están operativas.'}`
                    }
                  </p>
                </div>
              </div>
            </AnalysisModal>
          )}
        </>
      )}
    </div>
  );
}
