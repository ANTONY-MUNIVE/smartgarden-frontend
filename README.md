# SmartGarden Frontend

Interfaz React para el sistema de jardín inteligente educativo con tema oscuro/claro, animaciones y responsive design.

## 📋 Requisitos

- Node.js 14+
- npm o yarn

## 🚀 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/smartgarden-frontend.git
cd smartgarden-frontend
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Edita .env.local y configura:
# REACT_APP_API_URL=http://localhost:8000
# REACT_APP_API_TIMEOUT=10000
```

4. **Ejecutar servidor de desarrollo**
```bash
npm start
```

La app estará disponible en: `http://localhost:3000`

## 📦 Estructura del Proyecto

```
src/
├── pages/                  # Páginas de la app
├── components/
│   ├── common/            # Componentes reutilizables
│   └── dashboard/         # Componentes del dashboard
├── context/               # Context API (Auth, Theme)
├── styles/                # Estilos globales
├── utils/                 # Utilidades (colorScheme, etc)
├── api.js                 # Cliente API
└── index.js               # Punto de entrada
```

## 🎨 Características

- ✅ Tema oscuro/claro automático basado en preferencia del sistema
- ✅ Animaciones suaves y micro-interacciones
- ✅ Diseño responsive para móvil, tablet y desktop
- ✅ Integración con API backend
- ✅ Autenticación con rol-based access

### Páginas Disponibles

- **Dashboard** - Panel principal con métricas
- **Experimentos** - Gestión de experimentos STEAM
- **Recomendaciones** - Sugerencias de IA
- **Indicadores** - Análisis y gráficos
- **Timeline** - Línea temporal de etapas
- **Admin** - Gestión de usuarios y configuración

## 🌐 Desplegar en Producción

### Opción 1: Vercel (Recomendado)
1. Sube el repo a GitHub.
2. Importa el proyecto desde Vercel.
3. Configura estas variables de entorno en Vercel:
```env
REACT_APP_API_URL=https://TU-BACKEND.onrender.com
REACT_APP_VERSION=1.0.0
```
4. Deja el build command en `npm run build`.
5. El output directory debe ser `build`.

Si prefieres usar la CLI:
```bash
npm i -g vercel
vercel login
vercel
```

### Opción 2: Netlify
```bash
npm run build
# Drag & drop la carpeta 'build' a Netlify
# O conecta GitHub para deploy automático
```

### Opción 3: GitHub Pages
```bash
npm run build
# Configura GitHub Pages en los settings del repo
```

## 📝 Scripts Disponibles

```bash
npm start          # Iniciar desarrollo
npm run build      # Build para producción
npm test           # Ejecutar tests
npm run eject      # Eject (no reversible!)
```

## 🎯 Variables de Entorno

```env
# .env.local
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=10000
REACT_APP_VERSION=1.0.0
```

En Vercel usa `REACT_APP_API_URL=https://TU-BACKEND.onrender.com` para apuntar al backend en Render.

## 🔐 Autenticación

La app usa `AuthContext` para manejar:
- Login con rol (estudiante, docente, admin)
- Persistencia de sesión
- Protected routes

## 🌓 Tema

El tema se detecta automáticamente desde:
1. Preferencia guardada en localStorage
2. Preferencia del sistema (prefers-color-scheme)
3. Default: claro

Cambiar tema desde el botón en la topbar.

## 🎨 Colores y Estilos

Los colores están centralizados en `src/utils/colorScheme.js`:
- Detectan automáticamente el modo oscuro
- Se adaptan dinámicamente
- Incluyen configuración para gráficos (Recharts)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de SmartGardenSchool - Educativo

## 📧 Contacto

Equipo de desarrollo: dev@smartgarden.local
