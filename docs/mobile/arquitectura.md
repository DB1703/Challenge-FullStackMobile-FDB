# Arquitectura del mobile

Resumen de la organización del código, la navegación y el estado de la app. Las decisiones técnicas están en los [ADRs](decisiones/).

## Estructura

El código está organizado por funcionalidad, dentro de `src/`, con el alias de imports `@/`:

```
src/
├── app/                rutas de Expo Router (pantallas livianas: combinan componentes, hooks y stores)
├── features/
│   ├── auth/           store de sesión, repositorio de login, token local, formulario de login
│   ├── profile/        repositorio de perfil, schema de edición, pantalla y formulario
│   ├── venues/         repositorio de sedes, caché del detalle, hooks, listado y detalle
│   └── bookings/       store de reservas, reglas (fechas, superposición), modal e Inicio
├── shared/
│   ├── components/     snackbars, diálogo de confirmación, skeleton, estados vacío y de error, tab bar
│   ├── config/         env.ts (única lectura de process.env) y selección de la implementación
│   ├── errors/         AppError y códigos de error de la API
│   ├── hooks/          useAsync (carga con reintento) y useNow (hora actual)
│   ├── schemas/        campos de zod compartidos (emailSchema)
│   ├── theme/          temas de Paper (claro y oscuro) y de la navegación
│   └── utils/          fechas, validación, latencia simulada, base64url y lectura del JWT
└── data/               JSON locales: usuario de prueba y sedes (mismos datos que el seed del backend)
```

Cada feature accede a sus datos con este flujo: `pantalla → hook o store → repositorio (interfaz) → implementación local`. La implementación la elige `EXPO_PUBLIC_DATA_SOURCE` (ver [MOB-0002](decisiones/MOB-0002-capa-de-datos.md)). Las reservas no tienen repositorio: su store es la fuente (ver [MOB-0004](decisiones/MOB-0004-modelo-de-reservas.md)).

## Navegación

```
src/app/
├── _layout.tsx           Stack raíz: providers, splash y rutas protegidas
├── login.tsx             solo sin sesión
└── (app)/                solo con sesión
    ├── _layout.tsx       Stack: la tab bar + el modal de reserva
    ├── booking.tsx       modal de reserva (fuera de los tabs, para cubrir la tab bar)
    └── (tabs)/
        ├── _layout.tsx   tab bar: Inicio, Sedes, Perfil
        ├── index.tsx     Inicio: saludo y reservas próximas y pasadas
        ├── venues/       stack: listado (index) y detalle ([id])
        └── profile/      stack: perfil (index) y edición (edit)
```

El layout raíz mantiene la splash screen hasta que se hidratan los stores de sesión y de reservas. Después, `Stack.Protected` muestra `(app)` si hay sesión y `login` si no la hay. Al iniciar o cerrar sesión, o cuando el token vence, el guard redirige solo (ver [MOB-0003](decisiones/MOB-0003-estado-y-sesion.md)).

## Estado de implementación

| Funcionalidad | Estado |
|---|---|
| Login con validación, errores en el formulario y manejo del teclado | ✅ |
| Sesión persistida, hidratación con la splash screen, rutas protegidas y expiración del token | ✅ |
| Perfil: consulta, edición (con aviso de cambios sin guardar) y cierre de sesión con confirmación | ✅ |
| Sedes: listado y detalle con horarios, actividades y sesiones | ✅ |
| Reservas: fechas de las próximas 4 semanas, duplicados, aviso de superposición y confirmación | ✅ |
| Inicio: saludo, reservas próximas y pasadas, y cancelación | ✅ |
| Temas claro y oscuro, skeletons, estados vacíos y de error, y snackbars | ✅ |
| APK autónomo con datos locales (perfil `preview` de EAS), publicado en la release [v1.0.0](https://github.com/DB1703/Challenge-FullStackMobile-FDB/releases/tag/v1.0.0) | ✅ |
| Implementación HTTP de los repositorios | ❌ |
| Bonus del QR | ❌ |

## Diseño pendiente

**Implementación HTTP.** Está prevista en la estructura actual:
- Cada feature agregaría `<feature>.repository.http.ts` y lo registraría en `selectImplementation({ local, api })`. Con eso, `EXPO_PUBLIC_DATA_SOURCE=api` dejaría de fallar al arrancar.
- Consumiría `EXPO_PUBLIC_API_URL`. En el celular, tiene que ser la IP de la computadora en la red local, no `localhost`.
- Enviaría el token en `Authorization: Bearer`, desenvolvería `{ data }` y convertiría `{ error }` en `AppError` con el mismo `code`. Las pantallas y el manejo de los errores de sesión no cambiarían.
- Las reservas seguirían siendo locales, porque el backend no las tiene.

## Supuestos y limitaciones

- La contraseña del usuario de prueba está en texto plano en `src/data/users.json`. Es un mock con datos de prueba; el backend usa bcrypt.
- El token local tiene forma de JWT, pero su firma es ficticia: no ofrece seguridad real, solo reproduce el comportamiento de la API (vencimiento y errores).
- No hay implementación HTTP: con `EXPO_PUBLIC_DATA_SOURCE=api`, la app no arranca.
- Hay un solo usuario de prueba, así que `EMAIL_ALREADY_IN_USE` no se puede provocar con los datos locales.
- Las reservas son solo locales: no se sincronizan y se pierden al desinstalar la app.
- Los íconos y la splash screen son los del template de Expo.
- No hay tests ni lint. La app se probó en un celular Android físico, no en iOS.
