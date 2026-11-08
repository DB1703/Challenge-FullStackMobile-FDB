# BE-0001. Stack del backend

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

La API es chica: login, perfil y un catálogo de sedes de solo lectura. El plazo es corto y se busca que el evaluador pueda levantarla con un `npm install`, sin pasos de compilación y con pocas dependencias.

## Decisión

- **JavaScript con ESM** (`"type": "module"`), sin TypeScript. No hay paso de build.
- **Express 5**, que propaga los errores de los handlers async al manejador central sin `try/catch` ni wrappers.
- **Herramientas nativas de Node** en lugar de dependencias: `--watch` (en lugar de nodemon), `--env-file-if-exists` (en lugar de dotenv) y `node:sqlite` (en lugar de un driver externo).
- Validación de entrada en runtime con `zod` 4.
- La versión de Node pasó de 24.12.0 a **26.13.0** (LTS activa), fijada en `.nvmrc` y en `engines`.

## Consecuencias

- El código se ejecuta tal cual, con cinco dependencias de producción.
- No hay chequeo de tipos estático. La validación de los datos de entrada la cubre zod.
- Requiere Node 26 (`engines: >=26.13.0 <27`), porque `node:sqlite` y los flags usados dependen de versiones recientes.
- Por decisión explícita, no hay lint, formato automático ni tests. El formato básico lo define `.editorconfig`.
