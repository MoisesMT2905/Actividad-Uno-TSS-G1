import { NextRequest, NextResponse } from 'next/server';
import { TriangularGenerator } from '@/lib/generators/distributions';
import { calculateStatistics, createHistogram } from '@/lib/utils/statistics';

export async function POST(req: NextRequest) {
  try {
    const { a, b, c, n, seed } = await req.json();

    // Validar parámetros - permitir 0 como valor válido
    if (typeof a !== 'number' || typeof b !== 'number' || typeof c !== 'number' || !n || n <= 0) {
      return NextResponse.json(
        { error: 'Parámetros inválidos: a, b, c deben ser números y n debe ser > 0' },
        { status: 400 }
      );
    }

    // Validar que a < b < c
    if (!(a < b && b < c)) {
      return NextResponse.json(
        { error: 'Parámetros inválidos: debe cumplirse a < b < c' },
        { status: 400 }
      );
    }

    const generator = new TriangularGenerator(a, b, c, seed || 12345);
    const values = generator.generateMany(n);
    const stats = calculateStatistics(values);
    const histogram = createHistogram(values, Math.ceil(Math.sqrt(n)));
    const theoreticalMean = generator.theoreticalMean();

    return NextResponse.json({
      values, // Todos los valores
      statistics: stats,
      theoreticalMean,
      histogram,
      parameters: { a, b, c },
    });
  } catch (error) {
    console.error('Error en triangular:', error);
    return NextResponse.json(
      { error: 'Error en la simulación: ' + String(error) },
      { status: 500 }
    );
  }
}
