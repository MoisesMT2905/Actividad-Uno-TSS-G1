# 🚀 INSTRUCCIONES DE DESPLIEGUE AUTOMÁTICO

## Estado Actual ✅

La aplicación está **completamente funcional** y corriendo en:
```
http://localhost:3000
```

## Opción 1: Desplegar en Vercel (MÁS FÁCIL) ⭐

Vercel es la plataforma oficial de Vercel (creadores de Next.js). El despliegue es **automático y gratis**.

### Paso 1: Crear Cuenta en Vercel
1. Ve a https://vercel.com
2. Click en **"Sign Up"**
3. Opción recomendada: Usar GitHub
4. Autoriza Vercel

### Paso 2: Conectar Repositorio
1. En dashboard de Vercel: **"Add New"** → **"Project"**
2. Selecciona tu repositorio de GitHub con este proyecto
3. Vercel detecta automáticamente:
   - Framework: Next.js ✓
   - Build command: `npm run build` ✓
   - Start command: `npm start` ✓

### Paso 3: Deploy
1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en una URL como:
   ```
   https://simulacion-sistemas-abc123.vercel.app
   ```

### Paso 4: Despliegues Automáticos
Cada vez que hagas push a GitHub:
```bash
git commit -am "feat: update"
git push origin main
```
Vercel desplegará automáticamente. ¡Sin hacer nada más!

---

## Opción 2: Desplegar desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta del proyecto
cd simulacion-sistemas

# Desplegar
vercel

# Sigue las instrucciones interactivas
# Selecciona cuenta Vercel
# Confirma despliegue
```

---

## Opción 3: Usar la Preview de v0

Si estás en v0.app:

1. Click en los **3 puntos** (arriba derecha)
2. Selecciona **"Publish"**
3. Sigue el flujo para conectar a Vercel
4. Auto-despliegue en tu cuenta

---

## Opción 4: Docker en Servidor Propio

### Paso 1: Crear archivo Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Paso 2: Construir imagen
```bash
docker build -t simulacion-sistemas:latest .
```

### Paso 3: Ejecutar contenedor
```bash
docker run -p 3000:3000 simulacion-sistemas:latest
```

---

## Opción 5: Servidor Linux (VPS/Dedicado)

### Requisitos
- Node.js 18+
- npm o pnpm
- SSH acceso

### Pasos

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Clonar repositorio
git clone https://github.com/tu-usuario/simulacion-sistemas.git
cd simulacion-sistemas

# 3. Instalar dependencias
npm install

# 4. Compilar
npm run build

# 5. Ejecutar con PM2 (gestor de procesos)
npm install -g pm2
pm2 start "npm start" --name simulacion-sistemas

# 6. Guardar para reinicio automático
pm2 save
pm2 startup

# 7. Acceder en
# http://tu-servidor.com:3000
```

### Configurar Dominio (Nginx)

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/simulacion-sistemas

# Contenido:
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

# Habilitar
sudo ln -s /etc/nginx/sites-available/simulacion-sistemas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL con Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## Opción 6: Plataformas Alternativas

### Railway.app
```bash
# 1. Crear cuenta en https://railway.app
# 2. Conectar GitHub
# 3. New Project → Deploy from GitHub repo
# 4. Automático
```

### Render.com
```bash
# 1. https://render.com
# 2. New Web Service
# 3. Connect GitHub
# 4. Build: npm install
# 5. Start: npm start
# 6. Deploy automático
```

### Fly.io
```bash
npm install -g flyctl
flyctl launch
flyctl deploy
```

---

## ¿Cuál Opción Elegir?

| Opción | Costo | Dificultad | Velocidad |
|--------|-------|-----------|-----------|
| **Vercel** ⭐ | Gratis | Muy Fácil | Muy Rápido |
| CLI Vercel | Gratis | Fácil | Rápido |
| Docker | Variable | Media | Normal |
| VPS Linux | Bajo | Media | Rápido |
| Railway | Bajo | Fácil | Rápido |
| Render | Bajo | Fácil | Rápido |

**Recomendación: Vercel es la opción más fácil y rápida** 🎯

---

## Verificar Despliegue

Después de desplegar, prueba:

1. **Página carga**: 
   ```
   https://tu-url.com → Deberías ver los 4 tabs
   ```

2. **Programa 1 funciona**:
   - Click en "📐 Triangular"
   - Ingresa valores
   - Click "Generar"
   - Deberías ver gráfico

3. **Programa 2 funciona**:
   - Click en "∛ Cúbica"
   - Click "Generar"
   - Verifica media ≈ 3

4. **Programa 3 funciona**:
   - Click en "🔧 Máquinas"
   - Click "Simular"
   - Verifica resultados en tabla

5. **Programa 4 funciona**:
   - Click en "🚚 Almacén"
   - Click "Simular"
   - Verifica costo total

Si todos funcionan: ✅ **Despliegue exitoso**

---

## Troubleshooting

### "No puedo acceder a mi app"
- Verifica URL correcta
- Espera 5 minutos si es primer despliegue
- Limpia caché: Ctrl+Shift+Del

### "Error en consola del navegador (F12)"
- Verifica que API routes existan
- Revisa que puerto sea correcto
- Reinicia servidor

### "Build error en Vercel"
- Ve a https://vercel.com/dashboard
- Selecciona proyecto
- Tab "Deployments"
- Revisa logs
- Típicamente: falta dependencia o error TypeScript

### "Puerto 3000 ya en uso"
```bash
# Matar proceso
lsof -ti:3000 | xargs kill -9

# O usa otro puerto
PORT=3001 npm start
```

---

## Dominio Personalizado

Una vez desplegado en Vercel:

1. Ve a Project Settings → Domains
2. Add Domain
3. Ingresa tu dominio (ejemplo: simulacion.midominio.com)
4. Sigue instrucciones para DNS
5. En 5 minutos estará disponible

---

## Monitoreo

### Vercel
- Dashboard muestra: requests, errores, tiempo
- Email alertas si hay problemas

### Local/VPS
```bash
# Revisar logs
pm2 logs simulacion-sistemas

# Estadísticas
pm2 monit
```

---

## Próximos Pasos

Después de desplegar exitosamente:

1. ✅ Compartir URL con profesores y compañeros
2. ✅ Validar contra simulaciones Excel
3. ✅ Añadir más programas si es necesario
4. ✅ Documentar en el README

---

## ¿Preguntas?

Consulta:
- **DEPLOYMENT.md** - Detalles técnicos
- **README.md** - Uso general
- **TECHNICAL.md** - Arquitectura

---

**¡Lista para desplegar!** 🚀

La aplicación está completamente lista y todas las opciones de despliegue funcionan.
Elige la que prefieras y despliega en 5 minutos.
