# Backend — API REST

API REST del challenge, hecha con Node.js, Express 5 y SQLite.

## Requisitos

- Node.js `26.13.0` (ver `.nvmrc` en la raíz; con nvm: `nvm install && nvm use`).

## Puesta en marcha

Desde la carpeta `backend/`:

1. Instalar las dependencias:

	```bash
	npm install
	```

2. Crear el `.env` a partir del ejemplo:

	```bash
	cp .env.example .env
	```

3. Completar `JWT_SECRET` con un valor aleatorio. Viene vacío en el ejemplo, y **el servidor no arranca hasta que se complete**. Para generar uno:

	```bash
	node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
	```

	| Variable | Obligatoria | Valor por defecto |
	|---|---|---|
	| `PORT` | No | `3000` |
	| `JWT_SECRET` | Sí | — (mínimo 32 caracteres) |
	| `JWT_EXPIRES_IN` | No | `3h` |

4. Crear la base y cargar los datos iniciales:

	```bash
	npm run db:seed
	```

5. Levantar el servidor:

	```bash
	npm run dev
	```

La API queda disponible en `http://localhost:3000/api/v1`.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática (`node --watch`) |
| `npm start` | Servidor |
| `npm run db:seed` | Crea el esquema si no existe y carga los datos iniciales. Se puede ejecutar más de una vez sin duplicar datos |

## Documentación

- Swagger UI: `http://localhost:3000/docs`. La especificación está en [`openapi.json`](openapi.json).
- Arquitectura y alcance: [`docs/backend/arquitectura.md`](../docs/backend/arquitectura.md).
- Decisiones: [`docs/backend/decisiones/`](../docs/backend/decisiones/).

## Usuario de prueba

| Email | Contraseña |
|---|---|
| `usuario.prueba@example.com` | `Prueba123!` |
