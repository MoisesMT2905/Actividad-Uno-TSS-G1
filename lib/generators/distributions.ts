/**
 * Generadores de distribuciones mediante transformada inversa
 * Basado en Capítulo 4: "Transformada Inversa" del libro de Raúl Coss
 */

import { CongruencialMixto } from './congruencial';

/**
 * PROGRAMA 1: Distribución Triangular Paramétrica
 * f(x) = 2(x-a)/((b-a)(c-a)) para a ≤ x ≤ b
 * f(x) = 2(c-x)/((c-b)(c-a)) para b ≤ x ≤ c
 */
export class TriangularGenerator {
  private rng: CongruencialMixto;
  private a: number;
  private b: number;
  private c: number;
  private p: number; // (b-a)/(c-a)

  constructor(a: number, b: number, c: number, seed: number = 12345) {
    if (!(a < b && b < c)) {
      throw new Error('Se requiere a < b < c para la distribución triangular');
    }
    this.a = a;
    this.b = b;
    this.c = c;
    this.p = (b - a) / (c - a);
    this.rng = new CongruencialMixto(seed);
  }

  /**
   * Genera un valor de la distribución triangular
   * 
   * Algoritmo (transformada inversa):
   * 1. Generar R ~ U(0,1)
   * 2. Calcular p = (b-a)/(c-a)
   * 3. Si R ≤ p: x = a + sqrt(R*(b-a)*(c-a))
   * 4. Si R > p: x = c - sqrt((1-R)*(c-b)*(c-a))
   * 
   * Prueba de escritorio (a=0, b=5, c=10):
   * p = 5/10 = 0.5
   * Para R = 0.3 (R ≤ 0.5):
   *   x = 0 + sqrt(0.3 * 5 * 10) = sqrt(15) ≈ 3.873
   * Para R = 0.8 (R > 0.5):
   *   x = 10 - sqrt((1-0.8) * 5 * 10) = 10 - sqrt(10) ≈ 6.838
   */
  generate(): number {
    const R = this.rng.nextUniform();
    if (R <= this.p) {
      return this.a + Math.sqrt(R * (this.b - this.a) * (this.c - this.a));
    } else {
      return this.c - Math.sqrt((1 - R) * (this.c - this.b) * (this.c - this.a));
    }
  }

  /**
   * Genera n valores
   */
  generateMany(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.generate());
    }
    return result;
  }

  /**
   * Calcula la media teórica: (a+b+c)/3
   */
  theoreticalMean(): number {
    return (this.a + this.b + this.c) / 3;
  }
}

/**
 * PROGRAMA 2: Distribución Cúbica
 * f(x) = (x-3)²/18 para 0 ≤ x ≤ 6
 * F(x) = (x³ - 9x² + 27x) / 54
 * F⁻¹(R) = 3 + ∛(54R - 27)
 */
export class CubicGenerator {
  private rng: CongruencialMixto;

  constructor(seed: number = 12345) {
    this.rng = new CongruencialMixto(seed);
  }

  /**
   * Genera un valor de la distribución cúbica
   * 
   * Algoritmo (transformada inversa):
   * 1. Generar R ~ U(0,1)
   * 2. Calcular x = 3 + ∛(54R - 27)
   * 3. Devolver x
   * 
   * Prueba de escritorio:
   * Para R = 0.5:
   *   x = 3 + ∛(54*0.5 - 27) = 3 + ∛(0) = 3
   * Para R = 1:
   *   x = 3 + ∛(54*1 - 27) = 3 + ∛(27) = 3 + 3 = 6
   */
  generate(): number {
    const R = this.rng.nextUniform();
    const cubeRoot = Math.cbrt(54 * R - 27);
    return 3 + cubeRoot;
  }

  /**
   * Genera n valores
   */
  generateMany(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.generate());
    }
    return result;
  }

  /**
   * Media teórica: 3
   */
  theoreticalMean(): number {
    return 3;
  }
}

/**
 * Distribución Empírica (usada en Máquinas y Almacén)
 */
export interface EmpiricInterval {
  limInf: number;
  limSup: number;
  probability: number;
  cumProbability?: number;
}

export class EmpiricDistribution {
  private intervals: EmpiricInterval[];
  private cumProbabilities: number[];

  constructor(intervals: EmpiricInterval[]) {
    this.intervals = [...intervals];
    // Calcular probabilidades acumuladas
    this.cumProbabilities = [];
    let cum = 0;
    for (const interval of this.intervals) {
      cum += interval.probability;
      this.cumProbabilities.push(cum);
      interval.cumProbability = cum;
    }
  }

  /**
   * Genera un valor usando transformada inversa para distribución empírica
   * Busca el intervalo y luego interpola linealmente dentro
   */
  generate(R: number): number {
    // Encontrar el intervalo usando búsqueda binaria
    let index = 0;
    for (let i = 0; i < this.cumProbabilities.length; i++) {
      if (R <= this.cumProbabilities[i]) {
        index = i;
        break;
      }
    }

    const interval = this.intervals[index];
    const prevCum = index > 0 ? this.cumProbabilities[index - 1] : 0;
    
    // Interpolación lineal dentro del intervalo
    const rangeWidth = interval.limSup - interval.limInf;
    const relativeR = (R - prevCum) / interval.probability;
    
    return interval.limInf + rangeWidth * relativeR;
  }

  getIntervals(): EmpiricInterval[] {
    return this.intervals;
  }
}
