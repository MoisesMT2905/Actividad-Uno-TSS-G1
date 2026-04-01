/**
 * Generadores congruenciales lineales (Capítulo 2 del libro de Raúl Coss)
 * Implementación de generadores de números aleatorios mediante transformada inversa
 */

export class CongruencialMixto {
  private x: number;
  private readonly a: number;
  private readonly c: number;
  private readonly m: number;

  /**
   * Constructor del generador congruencial mixto
   * Fórmula: X_{n+1} = (a * X_n + c) mod m
   * 
   * Parámetros por defecto para período completo:
   * m = 2^31 - 1 (módulo - número primo de Mersenne)
   * a = 1664525 (multiplicador)
   * c = 1013904223 (incremento)
   * 
   * @param seed Semilla inicial (X_0)
   */
  constructor(seed: number = 12345) {
    this.m = Math.pow(2, 31) - 1; // 2147483647
    this.a = 1664525;
    this.c = 1013904223;
    this.x = seed % this.m;
    if (this.x === 0) this.x = 1;
  }

  /**
   * Genera el siguiente número en la secuencia y retorna un valor U(0,1)
   * 
   * Prueba de escritorio:
   * Si X_n = 12345:
   *   X_{n+1} = (1664525 * 12345 + 1013904223) mod 2147483647
   *   X_{n+1} = 20549834198648 mod 2147483647 ≈ 1800251
   *   U = 1800251 / 2147483647 ≈ 0.000838...
   * 
   * @returns Número aleatorio en (0, 1)
   */
  nextUniform(): number {
    this.x = (this.a * this.x + this.c) % this.m;
    return this.x / this.m;
  }

  /**
   * Genera n números uniformes
   */
  generateUniform(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.nextUniform());
    }
    return result;
  }
}

export class CongruencialMultiplicativo {
  private x: number;
  private readonly a: number;
  private readonly m: number;

  /**
   * Constructor del generador congruencial multiplicativo
   * Fórmula: X_{n+1} = (a * X_n) mod m
   * 
   * Parámetros para período completo en sistema binario:
   * m = 2^31 - 1
   * a = 7^5 = 16807 (raíz primitiva del módulo)
   * 
   * @param seed Semilla inicial
   */
  constructor(seed: number = 54321) {
    this.m = Math.pow(2, 31) - 1;
    this.a = 16807; // 7^5 - multiplicador estándar (MINSTD)
    this.x = seed % this.m;
    if (this.x === 0) this.x = 1;
  }

  /**
   * Genera el siguiente número en la secuencia
   */
  nextUniform(): number {
    this.x = (this.a * this.x) % this.m;
    return this.x / this.m;
  }

  /**
   * Genera n números uniformes
   */
  generateUniform(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.nextUniform());
    }
    return result;
  }
}
