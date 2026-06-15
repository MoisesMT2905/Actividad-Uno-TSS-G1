/**
 * Simuladores para Programas 3 y 4
 * Basado en el Contexto A (documento .docx)
 */

import { EmpiricDistribution, EmpiricInterval } from '@/lib/generators/distributions';
import { CongruencialMixto } from '@/lib/generators/congruencial';

// ==================== PROGRAMA 3: MÁQUINAS Y MECÁNICO ====================

export interface MachineEvent {
  eventNumber: number;
  time: number;
  eventType: 'FAILURE' | 'REPAIR_END';
  machineId: number;
  repairTime?: number;       // duración de la reparación (solo en evento FAILURE cuando inicia reparación)
  queueLength: number;
  machinesDown: number;
  area: number;
}

export interface MachineResult {
  events: MachineEvent[];
  avgMachinesDown: number;
  totalCostPerHour: number;
  statistics: {
    totalTime: number;
    totalFailures: number;
    avgRepairTime: number;
  };
}

export class MachinesSimulator {
  private failureDist: EmpiricDistribution;
  private repairDist: EmpiricDistribution;
  private rng: CongruencialMixto;

  constructor(seed: number = 12345) {
    const failureIntervals: EmpiricInterval[] = [
      { limInf: 6, limSup: 8, probability: 0.10 },
      { limInf: 8, limSup: 10, probability: 0.15 },
      { limInf: 10, limSup: 12, probability: 0.24 },
      { limInf: 12, limSup: 14, probability: 0.26 },
      { limInf: 16, limSup: 18, probability: 0.18 },
      { limInf: 18, limSup: 20, probability: 0.07 },
    ];
    const repairIntervals: EmpiricInterval[] = [
      { limInf: 2, limSup: 4, probability: 0.15 },
      { limInf: 4, limSup: 6, probability: 0.25 },
      { limInf: 6, limSup: 8, probability: 0.30 },
      { limInf: 8, limSup: 10, probability: 0.20 },
      { limInf: 10, limSup: 12, probability: 0.10 },
    ];
    this.failureDist = new EmpiricDistribution(failureIntervals);
    this.repairDist = new EmpiricDistribution(repairIntervals);
    this.rng = new CongruencialMixto(seed);
  }

  simulate(numMachines: number, simulationHours: number): MachineResult {
    const events: MachineEvent[] = [];
    let eventNumber = 0;

    // Estado: false = operativa, true = descompuesta
    let broken: boolean[] = new Array(numMachines).fill(false);
    let nextFailure: number[] = new Array(numMachines).fill(Infinity);
    let queue: number[] = [];
    let repairingMachine = -1;
    let repairEndTime = Infinity;

    let currentTime = 0;
    let lastEventTime = 0;
    let totalArea = 0;
    let totalFailures = 0;
    let totalRepairDuration = 0;

    // Inicializar primeras fallas
    for (let i = 0; i < numMachines; i++) {
      const R = this.rng.nextUniform();
      nextFailure[i] = this.failureDist.generate(R);
    }

    while (currentTime < simulationHours) {
      // Encontrar próxima falla entre máquinas operativas
      let nextFailureTime = Infinity;
      for (let i = 0; i < numMachines; i++) {
        if (!broken[i] && nextFailure[i] < nextFailureTime) {
          nextFailureTime = nextFailure[i];
        }
      }
      const nextEventTime = Math.min(nextFailureTime, repairEndTime);
      if (nextEventTime >= simulationHours) break;

      const delta = nextEventTime - lastEventTime;
      const brokenCount = broken.filter(b => b).length;
      totalArea += delta * brokenCount;
      lastEventTime = nextEventTime;
      currentTime = nextEventTime;

      const isRepair = (repairEndTime <= nextFailureTime);
      let machineId = -1;

      if (isRepair) {
        // Fin de reparación
        machineId = repairingMachine;
        broken[machineId] = false;
        repairingMachine = -1;
        repairEndTime = Infinity;

        // Reprogramar falla de esta máquina
        const R = this.rng.nextUniform();
        nextFailure[machineId] = currentTime + this.failureDist.generate(R);

        // Si hay cola, iniciar reparación de la siguiente
        if (queue.length > 0) {
          const nextMachine = queue.shift()!;
          repairingMachine = nextMachine;
          const Rrep = this.rng.nextUniform();
          const repairDur = this.repairDist.generate(Rrep);
          repairEndTime = currentTime + repairDur;
          totalRepairDuration += repairDur;
        }

        events.push({
          eventNumber: eventNumber++,
          time: currentTime,
          eventType: 'REPAIR_END',
          machineId,
          queueLength: queue.length,
          machinesDown: broken.filter(b => b).length,
          area: totalArea,
        });
      } else {
        // Falla de máquina
        // Determinar cuál máquina falla (la que tiene nextFailure más pequeño)
        let minTime = Infinity;
        for (let i = 0; i < numMachines; i++) {
          if (!broken[i] && nextFailure[i] < minTime) {
            minTime = nextFailure[i];
            machineId = i;
          }
        }
        if (machineId === -1) continue;

        broken[machineId] = true;
        totalFailures++;

        let repairDur: number | undefined = undefined;
        if (repairingMachine === -1) {
          // Iniciar reparación inmediata
          repairingMachine = machineId;
          const Rrep = this.rng.nextUniform();
          repairDur = this.repairDist.generate(Rrep);
          repairEndTime = currentTime + repairDur;
          totalRepairDuration += repairDur;
        } else {
          // Encolar
          queue.push(machineId);
        }

        events.push({
          eventNumber: eventNumber++,
          time: currentTime,
          eventType: 'FAILURE',
          machineId,
          repairTime: repairDur,
          queueLength: queue.length,
          machinesDown: broken.filter(b => b).length,
          area: totalArea,
        });
      }
    }

    const avgMachinesDown = totalArea / simulationHours;
    const avgRepairTime = totalFailures > 0 ? totalRepairDuration / totalFailures : 0;
    const costPerHour = 500 * avgMachinesDown + 50 / numMachines;

    return {
      events,
      avgMachinesDown,
      totalCostPerHour: costPerHour,
      statistics: {
        totalTime: currentTime,
        totalFailures,
        avgRepairTime,
      },
    };
  }
}

// ==================== PROGRAMA 4: ALMACÉN Y CAMIONES ====================

export interface WarehouseEvent {
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

export interface WarehouseResult {
  events: WarehouseEvent[];
  totalWaitTime: number;
  trucksServed: number;
  equipmentCost: number;
  waitCost: number;
  totalCost: number;
  avgWaitTime: number;
  utilizationRate: number;
}

export class WarehouseSimulator {
  private rng: CongruencialMixto;
  private equipment: number;
  private minUnload: number;
  private maxUnload: number;

  constructor(equipment: number, seed: number = 12345) {
    this.rng = new CongruencialMixto(seed);
    this.equipment = equipment;
    // Rangos según Contexto A
    switch (equipment) {
      case 3: this.minUnload = 20; this.maxUnload = 30; break;
      case 4: this.minUnload = 15; this.maxUnload = 25; break;
      case 5: this.minUnload = 10; this.maxUnload = 20; break;
      case 6: this.minUnload = 5;  this.maxUnload = 15; break;
      default: this.minUnload = 20; this.maxUnload = 30;
    }
  }

  simulate(durationMinutes: number = 480): WarehouseResult {
    const events: WarehouseEvent[] = [];
    let eventNumber = 0;

    let currentTime = 0;
    let nextArrival = this.generateExponentialTime();
    let equipmentFreeTime = 0;
    let queue: number[] = []; // almacena tiempos de llegada de camiones en espera
    let totalWaitTime = 0;
    let totalServiceTime = 0; // para utilización
    let truckId = 0;

    while (currentTime < durationMinutes || equipmentFreeTime > currentTime || queue.length > 0) {
      // Determinar próximo evento: llegada o fin de descarga
      let nextEventTime = Math.min(nextArrival, equipmentFreeTime);
      if (nextEventTime >= Infinity) break;

      const delta = nextEventTime - currentTime;
      currentTime = nextEventTime;

      if (nextArrival <= equipmentFreeTime) {
        // Evento: LLEGADA de un nuevo camión
        truckId++;
        const arrivalTime = currentTime;
        let waitTime = 0;
        let unloadStart = currentTime;
        let unloadEnd = currentTime;

        if (currentTime < equipmentFreeTime) {
          // Equipo ocupado, encolar
          queue.push(arrivalTime);
          waitTime = 0; // se calculará después cuando salga de la cola
          unloadStart = equipmentFreeTime;
        } else {
          // Equipo libre, atender inmediatamente
          const unloadDur = this.minUnload + (this.maxUnload - this.minUnload) * this.rng.nextUniform();
          unloadStart = currentTime;
          unloadEnd = currentTime + unloadDur;
          equipmentFreeTime = unloadEnd;
          totalServiceTime += unloadDur;
          waitTime = 0;
        }

        events.push({
          eventNumber: eventNumber++,
          time: currentTime,
          eventType: 'ARRIVAL',
          truckId,
          arrivalTime,
          unloadStart,
          unloadEnd,
          waitTime,
          queueLength: queue.length,
        });

        // Programar próxima llegada
        nextArrival = currentTime + this.generateExponentialTime();
      } else {
        // Evento: FIN_DESCARGA
        // Atender al primer camión de la cola (si hay)
        if (queue.length > 0) {
          const arrivalTime = queue.shift()!;
          const waitTime = currentTime - arrivalTime;
          totalWaitTime += waitTime;
          const unloadDur = this.minUnload + (this.maxUnload - this.minUnload) * this.rng.nextUniform();
          const unloadStart = currentTime;
          const unloadEnd = currentTime + unloadDur;
          equipmentFreeTime = unloadEnd;
          totalServiceTime += unloadDur;

          // Buscar el ID del camión que sale (no lo tenemos fácil, asignamos 0 temporal)
          // Para efectos de la tabla de eventos, no es crítico; el frontend usa los datos de llegada.
          events.push({
            eventNumber: eventNumber++,
            time: currentTime,
            eventType: 'UNLOAD_END',
            truckId: 0,
            arrivalTime,
            unloadStart,
            unloadEnd,
            waitTime,
            queueLength: queue.length,
          });
        } else {
          // No hay cola, el equipo queda libre
          equipmentFreeTime = Infinity;
        }
      }
    }

    const trucksServed = events.filter(e => e.eventType === 'ARRIVAL').length;
    const avgWaitTime = trucksServed > 0 ? totalWaitTime / trucksServed : 0;
    const equipmentCost = this.equipment * 200; // 8 horas * $25/hora = $200 por trabajador
    const waitCost = 50 * (totalWaitTime / 60); // $50/hora, convertir minutos a horas
    const totalCost = equipmentCost + waitCost;
    const utilizationRate = (totalServiceTime / durationMinutes) * 100;

    return {
      events: events.filter(e => e.eventType === 'ARRIVAL'), // solo mostramos llegadas para simplicidad
      totalWaitTime,
      trucksServed,
      equipmentCost,
      waitCost,
      totalCost,
      avgWaitTime,
      utilizationRate,
    };
  }

  private generateExponentialTime(): number {
    const R = this.rng.nextUniform();
    return -30 * Math.log(R);
  }
}
