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
- **Reservas (`bookings.store.ts`):** persistidas con `persist` en el almacén de `expo-sqlite`.
- **Sedes:** sin store. Hooks por pantalla (`useVenues()`, `useVenue(id)`) con su propio estado de carga y error.
- **Hidratación:** la navegación no decide entre login y app hasta que los stores terminan de hidratarse. Mientras tanto se mantiene la splash screen (`expo-splash-screen`).

### Manejo de errores de sesión

`TOKEN_EXPIRED` y `TOKEN_INVALID` se manejan en un solo lugar: se cierra la sesión, se vuelve al login y se muestra un mensaje ("Tu sesión expiró. Volvé a ingresar."). Funciona igual con la implementación local y con la HTTP.

## Reservas

- **Se reserva una fecha concreta** de una sesión, elegida entre las ocurrencias de las **próximas 4 semanas** (ventana móvil desde hoy).
- Una sesión de hoy que ya empezó **no se puede reservar**.
- **Se guardan solo referencias:** id de la reserva (UUID con `expo-crypto`), `userId`, `sessionId` y la fecha. Los datos para mostrar (sede, actividad, horario) se obtienen del catálogo.
- **Duplicados:** se impide reservar la misma sesión en la misma fecha. El detalle de la sede muestra qué sesiones ya están reservadas.
- **Superposición de horario** con otra reserva: se **advierte**, pero se permite.
- **Cancelación:** solo de reservas **próximas**, con confirmación. Las reservas pasadas no se pueden cancelar.
- **Inicio:** reservas próximas y, en una sección aparte, las pasadas.
- Las reservas están **asociadas al usuario** (`userId`) y se conservan al cerrar sesión.

## Interfaz

- **React Native Paper** con tema Material Design 3, variantes clara y oscura, y el tema de la navegación adaptado al de Paper (`shared/theme/`, hook `useAppTheme()`). El tema de navegación usa el mismo mapeo de colores que `adaptNavigationTheme` de Paper, pero escrito a mano: los tipos de Paper esperan colores `string` y el `Theme` de Expo Router usa `ColorValue`.
- **Snackbars** para comunicar éxito y errores: `useSnackbar()` → `showSuccess(message)` / `showError(message)` (`shared/components/snackbar-provider.tsx`). Se muestra un mensaje por vez; uno nuevo reemplaza al anterior.
- **Formularios** con React Hook Form y zod. Las reglas coinciden con las del backend (ver la tabla de validación en `backend/CLAUDE.md`).
- **Estados de carga:**
	- **Skeletons** para el contenido que se carga al entrar a una pantalla (listado y detalle de sedes, reservas del Inicio).
	- **Spinners** para las acciones (botones con `loading`) y la hidratación.
- **Estados vacíos** con un mensaje y, cuando corresponda, un acceso a la acción siguiente (por ejemplo, Inicio sin reservas → ir a Sedes).
- La confirmación de reserva que pide el enunciado se muestra en el modal, que pasa a un estado de éxito antes de cerrarse.

## Fechas

- date-fns con el idioma español (`es`).
- Días de la semana en ISO 8601 (1 = lunes, 7 = domingo), igual que el backend: `getISODay` de date-fns.

## Variables de entorno

| Variable | Valores | Uso |
|---|---|---|
| `EXPO_PUBLIC_DATA_SOURCE` | `local` (por defecto) o `api` | Implementación de repositorios |
| `EXPO_PUBLIC_API_URL` | ej.: `http://192.168.0.10:3000/api/v1` (IP local de la computadora) | URL de la API (solo en modo `api`) |

- Las variables `EXPO_PUBLIC_` se incrustan en el código al compilar: **nunca llevan secretos**.
- Para el APK se definen en el perfil de `eas.json`.
- `.env.example` versionado.

## APK

- Generado con EAS Build, con un perfil que produce `.apk` (no `.aab`).
- Tiene que funcionar de forma autónoma: datos locales, sin backend y sin Expo Go.

## Opcional (al final, si da el tiempo)

- Implementación HTTP de los repositorios.
- Bonus del QR.
