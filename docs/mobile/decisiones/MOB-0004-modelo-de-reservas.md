# MOB-0004. Modelo de reservas

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

El enunciado pide reservar una clase y mostrar una confirmación, pero el backend no tiene reservas. Las sesiones del catálogo son recurrentes (un día de la semana y un horario), sin fecha concreta.

## Decisión

- **Se reserva una fecha concreta** de una sesión, elegida entre sus ocurrencias de las **próximas 4 semanas** (ventana móvil de 28 días desde hoy). Las fechas se calculan con `getISODay` de date-fns y en hora local, así que siempre son 4.
- **Se guardan solo referencias:** `id` (UUID con `expo-crypto`), `userId`, `venueId`, `sessionId` y `date` (`'YYYY-MM-DD'`). La sede, la actividad y el horario se obtienen del catálogo. `venueId` permite cargar solo las sedes que tienen reservas.
- **Reglas:**
	- No se puede reservar la misma sesión en la misma fecha.
	- Una sesión que ya empezó no se puede reservar.
	- La superposición de horario con otra reserva se **advierte**, pero se permite.
	- Una reserva es **próxima hasta que la sesión empieza**. Solo las próximas se pueden cancelar, con confirmación.
- **Las reservas son siempre locales**, también en modo `api`: un store de Zustand persistido en el almacén de `expo-sqlite`, sin repositorio. Están asociadas al usuario (`userId`) y se conservan al cerrar sesión.

## Consecuencias

- Las reservas no se sincronizan entre dispositivos y se pierden al desinstalar la app.
- Los datos que se muestran dependen del catálogo: si una sesión deja de existir, la reserva se ve como "Sesión no disponible".
- Las violaciones de las reglas son `BookingError`, separado de `AppError`, porque no son códigos de la API. La interfaz ya evita esos casos; el store los valida igual.
