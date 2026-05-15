# CHISPAS - OANSA

App web que registra el avance de cada niño segun su lider, ademas tambien registra los pedidos de los lideres. Cada lider y ayudante puede llevar el control de progreso de sus niños en los 3 manuales (Saltador, Caminante, Escalador) y gestionar pedidos de la tienda, todo centralizado en una sola plataforma.

## Funcionalidades

- Registro de niños con datos basicos (nombre, fecha de nacimiento, direccion, telefono, iglesia, etc.)
- 3 manuales de progreso: Saltador, Caminante, Escalador
- Cada manual incluye: rango, joyas rojas, joyas verdes, premios
- Asistencia al club y a la iglesia por mes (febrero a noviembre)
- Celda de Premio Chispita para manual Escalador
- Vista de impresion con los 3 niveles completos para guardar como PDF (boton GUARDAR)
- Panel de administracion con pestanas: Pedidos, Lideres, Productos, Registros
- Gestion de lideres y ayudantes (filtro lider-ayudante para compartir niños)
- Tienda de productos con toggle disponible/oculto
- Auto-sync cada 5 segundos en la vista de registrar

## Tecnologias

- React Native con Expo
- Firebase Firestore (base de datos)
- Firebase Hosting (despliegue web)
- JavaScript (JSX)

## Plataformas

El mismo codigo funciona en Web, Android y iOS. Actualmente desplegado solo en Web.

## Despliegue web

```bash
# Exportar para web
npx expo export --platform web --output-dir dist

# (opcional) Corregir nombre a CHISPAS en dist/index.html y dist/manifest.json

# Desplegar a Firebase
npx firebase deploy --only hosting
```

## Estructura de datos en Firestore

### Coleccion `ninos` (niños)
Cada documento representa un niño con campos:
- `nombreNino`, `padre`, `direccion`, `telefono`, `fechaNacimiento`, `iglesia`, `traidoPor`, `trajoA`, `numeroMembresia`
- `lider` (codigo del lider que lo registro)
- `saltador_json`, `caminante_json`, `escalador_json` (progreso en cada manual)
- `asistencia_json` (asistencia a club e iglesia)

### Coleccion `lideres`
Cada documento representa un lider/ayudante con campos:
- `codigo`, `nombre`, `admin` (booleano), `liderAsignado` (si es ayudante)

### Coleccion `pedidos`
Pedidos de productos de la tienda.

### Coleccion `configuracion`
- `productos/` - productos de la tienda
- `periodos` - periodos del programa
- `manuales` - URLs de manuales PDF
- `qr` - URL del codigo QR de ingreso
