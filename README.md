# Reserva de clases deportivas — Challenge FullStack Mobile

Aplicación para consultar sedes deportivas, sus clases y horarios, con login y gestión del perfil del usuario. Incluye una API REST (Node.js + Express + SQLite) y una app mobile (React Native + Expo).

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/) | API REST con Node.js + Express |
| [`mobile-challenge/`](mobile-challenge/) | Aplicación con React Native + Expo + TypeScript |
| [`docs/`](docs/) | Documentación técnica y decisiones de arquitectura |

Ambos proyectos son independientes: cada uno se instala y se ejecuta por separado.

## Requisitos

- Node.js `26.13.0` (definida en `.nvmrc`; con nvm: `nvm install && nvm use`).
- Backend: no necesita nada más.
- Mobile: para desarrollar, un celular Android con la development build de la app instalada (no Expo Go). Para probarla, alcanza con el APK.

## Instalación y ejecución

- Backend: ver [`backend/README.md`](backend/README.md).
- Mobile: ver [`mobile-challenge/README.md`](mobile-challenge/README.md). Funciona con datos locales, sin el backend.

## APK

Descarga: [**Clases.FDB.v1.0.0.apk**](https://github.com/DB1703/Challenge-FullStackMobile-FDB/releases/download/v1.0.0/Clases.FDB.v1.0.0.apk), en la release [v1.0.0](https://github.com/DB1703/Challenge-FullStackMobile-FDB/releases/tag/v1.0.0).

Se instala directamente en el celular y funciona sin conexión, con datos locales: no necesita el backend ni Expo Go. Para instalarlo hay que permitir la instalación de apps de origen desconocido.

Cómo se genera: ver [`mobile-challenge/README.md`](mobile-challenge/README.md#apk).

## Usuario de prueba

| Email | Contraseña |
|---|---|
| `usuario.prueba@example.com` | `Prueba123!` |

En el backend, este usuario lo crea `npm run db:seed`. En la app, está en `mobile-challenge/src/data/users.json`.

## Documentación

- [General](docs/general/)
- [Backend](docs/backend/)
- [Mobile](docs/mobile/)

## Convenciones

### Idioma

- Código y mensajes de commit: inglés.
- Documentación: español.

### Commits

Formato basado en [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): título
```

- **Tipos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- **Scopes:** `backend`, `mobile`, `repo`.

### Formato de código

Indentación con tabs, finales de línea LF y UTF-8, definidos en `.editorconfig` y `.gitattributes`.
