# CLAUDE.md — Raíz del repositorio

## Contexto del proyecto

Challenge técnico de un proceso de selección: aplicación de gestión y reserva de clases deportivas.

- `backend/`: API REST con Node.js + Express.
- `mobile/`: aplicación con React Native + Expo + TypeScript + Zustand.

Ambos proyectos son **independientes**: cada uno tiene su propio `package.json`, se instala y se ejecuta por separado, y no comparten código. No hay `package.json` en la raíz y no debe agregarse.

Cada subproyecto tiene su propio `CLAUDE.md` con sus convenciones específicas.

## Estructura

```
backend/            API REST (Express)
mobile/             App mobile (Expo)
docs/
  general/          Documentación transversal
  backend/          Documentación del backend
  mobile/           Documentación de la app
  */decisiones/     ADRs de cada área
```

## Idioma

- **Código** (identificadores, rutas de la API, comentarios): inglés.
- **Mensajes de commit**: inglés.
- **Documentación** (README, ADRs, documentación técnica, este archivo): español.

### Glosario de dominio

Usar siempre la misma traducción de cada término en todo el código (tipos, variables, rutas de la API, stores, pantallas).

| Español | Inglés |
|---|---|
| usuario | `user` |
| perfil | `profile` |
| credenciales | `credentials` |
| descripción | `description` |
| dirección | `address` |
| sede | `venue` |
| clase deportiva | `activity` |
| instancia reservable de una actividad (ej.: yoga, lunes 18:00) | `session` |
| horarios de funcionamiento de una sede | `openingHours` |
| horarios de una actividad | `schedule` |
| ubicación | `location` |
| día de la semana | `weekday` |
| reserva | `booking` |

No usar `class` para referirse a una clase deportiva: es palabra reservada de JavaScript. El término correcto es `activity`.

## Formato de código

- Indentación con tabs (ancho visual 2). Excepción: archivos YAML, con 2 espacios.
- Finales de línea LF, codificación UTF-8, salto de línea al final de cada archivo.
- Ver `.editorconfig`.
- Versión de Node: `24.12.0` (ver `.nvmrc`).

## Git

- **No ejecutar comandos de git que modifiquen el repositorio** (`add`, `commit`, `push`, `checkout`, `reset`, `stash`, etc.). Todo el manejo de git lo hace el desarrollador.
- Los comandos de solo lectura (`status`, `diff`, `log`) están permitidos para revisar el estado del trabajo.
- **Al terminar una tarea, proponer un mensaje de commit** con este formato:

```
tipo(scope): título en inglés, en minúscula e imperativo
```

**Tipos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

**Scopes:** `backend`, `mobile` o `repo` (cambios en la raíz o en `docs/` general).

Ejemplos:

```
feat(backend): add login endpoint with JWT
fix(mobile): prevent duplicate booking on double tap
docs(repo): add ADR for repository structure
```

## Flujo de trabajo

1. Cada tarea comienza con un **plan**. No escribir ni modificar código hasta que el plan sea aprobado explícitamente.
2. Ejecutar el plan aprobado. Si durante la ejecución surge algo que obliga a desviarse del plan, detenerse y consultar.
3. Al terminar, resumir lo realizado y proponer el mensaje de commit.

## Decisiones de arquitectura (ADRs)

- Se registran en `docs/<area>/decisiones/` con el formato de Michael Nygard: título, estado, fecha, contexto, decisión y consecuencias.
- Prefijo por área con numeración de cuatro dígitos: `GEN-0001`, `BE-0001`, `MOB-0001`.
- Nombre de archivo en español: `GEN-0001-estructura-del-repositorio.md`.
- Estados: Propuesta, Aceptada, Reemplazada.
- Un ADR reemplazado no se edita: se crea uno nuevo y el anterior se marca como "Reemplazada por <ID>".
- Respetar las decisiones registradas. Si una tarea contradice un ADR, o implica una decisión de arquitectura nueva, señalarlo antes de avanzar.
