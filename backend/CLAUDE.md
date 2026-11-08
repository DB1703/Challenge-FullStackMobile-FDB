# CLAUDE.md — Backend

API REST del challenge. Este archivo complementa al `CLAUDE.md` de la raíz (idioma, glosario de dominio, git, flujo de trabajo y ADRs).

## Stack

- Node.js `26.13.0` (ver `.nvmrc` en la raíz).
- **JavaScript** con **ESM** (`"type": "module"`). No se usa TypeScript.
- Express 5.
- SQLite con el módulo nativo `node:sqlite`, con SQL directo (sin ORM ni query builder).
- `bcryptjs` para el hash de contraseñas.
- `jose` para los JWT.
- `zod` 4 para la validación de entrada.
- `swagger-ui-express` para servir la documentación OpenAPI.

No hay herramientas de lint ni de formato, ni tests, por decisión explícita. El formato básico lo define el `.editorconfig` de la raíz (tabs, LF, UTF-8).

## Comandos

```bash
npm run dev       # servidor con recarga automática (node --watch)
npm start         # servidor
npm run db:seed   # crea el esquema si no existe e inserta los datos iniciales
```

Las variables de entorno se cargan desde `.env` con el flag nativo `--env-file-if-exists`. Para arrancar: `cp .env.example .env`.

## Estructura

Organizada por capa técnica:

```
backend/
├── data/               # app.db (generado, ignorado por git)
├── src/
│   ├── config/
│   │   └── env.js      # única lectura de process.env
│   ├── db/
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── errors/         # jerarquía de errores
│   ├── middlewares/    # authenticate, validate, error-handler, etc.
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── schemas/        # schemas de zod
│   ├── utils/          # jwt.js, password.js
│   ├── app.js          # crea y configura la app (no escucha)
│   └── server.js       # levanta la app
├── openapi.yaml
└── package.json
```

### Responsabilidades de cada capa

- **routes:** asocian URL y método con middlewares y controller.
- **controllers:** traducen HTTP. Leen el request, llaman al servicio y responden con el status correcto. Sin lógica de negocio.
- **services:** lógica de negocio. No conocen `req` ni `res`. Lanzan errores de la jerarquía.
- **repositories:** único acceso a la base. Traducen `snake_case` (base) a `camelCase` (aplicación).

## Convenciones

- **Imports relativos con extensión `.js`** (requisito de ESM en Node).
- **No leer `process.env` fuera de `src/config/env.js`.** El resto del código importa `env`.
- **SQL siempre parametrizado** con placeholders (`?`). Nunca concatenar ni interpolar valores en el SQL.
- **`snake_case` en la base, `camelCase` en el código y en la API.** La traducción la hacen los repositories.
- **Nunca devolver `password_hash`** en ninguna respuesta.
- **Email normalizado** (`trim` y minúsculas) en todo punto de entrada: login, actualización de perfil y seed.
- **Dirección vacía se guarda como `NULL`.**

## Configuración

Variables de entorno, leídas y validadas en `src/config/env.js` con *fail fast*: si falta una obligatoria, el servidor no arranca e indica cuál falta. El objeto exportado se congela con `Object.freeze`.

| Variable | Obligatoria | Valor por defecto |
|---|---|---|
| `PORT` | No | `3000` |
| `JWT_SECRET` | Sí | — |
| `JWT_EXPIRES_IN` | No | `3h` |

## Persistencia

- SQLite en la ruta fija `data/app.db`. La carpeta `data/` está en el `.gitignore` de `backend/`.
- `connection.js` abre la base y ejecuta `PRAGMA foreign_keys = ON` (SQLite no aplica claves foráneas si no se activa).
- `schema.sql` usa `CREATE TABLE IF NOT EXISTS` y se ejecuta al arrancar el servidor.
- El seed es un script aparte (`npm run db:seed`):
  - Ejecuta el `schema.sql` antes de insertar, para funcionar aunque el servidor nunca se haya arrancado.
  - Usa `INSERT OR IGNORE` con **ids explícitos** en todos los registros, para que ejecutarlo varias veces no duplique datos.
- Al arrancar, si la base está vacía, el servidor muestra un aviso indicando que hay que ejecutar `npm run db:seed`.

### Esquema

```sql
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	birth_date TEXT NOT NULL,           -- ISO 8601: 'YYYY-MM-DD'
	address TEXT                        -- opcional; vacío se guarda como NULL
);

CREATE TABLE IF NOT EXISTS venues (
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	address TEXT NOT NULL,
	location TEXT NOT NULL,             -- referencia textual
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS venue_opening_hours (
	venue_id INTEGER NOT NULL REFERENCES venues(id),
	weekday INTEGER NOT NULL,           -- ISO 8601: 1 = lunes, 7 = domingo
	opens_at TEXT NOT NULL,             -- 'HH:MM'
	closes_at TEXT NOT NULL,            -- 'HH:MM'
	PRIMARY KEY (venue_id, weekday)
);

CREATE TABLE IF NOT EXISTS activities (
	id INTEGER PRIMARY KEY,
	venue_id INTEGER NOT NULL REFERENCES venues(id),
	name TEXT NOT NULL,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	id INTEGER PRIMARY KEY,
	activity_id INTEGER NOT NULL REFERENCES activities(id),
	weekday INTEGER NOT NULL,           -- ISO 8601: 1 = lunes, 7 = domingo
	start_time TEXT NOT NULL,           -- 'HH:MM'
	end_time TEXT NOT NULL,             -- 'HH:MM'
	UNIQUE (activity_id, weekday, start_time)
);
```

- Los días en que una sede está cerrada no tienen fila en `venue_opening_hours`.
- Sin restricciones `CHECK` sobre `weekday`.
- Datos del seed: el usuario de prueba y dos sedes, cada una con dos actividades.

## API

Todas las rutas de la API llevan el prefijo `/api/v1`. El health check y la documentación viven en la raíz.

| Método | Ruta | Protegido | Respuesta exitosa |
|---|---|---|---|
| `GET` | `/health` | No | `200 { "status": "ok" }` (sin envoltorio) |
| `GET` | `/docs` | No | Swagger UI |
| `POST` | `/api/v1/auth/login` | No | `200 { "data": { "token" } }` |
| `GET` | `/api/v1/users/me` | Sí | `200 { "data": <usuario> }` |
| `PUT` | `/api/v1/users/me` | Sí | `200 { "data": <usuario> }` |
| `GET` | `/api/v1/venues` | No | `200 { "data": [<resumen de sede>] }` |
| `GET` | `/api/v1/venues/:id` | No | `200 { "data": <sede completa> }` |

### Formato de respuesta

- **Éxito:** `{ "data": ... }`.
- **Error:** `{ "error": { "code": "...", "message": "...", "details": [...] } }`. `details` es opcional y lo usan los errores de validación: `[{ "field": "email", "message": "..." }]`.

### Forma de los recursos

- **Usuario:** `id`, `email`, `firstName`, `lastName`, `birthDate`, `address`.
- **Resumen de sede:** `id`, `name`, `address`, `location`.
- **Sede completa:** resumen + `description`, `openingHours` y `activities`.

```json
{
	"id": 1,
	"name": "...",
	"address": "...",
	"location": "...",
	"description": "...",
	"openingHours": [
		{ "weekday": 1, "opensAt": "07:00", "closesAt": "23:00" }
	],
	"activities": [
		{
			"id": 1,
			"name": "...",
			"description": "...",
			"schedule": [
				{
					"weekday": 1,
					"sessions": [
						{ "id": 1, "startTime": "18:00", "endTime": "19:00" }
					]
				}
			]
		}
	]
}
```

- `openingHours` y `schedule` ordenados por `weekday` (lunes a domingo).
- Las sesiones de cada día, ordenadas por `startTime`.
- Los días sin sesiones no aparecen en `schedule`.

### Errores

| Status | Código | Cuándo |
|---|---|---|
| 400 | `INVALID_INPUT` | Datos inválidos o campos no permitidos en el body |
| 400 | `MALFORMED_JSON` | Body que no es JSON válido |
| 401 | `INVALID_CREDENTIALS` | Login fallido (mismo error para email inexistente y contraseña incorrecta) |
| 401 | `TOKEN_MISSING` | Sin header `Authorization` o sin el formato `Bearer <token>` |
| 401 | `TOKEN_INVALID` | Firma inválida, token malformado o algoritmo incorrecto |
| 401 | `TOKEN_EXPIRED` | Token vencido |
| 404 | `VENUE_NOT_FOUND` | Sede inexistente, incluido un id no numérico |
| 404 | `ROUTE_NOT_FOUND` | Ruta inexistente |
| 409 | `EMAIL_ALREADY_IN_USE` | `PUT /users/me` con un email que usa otro usuario |
| 500 | `INTERNAL_ERROR` | Error inesperado (se loguea completo; al cliente no se le muestran detalles) |

### Manejo de errores

- Jerarquía de clases en `src/errors/`: `AppError` (base, con `statusCode`, `code` y `message`) y subclases `ValidationError` (400), `UnauthorizedError` (401), `NotFoundError` (404) y `ConflictError` (409).
- Manejador central en `src/middlewares/error-handler.js`, registrado al final de `app.js`.
- Express 5 propaga solo los errores de los handlers async: no hace falta `try/catch` ni wrappers.
- Las respuestas 401 incluyen el header `WWW-Authenticate` (RFC 6750).

## Autenticación

- **Contraseñas:** `bcryptjs` con costo 10, definido como constante en `src/utils/password.js`.
- **JWT:** `jose`, algoritmo HS256, en `src/utils/jwt.js`. Al verificar, se fija el algoritmo esperado (`algorithms: ['HS256']`).
- **Payload:** solo `sub` (id del usuario, como string) y `exp`. El email no va en el token, porque es editable.
- **Transporte:** header `Authorization: Bearer <token>`.
- **Middleware:** `src/middlewares/authenticate.js`. Si el token es válido, deja `req.user = { id }` (id numérico).
- El logout es responsabilidad del cliente (descartar el token).

## Validación

- Con zod 4. Schemas en `src/schemas/`, un archivo por recurso.
- Middleware genérico `validate(schema)` en las rutas. Reemplaza `req.body` por los datos validados y normalizados.
- Los campos no permitidos se rechazan (`.strict()`), con 400 `INVALID_INPUT`.
- **`PUT /users/me` es un reemplazo total:** el body trae siempre `firstName`, `lastName`, `email` y `address` (string o `null`). `birthDate` y la contraseña no son editables.

| Campo | Regla |
|---|---|
| `firstName`, `lastName` | String con `trim`, entre 1 y 50 caracteres |
| `email` | Email válido, normalizado (`trim` y minúsculas) |
| `address` | String de hasta 200 caracteres, o `null`; vacío se convierte en `null` |

- La verificación de email duplicado busca **otro** usuario con ese email, excluyendo al usuario actual.

## Documentación de la API

- Especificación OpenAPI escrita a mano en `openapi.yaml`, servida con `swagger-ui-express` en `/docs`.
- Al modificar un endpoint, actualizar `openapi.yaml` en la misma tarea.
- El YAML va indentado con espacios (excepción del `.editorconfig`).

## Fuera del alcance (documentado)

- Refresh tokens.
- Rate limiting en el login.
- Igualación de tiempos de respuesta en el login.
- Reservas en el backend.
- Tests, lint y formateo automático.

## Supuestos

- Los datos de catálogo (sedes, horarios, actividades y sesiones) son estáticos y se asumen coherentes. No se valida que las sesiones caigan dentro del horario de la sede.
