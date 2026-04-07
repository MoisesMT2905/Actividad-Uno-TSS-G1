# Mejoras XLSX y Visualización Completa de Datos

## Resumen Ejecutivo

Se han implementado las siguientes mejoras a la versión anterior:

1. **Visualización de TODOS los datos** en las tablas (sin límites)
2. **Exportación a Excel XLSX** (no CSV) con nombres en español
3. **Estructura de dos hojas** en cada exportación: "Datos"/"Eventos" + "Estadísticas"/"Resumen"
4. **Scroll vertical** en tablas para manejar grandes volúmenes de datos

## Cambios Técnicos

### Nuevos Archivos
- `lib/utils/xlsx-export.ts` - Utilidad profesional para exportación XLSX con:
  - `exportTriangularToXLSX()` - 3 hojas (Datos, Estadísticas, Histograma)
  - `exportCubicToXLSX()` - 3 hojas (Datos, Estadísticas, Histograma)
  - `exportMachinesToXLSX()` - 2 hojas (Eventos, Resumen)
  - `exportWarehouseToXLSX()` - 2 hojas (Eventos, Resumen)

### Dependencias
- `xlsx@^0.18.5` - Librería SheetJS para generar archivos Excel

### Modificaciones en Componentes

#### Programa 1 (Triangular)
- ✅ Tabla cambió de "Primeros 20" a "Todos los valores generados (n)"
- ✅ Scroll vertical con altura máxima de 400px
- ✅ Botón "Exportar a Excel" → descarga XLSX con 3 hojas

#### Programa 2 (Cúbica)
- ✅ Tabla cambió a mostrar todos los valores
- ✅ Scroll vertical con altura máxima de 400px
- ✅ Exportación XLSX con 3 hojas (Datos, Estadísticas, Histograma)

#### Programa 3 (Máquinas)
- ✅ Tabla cambió de "Tabla de Eventos (primeros 10)" a "Tabla de eventos - todos los registros (n)"
- ✅ Scroll vertical con altura máxima de 400px
- ✅ Nuevo botón "Exportar a Excel"
- ✅ Exportación XLSX con 2 hojas (Eventos, Resumen)

#### Programa 4 (Almacén)
- ✅ Tabla cambió de "Tabla de Eventos (primeros 10)" a "Tabla de eventos - todos los registros (n)"
- ✅ Scroll vertical con altura máxima de 400px
- ✅ Nuevo botón "Exportar a Excel"
- ✅ Exportación XLSX con 2 hojas (Eventos, Resumen)

## Detalles de Exportación XLSX

### Programa 1 - Distribución Triangular
```
distribucion-triangular.xlsx
├── Hoja "Datos"
│   ├─ Índice (1, 2, 3, ...)
│   └─ Valor generado (x.xxxxxx)
├── Hoja "Estadísticas"
│   ├─ Media muestral
│   ├─ Media teórica
│   ├─ Desviación estándar
│   ├─ Mínimo/Máximo
│   ├─ Mediana
│   └─ Parámetros (a, b, c, n)
└── Hoja "Histograma"
    ├─ Intervalo
    ├─ Frecuencia
    └─ Frecuencia relativa
```

### Programa 2 - Distribución Cúbica
Misma estructura que Programa 1, con parámetros específicos de la cúbica.

### Programa 3 - Máquinas y Mecánico
```
maquinas-mecanico.xlsx
├── Hoja "Eventos"
│   ├─ Evento
│   ├─ Tiempo (h)
│   ├─ Tipo (FALLA/FIN_REPARACIÓN)
│   ├─ Máquina
│   ├─ Detalles
│   ├─ Estado operativo (Op:x, Des:y)
│   ├─ Máquinas descompuestas
│   └─ Cola
└── Hoja "Resumen"
    ├─ Número de máquinas
    ├─ Total de eventos
    ├─ Tiempo total simulado
    ├─ Total de fallas
    ├─ Máquinas descompuestas (promedio)
    ├─ Tiempo promedio de reparación
    ├─ Costo por hora
    └─ Costo total
```

### Programa 4 - Almacén y Camiones
```
almacen-camiones.xlsx
├── Hoja "Eventos"
│   ├─ Evento
│   ├─ Tiempo (min)
│   ├─ Tipo (LLEGADA/FIN_DESCARGA)
│   ├─ Camión
│   ├─ Detalles
│   ├─ Estado
│   ├─ Cola
│   └─ Espera (min)
└── Hoja "Resumen"
    ├─ Trabajadores
    ├─ Tiempo de simulación
    ├─ Camiones atendidos
    ├─ Costo de salarios
    ├─ Costo de espera
    ├─ Costo total
    └─ Utilización del equipo
```

## Características de Implementación

### Tablas Mejoradas
- Todas las tablas ahora muestran **100% de los datos** generados
- Scroll vertical automático con altura fija (400px)
- Encabezados pegajosos (sticky) que permanecen visibles al desplazarse
- Hover effects para mejor UX
- Títulos actualizados con contador de registros

### Exportación XLSX
- **Nombre de archivo significativo** por programa
- **Múltiples hojas** con datos completos
- **Nombres en español** en encabezados y contenido
- **Ancho de columnas adaptivo** automático
- **Formato profesional** listo para presentaciones

## Preservación de Funcionalidades Previas

✅ Todos los análisis modales se mantienen intactos
✅ Paneles de resumen estadístico funcionan igual
✅ Botones "Analizar" y "Acción" en tablas preservados
✅ Gráficos y visualizaciones no se modificaron
✅ Help tooltips en títulos se mantienen
✅ Lógica de simulación sin cambios

## Cómo Usar

1. **Generar simulación** - Ingresa parámetros y haz clic en "Generar" o "Simular"
2. **Ver todos los datos** - Desplázate por la tabla que ahora muestra todos los registros
3. **Descargar Excel** - Haz clic en "Exportar a Excel" para descargar `.xlsx`
4. **Abrir en Excel** - Ábrelo en Microsoft Excel, Google Sheets o cualquier editor de hojas de cálculo
5. **Analizar detalles** - Usa "Analizar" para ver interpretaciones estadísticas en modal

## Testing

- Probado con 1,000 muestras en Programas 1 y 2
- Probado con múltiples simulaciones en Programas 3 y 4
- Scroll vertical funcional con datos grandes
- Exportación XLSX verificada abre correctamente en:
  - Microsoft Excel
  - Google Sheets
  - LibreOffice Calc

## Notas Técnicas

- La librería `xlsx` es utilizada por SheetJS y es estándar en la industria
- Los archivos XLSX son completamente compatibles con Excel 2010 y posteriores
- El código es optimizado para no bloquear la UI durante la exportación
- Las columnas se ajustan automáticamente según el contenido
