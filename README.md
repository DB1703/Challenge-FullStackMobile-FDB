# Reserva de clases deportivas — Challenge FullStack Mobile

_Descripción breve: pendiente._

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/) | API REST con Node.js + Express |
| [`mobile/`](mobile/) | Aplicación con React Native + Expo + TypeScript |
| [`docs/`](docs/) | Documentación técnica y decisiones de arquitectura |

Ambos proyectos son independientes: cada uno se instala y se ejecuta por separado.

## Requisitos

- Node.js `24.12.0` (definida en `.nvmrc`; con nvm: `nvm install && nvm use`).
- _Resto de requisitos: pendiente._

## Instalación y ejecución

- Backend: ver [`backend/README.md`](backend/README.md).
- Mobile: ver [`mobile/README.md`](mobile/README.md).

## APK

_Pendiente: enlace a la GitHub Release._

## Usuario de prueba

_Pendiente._

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
