# MOB-0002. Capa de datos con repositorios intercambiables

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

El APK tiene que funcionar sin backend, con datos locales. Al mismo tiempo, la app debería poder consumir la API sin reescribir las pantallas, y el comportamiento con datos locales tiene que ser lo bastante fiel como para que los estados de carga y de error se vean igual que con la API.

## Decisión

- **Una interfaz de repositorio por feature** (`auth`, `profile`, `venues`). `EXPO_PUBLIC_DATA_SOURCE` (`local` por defecto) elige la implementación con `selectImplementation`. El resto de la app solo conoce la interfaz.
- **Fail fast:** `shared/config/env.ts` es el único lugar que lee `process.env`. Con un valor desconocido, o con `api` mientras no exista la implementación HTTP, la app falla al arrancar en lugar de usar los datos locales sin avisar.
- **La implementación local imita al backend:**
	- **Misma forma de datos:** los JSON de `src/data/` tienen los mismos datos que el seed del backend, con la forma de la API y sin el envoltorio `{ data }`.
	- **Misma validación:** reglas de zod idénticas, y `INVALID_INPUT` con `details` en el mismo formato.
	- **Mismos códigos de error:** `AppError` con `code` (`INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `TOKEN_INVALID`, `VENUE_NOT_FOUND`, etc.).
	- **Token con forma de JWT:** con `sub` y `exp` (3 horas) y una firma ficticia, verificado en el mismo orden que el backend.
	- **Latencia simulada** de 500 ms, definida en un solo lugar.
	- **Perfil:** las modificaciones se guardan en el almacén de `expo-sqlite`, y el login usa la versión guardada si existe.
- **Las operaciones protegidas reciben el token como parámetro** (`getProfile(token)`). Los repositorios no conocen el store de sesión.

## Consecuencias

- Las pantallas manejan los errores sin saber si vienen del mock o de la API.
- Los datos locales están duplicados respecto del seed del backend: si cambia el seed, hay que actualizar los JSON a mano.
- La contraseña del usuario de prueba está en texto plano en `src/data/users.json`. Es un mock con datos de prueba.
- La implementación HTTP no está hecha. El diseño queda descrito en la [arquitectura](../arquitectura.md#diseño-pendiente).
