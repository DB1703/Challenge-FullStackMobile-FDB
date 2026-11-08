# GEN-0001. Estructura del repositorio como monorepo simple

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

El challenge requiere entregar un backend (Node.js + Express) y una aplicación mobile (React Native + Expo) en un mismo repositorio. El enunciado establece que ambos proyectos deben poder ejecutarse de forma independiente y que la APK debe funcionar sin un backend externo.

Se evaluaron dos alternativas:

- **Monorepo simple:** dos carpetas independientes, cada una con su propio `package.json`, sin código compartido.
- **Monorepo con workspaces:** un gestor de workspaces (npm, pnpm o yarn) y un paquete compartido con los tipos de dominio, consumido por ambos proyectos.

## Decisión

Se adopta un **monorepo simple**: `backend/` y `mobile/` son proyectos independientes, cada uno con su propio `package.json`, sus dependencias y su configuración. La raíz no tiene `package.json`; solo contiene configuración transversal (`.editorconfig`, `.gitattributes`, `.nvmrc`, `.gitignore`), la documentación (`docs/`) y los archivos de contexto para Claude Code.

## Consecuencias

- Cada proyecto se instala y se ejecuta por separado, sin configuración de workspaces. Esto cumple directamente con el requisito de independencia.
- El build de la APK con EAS no depende de resolver paquetes compartidos fuera de `mobile/`.
- Los tipos de dominio (sedes, clases, usuarios) se definen por duplicado en ambos proyectos. Un cambio en el modelo de datos debe aplicarse en los dos lados de forma manual.
- Si en el futuro el contrato entre ambos proyectos creciera, migrar a workspaces con un paquete compartido sería un cambio acotado.
