# MOB-0003. Estado global y sesión

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

La sesión tiene que sobrevivir al cierre de la app, el token es un dato sensible, y un token vencido o inválido puede aparecer en cualquier operación protegida. La navegación no puede mostrar ni el login ni la app hasta saber si hay una sesión guardada.

## Decisión

- **Un solo store de sesión** (`features/auth/auth.store.ts`) con el token y el usuario, y las acciones `login`, `logout` y `updateProfile`. La sesión está activa solo si existen los dos.
- **Persistencia separada:** el usuario se persiste con `persist` en el almacén clave-valor de `expo-sqlite`, y el token se guarda explícitamente en `expo-secure-store`.
- **Hidratación con la splash screen:** la splash se mantiene hasta que se hidratan los stores de sesión y de reservas.
	- Si el `exp` del token guardado ya pasó, la sesión se descarta antes de ocultar la splash y el usuario va directo al login con el aviso. El `exp` se lee sin verificar la firma: solo sirve para decidir en la interfaz.
	- Si la sesión sigue vigente, se revalida en segundo plano con `getProfile`, que refresca el usuario y detecta un token inválido.
- **Rutas protegidas** con `Stack.Protected`: la app solo es accesible con sesión. Después del login o del logout no se navega a mano: el guard redirige.
- **Manejo centralizado de los errores de sesión:**
	- Toda operación protegida pasa por `runProtected`, dentro del store. Ante `TOKEN_EXPIRED` o `TOKEN_INVALID`, cierra la sesión y marca un aviso.
	- El store no conoce la interfaz. `SessionExpiredNotifier`, montado en el layout raíz, muestra "Tu sesión expiró. Volvé a ingresar."
- **Las sedes no tienen store:** hooks por pantalla con `useAsync` y una caché en memoria del detalle de cada sede.

## Consecuencias

- Ninguna pantalla trata los errores de sesión: los resuelve el store, igual con la implementación local y con la HTTP.
- Toda operación protegida nueva tiene que agregarse como acción del store que use `runProtected`.
- Sin refresh tokens: al vencer el token (3 horas), hay que volver a ingresar.
