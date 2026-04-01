# 🎲 Sistema de Simulación de Sistemas - UMSS

Aplicación web interactiva para simulación y análisis de sistemas basada en los conceptos del libro "Simulación: Un enfoque práctico" de Raúl Coss Bu.

## 📋 Descripción

Este proyecto implementa cuatro programas de simulación completos con interfaz web moderna:

### Programa 1: Distribución Triangular Paramétrica
- **Modelo**: Distribución triangular continua con parámetros a, b, c
- **Método**: Transformada inversa
- **Fórmula**: f(x) = 2(x-a)/((b-a)(c-a)) para a ≤ x ≤ b
- **Aplicación**: Generación de variables aleatorias con distribución triangular

### Programa 2: Distribución Cúbica
- **Modelo**: Distribución cúbica f(x) = (x-3)²/18, 0 ≤ x ≤ 6
- **Método**: Transformada inversa F⁻¹(R) = 3 + ∛(54R - 27)
- **Aplicación**: Generación de variables con comportamiento no uniforme

### Programa 3: Máquinas y Mecánico
- **Modelo**: Sistema de colas con fuente finita (n máquinas)
- **Distribuciones**: Empíricas para tiempos de falla y reparación
- **Análisis**: Promedio de máquinas descompuestas, costos operacionales
- **Evento-discreto**: Simulación basada en eventos FAILURE y REPAIR_END

### Programa 4: Almacén y Camiones
- **Modelo**: Sistema M/U/1 (colas con llegadas Poisson y servicio uniforme)
- **Parámetros**: λ = 2 camiones/hora (media 30 min entre llegadas)
- **Servicio**: Tiempo de descarga uniforme según número de trabajadores
- **Análisis**: Tiempos de espera, utilización del equipo, costos

## 🚀 Características

✅ **Backend robusto** con generadores congruenciales y transformada inversa
✅ **Interfaz interactiva** con gráficos en tiempo real
✅ **Análisis estadístico** completo de cada simulación
✅ **Exportación a CSV** de datos y resultados
✅ **Múltiples parámetros configurables** para cada programa
✅ **Reproducibilidad** mediante semillas personalizables
✅ **Documentación técnica** sobre los modelos teóricos

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Backend**: Next.js 16 API Routes + TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Gráficos**: Recharts
- **Generadores**: Congruencial Mixto y Multiplicativo (Capítulo 2 del libro)
- **Métodos**: Transformada Inversa (Capítulo 4 del libro)

## 📦 Instalación y Despliegue

### Opción 1: Despliegue Local

```bash
# Clonar o descargar el proyecto
git clone <repository-url>
cd simulacion-sistemas

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# La aplicación estará en http://localhost:3000
```

### Opción 2: Despliegue en Vercel (Recomendado)

1. **Conectar repositorio**:
   - Push a GitHub
   - Conectar proyecto a Vercel (https://vercel.com/dashboard)

2. **Configuración automática**:
   ```
   Framework: Next.js
   Root Directory: ./
   ```

3. **Deploy**:
   ```bash
   vercel deploy
   ```

### Opción 3: Docker (opcional)

```bash
docker build -t simulacion-sistemas .
docker run -p 3000:3000 simulacion-sistemas
```

## 📊 Estructura del Proyecto

```
simulacion-sistemas/
├── app/
│   ├── page.tsx                 # Página principal con tabs
│   ├── layout.tsx               # Layout global
│   └── api/
│       └── simulate/
│           ├── triangular/route.ts
│           ├── cubic/route.ts
│           ├── machines/route.ts
│           └── warehouse/route.ts
├── components/
│   ├── programs/
│   │   ├── TriangularProgram.tsx
│   │   ├── CubicProgram.tsx
│   │   ├── MachinesProgram.tsx
│   │   └── WarehouseProgram.tsx
│   └── ui/                      # Componentes shadcn
├── lib/
│   ├── generators/
│   │   ├── congruencial.ts      # RNG de Capítulo 2
│   │   └── distributions.ts     # Transformada inversa
│   ├── simulators/
│   │   └── index.ts             # Máquinas y Almacén
│   └── utils/
│       ├── statistics.ts        # Análisis estadístico
│       └── excel-export.ts      # Exportación
└── public/                      # Assets estáticos
```

## 🔬 Modelos Teóricos

### Generadores Congruenciales (Capítulo 2)

#### Congruencial Mixto:
```
X_{n+1} = (a * X_n + c) mod m
Parámetros: m = 2^31 - 1, a = 1664525, c = 1013904223
Período: Completo para valores apropiados
```

#### Congruencial Multiplicativo:
```
X_{n+1} = (a * X_n) mod m
Parámetros: m = 2^31 - 1, a = 16807 (MINSTD)
```

### Transformada Inversa (Capítulo 4)

**Algoritmo general:**
1. Generar R ~ U(0,1) mediante RNG
2. Calcular x = F⁻¹(R)
3. Devolver x

**Para Triangular:**
- Si R ≤ p: x = a + √(R(b-a)(c-a))
- Si R > p: x = c - √((1-R)(c-b)(c-a))
- Donde p = (b-a)/(c-a)

**Para Cúbica:**
- x = 3 + ∛(54R - 27)

### Simulación de Eventos Discretos (Capítulo 5)

**Máquinas y Mecánico:**
- Eventos: FALLA (máquina se daña), FIN_REPARACIÓN
- Métrica: Área bajo la curva de máquinas descompuestas
- Costo: 500 * máq_prom_descompuestas + 50/n

**Almacén:**
- Eventos: LLEGADA (camión llega), FIN_DESCARGA (equipo libre)
- Distribuciones: Exponencial para llegadas, Uniforme para servicio
- Costo: Salarios + Costo de Espera

## 📈 Uso de la Aplicación

### 1. Programa Triangular
1. Ingresar parámetros a, b, c
2. Establecer número de muestras (n)
3. (Opcional) Cambiar semilla para reproducibilidad
4. Click en "Generar"
5. Visualizar histograma y estadísticas
6. Exportar a CSV si es necesario

### 2. Programa Cúbica
- Similar al programa triangular pero solo requiere n y semilla
- Media teórica = 3

### 3. Máquinas y Mecánico
1. Ingresar número de máquinas
2. Establecer duración de simulación (horas)
3. Click en "Simular"
4. Analizar tabla de eventos y gráficos de máquinas descompuestas
5. Revisar costo total por hora

### 4. Almacén y Camiones
1. Seleccionar número de trabajadores (3-6)
2. Duración de turno (minutos)
3. Click en "Simular"
4. Visualizar evolución de cola y desglose de costos
5. Comparar diferentes configuraciones

## 📐 Ejemplos de Prueba

### Triangular (a=0, b=5, c=10, n=1000)
- Media teórica: (0+5+10)/3 = 5
- Rango esperado: [0, 10]

### Cúbica (n=1000)
- Media teórica: 3
- Rango esperado: [0, 6]
- Distribución asimétrica centrada en 3

### Máquinas (5 máquinas, 480 horas)
- Esperar 5-10 fallas simuladas por máquina
- Costo total entre $100-200/hora típicamente

### Almacén (4 trabajadores, 480 minutos)
- ~16 camiones atendidos típicamente
- Tiempo espera promedio 5-15 minutos
- Costo total ~$1000

## 🔍 Validación con Excel

Se incluyeron archivos JSON con simulaciones manuales en Excel como referencia:
- `tableConvert.com_kvet6c.json` - Máquinas (datos entrada)
- `tableConvert.com_wtfiel.json` - Máquinas (eventos)
- `tableConvert.com_0i9z58.json` - Almacén (principales)
- `tableConvert.com_g6qvio.json` - Distribución Triangular

Comparar resultados del programa con estos datos para validar implementación.

## 📚 Referencias

- **Libro Base**: "Simulación: Un enfoque práctico" - Raúl Coss Bu
- **Capítulo 2**: Generadores congruenciales
- **Capítulo 4**: Transformada inversa
- **Capítulo 5**: Simulación de eventos discretos

## 🎓 Información Académica

**Universidad**: Universidad Mayor de San Simón (UMSS)
**Carrera**: Ingeniería de Sistemas
**Materia**: Taller de Simulación de Sistemas (G1)
**Actividad**: 1
**Docente**: Ing. Henrry Frank Villarroel Tapia
**Estudiante**: Moisés Mamani Tito
**Período**: Abril 2026

## 📝 Licencia

Proyecto académico para propósitos educativos.

## 🤝 Soporte

Para reportar errores o sugerencias, contactar al docente o crear un issue en el repositorio.

---

**Última actualización**: Abril 2026
