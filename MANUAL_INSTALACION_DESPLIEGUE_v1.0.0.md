# Manual de Instalación y Despliegue del Sistema TSS (v1.0.0)

**Documento de Referencia**: ISO/IEC/IEEE 15289:2019  
**Versión del Manual**: 1.0.0  
**Fecha de Creación**: 11 de junio de 2026  
**Última Revisión**: 11 de junio de 2026  
**Clasificación**: Documentación Técnica de Despliegue  

---

## 1. Introducción

Este manual proporciona los procedimientos técnicos necesarios para instalar, configurar y desplegar el **Sistema de Simulación de Sistemas (TSS)** en entornos de desarrollo local y producción en la nube. El documento está estructurado para guiar a especialistas en DevOps e Ingenieros de Sistemas a través de cada fase del despliegue.

### 1.1 Alcance

- Instalación en máquinas locales con entorno de desarrollo
- Configuración de dependencias del sistema
- Compilación y ejecución en modo desarrollo
- Generación de artefactos de producción
- Pruebas de verificación funcional
- Despliegue en plataforma Vercel

### 1.2 Audiencia

- Ingenieros DevOps Senior
- Administradores de Sistemas
- Desarrolladores Full-Stack
- Especialistas en Despliegue en Nube

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Hardware Mínimos

| Componente | Especificación Mínima | Recomendado |
|------------|----------------------|-------------|
| Procesador | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| Memoria RAM | 8 GB | 16 GB |
| Espacio en Disco | 5 GB libres | 10 GB libres |
| Velocidad Internet | 10 Mbps | 50 Mbps |

### 2.2 Requisitos de Software

#### Node.js y npm
- **Node.js LTS**: v18.x o v20.x (Recomendado v20.x)
- **npm**: v10.x o superior
- **Verificación**: Ejecutar `node --version` y `npm --version`

#### TypeScript Compiler
- **Versión**: 5.x (Actualmente 5.7.3 en el proyecto)
- **Instalación**: Incluida en `devDependencies` del proyecto

#### Git CLI
- **Versión**: 2.40 o superior
- **Verificación**: Ejecutar `git --version`

#### Navegadores Web Modernos
- Google Chrome 120+
- Mozilla Firefox 121+
- Microsoft Edge 120+
- Safari 17+ (macOS)

#### Herramientas Recomendadas
- Visual Studio Code con extensión TypeScript
- Postman o Thunder Client (para pruebas de API)
- Terminal Bash (Linux/macOS) o PowerShell/WSL (Windows)

### 2.3 Variables de Entorno Requeridas

| Variable | Descripción | Valor por Defecto | Obligatoria |
|----------|-------------|-------------------|------------|
| `PORT` | Puerto de ejecución del backend | `3000` | Sí |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3000` | Sí |
| `NODE_ENV` | Ambiente de ejecución | `development` | No |

---

## 3. Arquitectura de Despliegue

### 3.1 Topología General

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema TSS (v1.0.0)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌──────────────────────┐     │
│  │   FRONTEND       │          │     BACKEND          │     │
│  │  React + TS      │◄────────►│  Node.js + Express   │     │
│  │  Puerto: 3000    │          │   API Routes         │     │
│  │  (dev mode)      │          │                      │     │
│  └──────────────────┘          └──────────────────────┘     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    PRODUCCIÓN (Vercel)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Vercel Edge Network (CDN Global)                     │  │
│  │  ├─ Frontend (Next.js SSG/SSR)                        │  │
│  │  ├─ API Routes (Serverless Functions)                │  │
│  │  └─ Static Assets                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estructura de Carpetas

```
Actividad-Uno-TSS-G1/
├── /app                          # Rutas y componentes Next.js
│   ├── /api/simulate/            # Endpoints de simulación
│   │   ├── triangular/route.ts
│   │   ├── cubic/route.ts
│   │   ├── machines/route.ts
│   │   └── warehouse/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── /components                   # Componentes React + Radix UI
│   ├── /programs/
│   │   ├── TriangularProgram.tsx
│   │   ├── CubicProgram.tsx
│   │   ├── MachinesProgram.tsx
│   │   └── WarehouseProgram.tsx
│   └── /ui/                      # Componentes shadcn (Radix + Tailwind)
│
├── /lib                          # Lógica de negocio
│   ├── /generators/
│   │   ├── congruencial.ts
│   │   └── distributions.ts
│   ├── /simulators/
│   │   └── index.ts
│   └── /utils/
│       ├── statistics.ts
│       └── excel-export.ts
│
├── /public                       # Assets estáticos
│   └── [imágenes, iconos]
│
├── package.json                  # Definición de dependencias
├── tsconfig.json                 # Configuración TypeScript
├── next.config.ts                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind CSS
├── .env.local                    # Variables de entorno (local)
├── .env.production               # Variables de entorno (producción)
├── .gitignore
└── README.md
```

### 3.3 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Lenguaje** | TypeScript | 5.7.3 |
| **Runtime Servidor** | Node.js | 20 LTS |
| **Framework Frontend** | React | 19.2.4 |
| **Framework Fullstack** | Next.js | 16.2.0 |
| **Gestión de Paquetes** | npm | 10.x+ |
| **Estilos** | Tailwind CSS | 4.2.0 |
| **Componentes UI** | Radix UI / shadcn | Latest |
| **Gráficos** | Recharts | 2.15.0 |
| **Formularios** | React Hook Form | 7.54.1 |
| **Validación** | Zod | 3.24.1 |

---

## 4. Instrucciones de Instalación Local Paso a Paso

### 4.1 Clonar el Repositorio

Obtener el código fuente desde el repositorio oficial de GitHub:

```bash
# Navegar al directorio de trabajo
cd ~/projects

# Clonar el repositorio
git clone https://github.com/MoisesMT2905/Actividad-Uno-TSS-G1.git

# Acceder al directorio del proyecto
cd Actividad-Uno-TSS-G1

# Verificar rama actual
git branch --show-current
```

**Esperado**: Rama `main` activa  
**Salida esperada**:
```
main
```

### 4.2 Verificar Requisitos Previos

Ejecutar diagnóstico de dependencias del sistema:

```bash
# Verificar versión de Node.js
node --version

# Verificar versión de npm
npm --version

# Verificar versión de Git
git --version

# Verificar TypeScript (opcional, se instala con npm install)
npx tsc --version
```

**Salida esperada**:
```
v20.12.0 (o superior 18.x)
10.5.0 (o superior 10.x)
git version 2.45.0
Version 5.7.3
```

### 4.3 Instalar Dependencias

Descargar e instalar todas las dependencias del proyecto:

```bash
# Instalar dependencias usando npm
npm install

# Limpiar caché de npm (si hay errores previos)
npm ci

# Verificar árbol de dependencias
npm list --depth=0
```

**Duración esperada**: 3-5 minutos según velocidad de conexión  
**Carpeta creada**: `/node_modules` (≈600 MB)  
**Archivos generados**:
- `package-lock.json` (actualizado)

### 4.4 Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Crear archivo de configuración
touch .env.local

# Editar con editor de texto
nano .env.local
```

Agregar las siguientes variables:

```bash
# Puerto de ejecución del servidor Next.js
PORT=3000

# URL del frontend para configuración CORS y redirecciones
FRONTEND_URL=http://localhost:3000

# Ambiente de ejecución
NODE_ENV=development
```

**Guardar archivo**: `Ctrl+O` → Enter → `Ctrl+X`

Verificar que el archivo existe:

```bash
# Listar archivo
ls -la .env.local

# Verificar contenido
cat .env.local
```

### 4.5 Verificar la Instalación

Validar que la estructura del proyecto es correcta:

```bash
# Verificar directorios principales
ls -la | grep -E "^d"

# Contar archivos en node_modules
ls node_modules | wc -l

# Verificar package.json
cat package.json | grep -A 5 "\"scripts\""
```

**Archivos/Carpetas esperados**:
- ✅ `/app`
- ✅ `/components`
- ✅ `/lib`
- ✅ `/public`
- ✅ `/node_modules`
- ✅ `package.json`
- ✅ `.env.local`
- ✅ `tsconfig.json`

---

## 5. Compilación y Ejecución

### 5.1 Modo Desarrollo (Hot Reload)

Ejecutar el servidor con recarga automática ante cambios en el código:

```bash
# Iniciar servidor de desarrollo
npm run dev

# Comando alternativo explícito
npx next dev
```

**Salida esperada**:
```
  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

**Acceso**: Abrir navegador en `http://localhost:3000`

**Características**:
- Recompilación automática al guardar archivos
- Hot Module Replacement (HMR) activo
- Acceso a consola de navegador para depuración
- Logs en terminal en tiempo real

### 5.2 Compilación para Producción

Generar artefactos optimizados de compilación:

```bash
# Compilar proyecto completo
npm run build

# Comando alternativo explícito
npx next build
```

**Duración esperada**: 1-3 minutos  
**Salida esperada**:
```
  ▲ Next.js 16.2.0

  Creating an optimized production build ...
  ✓ Compiled successfully
  ✓ Linting
  ✓ Collecting page data
  ✓ Generating static pages (7/7)
  ✓ Finalizing page optimization

Route (pages)                              Size      First Load JS
┌ ○ /                                      185 B        85.4 kB
├ ○ /_app                                  -             85.3 kB
├ ○ /404                                   182 B        85.2 kB
└ ○ /api/simulate/[...route]               -             -

Generated in 45s.
```

**Artefactos generados**:
- `/.next` → Código compilado y optimizado
- `.next/static` → Assets estáticos versionados
- `.next/server` → Funciones serverless

### 5.3 Ejecutar Compilación en Producción Localmente

Validar el artefacto compilado en entorno similar a producción:

```bash
# Iniciar servidor con compilación de producción
npm start

# Comando alternativo explícito
npx next start
```

**Salida esperada**:
```
> my-project@0.1.0 start
> next start

  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
```

**Diferencias respecto a `npm run dev`**:
- ✅ Rendimiento optimizado
- ✅ Sin Hot Reload
- ✅ Sin logs de compilación
- ✅ Acceso a rutas de producción

### 5.4 Validar Compilación de TypeScript

Ejecutar análisis estático sin compilar:

```bash
# Verificar errores de tipo
npx tsc --noEmit

# Generar reporte de tipos
npx tsc --listFiles > typescript-report.txt
```

**Salida esperada**:
```
(sin errores = éxito)
```

---

## 6. Pruebas de Verificación

### 6.1 Smoke Tests del Backend

Verificar que el servidor respondee correctamente:

#### 6.1.1 Endpoint de Salud

```bash
# Realizar llamada al endpoint de salud
curl -i http://localhost:3000/api/simulate/health

# Con salida JSON formateada
curl -s http://localhost:3000/api/simulate/health | jq '.'
```

**Salida esperada**:
```json
{
  "status": "ok",
  "timestamp": "2026-06-11T14:30:45.123Z",
  "version": "1.0.0",
  "environment": "development"
}
```

**Alternativa con Postman**:
1. Abrir Postman
2. Método: `GET`
3. URL: `http://localhost:3000/api/simulate/health`
4. Click "Send"
5. Validar Status Code: `200 OK`

#### 6.1.2 Endpoint de Simulación Triangular

```bash
# Realizar simulación triangular
curl -X POST http://localhost:3000/api/simulate/triangular \
  -H "Content-Type: application/json" \
  -d '{
    "a": 0,
    "b": 5,
    "c": 10,
    "samples": 100,
    "seed": 12345
  }' | jq '.'
```

**Salida esperada**:
```json
{
  "mean": 5.02,
  "variance": 8.45,
  "min": 0.12,
  "max": 9.87,
  "data": [1.23, 4.56, 7.89, ...],
  "executionTime": 45
}
```

### 6.2 Smoke Tests del Frontend

Validar la interfaz en navegador:

#### 6.2.1 Cargar Página Principal

```bash
# Abrir navegador automáticamente (Linux/macOS)
open http://localhost:3000

# O manualmente en navegador:
# Dirección: http://localhost:3000
```

**Validación visual**:
- ✅ Página carga sin errores
- ✅ Título "Sistema de Simulación de Sistemas - UMSS" visible
- ✅ Tabs de programas presentes: Triangular, Cúbica, Máquinas, Almacén
- ✅ Botones de interacción habilitados

#### 6.2.2 Auditar Consola del Navegador

Abrir herramientas de desarrollador y verificar:

```javascript
// En consola del navegador (F12 → Console)

// Verificar ausencia de errores críticos
// Salida esperada: lista vacía o solo warnings

// Verificar carga de módulos
console.log('Frontend loaded successfully');

// Validar conexión a API
fetch('http://localhost:3000/api/simulate/health')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));
```

**Checklist de consola**:
- ✅ Sin errores de tipo `Error: ...`
- ✅ Sin errores de CORS
- ✅ Sin warnings de React StrictMode (son normales)
- ✅ API responde en red (Network tab)

#### 6.2.3 Prueba Interactiva Básica

1. **Programa Triangular**:
   - Ingresar: a=0, b=5, c=10, n=50
   - Click en "Generar"
   - Validar: gráfico y estadísticas aparecen
   - Tiempo esperado: <2 segundos

2. **Programa Cúbica**:
   - Ingresar: n=50
   - Click en "Generar"
   - Validar: histograma y media ≈ 3.0
   - Tiempo esperado: <2 segundos

### 6.3 Pruebas de Rendimiento

Medir tiempos de respuesta:

```bash
# Prueba de latencia con Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/simulate/health

# Resultado esperado: <100ms promedio

# Prueba con wrk (si está instalado)
wrk -t4 -c100 -d30s http://localhost:3000/api/simulate/health
```

**Métricas esperadas**:
- Latencia p50: <50ms
- Latencia p95: <100ms
- Latencia p99: <200ms
- Tasa de error: 0%

### 6.4 Validación de Estructura de Directorios

Verificar que la compilación generó los artefactos correctos:

```bash
# Estructura post-build
tree -L 2 .next/

# Archivos estáticos
ls -la .next/static/

# Funciones serverless
ls -la .next/server/

# Salida esperada:
# ✓ .next/static/chunks/
# ✓ .next/static/media/
# ✓ .next/server/app/
# ✓ .next/server/pages/ (si aplica)
```

---

## 7. Despliegue en la Nube (Vercel)

### 7.1 Requisitos Previos para Despliegue

#### 7.1.1 Cuenta de Vercel

1. Acceder a [https://vercel.com/signup](https://vercel.com/signup)
2. Crear cuenta con GitHub (recomendado)
3. Autorizar integración GitHub-Vercel
4. Verificar email

#### 7.1.2 Repositorio en GitHub

El código debe estar en GitHub:

```bash
# Verificar origen del repositorio
git remote -v

# Salida esperada:
# origin  https://github.com/MoisesMT2905/Actividad-Uno-TSS-G1.git (fetch)
# origin  https://github.com/MoisesMT2905/Actividad-Uno-TSS-G1.git (push)

# Si falta origin, agregarlo:
git remote add origin https://github.com/MoisesMT2905/Actividad-Uno-TSS-G1.git

# Push del código
git push -u origin main
```

### 7.2 Importar Proyecto en Vercel

#### Paso 1: Acceder a Vercel Dashboard

```
1. Visitar https://vercel.com/dashboard
2. Click en "Add New..." → "Project"
3. Selector: "Import Git Repository"
```

#### Paso 2: Seleccionar Repositorio

```
1. En "Import Git Repository", buscar:
   "Actividad-Uno-TSS-G1"
2. Validar que aparece:
   MoisesMT2905/Actividad-Uno-TSS-G1
3. Click en repositorio para seleccionar
```

#### Paso 3: Configurar Proyecto

En la pantalla de configuración, establecer:

```
Project Name:           Actividad-Uno-TSS-G1
Framework Preset:       Next.js
Root Directory:         ./ (raíz del repositorio)
Build Command:          npm run build (autodetectado)
Output Directory:       .next (autodetectado)
Install Command:        npm ci (autodetectado)
```

**Node.js Version** (Advanced Settings):
- Establecer versión: `20.x` (LTS recomendada)

#### Paso 4: Variables de Entorno

Configurar en sección "Environment Variables":

```
PORT=3000
FRONTEND_URL=https://<deployment-url>.vercel.app
NODE_ENV=production
```

**Obtener `<deployment-url>`**:
- Usar dominio por defecto: `actividad-uno-tss-g1.vercel.app`
- O dominio personalizado si lo posees

### 7.3 Ejecutar Despliegue

#### Paso 1: Iniciar Compilación

```
1. En Vercel Dashboard
2. Click en "Deploy"
3. Esperar a que comience la compilación
```

**Duración esperada**: 2-5 minutos

**Fases de compilación**:
```
✓ Cloning Git Repository
✓ Running Builds
  ✓ Running "npm ci"
  ✓ Running "npm run build"
✓ Generating Edge Config
✓ Creating Deployment
✓ Initializing Analytics
✓ Propagating to Edge Network
```

#### Paso 2: Monitorear Compilación

En la pantalla de despliegue:

```
[Compilando...]

1. Logs en tiempo real:
   - Descargar dependencias
   - Compilar TypeScript
   - Optimizar assets
   - Generar funciones serverless

2. Esperar mensaje:
   "Deployment Complete"

3. Salida esperada:
   ✓ Production Build Successful
   ✓ Ready for Production
   ✓ Visit: https://actividad-uno-tss-g1.vercel.app
```

### 7.4 Verificación Post-Despliegue

#### 7.4.1 Acceder a URL Pública

```bash
# Abrir URL en navegador
# https://actividad-uno-tss-g1.vercel.app

# O desde terminal:
curl -I https://actividad-uno-tss-g1.vercel.app

# Salida esperada:
# HTTP/2 200
# content-type: text/html
```

#### 7.4.2 Validar Endpoints de Producción

```bash
# Prueba del endpoint health
curl -s https://actividad-uno-tss-g1.vercel.app/api/simulate/health | jq '.'

# Esperado:
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0"
}
```

#### 7.4.3 Auditar Performance

En Vercel Dashboard → "Analytics":

```
Métricas esperadas:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3.5s
```

#### 7.4.4 Revisar Logs

En Vercel Dashboard → "Logs":

```
1. Logs de Función: Ver ejecución de API routes
2. Logs de Edge: Ver cálculos en CDN
3. Logs de Build: Ver detalles de compilación

Validar:
✓ Sin errores críticos
✓ Tiempos de respuesta <100ms
✓ Tasa de error: 0%
```

### 7.5 Despliegue Automático (CI/CD)

Por defecto, Vercel activa despliegues automáticos:

```
Comportamiento predeterminado:
├─ Push a main          → Despliegue a producción
├─ Pull Request         → Despliegue de preview
└─ Rama develop         → Preview branch (opcional)

Configurar en:
Vercel Dashboard → Project Settings → Git
```

### 7.6 Rollback en Caso de Error

Si hay problemas post-despliegue:

```
1. Vercel Dashboard → "Deployments"
2. Seleccionar despliegue anterior exitoso
3. Click en "..." → "Promote to Production"
4. Confirmar

Ó desde Git:

git revert HEAD
git push origin main
# Vercel detecta cambio y redeploy automático
```

---

## 8. Solución de Problemas Comunes

### 8.1 Error: "PORT already in use"

**Síntoma**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución**:

```bash
# Encontrar proceso en puerto 3000
lsof -i :3000

# Opción 1: Matar proceso
kill -9 <PID>

# Opción 2: Usar puerto diferente
PORT=3001 npm run dev

# Opción 3: Esperar 30 segundos y reintentar
sleep 30 && npm run dev
```

### 8.2 Error: "node_modules not found"

**Síntoma**:
```
Error: Cannot find module...
```

**Solución**:

```bash
# Limpiar instalación
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# O usar npm ci para reproducibilidad
npm ci
```

### 8.3 Error: "TypeScript compilation error"

**Síntoma**:
```
TypeScript error in [file]:
Type 'string' is not assignable to type 'number'.
```

**Solución**:

```bash
# Verificar tipos
npx tsc --noEmit

# Ejecutar lint
npm run lint

# Limpiar caché de TypeScript
rm -rf .next

# Recompilar
npm run build
```

### 8.4 Error: CORS en Llamadas a API

**Síntoma**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución**:

```bash
# Verificar .env.local
cat .env.local

# Debe contener:
# FRONTEND_URL=http://localhost:3000

# Reiniciar servidor
npm run dev

# Limpiar caché del navegador (Ctrl+Shift+Del)
```

### 8.5 Error: "Build fails on Vercel"

**Síntoma**:
```
Build failed with error: npm install exited with code 1
```

**Solución**:

1. Verificar `package.json` está validado:
```bash
npm ls
```

2. Revisar logs en Vercel:
   - Dashboard → Project → Deployments → Failed deployment → Logs

3. Limpiar caché de Vercel:
   - Dashboard → Settings → Git → Rebuild Project

4. Verificar variables de entorno:
   ```bash
   # En Vercel Settings → Environment Variables
   # Asegurar PORT y FRONTEND_URL están definidas
   ```

### 8.6 Rendimiento Lento en Desarrollo

**Síntoma**: `npm run dev` tarda >5 segundos en iniciar

**Solución**:

```bash
# Limpiar caché de Next.js
rm -rf .next

# Actualizar dependencias
npm update

# Aumentar memoria de Node
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# O usar servidor más ligero (si disponible)
npm run dev -- --experimental-app
```

---

## 9. Verificación de Seguridad

### 9.1 Auditoría de Dependencias

Detectar vulnerabilidades conocidas:

```bash
# Ejecutar auditoría de npm
npm audit

# Mostrar vulnerabilidades con detalles
npm audit --detailed

# Reparar automáticamente (si es posible)
npm audit fix

# Reparar con cambios de versión mayor (cuidado)
npm audit fix --force
```

**Salida esperada**:
```
up to date, audited 256 packages for vulnerabilities
0 vulnerabilities
```

### 9.2 Validar Variables de Entorno

Verificar que no hay secretos en el código:

```bash
# Buscar strings sensibles (sin .env)
grep -r "password\|secret\|api_key" --include="*.ts" --include="*.tsx" app/ lib/

# Salida esperada: (sin coincidencias)
```

### 9.3 Verificar .gitignore

Asegurar que archivos sensibles no se commitean:

```bash
# Revisar .gitignore
cat .gitignore

# Debe incluir:
.env.local
.env.*.local
node_modules/
.next/
dist/
build/
```

---

## 10. Mantenimiento y Actualizaciones

### 10.1 Actualizar Dependencias

Mantener paquetes actualizados:

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (compatible)
npm update

# Actualizar a versión major (breaking changes posibles)
npm install -g npm-check-updates
ncu -u
npm install
```

### 10.2 Regenerar package-lock.json

Después de cambios manuales en package.json:

```bash
# Actualizar lock file
npm install

# O reproducir exactamente
npm ci
```

### 10.3 Monitoreo en Vercel

Configurar alertas:

```
1. Vercel Dashboard → Monitoring
2. Habilitar:
   ✓ Email notifications
   ✓ Build failure alerts
   ✓ High error rate alerts
3. Establecer umbrales de CPU/Memory
```

---

## 11. Figuras Requeridas

### Figura 5. Estructura de directorios y organización del código fuente en el entorno de desarrollo local

**Instrucción para capturar**:

Ejecutar el siguiente comando en la terminal y capturar el árbol de directorios:

```bash
tree -L 3 -I 'node_modules|.next' Actividad-Uno-TSS-G1/
```

O en VS Code:
1. Abrir la carpeta del proyecto en VS Code
2. Vista: Explorador (Ctrl+Shift+E)
3. Expandir carpetas: `/app`, `/components`, `/lib`, `/public`
4. Captura de pantalla: Mostrar estructura completa del sidebar

**Aspecto esperado**:
```
├── /app
│   ├── /api/simulate/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── /components
│   ├── /programs/
│   └── /ui/
├── /lib
│   ├── /generators/
│   ├── /simulators/
│   └── /utils/
├── /public
├── package.json
├── tsconfig.json
└── .env.local
```

---

### Figura 6. Consola de comandos ejecutando la inicialización en caliente de los servidores backend y frontend de forma simultánea

**Instrucción para capturar**:

Ejecutar en terminal:

```bash
npm run dev
```

Capturar la salida completa mostrando:
- ✓ Compilación completada
- ✓ URLs locales: `http://localhost:3000`
- ✓ Mensaje "Ready in X.Xs"

**Aspecto esperado**:
```
  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

**Alternativa**: Captura de VS Code con terminal integrada mostrando ambos servidores iniciados.

---

### Figura 7. Panel de control del entorno de Vercel mostrando el estado exitoso de la compilación y la URL pública de producción

**Instrucción para capturar**:

1. Acceder a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleccionar proyecto "Actividad-Uno-TSS-G1"
3. Ir a pestaña "Deployments"
4. Buscar despliegue más reciente con estado "✓ Production"
5. Captura de pantalla mostrando:
   - Estado: "✓ Ready" o "✓ Production"
   - URL pública: `https://actividad-uno-tss-g1.vercel.app`
   - Timestamp de despliegue
   - Rama: "main"
   - Duraciones: Build, Install, Total

**Aspecto esperado**:
```
Production Deployment

Status:    ✓ Ready
URL:       https://actividad-uno-tss-g1.vercel.app
Branch:    main
Commit:    abc1234...
Build:     2m 15s
```

---

## 12. Referencia Rápida de Comandos

### Desarrollo

```bash
# Iniciar en modo desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Ejecutar compilación en local
npm start

# Linting y análisis de código
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

### Dependencias

```bash
# Instalar dependencias
npm install

# Instalar reproducible (CI)
npm ci

# Ver árbol de dependencias
npm list --depth=0

# Auditar seguridad
npm audit

# Actualizar dependencias
npm update
```

### Debugging

```bash
# Ver logs en tiempo real (dev)
npm run dev

# Inspeccionar en puerto 9229
node --inspect-brk ./node_modules/.bin/next dev

# Análisis de bundle
npx next/bundle-analyzer npm run build
```

### Git & Despliegue

```bash
# Ver estado del repositorio
git status

# Hacer commit
git add .
git commit -m "Mensaje descriptivo"

# Push a GitHub (triggea Vercel)
git push origin main

# Ver historial de despliegues (Vercel)
vercel logs
```

---

## 13. Anexo: Checklist de Despliegue Exitoso

Validar antes de considerar despliegue completo:

```
FASE LOCAL:
☐ Node.js v20 LTS instalado
☐ npm v10+ instalado
☐ Repositorio clonado correctamente
☐ npm install ejecutado sin errores
☐ .env.local configurado con PORT y FRONTEND_URL
☐ npm run dev inicia sin errores
☐ Navegador accede a http://localhost:3000
☐ Sin errores en consola del navegador
☐ Endpoint /api/simulate/health responde 200
☐ Pruebas interactivas (Triangular, Cúbica) funcionan
☐ npm run build compilado exitosamente

FASE VERCEL:
☐ Cuenta Vercel creada y verificada
☐ Repositorio GitHub actualizado con push
☐ Proyecto importado en Vercel
☐ Variables de entorno configuradas
☐ Primer despliegue completado
☐ URL pública accesible
☐ Página carga sin errores 404
☐ API responde desde dominio de producción
☐ Performance dentro de thresholds (<2.5s LCP)
☐ Logs sin errores críticos

SEGURIDAD:
☐ npm audit sin vulnerabilidades críticas
☐ .gitignore incluye .env.local y node_modules
☐ Variables sensibles NO están en código
☐ CORS configurado correctamente
```

---

## 14. Conclusión

Este manual proporciona los procedimientos necesarios para instalar, compilar y desplegar exitosamente el **Sistema de Simulación de Sistemas TSS v1.0.0** en entornos locales y cloud.

Siguiendo los pasos descritos:
1. ✅ Se establece un entorno de desarrollo reproducible
2. ✅ Se valida la compilación y funcionamiento local
3. ✅ Se despliega en infraestructura global de Vercel
4. ✅ Se garantiza continuidad de integración con cada push a GitHub

### Soporte y Contacto

**Docente Responsable**: Ing. Henrry Frank Villarroel Tapia  
**Estudiante**: Moisés Mamani Tito  
**Período Académico**: Abril 2026  
**Universidad**: Universidad Mayor de San Simón (UMSS)  
**Carrera**: Ingeniería de Sistemas  

---

**Documento Versión**: 1.0.0  
**Fecha de Última Revisión**: 11 de junio de 2026  
**Cumplimiento Normativo**: ISO/IEC/IEEE 15289:2019  
**Estado**: Aprobado para Uso