# Guía de instalación y arranque - Madisa

## Requisitos previos
- Node.js 18+ y npm

## Pasos de instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear las tablas en la base de datos (SQLite)
```bash
npm run db:push
```

Para desarrollo usamos SQLite (`dev.db`) que se crea automáticamente.

### 3. Cargar datos iniciales de prueba
```bash
npm run db:seed
```

Esto crea:
- **Negocio:** Arte Madisa
- **Usuarios:**
  - `super@sistema.com` / `super123` (SUPER_ADMIN)
  - `admin@artemadisa.com` / `admin123` (ADMIN)
- **8 productos de muestra** (tazas, platos, vasos, sweaters, placas, etc.)

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:3000` (o `http://localhost:3001` si el 3000 está ocupado)

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run db:push` | Sincroniza cambios en el schema |
| `npm run db:seed` | Ejecuta el seed de datos |
| `npm run db:studio` | Abre Prisma Studio en el navegador |

## Solución de problemas

### Resetear la base de datos
```bash
rm dev.db dev.db-shm dev.db-wal 2>/dev/null
npm run db:push
npm run db:seed
```

### Regenerar Prisma Client
Si hay errores relacionados con Prisma:
```bash
npx prisma generate
```

### Si necesitas usar PostgreSQL (producción)
Edita `prisma/schema.prisma` y cambiar el datasource de SQLite a PostgreSQL:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Luego actualiza `.env.local` con las credenciales de PostgreSQL y ejecuta:
```bash
npm run db:push
npm run db:seed
```

## Estructura del proyecto

- `/app` - Rutas de Next.js y layouts
- `/components` - Componentes reutilizables
- `/lib` - Funciones utilitarias
- `/prisma` - Schema de base de datos y migraciones
- `/src/actions` - Server actions
- `/src/stores` - Estado con Zustand (carrito)
