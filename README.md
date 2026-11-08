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
- _Resto de requisitos: pendiente._

## Instalación y ejecución

- Backend: ver [`backend/README.md`](backend/README.md).
- Mobile: ver [`mobile-challenge/README.md`](mobile-challenge/README.md).

## APK

_Pendiente: enlace a la GitHub Release._

## Usuario de prueba

| Email | Contraseña |
|---|---|
| `usuario.prueba@example.com` | `Prueba123!` |

En el backend, este usuario lo crea `npm run db:seed`.

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
