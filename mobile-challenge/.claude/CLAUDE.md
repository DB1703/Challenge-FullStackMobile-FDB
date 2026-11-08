# CLAUDE.md — Mobile

App mobile del challenge. Este archivo complementa al `CLAUDE.md` de la raíz (idioma, glosario de dominio, git, flujo de trabajo y ADRs).

## Stack

- Expo (la versión del SDK es la del `package.json`), React Native y **TypeScript**.
- **Expo Router** para la navegación.
- **Zustand** para el estado global.
- **React Native Paper** (Material Design 3) para los componentes de interfaz.
- **`@expo/vector-icons`** (`MaterialCommunityIcons`) para los íconos: es la librería que usa Paper y también la de la tab bar.
- **React Hook Form** con **zod** para los formularios.
- **date-fns** (con el idioma español) para las fechas.
- `expo-sqlite` (almacén clave-valor `expo-sqlite/kv-store`) para la persistencia, `expo-secure-store` para el token, `expo-crypto` para generar ids y `expo-splash-screen` para la hidratación.

### Criterio general

**Priorizar el ecosistema de Expo:** ante dos opciones equivalentes, preferir el paquete de Expo. Instalar las dependencias con `npx expo install`, que elige versiones compatibles con el SDK.

### Herramientas disponibles en Claude Code

- **MCP de Expo** conectado: usalo para consultar la documentación de la versión del SDK del proyecto antes de usar una API cuyo comportamiento dependa de la versión (por ejemplo, rutas protegidas de Expo Router, `expo-sqlite/kv-store` o la configuración de EAS Build). No asumas APIs de memoria cuando puedas verificarlas.
- **Skills/plugin de Expo** integrados: aplicalos cuando correspondan a la tarea.

## Desarrollo

- Se desarrolla con una **development build** (no Expo Go), ya generada e instalada.
- Las pruebas se hacen en un **celular Android físico**, ya preparado para usarse con la development build. Las verificaciones de cada tarea tienen que poder hacerse en ese dispositivo.
- **Agregar una dependencia con código nativo** (por ejemplo `expo-secure-store` o `expo-sqlite`) **requiere generar una nueva development build**. Cuando una tarea agregue una, avisalo explícitamente.
- En modo `api`, el celular no accede al backend por `localhost` ni por `10.0.2.2` (eso es del emulador): `EXPO_PUBLIC_API_URL` tiene que usar la IP de la computadora en la red local.

## Estructura

Organizada por funcionalidad, dentro de `src/`. Alias de imports `@/` para todo lo que está en `src/`.

```
src/
├── app/                        rutas (solo pantallas, livianas)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── auth.repository.ts        interfaz + selección de la implementación
│   │   ├── auth.repository.local.ts  implementación local
│   │   ├── auth.schemas.ts           schemas de zod (reutilizados por los formularios)
│   │   ├── auth.store.ts
│   │   └── auth.types.ts
│   ├── venues/
│   ├── bookings/
│   └── profile/
├── shared/
│   ├── components/             componentes reutilizables
│   ├── config/                 env.ts (única lectura de process.env) y selección de implementación
│   ├── errors/                 AppError y códigos de error
│   ├── hooks/
│   ├── schemas/                campos de zod compartidos entre features (emailSchema)
│   ├── theme/                  temas de Paper (claro y oscuro) y de la navegación
│   └── utils/
└── data/                       JSON locales (misma forma que la API, mismos datos que el seed del backend)
```

- Las pantallas de `app/` combinan componentes, hooks y stores; la lógica vive en `features/` y `shared/`.
- No todas las features tienen todos los archivos: si no hay estado global, no hay `.store.ts`.

## Convenciones

- Código en inglés; **textos de la interfaz en español**, escritos directamente en los componentes (sin librería de internacionalización).
- TypeScript estricto.
- Imports con el alias `@/`.
- Nombres de archivo en kebab-case (`snackbar-provider.tsx`, `use-app-theme.ts`).

## Navegación

```
src/app/
├── _layout.tsx               Stack raíz: decide entre login y la app según la sesión (rutas protegidas)
├── login.tsx
└── (app)/
    ├── _layout.tsx           Stack: la tab bar + las pantallas modales
    ├── booking.tsx           Modal de confirmación de reserva
    └── (tabs)/
        ├── _layout.tsx       Tab bar (JavaScript): Inicio, Sedes, Perfil
        ├── index.tsx         Inicio
        ├── venues/
        │   ├── _layout.tsx
        │   ├── index.tsx     Listado de sedes
        │   └── [id].tsx      Detalle de sede
        └── profile/
            ├── _layout.tsx
            ├── index.tsx     Perfil
            └── edit.tsx      Editar perfil
```

- El modal de reserva está fuera de `(tabs)` para cubrir la tab bar.
- Cada pestaña tiene su propio stack. Inicio no tiene stack propio: usa el encabezado de `Tabs`.
- Los JS Tabs (`expo-router/js-tabs`), `Stack` y los temas de navegación vienen de `expo-router`: no se instala `@react-navigation/*`.
- La tab bar es el `BottomNavigation.Bar` de Paper, conectado con la prop `tabBar` (`shared/components/material-tab-bar.tsx`). Toma el título y el ícono de las `options` de cada pestaña.

## Datos

### Repositorios intercambiables

- Cada feature accede a sus datos a través de una **interfaz de repositorio**.
- Hay una implementación **local** (lee `src/data/`) y, más adelante y opcional, una **HTTP** (consume la API).
- `EXPO_PUBLIC_DATA_SOURCE` decide cuál se usa (`local` por defecto).
- El resto de la app solo conoce la interfaz.
- Archivos por feature: `<feature>.repository.ts` (interfaz y `export const <feature>Repository = selectImplementation({ local, api })`) y `<feature>.repository.local.ts`. La HTTP va a ser `<feature>.repository.http.ts`.
- `shared/config/env.ts` es el único lugar que lee `process.env` (con notación de punto: es la única forma que Expo incrusta en el bundle). Con un valor desconocido, o con `api` mientras no exista la implementación HTTP, **falla al arrancar** en lugar de usar los datos locales sin avisar.
- **Las operaciones protegidas reciben el token como primer parámetro** (`getProfile(token)`, `updateProfile(token, input)`). Los repositorios no conocen el store de sesión. Un token vacío da `TOKEN_MISSING`.
- Los ids de las sedes se reciben como `string`, igual que el parámetro de la ruta y la URL de la API.

### Comportamiento de la implementación local

Tiene que comportarse lo más parecido posible al backend:

- **Forma de los datos:** idéntica a las respuestas de la API (objetos de dominio, sin el envoltorio `{ data }`). Ver la forma de los recursos en `backend/CLAUDE.md`.
- **Datos:** `src/data/users.json` (usuario de prueba, con `password`) y `src/data/venues.json` (sedes completas, con la forma de `GET /venues/:id`). El listado se deriva de las sedes completas. Si cambia el seed del backend, hay que actualizar estos JSON.
- **Latencia simulada:** una demora fija de 500 ms (`shared/utils/simulate-latency.ts`), para que se vean los estados de carga. Se aplica al principio de cada operación, así que los errores también se demoran.
- **Errores con los mismos códigos que la API** (`INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `TOKEN_INVALID`, `VENUE_NOT_FOUND`, etc.), con una clase de error compartida: `AppError` (`code`, `message`, `details?`) y el type guard `isAppError(error, code?)`, en `shared/errors/app-error.ts`. La app maneja los errores sin saber si vienen del mock o de la API. El `message` queda en inglés, como en la API: la interfaz muestra textos propios según el `code`.
- **Validación:** las mismas reglas que el backend, con zod. `parseOrThrow(schema, input)` (`shared/utils/validation.ts`) responde `INVALID_INPUT` con `details` en el mismo formato que la API. Los schemas (`auth.schemas.ts`, `profile.schemas.ts` y `emailSchema` en `shared/schemas/`) se reutilizan en los formularios, así que **sus mensajes están en español**.
- **Login local:** compara contra el usuario de prueba. La contraseña está en texto plano en el JSON local (es un mock con datos de prueba; documentado).
- **Token local con forma de JWT:** `header.payload.signature` con `sub` (id del usuario, como string) y `exp` (3 horas). La firma es ficticia. Se codifica en base64url con `btoa`/`atob`, que Hermes trae nativos (`features/auth/local-token.ts`). Se verifica en el mismo orden que el backend: formato y firma, después `exp` (`TOKEN_EXPIRED`), después `sub`. Todo lo inválido da `TOKEN_INVALID`.
- **Modificaciones del perfil:** se guardan en el dispositivo, en el almacén de `expo-sqlite` (`features/profile/profile.local-data.ts`, clave `local-data:users:<id>`). El login local verifica contra la versión guardada si existe, o contra el JSON si no. Así, un cambio de email funciona igual que en el backend. La contraseña siempre sale del JSON.

## Estado global (Zustand)

- **Sesión (`auth.store.ts`):** token y usuario en **un solo store**, con `login`, `logout` y `updateProfile`.
	- El **usuario** se persiste con `persist` en el almacén de `expo-sqlite`.
	- El **token** se guarda en `expo-secure-store`, explícitamente en `login` y `logout`.
	- La sesión está activa solo si existen el token y el usuario.
- **Reservas (`bookings.store.ts`):** persistidas con `persist` en el almacén de `expo-sqlite` (`name: 'bookings'`), con las reservas de todos los usuarios. `useUserBookings()` filtra por el usuario de la sesión.
	- **Son siempre locales, también en modo `api`:** el backend no tiene reservas. No hay repositorio de reservas: el store es la fuente.
- **Sedes:** sin store. Hooks por pantalla (`useVenues()`, `useVenue(id)`) con su propio estado de carga y error.
	- Se basan en `useAsync(load, deps)` (`shared/hooks/use-async.ts`), que devuelve `status` (`loading` | `error` | `success`), `data`, `error` y `retry`, y descarta los resultados viejos.
	- `useVenue` usa `getVenueCached(id)` (`features/venues/venue-cache.ts`): una caché en memoria del detalle de cada sede. Guarda la promesa, así que deduplica las cargas simultáneas, y no guarda los errores, así que el reintento vuelve a pedir. La comparten el detalle, el modal de reserva y el Inicio, así que cada sede se carga una vez por ejecución (el catálogo es estático).
- **Hidratación:** la navegación no decide entre login y app hasta que los stores terminan de hidratarse. Mientras tanto se mantiene la splash screen (`expo-splash-screen`). `RootNavigator` espera a `isHydrated` de los dos stores (sesión y reservas).

### Sesión (`features/auth/auth.store.ts`)

- **Claves:** el usuario se guarda con `persist` (`name: 'auth-session'`, `partialize` solo con `user`) y el token en SecureStore con la clave `auth.token`.
- **`login`:** `authRepository.login` → `profileRepository.getProfile` → guarda el token → setea la sesión. Si falla un paso, no queda una sesión a medias; el error se propaga a la pantalla.
- **`logout`:** borra el token y limpia el estado, aunque falle el borrado. Las reservas no se tocan.
- **Hidratación** (`onRehydrateStorage` → `completeHydration`), antes de ocultar la splash:
	1. Lee el token. Si falta el token o el usuario, se descarta lo que haya.
	2. Si el `exp` del token guardado ya pasó, se descarta la sesión y se muestra el aviso de expiración, sin pasar por Inicio. El `exp` se lee con `readTokenExpiration` (`shared/utils/jwt.ts`), que **no verifica la firma**: solo sirve para decisiones de interfaz.
	3. Si queda una sesión, se **revalida en segundo plano** con `getProfile`: refresca el usuario y detecta `TOKEN_INVALID`. Los demás errores (por ejemplo, sin red) se ignoran y la sesión sigue.
- **Rutas protegidas** en `app/_layout.tsx`: `Stack.Protected guard={isLoggedIn}` para `(app)` y `guard={!isLoggedIn}` para `login`. Después del login o del logout no se navega a mano: el guard redirige. `useIsLoggedIn()` exige token y usuario.

### Manejo de errores de sesión

`TOKEN_EXPIRED` y `TOKEN_INVALID` se manejan en un solo lugar: se cierra la sesión, se vuelve al login y se muestra un mensaje ("Tu sesión expiró. Volvé a ingresar."). Funciona igual con la implementación local y con la HTTP.

- **Toda operación protegida pasa por el store**, a través de `runProtected(operation)`. Si captura un error de sesión, llama a `expireSession()` (`logout` + `sessionExpired: true`) y relanza el error, para que el que llamó corte su flujo. Ignora los errores de un token que ya no es el actual. Las features con operaciones protegidas nuevas agregan acciones al store que usen `runProtected`; no llaman al repositorio con el token directamente.
- **El store no conoce los snackbars:** publica `sessionExpired`. `SessionExpiredNotifier` (`features/auth/components/`), montado una vez en el layout raíz, muestra el snackbar y limpia el aviso. La vuelta al login la hacen las rutas protegidas.

## Reservas

- **Se reserva una fecha concreta** de una sesión, elegida entre las ocurrencias de las **próximas 4 semanas** (ventana móvil desde hoy).
- Una sesión de hoy que ya empezó **no se puede reservar**.
- **Se guardan solo referencias:** id de la reserva (UUID con `expo-crypto`), `userId`, `venueId`, `sessionId` y la fecha (`'YYYY-MM-DD'`). Los datos para mostrar (sede, actividad, horario) se obtienen del catálogo.
	- `venueId` permite cargar solo las sedes que tienen reservas. `useResolvedBookings(now)` toma los `venueId` únicos, los carga en paralelo con `getVenueCached` y arma un índice `sessionId → { venue, activity, session }` (`indexVenueSessions`, en `booking-details.ts`).
	- Una sesión que ya no está en el catálogo se muestra como "Sesión no disponible" y cuenta como próxima hasta el final de su día.
- **Reglas** (funciones puras en `features/bookings/booking-rules.ts`):
	- Ventana de **28 días** desde hoy, inclusive. `getAvailableDates(weekday, startTime, now)` toma `startOfDay(now)`, calcula el primer día con ese `weekday` ISO (`(weekday - getISODay(hoy) + 7) % 7`) y suma de a 7 días: siempre son 4 fechas, menos la de hoy si ya empezó.
	- Fecha y hora de una sesión: `parse('YYYY-MM-DD HH:mm')` en hora **local** (`getSessionDateTime`).
	- **Próxima = la sesión todavía no empezó.** Desde que empieza es pasada y ya no se puede cancelar.
	- Superposición: misma fecha y horarios que se cruzan. Dos sesiones seguidas (una termina cuando empieza la otra) no se superponen.
- **Errores:** `BookingError` (`bookings.errors.ts`), separado de `AppError` porque son reglas locales, no códigos de la API: `SESSION_ALREADY_STARTED`, `DATE_NOT_AVAILABLE`, `BOOKING_DUPLICATE`, `BOOKING_NOT_FOUND`, `BOOKING_NOT_CANCELLABLE`, `NOT_AUTHENTICATED`. La interfaz ya evita estos casos; el store los valida igual, como red de seguridad.
- **El tiempo avanza en pantalla:** `useNow()` (`shared/hooks/use-now.ts`) se actualiza cada minuto, así una reserva pasa de próxima a pasada sin recargar.
- **Duplicados:** se impide reservar la misma sesión en la misma fecha. El detalle de la sede muestra qué sesiones ya están reservadas.
- **Superposición de horario** con otra reserva: se **advierte**, pero se permite.
- **Cancelación:** solo de reservas **próximas**, con confirmación. Las reservas pasadas no se pueden cancelar.
- **Inicio:** reservas próximas y, en una sección aparte, las pasadas.
	- Las próximas se ordenan de forma ascendente por inicio y las pasadas de forma descendente (la más reciente primero).
	- La cancelación usa `ConfirmDialog` y muestra un snackbar.
- **Modal de reserva:**
	- Muestra las 4 fechas con `RadioButton.Item`. Las que el usuario ya reservó aparecen deshabilitadas, con el texto "Ya reservada".
	- La superposición se muestra como aviso, en `tertiaryContainer`, y no bloquea la reserva.
	- Al confirmar pasa al estado de éxito: con "Listo", o se cierra solo a los 2,5 s.
	- La creación de una reserva tiene la latencia simulada, para que se vea la carga. La cancelación no, para que el snackbar aparezca enseguida.
- **Detalle de sede:** las sesiones con una reserva próxima del usuario se marcan (chip seleccionado, ícono `check`, "Reservada") y se siguen pudiendo reservar en otra fecha (`useBookedSessionIds`).
- Las reservas están **asociadas al usuario** (`userId`) y se conservan al cerrar sesión.

## Interfaz

- **React Native Paper** con tema Material Design 3, variantes clara y oscura, y el tema de la navegación adaptado al de Paper (`shared/theme/`, hook `useAppTheme()`). El tema de navegación usa el mismo mapeo de colores que `adaptNavigationTheme` de Paper, pero escrito a mano: los tipos de Paper esperan colores `string` y el `Theme` de Expo Router usa `ColorValue`.
- **Snackbars** para comunicar éxito y errores: `useSnackbar()` → `showSuccess(message)` / `showError(message)` (`shared/components/snackbar-provider.tsx`). Se muestra un mensaje por vez; uno nuevo reemplaza al anterior.
- **Formularios** con React Hook Form y zod. Las reglas coinciden con las del backend (ver la tabla de validación en `backend/CLAUDE.md`).
	- `zodResolver` con los schemas de cada feature, `useForm<z.input<…>, unknown, z.output<…>>`, `Controller` con el `TextInput` de Paper (`mode="outlined"`) y `HelperText type="error"` por campo.
	- Los errores que se refieren al formulario completo (por ejemplo, `INVALID_CREDENTIALS` en el login: "Email o contraseña incorrectos.") van en el formulario, con `setError('root')` y un `HelperText` arriba del botón, y se limpian al editar. Los errores inesperados van en un snackbar.
	- **Teclado:** `KeyboardAvoidingView behavior="padding"` (la app es edge-to-edge, así que Android tampoco redimensiona la ventana) + `ScrollView` con `keyboardShouldPersistTaps="handled"`. Debajo de un encabezado de navegación, sumar `keyboardVerticalOffset={useHeaderHeight()}` (`expo-router/react-navigation`).
	- **Errores que devuelve el repositorio** (formulario de edición de perfil):
		- `INVALID_INPUT`: se usa solo el `field` de cada detalle para marcar el campo ("Revisá este campo."), no el texto del detalle.
		- Los errores de negocio con un campo claro van en ese campo (`EMAIL_ALREADY_IN_USE` → email).
		- `TOKEN_EXPIRED` y `TOKEN_INVALID` no se tratan en las pantallas: los resuelve `runProtected`.
		- El resto, en un snackbar.
	- **Cambios sin guardar:** `usePreventRemove(isDirty && !isSubmitting && isLoggedIn, …)` de `expo-router` muestra el diálogo "¿Descartar los cambios?". `isLoggedIn` en la condición permite que las rutas protegidas saquen la pantalla si la sesión termina. Al guardar con éxito, `reset(values)` + `disablePrevention()` antes de volver.
	- El botón de guardar queda deshabilitado mientras no haya cambios (`!isDirty`).
- **Confirmaciones** (cerrar sesión, descartar cambios, cancelar una reserva): `ConfirmDialog` (`shared/components/confirm-dialog.tsx`), un `Dialog` de Paper en un `Portal`, con `destructive` para pintar la acción con el color de error.
- **Estados de carga:**
	- **Skeletons** para el contenido que se carga al entrar a una pantalla (listado y detalle de sedes, reservas del Inicio).
	- **Spinners** para las acciones (botones con `loading`) y la hidratación.
- **Estados vacíos** con un mensaje y, cuando corresponda, un acceso a la acción siguiente (por ejemplo, Inicio sin reservas → ir a Sedes).
- **Componentes de estado** (`shared/components/`):
	- `Skeleton`: un bloque con pulso de opacidad (Reanimated).
	- `EmptyState`: ícono, título, mensaje y acción opcional.
	- `ErrorState`: un error de carga con "Reintentar".
	- Cada pantalla arma su skeleton con la forma de su contenido (`venue-list-skeleton`, `venue-detail-skeleton`).
- **Detalle de sede:**
	- Los horarios muestran siempre los 7 días, de lunes a domingo. Los días sin horario (no vienen en los datos) se ven como **"Cerrado"** y el día de hoy, resaltado.
	- `VENUE_NOT_FOUND` tiene su propio estado ("No encontramos esta sede") con la acción "Ver sedes". Los demás errores usan `ErrorState`.
	- Cada sesión es un `Chip` que abre el modal de reserva con los params `venueId` y `sessionId`.
- La confirmación de reserva que pide el enunciado se muestra en el modal, que pasa a un estado de éxito antes de cerrarse.

## Fechas

- date-fns con el idioma español (`es`).
- Días de la semana en ISO 8601 (1 = lunes, 7 = domingo), igual que el backend: `getISODay` de date-fns.
- **Fechas sin hora** (`'YYYY-MM-DD'`, como `birthDate`): siempre con `parseDateOnly` (`shared/utils/dates.ts`), que las interpreta a medianoche **local**. Nunca con `new Date('YYYY-MM-DD')`: lo toma como medianoche UTC, que en Argentina es el día anterior.
- Formato largo: `formatLongDate` → "12 de abril de 1995". Los formatos nuevos se agregan en `shared/utils/dates.ts`.
- `formatWeekday(isoWeekday)` → "Lunes" … "Domingo" (convierte ISO a la numeración de date-fns, donde domingo es 0) y `formatTimeRange(start, end)` → "08:00 – 09:00".
- `formatDayMonth` → "lunes 16 de noviembre" (fechas del modal) y `formatFullDate` → "Lunes 16 de noviembre de 2026" (tarjetas de reserva).

## Variables de entorno

| Variable | Valores | Uso |
|---|---|---|
| `EXPO_PUBLIC_DATA_SOURCE` | `local` (por defecto) o `api` | Implementación de repositorios |
| `EXPO_PUBLIC_API_URL` | ej.: `http://192.168.0.10:3000/api/v1` (IP local de la computadora) | URL de la API (solo en modo `api`) |
| `EXPO_PUBLIC_LOCAL_TOKEN_TTL_SECONDS` | entero positivo, por defecto `10800` (3 h) | Opcional, solo desarrollo: duración del token local, para probar la expiración (ej.: `60`) |

- Las variables `EXPO_PUBLIC_` se incrustan en el código al compilar: **nunca llevan secretos**.
- Para el APK se definen en el perfil de `eas.json`.
- `.env.example` versionado.

## APK

- Generado con EAS Build, con un perfil que produce `.apk` (no `.aab`).
- Tiene que funcionar de forma autónoma: datos locales, sin backend y sin Expo Go.
- **Perfil `preview`** de `eas.json`: `distribution: internal`, `android.buildType: apk` y `env.EXPO_PUBLIC_DATA_SOURCE=local`. Es un build de distribución (no development build): lleva el bundle de JS incluido y no necesita Metro.
- **Las variables van en el `env` del perfil, no en las variables de EAS:**
	- Son públicas (`EXPO_PUBLIC_`), así que pueden commitearse, y quedan versionadas con el código: cualquiera que clone el repo genera el mismo APK sin configurar la cuenta de Expo.
	- El `.env` local está en el `.gitignore`, así que EAS no lo sube y no afecta el build.
	- `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_LOCAL_TOKEN_TTL_SECONDS` se omiten: no se usan en modo local, y el token dura por defecto 3 h.
- **Versión:** `version` en `app.json` (`1.0.0`). El `versionCode` lo administra EAS (`cli.appVersionSource: remote`).
- **Build:** `npx eas-cli@latest build --platform android --profile preview`. El proyecto ya está vinculado por `extra.eas.projectId`. En el primer build, EAS genera y guarda el keystore.
- **Nombre visible:** "Clases FDB". El `slug` (`mobile-challenge`) y el paquete (`com.deber.mobilechallenge`) no se cambian: vinculan el proyecto de EAS y la identidad de la app instalada.
- **Pendiente:** los íconos y la splash screen siguen siendo los del template de Expo (`assets/images/`). Si hay assets propios, reemplazarlos antes del build.
- **La development build y el APK** tienen el mismo paquete y distinta firma: para instalar uno sobre el otro hay que desinstalar el anterior, y eso borra los datos locales.

## Opcional (al final, si da el tiempo)

- Implementación HTTP de los repositorios.
- Bonus del QR.
