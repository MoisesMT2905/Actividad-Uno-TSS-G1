import { NextRequest, NextResponse } from 'next/server';
import { WarehouseSimulator } from '@/lib/simulators';

export async function POST(req: NextRequest) {
  try {
    const { equipment = 4, durationMinutes = 480, seed = 12345 } = await req.json();

    if (equipment < 3 || equipment > 6) {
      return NextResponse.json(
        { error: 'Equipamiento debe estar entre 3 y 6' },
        { status: 400 }
      );
    }

    const simulator = new WarehouseSimulator(equipment, seed);
    const result = simulator.simulate(durationMinutes);

    return NextResponse.json({
      events: result.events,
      statistics: {
        totalWaitTime: result.totalWaitTime,
        trucksServed: result.trucksServed,
        avgWaitTime: result.avgWaitTime,
        equipmentCost: result.equipmentCost,
        waitCost: result.waitCost,
        totalCost: result.totalCost,
        utilizationRate: result.utilizationRate,
      },
      parameters: { equipment, durationMinutes },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
