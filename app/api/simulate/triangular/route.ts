import { NextRequest, NextResponse } from 'next/server';
import { TriangularGenerator } from '@/lib/generators/distributions';
import { calculateStatistics, createHistogram } from '@/lib/utils/statistics';

export async function POST(req: NextRequest) {
  try {
    const { a, b, c, n, seed } = await req.json();

    // Validar parámetros
    if (!a || !b || !c || !n || n <= 0) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    const generator = new TriangularGenerator(a, b, c, seed || 12345);
    const values = generator.generateMany(n);
    const stats = calculateStatistics(values);
    const histogram = createHistogram(values, Math.ceil(Math.sqrt(n)));
    const theoreticalMean = generator.theoreticalMean();

    return NextResponse.json({
      values: values.slice(0, 100), // Primeros 100 valores
      allValues: values,
      statistics: stats,
      theoreticalMean,
      histogram,
      parameters: { a, b, c },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
