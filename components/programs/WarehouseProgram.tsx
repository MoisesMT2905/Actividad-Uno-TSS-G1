'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, ChevronDown } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { AnalysisModal } from '@/components/shared/AnalysisModal';
import { SummaryPanel } from '@/components/shared/SummaryPanel';
import { exportWarehouseToXLSX } from '@/lib/utils/xlsx-export';

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
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WarehouseEvent | null>(null);

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
            <HelpTooltip
              title="Sistema M/U/1"
              content="Sistema de colas con llegadas exponenciales (Poisson λ=2/hora) y descargas uniformes. Análisis de costos operacionales vs costo de espera."
            />
          </CardTitle>
          <CardDescription>
            Sistema de colas M/U/1. Llegadas Poisson (λ=2 camiones/hora) y tiempos de descarga uniformes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Trabajadores (1-1,000,000)</label>
              <Input 
                type="number" 
                value={equipment} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 1000000) {
                    setEquipment(val);
                  }
                }}
                min="1"
                max="1000000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {equipment <= 6 && equipmentDescriptions[equipment] 
                  ? `Rango: ${equipmentDescriptions[equipment]}` 
                  : `Trabajadores: ${equipment}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Minutos (1-1,000,000)</label>
              <Input 
                type="number" 
                value={durationMinutes} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 1000000) {
                    setDurationMinutes(val);
                  }
                }}
                min="1"
                max="1000000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Semilla</label>
              <Input 
                type="number" 
                value={seed} 
                onChange={(e) => setSeed(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSimulate} disabled={loading} className="bg-blue-600 flex-1">
                {loading ? 'Simulando...' : 'Simular'}
              </Button>
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
                      exportWarehouseToXLSX(
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
            title="Resumen Financiero"
            items={[
              { label: 'Camiones Atendidos', value: result.statistics.trucksServed, color: 'blue' },
              { label: 'Espera Promedio', value: `${result.statistics.avgWaitTime.toFixed(2)} min`, color: 'amber' },
              { label: 'Costo Salarios', value: `$${result.statistics.equipmentCost.toFixed(2)}`, color: 'green' },
              { label: 'Costo Espera', value: `$${result.statistics.waitCost.toFixed(2)}`, color: 'red' },
              { label: 'Costo Total', value: `$${result.statistics.totalCost.toFixed(2)}`, color: 'green' },
              { label: 'Utilización', value: `${result.statistics.utilizationRate.toFixed(1)}%`, color: 'blue' },
            ]}
            interpretation={`Se atendieron ${result.statistics.trucksServed} camiones con espera promedio de ${result.statistics.avgWaitTime.toFixed(2)} minutos. Costo total: $${result.statistics.totalCost.toFixed(2)}, siendo $${result.statistics.equipmentCost.toFixed(2)} en salarios y $${result.statistics.waitCost.toFixed(2)} en espera. Utilización: ${result.statistics.utilizationRate.toFixed(1)}%.`}
          />

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
              <CardTitle className="text-lg">Tabla de eventos - todos los registros ({result.events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto overflow-y-auto border rounded" style={{ maxHeight: '400px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-2">Camión</th>
                      <th className="text-left p-2">Llegada (min)</th>
                      <th className="text-left p-2">Espera (min)</th>
                      <th className="text-left p-2">Duración (min)</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Cola</th>
                      <th className="text-left p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.map(event => (
                      <tr key={event.truckId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">C{event.truckId}</td>
                        <td className="p-2">{event.arrivalTime.toFixed(2)}</td>
                        <td className="p-2">{event.waitTime.toFixed(2)}</td>
                        <td className="p-2">{(event.unloadEnd - event.unloadStart).toFixed(2)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            event.eventType === 'ARRIVAL'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.eventType === 'ARRIVAL' ? 'Llegada' : 'Descargado'}
                          </span>
                        </td>
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
            </CardContent>
          </Card>

          {/* Modal de análisis general */}
          <AnalysisModal
            open={analysisOpen}
            onOpenChange={setAnalysisOpen}
            title="Análisis Detallado - Almacén y Camiones"
            fullWidth
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900">Configuración</p>
                  <p className="text-xs mt-2">Trabajadores: {result.parameters.equipment}</p>
                  <p className="text-xs">Duración: {result.parameters.durationMinutes} minutos</p>
                  <p className="text-xs">Total de camiones: {result.statistics.trucksServed}</p>
                  <p className="text-xs">Total de eventos: {result.events.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-900">Métricas de desempeño</p>
                  <p className="text-xs mt-2">Espera promedio: {result.statistics.avgWaitTime.toFixed(2)} min</p>
                  <p className="text-xs">Utilización: {result.statistics.utilizationRate.toFixed(1)}%</p>
                  <p className="text-xs">Costo total: ${result.statistics.totalCost.toFixed(2)}</p>
                  <p className="text-xs">Costo por camión: ${(result.statistics.totalCost / result.statistics.trucksServed).toFixed(2)}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold mb-2">Análisis operacional:</p>
                <p className="text-sm text-gray-700">
                  Con {result.parameters.equipment} trabajadores, se atendieron {result.statistics.trucksServed} camiones en {result.parameters.durationMinutes} minutos.
                  La espera promedio fue {result.statistics.avgWaitTime.toFixed(2)} minutos, generando un costo de espera de ${result.statistics.waitCost.toFixed(2)}.
                  El costo de salarios fue ${result.statistics.equipmentCost.toFixed(2)}, para un costo total de ${result.statistics.totalCost.toFixed(2)} y una utilización de {result.statistics.utilizationRate.toFixed(1)}%.
                </p>
              </div>
            </div>
          </AnalysisModal>

          {/* Modal de evento seleccionado */}
          {selectedEvent && (
            <AnalysisModal
              open={!!selectedEvent}
              onOpenChange={() => setSelectedEvent(null)}
              title={`Detalle del Camión C${selectedEvent.truckId}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-blue-900">Información de llegada</p>
                    <p className="text-xs mt-2">Camión: C{selectedEvent.truckId}</p>
                    <p className="text-xs">Tiempo de llegada: {selectedEvent.arrivalTime.toFixed(2)} min</p>
                    <p className="text-xs">Tiempo de espera: {selectedEvent.waitTime.toFixed(2)} min</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm font-medium text-green-900">Información de descarga</p>
                    <p className="text-xs mt-2">Inicio: {selectedEvent.unloadStart.toFixed(2)} min</p>
                    <p className="text-xs">Fin: {selectedEvent.unloadEnd.toFixed(2)} min</p>
                    <p className="text-xs">Duración: {(selectedEvent.unloadEnd - selectedEvent.unloadStart).toFixed(2)} min</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-semibold mb-2">Análisis del evento:</p>
                  <p className="text-sm text-gray-700">
                    El camión C{selectedEvent.truckId} llegó en {selectedEvent.arrivalTime.toFixed(2)} minutos y esperó {selectedEvent.waitTime.toFixed(2)} minutos antes de ser atendido.
                    La descarga duró {(selectedEvent.unloadEnd - selectedEvent.unloadStart).toFixed(2)} minutos. 
                    {selectedEvent.queueLength > 0 
                      ? `Había ${selectedEvent.queueLength} camión(es) esperando.` 
                      : 'No había otros camiones esperando.'}
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
