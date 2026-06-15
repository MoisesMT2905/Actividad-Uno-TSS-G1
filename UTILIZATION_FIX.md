# Fix: Utilización del Equipo (Programa 4 - Almacén)

## Problema Identificado
El cálculo de utilización del equipo en el Programa 4 (Almacén y Camiones) retornaba valores imposibles (>100%), como se vio en la screenshot (157.8%).

## Raíz del Problema
En `lib/simulators/index.ts`, línea 307, el cálculo era:
```typescript
const utilizationRate = equipmentFreeTime > 0 ? (equipmentFreeTime / durationMinutes) * 100 : 0;
```

Esto dividía `equipmentFreeTime` (el tiempo cuando el equipo se libera = momento final) entre la duración total. Ejemplo:
- equipmentFreeTime = 756 minutos (fin del último trabajo)
- durationMinutes = 480 minutos
- Cálculo erróneo: (756/480) * 100 = 157.5%

## Solución Implementada
Se agregó un nuevo variable `totalBusyTime` que acumula el tiempo real que el equipo está ocupado:

1. **Línea 247**: Se agregó `let totalBusyTime = 0;`

2. **Líneas 274-277**: Se calcula el tiempo ocupado para cada operación:
```typescript
const actualUnloadEnd = Math.min(unloadEnd, durationMinutes);
const busyDuration = Math.max(0, actualUnloadEnd - unloadStart);
totalBusyTime += busyDuration;
```

3. **Línea 313**: El cálculo ahora es correcto:
```typescript
const utilizationRate = durationMinutes > 0 ? (totalBusyTime / durationMinutes) * 100 : 0;
```

## Resultado
- Utilización siempre estará entre 0-100%
- Refleja el porcentaje real de tiempo que el equipo está descargando camiones
- Valores típicos: 50-95% (dependiendo de llegadas de camiones y número de trabajadores)

## Cambios de Archivo
- `lib/simulators/index.ts`: Función `simulate()` de la clase `WarehouseSimulator`

## Validación
- Los mismos parámetros de entrada ahora deben dar resultados consistentes
- La utilización ahora tendrá sentido económico
- Las diferencias entre escenarios (3 vs 5 trabajadores) serán más claras
