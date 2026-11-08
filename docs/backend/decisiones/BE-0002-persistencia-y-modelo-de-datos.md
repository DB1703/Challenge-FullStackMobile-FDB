# BE-0002. Persistencia y modelo de datos

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

Los datos son pocos: un usuario de prueba y un catálogo estático de sedes, actividades y horarios. No se quiere depender de infraestructura externa (servidor de base de datos, Docker) para levantar el proyecto.

## Decisión

- **SQLite** con `node:sqlite`, en el archivo `backend/data/app.db` (ignorado por git).
- **SQL directo y parametrizado**, sin ORM ni query builder. Los repositories son el único acceso a la base y traducen `snake_case` a `camelCase`.
- **Esquema y seed separados:**
	- `schema.sql` usa `CREATE TABLE IF NOT EXISTS` y se aplica al arrancar el servidor.
	- `npm run db:seed` aplica el esquema y carga los datos con `INSERT OR IGNORE` e ids explícitos, así que se puede ejecutar más de una vez sin duplicar nada.
- **Sesiones como instancias reservables:** cada `session` es una combinación recurrente de día y horario de una actividad (`weekday`, `start_time`, `end_time`), con `id` propio y sin fecha concreta. Los días usan **ISO 8601** (1 = lunes, 7 = domingo). Los días en que la sede está cerrada no tienen fila en `venue_opening_hours`.

## Consecuencias

- No hace falta ninguna configuración: para regenerar la base alcanza con borrar `data/app.db` y volver a correr el seed.
- Como cada sesión tiene `id` propio, una futura reserva puede referenciarla de forma directa.
- No hay migraciones. Un cambio de esquema implica recrear la base.
- El catálogo se asume coherente. No se valida, por ejemplo, que una sesión caiga dentro del horario de la sede.
