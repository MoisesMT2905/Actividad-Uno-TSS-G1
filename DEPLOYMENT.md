# 🚀 Guía de Despliegue - Sistema de Simulación de Sistemas

## Estado Actual

✅ **Aplicación completamente funcional y lista para despliegue**

La aplicación está corriendo en `http://localhost:3000` en modo desarrollo con acceso a todos los 4 programas de simulación.

## Opción 1: Despliegue Automático en Vercel (Recomendado)

### Paso 1: Preparar el Repositorio
```bash
# Asegúrate de que estés en la rama principal
git status

# Comitea todos los cambios
git add .
git commit -m "feat: Sistema de simulación de sistemas completo con 4 programas"

# Push a GitHub (o tu plataforma de control de versiones)
git push origin main
```

### Paso 2: Conectar a Vercel
1. Accede a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click en **"Add New"** → **"Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Deja las configuraciones por defecto (ya están optimizadas)
6. Click en **"Deploy"**

### Resultado
- Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`
- Vercel asignará automáticamente un dominio único
- Cada push a `main` genera un nuevo despliegue automático
- Los despliegues en ramas generan preview URLs

---

## Opción 2: Despliegue Local (Docker)

### Construir Imagen Docker
```bash
docker build -t simulacion-sistemas:latest .
```

### Ejecutar Contenedor
```bash
docker run -p 3000:3000 simulacion-sistemas:latest
```

---

## Opción 3: Despliegue en Servidor (VPS/Servidor Linux)

### Requisitos
- Node.js 18+ instalado
- npm o pnpm instalado
- Puerto 3000 disponible (o configurar proxy inverso)

### Pasos
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/simulacion-sistemas.git
cd simulacion-sistemas

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Ejecutar aplicación
npm start

# La app estará en http://localhost:3000
```

### Con PM2 (gestión de procesos)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación con PM2
pm2 start "npm start" --name simulacion-sistemas

# Guardar configuración de PM2
pm2 save

# Habilitar inicio automático en reboot
pm2 startup
```

### Con Nginx (proxy inverso)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Opción 4: Servidor Compartido (cPanel/Plesk)

Algunos servidores compartidos no soportan Node.js directamente. Alternativas:

### Usar Vercel Functions (recomendado)
Tu aplicación Next.js puede desplegarse en Vercel que maneja todo serverless automáticamente.

### Servicio de Hosting Node.js Dedicado
- **Heroku** (aunque ahora es de pago)
- **Railway.app**
- **Render.com**
- **Fly.io**

---

## Variables de Entorno (Opcional)

Si necesitas configuración adicional, crea un archivo `.env.local`:

```env
# Opcional - configuraciones adicionales
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## Verificación Post-Despliegue

Después de desplegar, verifica que todo funcione:

✅ **Página principal carga**: `https://tu-url/`
✅ **Tab 1 (Triangular)**: Ingresa parámetros y presiona "Generar"
✅ **Tab 2 (Cúbica)**: Presiona "Generar" directamente
✅ **Tab 3 (Máquinas)**: Presiona "Simular"
✅ **Tab 4 (Almacén)**: Presiona "Simular"
✅ **Exportación**: Verifica que el botón descargue CSV

---

## Logs y Debugging

### Vercel
- Accede a [https://vercel.com/dashboard](https://vercel.com/dashboard)
- Selecciona tu proyecto
- Tab **"Deployments"** para ver historial
- Click en un deployment → **"Logs"** para ver errores

### Local/VPS
```bash
# Ver logs en tiempo real
npm run dev

# O si usas PM2
pm2 logs simulacion-sistemas
```

---

## Performance

### Optimizaciones Incluidas
✅ Next.js 16 con Turbopack (compilación más rápida)
✅ Recharts para gráficos eficientes
✅ Componentes React optimizados con `useMemo`
✅ API routes serverless (sin servidor necesario)

### Métricas Esperadas
- Tiempo de carga inicial: < 2 segundos
- Generación de 1000 muestras: < 500ms
- Simulación de máquinas: < 1 segundo

---

## Seguridad

✅ No hay datos sensibles en el código
✅ Todas las operaciones son client-side o API routes
✅ No hay conexión a base de datos (todo en memoria)
✅ Código TypeScript con validación de tipos

---

## Soporte y Troubleshooting

### "Puerto 3000 en uso"
```bash
# Usa otro puerto
PORT=3001 npm run dev

# O mata el proceso en Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Error al generar datos"
- Verifica que estés usando Firefox, Chrome o navegador moderno
- Limpia el caché: Ctrl+Shift+Del (Chrome) o Cmd+Shift+Del (Mac)
- Recarga la página: Ctrl+R o Cmd+R

### "API not found"
- Verifica que el servidor esté corriendo
- Comprueba la consola del navegador (F12 → Console)
- Los endpoints deben estar en `/api/simulate/*`

---

## Próximos Pasos Opcionales

1. **Añadir SSL/HTTPS**: Vercel lo hace automáticamente
2. **Dominio personalizado**: En Vercel → Project Settings → Domains
3. **Analytics**: Añade Google Analytics o Vercel Analytics
4. **CI/CD Pipeline**: GitHub Actions para tests automáticos
5. **Base de datos**: Supabase o MongoDB para guardar simulaciones

---

## Contacto y Soporte

Para problemas o preguntas:
- Consulta el [README.md](./README.md) para información técnica
- Revisa los comentarios en el código (están bien documentados)
- Contacta al docente: Ing. Henrry Frank Villarroel Tapia

---

**Última actualización**: Abril 2026
**Estado**: ✅ Producción Lista
