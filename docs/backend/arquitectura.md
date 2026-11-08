# Arquitectura del backend

Resumen de la organización del código y de las decisiones de alcance. El detalle de endpoints, validaciones y errores está en Swagger UI (`/docs`) y en [`backend/openapi.json`](../../backend/openapi.json). Las decisiones técnicas están en los [ADRs](decisiones/).

## Estructura y capas

El código está organizado por capa técnica:

```
src/
├── routes/         URL + método → middlewares + controller
├── middlewares/    authenticate, validate, not-found, error-handler
├── controllers/    traducen HTTP: leen el request, llaman al servicio, responden
├── services/       lógica de negocio; no conocen req ni res
├── repositories/   único acceso a la base; snake_case → camelCase
├── schemas/        schemas de zod para validar la entrada
├── errors/         jerarquía de errores (AppError y subclases)
├── db/             conexión, schema.sql y seed
├── config/env.js   única lectura de process.env, validada al arrancar
├── utils/          jwt.js y password.js
├── app.js          arma la app (no escucha)
└── server.js       aplica el esquema y levanta el servidor
```

Una request sigue este flujo: `route → authenticate → validate → controller → service → repository`. Los servicios lanzan errores de la jerarquía y el `error-handler` central los convierte en `{ "error": { code, message, details? } }`. Las respuestas exitosas usan `{ "data": ... }`.

## Modificaciones respecto del enunciado

### Endpoints agregados

- `GET /api/v1/venues/:id`: devuelve la sede completa (descripción, horarios y actividades), así el listado queda liviano.
- `GET /health`: permite verificar que el servidor está arriba sin autenticarse.
- `GET /docs`: Swagger UI para explorar y probar la API.

### Campos agregados

- `user.birthDate`: dato del perfil que se muestra pero no se puede editar.
- `user.address` (opcional): completa el perfil editable. Un valor vacío se guarda como `null`.
- `session.endTime`: con el horario de fin, cada sesión tiene una duración explícita y el cliente no tiene que suponerla.

### Decisiones de formato

- **Horarios de funcionamiento** (`openingHours`): el enunciado no fija el formato. Se guardan estructurados por día (`weekday`, `opensAt`, `closesAt`), no como texto libre. Los días cerrados no aparecen.
- **Ubicación** (`location`): una referencia textual (por ejemplo, "a dos cuadras de Plaza Italia"), separada de la dirección. No se usan coordenadas.
- **Sesiones:** cada sesión es una combinación recurrente de día y horario, con `id` propio y sin fecha concreta. Las actividades las exponen agrupadas por día en `schedule`. Ver [BE-0002](decisiones/BE-0002-persistencia-y-modelo-de-datos.md).

## Fuera del alcance

- Refresh tokens.
- Rate limiting en el login.
- Igualación de tiempos de respuesta en el login.
- Reservas en el backend.
- Tests, lint y formato automático.

## Supuestos y limitaciones

- Los datos de catálogo (sedes, horarios, actividades y sesiones) son estáticos y se asumen coherentes. No se valida que las sesiones caigan dentro del horario de la sede.
- `PUT /users/me` reemplaza el recurso completo. `birthDate` y la contraseña no son editables.
- Los errores al parsear el JSON (400, 413, 415) se devuelven antes que los de autenticación, porque `express.json()` es global.
- Un token no se puede revocar antes de que venza (ver [BE-0003](decisiones/BE-0003-autenticacion.md)).
