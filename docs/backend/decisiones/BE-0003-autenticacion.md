# BE-0003. Autenticación

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

La app necesita login y endpoints de perfil protegidos. El cliente es una app mobile que guarda el token localmente. El alcance no incluye registro ni recuperación de contraseña.

## Decisión

- **JWT** firmado con `jose`, algoritmo **HS256**. Al verificar se fija el algoritmo esperado y se exigen `sub` y `exp`.
- **Payload mínimo:** solo `sub` (id del usuario) y `exp`. El email no va en el token, porque es editable.
- **Vencimiento de 3 horas** (configurable con `JWT_EXPIRES_IN`), **sin refresh tokens**.
- Transporte en el header `Authorization: Bearer <token>`.
- **Contraseñas con `bcryptjs`** (JavaScript puro, sin compilación nativa), con costo 10.

## Consecuencias

- La autenticación no guarda estado en el servidor. El logout lo resuelve el cliente descartando el token.
- No se puede revocar un token antes de que venza. Al vencer, el usuario tiene que volver a loguearse.
- `JWT_SECRET` es obligatorio y debe tener al menos 32 caracteres. El servidor no arranca sin él.
- `bcryptjs` es más lento que `bcrypt` nativo, lo que es aceptable para un solo endpoint de login.
