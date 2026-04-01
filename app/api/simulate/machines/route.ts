import { NextRequest, NextResponse } from 'next/server';
import { MachinesSimulator } from '@/lib/simulators';

export async function POST(req: NextRequest) {
  try {
    const { numMachines = 5, simulationHours = 480, seed = 12345 } = await req.json();

    const simulator = new MachinesSimulator(seed);
    const result = simulator.simulate(numMachines, simulationHours);

    return NextResponse.json({
      events: result.events,
      statistics: {
        avgMachinesDown: result.avgMachinesDown,
        totalCostPerHour: result.totalCostPerHour,
        totalFailures: result.statistics.totalFailures,
        totalTime: result.statistics.totalTime,
        avgRepairTime: result.statistics.avgRepairTime,
      },
      parameters: { numMachines, simulationHours },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
