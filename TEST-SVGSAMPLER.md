# Test SVGSampler.js — Instrucciones

## ✅ TASK 1.1 Completada

El archivo `src/utils/SVGSampler.js` ha sido creado exitosamente con la siguiente funcionalidad:

### Características implementadas

- ✅ Convierte SVG → Float32Array de posiciones 3D
- ✅ Soporta URLs y data URIs
- ✅ Sub-muestreo (random) cuando hay más pixels que particleCount
- ✅ Sobre-muestreo (con jitter) cuando hay menos pixels que particleCount
- ✅ Normalización al espacio de cámara (fov 60, z=5)
- ✅ Mantiene aspect ratio del SVG original
- ✅ Logging de diagnóstico en consola

---

## Testing Manual

### Opción 1: Test visual standalone (RECOMENDADO)

```bash
cd bexalta/bexalta-wow
npm run dev
```

Luego abre en el browser:
```
http://localhost:5173/test-svgsampler.html
```

**Resultado esperado:**
- Consola verde muestra:
  - ✓ SVG muestreado en ~XX ms
  - ✓ Total de particulas: 5000
  - ✓ Rangos de posiciones X, Y, Z
- Canvas muestra la silueta del logo Bexalta formada por puntos verdes

---

### Opción 2: Test programático en main.js

Si prefieres testear el sampler directamente en el bundle, agrega esto temporalmente al inicio de `src/main.js`:

```javascript
// === TEST SVGSampler ===
import { sampleSVG } from './utils/SVGSampler.js';

async function testSVGSampler() {
    console.group('🧪 Testing SVGSampler');

    const logoPath = '/assets/logo_bexalta_white.svg';
    const positions = await sampleSVG(logoPath, 5000);

    console.log('✓ Positions array:', positions);
    console.log('✓ Length:', positions.length, '(expected: 15000 for 5K particles * 3)');
    console.log('✓ Sample values:', {
        x: positions[0],
        y: positions[1],
        z: positions[2]
    });

    console.groupEnd();
}

// Ejecutar test antes de init()
testSVGSampler().then(() => {
    console.log('Test completado, iniciando bundle normal...');
});
// === FIN TEST ===
```

Luego:
```bash
npm run dev
# Abrir http://localhost:5173
# Ver consola del browser
```

---

## Verificación de Rangos

Los valores de posiciones deben estar dentro de estos rangos para ser visibles en la cámara (fov 60, z=5):

```
X: [-5*aspect, +5*aspect]  (típicamente [-7, +7] para logos landscape)
Y: [-2.5, +2.5]
Z: 0 (SVGs son planos)
```

Si los valores están fuera de rango, las partículas quedarán fuera del frustum de la cámara.

---

## Próximos pasos

Una vez verificado que SVGSampler funciona:

1. ✅ **TASK 1.1** — SVGSampler.js (DONE)
2. ⏭️ **TASK 1.2** — TextSampler.js (SIGUIENTE)
3. ⏭️ **TASK 1.3** — ImageSampler.js
4. ⏭️ **TASK 1.4** — GLTFSampler.js
5. ⏭️ **TASK 1.5** — Documentación completa de S1

---

## Troubleshooting

### "No visible pixels found in SVG"
- Verificar que el SVG tiene contenido con alpha > 128
- Verificar que la ruta del SVG es correcta
- Verificar que el SVG se cargó correctamente (inspeccionar Network tab)

### Canvas muestra puntos dispersos sin forma
- El SVG puede tener muy pocos pixels visibles
- Aumentar el `particleCount` o ajustar el threshold de alpha

### Error CORS al cargar SVG
- Verificar que el dev server está corriendo
- Usar rutas relativas correctas desde la raíz del proyecto

---

## Archivos modificados

```
CREADOS:
  ✅ src/utils/SVGSampler.js          (120 líneas)
  ✅ test-svgsampler.html              (test standalone)
  ✅ TEST-SVGSAMPLER.md                (este archivo)

MODIFICADOS:
  ✅ bexalta/ROADMAP.md                (TASK 1.1 marcada como DONE)
  ✅ bexalta/STATUS.md                 (S1 actualizada: 1/4 completadas)
  ✅ bexalta/ARCHITECTURE.md           (SVGSampler API documentada)
```
