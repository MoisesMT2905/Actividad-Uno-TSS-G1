import { NextRequest, NextResponse } from 'next/server';
import { CubicGenerator } from '@/lib/generators/distributions';
import { calculateStatistics, createHistogram } from '@/lib/utils/statistics';

export async function POST(req: NextRequest) {
  try {
    const { n, seed } = await req.json();

    if (!n || n <= 0) {
      return NextResponse.json(
        { error: 'Número de muestras debe ser > 0' },
        { status: 400 }
      );
    }

    const generator = new CubicGenerator(seed || 12345);
    const values = generator.generateMany(n);
    const stats = calculateStatistics(values);
    const histogram = createHistogram(values, Math.ceil(Math.sqrt(n)));
    const theoreticalMean = generator.theoreticalMean();

    return NextResponse.json({
      values: values,
      allValues: values,
      statistics: stats,
      theoreticalMean,
      histogram,
      parameters: { min: 0, max: 6 },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
