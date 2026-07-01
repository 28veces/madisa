# Arte Madisa

Sitio web fullstack para un negocio de artesanías y personalización. Permite gestionar productos, ventas, compras e inventario.

## Stack Tecnológico

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Base de datos:** Prisma + SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación:** NextAuth.js
- **UI Components:** shadcn/ui, BaseUI, Lucide Icons
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod

## Quick Start

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos
```bash
npm run db:push
```

### 3. Cargar datos iniciales
```bash
npm run db:seed
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

Accede a [http://localhost:3000](http://localhost:3000)

## Usuarios de Desarrollo

Después de ejecutar `npm run db:seed`, estos usuarios están disponibles:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `super@sistema.com` | `super123` | SUPER_ADMIN |
| `admin@artemadisa.com` | `admin123` | ADMIN |

## Comandos Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build para producción
npm run start     # Ejecutar producción
npm run lint      # Ejecutar linter

# Base de datos
npm run db:push   # Sincronizar schema con BD
npm run db:seed   # Cargar datos iniciales
npm run db:studio # Abrir Prisma Studio
```

## Documentación Adicional

- **[SETUP.md](./SETUP.md)** - Guía detallada de instalación y solución de problemas
- **[AGENTS.md](./AGENTS.md)** - Información técnica del proyecto

## Estructura del Proyecto

```
├── src/
│   ├── app/           # Rutas y layouts de Next.js
│   ├── components/    # Componentes reutilizables
│   ├── lib/          # Funciones utilitarias
│   ├── actions/      # Server actions
│   ├── stores/       # Estado (Zustand)
│   └── types/        # TypeScript types
├── prisma/
│   ├── schema.prisma # Schema de BD
│   └── seed.ts       # Script de datos iniciales
└── public/           # Archivos estáticos
```

## Notas de Desarrollo

- La BD en desarrollo usa **SQLite** (`dev.db`) para simplificar setup
- Para producción, cambiar a PostgreSQL en `prisma/schema.prisma`
- Los cambios al schema se sincronizan con `npm run db:push`
- El servidor hot-reload automáticamente en desarrollo
