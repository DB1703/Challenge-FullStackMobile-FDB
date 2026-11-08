# Mobile — App de reservas

App de Android del challenge, hecha con Expo (SDK 58), React Native y TypeScript. Funciona con datos locales, sin backend.

## Requisitos

- Node.js `26.13.0` (ver `.nvmrc` en la raíz; con nvm: `nvm install && nvm use`).
- Un celular Android con la **development build** de la app instalada. Expo Go no sirve: la app usa módulos nativos (`expo-sqlite`, `expo-secure-store`, `expo-crypto`). Se genera con EAS:

	```bash
	npx eas-cli@latest build --profile development --platform android
	```

	O localmente, con el Android SDK instalado: `npx expo run:android`.
- El celular y la computadora en la misma red, para que la development build se conecte a Metro.

## Puesta en marcha

Desde la carpeta `mobile-challenge/`:

1. Instalar las dependencias:

	```bash
	npm install
	```

2. Crear el `.env` a partir del ejemplo:

	```bash
	cp .env.example .env
	```

	| Variable | Valor por defecto | Uso |
	|---|---|---|
	| `EXPO_PUBLIC_DATA_SOURCE` | `local` | Origen de los datos. `api` todavía no está implementado: la app no arranca con ese valor |
	| `EXPO_PUBLIC_API_URL` | — | URL de la API, solo para el modo `api` |
	| `EXPO_PUBLIC_LOCAL_TOKEN_TTL_SECONDS` | `10800` (3 h) | Opcional: duración del token local. Un valor corto (por ejemplo, `60`) permite probar la expiración de la sesión |

	Las variables `EXPO_PUBLIC_` se incrustan en el código al compilar: no llevan secretos. Después de cambiarlas, reiniciar Metro.

3. Levantar Metro y abrir la app en el celular:

	```bash
	npx expo start --dev-client
	```

## APK

El APK de la entrega está publicado en la release [v1.0.0](https://github.com/DB1703/Challenge-FullStackMobile-FDB/releases/tag/v1.0.0) ([descarga directa](https://github.com/DB1703/Challenge-FullStackMobile-FDB/releases/download/v1.0.0/Clases.FDB.v1.0.0.apk)).

Se genera con EAS Build, con el perfil `preview` de [`eas.json`](eas.json). Ese perfil produce un `.apk` (no `.aab`) con `EXPO_PUBLIC_DATA_SOURCE=local` y el JavaScript incluido: no necesita Metro, backend ni conexión.

```bash
npx eas-cli@latest build --platform android --profile preview
```

Al terminar, EAS da el enlace para descargarlo.

## Documentación

- Arquitectura, estado de implementación y limitaciones: [`docs/mobile/arquitectura.md`](../docs/mobile/arquitectura.md).
- Decisiones: [`docs/mobile/decisiones/`](../docs/mobile/decisiones/).

## Usuario de prueba

| Email | Contraseña |
|---|---|
| `usuario.prueba@example.com` | `Prueba123!` |
