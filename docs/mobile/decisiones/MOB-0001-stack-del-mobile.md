# MOB-0001. Stack del mobile

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

La app se entrega como un APK de Android que tiene que funcionar de forma autónoma. El plazo es corto, así que se busca un stack que no obligue a pelear con versiones nativas ni con configuración de compilación, y que permita formularios, navegación con rutas protegidas y temas claro y oscuro sin construir todo a mano.

## Decisión

- **Expo SDK 58** con **TypeScript estricto**. Se desarrolla con una **development build** (no Expo Go), probada en un celular Android físico.
- **Expo Router** para la navegación: rutas por archivos y rutas protegidas. Los tabs de JavaScript, el `Stack` y los temas de navegación vienen de `expo-router`; no se instala `@react-navigation/*`.
- **React Native Paper** (Material Design 3, variantes clara y oscura) para la interfaz, con `@expo/vector-icons` para los íconos. La tab bar es el `BottomNavigation.Bar` de Paper.
- **Zustand** con el middleware `persist` para el estado global.
- **React Hook Form** con **zod** 4 para los formularios, con las mismas reglas de validación que el backend.
- **date-fns** con el idioma español para las fechas.
- **Criterio general: priorizar el ecosistema de Expo.** Ante dos opciones equivalentes se elige el paquete de Expo (`expo-sqlite`, `expo-secure-store`, `expo-crypto`, `expo-splash-screen`), y las dependencias se instalan con `npx expo install`, que elige versiones compatibles con el SDK.

## Consecuencias

- Cada dependencia con código nativo requiere generar una nueva development build.
- El estilo es Material Design también en iOS.
- El tema de navegación se adapta al de Paper con un mapeo escrito a mano: `adaptNavigationTheme` de Paper espera colores `string` y el `Theme` de Expo Router usa `ColorValue`.
- Por decisión explícita, no hay tests ni lint. El formato básico lo define `.editorconfig`.
