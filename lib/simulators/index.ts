/**
 * Simuladores para Programas 3 y 4
 * PROGRAMA 3: Máquinas y Mecánico (distribuciones empíricas)
 * PROGRAMA 4: Almacén y Camiones (exponencial y uniforme)
 */

import { EmpiricDistribution, EmpiricInterval } from '@/lib/generators/distributions';
import { CongruencialMixto } from '@/lib/generators/congruencial';

// ==================== PROGRAMA 3: MÁQUINAS Y MECÁNICO ====================

export interface MachineEvent {
  eventNumber: number;
  time: number;
  eventType: 'FAILURE' | 'REPAIR_END';
  machineId: number;
  failureTime?: number;
  repairTime?: number;
  rFailure?: number;
  rRepair?: number;
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
  private failureDistribution: EmpiricDistribution;
  private repairDistribution: EmpiricDistribution;
  private rng: CongruencialMixto;

  constructor(seed: number = 12345) {
    // Tabla de fallas (tiempo entre descomposturas en horas)
    const failureIntervals: EmpiricInterval[] = [
      { limInf: 6, limSup: 8, probability: 0.10 },
      { limInf: 8, limSup: 10, probability: 0.15 },
      { limInf: 10, limSup: 12, probability: 0.24 },
      { limInf: 12, limSup: 14, probability: 0.26 },
      { limInf: 16, limSup: 18, probability: 0.18 },
      { limInf: 18, limSup: 20, probability: 0.07 },
    ];

    // Tabla de reparaciones (tiempo de reparación en horas)
    const repairIntervals: EmpiricInterval[] = [
      { limInf: 2, limSup: 4, probability: 0.15 },
      { limInf: 4, limSup: 6, probability: 0.25 },
      { limInf: 6, limSup: 8, probability: 0.30 },
      { limInf: 8, limSup: 10, probability: 0.20 },
      { limInf: 10, limSup: 12, probability: 0.10 },
    ];

    this.failureDistribution = new EmpiricDistribution(failureIntervals);
    this.repairDistribution = new EmpiricDistribution(repairIntervals);
    this.rng = new CongruencialMixto(seed);
  }

  /**
   * Simula el sistema de máquinas durante un período determinado
   * 
   * @param numMachines Número de máquinas (por defecto 5)
   * @param simulationHours Horas de simulación (por defecto 480)
   */
  simulate(numMachines: number = 5, simulationHours: number = 480): MachineResult {
    const events: MachineEvent[] = [];
    let eventNumber = 0;

    // Inicializar próximas fallas de cada máquina
    const nextFailureTimes: number[] = [];
    for (let i = 0; i < numMachines; i++) {
      const R = this.rng.nextUniform();
      nextFailureTimes[i] = this.failureDistribution.generate(R);
    }

    let currentTime = 0;
    let repairingMachineId = -1;
    let repairEndTime = Number.MAX_VALUE;
    let machinesDown = 0;
    let totalArea = 0;

    // Simulación de eventos
    while (currentTime < simulationHours) {
      // Encontrar próximo evento (falla o fin de reparación)
      let nextEventTime = simulationHours;
      let nextEventMachine = -1;
      let isRepairEnd = false;

      // Verificar próximas fallas
      for (let i = 0; i < numMachines; i++) {
        if (nextFailureTimes[i] < nextEventTime) {
          nextEventTime = nextFailureTimes[i];
          nextEventMachine = i;
          isRepairEnd = false;
        }
      }

      // Verificar fin de reparación
      if (repairEndTime < nextEventTime) {
        nextEventTime = repairEndTime;
        isRepairEnd = true;
      }

      if (nextEventTime >= simulationHours) break;

      currentTime = nextEventTime;

      if (isRepairEnd) {
        // Evento: FIN_REPARACIÓN
        machinesDown--;
        repairingMachineId = -1;
        repairEndTime = Number.MAX_VALUE;

        // Buscar siguiente máquina en falla
        for (let i = 0; i < numMachines; i++) {
          if (i !== nextEventMachine && nextFailureTimes[i] < currentTime) {
            const R = this.rng.nextUniform();
            const repairTime = this.repairDistribution.generate(R);
            repairingMachineId = i;
            repairEndTime = currentTime + repairTime;
            break;
          }
        }
      } else {
        // Evento: FALLA de máquina
        machinesDown++;
        const R = this.rng.nextUniform();
        const failureTime = this.failureDistribution.generate(R);
        nextFailureTimes[nextEventMachine] = currentTime + failureTime;

        // Si mecánico está libre, inicia reparación
        if (repairingMachineId === -1) {
          const R2 = this.rng.nextUniform();
          const repairTime = this.repairDistribution.generate(R2);
          repairingMachineId = nextEventMachine;
          repairEndTime = currentTime + repairTime;
        }
      }

      // Acumular área (máquinas descompuestas * tiempo)
      if (events.length > 0) {
        const timeDelta = currentTime - events[events.length - 1].time;
        totalArea += machinesDown * timeDelta;
      }

      events.push({
        eventNumber: eventNumber++,
        time: currentTime,
        eventType: isRepairEnd ? 'REPAIR_END' : 'FAILURE',
        machineId: nextEventMachine,
        queueLength: Math.max(0, machinesDown - 1),
        machinesDown: machinesDown,
        area: totalArea,
      });
    }

    const avgMachinesDown = simulationHours > 0 ? totalArea / simulationHours : 0;
    const costPerHour = 500 * avgMachinesDown + 50 / numMachines;

    return {
      events,
      avgMachinesDown,
      totalCostPerHour: costPerHour,
      statistics: {
        totalTime: currentTime,
        totalFailures: events.filter(e => e.eventType === 'FAILURE').length,
        avgRepairTime: events.length > 0
          ? events.reduce((acc, e) => acc + (e.repairTime || 0), 0) / events.length
          : 0,
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
  timeBetweenArrivals?: number;
  unloadDuration?: number;
  R_arrival?: number;
  R_unload?: number;
  arrivalTime: number;
  unloadStart: number;
  unloadEnd: number;
  waitTime: number;
  queueLength: number;
  equipmentBusy: boolean;
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
  private lambda: number = 2; // camiones por hora = 30 minutos promedio
  private equipment: number; // 3-6 trabajadores

  constructor(equipment: number = 4, seed: number = 12345) {
    this.rng = new CongruencialMixto(seed);
    this.equipment = equipment;
  }

  /**
   * Obtiene rango de tiempo de descarga según número de trabajadores
   * Distribución uniforme [a,b] en minutos
   */
  private getUnloadRange(equipment: number): [number, number] {
    switch (equipment) {
      case 3: return [20, 30];
      case 4: return [15, 25];
      case 5: return [10, 20];
      case 6: return [5, 15];
      default: return [15, 25];
    }
  }

  /**
   * Simula el almacén durante un turno de 8 horas (480 minutos)
   */
  simulate(durationMinutes: number = 480): WarehouseResult {
    const events: WarehouseEvent[] = [];
    let eventNumber = 0;
    let currentTime = 0;
    let nextArrivalTime = this.generateExponentialTime();
    let equipmentFreeTime = 0;
    let totalWaitTime = 0;
    let queueLength = 0;
    let truckCount = 0;

    const [minUnload, maxUnload] = this.getUnloadRange(this.equipment);

    while (currentTime < durationMinutes) {
      if (nextArrivalTime <= durationMinutes) {
        currentTime = nextArrivalTime;
        truckCount++;

        const R_unload = this.rng.nextUniform();
        const unloadDuration = minUnload + (maxUnload - minUnload) * R_unload;
        
        let waitTime = 0;
        let unloadStart = currentTime;
        let unloadEnd = currentTime + unloadDuration;

        if (currentTime < equipmentFreeTime) {
          waitTime = equipmentFreeTime - currentTime;
          unloadStart = equipmentFreeTime;
          unloadEnd = equipmentFreeTime + unloadDuration;
          queueLength++;
        } else {
          queueLength = 0;
        }

        totalWaitTime += waitTime;
        equipmentFreeTime = unloadEnd;

        const R_arrival = this.rng.nextUniform();
        const timeBetweenArrivals = -30 * Math.log(R_arrival);

        events.push({
          eventNumber: eventNumber++,
          time: currentTime,
          eventType: 'ARRIVAL',
          truckId: truckCount,
          timeBetweenArrivals,
          unloadDuration,
          R_arrival,
          R_unload,
          arrivalTime: currentTime,
          unloadStart,
          unloadEnd,
          waitTime,
          queueLength,
          equipmentBusy: currentTime < equipmentFreeTime,
        });

        nextArrivalTime = currentTime + timeBetweenArrivals;
      } else {
        break;
      }
    }

    const trucksServed = events.length;
    const equipmentCost = this.equipment * 200;
    const waitCost = 50 * (totalWaitTime / 60); // convertir minutos a horas
    const totalCost = equipmentCost + waitCost;
    const avgWaitTime = trucksServed > 0 ? totalWaitTime / trucksServed : 0;
    const utilizationRate = equipmentFreeTime > 0 ? (equipmentFreeTime / durationMinutes) * 100 : 0;

    return {
      events,
      totalWaitTime,
      trucksServed,
      equipmentCost,
      waitCost,
      totalCost,
      avgWaitTime,
      utilizationRate,
    };
  }

  /**
   * Genera tiempo entre llegadas usando distribución exponencial
   * Media = 30 minutos (lambda = 2 camiones/hora)
   * t = -30 * ln(R)
   */
  private generateExponentialTime(): number {
    const R = this.rng.nextUniform();
    return -30 * Math.log(R);
  }
}
